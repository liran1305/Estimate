const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

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
      queueLimit: 0,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Check if user is currently locked out
router.get('/check-lockout/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const connection = await getPool().getConnection();

    try {
      const [users] = await connection.query(
        'SELECT violation_count, last_violation_at, locked_until FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return res.json({ 
          success: true, 
          isLockedOut: false,
          violationCount: 0
        });
      }

      const user = users[0];
      const now = new Date();

      // Check if explicitly locked
      if (user.locked_until && new Date(user.locked_until) > now) {
        const remainingMs = new Date(user.locked_until) - now;
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        
        return res.json({
          success: true,
          isLockedOut: true,
          lockedUntil: user.locked_until,
          remainingHours,
          violationCount: user.violation_count || 0,
          message: `You've been temporarily locked out due to multiple violations. Please try again in ${remainingHours} hours.`
        });
      }

      // Reset violation count if last violation was more than 24 hours ago
      if (user.last_violation_at) {
        const hoursSinceLastViolation = (now - new Date(user.last_violation_at)) / (60 * 60 * 1000);
        if (hoursSinceLastViolation > 24) {
          await connection.query(
            'UPDATE users SET violation_count = 0, last_violation_at = NULL, locked_until = NULL WHERE id = ?',
            [userId]
          );
          return res.json({
            success: true,
            isLockedOut: false,
            violationCount: 0
          });
        }
      }

      res.json({
        success: true,
        isLockedOut: false,
        violationCount: user.violation_count || 0
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Check lockout error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Record a violation
router.post('/record-violation', async (req, res) => {
  try {
    const { userId, violationType, reviewSessionId, timeSpentSeconds } = req.body;

    if (!userId || !violationType) {
      return res.status(400).json({ 
        success: false, 
        error: 'userId and violationType are required' 
      });
    }

    const connection = await getPool().getConnection();

    try {
      await connection.beginTransaction();

      // Insert violation record
      await connection.query(
        'INSERT INTO user_violations (user_id, violation_type, review_session_id, time_spent_seconds) VALUES (?, ?, ?, ?)',
        [userId, violationType, reviewSessionId, timeSpentSeconds]
      );

      // Get current violation count
      const [users] = await connection.query(
        'SELECT violation_count, last_violation_at FROM users WHERE id = ?',
        [userId]
      );

      let currentCount = 0;
      if (users.length > 0) {
        const user = users[0];
        const now = new Date();
        
        // Reset count if last violation was more than 24 hours ago
        if (user.last_violation_at) {
          const hoursSinceLastViolation = (now - new Date(user.last_violation_at)) / (60 * 60 * 1000);
          if (hoursSinceLastViolation > 24) {
            currentCount = 0;
          } else {
            currentCount = user.violation_count || 0;
          }
        }
      }

      const newCount = currentCount + 1;
      const now = new Date();

      // Update user violation count
      let lockedUntil = null;
      if (newCount >= 3) {
        lockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 hours from now
      }

      await connection.query(
        'UPDATE users SET violation_count = ?, last_violation_at = ?, locked_until = ? WHERE id = ?',
        [newCount, now, lockedUntil, userId]
      );

      await connection.commit();

      res.json({
        success: true,
        violationCount: newCount,
        isLockedOut: newCount >= 3,
        lockedUntil,
        message: newCount >= 3 
          ? 'You have been locked out for 24 hours due to multiple violations.'
          : `Warning ${newCount} of 3. One more violation will result in a 24-hour lockout.`
      });

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Record violation error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// Admin: Clear user violations (for testing or manual override)
router.post('/admin/clear-violations', async (req, res) => {
  try {
    const { userId, adminKey } = req.body;

    // Simple admin key check (you should use proper admin auth)
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ success: false, error: 'Unauthorized' });
    }

    const connection = await getPool().getConnection();

    try {
      await connection.query(
        'UPDATE users SET violation_count = 0, last_violation_at = NULL, locked_until = NULL WHERE id = ?',
        [userId]
      );

      await connection.query(
        'DELETE FROM user_violations WHERE user_id = ?',
        [userId]
      );

      res.json({ success: true, message: 'Violations cleared for user' });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Clear violations error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
