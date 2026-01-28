/**
 * Dimension Scoring Service
 * Handles calculation of dimension levels, percentiles, and qualitative badges
 */

const { v4: uuidv4 } = require('uuid');

// Dimension definitions (mirror of frontend config)
const DIMENSIONS = {
  learns_fast: { name: 'Picks Things Up Fast', weight: 1.0 },
  figures_out: { name: 'Figures It Out', weight: 1.0 },
  ai_ready: { name: 'AI-Ready', weight: 0.8 }, // Lower weight since it's optional
  gets_buyin: { name: 'Gets People On Board', weight: 1.0 },
  owns_it: { name: 'Owns It', weight: 1.2 } // Higher weight - very predictive
};

// Level thresholds (0-3 scale)
const LEVEL_THRESHOLDS = {
  very_high: 2.5,
  strong: 1.75,
  moderate: 1.0,
  developing: 0
};

// Badge criteria
const BADGE_CRITERIA = {
  highly_adaptable: {
    minVeryHigh: 3,
    minStartupHirePct: 70
  },
  solid_contributor: {
    minVeryHigh: 1,
    minStrong: 2
  }
};

/**
 * Calculate level from raw score (0-3 scale)
 */
function calculateLevel(rawScore) {
  if (rawScore >= LEVEL_THRESHOLDS.very_high) return 'very_high';
  if (rawScore >= LEVEL_THRESHOLDS.strong) return 'strong';
  if (rawScore >= LEVEL_THRESHOLDS.moderate) return 'moderate';
  return 'developing';
}

/**
 * Estimate percentile from level
 */
function estimatePercentile(level) {
  const percentileRanges = {
    very_high: [5, 15],
    strong: [16, 30],
    moderate: [31, 60],
    developing: [61, 85]
  };
  const range = percentileRanges[level] || [50, 50];
  return Math.round((range[0] + range[1]) / 2);
}

/**
 * Calculate dimension scores from all reviews for a user
 */
