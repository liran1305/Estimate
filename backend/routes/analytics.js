const express = require('express');
const router = express.Router();
const { getPool } = require('../config/database');

// GET /api/analytics/funnel - Review completion funnel
router.get('/funnel', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    const [results] = await connection.query(`
      SELECT 'Total Users' as stage, COUNT(DISTINCT id) as user_count, 100.0 as percentage
      FROM users WHERE created_at >= ?
      UNION ALL
      SELECT 'Started Review Session', COUNT(DISTINCT user_id),
        ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= ?), 2)
      FROM review_sessions WHERE started_at >= ?
      UNION ALL
      SELECT 'Gave 1+ Reviews', COUNT(DISTINCT reviewer_id),
        ROUND(COUNT(DISTINCT reviewer_id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= ?), 2)
      FROM reviews WHERE created_at >= ?
      UNION ALL
      SELECT 'Gave 2+ Reviews', COUNT(DISTINCT reviewer_id),
        ROUND(COUNT(DISTINCT reviewer_id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= ?), 2)
      FROM (SELECT reviewer_id FROM reviews WHERE created_at >= ? GROUP BY reviewer_id HAVING COUNT(*) >= 2) as t
      UNION ALL
      SELECT 'Completed 3 Reviews', COUNT(DISTINCT reviewer_id),
        ROUND(COUNT(DISTINCT reviewer_id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= ?), 2)
      FROM (SELECT reviewer_id FROM reviews WHERE created_at >= ? GROUP BY reviewer_id HAVING COUNT(*) >= 3) as t
      UNION ALL
      SELECT 'Enabled Recruiter Consent', COUNT(DISTINCT user_id),
        ROUND(COUNT(DISTINCT user_id) * 100.0 / (SELECT COUNT(DISTINCT id) FROM users WHERE created_at >= ?), 2)
      FROM user_scores WHERE recruiter_consent = 1 AND updated_at >= ?
    `, [startDate, startDate, startDate, startDate, startDate, startDate, startDate, startDate, startDate, startDate, startDate]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Funnel analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/distribution - Review distribution by user
router.get('/distribution', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    const [results] = await connection.query(`
      SELECT 
        CASE 
          WHEN review_count = 0 THEN '0 reviews'
          WHEN review_count = 1 THEN '1 review'
          WHEN review_count = 2 THEN '2 reviews'
          WHEN review_count >= 3 THEN '3+ reviews (completed)'
        END as review_tier,
        COUNT(*) as user_count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage
      FROM (
        SELECT u.id, COALESCE(COUNT(r.id), 0) as review_count
        FROM users u
        LEFT JOIN reviews r ON r.reviewer_id = u.id
        WHERE u.created_at >= ?
        GROUP BY u.id
      ) as user_reviews
      GROUP BY review_tier
      ORDER BY 
        CASE review_tier
          WHEN '0 reviews' THEN 1
          WHEN '1 review' THEN 2
          WHEN '2 reviews' THEN 3
          WHEN '3+ reviews (completed)' THEN 4
        END
    `, [startDate]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Distribution analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/recruiter-consent - Recruiter consent adoption over time
router.get('/recruiter-consent', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    const [results] = await connection.query(`
      SELECT 
        DATE(us.updated_at) as date,
        COUNT(DISTINCT CASE WHEN us.recruiter_consent = 1 THEN us.user_id END) as enabled_count,
        COUNT(DISTINCT us.user_id) as total_eligible_users,
        ROUND(COUNT(DISTINCT CASE WHEN us.recruiter_consent = 1 THEN us.user_id END) * 100.0 / 
              COUNT(DISTINCT us.user_id), 2) as adoption_rate
      FROM user_scores us
      WHERE us.reviews_given >= 3
        AND us.updated_at >= ?
      GROUP BY DATE(us.updated_at)
      ORDER BY date DESC
      LIMIT 30
    `, [startDate]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Recruiter consent analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/sessions - Session completion rates
router.get('/sessions', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    const [results] = await connection.query(`
      SELECT 
        status,
        COUNT(*) as session_count,
        ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER(), 2) as percentage,
        ROUND(AVG(reviews_completed), 2) as avg_reviews_per_session,
        ROUND(AVG(skips_used), 2) as avg_skips_used
      FROM review_sessions
      WHERE started_at >= ?
      GROUP BY status
      ORDER BY session_count DESC
    `, [startDate]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Session analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/daily-activity - Daily active users and review activity
router.get('/daily-activity', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { days = 30 } = req.query;

    const [results] = await connection.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(DISTINCT reviewer_id) as active_reviewers,
        COUNT(*) as total_reviews,
        ROUND(AVG(overall_score), 2) as avg_score_given
      FROM reviews
      WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL ? DAY)
      GROUP BY DATE(created_at)
      ORDER BY date DESC
    `, [parseInt(days)]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Daily activity analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/summary - Overall summary dashboard
router.get('/summary', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    // Get all metrics in parallel
    const [totalUsers] = await connection.query(
      'SELECT COUNT(*) as count FROM users WHERE created_at >= ?',
      [startDate]
    );

    const [reviewsGiven] = await connection.query(
      'SELECT COUNT(*) as count FROM reviews WHERE created_at >= ?',
      [startDate]
    );

    const [usersWhoReviewed] = await connection.query(
      'SELECT COUNT(DISTINCT reviewer_id) as count FROM reviews WHERE created_at >= ?',
      [startDate]
    );

    const [usersCompleted3] = await connection.query(
      'SELECT COUNT(DISTINCT reviewer_id) as count FROM (SELECT reviewer_id FROM reviews WHERE created_at >= ? GROUP BY reviewer_id HAVING COUNT(*) >= 3) as t',
      [startDate]
    );

    const [recruiterConsent] = await connection.query(
      'SELECT COUNT(*) as count FROM user_scores WHERE recruiter_consent = 1 AND updated_at >= ?',
      [startDate]
    );

    const [avgScore] = await connection.query(
      'SELECT ROUND(AVG(overall_score), 2) as avg FROM reviews WHERE created_at >= ?',
      [startDate]
    );

    res.json({
      success: true,
      data: {
        total_users: totalUsers[0].count,
        total_reviews: reviewsGiven[0].count,
        users_who_reviewed: usersWhoReviewed[0].count,
        users_completed_3_reviews: usersCompleted3[0].count,
        recruiter_consent_enabled: recruiterConsent[0].count,
        avg_review_score: avgScore[0].avg,
        conversion_rates: {
          started_reviewing: ((usersWhoReviewed[0].count / totalUsers[0].count) * 100).toFixed(2) + '%',
          completed_3_reviews: ((usersCompleted3[0].count / totalUsers[0].count) * 100).toFixed(2) + '%',
          enabled_recruiter_consent: ((recruiterConsent[0].count / usersCompleted3[0].count) * 100).toFixed(2) + '%'
        }
      }
    });
  } catch (error) {
    console.error('Summary analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// GET /api/analytics/users - Detailed user review activity table
router.get('/users', async (req, res) => {
  const pool = await getPool();
  const connection = await pool.getConnection();

  try {
    const { startDate = '2026-01-01' } = req.query;

    const [results] = await connection.query(`
      SELECT 
        u.id as user_id,
        u.name,
        u.email,
        COALESCE(us.reviews_given, 0) as reviews_given,
        COALESCE(us.reviews_received, 0) as reviews_received,
        us.score_unlocked,
        us.overall_score,
        us.recruiter_consent,
        u.created_at as joined_date,
        (SELECT MAX(r.created_at) FROM reviews r WHERE r.reviewer_id = u.id) as last_review_date
      FROM users u
      LEFT JOIN user_scores us ON us.user_id = u.id
      WHERE u.created_at >= ?
      ORDER BY us.reviews_given DESC, us.reviews_received DESC, u.created_at DESC
    `, [startDate]);

    res.json({ success: true, data: results });
  } catch (error) {
    console.error('Users analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
