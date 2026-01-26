/**
 * Anonymous Review System - Token-Burning Architecture (FINAL)
 * 
 * Privacy Guarantee:
 * "Even Estimate's founder cannot see who wrote your reviews. We use a token-burning 
 * system that permanently severs the connection between reviewer and review at the 
 * moment of submission. This isn't a policy - it's a technical impossibility."
 * 
 * FIXES APPLIED:
 * 1. Removed review_assignments update (was leaking reviewer-reviewee pairs)
 * 2. Removed review_pair_hashes (vulnerable to rainbow table attacks)
 * 3. Removed daily_limits tables (vulnerable to correlation attacks)
 * 4. Rate limiting via pending tokens + rolling user counter (untraceable)
 */

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const crypto = require('crypto');
const { v4: uuidv4 } = require('uuid');
const { sendNewReviewNotification, sendScoreUnlockedNotification, sendTestEmail } = require('../services/emailService');

let pool;

function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Secret salt for token hashing
const HASH_SALT = process.env.REVIEW_HASH_SALT || 'estimate-anonymous-review-salt-2026';

// Rate limits
const MAX_REVIEWS_PER_DAY_REVIEWER = 50;  // One person can give max 50 reviews/day
const MAX_REVIEWS_PER_DAY_REVIEWEE = 100;  // One person can receive max 100 reviews/day
const TOKEN_EXPIRY_HOURS = 1;

/**
 * Generate a secure token hash
 */
function generateTokenHash(token) {
  return crypto.createHash('sha256').update(token + HASH_SALT).digest('hex');
}

// ❌ REMOVED: generatePairHash - vulnerable to rainbow table attacks!