async function calculateDimensionScores(connection, linkedinProfileId) {
  // Get all reviews for this user (both new behavioral and old converted)
  const [reviews] = await connection.query(`
    SELECT 
      behavioral_answers,
      high_signal_answers,
      scores,
      review_version,
      would_work_again,
      would_promote
    FROM anonymous_reviews 
    WHERE reviewee_id = ?
    UNION ALL
    SELECT 
      behavioral_answers,
      high_signal_answers,
      scores,
      review_version,
      would_work_again,
      would_promote
    FROM reviews 
    WHERE reviewee_id = ?
  `, [linkedinProfileId, linkedinProfileId]);

  if (reviews.length === 0) {
    return null;
  }

  // Aggregate scores per dimension
  const dimensionAggregates = {};
  Object.keys(DIMENSIONS).forEach(dim => {
    dimensionAggregates[dim] = { sum: 0, count: 0 };
  });

  // High-signal aggregates
  const highSignalAggregates = {
    startup_hire: { sum: 0, count: 0, maxValue: 3 },
    harder_job: { sum: 0, count: 0, maxValue: 4 },
    work_again: { sum: 0, count: 0, maxValue: 5 }
  };

  // Aggregates for would_work_again and would_promote (stored directly in review tables)
  let workAgainSum = 0, workAgainCount = 0;
  let promoteSum = 0, promoteCount = 0;

  for (const review of reviews) {
    // Aggregate would_work_again (1-5 scale)
    if (review.would_work_again) {
      workAgainSum += parseInt(review.would_work_again);
      workAgainCount++;
    }
    
    // Aggregate would_promote (1-4 scale: 1=Not yet, 2=Maybe 1-2 years, 3=Yes ready, 4=Above level)
    // Cap at 4 for legacy data that may have invalid values like 5
    if (review.would_promote !== null && review.would_promote !== undefined) {
      const promoteValue = Math.min(parseInt(review.would_promote), 4);
      promoteSum += promoteValue;
      promoteCount++;
    }
    // Handle new behavioral reviews (version 2)
    if (review.review_version === 2 && review.behavioral_answers) {
      const answers = typeof review.behavioral_answers === 'string' 
        ? JSON.parse(review.behavioral_answers) 
        : review.behavioral_answers;
      
      Object.entries(answers).forEach(([dim, value]) => {
        if (dimensionAggregates[dim] && value !== null && value !== undefined) {
          dimensionAggregates[dim].sum += value;
          dimensionAggregates[dim].count += 1;
        }
      });
    }
    // Handle old slider reviews (version 1) - convert to dimension estimates
    else if (review.scores) {
      const scores = typeof review.scores === 'string' 
        ? JSON.parse(review.scores) 
        : review.scores;
      
      // Map old scores to dimensions
      if (scores.problem_solving) {
        const converted = (scores.problem_solving / 10) * 3;
        dimensionAggregates.figures_out.sum += converted;
        dimensionAggregates.figures_out.count += 1;
      }
      
      if (scores.communication || scores.teamwork) {
        const avg = ((scores.communication || 5) + (scores.teamwork || 5)) / 2;
        const converted = (avg / 10) * 3;
        dimensionAggregates.gets_buyin.sum += converted;
        dimensionAggregates.gets_buyin.count += 1;
      }
      
      if (scores.reliability || scores.takes_ownership) {
        const avg = ((scores.reliability || 5) + (scores.takes_ownership || 5)) / 2;
        const converted = (avg / 10) * 3;
        dimensionAggregates.owns_it.sum += converted;
        dimensionAggregates.owns_it.count += 1;
      }
    }

    // Aggregate high-signal answers
    if (review.high_signal_answers) {
      const highSignal = typeof review.high_signal_answers === 'string'
        ? JSON.parse(review.high_signal_answers)
        : review.high_signal_answers;
      
      Object.entries(highSignal).forEach(([key, value]) => {
        if (highSignalAggregates[key] && value !== null && value !== undefined) {
          highSignalAggregates[key].sum += value;
          highSignalAggregates[key].count += 1;
        }
      });
    }
  }

  // Calculate final dimension scores
  const dimensionScores = {};
  Object.entries(dimensionAggregates).forEach(([dim, agg]) => {
    if (agg.count > 0) {
      const rawScore = agg.sum / agg.count;
      const level = calculateLevel(rawScore);
      dimensionScores[dim] = {
        rawScore: Math.round(rawScore * 100) / 100,
        level,
        percentile: estimatePercentile(level),
        reviewCount: agg.count
      };
    }
  });

  // Calculate high-signal percentages
  const highSignalPcts = {};
  Object.entries(highSignalAggregates).forEach(([key, agg]) => {
    if (agg.count > 0) {
      // Calculate percentage of max possible score
      const maxPossible = agg.count * agg.maxValue;
      highSignalPcts[key] = Math.round((agg.sum / maxPossible) * 100);
    }
  });
  
  // Calculate would_work_again percentage (1-5 scale = 20%-100%)
  if (workAgainCount > 0) {
    const avgScore = workAgainSum / workAgainCount;
    highSignalPcts.work_again_absolutely = Math.round(avgScore * 20);
  }
  
  // Calculate would_promote percentage (1-4 scale = 25%-100%)
  if (promoteCount > 0) {
    const avgScore = promoteSum / promoteCount;
    highSignalPcts.harder_job = Math.round((avgScore / 4) * 100);
    highSignalPcts.startup_hire = highSignalPcts.harder_job; // Same metric
  }

  return {
    dimensions: dimensionScores,
    highSignalPcts,
    reviewCount: reviews.length
  };
}

/**
 * Calculate qualitative badge based on dimension scores and high-signal answers
 */
function calculateBadge(dimensionScores, highSignalPcts) {
  const veryHighCount = Object.values(dimensionScores)
    .filter(d => d.level === 'very_high').length;
  const strongCount = Object.values(dimensionScores)
    .filter(d => d.level === 'strong').length;
  
  // Check for Highly Adaptable
  if (veryHighCount >= BADGE_CRITERIA.highly_adaptable.minVeryHigh && 
      (highSignalPcts?.startup_hire || 0) >= BADGE_CRITERIA.highly_adaptable.minStartupHirePct) {
    return 'highly_adaptable';
  }
  
  // Check for Solid Contributor
  if (veryHighCount >= BADGE_CRITERIA.solid_contributor.minVeryHigh ||
      strongCount >= BADGE_CRITERIA.solid_contributor.minStrong) {
    return 'solid_contributor';
  }
  
  // Default to Growing
  return 'growing';
}

/**
 * Update dimension_scores table for a user
 */
