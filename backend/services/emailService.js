/**
 * Email Service for Estimate
 * Uses SendGrid to send transactional emails
 */

const sgMail = require('@sendgrid/mail');

// Initialize SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@estimatenow.io';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Estimate';
const FRONTEND_URL = process.env.FRONTEND_URL || 'https://estimatenow.io';

/**
 * Send email notification when someone receives a new review
 */
async function sendNewReviewNotification(recipientEmail, recipientName, reviewCount, unsubscribeToken) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[EMAIL] SendGrid not configured, skipping email');
    return { success: false, reason: 'SendGrid not configured' };
  }

  if (!recipientEmail) {
    console.log('[EMAIL] No recipient email provided');
    return { success: false, reason: 'No recipient email' };
  }

  if (!unsubscribeToken) {
    console.log('[EMAIL] No unsubscribe token provided');
    return { success: false, reason: 'No unsubscribe token' };
  }

  // Check email preferences before sending
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306
    });

    const [users] = await connection.query(
      'SELECT email_notifications, email_new_reviews FROM users WHERE email = ?',
      [recipientEmail]
    );

    await connection.end();

    if (users.length > 0) {
      const user = users[0];
      // Check if user has unsubscribed from new review notifications
      if (!user.email_notifications || !user.email_new_reviews) {
        console.log(`[EMAIL] User ${recipientEmail} has unsubscribed from new review notifications`);
        return { success: false, reason: 'User has unsubscribed' };
      }
    }
  } catch (error) {
    console.error('[EMAIL] Error checking preferences:', error.message);
    // Continue sending email if preference check fails (fail open)
  }

  const firstName = recipientName?.split(' ')[0] || 'there';
  
  const msg = {
    to: recipientEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: `🎯 You just received a new peer review on Estimate!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">
                <span style="color: #0A66C2;">E</span>stimate
              </h1>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #ECFDF5; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🎯</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">
                Hey ${firstName}!
              </h2>
              <p style="margin: 0 0 8px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                A colleague just reviewed you on Estimate.
              </p>
              <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                You now have <strong style="color: #0A66C2;">${reviewCount} review${reviewCount !== 1 ? 's' : ''}</strong> from your professional network.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <a href="${FRONTEND_URL}/profile" 
                 style="display: inline-block; padding: 16px 40px; background-color: #0A66C2; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(10, 102, 194, 0.3);">
                View Your Score
              </a>
            </td>
          </tr>
          
          <!-- Info Box -->
          <tr>
            <td style="padding: 0 40px 30px 40px;">
              <div style="background-color: #F9FAFB; border-radius: 8px; padding: 20px; text-align: center;">
                <p style="margin: 0; font-size: 14px; color: #6B7280;">
                  🔒 <strong>100% Anonymous</strong> — You'll never know who reviewed you, ensuring honest feedback.
                </p>
              </div>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9CA3AF;">
                Estimate — Anonymous Professional Peer Reviews
              </p>
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9CA3AF;">
                <a href="${FRONTEND_URL}" style="color: #0A66C2; text-decoration: none;">estimatenow.io</a>
              </p>
              <p style="margin: 0; font-size: 11px; color: #9CA3AF;">
                <a href="${FRONTEND_URL}/unsubscribe/${unsubscribeToken}" style="color: #9CA3AF; text-decoration: underline;">Unsubscribe</a> | 
                <a href="${FRONTEND_URL}/privacy" style="color: #9CA3AF; text-decoration: underline;">Privacy Policy</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Hey ${firstName}! A colleague just reviewed you on Estimate. You now have ${reviewCount} review${reviewCount !== 1 ? 's' : ''} from your professional network. View your score at ${FRONTEND_URL}/profile\n\nUnsubscribe: ${FRONTEND_URL}/unsubscribe/${unsubscribeToken}`
  };

  try {
    await sgMail.send(msg);
    console.log(`[EMAIL] New review notification sent to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send new review notification:', error.message);
    if (error.response) {
      console.error('[EMAIL] SendGrid error body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Send email notification when user unlocks their score (3 reviews given)
 */
async function sendScoreUnlockedNotification(recipientEmail, recipientName, unsubscribeToken) {
  if (!process.env.SENDGRID_API_KEY) {
    console.log('[EMAIL] SendGrid not configured, skipping email');
    return { success: false, reason: 'SendGrid not configured' };
  }

  if (!recipientEmail) {
    console.log('[EMAIL] No recipient email provided');
    return { success: false, reason: 'No recipient email' };
  }

  if (!unsubscribeToken) {
    console.log('[EMAIL] No unsubscribe token provided');
    return { success: false, reason: 'No unsubscribe token' };
  }

  // Check email preferences before sending
  try {
    const mysql = require('mysql2/promise');
    const connection = await mysql.createConnection({
      host: process.env.CLOUD_SQL_HOST,
      user: process.env.CLOUD_SQL_USER,
      password: process.env.CLOUD_SQL_PASSWORD,
      database: process.env.CLOUD_SQL_DATABASE,
      port: process.env.CLOUD_SQL_PORT || 3306
    });

    const [users] = await connection.query(
      'SELECT email_notifications, email_score_unlocked FROM users WHERE email = ?',
      [recipientEmail]
    );

    await connection.end();

    if (users.length > 0) {
      const user = users[0];
      // Check if user has unsubscribed from score unlocked notifications
      if (!user.email_notifications || !user.email_score_unlocked) {
        console.log(`[EMAIL] User ${recipientEmail} has unsubscribed from score unlocked notifications`);
        return { success: false, reason: 'User has unsubscribed' };
      }
    }
  } catch (error) {
    console.error('[EMAIL] Error checking preferences:', error.message);
    // Continue sending email if preference check fails (fail open)
  }

  const firstName = recipientName?.split(' ')[0] || 'there';
  
  const msg = {
    to: recipientEmail,
    from: {
      email: FROM_EMAIL,
      name: FROM_NAME
    },
    subject: `🎉 Your Estimate score is now unlocked!`,
    html: `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 500px; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="padding: 40px 40px 20px 40px; text-align: center;">
              <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #111827;">
                <span style="color: #0A66C2;">E</span>stimate
              </h1>
            </td>
          </tr>
          
          <!-- Icon -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <div style="width: 80px; height: 80px; background-color: #FEF3C7; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center;">
                <span style="font-size: 40px;">🎉</span>
              </div>
            </td>
          </tr>
          
          <!-- Main Content -->
          <tr>
            <td style="padding: 20px 40px; text-align: center;">
              <h2 style="margin: 0 0 16px 0; font-size: 24px; font-weight: 600; color: #111827;">
                Congratulations, ${firstName}!
              </h2>
              <p style="margin: 0 0 8px 0; font-size: 18px; color: #374151; line-height: 1.6;">
                You've completed 3 reviews and your professional score is now <strong style="color: #10B981;">unlocked</strong>!
              </p>
              <p style="margin: 0; font-size: 16px; color: #6B7280; line-height: 1.6;">
                See how your colleagues rate your professional skills.
              </p>
            </td>
          </tr>
          
          <!-- CTA Button -->
          <tr>
            <td style="padding: 30px 40px; text-align: center;">
              <a href="${FRONTEND_URL}/profile" 
                 style="display: inline-block; padding: 16px 40px; background-color: #10B981; color: #ffffff; text-decoration: none; font-size: 16px; font-weight: 600; border-radius: 8px; box-shadow: 0 2px 4px rgba(16, 185, 129, 0.3);">
                View Your Score
              </a>
            </td>
          </tr>
          
          <!-- Footer -->
          <tr>
            <td style="padding: 20px 40px 40px 40px; text-align: center; border-top: 1px solid #E5E7EB;">
              <p style="margin: 0 0 8px 0; font-size: 12px; color: #9CA3AF;">
                Estimate — Anonymous Professional Peer Reviews
              </p>
              <p style="margin: 0; font-size: 12px; color: #9CA3AF;">
                <a href="${FRONTEND_URL}" style="color: #0A66C2; text-decoration: none;">estimatenow.io</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
    `,
    text: `Congratulations ${firstName}! You've completed 3 reviews and your professional score is now unlocked! See how your colleagues rate your professional skills at ${FRONTEND_URL}/profile`
  };

  try {
    await sgMail.send(msg);
    console.log(`[EMAIL] Score unlocked notification sent to ${recipientEmail}`);
    return { success: true };
  } catch (error) {
    console.error('[EMAIL] Failed to send score unlocked notification:', error.message);
    if (error.response) {
      console.error('[EMAIL] SendGrid error body:', error.response.body);
    }
    return { success: false, error: error.message };
  }
}

/**
 * Test function to send a sample review notification
 */
async function sendTestEmail(testEmail, testName = 'Liran') {
  console.log(`[EMAIL] Sending test email to ${testEmail}`);
  return sendNewReviewNotification(testEmail, testName, 3);
}

module.exports = {
  sendNewReviewNotification,
  sendScoreUnlockedNotification,
  sendTestEmail
};
