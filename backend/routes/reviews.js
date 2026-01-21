const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');
const { v4: uuidv4 } = require('uuid');
const { 
  calculatePercentileTier, 
  getDefaultAverages, 
  getCategoryAverage,
  normalizeJobTitle,
  getDisplayNameForRole,
  DEFAULT_CATEGORY_AVERAGES
} = require('../utils/jobTitlesSystem');

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
// GET /api/user/stats - Get user's review statistics
// ============================================================================
router.get('/user/stats', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = await getPool();
    const connection = await pool.getConnection();

    try {
      const [userStats] = await connection.query(
        'SELECT reviews_given FROM user_scores WHERE user_id = ?',
        [user_id]
      );

      if (userStats.length === 0) {
        return res.json({ success: true, reviews_given: 0 });
      }

      res.json({
        success: true,
        reviews_given: userStats[0].reviews_given || 0
      });
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get user stats error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

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
      // Formula: 3 base + 1 per 100 employees (max 30 for 3000+ employees)
      let baseSkipBudget = 3; // Minimum
      
      for (const company of workHistory) {
        // Try to get company size from companies table (uses employees_in_db)
        const [companyData] = await connection.query(
          'SELECT employees_in_db, skip_allowance FROM companies WHERE name = ? LIMIT 1',
          [company.company_name]
        );

        if (companyData.length > 0 && companyData[0].skip_allowance) {
          // Use pre-calculated skip_allowance from companies table
          baseSkipBudget = Math.max(baseSkipBudget, companyData[0].skip_allowance);
        } else if (companyData.length > 0 && companyData[0].employees_in_db) {
          // Fallback: Calculate if skip_allowance not set
          const employeeCount = companyData[0].employees_in_db;
          const companySkips = Math.min(3 + Math.floor(employeeCount / 100), 30);
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

      // Get user's work history - up to 4 companies (current + 3 previous)
      // We'll filter to only use companies that have colleagues in the database
      const [allWorkHistory] = await connection.query(`
        SELECT company_name, worked_from, worked_to, is_current
        FROM company_connections 
        WHERE profile_id = ?
        ORDER BY is_current DESC, worked_to DESC
        LIMIT 4
      `, [userProfileId]);

      if (allWorkHistory.length === 0) {
        return res.status(400).json({ success: false, error: 'No work history found for user' });
      }

      // Filter previous companies to only include those within 2 years
      const twoYearsAgo = new Date();
      twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
      
      const parseEndDate = (dateStr) => {
        if (!dateStr || dateStr === 'Present') return new Date();
        const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
        const parts = dateStr.toLowerCase().split(' ');
        let year, month = 11;
        if (parts.length === 2) {
          const monthIndex = monthNames.findIndex(m => parts[0].startsWith(m));
          month = monthIndex >= 0 ? monthIndex : 11;
          year = parseInt(parts[1]);
        } else if (parts.length === 1) {
          year = parseInt(parts[0]);
        }
        if (isNaN(year)) return new Date();
        return new Date(year, month, 28);
      };
      
      const recentWorkHistory = allWorkHistory.filter(company => {
        if (company.is_current) return true;
        const endDate = parseEndDate(company.worked_to);
        return endDate >= twoYearsAgo;
      });

      // Check which companies have colleagues in the database
      const companyNamesAll = recentWorkHistory.map(w => w.company_name);
      const [companiesWithColleagues] = await connection.query(`
        SELECT cc.company_name, COUNT(DISTINCT cc.profile_id) as colleague_count
        FROM company_connections cc
        WHERE cc.company_name IN (?)
          AND cc.profile_id != ?
        GROUP BY cc.company_name
        HAVING colleague_count > 0
      `, [companyNamesAll, userProfileId]);

      const companiesWithColleaguesSet = new Set(companiesWithColleagues.map(c => c.company_name));
      
      // Filter to only companies that have colleagues
      const userWorkHistory = recentWorkHistory.filter(company => 
        companiesWithColleaguesSet.has(company.company_name)
      );

      if (userWorkHistory.length === 0) {
        return res.json({
          success: true,
          colleague: null,
          message: 'No colleagues found at your recent companies (within 2 years)'
        });
      }

      console.log(`User ${user_id}: Found ${userWorkHistory.length} companies with colleagues: ${userWorkHistory.map(w => w.company_name).join(', ')}`);

      // Check if there's already a pending assignment for this USER (persists across sessions/devices)
      // This ensures the same colleague is shown until they're skipped or reviewed
      console.log(`[COLLEAGUE FETCH] User ${user_id}, Session ${session_id}: Checking for existing assigned colleague...`);
      
      const [pendingAssignments] = await connection.query(`
        SELECT colleague_id, session_id as original_session_id, company_name, company_context, match_score 
        FROM review_assignments 
        WHERE user_id = ? AND status = 'assigned'
        LIMIT 1
      `, [user_id]);

      console.log(`[COLLEAGUE FETCH] Found ${pendingAssignments.length} pending assignments for user ${user_id}`);
      if (pendingAssignments.length > 0) {
        console.log(`[COLLEAGUE FETCH] Pending assignment details:`, JSON.stringify(pendingAssignments[0]));
      }

      // If there's a pending assignment, return that colleague
      if (pendingAssignments.length > 0) {
        const pendingColleagueId = pendingAssignments[0].colleague_id;
        const originalSessionId = pendingAssignments[0].original_session_id;
        const savedCompanyContext = pendingAssignments[0].company_context;
        const savedMatchScore = pendingAssignments[0].match_score;
        
        // Update the session_id if user is on a different session (different device/reload)
        if (originalSessionId !== session_id) {
          await connection.query(`
            UPDATE review_assignments 
            SET session_id = ?
            WHERE user_id = ? AND colleague_id = ? AND status = 'assigned'
          `, [session_id, user_id, pendingColleagueId]);
          console.log(`User ${user_id}: Updated pending assignment session from ${originalSessionId} to ${session_id}`);
        }
        
        // Get the saved company_name from the assignment (this is the shared company)
        const savedCompanyName = pendingAssignments[0].company_name;
        
        const [colleagueData] = await connection.query(`
          SELECT 
            lp.id,
            lp.name,
            lp.avatar,
            lp.position,
            lp.current_company_name
          FROM linkedin_profiles lp
          WHERE lp.id = ?
          LIMIT 1
        `, [pendingColleagueId]);

        if (colleagueData.length > 0) {
          const colleague = colleagueData[0];
          console.log(`User ${user_id}: Returning existing pending colleague: ${colleague.name} from ${savedCompanyName}`);
          
          // Get per-company skip info using the saved company name from the assignment
          const companySkips = await getOrCreateCompanySkips(connection, user_id, savedCompanyName);
          
          return res.json({
            success: true,
            colleague: {
              id: colleague.id,
              name: colleague.name,
              avatar: colleague.avatar,
              position: colleague.position,
              current_company: colleague.current_company_name,
              shared_company: savedCompanyName,
              company_context: savedCompanyContext || 'Same company',
              match_score: savedMatchScore || 1.0
            },
            company_skips: {
              company_name: savedCompanyName,
              skips_remaining: companySkips.skips_remaining,
              initial_budget: companySkips.initial_budget,
              daily_refresh: companySkips.daily_refresh
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
      // Exclude non-workplace entries (self-employed, freelance, masked/redacted names, military 300+)
      const excludedCompanyPatterns = [
        'Self-employed', 'Self employed', 'Freelance', 'Freelancer',
        'Independent Consultant', 'Consultant', 'Independent',
        // Military organizations (300+ employees only)
        'Israel Defense Forces', 'Israeli Air Force', 'I.D.F', 'IDF',
        'Israeli Military Intelligence - Unit 8200', 'Israeli Military Intelligence',
        'IAF - Israeli Air Force', 'Unit 8200 - Israeli Intelligence Corps',
        'IDF - Israel Defense Forces', 'Israel Defense Forces - Military Intelligence'
      ];
      
      const companyNames = userWorkHistory
        .map(w => w.company_name)
        .filter(name => {
          // Exclude self-employed variants
          if (excludedCompanyPatterns.some(pattern => 
            name.toLowerCase().includes(pattern.toLowerCase())
          )) return false;
          // Exclude masked/redacted company names (only asterisks)
          if (/^\*+(\s+\*+)*$/.test(name)) return false;
          // Exclude very short names that are likely invalid
          if (name.length < 2) return false;
          return true;
        });
      
      if (companyNames.length === 0) {
        return res.json({
          success: true,
          colleague: null,
          message: 'No valid companies found in work history for colleague matching'
        });
      }
      
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
          AND cc.company_name NOT REGEXP '^\\\\*+( \\\\*+)*$'
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
        // Mark as 'current' if it's the user's current company (regardless of colleague's current status)
        const companyContext = userCompany?.is_current ? 'current' : 'previous';
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
      
      // ========== FILTER BY COMPANIES WITH AVAILABLE SKIPS ==========
      // Get unique companies from prioritized colleagues
      const uniqueCompanies = [...new Set(prioritizedColleagues.map(c => c.company_name))];
      
      // Check skip availability for each company
      const companySkipStatus = {};
      for (const companyName of uniqueCompanies) {
        const skipInfo = await getOrCreateCompanySkips(connection, user_id, companyName);
        companySkipStatus[companyName] = skipInfo;
      }
      
      // Filter colleagues to only include those from companies with skips remaining
      const colleaguesWithSkips = prioritizedColleagues.filter(c => 
        companySkipStatus[c.company_name]?.skips_remaining > 0
      );
      
      // If no colleagues have skips remaining, return no skips message
      if (colleaguesWithSkips.length === 0) {
        return res.json({
          success: true,
          colleague: null,
          message: 'No skips remaining for any company. Come back tomorrow for more skips!',
          all_companies_exhausted: true
        });
      }
      
      // ========== 70/30 WEIGHTED SELECTION: Current vs Previous Company ==========
      // 70% chance to select from current company, 30% from previous company
      const currentCompanyColleagues = colleaguesWithSkips.filter(c => c.company_context === 'current');
      const previousCompanyColleagues = colleaguesWithSkips.filter(c => c.company_context === 'previous');
      
      let selectedColleague;
      const random = Math.random();
      
      if (currentCompanyColleagues.length > 0 && previousCompanyColleagues.length > 0) {
        // Both current and previous colleagues available - use 70/30 weighting
        if (random < 0.7) {
          // 70% chance: Select from current company
          selectedColleague = currentCompanyColleagues[0];
        } else {
          // 30% chance: Select from previous company
          selectedColleague = previousCompanyColleagues[0];
        }
      } else if (currentCompanyColleagues.length > 0) {
        // Only current company colleagues available
        selectedColleague = currentCompanyColleagues[0];
      } else if (previousCompanyColleagues.length > 0) {
        // Only previous company colleagues available
        selectedColleague = previousCompanyColleagues[0];
      } else {
        // Fallback: Use first colleague with skips
        selectedColleague = colleaguesWithSkips[0];
      }

      // Create assignment record with 'assigned' status (so refresh returns same colleague)
      console.log(`[COLLEAGUE FETCH] Creating new assignment for user ${user_id}: colleague ${selectedColleague.id} (${selectedColleague.name})`);
      
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
      
      console.log(`[COLLEAGUE FETCH] Assignment created/updated successfully`);

      // Get per-company skip info for the selected colleague's company
      const companySkips = await getOrCreateCompanySkips(connection, user_id, selectedColleague.company_name);

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
        },
        company_skips: {
          company_name: selectedColleague.company_name,
          skips_remaining: companySkips.skips_remaining,
          initial_budget: companySkips.initial_budget,
          daily_refresh: companySkips.daily_refresh
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
// HELPER: Get or create user's per-company skip record with daily refresh
// ============================================================================
async function getOrCreateCompanySkips(connection, user_id, company_name) {
  // Get company info for skip calculations
  const [companyInfo] = await connection.query(
    'SELECT employees_in_db, skip_allowance, daily_refresh FROM companies WHERE name = ? LIMIT 1',
    [company_name]
  );
  
  // Calculate skip allowance based on company size
  let initialBudget = 3; // Default minimum
  let dailyRefresh = 3;  // Default for small companies
  
  if (companyInfo.length > 0 && companyInfo[0].employees_in_db) {
    const employees = companyInfo[0].employees_in_db;
    initialBudget = companyInfo[0].skip_allowance || Math.min(3 + Math.floor(employees / 100), 30);
    dailyRefresh = companyInfo[0].daily_refresh || (employees >= 1000 ? 5 : 3);
  }
  
  // Check if user already has a skip record for this company
  const [existingRecord] = await connection.query(
    'SELECT * FROM user_company_skips WHERE user_id = ? AND company_name = ?',
    [user_id, company_name]
  );
  
  const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
  
  if (existingRecord.length === 0) {
    // Create new record with initial budget
    await connection.query(`
      INSERT INTO user_company_skips (user_id, company_name, initial_budget, skips_used, daily_refresh, last_refresh_date)
      VALUES (?, ?, ?, 0, ?, ?)
    `, [user_id, company_name, initialBudget, dailyRefresh, today]);
    
    return {
      initial_budget: initialBudget,
      skips_used: 0,
      daily_refresh: dailyRefresh,
      skips_remaining: initialBudget,
      last_refresh_date: today
    };
  }
  
  const record = existingRecord[0];
  let skipsUsed = record.skips_used;
  let currentBudget = record.initial_budget;
  
  // Get the maximum cap for this company (skip_allowance)
  const maxCap = initialBudget; // This is the company's skip_allowance calculated above
  
  // Check if daily refresh should be applied
  if (record.last_refresh_date && record.last_refresh_date !== today) {
    // Calculate unused skips from previous period
    const unusedSkips = currentBudget - skipsUsed;
    
    // Calculate days since last refresh
    const daysSinceRefresh = Math.floor((new Date(today) - new Date(record.last_refresh_date)) / (24 * 60 * 60 * 1000));
    const refreshAmount = daysSinceRefresh * record.daily_refresh;
    
    // New budget = unused skips + daily refresh, but capped at company maximum
    const newBudget = Math.min(unusedSkips + refreshAmount, maxCap);
    
    // Update budget and reset skips_used counter for new period
    await connection.query(`
      UPDATE user_company_skips 
      SET initial_budget = ?, skips_used = 0, last_refresh_date = ?
      WHERE user_id = ? AND company_name = ?
    `, [newBudget, today, user_id, company_name]);
    
    currentBudget = newBudget;
    skipsUsed = 0; // Reset counter for new period
  }
  
  return {
    initial_budget: currentBudget,
    skips_used: skipsUsed,
    daily_refresh: record.daily_refresh,
    skips_remaining: currentBudget - skipsUsed,
    last_refresh_date: today,
    max_cap: maxCap // Include max cap for debugging/display
  };
}

// ============================================================================
// 18. POST /api/colleague/skip - Use a skip (Per-Company)
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
      // Get the colleague's shared company to determine which company's skips to use
      const [colleagueInfo] = await connection.query(`
        SELECT ra.company_name 
        FROM review_assignments ra
        WHERE ra.user_id = ? AND ra.colleague_id = ? AND ra.status = 'assigned'
        LIMIT 1
      `, [user_id, colleague_id]);

      if (colleagueInfo.length === 0) {
        return res.status(404).json({ success: false, error: 'No active assignment found for this colleague' });
      }

      const companyName = colleagueInfo[0].company_name;
      
      // Get per-company skip info (with daily refresh logic)
      const companySkips = await getOrCreateCompanySkips(connection, user_id, companyName);

      if (companySkips.skips_remaining <= 0) {
        return res.status(400).json({ 
          success: false, 
          error: `No skips remaining for ${companyName}`,
          skips_remaining: 0,
          company_name: companyName
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

      // Increment skips used for this company
      await connection.query(`
        UPDATE user_company_skips 
        SET skips_used = skips_used + 1
        WHERE user_id = ? AND company_name = ?
      `, [user_id, companyName]);

      res.json({
        success: true,
        message: 'Colleague skipped',
        skips_remaining: companySkips.skips_remaining - 1,
        company_name: companyName
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

    // ========== SERVER-SIDE LOCKOUT CHECK ==========
    const [userCheck] = await connection.query(
      'SELECT violation_count, last_violation_at, locked_until FROM users WHERE id = ?',
      [user_id]
    );

    if (userCheck.length > 0) {
      const user = userCheck[0];
      const now = new Date();

      // Check if user is locked out
      if (user.locked_until && new Date(user.locked_until) > now) {
        const remainingMs = new Date(user.locked_until) - now;
        const remainingHours = Math.ceil(remainingMs / (60 * 60 * 1000));
        connection.release();
        return res.status(403).json({
          success: false,
          error: 'locked_out',
          message: `You've been temporarily locked out due to multiple violations. Please try again in ${remainingHours} hours.`,
          remainingHours
        });
      }

      // Reset violation count if last violation was more than 24 hours ago
      if (user.last_violation_at) {
        const hoursSinceLastViolation = (now - new Date(user.last_violation_at)) / (60 * 60 * 1000);
        if (hoursSinceLastViolation > 24) {
          await connection.query(
            'UPDATE users SET violation_count = 0, last_violation_at = NULL, locked_until = NULL WHERE id = ?',
            [user_id]
          );
        }
      }
    }

    // ========== ABUSE DETECTION ==========
    let fraudFlags = [];
    let reviewWeight = 1.0; // Default weight
    let shouldRecordViolation = false;
    let violationType = null;
    
    // Check for suspicious patterns in scores
    if (scores && typeof scores === 'object') {
      const scoreValues = Object.values(scores).filter(s => s !== null && s !== undefined);
      
      if (scoreValues.length >= 3) {
        // Check if all scores are identical - BLOCKING VIOLATION
        const allIdentical = scoreValues.every(s => s === scoreValues[0]);
        if (allIdentical) {
          fraudFlags.push('all_identical_scores');
          reviewWeight = 0.3;
          shouldRecordViolation = true;
          violationType = 'all_identical_scores';
        }
        
        // Check for all extreme scores (all 9-10 or all 1-2)
        const allMax = scoreValues.every(s => s >= 9);
        const allMin = scoreValues.every(s => s <= 2);
        if (allMax || allMin) {
          fraudFlags.push(allMax ? 'all_max_scores' : 'all_min_scores');
          reviewWeight = Math.min(reviewWeight, 0.3);
        }
        
        // Check for low variance (all scores within 1 point)
        const min = Math.min(...scoreValues);
        const max = Math.max(...scoreValues);
        if (max - min <= 1 && scoreValues.length >= 4) {
          fraudFlags.push('low_variance');
          reviewWeight = Math.min(reviewWeight, 0.7);
        }
      }
    }
    
    // Time-based fraud detection - BLOCKING VIOLATION
    const timeSpentSeconds = req.body.time_spent_seconds;
    if (timeSpentSeconds !== undefined) {
      if (timeSpentSeconds < 15) {
        fraudFlags.push('too_fast');
        reviewWeight = Math.min(reviewWeight, 0.5);
        shouldRecordViolation = true;
        violationType = violationType || 'too_fast';
      } else if (timeSpentSeconds < 30) {
        fraudFlags.push('fast_review');
      }
    }
    
    console.log(`Review fraud check: flags=${JSON.stringify(fraudFlags)}, weight=${reviewWeight}, time=${timeSpentSeconds}s`);

    // Record violation if blocking pattern detected
    if (shouldRecordViolation && violationType) {
      await connection.query(
        'INSERT INTO user_violations (user_id, violation_type, review_session_id, time_spent_seconds) VALUES (?, ?, ?, ?)',
        [user_id, violationType, session_id, timeSpentSeconds]
      );

      const currentCount = userCheck.length > 0 ? (userCheck[0].violation_count || 0) : 0;
      const newCount = currentCount + 1;
      const now = new Date();
      let lockedUntil = null;

      if (newCount >= 3) {
        lockedUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
      }

      await connection.query(
        'UPDATE users SET violation_count = ?, last_violation_at = ?, locked_until = ? WHERE id = ?',
        [newCount, now, lockedUntil, user_id]
      );

      console.log(`Violation recorded for user ${user_id}: ${violationType}, count: ${newCount}`);
    }

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
      
      // Apply fraud detection weight (reduces impact of suspicious reviews)
      const finalWeight = relationshipWeight * reviewWeight;
      const overall_score = baseScore * finalWeight;

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

      // Update user_scores for reviewee (reviews_received) and recalculate overall_score
      const [revieweeUser] = await connection.query(
        'SELECT id FROM users WHERE linkedin_profile_id = ? LIMIT 1',
        [colleague_id]
      );
      
      if (revieweeUser.length > 0) {
        // User has an account - update their user_scores with correct count and score
        // Count ALL reviews from both tables using linkedin_profile_id
        const [reviewCount] = await connection.query(`
          SELECT 
            (SELECT COUNT(*) FROM reviews WHERE reviewee_id = ?) +
            (SELECT COUNT(*) FROM anonymous_reviews WHERE reviewee_id = ?) as total_reviews
        `, [colleague_id, colleague_id]);
        
        // Calculate average score from all reviews
        const [avgScore] = await connection.query(`
          SELECT AVG(score) as avg_score FROM (
            SELECT overall_score as score FROM reviews WHERE reviewee_id = ?
            UNION ALL
            SELECT overall_score as score FROM anonymous_reviews WHERE reviewee_id = ?
          ) as all_reviews
        `, [colleague_id, colleague_id]);
        
        const totalReviews = reviewCount[0]?.total_reviews || 1;
        const calculatedScore = avgScore[0]?.avg_score || overall_score;
        
        await connection.query(`
          INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received, overall_score)
          VALUES (?, ?, ?, ?)
          ON DUPLICATE KEY UPDATE 
            reviews_received = ?,
            overall_score = ?
        `, [revieweeUser[0].id, colleague_id, totalReviews, calculatedScore, totalReviews, calculatedScore]);
      } else {
        // User hasn't logged in yet - update linkedin_profiles.reviews_received_count
        // This tracks reviews for users before they create an account
        // When they sign up, we'll sync this to user_scores
        await connection.query(`
          UPDATE linkedin_profiles 
          SET reviews_received_count = COALESCE(reviews_received_count, 0) + 1
          WHERE id = ?
        `, [colleague_id]);
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

      // Return the reviews_given from user_scores (already fetched above)
      res.json({
        success: true,
        message: 'Review submitted successfully',
        review_id: reviewId,
        reviews_completed: reviewerScore[0]?.reviews_given || 1,
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
      // Get user score data with position from linkedin_profiles
      const [scores] = await connection.query(`
        SELECT 
          us.*,
          lp.position,
          (SELECT COUNT(*) FROM reviews WHERE reviewee_id = us.linkedin_profile_id) as actual_reviews_received
        FROM user_scores us
        LEFT JOIN linkedin_profiles lp ON us.linkedin_profile_id = lp.id
        WHERE us.user_id = ?
        LIMIT 1
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
          scores,
          overall_score,
          strength_tags,
          would_work_again,
          interaction_type,
          created_at
        FROM reviews 
        WHERE reviewee_id = ?
      `, [scoreData.linkedin_profile_id]);

      if (reviews.length === 0) {
        return res.json({
          success: true,
          score_unlocked: true,
          reviews_received: scoreData.reviews_received || 0,
          reviews_given: scoreData.reviews_given,
          message: 'Your score is unlocked but you have not received any reviews yet'
        });
      }

      // Calculate averages from new scores JSON field
      const scoreCategories = {};
      let overallSum = 0;
      let count = 0;
      
      // Aggregate strength tags with counts
      const strengthTagCounts = {};
      
      // Would work again aggregation with breakdown
      let wouldWorkAgainSum = 0;
      let wouldWorkAgainCount = 0;
      const wouldWorkAgainBreakdown = {
        'Absolutely': 0,  // 5
        'Gladly': 0,      // 4
        'Sure': 0,        // 3
        'Maybe': 0,       // 2
        'Prefer not': 0   // 1
      };
      
      // Reviewer breakdown by interaction type
      const reviewerBreakdown = {
        peer: 0,
        manager: 0,
        direct_report: 0,
        cross_team: 0,
        other: 0
      };

      for (const review of reviews) {
        // Use overall_score if available, otherwise calculate from scores JSON
        if (review.overall_score) {
          overallSum += parseFloat(review.overall_score);
          count++;
        }
        
        // Aggregate individual scores from JSON
        if (review.scores) {
          const scores = typeof review.scores === 'string' ? JSON.parse(review.scores) : review.scores;
          for (const [key, value] of Object.entries(scores)) {
            if (value !== null && value !== undefined) {
              if (!scoreCategories[key]) {
                scoreCategories[key] = { sum: 0, count: 0 };
              }
              scoreCategories[key].sum += parseFloat(value);
              scoreCategories[key].count++;
            }
          }
        }
        
        // Aggregate strength tags
        if (review.strength_tags) {
          const tags = typeof review.strength_tags === 'string' ? JSON.parse(review.strength_tags) : review.strength_tags;
          if (Array.isArray(tags)) {
            tags.forEach(tag => {
              strengthTagCounts[tag] = (strengthTagCounts[tag] || 0) + 1;
            });
          }
        }
        
        // Aggregate would_work_again (1-5 scale maps to verbal responses)
        if (review.would_work_again) {
          wouldWorkAgainSum += review.would_work_again >= 4 ? 1 : 0;
          wouldWorkAgainCount++;
          // Map 1-5 scale to verbal responses
          const wwaValue = parseInt(review.would_work_again);
          if (wwaValue === 5) wouldWorkAgainBreakdown['Absolutely']++;
          else if (wwaValue === 4) wouldWorkAgainBreakdown['Gladly']++;
          else if (wwaValue === 3) wouldWorkAgainBreakdown['Sure']++;
          else if (wwaValue === 2) wouldWorkAgainBreakdown['Maybe']++;
          else if (wwaValue === 1) wouldWorkAgainBreakdown['Prefer not']++;
        }
        
        // Count reviewer types
        if (review.interaction_type && reviewerBreakdown.hasOwnProperty(review.interaction_type)) {
          reviewerBreakdown[review.interaction_type]++;
        }
      }

      // Calculate category averages
      const categoryAverages = {};
      for (const [key, data] of Object.entries(scoreCategories)) {
        categoryAverages[key] = data.count > 0 ? (data.sum / data.count).toFixed(1) : 0;
      }

      // Calculate overall score (0-10 scale)
      const overallScore = count > 0 ? overallSum / count : 0;

      // Convert to display score (0-100 scale)
      const displayScore = Math.round((overallScore / 10) * 100);

      // Determine badge
      let badge = 'none';
      if (count >= 10) badge = 'verified';
      else if (count >= 5) badge = 'reliable';
      else if (count >= 3) badge = 'preliminary';

      // Update cached scores (only update fields that exist)
      await connection.query(`
        UPDATE user_scores SET
          overall_score = ?,
          reviews_received = ?,
          badge = ?,
          last_calculated = CURRENT_TIMESTAMP
        WHERE user_id = ?
      `, [
        overallScore.toFixed(2),
        count,
        badge,
        user_id
      ]);

      // Sort strength tags by count and get top ones with counts
      const sortedStrengthTags = Object.entries(strengthTagCounts)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([tag, tagCount]) => ({ tag, count: tagCount }));
      
      // Calculate would work again percentage
      const wouldWorkAgainPercent = wouldWorkAgainCount > 0 
        ? Math.round((wouldWorkAgainSum / wouldWorkAgainCount) * 100) 
        : 0;

      // Calculate percentile tier based on overall score
      const percentileTier = calculatePercentileTier(overallScore);
      
      // Get user's position/role for display - normalize to canonical job title
      const rawPosition = scoreData.position || 'Professional';
      const normalizedRole = normalizeJobTitle(rawPosition);
      // Use canonical title (e.g., "Product Manager") not the raw title (e.g., "Senior AI/AdTech Product Manager")
      const canonicalPosition = normalizedRole ? normalizedRole.canonical : rawPosition;
      const roleDisplayName = normalizedRole ? normalizedRole.displayName : getDisplayNameForRole(rawPosition);

      res.json({
        success: true,
        score_unlocked: true,
        score: {
          overall: overallScore.toFixed(1),  // Return 0-10 scale for display
          display: displayScore,
          ...categoryAverages
        },
        reviews_received: count,
        reviews_given: scoreData.reviews_given,
        badge: badge,
        badge_progress: {
          current: badge,
          next: badge === 'verified' ? null : (badge === 'reliable' ? 'verified' : (badge === 'preliminary' ? 'reliable' : 'preliminary')),
          reviews_needed: badge === 'verified' ? 0 : (badge === 'reliable' ? 10 - count : (badge === 'preliminary' ? 5 - count : 3 - count))
        },
        strength_tags: sortedStrengthTags,
        would_work_again: {
          percent: wouldWorkAgainPercent,
          yes_count: wouldWorkAgainSum,
          total_count: wouldWorkAgainCount,
          breakdown: wouldWorkAgainBreakdown
        },
        reviewer_breakdown: reviewerBreakdown,
        // New: Percentile tier information
        percentile: {
          tier: percentileTier.tier,
          badge: percentileTier.badge,
          color: percentileTier.color,
          emoji: percentileTier.emoji,
          usingDefaults: percentileTier.usingDefaults || false
        },
        // New: Category averages for comparison (cold start defaults)
        category_averages: DEFAULT_CATEGORY_AVERAGES,
        // New: Role display name for UI (pluralized for "Avg Product Managers")
        role_display_name: roleDisplayName,
        // New: Canonical position title for percentile badge (e.g., "Product Manager")
        user_position: canonicalPosition
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
