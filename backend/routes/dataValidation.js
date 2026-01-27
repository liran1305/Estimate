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
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// GET /api/data-validation/check - Check data consistency
router.get('/check', async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    // Check for reviews_received count mismatches
    const [countMismatches] = await connection.query(`
      SELECT 
        u.name,
        u.email,
        us.reviews_received as counted,
        (
          (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = lp.id) +
          (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id = lp.id)
        ) as actual
      FROM users u
      JOIN user_scores us ON us.user_id = u.id
      JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
      WHERE us.reviews_received != (
        (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = lp.id) +
        (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id = lp.id)
      )
    `);

    // Check for NULL scores with reviews
    const [nullScores] = await connection.query(`
      SELECT 
        u.name,
        u.email,
        us.reviews_received,
        us.overall_score
      FROM users u
      JOIN user_scores us ON us.user_id = u.id
      WHERE us.reviews_received > 0 
        AND us.overall_score IS NULL
    `);

    // Check for scores without reviews
    const [scoresWithoutReviews] = await connection.query(`
      SELECT 
        u.name,
        u.email,
        us.reviews_received,
        us.overall_score
      FROM users u
      JOIN user_scores us ON us.user_id = u.id
      WHERE us.reviews_received = 0 
        AND us.overall_score IS NOT NULL
    `);

    const isConsistent = 
      countMismatches.length === 0 && 
      nullScores.length === 0 && 
      scoresWithoutReviews.length === 0;

    res.json({
      success: true,
      isConsistent,
      issues: {
        countMismatches: countMismatches.length,
        nullScores: nullScores.length,
        scoresWithoutReviews: scoresWithoutReviews.length
      },
      details: {
        countMismatches,
        nullScores,
        scoresWithoutReviews
      },
      message: isConsistent 
        ? '✅ Data is consistent' 
        : '❌ Data inconsistency detected - manual sync required'
    });
  } catch (error) {
    console.error('Data validation error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

// POST /api/data-validation/sync - Auto-sync review counts (admin only)
router.post('/sync', async (req, res) => {
  const pool = getPool();
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    // Update reviews_received counts
    await connection.query(`
      UPDATE user_scores us
      JOIN users u ON us.user_id = u.id
      JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
      SET us.reviews_received = (
        (SELECT COUNT(*) FROM reviews r WHERE r.reviewee_id = lp.id) +
        (SELECT COUNT(*) FROM anonymous_reviews ar WHERE ar.reviewee_id = lp.id)
      )
    `);

    // Recalculate overall_score for users with reviews
    await connection.query(`
      UPDATE user_scores us
      JOIN users u ON us.user_id = u.id
      JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
      SET us.overall_score = (
        SELECT AVG(combined_scores.score)
        FROM (
          SELECT overall_score as score 
          FROM reviews 
          WHERE reviewee_id = lp.id
          UNION ALL
          SELECT overall_score as score 
          FROM anonymous_reviews 
          WHERE reviewee_id = lp.id
        ) as combined_scores
      )
      WHERE us.reviews_received > 0
    `);

    // Set NULL scores for users with 0 reviews
    await connection.query(`
      UPDATE user_scores us
      SET us.overall_score = NULL
      WHERE us.reviews_received = 0
    `);

    await connection.commit();

    res.json({
      success: true,
      message: 'Data synced successfully'
    });
  } catch (error) {
    await connection.rollback();
    console.error('Data sync error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    connection.release();
  }
});

module.exports = router;
