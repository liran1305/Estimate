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
    // Better handling for profiles with missing dates
    // If both are current employees at the same company, assume significant overlap
    if (userIsCurrent && colleagueIsCurrent) return 24; // Assume 2 years overlap
    // If one is current and one has dates, assume moderate overlap
    if (userIsCurrent || colleagueIsCurrent) return 12; // Assume 1 year overlap
    // If neither has dates, assume minimal overlap
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

      // Calculate base skip budget based on largest company size
      // Formula: 3 base + 1 per 100 employees (max 13)
      let baseSkipBudget = 3; // Minimum
      
      for (const company of workHistory) {
        // Try to get company size from companies table
        const [companyData] = await connection.query(
          'SELECT employee_count FROM companies WHERE name = ? LIMIT 1',
          [company.company_name]
        );

        if (companyData.length > 0 && companyData[0].employee_count) {
          const employeeCount = companyData[0].employee_count;
          // Calculate skips: 3 base + 1 per 100 employees, max 13
          const companySkips = Math.min(3 + Math.floor(employeeCount / 100), 13);
          baseSkipBudget = Math.max(baseSkipBudget, companySkips);
        }
      }

      // Check if user exhausted all skips in last session
      const [lastSession] = await connection.query(`
        SELECT skip_budget, skips_used 
        FROM review_sessions 
        WHERE user_id = ? AND status IN ('expired', 'completed')
        ORDER BY started_at DESC 
        LIMIT 1
      `, [user_id]);

      let skipBudget = baseSkipBudget;
      
      // If last session exhausted all skips, add +3 refresh
      if (lastSession.length > 0 && lastSession[0].skips_used >= lastSession[0].skip_budget) {
        skipBudget = 3; // Daily refresh: always 3 skips
      }
      // Otherwise, user keeps their base skip budget (didn't exhaust last session)

      // Check for abuse: users who exhaust all skips 3 days in a row
      const [recentSessions] = await connection.query(`
        SELECT started_at, skip_budget, skips_used 
        FROM review_sessions 
        WHERE user_id = ? AND status IN ('expired', 'completed')
        ORDER BY started_at DESC 
        LIMIT 3
      `, [user_id]);

      // Check if last 3 sessions all had exhausted skips
      if (recentSessions.length >= 3) {
        const allExhausted = recentSessions.every(s => s.skips_used >= s.skip_budget);
        const allConsecutiveDays = recentSessions.every((s, i) => {
          if (i === 0) return true;
          const prevDate = new Date(recentSessions[i-1].started_at);
          const currDate = new Date(s.started_at);
          const daysDiff = Math.floor((prevDate - currDate) / (24 * 60 * 60 * 1000));
          return daysDiff <= 2; // Allow up to 2 days gap
        });

        if (allExhausted && allConsecutiveDays) {
          // Block user for abuse
          await connection.query(
            'UPDATE users SET is_blocked = TRUE, blocked_reason = ?, blocked_at = CURRENT_TIMESTAMP WHERE id = ?',
            ['Excessive skip usage without submitting reviews', user_id]
          );
          return res.status(403).json({
            success: false,
            error: 'account_blocked',
            message: 'Your account has been temporarily blocked due to excessive skip usage. Please contact support@estimatenow.io to resolve this.'
          });
        }
      }

      // Check for existing active session
      const [existingSessions] = await connection.query(
        'SELECT id, skip_budget, skips_used, reviews_completed, started_at FROM review_sessions WHERE user_id = ? AND status = "active"',
        [user_id]
      );

      if (existingSessions.length > 0) {
        const session = existingSessions[0];
        
        // Check if session is older than 24 hours
        const sessionAge = Date.now() - new Date(session.started_at).getTime();
        const twentyFourHours = 24 * 60 * 60 * 1000;
        
        if (sessionAge > twentyFourHours) {
          // Check if user exhausted all skips before expiring
          if (session.skips_used >= session.skip_budget) {
            // Mark as completed (exhausted skips)
            await connection.query(
              'UPDATE review_sessions SET status = "completed" WHERE id = ?',
              [session.id]
            );
          } else {
            // Mark as abandoned (didn't use all skips)
            await connection.query(
              'UPDATE review_sessions SET status = "abandoned" WHERE id = ?',
              [session.id]
            );
          }
          // Continue to create new session below
        } else {
          // Return existing session (less than 24 hours old)
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

      // Check if there's already a pending assignment for THIS session (keeps same colleague on refresh)
      const [pendingAssignments] = await connection.query(`
        SELECT colleague_id FROM review_assignments 
        WHERE user_id = ? AND session_id = ? AND status = 'pending'
        LIMIT 1
      `, [user_id, session_id]);

      // If there's a pending assignment, return that colleague
      if (pendingAssignments.length > 0) {
        const pendingColleagueId = pendingAssignments[0].colleague_id;
        const [colleagueData] = await connection.query(`
          SELECT 
            lp.id,
            lp.name,
            lp.avatar,
            lp.position,
            lp.current_company_name,
            cc.company_name
          FROM linkedin_profiles lp
          JOIN company_connections cc ON cc.profile_id = lp.id
          WHERE lp.id = ?
          LIMIT 1
        `, [pendingColleagueId]);

        if (colleagueData.length > 0) {
          const colleague = colleagueData[0];
          return res.json({
            success: true,
            colleague: {
              id: colleague.id,
              name: colleague.name,
              avatar: colleague.avatar,
              position: colleague.position,
              current_company: colleague.current_company_name,
              shared_company: colleague.company_name,
              company_context: 'Same company',
              match_score: 1.0
            }
          });
        }
      }

      // Get skip counts for each colleague
      // Exclude: reviewed colleagues and colleagues skipped 2+ times
      // Include: never-skipped and once-skipped colleagues
      const [existingAssignments] = await connection.query(`
        SELECT 
          colleague_id,
          status,
          COALESCE(skip_count, 0) as skip_count
        FROM review_assignments 
        WHERE user_id = ?
      `, [user_id]);

      // Exclude reviewed colleagues and colleagues skipped 2+ times
      const excludeIds = existingAssignments
        .filter(a => a.status === 'reviewed' || a.skip_count >= 2)
        .map(a => a.colleague_id);
      excludeIds.push(userProfileId); // Exclude self
      
      // Track once-skipped colleagues for deprioritization
      const onceSkippedIds = existingAssignments
        .filter(a => a.status === 'skipped' && a.skip_count === 1)
        .map(a => a.colleague_id);

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

      colleagueQuery += ` ORDER BY cc.is_current DESC, cc.worked_to DESC LIMIT 50`; // Prioritize current and most recent shared companies

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

      // Get review counts for each colleague to prioritize those with 1-2 reviews
      const colleagueIds = colleaguesWithOverlap.map(c => c.id);
      const [reviewCounts] = await connection.query(`
        SELECT 
          lp.id as colleague_id,
          COALESCE(us.reviews_given, 0) as reviews_given
        FROM linkedin_profiles lp
        LEFT JOIN users u ON u.linkedin_profile_id = lp.id
        LEFT JOIN user_scores us ON us.user_id = u.id
        WHERE lp.id IN (?)
      `, [colleagueIds]);

      const reviewCountMap = {};
      reviewCounts.forEach(rc => {
        reviewCountMap[rc.colleague_id] = rc.reviews_given;
      });

      // Score and rank colleagues by overlap months (most overlap first)
      const scoredColleagues = colleaguesWithOverlap.map(colleague => {
        const userCompany = userWorkHistory.find(w => w.company_name === colleague.company_name);
        const companyContext = (colleague.is_current && userCompany?.is_current) ? 'current' : 'previous';
        const reviewsGiven = reviewCountMap[colleague.id] || 0;
        
        return {
          ...colleague,
          match_score: colleague.overlap_months, // Score = overlap months
          company_context: companyContext,
          reviews_given: reviewsGiven
        };
      });

      // Sort by priority:
      // 1. Colleagues with 1-2 reviews (help them complete 3 reviews) - HIGHEST PRIORITY
      // 2. Never-skipped colleagues
      // 3. Once-skipped colleagues (lower priority, get second chance)
      // Within each group, randomize to avoid showing same order
      const needsCompletion = scoredColleagues.filter(c => c.reviews_given >= 1 && c.reviews_given <= 2 && !onceSkippedIds.includes(c.id));
      const neverSkipped = scoredColleagues.filter(c => (c.reviews_given === 0 || c.reviews_given >= 3) && !onceSkippedIds.includes(c.id));
      const onceSkipped = scoredColleagues.filter(c => onceSkippedIds.includes(c.id));
      
      // Randomize within each priority group
      const shuffleArray = (array) => {
        for (let i = array.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
      };
      
      const shuffledNeedsCompletion = shuffleArray([...needsCompletion]);
      const shuffledNeverSkipped = shuffleArray([...neverSkipped]);
      const shuffledOnceSkipped = shuffleArray([...onceSkipped]);
      
      // Prioritize: 1-2 reviews > never-skipped > once-skipped
      const prioritizedColleagues = [...shuffledNeedsCompletion, ...shuffledNeverSkipped, ...shuffledOnceSkipped];
      const selectedColleague = prioritizedColleagues[0];

      // Create assignment record with 'pending' status (so refresh returns same colleague)
      await connection.query(`
        INSERT INTO review_assignments 
        (session_id, user_id, colleague_id, company_name, company_context, match_score, status)
        VALUES (?, ?, ?, ?, ?, ?, 'pending')
        ON DUPLICATE KEY UPDATE 
          session_id = VALUES(session_id),
          status = 'pending',
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

      // Create or update assignment status to skipped and increment skip_count
      await connection.query(`
        INSERT INTO review_assignments 
        (session_id, user_id, colleague_id, status, skip_count, actioned_at)
        VALUES (?, ?, ?, 'skipped', 1, CURRENT_TIMESTAMP)
        ON DUPLICATE KEY UPDATE 
          status = 'skipped',
          skip_count = skip_count + 1,
          actioned_at = CURRENT_TIMESTAMP
      `, [session_id, user_id, colleague_id]);

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
      // Dynamic scores object (contains all relationship-specific scores)
      scores,
      // Qualitative data
      strength_tags, // Array of up to 3 tags
      would_work_again, // 1-5 scale
      would_promote, // 1-4 scale (only for direct_report)
      optional_comment
    } = req.body;

    // Validate required fields
    if (!user_id || !session_id || !colleague_id) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, session_id, and colleague_id are required' 
      });
    }

    // Validate scores object (1-10 scale for new structure)
    if (scores && typeof scores === 'object') {
      for (const [key, value] of Object.entries(scores)) {
        if (value !== null && value !== undefined && (value < 1 || value > 10)) {
          return res.status(400).json({ 
            success: false, 
            error: 'Scores must be between 1 and 10' 
          });
        }
      }
    }
    
    // Validate would_work_again (1-5 scale)
    if (would_work_again && (would_work_again < 1 || would_work_again > 5)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Would work again rating must be between 1 and 5' 
      });
    }
    
    // Validate would_promote (1-4 scale)
    if (would_promote && (would_promote < 1 || would_promote > 4)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Would promote rating must be between 1 and 4' 
      });
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

      // Map old frontend values to new database ENUM values (temporary until frontend redeploys)
      const interactionTypeMap = {
        'direct': 'peer',
        'departmental': 'cross_team',
        'general': 'other'
      };
      const mappedInteractionType = interactionTypeMap[interaction_type] || interaction_type || 'peer';

      // Calculate weighted overall score
      const relationshipWeights = {
        peer: 1.0,
        manager: 0.9,
        direct_report: 1.2,
        cross_team: 0.8,
        other: 0.5
      };

      const questionWeights = {
        reliability: 1.2,
        receptive_feedback: 1.2
      };

      // Calculate average score from all provided scores
      let totalWeightedScore = 0;
      let totalWeight = 0;

      Object.entries(scores || {}).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          const weight = questionWeights[key] || 1.0;
          totalWeightedScore += value * weight;
          totalWeight += weight;
        }
      });

      // Add work_again score with heavy weight (1.5x)
      if (would_work_again) {
        totalWeightedScore += (would_work_again * 2) * 1.5; // Scale to 10 and apply weight
        totalWeight += 1.5;
      }

      // Add would_promote score if applicable (1.3x weight)
      if (would_promote) {
        totalWeightedScore += ((would_promote / 4) * 10) * 1.3; // Scale to 10 and apply weight
        totalWeight += 1.3;
      }

      // Calculate base score
      const baseScore = totalWeight > 0 ? totalWeightedScore / totalWeight : 0;
      
      // Apply relationship weight
      const relationshipWeight = relationshipWeights[mappedInteractionType] || 1.0;
      const overall_score = baseScore * relationshipWeight;

      // Create review with dynamic structure
      const reviewId = uuidv4();
      await connection.query(`
        INSERT INTO reviews 
        (id, reviewer_id, reviewee_id, assignment_id, company_name, company_context, 
         interaction_type, scores, strength_tags, would_work_again, would_promote,
         optional_comment, overall_score)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        reviewId,
        user_id,
        colleague_id,
        assignmentId,
        company_name,
        companyContext,
        mappedInteractionType,
        JSON.stringify(scores || {}),
        JSON.stringify(strength_tags || []),
        would_work_again,
        would_promote || null,
        optional_comment || null,
        overall_score
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

      // Update user_scores for reviewee (reviews_received) - only if they have a user account
      const [revieweeUser] = await connection.query(
        'SELECT id FROM users WHERE linkedin_profile_id = ? LIMIT 1',
        [colleague_id]
      );
      
      if (revieweeUser.length > 0) {
        await connection.query(`
          INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received)
          VALUES (?, ?, 1)
          ON DUPLICATE KEY UPDATE reviews_received = reviews_received + 1
        `, [revieweeUser[0].id, colleague_id]);
      }

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

// ============================================================================
// POST /api/review/polish-comment - AI grammar polish for optional comments
// ============================================================================
router.post('/review/polish-comment', async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Comment is required' });
    }

    // Use OpenAI API to polish the comment
    const openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!openaiApiKey) {
      // Fallback: basic grammar fixes without AI
      const polished = comment
        .trim()
        .replace(/\s+/g, ' ') // Remove extra spaces
        .replace(/([.!?])\s*([a-z])/g, (match, p1, p2) => `${p1} ${p2.toUpperCase()}`) // Capitalize after punctuation
        .replace(/^[a-z]/, (match) => match.toUpperCase()); // Capitalize first letter
      
      return res.json({ success: true, polished });
    }

    // Call OpenAI API for grammar polishing
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${openaiApiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Fix ONLY spelling errors and basic grammar mistakes. Do NOT reword, rephrase, or change the sentence structure. Keep the original wording and style. Only fix: spelling mistakes, missing articles (a/an/the), capitalization, and obvious typos. Return ONLY the corrected text with minimal changes.'
          },
          {
            role: 'user',
            content: comment
          }
        ],
        temperature: 0.2,
        max_tokens: 100
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      console.error('OpenAI API error:', data);
      // Fallback to basic polish
      const polished = comment.trim();
      return res.json({ success: true, polished });
    }

    const polished = data.choices[0].message.content.trim();
    
    res.json({ success: true, polished });

  } catch (error) {
    console.error('Polish comment error:', error);
    // Return original comment on error
    res.json({ success: true, polished: req.body.comment.trim() });
  }
});

module.exports = router;
