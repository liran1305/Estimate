const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');

let pool;

// Calculate time overlap in months between two work periods
function calculateTimeOverlap(userFrom, userTo, userIsCurrent, colleagueFrom, colleagueTo, colleagueIsCurrent) {
  const parseDate = (dateStr, isCurrent, isEnd = false) => {
    if (isCurrent && isEnd) return new Date();
    if (!dateStr || dateStr === 'Present') return isEnd ? new Date() : null;
    
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const parts = dateStr.toLowerCase().split(' ');
    
    let year, month;
    if (parts.length === 2) {
      const monthIndex = monthNames.findIndex(m => parts[0].startsWith(m));
      month = monthIndex >= 0 ? monthIndex : 0;
      year = parseInt(parts[1]);
    } else if (parts.length === 1) {
      year = parseInt(parts[0]);
      month = isEnd ? 11 : 0;
    } else {
      return null;
    }
    
    if (isNaN(year)) return null;
    return new Date(year, month, isEnd ? 28 : 1);
  };

  const userStart = parseDate(userFrom, false, false);
  const userEnd = parseDate(userTo, userIsCurrent, true);
  const colleagueStart = parseDate(colleagueFrom, false, false);
  const colleagueEnd = parseDate(colleagueTo, colleagueIsCurrent, true);

  if (!userStart || !userEnd || !colleagueStart || !colleagueEnd) {
    if (userIsCurrent && colleagueIsCurrent) return 12;
    return 6;
  }

  const overlapStart = new Date(Math.max(userStart.getTime(), colleagueStart.getTime()));
  const overlapEnd = new Date(Math.min(userEnd.getTime(), colleagueEnd.getTime()));

  if (overlapStart >= overlapEnd) return 0;

  const months = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 
                 + (overlapEnd.getMonth() - overlapStart.getMonth());
  
  return Math.max(0, months);
}

