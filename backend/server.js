const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
  'https://estimatenow.io',
  'https://www.estimatenow.io',
  'http://localhost:5173'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Estimate Backend API is running' });
});

app.get('/api/server-ip', async (req, res) => {
  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    res.json({ 
      outbound_ip: data.ip,
      request_ip: req.ip || req.connection.remoteAddress
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const colleaguesRouter = require('./routes/colleagues');
const reviewsRouter = require('./routes/reviews');
const adminRouter = require('./routes/admin');
const fraudRouter = require('./routes/fraud');
const anonymousReviewsRouter = require('./routes/anonymousReviews');
const emailPreferencesRouter = require('./routes/emailPreferences');
const leaderboardRouter = require('./routes/leaderboard');
const dataValidationRouter = require('./routes/dataValidation');
const profilePhotoRouter = require('./routes/profilePhoto');
app.use('/api/colleagues', colleaguesRouter);
app.use('/api', reviewsRouter);
app.use('/api/admin', adminRouter);
app.use('/api/fraud', fraudRouter);
app.use('/api/anonymous', anonymousReviewsRouter);
app.use('/api/email-preferences', emailPreferencesRouter);
app.use('/api/leaderboard', leaderboardRouter);
app.use('/api/data-validation', dataValidationRouter);
app.use('/api/profile-photo', profilePhotoRouter);

// Serve uploaded profile photos
app.use('/uploads', express.static('uploads'));

// Check table structure
app.get('/api/table-info/:tableName', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });

    const [columns] = await connection.query(`SHOW FULL COLUMNS FROM ${req.params.tableName}`);
    const [createTable] = await connection.query(`SHOW CREATE TABLE ${req.params.tableName}`);
    await connection.end();

    res.json({
      success: true,
      columns,
      createStatement: createTable[0]['Create Table']
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Add indexes for performance
app.post('/api/add-indexes', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });

    // Add composite index for colleague lookup by company
    await connection.query(`
      CREATE INDEX idx_cc_company_profile 
      ON company_connections(company_name, profile_id, is_current)
    `).catch(() => {}); // Ignore if exists

    // Add index for profile lookup with ordering
    await connection.query(`
      CREATE INDEX idx_cc_profile_order 
      ON company_connections(profile_id, is_current, worked_to)
    `).catch(() => {}); // Ignore if exists

    const [indexes] = await connection.query('SHOW INDEX FROM company_connections');
    await connection.end();

    res.json({
      success: true,
      message: 'Indexes added',
      indexes: indexes.map(i => ({ name: i.Key_name, column: i.Column_name }))
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Migration endpoint
app.post('/api/migrate', async (req, res) => {
  try {
    const mysql = require('mysql2/promise');
    const fs = require('fs');
    const path = require('path');
    
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      multipleStatements: true,
      ssl: { rejectUnauthorized: false }
    });

    // Drop users table if it exists (it may have been created with wrong constraints)
    await connection.query('DROP TABLE IF EXISTS users');
    
    const migrationPath = path.join(__dirname, 'database/migration-add-review-system.sql');
    const migrationSql = fs.readFileSync(migrationPath, 'utf8');
    
    await connection.query(migrationSql);
    
    const [tables] = await connection.query('SHOW TABLES');
    await connection.end();

    res.json({
      success: true,
      message: 'Migration completed',
      tablesCount: tables.length,
      tables: tables.map(row => Object.values(row)[0])
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

app.post('/api/auth/linkedin/callback', async (req, res) => {
  const startTime = Date.now();
  const timings = {};
  
  const { code, redirect_uri, turnstile_token } = req.body;

  if (!code || !redirect_uri) {
    return res.status(400).json({ 
      error: 'Missing required parameters',
      message: 'Both code and redirect_uri are required' 
    });
  }

  timings.requestReceived = Date.now() - startTime;

  // Verify Turnstile token if provided
  if (turnstile_token && process.env.TURNSTILE_SECRET_KEY) {
    try {
      const verifyResponse = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          secret: process.env.TURNSTILE_SECRET_KEY,
          response: turnstile_token,
        }),
      });

      const verifyData = await verifyResponse.json();
      timings.turnstileVerify = Date.now() - startTime;
      
      if (!verifyData.success) {
        console.error('Turnstile verification failed:', verifyData);
        return res.status(403).json({ 
          error: 'Bot verification failed',
          message: 'Please try again' 
        });
      }
    } catch (error) {
      console.error('Turnstile verification error:', error);
      return res.status(500).json({ 
        error: 'Verification error',
        message: 'Could not verify request' 
      });
    }
  }

  try {
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: process.env.LINKEDIN_CLIENT_ID,
      client_secret: process.env.LINKEDIN_CLIENT_SECRET,
      redirect_uri: redirect_uri,
    });

    const tokenResponse = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams,
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('LinkedIn token exchange failed:', errorText);
      return res.status(tokenResponse.status).json({ 
        error: 'Token exchange failed',
        details: errorText 
      });
    }

    const tokenData = await tokenResponse.json();
    timings.linkedinTokenExchange = Date.now() - startTime;

    const profileResponse = await fetch('https://api.linkedin.com/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
      },
    });

    if (!profileResponse.ok) {
      const errorText = await profileResponse.text();
      console.error('LinkedIn profile fetch failed:', errorText);
      return res.status(profileResponse.status).json({ 
        error: 'Failed to fetch user profile',
        details: errorText 
      });
    }

    const profile = await profileResponse.json();
    timings.linkedinProfileFetch = Date.now() - startTime;
    
    // Log the full LinkedIn profile response for debugging
    console.log('=== LinkedIn OAuth Profile Response ===');
    console.log(JSON.stringify(profile, null, 2));
    console.log('======================================');

    // Match user to Bright Data LinkedIn profile and create user
    const mysql = require('mysql2/promise');
    const { v4: uuidv4 } = require('uuid');
    
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306,
      ssl: { rejectUnauthorized: false }
    });
    timings.dbConnection = Date.now() - startTime;

    // Try to match by image, LinkedIn profile URL/ID, numeric ID, then by name
    let linkedinProfileId = null;
    let matchMethod = 'not_found';
    let matchConfidence = 0;

    // Extract image ID from LinkedIn OAuth picture URL
    let linkedinImageId = null;
    if (profile.picture) {
      // Extract the unique image ID from URL like:
      // https://media.licdn.com/dms/image/v2/D4D03AQG46nGu8wMmOw/profile-displayphoto-shrink_100_100/...
      const imageMatch = profile.picture.match(/\/([A-Za-z0-9_-]+)\/profile-displayphoto/);
      if (imageMatch) {
        linkedinImageId = imageMatch[1];
      }
    }

    // Try image matching first (most reliable since images are unique)
    if (linkedinImageId) {
      // Use indexed image_id column for fast lookup (10x faster than LIKE query)
      const [imageMatches] = await connection.query(
        'SELECT id, name, avatar FROM linkedin_profiles WHERE image_id = ? LIMIT 10',
        [linkedinImageId]
      );
      
      // Fallback to slower LIKE query if image_id column not populated yet
      if (imageMatches.length === 0) {
        const [fallbackMatches] = await connection.query(
          'SELECT id, name, avatar FROM linkedin_profiles WHERE avatar LIKE ? LIMIT 10',
          [`%${linkedinImageId}%`]
        );
        imageMatches.push(...fallbackMatches);
      }
      timings.imageMatching = Date.now() - startTime;
      if (imageMatches.length === 1) {
        linkedinProfileId = imageMatches[0].id;
        matchMethod = 'image';
        matchConfidence = 0.95;
        console.log(`✅ Image match found: ${linkedinProfileId} (${imageMatches[0].name})`);
      } else if (imageMatches.length > 1) {
        console.warn(`⚠️ Multiple image matches found for ${linkedinImageId}: ${imageMatches.length} profiles`);
        // Use the first one but with lower confidence
        linkedinProfileId = imageMatches[0].id;
        matchMethod = 'image_multiple';
        matchConfidence = 0.7;
      }
    }

    // Extract profile ID from LinkedIn profile URL if available
    const profileUrl = profile.profile_url || profile.vanity_name || profile.public_profile_url;
    let extractedProfileId = null;
    
    if (profileUrl) {
      const match = profileUrl.match(/linkedin\.com\/in\/([^\/\?]+)/);
      if (match) {
        extractedProfileId = match[1];
      }
    }

    // Try profile ID match (from URL)
    if (!linkedinProfileId && extractedProfileId) {
      const [profileMatches] = await connection.query(
        'SELECT id FROM linkedin_profiles WHERE id = ? OR linkedin_id = ? LIMIT 1',
        [extractedProfileId, extractedProfileId]
      );
      if (profileMatches.length > 0) {
        linkedinProfileId = profileMatches[0].id;
        matchMethod = 'linkedin_id';
        matchConfidence = 1.0;
      }
    }

    // Try linkedin_num_id match if URL didn't work
    const linkedinNumId = profile.sub;
    if (!linkedinProfileId && linkedinNumId) {
      const [numIdMatches] = await connection.query(
        'SELECT id FROM linkedin_profiles WHERE linkedin_num_id = ? LIMIT 1',
        [linkedinNumId]
      );
      if (numIdMatches.length > 0) {
        linkedinProfileId = numIdMatches[0].id;
        matchMethod = 'linkedin_num_id';
        matchConfidence = 0.95;
      }
    }

    // Try name match as last resort
    if (!linkedinProfileId && profile.name) {
      const [nameMatches] = await connection.query(
        'SELECT id, name FROM linkedin_profiles WHERE name = ? LIMIT 5',
        [profile.name]
      );
      if (nameMatches.length === 1) {
        linkedinProfileId = nameMatches[0].id;
        matchMethod = 'name';
        matchConfidence = 0.7;
      }
    }
    
    // Log for debugging
    console.log('OAuth Profile Match:', {
      profileUrl,
      extractedProfileId,
      linkedinNumId,
      name: profile.name,
      matchedId: linkedinProfileId,
      matchMethod,
      matchConfidence
    });

    // Check if user already exists
    const [existingUsers] = await connection.query(
      'SELECT id, linkedin_profile_id FROM users WHERE email = ?',
      [profile.email]
    );

    let userId;
    if (existingUsers.length > 0) {
      userId = existingUsers[0].id;
      // Update linkedin_profile_id if we found a match and it wasn't set
      if (linkedinProfileId && !existingUsers[0].linkedin_profile_id) {
        await connection.query(
          'UPDATE users SET linkedin_profile_id = ?, profile_match_method = ?, profile_match_confidence = ?, can_use_platform = TRUE WHERE id = ?',
          [linkedinProfileId, matchMethod, matchConfidence, userId]
        );
      }
    } else {
      // Create new user
      userId = uuidv4();
      const crypto = require('crypto');
      const unsubscribeToken = crypto.createHash('md5').update(userId + profile.email + Date.now()).digest('hex');
      
      await connection.query(`
        INSERT INTO users (id, linkedin_profile_id, email, name, avatar, profile_match_method, profile_match_confidence, can_use_platform, unsubscribe_token, email_notifications, email_new_reviews, email_score_unlocked, email_marketing)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, TRUE, TRUE, TRUE, FALSE)
      `, [
        userId,
        linkedinProfileId,
        profile.email,
        profile.name,
        profile.picture,
        matchMethod,
        matchConfidence,
        linkedinProfileId ? true : false,
        unsubscribeToken
      ]);
      
      // Sync any reviews received before signup to user_scores
      // Check if this user received reviews before creating an account
      if (linkedinProfileId) {
        const [profileData] = await connection.query(
          'SELECT reviews_received_count FROM linkedin_profiles WHERE id = ?',
          [linkedinProfileId]
        );
        
        const reviewsReceivedBeforeSignup = profileData.length > 0 ? (profileData[0].reviews_received_count || 0) : 0;
        
        // Also count actual reviews in reviews table to be sure
        // Count from BOTH reviews and anonymous_reviews tables
        const [actualReviews] = await connection.query(`
          SELECT 
            (SELECT COUNT(*) FROM reviews WHERE reviewee_id = ?) +
            (SELECT COUNT(*) FROM anonymous_reviews WHERE reviewee_id = ?) as count
        `, [linkedinProfileId, linkedinProfileId]);
        const actualReviewCount = actualReviews[0].count || 0;
        
        // Use the higher of the two counts (in case of any sync issues)
        const reviewsReceived = Math.max(reviewsReceivedBeforeSignup, actualReviewCount);
        
        // Always create user_scores entry for new users (so they appear in analytics)
        await connection.query(`
          INSERT INTO user_scores (user_id, linkedin_profile_id, reviews_received, reviews_given)
          VALUES (?, ?, ?, 0)
          ON DUPLICATE KEY UPDATE 
            linkedin_profile_id = VALUES(linkedin_profile_id),
            reviews_received = GREATEST(reviews_received, VALUES(reviews_received))
        `, [userId, linkedinProfileId, reviewsReceived]);
      }
    }

    // Store OAuth token
    if (linkedinProfileId) {
      await connection.query(`
        INSERT INTO oauth_tokens (user_id, provider, access_token, expires_at)
        VALUES (?, 'linkedin', ?, DATE_ADD(NOW(), INTERVAL ? SECOND))
        ON DUPLICATE KEY UPDATE access_token = VALUES(access_token), expires_at = VALUES(expires_at)
      `, [userId, tokenData.access_token, tokenData.expires_in]);
    }

    // Track users without profile data for manual review
    if (!linkedinProfileId && matchMethod === 'not_found') {
      await connection.query(`
        INSERT INTO incomplete_oauth_users (user_id, email, name, linkedin_num_id, avatar, match_method, reason, attempt_count)
        VALUES (?, ?, ?, ?, ?, ?, 'profile_not_found', 1)
        ON DUPLICATE KEY UPDATE 
          last_seen_at = CURRENT_TIMESTAMP,
          attempt_count = attempt_count + 1,
          linkedin_num_id = VALUES(linkedin_num_id),
          avatar = VALUES(avatar)
      `, [userId, profile.email, profile.name, profile.sub, profile.picture, matchMethod]);
      
      console.log(`⚠️ Incomplete OAuth user tracked: ${profile.email} (${profile.name})`);
    }

    // Get is_blocked status before closing connection
    const [userStatus] = await connection.query(
      'SELECT is_blocked FROM users WHERE id = ?',
      [userId]
    );
    const isBlocked = userStatus.length > 0 ? userStatus[0].is_blocked : false;

    await connection.end();
    timings.total = Date.now() - startTime;
    
    // Log all timings for performance analysis
    console.log('=== OAuth Timing Analysis ===');
    console.log(JSON.stringify(timings, null, 2));
    console.log('=============================');

    return res.status(200).json({
      access_token: tokenData.access_token,
      expires_in: tokenData.expires_in,
      user: {
        id: userId,
        linkedin_profile_id: linkedinProfileId,
        name: profile.name,
        email: profile.email,
        picture: profile.picture,
        can_use_platform: !!linkedinProfileId,
        match_method: matchMethod,
        match_confidence: matchConfidence,
        is_blocked: isBlocked
      }
    });

  } catch (error) {
    console.error('OAuth callback error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
});

// Contact form endpoint
app.post('/api/contact', async (req, res) => {
  try {
    const { name, subject, message, email } = req.body;

    if (!name || !subject || !message) {
      return res.status(400).json({ 
        success: false,
        error: 'Missing required fields' 
      });
    }

    const { sendContactFormEmail } = require('./services/emailService');
    const result = await sendContactFormEmail(name, subject, message, email);

    if (result.success) {
      return res.status(200).json({ success: true });
    } else {
      return res.status(500).json({ 
        success: false,
        error: result.error || 'Failed to send email' 
      });
    }
  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      success: false,
      error: 'Internal server error' 
    });
  }
});

app.listen(PORT, () => {
  console.log(`Estimate Backend API running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
});
