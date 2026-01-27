const express = require('express');
const router = express.Router();
const crypto = require('crypto');

let pool;

async function getPool() {
  if (!pool) {
    const mysql = require('mysql2/promise');
    pool = mysql.createPool({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// ============================================================================
// CONSTANTS
// ============================================================================
const REVIEWS_PER_TOKEN = 5;           // Earn 1 token every 5 reviews
const REQUEST_LINK_EXPIRY_DAYS = 14;   // Links expire after 14 days
const MAX_PENDING_REQUESTS = 3;        // Max pending requests at a time
const REQUESTED_REVIEW_WEIGHT = 0.5;   // Requested reviews count as 0.5x

// ============================================================================
// 1. GET /api/tokens/balance - Get user's token balance and progress
// ============================================================================
router.get('/balance', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get or create token record
      let [tokenRecord] = await connection.query(
        'SELECT * FROM request_tokens WHERE user_id = ?',
        [user_id]
      );

      if (tokenRecord.length === 0) {
        // Create initial record
        await connection.query(
          'INSERT INTO request_tokens (user_id, tokens_available, tokens_earned_total, tokens_used_total) VALUES (?, 0, 0, 0)',
          [user_id]
        );
        tokenRecord = [{ tokens_available: 0, tokens_earned_total: 0, tokens_used_total: 0 }];
      }

      // Get user's review count
      const [userScores] = await connection.query(
        'SELECT reviews_given FROM user_scores WHERE user_id = ?',
        [user_id]
      );

      const reviewsGiven = userScores.length > 0 ? userScores[0].reviews_given : 0;
      const tokensEarned = Math.floor(reviewsGiven / REVIEWS_PER_TOKEN);
      const reviewsToNextToken = REVIEWS_PER_TOKEN - (reviewsGiven % REVIEWS_PER_TOKEN);
      const progressToNextToken = (reviewsGiven % REVIEWS_PER_TOKEN) / REVIEWS_PER_TOKEN;

      // Get pending requests count
      const [pendingRequests] = await connection.query(
        `SELECT COUNT(*) as count FROM review_requests 
         WHERE requester_id = ? AND status = 'pending' AND expires_at > NOW()`,
        [user_id]
      );

      res.json({
        success: true,
        tokens: {
          available: tokenRecord[0].tokens_available,
          earned_total: tokenRecord[0].tokens_earned_total,
          used_total: tokenRecord[0].tokens_used_total
        },
        progress: {
          reviews_given: reviewsGiven,
          reviews_to_next_token: reviewsToNextToken,
          progress_percentage: Math.round(progressToNextToken * 100),
          next_token_at: (tokensEarned + 1) * REVIEWS_PER_TOKEN
        },
        pending_requests: {
          count: pendingRequests[0].count,
          max_allowed: MAX_PENDING_REQUESTS,
          can_create_new: pendingRequests[0].count < MAX_PENDING_REQUESTS
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error getting token balance:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 2. POST /api/tokens/check-and-award - Check if user earned new tokens
// Called after each review submission
// ============================================================================
router.post('/check-and-award', async (req, res) => {
  try {
    const { user_id } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get user's current review count
      const [userScores] = await connection.query(
        'SELECT reviews_given FROM user_scores WHERE user_id = ?',
        [user_id]
      );

      if (userScores.length === 0) {
        return res.json({ success: true, tokens_awarded: 0, message: 'No user_scores record found' });
      }

      const reviewsGiven = userScores[0].reviews_given;
      const tokensDeserved = Math.floor(reviewsGiven / REVIEWS_PER_TOKEN);

      // Get or create token record
      let [tokenRecord] = await connection.query(
        'SELECT * FROM request_tokens WHERE user_id = ?',
        [user_id]
      );

      if (tokenRecord.length === 0) {
        // Create initial record with deserved tokens
        await connection.query(
          'INSERT INTO request_tokens (user_id, tokens_available, tokens_earned_total, tokens_used_total) VALUES (?, ?, ?, 0)',
          [user_id, tokensDeserved, tokensDeserved]
        );
        
        return res.json({
          success: true,
          tokens_awarded: tokensDeserved,
          total_available: tokensDeserved,
          message: tokensDeserved > 0 ? `🎉 You earned ${tokensDeserved} Request Token(s)!` : null
        });
      }

      const currentEarned = tokenRecord[0].tokens_earned_total;
      const newTokens = tokensDeserved - currentEarned;

      if (newTokens > 0) {
        // Award new tokens
        await connection.query(
          `UPDATE request_tokens 
           SET tokens_available = tokens_available + ?, 
               tokens_earned_total = ?
           WHERE user_id = ?`,
          [newTokens, tokensDeserved, user_id]
        );

        return res.json({
          success: true,
          tokens_awarded: newTokens,
          total_available: tokenRecord[0].tokens_available + newTokens,
          message: `🎉 You earned ${newTokens} Request Token${newTokens > 1 ? 's' : ''}!`
        });
      }

      res.json({
        success: true,
        tokens_awarded: 0,
        total_available: tokenRecord[0].tokens_available,
        message: null
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error checking/awarding tokens:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 3. POST /api/tokens/create-request - Create a review request link
// ============================================================================
router.post('/create-request', async (req, res) => {
  try {
    const { user_id, recipient_email, recipient_name, company_context } = req.body;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Check token balance
      const [tokenRecord] = await connection.query(
        'SELECT tokens_available FROM request_tokens WHERE user_id = ?',
        [user_id]
      );

      if (tokenRecord.length === 0 || tokenRecord[0].tokens_available < 1) {
        return res.status(400).json({ 
          success: false, 
          error: 'No tokens available. Complete more reviews to earn tokens!' 
        });
      }

      // Check pending requests limit
      const [pendingCount] = await connection.query(
        `SELECT COUNT(*) as count FROM review_requests 
         WHERE requester_id = ? AND status = 'pending' AND expires_at > NOW()`,
        [user_id]
      );

      if (pendingCount[0].count >= MAX_PENDING_REQUESTS) {
        return res.status(400).json({ 
          success: false, 
          error: `Maximum ${MAX_PENDING_REQUESTS} pending requests allowed. Wait for existing requests to be completed or expire.` 
        });
      }

      // Generate unique link
      const uniqueLink = crypto.randomBytes(16).toString('hex');
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + REQUEST_LINK_EXPIRY_DAYS);

      // Create request record
      await connection.query(
        `INSERT INTO review_requests 
         (requester_id, unique_link, recipient_email, recipient_name, company_context, expires_at)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [user_id, uniqueLink, recipient_email || null, recipient_name || null, company_context || null, expiresAt]
      );

      // Deduct token
      await connection.query(
        `UPDATE request_tokens 
         SET tokens_available = tokens_available - 1,
             tokens_used_total = tokens_used_total + 1
         WHERE user_id = ?`,
        [user_id]
      );

      // Get requester info for the invite message
      const [requesterInfo] = await connection.query(
        `SELECT u.name, lp.current_company_name 
         FROM users u 
         LEFT JOIN linkedin_profiles lp ON lp.id = u.linkedin_profile_id
         WHERE u.id = ?`,
        [user_id]
      );

      const requesterName = requesterInfo.length > 0 ? requesterInfo[0].name : 'A colleague';
      const frontendUrl = process.env.FRONTEND_URL || 'https://estimatenow.io';
      const requestUrl = `${frontendUrl}/review-request/${uniqueLink}`;

      res.json({
        success: true,
        request: {
          unique_link: uniqueLink,
          full_url: requestUrl,
          expires_at: expiresAt,
          expires_in_days: REQUEST_LINK_EXPIRY_DAYS
        },
        invite_messages: {
          whatsapp_he: `היי, אני משתמש ב-Estimate - פלטפורמה שמאפשרת לקבל פידבק אנונימי על הסופט סקילס שלך מעמיתים.\nאשמח אם תוכל/י לכתוב עליי ביקורת קצרה (2 דק׳) 🙏\n${requestUrl}`,
          whatsapp_en: `Hey! I'm using Estimate to get anonymous feedback on my soft skills from colleagues.\nWould really appreciate a quick 2-min review from you 🙏\n${requestUrl}`,
          email_subject: 'Quick favor? 2 minutes',
          email_body: `Hey${recipient_name ? ' ' + recipient_name : ''},\n\nI'm trying out Estimate - it's a platform where colleagues give each other anonymous feedback on soft skills.\n\nI'd love to get your honest perspective. Takes 2 minutes:\n${requestUrl}\n\nThanks! 🙏\n${requesterName}\n\nP.S. You'll also get to see what others think about YOU after you join.`
        },
        tokens_remaining: tokenRecord[0].tokens_available - 1
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error creating request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 4. GET /api/tokens/request/:link - Get request details by link
// ============================================================================
router.get('/request/:link', async (req, res) => {
  try {
    const { link } = req.params;

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [request] = await connection.query(
        `SELECT rr.*, u.name as requester_name, u.avatar as requester_avatar,
                lp.current_company_name as requester_company
         FROM review_requests rr
         JOIN users u ON BINARY u.id = BINARY rr.requester_id
         LEFT JOIN linkedin_profiles lp ON BINARY lp.id = BINARY u.linkedin_profile_id
         WHERE rr.unique_link = ?`,
        [link]
      );

      if (request.length === 0) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      const req_data = request[0];

      // Check if expired
      if (new Date(req_data.expires_at) < new Date()) {
        return res.json({
          success: true,
          request: {
            ...req_data,
            status: 'expired',
            is_valid: false,
            message: 'This request link has expired.'
          }
        });
      }

      // Check if already completed
      if (req_data.status === 'completed') {
        return res.json({
          success: true,
          request: {
            ...req_data,
            is_valid: false,
            message: 'This review has already been completed.'
          }
        });
      }

      res.json({
        success: true,
        request: {
          id: req_data.id,
          requester_name: req_data.requester_name,
          requester_avatar: req_data.requester_avatar,
          requester_company: req_data.requester_company,
          company_context: req_data.company_context,
          status: req_data.status,
          expires_at: req_data.expires_at,
          is_valid: true
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error getting request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 4b. GET /api/tokens/request/:link/colleague - Get requester as colleague to review
// Returns the person who sent the review request as a colleague object
// ============================================================================
router.get('/request/:link/colleague', async (req, res) => {
  try {
    const { link } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get the review request details
      const [request] = await connection.query(
        `SELECT rr.*, u.linkedin_profile_id as requester_linkedin_id
         FROM review_requests rr
         JOIN users u ON BINARY u.id = BINARY rr.requester_id
         WHERE rr.unique_link = ? AND rr.status = 'pending'`,
        [link]
      );

      if (request.length === 0) {
        return res.status(404).json({ success: false, error: 'Request not found or already completed' });
      }

      const req_data = request[0];

      // Check if expired
      if (new Date(req_data.expires_at) < new Date()) {
        return res.status(400).json({ success: false, error: 'Request has expired' });
      }

      // Get the requester's LinkedIn profile as a colleague
      const [colleague] = await connection.query(
        `SELECT 
          lp.id,
          lp.name,
          lp.avatar,
          lp.current_company_name,
          lp.position
         FROM linkedin_profiles lp
         WHERE lp.id = ?`,
        [req_data.requester_linkedin_id]
      );

      if (colleague.length === 0) {
        return res.status(404).json({ success: false, error: 'Requester profile not found' });
      }

      // Return the requester as a colleague object with request context
      res.json({
        success: true,
        colleague: {
          id: colleague[0].id,
          name: colleague[0].name,
          avatar: colleague[0].avatar,
          company_name: req_data.company_context || colleague[0].current_company_name,
          company_context: req_data.company_context || 'current',
          position: colleague[0].position,
          is_from_request: true,
          request_id: req_data.id
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error getting request colleague:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 5. GET /api/tokens/my-requests - Get user's pending/completed requests
// ============================================================================
router.get('/my-requests', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Update expired requests
      await connection.query(
        `UPDATE review_requests 
         SET status = 'expired' 
         WHERE requester_id = ? AND status = 'pending' AND expires_at < NOW()`,
        [user_id]
      );

      // Get all requests
      const [requests] = await connection.query(
        `SELECT rr.id, rr.unique_link, rr.recipient_name, rr.recipient_email,
                rr.status, rr.created_at, rr.expires_at, rr.completed_at,
                u.name as completed_by_name
         FROM review_requests rr
         LEFT JOIN users u ON u.id = rr.completed_by_user_id
         WHERE rr.requester_id = ?
         ORDER BY rr.created_at DESC
         LIMIT 20`,
        [user_id]
      );

      // Calculate days remaining for pending requests
      const requestsWithDays = requests.map(r => ({
        ...r,
        days_remaining: r.status === 'pending' 
          ? Math.max(0, Math.ceil((new Date(r.expires_at) - new Date()) / (1000 * 60 * 60 * 24)))
          : null
      }));

      res.json({
        success: true,
        requests: requestsWithDays,
        summary: {
          pending: requests.filter(r => r.status === 'pending').length,
          completed: requests.filter(r => r.status === 'completed').length,
          expired: requests.filter(r => r.status === 'expired').length
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error getting requests:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 6. POST /api/tokens/complete-request - Mark a request as completed
// Called when invited user submits the requested review
// ============================================================================
router.post('/complete-request', async (req, res) => {
  try {
    const { request_id, completed_by_user_id } = req.body;

    if (!request_id || !completed_by_user_id) {
      return res.status(400).json({ success: false, error: 'request_id and completed_by_user_id are required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Update request status
      const [result] = await connection.query(
        `UPDATE review_requests 
         SET status = 'completed', 
             completed_at = NOW(),
             completed_by_user_id = ?
         WHERE id = ? AND status = 'pending'`,
        [completed_by_user_id, request_id]
      );

      if (result.affectedRows === 0) {
        return res.status(400).json({ success: false, error: 'Request not found or already completed' });
      }

      // Get request details for anti-gaming block
      const [request] = await connection.query(
        'SELECT requester_id FROM review_requests WHERE id = ?',
        [request_id]
      );

      // Create reciprocal block (completed_by cannot request from requester)
      await connection.query(
        `INSERT IGNORE INTO request_blocks (user_a_id, user_b_id, reason)
         VALUES (?, ?, 'reciprocal_block')`,
        [request[0].requester_id, completed_by_user_id]
      );

      res.json({
        success: true,
        message: 'Request marked as completed'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error completing request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 7. POST /api/tokens/check-can-request - Check if user can request from target
// Anti-gaming validation
// ============================================================================
router.post('/check-can-request', async (req, res) => {
  try {
    const { requester_id, target_user_id } = req.body;

    if (!requester_id || !target_user_id) {
      return res.status(400).json({ success: false, error: 'requester_id and target_user_id are required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Check if blocked (target already requested from requester)
      const [block] = await connection.query(
        `SELECT * FROM request_blocks 
         WHERE user_a_id = ? AND user_b_id = ?`,
        [target_user_id, requester_id]
      );

      if (block.length > 0) {
        return res.json({
          success: true,
          can_request: false,
          reason: 'This person has already requested a review from you. Reciprocal requests are not allowed.'
        });
      }

      // Check if already reviewed
      const [existingReview] = await connection.query(
        `SELECT id FROM anonymous_reviews 
         WHERE reviewee_id = (SELECT linkedin_profile_id FROM users WHERE id = ?)
         AND request_id IN (SELECT id FROM review_requests WHERE requester_id = ?)`,
        [requester_id, requester_id]
      );

      if (existingReview.length > 0) {
        return res.json({
          success: true,
          can_request: false,
          reason: 'This person has already reviewed you via a previous request.'
        });
      }

      res.json({
        success: true,
        can_request: true
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error checking request eligibility:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 8. POST /api/tokens/cancel-request - Cancel a pending request (refund token)
// ============================================================================
router.post('/cancel-request', async (req, res) => {
  try {
    const { user_id, request_id } = req.body;

    if (!user_id || !request_id) {
      return res.status(400).json({ success: false, error: 'user_id and request_id are required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Verify ownership and status
      const [request] = await connection.query(
        `SELECT * FROM review_requests 
         WHERE id = ? AND requester_id = ? AND status = 'pending'`,
        [request_id, user_id]
      );

      if (request.length === 0) {
        return res.status(400).json({ success: false, error: 'Request not found or cannot be cancelled' });
      }

      // Cancel request
      await connection.query(
        `UPDATE review_requests SET status = 'cancelled' WHERE id = ?`,
        [request_id]
      );

      // Refund token
      await connection.query(
        `UPDATE request_tokens 
         SET tokens_available = tokens_available + 1,
             tokens_used_total = tokens_used_total - 1
         WHERE user_id = ?`,
        [user_id]
      );

      res.json({
        success: true,
        message: 'Request cancelled and token refunded'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Error cancelling request:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