async function getPool() {
  if (!pool) {
    pool = mysql.createPool({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }
  return pool;
}

// ============================================================================
// 16. GET /api/session/start - Calculate skip budget and start review session
// ============================================================================
router.get('/session/start', async (req, res) => {
  try {
    const { user_id } = req.query;
    
    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get user's LinkedIn profile
      const [users] = await connection.query(
        'SELECT linkedin_profile_id FROM users WHERE id = ?',
        [user_id]
      );

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const linkedinProfileId = users[0].linkedin_profile_id;

      if (!linkedinProfileId) {
        return res.status(400).json({ 
          success: false, 
          error: 'User has no linked LinkedIn profile. Cannot start review session.' 
        });
      }

      // Get user's work history to calculate skip budget
      const [workHistory] = await connection.query(`
        SELECT DISTINCT company_name 
        FROM company_connections 
        WHERE profile_id = ?
      `, [linkedinProfileId]);

      // Calculate skip budget based on company sizes
      // Formula: 3 skips per company (simplified - can enhance with actual company sizes)
      let skipBudget = 0;
      
      for (const company of workHistory) {
        // Try to get company size from companies table
        const [companyData] = await connection.query(
          'SELECT employee_count FROM companies WHERE name = ? LIMIT 1',
          [company.company_name]
        );

        if (companyData.length > 0 && companyData[0].employee_count) {
          const employeeCount = companyData[0].employee_count;
          // Skip budget based on company size
          if (employeeCount > 10000) {
            skipBudget += 5;
          } else if (employeeCount > 1000) {
            skipBudget += 4;
          } else if (employeeCount > 100) {
            skipBudget += 3;
          } else {
            skipBudget += 2;
          }
        } else {
          // Default: 3 skips per company if size unknown
          skipBudget += 3;
        }
      }

      // Minimum skip budget of 3
      skipBudget = Math.max(skipBudget, 3);

      // Check for existing active session
      const [existingSessions] = await connection.query(
        'SELECT id, skip_budget, skips_used, reviews_completed FROM review_sessions WHERE user_id = ? AND status = "active"',
        [user_id]
      );

      if (existingSessions.length > 0) {
        // Return existing session
        const session = existingSessions[0];
        return res.json({
          success: true,
          session: {
            id: session.id,
            skip_budget: session.skip_budget,
            skips_used: session.skips_used,
            skips_remaining: session.skip_budget - session.skips_used,
            reviews_completed: session.reviews_completed
          },
          message: 'Existing active session found'
        });
      }

      // Create new session
      const sessionId = uuidv4();
      await connection.query(`
        INSERT INTO review_sessions (id, user_id, skip_budget, skips_used, reviews_completed, status)
        VALUES (?, ?, ?, 0, 0, 'active')
      `, [sessionId, user_id, skipBudget]);

      res.json({
        success: true,
        session: {
          id: sessionId,
          skip_budget: skipBudget,
          skips_used: 0,
          skips_remaining: skipBudget,
          reviews_completed: 0
        },
        companies_count: workHistory.length,
        message: 'New review session started'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Session start error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 17. GET /api/colleague/next - Matching algorithm to get next colleague
// ============================================================================
router.get('/colleague/next', async (req, res) => {
  try {
    const { user_id, session_id } = req.query;

    if (!user_id || !session_id) {
      return res.status(400).json({ success: false, error: 'user_id and session_id are required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get user's LinkedIn profile
      const [users] = await connection.query(
        'SELECT linkedin_profile_id FROM users WHERE id = ?',
        [user_id]
      );

      if (users.length === 0 || !users[0].linkedin_profile_id) {
        return res.status(404).json({ success: false, error: 'User profile not found' });
      }

      const userProfileId = users[0].linkedin_profile_id;

      // Get user's work history - ONLY current + 1 previous company
      const [userWorkHistory] = await connection.query(`
        SELECT company_name, worked_from, worked_to, is_current
        FROM company_connections 
        WHERE profile_id = ?
        ORDER BY is_current DESC, worked_to DESC
        LIMIT 2
      `, [userProfileId]);

      if (userWorkHistory.length === 0) {
        return res.status(400).json({ success: false, error: 'No work history found for user' });
      }

      // Get already assigned/reviewed/skipped colleagues
      const [existingAssignments] = await connection.query(`
        SELECT colleague_id FROM review_assignments WHERE user_id = ?
      `, [user_id]);

      const excludeIds = existingAssignments.map(a => a.colleague_id);
      excludeIds.push(userProfileId); // Exclude self

      // Find colleagues who worked at the same companies
      const companyNames = userWorkHistory.map(w => w.company_name);
      
      let colleagueQuery = `
        SELECT DISTINCT 
          lp.id,
          lp.name,
          lp.avatar,
          lp.position,
          lp.current_company_name,
          cc.company_name,
          cc.worked_from,
          cc.worked_to,
          cc.is_current
        FROM linkedin_profiles lp
        JOIN company_connections cc ON cc.profile_id = lp.id
        WHERE cc.company_name IN (?)
          AND lp.id != ?
      `;

      const queryParams = [companyNames, userProfileId];

      if (excludeIds.length > 1) {
        colleagueQuery += ` AND lp.id NOT IN (?)`;
        queryParams.push(excludeIds);
      }

      colleagueQuery += ` LIMIT 50`; // Get more to filter by overlap

      const [potentialColleagues] = await connection.query(colleagueQuery, queryParams);

      // Filter by 3+ months time overlap
      const colleaguesWithOverlap = potentialColleagues.filter(colleague => {
        const userCompany = userWorkHistory.find(w => w.company_name === colleague.company_name);
        if (!userCompany) return false;
        
        const overlapMonths = calculateTimeOverlap(
          userCompany.worked_from, userCompany.worked_to, userCompany.is_current,
          colleague.worked_from, colleague.worked_to, colleague.is_current
        );
        colleague.overlap_months = overlapMonths;
        return overlapMonths >= 3;
      });

      if (colleaguesWithOverlap.length === 0) {
        return res.json({
          success: true,
          colleague: null,
          message: 'No more colleagues to review with sufficient time overlap'
        });
      }

      // Score and rank colleagues by overlap months (most overlap first)
      const scoredColleagues = colleaguesWithOverlap.map(colleague => {
        const userCompany = userWorkHistory.find(w => w.company_name === colleague.company_name);
        const companyContext = (colleague.is_current && userCompany?.is_current) ? 'current' : 'previous';
        
        return {
          ...colleague,
          match_score: colleague.overlap_months, // Score = overlap months
          company_context: companyContext
        };
      });

      // Sort by overlap months (most overlap first)
      scoredColleagues.sort((a, b) => b.match_score - a.match_score);
      const selectedColleague = scoredColleagues[0];

      // Create assignment record
      await connection.query(`
        INSERT INTO review_assignments 
        (session_id, user_id, colleague_id, company_name, company_context, match_score, status)
        VALUES (?, ?, ?, ?, ?, ?, 'assigned')
        ON DUPLICATE KEY UPDATE 
          session_id = VALUES(session_id),
          status = 'assigned',
          assigned_at = CURRENT_TIMESTAMP
      `, [
        session_id,
        user_id,
        selectedColleague.id,
        selectedColleague.company_name,
        selectedColleague.company_context,
        selectedColleague.match_score
      ]);

      res.json({
        success: true,
        colleague: {
          id: selectedColleague.id,
          name: selectedColleague.name,
          avatar: selectedColleague.avatar,
          position: selectedColleague.position,
          current_company: selectedColleague.current_company_name,
          shared_company: selectedColleague.company_name,
          company_context: selectedColleague.company_context,
          match_score: selectedColleague.match_score
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get next colleague error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 18. POST /api/colleague/skip - Use a skip
// ============================================================================
router.post('/colleague/skip', async (req, res) => {
  try {
    const { user_id, session_id, colleague_id } = req.body;

    if (!user_id || !session_id || !colleague_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, session_id, and colleague_id are required' 
      });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get session info
      const [sessions] = await connection.query(
        'SELECT skip_budget, skips_used FROM review_sessions WHERE id = ? AND user_id = ? AND status = "active"',
        [session_id, user_id]
      );

      if (sessions.length === 0) {
        return res.status(404).json({ success: false, error: 'Active session not found' });
      }

      const session = sessions[0];
      const skipsRemaining = session.skip_budget - session.skips_used;

      if (skipsRemaining <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'No skips remaining',
          skips_remaining: 0
        });
      }

      // Update assignment status to skipped
      await connection.query(`
        UPDATE review_assignments 
        SET status = 'skipped', actioned_at = CURRENT_TIMESTAMP
        WHERE user_id = ? AND colleague_id = ?
      `, [user_id, colleague_id]);

      // Increment skips used
      await connection.query(`
        UPDATE review_sessions 
        SET skips_used = skips_used + 1
        WHERE id = ?
      `, [session_id]);

      res.json({
        success: true,
        message: 'Colleague skipped',
        skips_remaining: skipsRemaining - 1
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Skip colleague error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 19. POST /api/review/submit - Save a review
// ============================================================================
router.post('/review/submit', async (req, res) => {
  try {
    const { 
      user_id, 
      session_id, 
      colleague_id,
      company_name,
      interaction_type,
      technical_rating,
      communication_rating,
      teamwork_rating,
      leadership_rating,
      feedback
    } = req.body;

    // Validate required fields
    if (!user_id || !session_id || !colleague_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, session_id, and colleague_id are required' 
      });
    }

    // Validate ratings (1-5 scale)
    const ratings = [technical_rating, communication_rating, teamwork_rating, leadership_rating];
    for (const rating of ratings) {
      if (rating !== undefined && (rating < 1 || rating > 5)) {
        return res.status(400).json({ 
          success: false, 
          error: 'Ratings must be between 1 and 5' 
        });
      }
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Check if review already exists
      const [existingReviews] = await connection.query(
        'SELECT id FROM reviews WHERE reviewer_id = ? AND reviewee_id = ?',
        [user_id, colleague_id]
      );

      if (existingReviews.length > 0) {
        return res.status(400).json({ 
          success: false, 
          error: 'You have already reviewed this colleague' 
        });
      }

      // Get assignment info
      const [assignments] = await connection.query(
        'SELECT id, company_context FROM review_assignments WHERE user_id = ? AND colleague_id = ?',
        [user_id, colleague_id]
      );

      const assignmentId = assignments.length > 0 ? assignments[0].id : null;
      const companyContext = assignments.length > 0 ? assignments[0].company_context : 'previous';

      // Create review
      const reviewId = uuidv4();
      await connection.query(`
        INSERT INTO reviews 
        (id, reviewer_id, reviewee_id, assignment_id, company_name, company_context, 
         interaction_type, technical_rating, communication_rating, teamwork_rating, 
         leadership_rating, feedback)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewId,
        user_id,
        colleague_id,
        assignmentId,
        company_name,
        companyContext,
        interaction_type || 'peer',
        technical_rating,
        communication_rating,
        teamwork_rating,
        leadership_rating,
        feedback || null
      ]);

      // Update assignment status
      if (assignmentId) {
        await connection.query(`
          UPDATE review_assignments 
          SET status = 'reviewed', actioned_at = CURRENT_TIMESTAMP
          WHERE id = ?
        `, [assignmentId]);
      }

      // Update session reviews count
      await connection.query(`
        UPDATE review_sessions 
        SET reviews_completed = reviews_completed + 1
        WHERE id = ?
      `, [session_id]);

      // Update user_scores for reviewer (reviews_given)
      await connection.query(`
        INSERT INTO user_scores (user_id, reviews_given)
        VALUES (?, 1)
        ON DUPLICATE KEY UPDATE reviews_given = reviews_given + 1
      `, [user_id]);

      // Update user_scores for reviewee (reviews_received)
      await connection.query(`
        INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received)
        VALUES ((SELECT id FROM users WHERE linkedin_profile_id = ? LIMIT 1), ?, 1)
        ON DUPLICATE KEY UPDATE reviews_received = reviews_received + 1
      `, [colleague_id, colleague_id]);

      // Check if reviewer has unlocked their score (3 reviews given)
      const [reviewerScore] = await connection.query(
        'SELECT reviews_given, score_unlocked FROM user_scores WHERE user_id = ?',
        [user_id]
      );

      let scoreUnlocked = false;
      if (reviewerScore.length > 0 && reviewerScore[0].reviews_given >= 3 && !reviewerScore[0].score_unlocked) {
        await connection.query(
          'UPDATE user_scores SET score_unlocked = TRUE WHERE user_id = ?',
          [user_id]
        );
        scoreUnlocked = true;
      }

      // Get updated session info
      const [updatedSession] = await connection.query(
        'SELECT reviews_completed, skip_budget, skips_used FROM review_sessions WHERE id = ?',
        [session_id]
      );

      res.json({
        success: true,
        message: 'Review submitted successfully',
        review_id: reviewId,
        reviews_completed: updatedSession[0]?.reviews_completed || 1,
        score_unlocked: scoreUnlocked,
        reviews_until_unlock: Math.max(0, 3 - (reviewerScore[0]?.reviews_given || 1))
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Submit review error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// 20. GET /api/score/me - Get my score
// ============================================================================
router.get('/score/me', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      // Get user score data
      const [scores] = await connection.query(`
        SELECT 
          us.*,
          (SELECT COUNT(*) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) as actual_reviews_received
        FROM user_scores us
        WHERE us.user_id = ?
      `, [user_id]);

      if (scores.length === 0) {
        return res.json({
          success: true,
          score: null,
          message: 'No score data yet. Start reviewing colleagues to build your profile!'
        });
      }

      const scoreData = scores[0];

      // Check if score is unlocked
      if (!scoreData.score_unlocked) {
        return res.json({
          success: true,
          score_unlocked: false,
          reviews_given: scoreData.reviews_given,
          reviews_until_unlock: Math.max(0, 3 - scoreData.reviews_given),
          message: `Review ${Math.max(0, 3 - scoreData.reviews_given)} more colleagues to unlock your score`
        });
      }

      // Calculate score if not cached or outdated
      const [reviews] = await connection.query(`
        SELECT 
          technical_rating,
          communication_rating,
          teamwork_rating,
          leadership_rating,
          created_at
        FROM reviews 
        WHERE reviewee_id = ?
      `, [scoreData.linkedin_profile_id]);

      if (reviews.length === 0) {
        return res.json({
          success: true,
          score_unlocked: true,
          reviews_received: 0,
          reviews_given: scoreData.reviews_given,
          message: 'Your score is unlocked but you have not received any reviews yet'
        });
      }

      // Calculate weighted averages
      let technicalSum = 0, communicationSum = 0, teamworkSum = 0, leadershipSum = 0;
      let count = 0;

      for (const review of reviews) {
        technicalSum += review.technical_rating || 0;
        communicationSum += review.communication_rating || 0;
        teamworkSum += review.teamwork_rating || 0;
        leadershipSum += review.leadership_rating || 0;
        count++;
      }

      const technicalAvg = count > 0 ? technicalSum / count : 0;
      const communicationAvg = count > 0 ? communicationSum / count : 0;
      const teamworkAvg = count > 0 ? teamworkSum / count : 0;
      const leadershipAvg = count > 0 ? leadershipSum / count : 0;

      // Weighted overall score
      const overallScore = (
        technicalAvg * 0.30 +
        communicationAvg * 0.25 +
        teamworkAvg * 0.25 +
        leadershipAvg * 0.20
      );

      // Convert to display score (0-100)
      const displayScore = Math.round((overallScore / 5) * 100);

      // Determine badge
      let badge = 'none';
      if (count >= 10) badge = 'verified';
      else if (count >= 5) badge = 'reliable';
      else if (count >= 3) badge = 'preliminary';

      // Update cached scores
      await connection.query(`
        UPDATE user_scores SET
          overall_score = ?,
          display_score = ?,
          technical_avg = ?,
          communication_avg = ?,
          teamwork_avg = ?,
          leadership_avg = ?,
          reviews_received = ?,
          badge = ?,
          last_calculated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        overallScore.toFixed(2),
        displayScore,
        technicalAvg.toFixed(2),
        communicationAvg.toFixed(2),
        teamworkAvg.toFixed(2),
        leadershipAvg.toFixed(2),
        count,
        badge,
        user_id
      ]);

      res.json({
        success: true,
        score_unlocked: true,
        score: {
          overall: overallScore.toFixed(2),
          display: displayScore,
          technical: technicalAvg.toFixed(2),
          communication: communicationAvg.toFixed(2),
          teamwork: teamworkAvg.toFixed(2),
          leadership: leadershipAvg.toFixed(2)
        },
        reviews_received: count,
        reviews_given: scoreData.reviews_given,
        badge: badge,
        badge_progress: {
          current: badge,
          next: badge === 'verified' ? null : (badge === 'reliable' ? 'verified' : (badge === 'preliminary' ? 'reliable' : 'preliminary')),
          reviews_needed: badge === 'verified' ? 0 : (badge === 'reliable' ? 10 - count : (badge === 'preliminary' ? 5 - count : 3 - count))
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get score error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
