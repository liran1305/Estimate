const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

// Database connection pool
const pool = mysql.createPool({
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

// ============================================================================
// GET /api/email-preferences/unsubscribe/:token
// Unsubscribe page - shows user their preferences
// ============================================================================
router.get('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT id, name, email, email_notifications, email_new_reviews, email_score_unlocked, email_marketing FROM users WHERE unsubscribe_token = ?',
        [token]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Invalid unsubscribe link' 
        });
      }

      const user = users[0];

      // Return user preferences (default to true if null/undefined)
      res.json({
        success: true,
        user: {
          name: user.name,
          email: user.email,
          preferences: {
            email_notifications: user.email_notifications !== null ? Boolean(user.email_notifications) : true,
            email_new_reviews: user.email_new_reviews !== null ? Boolean(user.email_new_reviews) : true,
            email_score_unlocked: user.email_score_unlocked !== null ? Boolean(user.email_score_unlocked) : true,
            email_marketing: user.email_marketing !== null ? Boolean(user.email_marketing) : false
          }
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Unsubscribe page error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// POST /api/email-preferences/unsubscribe/:token
// Update user email preferences
// ============================================================================
router.post('/unsubscribe/:token', async (req, res) => {
  const { token } = req.params;
  const { 
    email_notifications, 
    email_new_reviews, 
    email_score_unlocked, 
    email_marketing,
    unsubscribe_all 
  } = req.body;

  try {
    const connection = await pool.getConnection();

    try {
      // Verify token exists
      const [users] = await connection.query(
        'SELECT id, email FROM users WHERE unsubscribe_token = ?',
        [token]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Invalid unsubscribe link' 
        });
      }

      const user = users[0];

      // If unsubscribe_all is true, turn off all email notifications
      if (unsubscribe_all) {
        console.log(`[UNSUBSCRIBE] Attempting to unsubscribe user ${user.id} (${user.email}) from all emails`);
        
        const [result] = await connection.query(`
          UPDATE users 
          SET email_notifications = 0,
              email_new_reviews = 0,
              email_score_unlocked = 0,
              email_marketing = 0,
              unsubscribed_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [user.id]);

        console.log(`[UNSUBSCRIBE] Update result:`, result);
        console.log(`[UNSUBSCRIBE] User ${user.id} (${user.email}) unsubscribed from all emails - Rows affected: ${result.affectedRows}`);

        return res.json({
          success: true,
          message: 'You have been unsubscribed from all emails'
        });
      }

      // Otherwise, update individual preferences
      await connection.query(`
        UPDATE users 
        SET email_notifications = ?,
            email_new_reviews = ?,
            email_score_unlocked = ?,
            email_marketing = ?
        WHERE id = ?
      `, [
        email_notifications !== undefined ? email_notifications : true,
        email_new_reviews !== undefined ? email_new_reviews : true,
        email_score_unlocked !== undefined ? email_score_unlocked : true,
        email_marketing !== undefined ? email_marketing : false,
        user.id
      ]);

      console.log(`[EMAIL PREFERENCES] User ${user.id} (${user.email}) updated preferences`);

      res.json({
        success: true,
        message: 'Email preferences updated successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Update preferences error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET /api/email-preferences/resubscribe/:token
// Resubscribe to all emails
// ============================================================================
router.get('/resubscribe/:token', async (req, res) => {
  const { token } = req.params;

  try {
    const connection = await pool.getConnection();

    try {
      const [users] = await connection.query(
        'SELECT id, email FROM users WHERE unsubscribe_token = ?',
        [token]
      );

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Invalid resubscribe link' 
        });
      }

      const user = users[0];

      await connection.query(`
        UPDATE users 
        SET email_notifications = TRUE,
            email_new_reviews = TRUE,
            email_score_unlocked = TRUE,
            unsubscribed_at = NULL
        WHERE id = ?
      `, [user.id]);

      console.log(`[RESUBSCRIBE] User ${user.id} (${user.email}) resubscribed to emails`);

      res.json({
        success: true,
        message: 'You have been resubscribed to email notifications'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Resubscribe error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
