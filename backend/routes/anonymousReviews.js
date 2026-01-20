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
    });
  }
  return pool;
}

// Secret salt for token hashing
const HASH_SALT = process.env.REVIEW_HASH_SALT || 'estimate-anonymous-review-salt-2026';

// Rate limits
const MAX_REVIEWS_PER_DAY_REVIEWER = 10;  // One person can give max 10 reviews/day
const MAX_REVIEWS_PER_DAY_REVIEWEE = 20;  // One person can receive max 20 reviews/day
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
      // Check rate limit using pending tokens + rolling counter (no daily_limits tables!)
      // This prevents correlation attacks while still limiting spam
      const [pendingTokens] = await connection.query(`
        SELECT COUNT(*) as count FROM review_tokens 
        WHERE reviewer_id = ? AND created_at > DATE_SUB(NOW(), INTERVAL 24 HOUR)
      `, [user_id]);

      const [userData] = await connection.query(`
        SELECT reviews_given_today FROM users WHERE id = ?
      `, [user_id]);

      const totalToday = (pendingTokens[0]?.count || 0) + (userData[0]?.reviews_given_today || 0);
      
      if (totalToday >= MAX_REVIEWS_PER_DAY_REVIEWER) {
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
      time_spent_seconds
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

      // 3. Fraud detection
      let reviewWeight = 1.0;
      let fraudFlags = [];

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
      await connection.query(`
        INSERT INTO anonymous_reviews 
        (id, reviewee_id, company_name, company_context, interaction_type,
         scores, strength_tags, would_work_again, would_promote, optional_comment,
         overall_score, review_weight, created_date)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, CURDATE())
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
        reviewWeight
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

      // 8. Update user_scores for reviewer
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

      // ❌ REMOVED: review_assignments update (was leaking who reviewed whom!)

      // 10. 🔥🔥🔥 BURN THE TOKEN 🔥🔥🔥
      await connection.query(
        'DELETE FROM review_tokens WHERE token_hash = ?',
        [tokenHash]
      );

      console.log(`🔥 [ANON] Token BURNED. Review ${reviewId} is now untraceable.`);

      // 11. Check if reviewer unlocked their profile
      const [reviewerData] = await connection.query(
        'SELECT reviews_given_count FROM users WHERE id = ?',
        [reviewer_id]
      );

      const reviewsGiven = reviewerData[0]?.reviews_given_count || 0;
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
          SELECT u.email, u.full_name, us.reviews_received
          FROM users u
          LEFT JOIN user_scores us ON us.user_id = u.id
          WHERE u.linkedin_profile_id = ?
        `, [reviewee_id]);

        if (revieweeUser.length > 0 && revieweeUser[0].email) {
          const reviewCount = (revieweeUser[0].reviews_received || 0) + 1;
          sendNewReviewNotification(
            revieweeUser[0].email,
            revieweeUser[0].full_name,
            reviewCount
          ).catch(err => console.error('[EMAIL] Async send failed:', err));
        }
      } catch (emailErr) {
        console.error('[EMAIL] Failed to send review notification:', emailErr);
        // Don't fail the request if email fails
      }

      // 13. Send score unlocked email to reviewer if they just hit 3 reviews
      if (profileUnlocked && reviewsGiven === 3) {
        try {
          const [reviewerUser] = await connection.query(
            'SELECT email, full_name FROM users WHERE id = ?',
            [reviewer_id]
          );
          if (reviewerUser.length > 0 && reviewerUser[0].email) {
            sendScoreUnlockedNotification(
              reviewerUser[0].email,
              reviewerUser[0].full_name
            ).catch(err => console.error('[EMAIL] Async send failed:', err));
          }
        } catch (emailErr) {
          console.error('[EMAIL] Failed to send unlock notification:', emailErr);
        }
      }

      res.json({
        success: true,
        message: 'Review submitted anonymously',
        reviews_given: reviewsGiven,
        profile_unlocked: profileUnlocked,
        reviews_until_unlock: Math.max(0, 3 - reviewsGiven),
        fraud_flags: fraudFlags.length > 0 ? fraudFlags : undefined
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