async function updateDimensionScores(connection, linkedinProfileId) {
  const result = await calculateDimensionScores(connection, linkedinProfileId);
  
  if (!result) {
    return null;
  }

  const { dimensions, highSignalPcts, reviewCount } = result;

  // Update dimension_scores table
  for (const [dim, data] of Object.entries(dimensions)) {
    await connection.query(`
      INSERT INTO dimension_scores 
        (id, linkedin_profile_id, dimension, level, percentile, review_count, raw_score)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        level = VALUES(level),
        percentile = VALUES(percentile),
        review_count = VALUES(review_count),
        raw_score = VALUES(raw_score),
        updated_at = CURRENT_TIMESTAMP
    `, [
      uuidv4(),
      linkedinProfileId,
      dim,
      data.level,
      data.percentile,
      data.reviewCount,
      data.rawScore
    ]);
  }

  // Calculate and update badge
  const badge = calculateBadge(dimensions, highSignalPcts);

  // Update user_scores with new fields
  await connection.query(`
    UPDATE user_scores 
    SET 
      qualitative_badge = ?,
      startup_hire_pct = ?,
      harder_job_pct = ?,
      work_again_absolutely_pct = ?
    WHERE linkedin_profile_id = ?
  `, [
    badge,
    highSignalPcts.startup_hire || null,
    highSignalPcts.harder_job || null,
    highSignalPcts.work_again_absolutely || null,
    linkedinProfileId
  ]);

  return {
    dimensions,
    highSignalPcts,
    badge,
    reviewCount
  };
}

/**
 * Get dimension scores for display
 */
async function getDimensionScores(connection, linkedinProfileId) {
  const [scores] = await connection.query(`
    SELECT dimension, level, percentile, review_count, raw_score
    FROM dimension_scores
    WHERE linkedin_profile_id = ?
  `, [linkedinProfileId]);

  if (scores.length === 0) {
    return null;
  }

  const dimensions = {};
  scores.forEach(row => {
    dimensions[row.dimension] = {
      level: row.level,
      percentile: row.percentile,
      reviewCount: row.review_count,
      rawScore: parseFloat(row.raw_score)
    };
  });

  return dimensions;
}

/**
 * Aggregate "never worry about" responses
 */
async function aggregateNeverWorryAbout(connection, linkedinProfileId) {
  const [reviews] = await connection.query(`
    SELECT never_worry_about
    FROM anonymous_reviews 
    WHERE reviewee_id = ? AND never_worry_about IS NOT NULL AND never_worry_about != ''
    UNION ALL
    SELECT never_worry_about
    FROM reviews 
    WHERE reviewee_id = ? AND never_worry_about IS NOT NULL AND never_worry_about != ''
  `, [linkedinProfileId, linkedinProfileId]);

  if (reviews.length === 0) {
    return [];
  }

  // Simple aggregation - return unique responses
  const uniqueResponses = [...new Set(reviews.map(r => r.never_worry_about))];
  return uniqueResponses.slice(0, 5); // Max 5 items
}

/**
 * Aggregate strength tags with vote counts
 */
async function aggregateStrengthTags(connection, linkedinProfileId) {
  const [reviews] = await connection.query(`
    SELECT strength_tags
    FROM anonymous_reviews 
    WHERE reviewee_id = ?
    UNION ALL
    SELECT strength_tags
    FROM reviews 
    WHERE reviewee_id = ?
  `, [linkedinProfileId, linkedinProfileId]);

  if (reviews.length === 0) {
    return [];
  }

  // Count tag occurrences
  const tagCounts = {};
  reviews.forEach(review => {
    if (review.strength_tags) {
      const tags = typeof review.strength_tags === 'string' 
        ? JSON.parse(review.strength_tags) 
        : review.strength_tags;
      
      tags.forEach(tag => {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      });
    }
  });

  // Convert to array and sort by count
  return Object.entries(tagCounts)
    .map(([id, votes]) => ({ id, votes }))
    .sort((a, b) => b.votes - a.votes);
}

/**
 * Aggregate "room to grow" feedback (private, only visible to profile owner)
 */
async function aggregateRoomToGrow(connection, linkedinProfileId) {
  const [reviews] = await connection.query(`
    SELECT room_to_grow
    FROM anonymous_reviews 
    WHERE reviewee_id = ? AND room_to_grow IS NOT NULL AND room_to_grow != ''
    UNION ALL
    SELECT room_to_grow
    FROM reviews 
    WHERE reviewee_id = ? AND room_to_grow IS NOT NULL AND room_to_grow != ''
  `, [linkedinProfileId, linkedinProfileId]);

  if (reviews.length === 0) {
    return [];
  }

  // Return as structured feedback items
  return reviews.map((r, idx) => ({
    title: idx === 0 ? 'Growth Area' : null,
    text: r.room_to_grow
  })).slice(0, 3); // Max 3 items
}

module.exports = {
  calculateDimensionScores,
  calculateBadge,
  calculateLevel,
  estimatePercentile,
  updateDimensionScores,
  getDimensionScores,
  aggregateNeverWorryAbout,
  aggregateRoomToGrow,
  aggregateStrengthTags,
  DIMENSIONS,
  LEVEL_THRESHOLDS,
  BADGE_CRITERIA
};
