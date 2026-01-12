const express = require('express');
const router = express.Router();
const mysql = require('mysql2/promise');

let pool;

// Calculate time overlap in months between two work periods
function calculateTimeOverlap(userFrom, userTo, userIsCurrent, colleagueFrom, colleagueTo, colleagueIsCurrent) {
  // Parse date strings like "Jan 2020", "2020", "Present", null
  const parseDate = (dateStr, isCurrent, isEnd = false) => {
    if (isCurrent && isEnd) return new Date(); // Current = now
    if (!dateStr || dateStr === 'Present') return isEnd ? new Date() : null;
    
    // Try to parse "Jan 2020" or "2020"
    const monthNames = ['jan', 'feb', 'mar', 'apr', 'may', 'jun', 'jul', 'aug', 'sep', 'oct', 'nov', 'dec'];
    const parts = dateStr.toLowerCase().split(' ');
    
    let year, month;
    if (parts.length === 2) {
      // "Jan 2020"
      const monthIndex = monthNames.findIndex(m => parts[0].startsWith(m));
      month = monthIndex >= 0 ? monthIndex : 0;
      year = parseInt(parts[1]);
    } else if (parts.length === 1) {
      // "2020"
      year = parseInt(parts[0]);
      month = isEnd ? 11 : 0; // End of year or start of year
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

  // If we can't parse dates, assume overlap if both are current
  if (!userStart || !userEnd || !colleagueStart || !colleagueEnd) {
    if (userIsCurrent && colleagueIsCurrent) return 12; // Assume 12 months if both current
    return 6; // Default to 6 months if dates unknown
  }

  // Calculate overlap
  const overlapStart = new Date(Math.max(userStart.getTime(), colleagueStart.getTime()));
  const overlapEnd = new Date(Math.min(userEnd.getTime(), colleagueEnd.getTime()));

  if (overlapStart >= overlapEnd) return 0; // No overlap

  // Calculate months
  const months = (overlapEnd.getFullYear() - overlapStart.getFullYear()) * 12 
                 + (overlapEnd.getMonth() - overlapStart.getMonth());
  
  return Math.max(0, months);
}

function initializePool() {
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

router.get('/profile/:profileId/colleagues', async (req, res) => {
  try {
    const { profileId } = req.params;
    const pool = initializePool();
    const connection = await pool.getConnection();

    try {
      // Get profile
      const [profiles] = await connection.query(
        'SELECT id, linkedin_num_id, name, position, current_company_name FROM linkedin_profiles WHERE id = ?',
        [profileId]
      );

      if (profiles.length === 0) {
        return res.status(404).json({ success: false, error: 'Profile not found' });
      }

      // Get work history - ONLY current + 1 previous company
      const [workHistory] = await connection.query(`
        SELECT company_name, worked_from, worked_to, is_current
        FROM company_connections 
        WHERE profile_id = ?
        ORDER BY is_current DESC, worked_to DESC
        LIMIT 2
      `, [profileId]);

      // Get colleagues from each company - must have 3+ months overlap
      const colleaguesByCompany = {};
      for (const company of workHistory) {
        // Get all potential colleagues at this company
        const [potentialColleagues] = await connection.query(`
          SELECT 
            lp.id, lp.name, lp.position, lp.avatar, lp.current_company_name,
            cc.worked_from, cc.worked_to, cc.is_current
          FROM linkedin_profiles lp
          JOIN company_connections cc ON cc.profile_id = lp.id
          WHERE cc.company_name = ? AND lp.id != ?
        `, [company.company_name, profileId]);

        // Filter colleagues with 3+ months overlap
        const colleaguesWithOverlap = potentialColleagues.filter(colleague => {
          const overlapMonths = calculateTimeOverlap(
            company.worked_from, company.worked_to, company.is_current,
            colleague.worked_from, colleague.worked_to, colleague.is_current
          );
          colleague.overlap_months = overlapMonths;
          return overlapMonths >= 3;
        });

        // Sort by overlap months (most overlap first)
        colleaguesWithOverlap.sort((a, b) => b.overlap_months - a.overlap_months);

        colleaguesByCompany[company.company_name] = {
          user_period: { from: company.worked_from, to: company.worked_to, is_current: company.is_current },
          colleagues: colleaguesWithOverlap.slice(0, 10), // Limit to 10
          total_potential: potentialColleagues.length,
          filtered_by_overlap: potentialColleagues.length - colleaguesWithOverlap.length
        };
      }

      res.json({
        success: true,
        profile: profiles[0],
        work_history: workHistory,
        skip_budget: Math.max(workHistory.length * 3, 3),
        colleagues_by_company: colleaguesByCompany
      });

    } finally {
      connection.release();
    }
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

router.get('/search', async (req, res) => {
  try {
    const { company, name, location, limit = 10 } = req.query;

    if (!company && !name && !location) {
      return res.status(400).json({
        error: 'Missing parameters',
        message: 'At least one search parameter (company, name, or location) is required'
      });
    }

    const pool = initializePool();
    const connection = await pool.getConnection();

    let sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.position,
        p.avatar,
        p.current_company_name,
        p.location,
        p.city,
        p.connections
      FROM linkedin_profiles p
      WHERE 1=1
    `;
    const params = [];

    if (company) {
      sql += ` AND (
        p.current_company_name LIKE ? OR
        EXISTS (
          SELECT 1 FROM work_experience we 
          WHERE we.profile_id = p.id AND we.company LIKE ?
        )
      )`;
      params.push(`%${company}%`, `%${company}%`);
    }

    if (name) {
      sql += ` AND p.name LIKE ?`;
      params.push(`%${name}%`);
    }

    if (location) {
      sql += ` AND (p.city LIKE ? OR p.location LIKE ?)`;
      params.push(`%${location}%`, `%${location}%`);
    }

    sql += ` ORDER BY p.connections DESC LIMIT ?`;
    params.push(parseInt(limit));

    const [rows] = await connection.query(sql, params);
    connection.release();

    res.json({
      success: true,
      count: rows.length,
      colleagues: rows
    });

  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({
      error: 'Search failed',
      message: error.message
    });
  }
});

router.get('/by-company/:companyName', async (req, res) => {
  try {
    const { companyName } = req.params;
    const { limit = 20 } = req.query;

    const pool = initializePool();
    const connection = await pool.getConnection();

    const sql = `
      SELECT DISTINCT
        p.id,
        p.name,
        p.position,
        p.avatar,
        p.current_company_name,
        p.location,
        p.connections,
        cc.is_current,
        cc.worked_from,
        cc.worked_to
      FROM linkedin_profiles p
      INNER JOIN company_connections cc ON p.id = cc.profile_id
      WHERE cc.company_name LIKE ?
      ORDER BY cc.is_current DESC, p.connections DESC
      LIMIT ?
    `;

    const [rows] = await connection.query(sql, [`%${companyName}%`, parseInt(limit)]);
    connection.release();

    res.json({
      success: true,
      company: companyName,
      count: rows.length,
      colleagues: rows
    });

  } catch (error) {
    console.error('Company search error:', error);
    res.status(500).json({
      error: 'Company search failed',
      message: error.message
    });
  }
});

router.get('/profile/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const pool = initializePool();
    const connection = await pool.getConnection();

    const [profiles] = await connection.query(
      'SELECT * FROM linkedin_profiles WHERE id = ? OR linkedin_id = ?',
      [profileId, profileId]
    );

    if (profiles.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Profile not found'
      });
    }

    const profile = profiles[0];

    const [experience] = await connection.query(
      'SELECT * FROM work_experience WHERE profile_id = ? ORDER BY is_current DESC, start_date DESC',
      [profile.id]
    );

    const [education] = await connection.query(
      'SELECT * FROM education WHERE profile_id = ? ORDER BY end_year DESC',
      [profile.id]
    );

    const [certifications] = await connection.query(
      'SELECT * FROM certifications WHERE profile_id = ?',
      [profile.id]
    );

    connection.release();

    res.json({
      success: true,
      profile: {
        ...profile,
        experience,
        education,
        certifications
      }
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Profile fetch failed',
      message: error.message
    });
  }
});

router.get('/common-companies', async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        error: 'Missing userId parameter'
      });
    }

    const pool = initializePool();
    const connection = await pool.getConnection();

    const sql = `
      SELECT 
        cc1.company_name,
        COUNT(DISTINCT cc2.profile_id) as colleague_count,
        GROUP_CONCAT(DISTINCT p.name SEPARATOR ', ') as colleague_names
      FROM company_connections cc1
      INNER JOIN company_connections cc2 ON cc1.company_name = cc2.company_name
      INNER JOIN linkedin_profiles p ON cc2.profile_id = p.id
      WHERE cc1.profile_id = ? AND cc2.profile_id != ?
      GROUP BY cc1.company_name
      ORDER BY colleague_count DESC
      LIMIT 10
    `;

    const [rows] = await connection.query(sql, [userId, userId]);
    connection.release();

    res.json({
      success: true,
      companies: rows
    });

  } catch (error) {
    console.error('Common companies error:', error);
    res.status(500).json({
      error: 'Common companies fetch failed',
      message: error.message
    });
  }
});

module.exports = router;
