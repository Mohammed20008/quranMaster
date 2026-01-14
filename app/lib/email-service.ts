import { Resend } from 'resend';
import { render } from '@react-email/render';
import { TeacherApprovalEmail } from '@/app/emails/teacher-approval';
import { TeacherRejectionEmail } from '@/app/emails/teacher-rejection';

// Initialize Resend client
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;

// Configuration
const IS_DEVELOPMENT = process.env.NODE_ENV === 'development';
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'QuranMaster <onboarding@resend.dev>'; // Update with your verified domain
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@quranmaster.com';

interface EmailOptions {
  to: string;
  subject: string;
  htmlBody: string;
  from?: string;
}

interface EmailResult {
  success: boolean;
  messageId?: string;
  error?: string;
}

/**
 * Send an email using Resend API
 * In development mode, it logs the email and opens a preview instead of sending
 */
export async function sendEmail(
  to: string, 
  subject: string, 
  htmlBody: string,
  from: string = FROM_EMAIL
): Promise<EmailResult> {
  try {
    // Development mode: Log and show preview instead of sending
    if (IS_DEVELOPMENT || !resend) {
      console.log(`
╔════════════════════════════════════════════════════════════
║ 📧 EMAIL PREVIEW (Development Mode)
╠════════════════════════════════════════════════════════════
║ From: ${from}
║ To: ${to}
║ Subject: ${subject}
╚════════════════════════════════════════════════════════════
      `);

      // Open preview in browser
      if (typeof window !== 'undefined') {
        try {
          const blob = new Blob([htmlBody], { type: 'text/html' });
          const url = URL.createObjectURL(blob);
          window.open(url, '_blank');
        } catch (e) {
          console.error('Failed to open email preview', e);
        }
      }

      if (!resend) {
        console.warn('⚠️ RESEND_API_KEY not configured. Emails will not be sent in production.');
      }

      return { success: true, messageId: `dev-${Date.now()}` };
    }

    // Production mode: Send actual email
    console.log(`📤 Sending email to ${to}: "${subject}"`);
    
    const data = await resend.emails.send({
      from,
      to: [to],
      subject,
      html: htmlBody,
    });

    if (data.error) {
      console.error('❌ Email send error:', data.error);
      return {
        success: false,
        error: data.error.message || 'Failed to send email',
      };
    }

    console.log(`✅ Email sent successfully. ID: ${data.data?.id}`);
    
    return {
      success: true,
      messageId: data.data?.id || 'unknown',
    };
  } catch (error: any) {
    console.error('❌ Email service error:', error);
    return {
      success: false,
      error: error?.message || 'Unknown email error',
    };
  }
}

/**
 * Send WhatsApp notification (mock implementation)
 * In a real app, integrate with Twilio or similar
 */
export async function sendWhatsAppNotification(to: string, message: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`
╔════════════════════════════════════════════════════════════
║ 📱 WHATSAPP NOTIFICATION (Mock)
╠════════════════════════════════════════════════════════════
║ To: ${to}
║ Message: ${message.substring(0, 100)}${message.length > 100 ? '...' : ''}
╚════════════════════════════════════════════════════════════
  `);

  if (typeof window !== 'undefined') {
    const encodedMessage = encodeURIComponent(message);
    const cleanPhone = to.replace(/[^\d+]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  }

  return true;
}

/**
 * Generate Teacher Approval Email HTML
 */
export async function generateAcceptanceEmail(teacherName: string, profileUrl: string): Promise<string> {
  return await render(TeacherApprovalEmail({ teacherName, profileUrl }));
}

/**
 * Generate Teacher Rejection Email HTML
 */
export async function generateRejectionEmail(teacherName: string, reason: string): Promise<string> {
  return await render(TeacherRejectionEmail({ teacherName, reason }));
}

/**
 * Send email to admin about new teacher application
 */
export async function notifyAdminNewApplication(
  teacherName: string,
  teacherEmail: string,
  applicationId: string
): Promise<EmailResult> {
  const appUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/teachers/${applicationId}`;
  
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #b4941f); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
          .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background: #d4af37; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 10px 0; }
          .details { background: white; padding: 15px; border-left: 4px solid #d4af37; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h2 style="margin: 0;">🎓 New Teacher Application</h2>
          </div>
          <div class="content">
            <p>A new teacher has applied to join QuranMaster!</p>
            
            <div class="details">
              <strong>Teacher Name:</strong> ${teacherName}<br>
              <strong>Email:</strong> ${teacherEmail}<br>
              <strong>Application ID:</strong> ${applicationId}
            </div>

            <p>Please review their application and make a decision:</p>
            
            <a href="${appUrl}" class="button">Review Application →</a>
            
            <p style="color: #666; font-size: 14px; margin-top: 30px;">
              This is an automated notification from QuranMaster
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(
    ADMIN_EMAIL,
    `New Teacher Application: ${teacherName}`,
    htmlBody,
    FROM_EMAIL
  );
}

/**
 * Send welcome email to new teacher applicant
 */
export async function sendApplicationReceivedEmail(teacherName: string, teacherEmail: string): Promise<EmailResult> {
  const htmlBody = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #d4af37, #b4941f); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background: #fff; padding: 30px; border: 1px solid #e0e0e0; border-top: none; border-radius: 0 0 8px 8px; }
          .icon { font-size: 48px; margin-bottom: 10px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="icon">✨</div>
            <h1 style="margin: 0; font-size: 28px;">Application Received!</h1>
          </div>
          <div class="content">
            <p>Dear <strong>${teacherName}</strong>,</p>
            
            <p>Thank you for your interest in joining the QuranMaster teaching community!</p>
            
            <p>We have received your application and our team is currently reviewing it. You can expect to hear back from us within 2-3 business days.</p>
            
            <p>If you have any questions in the meantime, please don't hesitate to reach out to us.</p>
            
            <p style="margin-top: 30px;">
              Warm regards,<br>
              <strong>The QuranMaster Team</strong>
            </p>
          </div>
        </div>
      </body>
    </html>
  `;

  return await sendEmail(
    teacherEmail,
    'Application Received - QuranMaster',
    htmlBody
  );
}

// Export types
export type { EmailOptions, EmailResult };
