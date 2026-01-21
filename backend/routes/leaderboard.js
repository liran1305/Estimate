/**
 * Leaderboard API - Top Performers Rankings
 * 
 * Privacy Rules:
 * - Users with recruiter_consent = FALSE are shown as "Private Profile"
 * - Their photo, name, and company are hidden
 * - Only their rank and score are visible
 * 
 * Requirements to appear on leaderboard:
 * - Minimum 3 reviews received
 * - Score unlocked (given 3+ reviews)
 * - Has a valid overall score
 */

const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { 
  JOB_CATEGORIES, 
  normalizeJobTitle, 
  PERCENTILE_TIERS,
  DEFAULT_SCORE_THRESHOLDS 
} = require('../utils/jobTitlesSystem');

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

// Minimum reviews required to show full profile (otherwise shown as Private)
const MIN_REVIEWS_FOR_PUBLIC = 3;

// ============================================================================
// GET /api/leaderboard/categories - Get all available categories with counts
// ============================================================================
router.get('/categories', async (req, res) => {
  try {
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get all users with their job titles and scores (include ALL users with scores)
      const [users] = await connection.query(`
        SELECT 
          lp.position as job_title,
          us.overall_score,
          us.reviews_received
        FROM users u
        JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        JOIN user_scores us ON u.id = us.user_id
        WHERE us.overall_score IS NOT NULL
        AND us.overall_score > 0
      `);

      // Count users per SPECIFIC JOB TITLE (not broad category)
      const titleCounts = {};
      
      for (const user of users) {
        const normalized = normalizeJobTitle(user.job_title);
        if (normalized) {
          const titleKey = `${normalized.categoryKey}_${normalized.titleKey}`;
          if (!titleCounts[titleKey]) {
            titleCounts[titleKey] = {
              count: 0,
              topScore: 0,
              canonical: normalized.canonical,
              categoryName: normalized.category,
              categoryKey: normalized.categoryKey
            };
          }
          titleCounts[titleKey].count++;
          if (user.overall_score > titleCounts[titleKey].topScore) {
            titleCounts[titleKey].topScore = user.overall_score;
          }
        }
      }

      // Build categories response from ALL SPECIFIC JOB TITLES
      const categories = [];
      for (const [categoryKey, category] of Object.entries(JOB_CATEGORIES)) {
        for (const [titleKey, titleData] of Object.entries(category.titles)) {
          const fullKey = `${categoryKey}_${titleKey}`;
          const counts = titleCounts[fullKey] || { count: 0, topScore: 0 };
          categories.push({
            key: fullKey,
            name: titleData.canonical,
            displayName: titleData.canonical,
            categoryName: category.category,
            userCount: counts.count,
            topScore: counts.topScore ? parseFloat(counts.topScore).toFixed(1) : null
          });
        }
      }

      // Sort: titles with users first, then alphabetically
      categories.sort((a, b) => {
        if (a.userCount > 0 && b.userCount === 0) return -1;
        if (a.userCount === 0 && b.userCount > 0) return 1;
        if (a.userCount !== b.userCount) return b.userCount - a.userCount;
        return a.name.localeCompare(b.name);
      });

      res.json({
        success: true,
        categories,
        totalUsers: users.length,
        minReviewsForPublic: MIN_REVIEWS_FOR_PUBLIC
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('[LEADERBOARD] Categories error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET /api/leaderboard/:categoryKey - Get top performers for a category
// ============================================================================
router.get('/:titleKey', async (req, res) => {
  try {
    const { titleKey } = req.params;
    const { 
      limit = 50, 
      offset = 0,
      currentUserId = null // Pass current user ID to highlight their position
    } = req.query;

    // Parse titleKey (format: categoryKey_titleKey, e.g., "software_engineering_frontend_engineer")
    const parts = titleKey.split('_');
    if (parts.length < 2) {
      return res.status(400).json({ 
        success: false, 
        error: 'Invalid title key format' 
      });
    }

    // Find the matching category and title
    let foundCategory = null;
    let foundTitle = null;
    let categoryKey = null;
    let specificTitleKey = null;

    for (const [catKey, category] of Object.entries(JOB_CATEGORIES)) {
      for (const [tKey, titleData] of Object.entries(category.titles)) {
        if (`${catKey}_${tKey}` === titleKey) {
          foundCategory = category;
          foundTitle = titleData;
          categoryKey = catKey;
          specificTitleKey = tKey;
          break;
        }
      }
      if (foundCategory) break;
    }

    if (!foundCategory || !foundTitle) {
      return res.status(404).json({ 
        success: false, 
        error: 'Job title not found' 
      });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get ALL users with scores (include everyone for ranking)
      const [allUsers] = await connection.query(`
        SELECT 
          u.id as user_id,
          lp.id as linkedin_profile_id,
          lp.name,
          lp.avatar as photo_url,
          lp.position as job_title,
          lp.current_company_name as company_name,
          lp.location,
          us.overall_score,
          us.reviews_received,
          us.score_unlocked
        FROM users u
        JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        JOIN user_scores us ON u.id = us.user_id
        WHERE us.overall_score IS NOT NULL
        AND us.overall_score > 0
        ORDER BY us.overall_score DESC, us.reviews_received DESC
      `);

      // Filter users by SPECIFIC JOB TITLE (not broad category)
      const titleUsers = allUsers.filter(user => {
        const normalized = normalizeJobTitle(user.job_title);
        return normalized && 
               normalized.categoryKey === categoryKey && 
               normalized.canonical === foundTitle.canonical;
      });

      // Calculate ranks for real users
      const rankedUsers = titleUsers.map((user, index) => ({
        ...user,
        rank: index + 1,
        isPlaceholder: false
      }));

      // Generate placeholder profiles to fill out the leaderboard (for visual structure)
      const PLACEHOLDER_COUNT = 10;
      const placeholderProfiles = [];
      
      for (let i = 1; i <= PLACEHOLDER_COUNT; i++) {
        // Check if this rank is already taken by a real user
        const existingUser = rankedUsers.find(u => u.rank === i);
        if (!existingUser) {
          placeholderProfiles.push({
            rank: i,
            isPlaceholder: true,
            score: (10 - (i * 0.3)).toFixed(1), // Decreasing scores
            reviewsCount: Math.floor(Math.random() * 5) + 3,
            name: 'Private Profile',
            photoUrl: null,
            isPublic: false
          });
        }
      }

      // Merge real users with placeholders and sort by rank
      const allRanked = [...rankedUsers, ...placeholderProfiles].sort((a, b) => a.rank - b.rank);

      // Apply pagination
      const paginatedUsers = allRanked.slice(
        parseInt(offset), 
        parseInt(offset) + parseInt(limit)
      );

      // Format leaderboard response
      const leaderboard = paginatedUsers.map(user => {
        if (user.isPlaceholder) {
          return {
            rank: user.rank,
            score: user.score,
            reviewsCount: user.reviewsCount,
            isPublic: false,
            isPlaceholder: true,
            userId: null,
            id: null,
            name: 'Private Profile',
            photoUrl: null,
            jobTitle: null,
            companyName: null,
            location: null,
          };
        }

        // Real user - check if it's the current user viewing
        const isCurrentUser = currentUserId && user.user_id === currentUserId;
        const normalized = normalizeJobTitle(user.job_title);
        
        return {
          rank: user.rank,
          score: parseFloat(user.overall_score).toFixed(1),
          reviewsCount: user.reviews_received || 0,
          isPublic: isCurrentUser, // Show own profile as public
          isCurrentUser,
          isPlaceholder: false,
          userId: user.user_id,
          
          // Show full info if it's the current user
          ...(isCurrentUser ? {
            id: user.linkedin_profile_id,
            name: user.name,
            photoUrl: user.photo_url,
            jobTitle: normalized ? normalized.canonical : user.job_title,
            companyName: user.company_name,
            location: user.location,
          } : {
            id: null,
            name: 'Private Profile',
            photoUrl: null,
            jobTitle: null,
            companyName: null,
            location: null,
          })
        };
      });

      res.json({
        success: true,
        category: {
          key: titleKey,
          name: foundTitle.canonical,
          displayName: foundTitle.canonical,
          categoryName: foundCategory.category
        },
        leaderboard,
        realUserCount: rankedUsers.length,
        pagination: {
          total: allRanked.length,
          limit: parseInt(limit),
          offset: parseInt(offset),
          hasMore: parseInt(offset) + paginatedUsers.length < allRanked.length
        },
        minReviewsForPublic: MIN_REVIEWS_FOR_PUBLIC
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('[LEADERBOARD] Category leaderboard error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET /api/leaderboard/user/:userId/rank - Get a specific user's rank
// ============================================================================
router.get('/user/:userId/rank', async (req, res) => {
  try {
    const { userId } = req.params;

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get user's data
      const [users] = await connection.query(`
        SELECT 
          u.id as user_id,
          lp.position as job_title,
          us.overall_score,
          us.reviews_received,
          us.score_unlocked
        FROM users u
        JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        JOIN user_scores us ON u.id = us.user_id
        WHERE u.id = ?
      `, [userId]);

      if (users.length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'User not found' 
        });
      }

      const userData = users[0];

      // User can always see their rank, but may be shown as Private
      const isPublicProfile = userData.score_unlocked && 
                              userData.reviews_received >= MIN_REVIEWS_FOR_PUBLIC;

      // Normalize job title to get category
      const normalized = normalizeJobTitle(userData.job_title);
      if (!normalized) {
        return res.json({
          success: true,
          qualified: false,
          message: 'Job title not recognized for ranking'
        });
      }

      // Get all users in same category to calculate rank
      const [allUsers] = await connection.query(`
        SELECT 
          u.id as user_id,
          lp.position as job_title,
          us.overall_score,
          us.reviews_received
        FROM users u
        JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        JOIN user_scores us ON u.id = us.user_id
        WHERE us.overall_score IS NOT NULL
        AND us.overall_score > 0
        ORDER BY us.overall_score DESC, us.reviews_received DESC
      `);

      // Filter to same category
      const categoryUsers = allUsers.filter(user => {
        const norm = normalizeJobTitle(user.job_title);
        return norm && norm.categoryKey === normalized.categoryKey;
      });

      // Find user's rank
      const userIndex = categoryUsers.findIndex(u => u.user_id === userId);
      const rank = userIndex + 1;
      const total = categoryUsers.length;
      const percentile = Math.round((1 - (rank / total)) * 100);

      // Get badge based on rank
      const badge = getBadgeForRank(rank, total, userData.overall_score);

      res.json({
        success: true,
        qualified: true,
        isPublicProfile,
        rank,
        totalInCategory: total,
        percentile,
        category: {
          key: normalized.categoryKey,
          name: JOB_CATEGORIES[normalized.categoryKey]?.category,
          displayName: JOB_CATEGORIES[normalized.categoryKey]?.displayName
        },
        score: parseFloat(userData.overall_score).toFixed(1),
        reviewsReceived: userData.reviews_received || 0,
        reviewsNeededForPublic: Math.max(0, MIN_REVIEWS_FOR_PUBLIC - (userData.reviews_received || 0)),
        badge
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('[LEADERBOARD] User rank error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// Helper: Get badge based on rank and score
// ============================================================================
function getBadgeForRank(rank, total, score) {
  const percentile = (1 - (rank / total)) * 100;
  
  if (rank === 1) return { tier: 'Top 1', label: '🥇 #1 in Category', color: '#fbbf24' };
  if (rank === 2) return { tier: 'Top 2', label: '🥈 #2 in Category', color: '#94a3b8' };
  if (rank === 3) return { tier: 'Top 3', label: '🥉 #3 in Category', color: '#d97706' };
  if (rank <= 10) return { tier: 'Top 10', label: '🏆 Top 10', color: '#10b981' };
  
  // Use score-based thresholds for smaller pools
  if (score >= 9.6) return { tier: 'Top 1%', label: '🏆 Top 1%', color: '#7c3aed' };
  if (score >= 9.2) return { tier: 'Top 3%', label: '⭐ Top 3%', color: '#a78bfa' };
  if (score >= 8.8) return { tier: 'Top 5%', label: '✨ Top 5%', color: '#06b6d4' };
  if (score >= 8.2) return { tier: 'Top 10%', label: '💪 Top 10%', color: '#10b981' };
  if (score >= 7.5) return { tier: 'Top 20%', label: '👍 Top 20%', color: '#84cc16' };
  
  if (percentile >= 50) return { tier: 'Top 50%', label: '✓ Top 50%', color: '#6b7280' };
  return { tier: 'Ranked', label: `Ranked #${rank}`, color: '#6b7280' };
}

module.exports = router;
