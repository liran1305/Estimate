const mysql = require('mysql2/promise');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function recalculateScores() {
  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    const profileId = 'liran-naim';
    console.log(`Recalculating scores for ${profileId}...\n`);

    // Get all reviews
    const [reviews] = await connection.query(`
      SELECT behavioral_answers, high_signal_answers FROM anonymous_reviews 
      WHERE reviewee_id = ?
      UNION ALL
      SELECT behavioral_answers, high_signal_answers FROM reviews 
      WHERE reviewee_id = ?
    `, [profileId, profileId]);

    console.log(`Found ${reviews.length} reviews`);

    // Aggregate behavioral scores
    const dimensionTotals = {};
    const dimensionCounts = {};
    let startupHireCount = 0;
    let harderJobCount = 0;
    let workAgainAbsolutelyCount = 0;

    for (const review of reviews) {
      if (review.behavioral_answers) {
        const behavioral = typeof review.behavioral_answers === 'string' 
          ? JSON.parse(review.behavioral_answers) 
          : review.behavioral_answers;
        
        ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'].forEach(dim => {
          if (behavioral[dim] !== undefined && behavioral[dim] !== null) {
            dimensionTotals[dim] = (dimensionTotals[dim] || 0) + behavioral[dim];
            dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
          }
        });
      }

      if (review.high_signal_answers) {
        const highSignal = typeof review.high_signal_answers === 'string'
          ? JSON.parse(review.high_signal_answers)
          : review.high_signal_answers;
        
        if (highSignal.startup_hire >= 2) startupHireCount++;
        if (highSignal.harder_job >= 4) harderJobCount++;
        if (highSignal.work_again === 5) workAgainAbsolutelyCount++;
      }
    }

    // Map levels to percentiles (0-3 scale)
    const levelToPercentile = {
      0: 80,  // developing - Top 80%
      1: 60,  // moderate - Top 60%
      2: 30,  // strong - Top 30%
      3: 10   // very_high - Top 10%
    };

    console.log('\n=== Dimension Scores ===');
    
    // Update dimension_scores table
    for (const dim of ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it']) {
      if (dimensionCounts[dim]) {
        const avgScore = dimensionTotals[dim] / dimensionCounts[dim];
        const level = Math.round(avgScore);
        const percentile = levelToPercentile[level] || 50;
        
        await connection.query(`
          INSERT INTO dimension_scores (id, linkedin_profile_id, dimension, level, percentile, review_count, raw_score)
          VALUES (UUID(), ?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            level = VALUES(level),
            percentile = VALUES(percentile),
            review_count = VALUES(review_count),
            raw_score = VALUES(raw_score)
        `, [profileId, dim, level, percentile, dimensionCounts[dim], avgScore]);
        
        console.log(`${dim.padEnd(15)} Level: ${level}, Percentile: Top ${percentile}%, Count: ${dimensionCounts[dim]}`);
      }
    }

    // Update high-signal percentages
    const totalReviews = reviews.length;
    const workAgainPct = totalReviews > 0 ? Math.round((workAgainAbsolutelyCount / totalReviews) * 100) : 0;
    const startupHirePct = totalReviews > 0 ? Math.round((startupHireCount / totalReviews) * 100) : 0;
    const harderJobPct = totalReviews > 0 ? Math.round((harderJobCount / totalReviews) * 100) : 0;

    await connection.query(`
      UPDATE user_scores 
      SET 
        work_again_absolutely_pct = ?,
        startup_hire_pct = ?,
        harder_job_pct = ?,
        reviews_received = ?
      WHERE linkedin_profile_id = ?
    `, [workAgainPct, startupHirePct, harderJobPct, totalReviews, profileId]);

    console.log('\n=== High-Signal Metrics ===');
    console.log(`Work again absolutely: ${workAgainPct}%`);
    console.log(`Startup hire: ${startupHirePct}%`);
    console.log(`Harder job: ${harderJobPct}%`);
    console.log(`\n✅ Scores recalculated! Refresh your profile page.`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

recalculateScores();
