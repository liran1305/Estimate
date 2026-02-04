const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const sgMail = require('@sendgrid/mail');
const mysql = require('mysql2/promise');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

// Database connection pool
let pool = null;

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
      queueLimit: 0,
      ssl: { rejectUnauthorized: false }
    });
  }
  return pool;
}

// Email settings
const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@estimatenow.io';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Estimate';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'liran@estimatenow.io';

// Get backend URL based on environment
const getBackendUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  if (process.env.NODE_ENV === 'production') return 'https://estimate-mio1.onrender.com';
  return `http://localhost:${process.env.PORT || 3001}`;
};

// Allowed editable fields (whitelist for security)
const EDITABLE_FIELDS = {
  linkedin_profiles: ['name', 'first_name', 'last_name', 'position', 'location', 'city', 'country_code', 'current_company_name', 'about'],
  work_experience: ['company', 'title', 'start_date', 'end_date', 'location', 'is_current']
};

// ============================================================================
// GET /api/profile/info - Get full profile data for Info Panel
// ============================================================================
router.get('/info', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get user and linked profile
      const [users] = await connection.query(`
        SELECT u.id, u.email, u.name as user_name, u.linkedin_profile_id, u.created_at as user_created_at,
               lp.id as profile_id, lp.name, lp.first_name, lp.last_name, lp.position, 
               lp.location, lp.city, lp.country_code, lp.current_company_name, lp.about,
               lp.avatar, lp.email as profile_email, lp.created_at as profile_created_at
        FROM users u
        LEFT JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        WHERE u.id = ?
      `, [user_id]);

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const user = users[0];

      // Get work experience
      const [workExperience] = await connection.query(`
        SELECT id, company, company_id, title, start_date, end_date, location, is_current, duration
        FROM work_experience
        WHERE profile_id = ?
        ORDER BY COALESCE(end_date, '9999-12-31') DESC, start_date DESC
      `, [user.linkedin_profile_id]);

      // Get education
      const [education] = await connection.query(`
        SELECT id, title, degree, start_year, end_year, description
        FROM education
        WHERE profile_id = ?
        ORDER BY end_year DESC
      `, [user.linkedin_profile_id]);

      // Get pending edit requests for this user
      const [pendingRequests] = await connection.query(`
        SELECT id, request_type, current_data, requested_changes, reason, status, requested_at
        FROM profile_edit_requests
        WHERE user_id = ? AND status = 'pending'
        ORDER BY requested_at DESC
      `, [user_id]);

      // Identify missing/incomplete fields
      const missingFields = [];
      if (!user.name) missingFields.push('name');
      if (!user.position) missingFields.push('position');
      if (!user.location && !user.city) missingFields.push('location');
      if (!user.current_company_name) missingFields.push('current_company_name');
      if (workExperience.length === 0) missingFields.push('work_experience');

      return res.json({
        success: true,
        profile: {
          user_id: user.id,
          email: user.email,
          linkedin_profile_id: user.linkedin_profile_id,
          name: user.name,
          first_name: user.first_name,
          last_name: user.last_name,
          position: user.position,
          location: user.location,
          city: user.city,
          country_code: user.country_code,
          current_company_name: user.current_company_name,
          about: user.about,
          avatar: user.avatar,
          profile_email: user.profile_email,
          created_at: user.profile_created_at || user.user_created_at
        },
        work_experience: workExperience,
        education: education,
        pending_requests: pendingRequests,
        missing_fields: missingFields,
        editable_fields: EDITABLE_FIELDS
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get profile info error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// POST /api/profile/edit-request - Submit an edit request (requires admin approval)
// ============================================================================
router.post('/edit-request', async (req, res) => {
  try {
    const { 
      user_id, 
      field_name, 
      field_table = 'linkedin_profiles',
      current_value,
      requested_value, 
      reason,
      related_record_id  // For work_experience edits
    } = req.body;

    // Validate required fields
    if (!user_id || !field_name || requested_value === undefined) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id, field_name, and requested_value are required' 
      });
    }

    // SECURITY: Validate field is in whitelist
    if (!EDITABLE_FIELDS[field_table] || !EDITABLE_FIELDS[field_table].includes(field_name)) {
      return res.status(403).json({ 
        success: false, 
        error: `Field '${field_name}' in table '${field_table}' is not editable` 
      });
    }

    // SECURITY: Validate requested_value is not malicious
    if (typeof requested_value === 'string' && requested_value.length > 1000) {
      return res.status(400).json({ 
        success: false, 
        error: 'Requested value is too long (max 1000 characters)' 
      });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Verify user exists and get their profile
      const [users] = await connection.query(`
        SELECT u.id, u.email, u.name, u.linkedin_profile_id, lp.name as profile_name
        FROM users u
        LEFT JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        WHERE u.id = ?
      `, [user_id]);

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const user = users[0];

      // Check for duplicate pending request (using JSON contains for the field)
      const [existingRequests] = await connection.query(`
        SELECT id FROM profile_edit_requests
        WHERE user_id = ? AND request_type = 'profile_update' AND status = 'pending'
        AND JSON_EXTRACT(requested_changes, '$.field_name') = ?
      `, [user_id, field_name]);

      if (existingRequests.length > 0) {
        return res.status(409).json({ 
          success: false, 
          error: 'You already have a pending request for this field' 
        });
      }

      // Create the edit request using existing table schema
      const requestId = uuidv4();
      const requestIp = req.ip || req.connection?.remoteAddress || 'unknown';
      const requestUserAgent = req.headers['user-agent'] || 'unknown';
      
      // Build JSON objects for current_data and requested_changes
      const currentData = {
        field_name,
        field_table,
        value: current_value || null,
        related_record_id: related_record_id || null
      };
      
      const requestedChanges = {
        field_name,
        field_table,
        value: requested_value,
        related_record_id: related_record_id || null
      };

      await connection.query(`
        INSERT INTO profile_edit_requests 
        (id, user_id, linkedin_profile_id, request_type, current_data, requested_changes, reason)
        VALUES (?, ?, ?, 'profile_update', ?, ?, ?)
      `, [
        requestId,
        user_id,
        user.linkedin_profile_id || '',
        JSON.stringify(currentData),
        JSON.stringify(requestedChanges),
        reason || null
      ]);

      // Send email notification to admin using SendGrid
      try {
        const approveUrl = `${getBackendUrl()}/api/profile/admin/review/${requestId}?action=approve&secret=${process.env.ADMIN_SECRET}`;
        const rejectUrl = `${getBackendUrl()}/api/profile/admin/review/${requestId}?action=reject&secret=${process.env.ADMIN_SECRET}`;

        const msg = {
          to: ADMIN_EMAIL,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: `🔔 Profile Edit Request: ${user.name || user.email} wants to change ${field_name}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #0a66c2;">Profile Edit Request</h2>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>User:</strong> ${user.name || 'Unknown'} (${user.email})</p>
                <p><strong>LinkedIn Profile ID:</strong> ${user.linkedin_profile_id || 'None'}</p>
                <p><strong>Field:</strong> ${field_table}.${field_name}</p>
                <p><strong>Current Value:</strong> <code>${current_value || '(empty)'}</code></p>
                <p><strong>Requested Value:</strong> <code style="color: #0a66c2;">${requested_value}</code></p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
                ${related_record_id ? `<p><strong>Related Record ID:</strong> ${related_record_id}</p>` : ''}
              </div>

              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>⚠️ Security Info:</strong></p>
                <p>IP: ${requestIp}</p>
                <p>User Agent: ${requestUserAgent.substring(0, 100)}...</p>
              </div>

              <div style="margin: 30px 0;">
                <a href="${approveUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px;">✅ Approve</a>
                <a href="${rejectUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px;">❌ Reject</a>
              </div>

              <p style="color: #666; font-size: 12px;">Request ID: ${requestId}</p>
            </div>
          `
        };
        await sgMail.send(msg);
        console.log(`📧 Admin notification sent for edit request ${requestId}`);
      } catch (emailError) {
        console.error('Failed to send admin email:', emailError);
        // Don't fail the request if email fails
      }

      return res.json({
        success: true,
        message: 'Edit request submitted successfully. An admin will review your request.',
        request_id: requestId
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Submit edit request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// POST /api/profile/edit-requests-batch - Submit multiple edit requests with single email
// ============================================================================
router.post('/edit-requests-batch', async (req, res) => {
  try {
    const { user_id, changes, reason } = req.body;
    // changes = [{ field_name, field_table, current_value, requested_value }]

    if (!user_id || !changes || !Array.isArray(changes) || changes.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'user_id and changes array are required' 
      });
    }

    // Validate all fields
    for (const change of changes) {
      const fieldTable = change.field_table || 'linkedin_profiles';
      if (!EDITABLE_FIELDS[fieldTable] || !EDITABLE_FIELDS[fieldTable].includes(change.field_name)) {
        return res.status(403).json({ 
          success: false, 
          error: `Field '${change.field_name}' in table '${fieldTable}' is not editable` 
        });
      }
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Verify user exists
      const [users] = await connection.query(`
        SELECT u.id, u.email, u.name, u.linkedin_profile_id, lp.name as profile_name
        FROM users u
        LEFT JOIN linkedin_profiles lp ON u.linkedin_profile_id = lp.id
        WHERE u.id = ?
      `, [user_id]);

      if (users.length === 0) {
        return res.status(404).json({ success: false, error: 'User not found' });
      }

      const user = users[0];
      const requestIp = req.ip || req.connection?.remoteAddress || 'unknown';
      const requestUserAgent = req.headers['user-agent'] || 'unknown';
      
      // Create all edit requests
      const createdRequests = [];
      for (const change of changes) {
        const requestId = uuidv4();
        const fieldTable = change.field_table || 'linkedin_profiles';
        const relatedRecordId = change.related_record_id || null;
        
        const currentData = {
          field_name: change.field_name,
          field_table: fieldTable,
          value: change.current_value || null,
          related_record_id: relatedRecordId
        };
        
        const requestedChanges = {
          field_name: change.field_name,
          field_table: fieldTable,
          value: change.requested_value,
          related_record_id: relatedRecordId
        };

        // Determine request type based on field table
        const requestType = fieldTable === 'work_experience' ? 'work_experience_edit' : 'profile_update';

        await connection.query(`
          INSERT INTO profile_edit_requests 
          (id, user_id, linkedin_profile_id, request_type, current_data, requested_changes, reason)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `, [
          requestId,
          user_id,
          user.linkedin_profile_id || '',
          requestType,
          JSON.stringify(currentData),
          JSON.stringify(requestedChanges),
          reason || null
        ]);

        createdRequests.push({
          id: requestId,
          field_name: change.field_name,
          field_table: fieldTable,
          current_value: change.current_value,
          requested_value: change.requested_value
        });
      }

      // Send ONE email with all changes
      try {
        const changesHtml = createdRequests.map(req => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #eee;"><strong>${req.field_name.replace(/_/g, ' ')}</strong></td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">${req.current_value || '(empty)'}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee; color: #0a66c2;">${req.requested_value}</td>
            <td style="padding: 8px; border-bottom: 1px solid #eee;">
              <a href="${getBackendUrl()}/api/profile/admin/review/${req.id}?action=approve&secret=${process.env.ADMIN_SECRET}" style="color: #28a745; margin-right: 10px;">✅</a>
              <a href="${getBackendUrl()}/api/profile/admin/review/${req.id}?action=reject&secret=${process.env.ADMIN_SECRET}" style="color: #dc3545;">❌</a>
            </td>
          </tr>
        `).join('');

        const allIds = createdRequests.map(r => r.id).join(',');
        const approveAllUrl = `${getBackendUrl()}/api/profile/admin/review-batch?action=approve&secret=${process.env.ADMIN_SECRET}&ids=${allIds}`;
        const rejectAllUrl = `${getBackendUrl()}/api/profile/admin/review-batch?action=reject&secret=${process.env.ADMIN_SECRET}&ids=${allIds}`;

        const msg = {
          to: ADMIN_EMAIL,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: `🔔 Profile Edit Request: ${user.name || user.email} wants to change ${createdRequests.length} field(s)`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
              <h2 style="color: #0a66c2;">Profile Edit Request</h2>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>User:</strong> ${user.name || 'Unknown'} (${user.email})</p>
                <p><strong>LinkedIn Profile ID:</strong> ${user.linkedin_profile_id || 'None'}</p>
                <p><strong>Total Changes:</strong> ${createdRequests.length}</p>
                ${reason ? `<p><strong>Reason:</strong> ${reason}</p>` : ''}
              </div>

              <!-- Approve All / Reject All buttons -->
              <div style="margin: 20px 0; text-align: center;">
                <a href="${approveAllUrl}" style="background: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-right: 10px; display: inline-block;">✅ Approve All (${createdRequests.length})</a>
                <a href="${rejectAllUrl}" style="background: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">❌ Reject All (${createdRequests.length})</a>
              </div>

              <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                <thead>
                  <tr style="background: #f0f0f0;">
                    <th style="padding: 10px; text-align: left;">Field</th>
                    <th style="padding: 10px; text-align: left;">Current</th>
                    <th style="padding: 10px; text-align: left;">Requested</th>
                    <th style="padding: 10px; text-align: left;">Action</th>
                  </tr>
                </thead>
                <tbody>
                  ${changesHtml}
                </tbody>
              </table>

              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>⚠️ Security Info:</strong></p>
                <p>IP: ${requestIp}</p>
                <p>User Agent: ${requestUserAgent.substring(0, 100)}...</p>
              </div>

              <p style="color: #666; font-size: 12px;">Request IDs: ${createdRequests.map(r => r.id).join(', ')}</p>
            </div>
          `
        };
        await sgMail.send(msg);
        console.log(`📧 Admin notification sent for ${createdRequests.length} edit request(s)`);
      } catch (emailError) {
        console.error('Failed to send admin email:', emailError);
      }

      return res.json({
        success: true,
        message: `${createdRequests.length} edit request(s) submitted successfully.`,
        request_ids: createdRequests.map(r => r.id)
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Submit batch edit request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// GET /api/profile/admin/review-batch - Admin approve/reject ALL requests in a batch
// ============================================================================
router.get('/admin/review-batch', async (req, res) => {
  try {
    const { action, secret, ids } = req.query;
    // ids is a comma-separated list of request IDs

    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">❌ Unauthorized</h1>
            <p>Invalid or missing admin secret.</p>
          </body>
        </html>
      `);
    }

    if (!['approve', 'reject'].includes(action) || !ids) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">❌ Invalid Request</h1>
            <p>Action must be 'approve' or 'reject' and ids are required.</p>
          </body>
        </html>
      `);
    }

    const requestIds = ids.split(',');
    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      await connection.beginTransaction();

      let processedCount = 0;
      let userEmail = null;
      let userName = null;

      for (const requestId of requestIds) {
        // Get the request
        const [requests] = await connection.query(`
          SELECT per.*, u.email as user_email, u.name as user_name
          FROM profile_edit_requests per
          JOIN users u ON per.user_id = u.id
          WHERE per.id = ? AND per.status = 'pending'
        `, [requestId]);

        if (requests.length === 0) continue;

        const request = requests[0];
        userEmail = request.user_email;
        userName = request.user_name;

        // Parse JSON fields
        const requestedChanges = typeof request.requested_changes === 'string' 
          ? JSON.parse(request.requested_changes) 
          : request.requested_changes;
        const fieldName = requestedChanges?.field_name;
        const fieldTable = requestedChanges?.field_table || 'linkedin_profiles';
        const requestedValue = requestedChanges?.value;
        const relatedRecordId = requestedChanges?.related_record_id;

        if (action === 'approve' && fieldName && requestedValue !== undefined) {
          // Apply the change
          if (fieldTable === 'linkedin_profiles') {
            await connection.query(`
              UPDATE linkedin_profiles SET ?? = ? WHERE id = ?
            `, [fieldName, requestedValue, request.linkedin_profile_id]);
          } else if (fieldTable === 'work_experience' && relatedRecordId) {
            await connection.query(`
              UPDATE work_experience SET ?? = ? WHERE id = ? AND profile_id = ?
            `, [fieldName, requestedValue, relatedRecordId, request.linkedin_profile_id]);
          }
        }

        // Update request status
        await connection.query(`
          UPDATE profile_edit_requests 
          SET status = ?, reviewed_at = NOW(), admin_notes = ?, applied_at = ${action === 'approve' ? 'NOW()' : 'NULL'}
          WHERE id = ?
        `, [action === 'approve' ? 'approved' : 'rejected', null, requestId]);

        processedCount++;
      }

      await connection.commit();

      // Send notification email to user
      if (userEmail && processedCount > 0) {
        try {
          const userMsg = {
            to: userEmail,
            from: { email: FROM_EMAIL, name: FROM_NAME },
            subject: action === 'approve' 
              ? `✅ Your ${processedCount} profile edit request(s) were approved` 
              : `❌ Your ${processedCount} profile edit request(s) were not approved`,
            html: `
              <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: ${action === 'approve' ? '#28a745' : '#dc3545'};">
                  ${action === 'approve' ? '✅ Requests Approved' : '❌ Requests Not Approved'}
                </h2>
                <p>Hi ${userName || 'there'},</p>
                <p>${processedCount} of your profile edit request(s) ${action === 'approve' 
                  ? 'have been approved. Your profile has been updated.' 
                  : 'were not approved at this time.'}
                </p>
                <p>Best regards,<br>The Estimate Team</p>
              </div>
            `
          };
          await sgMail.send(userMsg);
        } catch (emailError) {
          console.error('Failed to send user notification:', emailError);
        }
      }

      return res.send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: ${action === 'approve' ? '#28a745' : '#dc3545'};">
              ${action === 'approve' ? '✅ All Approved' : '❌ All Rejected'}
            </h1>
            <p>${processedCount} edit request(s) have been ${action === 'approve' ? 'approved and applied' : 'rejected'}.</p>
          </body>
        </html>
      `);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Batch admin review error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// ============================================================================
// GET /api/profile/admin/review/:requestId - Admin approve/reject (with secret)
// ============================================================================
router.get('/admin/review/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { action, secret, notes } = req.query;

    // SECURITY: Validate admin secret
    if (!secret || secret !== process.env.ADMIN_SECRET) {
      return res.status(403).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">❌ Unauthorized</h1>
            <p>Invalid or missing admin secret.</p>
          </body>
        </html>
      `);
    }

    if (!['approve', 'reject'].includes(action)) {
      return res.status(400).send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: #dc3545;">❌ Invalid Action</h1>
            <p>Action must be 'approve' or 'reject'.</p>
          </body>
        </html>
      `);
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Get the request
      const [requests] = await connection.query(`
        SELECT per.*, u.email as user_email, u.name as user_name
        FROM profile_edit_requests per
        JOIN users u ON per.user_id = u.id
        WHERE per.id = ?
      `, [requestId]);

      if (requests.length === 0) {
        return res.status(404).send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #dc3545;">❌ Not Found</h1>
              <p>Edit request not found.</p>
            </body>
          </html>
        `);
      }

      const request = requests[0];

      if (request.status !== 'pending') {
        return res.send(`
          <html>
            <body style="font-family: Arial; text-align: center; padding: 50px;">
              <h1 style="color: #ffc107;">⚠️ Already Processed</h1>
              <p>This request was already ${request.status}.</p>
            </body>
          </html>
        `);
      }

      await connection.beginTransaction();

      // Parse JSON fields from existing schema
      const requestedChanges = typeof request.requested_changes === 'string' 
        ? JSON.parse(request.requested_changes) 
        : request.requested_changes;
      const fieldName = requestedChanges?.field_name;
      const fieldTable = requestedChanges?.field_table || 'linkedin_profiles';
      const requestedValue = requestedChanges?.value;
      const relatedRecordId = requestedChanges?.related_record_id;

      if (action === 'approve') {
        // Apply the change to the database
        if (fieldTable === 'linkedin_profiles') {
          await connection.query(`
            UPDATE linkedin_profiles SET ?? = ? WHERE id = ?
          `, [fieldName, requestedValue, request.linkedin_profile_id]);
        } else if (fieldTable === 'work_experience' && relatedRecordId) {
          await connection.query(`
            UPDATE work_experience SET ?? = ? WHERE id = ? AND profile_id = ?
          `, [fieldName, requestedValue, relatedRecordId, request.linkedin_profile_id]);
        }
      }

      // Update request status using existing column names
      await connection.query(`
        UPDATE profile_edit_requests 
        SET status = ?, reviewed_at = NOW(), admin_notes = ?, applied_at = ${action === 'approve' ? 'NOW()' : 'NULL'}
        WHERE id = ?
      `, [action === 'approve' ? 'approved' : 'rejected', notes || null, requestId]);

      await connection.commit();

      // Send notification email to user using SendGrid
      try {
        const userMsg = {
          to: request.user_email,
          from: { email: FROM_EMAIL, name: FROM_NAME },
          subject: action === 'approve' 
            ? `✅ Your profile edit request was approved` 
            : `❌ Your profile edit request was not approved`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: ${action === 'approve' ? '#28a745' : '#dc3545'};">
                ${action === 'approve' ? '✅ Request Approved' : '❌ Request Not Approved'}
              </h2>
              
              <p>Hi ${request.user_name || 'there'},</p>
              
              <p>Your request to change <strong>${fieldName}</strong> 
              ${action === 'approve' 
                ? `has been approved. Your profile has been updated.` 
                : `was not approved at this time.`}
              </p>

              <div style="background: #f5f5f5; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Field:</strong> ${fieldName}</p>
                <p><strong>Requested Value:</strong> ${requestedValue}</p>
                ${notes ? `<p><strong>Admin Notes:</strong> ${notes}</p>` : ''}
              </div>

              <p>Best regards,<br>The Estimate Team</p>
            </div>
          `
        };
        await sgMail.send(userMsg);
      } catch (emailError) {
        console.error('Failed to send user notification:', emailError);
      }

      return res.send(`
        <html>
          <body style="font-family: Arial; text-align: center; padding: 50px;">
            <h1 style="color: ${action === 'approve' ? '#28a745' : '#dc3545'};">
              ${action === 'approve' ? '✅ Approved' : '❌ Rejected'}
            </h1>
            <p>The edit request has been ${action === 'approve' ? 'approved and applied' : 'rejected'}.</p>
            <p>User: ${request.user_name} (${request.user_email})</p>
            <p>Field: ${fieldName || 'N/A'}</p>
            <p>Value: ${requestedValue || 'N/A'}</p>
          </body>
        </html>
      `);

    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Admin review error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: Arial; text-align: center; padding: 50px;">
          <h1 style="color: #dc3545;">❌ Error</h1>
          <p>${error.message}</p>
        </body>
      </html>
    `);
  }
});

// ============================================================================
// GET /api/profile/edit-requests - Get user's edit request history
// ============================================================================
router.get('/edit-requests', async (req, res) => {
  try {
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      const [requests] = await connection.query(`
        SELECT id, request_type, current_data, requested_changes, 
               reason, status, admin_notes, requested_at, reviewed_at
        FROM profile_edit_requests
        WHERE user_id = ?
        ORDER BY requested_at DESC
        LIMIT 50
      `, [user_id]);

      return res.json({
        success: true,
        requests
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Get edit requests error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DELETE /api/profile/edit-request/:requestId - Cancel a pending edit request
// ============================================================================
router.delete('/edit-request/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const { user_id } = req.query;

    if (!user_id) {
      return res.status(400).json({ success: false, error: 'user_id is required' });
    }

    const pool = getPool();
    const connection = await pool.getConnection();

    try {
      // Verify the request exists and belongs to this user
      const [requests] = await connection.query(`
        SELECT id, status FROM profile_edit_requests
        WHERE id = ? AND user_id = ?
      `, [requestId, user_id]);

      if (requests.length === 0) {
        return res.status(404).json({ success: false, error: 'Request not found' });
      }

      if (requests[0].status !== 'pending') {
        return res.status(400).json({ 
          success: false, 
          error: 'Only pending requests can be cancelled' 
        });
      }

      // Delete the request
      await connection.query(`
        DELETE FROM profile_edit_requests WHERE id = ?
      `, [requestId]);

      return res.json({
        success: true,
        message: 'Edit request cancelled successfully'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('Cancel edit request error:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