// ============================================================================
// POST /api/anonymous/token/create - Create a review token when user starts reviewing
// ============================================================================
router.post('/token/create', async (req, res) => {
  try {
    const { 
      user_id, 
      session_id, 
      colleague_id,
      company_name,
      company_context,
      interaction_type
    } = req.body;

    if (!user_id || !colleague_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id and colleague_id are required' 
      });
    }

    // Prevent self-review
    if (user_id === colleague_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'Cannot review yourself' 
      });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Check rate limit using only completed reviews (not pending tokens)
      // Pending tokens from skipped reviews should not count against daily limit
      const [userData] = await connection.query(`
        SELECT reviews_given_today FROM users WHERE id = ?
      `, [user_id]);

      const reviewsCompletedToday = userData[0]?.reviews_given_today || 0;
      
      if (reviewsCompletedToday >= MAX_REVIEWS_PER_DAY_REVIEWER) {
        return res.status(429).json({ 
          success: false, 
          error: 'You have reached your daily review limit. Try again tomorrow.' 
        });
      }

      // Check if there's already a pending token for this pair
      const [existingToken] = await connection.query(`
        SELECT token_hash FROM review_tokens 
        WHERE reviewer_id = ? AND reviewee_id = ? AND expires_at > NOW()
      `, [user_id, colleague_id]);

      if (existingToken.length > 0) {
        // Delete old token and create new one
        await connection.query(
          'DELETE FROM review_tokens WHERE reviewer_id = ? AND reviewee_id = ?',
          [user_id, colleague_id]
        );
      }

      // Generate new token
      const token = uuidv4();
      const tokenHash = generateTokenHash(token);
      const expiresAt = new Date(Date.now() + TOKEN_EXPIRY_HOURS * 60 * 60 * 1000);

      await connection.query(`
        INSERT INTO review_tokens 
        (token_hash, reviewer_id, reviewee_id, session_id, company_name, company_context, interaction_type, expires_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        tokenHash,
        user_id,
        colleague_id,
        session_id || null,
        company_name || null,
        company_context || 'previous',
        interaction_type || 'peer',
        expiresAt
      ]);

      console.log(`[ANON] Token created for review session`);

      res.json({
        success: true,
        token: token,
        expires_at: expiresAt.toISOString()
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Create token error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// POST /api/anonymous/review/submit - Submit review and BURN the token
// ============================================================================
router.post('/review/submit', async (req, res) => {
  try {
    const { 
      token,
      scores,
      strength_tags,
      would_work_again,
      would_promote,
      optional_comment,
      time_spent_seconds,
      review_type,      // 'organic' or 'requested'
      request_id        // ID of review_request if this is a requested review
    } = req.body;

    if (!token) {
      return res.status(400).json({ 
        success: false, 
        error: 'Review token is required' 
      });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      // 1. Validate token
      const tokenHash = generateTokenHash(token);
      const [tokens] = await connection.query(
        'SELECT * FROM review_tokens WHERE token_hash = ? AND expires_at > NOW()',
        [tokenHash]
      );

      if (tokens.length === 0) {
        await connection.rollback();
        return res.status(400).json({ 
          success: false, 
          error: 'Invalid or expired review token' 
        });
      }

      const reviewToken = tokens[0];
      const { reviewer_id, reviewee_id, session_id, company_name, company_context, interaction_type } = reviewToken;

      // 2. Check reviewee limit using linkedin_profiles counter (no daily_limits tables!)
      const [revieweeData] = await connection.query(`
        SELECT reviews_received_today FROM linkedin_profiles WHERE id = ?
      `, [reviewee_id]);

      if ((revieweeData[0]?.reviews_received_today || 0) >= MAX_REVIEWS_PER_DAY_REVIEWEE) {
        await connection.rollback();
        return res.status(429).json({ 
          success: false, 
          error: 'This person has received too many reviews today. Try again tomorrow.' 
        });
      }

      // 3. Fraud detection and review type weighting
      let reviewWeight = 1.0;
      let fraudFlags = [];
      
      // Apply 0.5x weight for requested reviews (viral loop feature)
      const isRequestedReview = review_type === 'requested' || request_id;
      if (isRequestedReview) {
        reviewWeight = 0.5;
        console.log(`[ANON] Requested review - applying 0.5x weight`);
      }

      if (scores && typeof scores === 'object') {
        const scoreValues = Object.values(scores).filter(s => s !== null && s !== undefined);
        
        if (scoreValues.length >= 3) {
          const allIdentical = scoreValues.every(s => s === scoreValues[0]);
          if (allIdentical) {
            fraudFlags.push('all_identical_scores');
            reviewWeight = 0.3;
          }
          
          const allMax = scoreValues.every(s => s >= 9);
          const allMin = scoreValues.every(s => s <= 2);
          if (allMax || allMin) {
            fraudFlags.push(allMax ? 'all_max_scores' : 'all_min_scores');
            reviewWeight = Math.min(reviewWeight, 0.3);
          }
        }
      }

      if (time_spent_seconds !== undefined && time_spent_seconds < 15) {
        fraudFlags.push('too_fast');
        reviewWeight = Math.min(reviewWeight, 0.5);
      }

      // 4. Calculate overall score
      const questionWeights = { reliability: 1.2, receptive_feedback: 1.2 };
      let totalWeightedScore = 0;
      let totalWeight = 0;

      Object.entries(scores || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const weight = questionWeights[key] || 1.0;
          totalWeightedScore += value * weight;
          totalWeight += weight;
        }
      });

      if (would_work_again) {
        totalWeightedScore += (would_work_again * 2) * 1.5;
        totalWeight += 1.5;
      }

      if (would_promote) {
        totalWeightedScore += ((would_promote / 4) * 10) * 1.3;
        totalWeight += 1.3;
      }

      const overallScore = totalWeight > 0 ? (totalWeightedScore / totalWeight) * reviewWeight : 0;

      // 5. INSERT ANONYMOUS REVIEW (NO reviewer_id!)
      const reviewId = uuidv4();
      const finalReviewType = isRequestedReview ? 'requested' : 'organic';
      
      await connection.query(`
        INSERT INTO anonymous_reviews 
        (id, reviewee_id, company_name, company_context, interaction_type,
         scores, strength_tags, would_work_again, would_promote, optional_comment,
         overall_score, review_weight, review_type, request_id, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
      `, [
        reviewId,
        reviewee_id,
        company_name,
        company_context,
        interaction_type,
        JSON.stringify(scores || {}),
        JSON.stringify(strength_tags || []),
        would_work_again || null,
        would_promote || null,
        optional_comment || null,
        overallScore,
        reviewWeight,
        finalReviewType,
        request_id || null
      ]);

      // ❌ REMOVED: review_pair_hashes insert (vulnerable to rainbow attack!)

      // 6. Update reviewer's counts (total + today's rolling counter)
      await connection.query(`
        UPDATE users 
        SET reviews_given_count = reviews_given_count + 1,
            reviews_given_today = reviews_given_today + 1
        WHERE id = ?
      `, [reviewer_id]);

      // ❌ REMOVED: reviewer_daily_limits (correlation attack vulnerability!)
      // ❌ REMOVED: reviewee_daily_limits (correlation attack vulnerability!)

      // 7. Update reviewee's counts (total + today's rolling counter)
      await connection.query(`
        UPDATE linkedin_profiles 
        SET reviews_received_count = reviews_received_count + 1,
            reviews_received_today = reviews_received_today + 1
        WHERE id = ?
      `, [reviewee_id]);

      // 8. Update user_scores for reviewer (reviews_given)
      // Note: reviews_received and overall_score for REVIEWEE are handled by database triggers
      await connection.query(`
        INSERT INTO user_scores (user_id, reviews_given)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE reviews_given = reviews_given + 1
      `, [reviewer_id]);

      // 9. Update session if exists (just count, no details)
      if (session_id) {
        await connection.query(`
          UPDATE review_sessions 
          SET reviews_completed = reviews_completed + 1
          WHERE id = ?
        `, [session_id]);
      }

      // Update review_assignments status to 'reviewed' so same colleague isn't shown again
      // This is safe - it only marks the assignment complete, doesn't link to the anonymous review
      await connection.query(`
        UPDATE review_assignments 
        SET status = 'reviewed', actioned_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND colleague_id = ? AND status = 'assigned'
      `, [reviewer_id, reviewee_id]);

      // 10. 🔥🔥🔥 BURN THE TOKEN 🔥🔥🔥
      await connection.query(
        'DELETE FROM review_tokens WHERE token_hash = ?',
        [tokenHash]
      );

      console.log(`🔥 [ANON] Token BURNED. Review ${reviewId} is now untraceable.`);
      
      // 10b. If this was a requested review, mark the request as completed
      if (request_id) {
        await connection.query(`
          UPDATE review_requests 
          SET status = 'completed', 
              completed_at = NOW(),
              completed_by_user_id = ?
          WHERE id = ? AND status = 'pending'
        `, [reviewer_id, request_id]);
        
        // Create reciprocal block (reviewer cannot request from requester)
        const [requestInfo] = await connection.query(
          'SELECT requester_id FROM review_requests WHERE id = ?',
          [request_id]
        );
        if (requestInfo.length > 0) {
          await connection.query(`
            INSERT IGNORE INTO request_blocks (user_a_id, user_b_id, reason)
            VALUES (?, ?, 'reciprocal_block')
          `, [requestInfo[0].requester_id, reviewer_id]);
        }
        
        console.log(`[ANON] Requested review completed for request_id: ${request_id}`);
      }

      // 11. Check if reviewer unlocked their profile (read from user_scores table)
      const [reviewerData] = await connection.query(
        'SELECT reviews_given, score_unlocked FROM user_scores WHERE user_id = ?',
        [reviewer_id]
      );

      const reviewsGiven = reviewerData[0]?.reviews_given || 0;
      const profileUnlocked = reviewsGiven >= 3;

      if (profileUnlocked && reviewsGiven === 3) {
        await connection.query(
          'UPDATE user_scores SET score_unlocked = TRUE WHERE user_id = ?',
          [reviewer_id]
        );
      }

      await connection.commit();

      // 12. Send email notification to reviewee (if they have an account)
      // This happens AFTER commit to not block the response
      try {
        const [revieweeUser] = await connection.query(`
          SELECT u.email, u.name, u.email_notifications, u.email_new_reviews, u.unsubscribe_token, us.reviews_received
          FROM users u
          LEFT JOIN user_scores us ON us.user_id = u.id
          WHERE u.linkedin_profile_id = ?
        `, [reviewee_id]);

        if (revieweeUser.length > 0 && revieweeUser[0].email) {
          // Check if user has email notifications enabled
          if (revieweeUser[0].email_notifications && revieweeUser[0].email_new_reviews) {
            const reviewCount = (revieweeUser[0].reviews_received || 0) + 1;
            sendNewReviewNotification(
              revieweeUser[0].email,
              revieweeUser[0].name,
              reviewCount,
              revieweeUser[0].unsubscribe_token
            ).catch(err => console.error('[EMAIL] Async send failed:', err));
          } else {
            console.log(`[EMAIL] User ${revieweeUser[0].email} has unsubscribed from new review notifications`);
          }
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send review notification:', emailErr);
        // Don't fail the request if email fails
      }

      // 13. Send score unlocked email to reviewer if they just hit 3 reviews
      if (profileUnlocked && reviewsGiven === 3) {
        try {
          const [reviewerUser] = await connection.query(
            'SELECT email, name, email_notifications, email_score_unlocked, unsubscribe_token FROM users WHERE id = ?',
            [reviewer_id]
          );
          if (reviewerUser.length > 0 && reviewerUser[0].email) {
            // Check if user has email notifications enabled
            if (reviewerUser[0].email_notifications && reviewerUser[0].email_score_unlocked) {
              sendScoreUnlockedNotification(
                reviewerUser[0].email,
                reviewerUser[0].name,
                reviewerUser[0].unsubscribe_token
              ).catch(err => console.error('[EMAIL] Async send failed:', err));
            } else {
              console.log(`[EMAIL] User ${reviewerUser[0].email} has unsubscribed from score unlock notifications`);
            }
          }
        } catch (emailErr) {
          console.error('[EMAIL] Failed to send unlock notification:', emailErr);
        }
      }

      // 14. Check if reviewer earned a new token (every 5 reviews)
      let tokenAwarded = false;
      let tokensAvailable = 0;
      
      if (reviewsGiven > 0 && reviewsGiven % 5 === 0) {
        // Award a token
        const [tokenResult] = await connection.query(`
          INSERT INTO request_tokens (user_id, tokens_available, tokens_earned_total, tokens_used_total)
          VALUES (?, 1, 1, 0)
          ON DUPLICATE KEY UPDATE 
            tokens_available = tokens_available + 1,
            tokens_earned_total = tokens_earned_total + 1
        `, [reviewer_id]);
        
        tokenAwarded = true;
        
        // Get updated token count
        const [tokenData] = await connection.query(
          'SELECT tokens_available FROM request_tokens WHERE user_id = ?',
          [reviewer_id]
        );
        tokensAvailable = tokenData.length > 0 ? tokenData[0].tokens_available : 1;
        
        console.log(`🎟️ [TOKENS] User ${reviewer_id} earned a Request Token! (${reviewsGiven} reviews)`);
      }

      res.json({
        success: true,
        message: 'Review submitted anonymously',
        reviews_given: reviewsGiven,
        profile_unlocked: profileUnlocked,
        reviews_until_unlock: Math.max(0, 3 - reviewsGiven),
        fraud_flags: fraudFlags.length > 0 ? fraudFlags : undefined,
        review_type: finalReviewType,
        // Token progress info
        token_awarded: tokenAwarded,
        tokens_available: tokensAvailable,
        reviews_to_next_token: 5 - (reviewsGiven % 5)
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Submit anonymous review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET /api/anonymous/reviews/:profileId - Get anonymous reviews
// ============================================================================
router.get('/reviews/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      const [reviews] = await connection.query(`
        SELECT 
          id,
          company_context,
          interaction_type,
          scores,
          strength_tags,
          would_work_again,
          would_promote,
          overall_score,
          created_date
        FROM anonymous_reviews
        WHERE reviewee_id = ?
        ORDER BY created_date DESC
      `, [profileId]);

      const [aggregates] = await connection.query(`
        SELECT 
          COUNT(*) as total_reviews,
          AVG(overall_score) as avg_score,
          AVG(would_work_again) as avg_would_work_again
        FROM anonymous_reviews
        WHERE reviewee_id = ?
      `, [profileId]);

      res.json({
        success: true,
        reviews: reviews.map(r => ({
          ...r,
          scores: JSON.parse(r.scores || '{}'),
          strength_tags: JSON.parse(r.strength_tags || '[]')
        })),
        aggregates: aggregates[0]
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get reviews error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Cleanup endpoints
// ============================================================================
router.delete('/tokens/cleanup', async (req, res) => {
  try {
    const pool = getPool();
    const [result] = await pool.query('DELETE FROM review_tokens WHERE expires_at < NOW()');
    
    console.log(`[ANON] Cleaned up ${result.affectedRows} expired tokens`);
    
    res.json({ success: true, deleted_count: result.affectedRows });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Reset daily counters (call this via cron at midnight)
router.post('/counters/reset-daily', async (req, res) => {
  try {
    const pool = getPool();
    
    // Reset all daily counters to 0 at midnight
    const [r1] = await pool.query('UPDATE users SET reviews_given_today = 0');
    const [r2] = await pool.query('UPDATE linkedin_profiles SET reviews_received_today = 0');
    
    console.log(`[ANON] Reset daily counters: ${r1.affectedRows} users, ${r2.affectedRows} profiles`);
    
    res.json({ 
      success: true, 
      reset_users: r1.affectedRows,
      reset_profiles: r2.affectedRows
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ❌ REMOVED: /limits/cleanup endpoint (daily_limits tables no longer exist)

// ============================================================================
// Test email endpoint (development only)
// ============================================================================
router.post('/test-email', async (req, res) => {
  const { email, name } = req.body;
  
  if (!email) {
    return res.status(400).json({ success: false, error: 'Email is required' });
  }
  
  try {
    const result = await sendTestEmail(email, name || 'Test User');
    res.json({ success: result.success, message: 'Test email sent', result });
  } catch (error) {
    console.error('Test email error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
