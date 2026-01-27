/**
 * Script to add test reviews for a user
 * Run with: node backend/scripts/add-test-review.js
 */

const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });

async function addTestReviews() {
  console.log('Connecting to database...');
  console.log('Host:', process.env.CLOUD_SQL_HOST);
  
  const connection = await mysql.createConnection({
    host: process.env.CLOUD_SQL_HOST,
    user: process.env.CLOUD_SQL_USER,
    password: process.env.CLOUD_SQL_PASSWORD,
    database: process.env.CLOUD_SQL_DATABASE,
    ssl: { rejectUnauthorized: false }
  });

  try {
    // Find Liran Naim's profile specifically
    const [profiles] = await connection.query(
      "SELECT id, name FROM linkedin_profiles WHERE name LIKE '%Liran Naim%' OR name LIKE '%liran-naim%' LIMIT 1"
    );
    
    if (profiles.length === 0) {
      console.log('Could not find Liran profile. Searching for any profile...');
      const [anyProfile] = await connection.query(
        "SELECT id, name FROM linkedin_profiles LIMIT 1"
      );
      if (anyProfile.length === 0) {
        console.log('No profiles found in database');
        return;
      }
      console.log('Found profile:', anyProfile[0]);
    }
    
    const profileId = profiles[0]?.id;
    console.log(`Found profile: ${profiles[0]?.name} (ID: ${profileId})`);
    
    // Check existing reviews
    const [existingReviews] = await connection.query(
      "SELECT COUNT(*) as count FROM anonymous_reviews WHERE reviewee_id = ?",
      [profileId]
    );
    console.log(`Existing reviews: ${existingReviews[0].count}`);

    // Test review 1 - Peer review with all new fields
    const review1Id = uuidv4();
    await connection.query(`
      INSERT INTO anonymous_reviews (
        id, reviewee_id, company_name, company_context, interaction_type,
        scores, strength_tags, would_work_again, would_promote,
        optional_comment, overall_score, review_weight, created_date,
        never_worry_about, room_to_grow
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), ?, ?)
    `, [
      review1Id,
      profileId,
      'Crawl5',
      'AI Product',
      'peer',
      JSON.stringify({
        learns_fast: 5,
        figures_out: 5,
        ai_ready: 5,
        gets_buyin: 4,
        owns_it: 5,
        startup_hire: 5,
        harder_job: 5
      }),
      JSON.stringify(['Quick Learner', 'Solution-Oriented', 'Removes Blockers', 'Delivers Results', 'Accountable']),
      5, // would_work_again (Absolutely)
      5, // would_promote
      'Liran is an exceptional product leader. He has a rare ability to understand complex technical challenges and translate them into clear product vision. His AI expertise is top-notch, and he consistently delivers results even under pressure.',
      9.5,
      1.0,
      'Dropping commitments',
      'Could delegate more instead of taking everything on himself'
    ]);
    console.log('Added test review 1 (peer)');

    // Test review 2 - Manager review
    const review2Id = uuidv4();
    await connection.query(`
      INSERT INTO anonymous_reviews (
        id, reviewee_id, company_name, company_context, interaction_type,
        scores, strength_tags, would_work_again, would_promote,
        optional_comment, overall_score, review_weight, created_date,
        never_worry_about, room_to_grow
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, DATE_SUB(NOW(), INTERVAL 30 DAY), ?, ?)
    `, [
      review2Id,
      profileId,
      'FireArc Technologies',
      'LLM Solutions',
      'manager',
      JSON.stringify({
        learns_fast: 4,
        figures_out: 5,
        ai_ready: 5,
        gets_buyin: 5,
        owns_it: 4,
        startup_hire: 5,
        harder_job: 4
      }),
      JSON.stringify(['Strategic Thinker', 'Quick Learner', 'Accountable', 'Solution-Oriented']),
      5,
      5,
      'One of the best product minds I have worked with. Liran brings clarity to ambiguous situations and has excellent stakeholder management skills.',
      9.2,
      1.0,
      'Missing deadlines',
      'Sometimes moves too fast for the team to keep up'
    ]);
    console.log('Added test review 2 (manager)');

    // Verify
    const [newCount] = await connection.query(
      "SELECT COUNT(*) as count FROM anonymous_reviews WHERE reviewee_id = ?",
      [profileId]
    );
    console.log(`Total reviews now: ${newCount[0].count}`);

    // Now recalculate dimension scores
    console.log('\nRecalculating dimension scores...');
    
    // Get all reviews for this user
    const [allReviews] = await connection.query(`
      SELECT scores, would_work_again FROM anonymous_reviews WHERE reviewee_id = ?
      UNION ALL
      SELECT scores, would_work_again FROM reviews WHERE reviewee_id = ?
    `, [profileId, profileId]);

    // Aggregate behavioral scores
    const dimensionTotals = {};
    const dimensionCounts = {};
    let workAgainAbsolutelyCount = 0;
    let startupHireCount = 0;
    let harderJobCount = 0;
    let totalReviews = 0;

    for (const review of allReviews) {
      totalReviews++;
      if (review.scores) {
        const scores = typeof review.scores === 'string' ? JSON.parse(review.scores) : review.scores;
        
        // Behavioral dimensions
        ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it'].forEach(dim => {
          if (scores[dim]) {
            dimensionTotals[dim] = (dimensionTotals[dim] || 0) + scores[dim];
            dimensionCounts[dim] = (dimensionCounts[dim] || 0) + 1;
          }
        });
        
        // High-signal metrics
        if (scores.startup_hire >= 4) startupHireCount++;
        if (scores.harder_job >= 4) harderJobCount++;
      }
      
      if (review.would_work_again === 5) workAgainAbsolutelyCount++;
    }

    // Calculate percentiles (simplified)
    const levelToPercentile = {
      5: 10,  // Top 10%
      4: 20,  // Top 20%
      3: 40,  // Top 40%
      2: 60,  // Top 60%
      1: 80   // Top 80%
    };

    // Update dimension_scores table
    for (const dim of ['learns_fast', 'figures_out', 'ai_ready', 'gets_buyin', 'owns_it']) {
      if (dimensionCounts[dim]) {
        const avgScore = dimensionTotals[dim] / dimensionCounts[dim];
        const level = Math.round(avgScore);
        const percentile = levelToPercentile[level] || 50;
        
        await connection.query(`
          INSERT INTO dimension_scores (linkedin_profile_id, dimension, level, percentile, review_count, raw_score)
          VALUES (?, ?, ?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE
            level = VALUES(level),
            percentile = VALUES(percentile),
            review_count = VALUES(review_count),
            raw_score = VALUES(raw_score)
        `, [profileId, dim, level, percentile, dimensionCounts[dim], avgScore]);
        
        console.log(`  ${dim}: avg=${avgScore.toFixed(1)}, level=${level}, percentile=Top ${percentile}%`);
      }
    }

    // Update user_scores with high-signal percentages
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

    console.log(`\nHigh-signal metrics updated:`);
    console.log(`  Work again absolutely: ${workAgainPct}%`);
    console.log(`  Startup hire: ${startupHirePct}%`);
    console.log(`  Harder job: ${harderJobPct}%`);

    console.log('\n✅ Test reviews added successfully! Refresh your profile page to see the changes.');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await connection.end();
  }
}

addTestReviews();
