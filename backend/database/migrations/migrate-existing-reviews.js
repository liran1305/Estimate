/**
 * Migration Script: Convert existing reviews to V2 scoring system
 * 
 * This script:
 * 1. Marks all existing reviews as version 1 (old slider system)
 * 2. Calculates dimension scores from old slider data where possible
 * 3. Updates user_scores with qualitative badges
 * 
 * Run with: node backend/database/migrations/migrate-existing-reviews.js
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

// Dimension mapping from old scores
const OLD_TO_NEW_MAPPING = {
  // Old slider → New dimension (with conversion factor from 10-scale to 3-scale)
  problem_solving: { dimension: 'figures_out', factor: 0.3 },
  reliability: { dimension: 'owns_it', factor: 0.3 },
  takes_ownership: { dimension: 'owns_it', factor: 0.3 },
  communication: { dimension: 'gets_buyin', factor: 0.3 },
  teamwork: { dimension: 'gets_buyin', factor: 0.3 },
  initiative: { dimension: 'learns_fast', factor: 0.3 },
  strategic_thinking: { dimension: 'learns_fast', factor: 0.3 }
};

// Tag mapping
const TAG_MAPPING = {
  quick_learner: 'learns_crazy_fast',
  problem_solver: 'brings_solutions',
  fast_executor: 'gets_things_done',
  adaptable: 'thrives_in_chaos',
  owns_mistakes: 'owns_mistakes',
  brings_solutions: 'brings_solutions',
  gets_things_done: 'gets_things_done'
};

// Level thresholds
function calculateLevel(rawScore) {
  if (rawScore >= 2.5) return 'very_high';
  if (rawScore >= 1.75) return 'strong';
  if (rawScore >= 1.0) return 'moderate';
  return 'developing';
}

function estimatePercentile(level) {
  const ranges = {
    very_high: 15,
    strong: 25,
    moderate: 45,
    developing: 70
  };
  return ranges[level] || 50;
}

async function migrate() {
  console.log('🚀 Starting V2 scoring migration...\n');
  
  const pool = mysql.createPool({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    port: process.env.CLOUD_SQL_PORT || 3306,
    ssl: { rejectUnauthorized: false }
  });

  const connection = await pool.getConnection();

  try {
    // Step 1: Mark all existing reviews as version 1
    console.log('📝 Step 1: Marking existing reviews as version 1...');
    
    const [updateResult1] = await connection.query(`
      UPDATE anonymous_reviews 
      SET review_version = 1 
      WHERE review_version IS NULL OR review_version = 0
    `);
    console.log(`   Updated ${updateResult1.affectedRows} anonymous_reviews`);
    
    const [updateResult2] = await connection.query(`
      UPDATE reviews 
      SET review_version = 1 
      WHERE review_version IS NULL OR review_version = 0
    `);
    console.log(`   Updated ${updateResult2.affectedRows} legacy reviews\n`);

    // Step 2: Get all unique reviewees
    console.log('📊 Step 2: Calculating dimension scores for existing users...');
    
    const [reviewees] = await connection.query(`
      SELECT DISTINCT reviewee_id FROM (
        SELECT reviewee_id FROM anonymous_reviews
        UNION
        SELECT reviewee_id FROM reviews
      ) AS all_reviewees
    `);
    
    console.log(`   Found ${reviewees.length} users with reviews\n`);

    let processed = 0;
    let updated = 0;

    for (const { reviewee_id } of reviewees) {
      processed++;
      
      // Get all reviews for this user
      const [reviews] = await connection.query(`
        SELECT scores, would_work_again, strength_tags
        FROM anonymous_reviews WHERE reviewee_id = ?
        UNION ALL
        SELECT scores, would_work_again, strength_tags
        FROM reviews WHERE reviewee_id = ?
      `, [reviewee_id, reviewee_id]);

      if (reviews.length === 0) continue;

      // Aggregate dimension scores
      const dimensionAggregates = {
        learns_fast: { sum: 0, count: 0 },
        figures_out: { sum: 0, count: 0 },
        ai_ready: { sum: 0, count: 0 },
        gets_buyin: { sum: 0, count: 0 },
        owns_it: { sum: 0, count: 0 }
      };

      // High-signal aggregates
      let workAgainSum = 0;
      let workAgainCount = 0;

      for (const review of reviews) {
        // Convert old scores to dimensions
        if (review.scores) {
          const scores = typeof review.scores === 'string' 
            ? JSON.parse(review.scores) 
            : review.scores;

          for (const [oldKey, mapping] of Object.entries(OLD_TO_NEW_MAPPING)) {
            if (scores[oldKey] !== undefined && scores[oldKey] !== null) {
              const converted = scores[oldKey] * mapping.factor;
              dimensionAggregates[mapping.dimension].sum += converted;
              dimensionAggregates[mapping.dimension].count += 1;
            }
          }
        }

        // Aggregate would_work_again
        if (review.would_work_again) {
          workAgainSum += review.would_work_again;
          workAgainCount += 1;
        }
      }

      // Calculate and insert dimension scores
      let veryHighCount = 0;
      let strongCount = 0;

      for (const [dim, agg] of Object.entries(dimensionAggregates)) {
        if (agg.count > 0) {
          const rawScore = agg.sum / agg.count;
          const level = calculateLevel(rawScore);
          const percentile = estimatePercentile(level);

          if (level === 'very_high') veryHighCount++;
          if (level === 'strong') strongCount++;

          await connection.query(`
            INSERT INTO dimension_scores 
              (id, linkedin_profile_id, dimension, level, percentile, review_count, raw_score)
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
              level = VALUES(level),
              percentile = VALUES(percentile),
              review_count = VALUES(review_count),
              raw_score = VALUES(raw_score)
          `, [
            uuidv4(),
            reviewee_id,
            dim,
            level,
            percentile,
            agg.count,
            Math.round(rawScore * 100) / 100
          ]);
        }
      }

      // Calculate qualitative badge
      const workAgainPct = workAgainCount > 0 
        ? Math.round((workAgainSum / workAgainCount / 5) * 100) 
        : 0;
      
      let badge = 'growing';
      if (veryHighCount >= 3 && workAgainPct >= 70) {
        badge = 'highly_adaptable';
      } else if (veryHighCount >= 1 || strongCount >= 2) {
        badge = 'solid_contributor';
      }

      // Estimate startup_hire and harder_job from overall score (since we don't have this data)
      // Use work_again as a proxy - if they'd work again, they'd likely hire/want on team
      const startupHirePct = workAgainPct > 80 ? Math.round(workAgainPct * 0.85) : Math.round(workAgainPct * 0.7);
      const harderJobPct = workAgainPct > 80 ? Math.round(workAgainPct * 0.9) : Math.round(workAgainPct * 0.75);

      // Update user_scores
      await connection.query(`
        UPDATE user_scores 
        SET 
          qualitative_badge = ?,
          work_again_absolutely_pct = ?,
          startup_hire_pct = ?,
          harder_job_pct = ?
        WHERE linkedin_profile_id = ?
      `, [badge, workAgainPct, startupHirePct, harderJobPct, reviewee_id]);

      updated++;
      
      if (processed % 5 === 0) {
        console.log(`   Processed ${processed}/${reviewees.length} users...`);
      }
    }

    console.log(`\n✅ Migration complete!`);
    console.log(`   - Processed: ${processed} users`);
    console.log(`   - Updated dimension scores: ${updated} users`);

  } catch (error) {
    console.error('❌ Migration failed:', error);
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\n🎉 Migration finished successfully!');
    process.exit(0);
  })
  .catch((err) => {
    console.error('\n💥 Migration failed:', err);
    process.exit(1);
  });
