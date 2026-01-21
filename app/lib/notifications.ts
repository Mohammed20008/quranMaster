/**
 * Notification Helper
 * Utility functions to send email and WhatsApp notifications
 */

export interface NotificationParams {
  teacherName: string;
  teacherEmail: string;
  teacherPhone?: string; // In E.164 format: +1234567890
  type: 'approved' | 'rejected';
  feedback?: string; // Optional feedback for rejection emails
}

export interface NotificationResult {
  emailSent: boolean;
  whatsappSent: boolean;
  errors: string[];
  details: {
    email?: any;
    whatsapp?: any;
  };
}

/**
 * Send approval or rejection notification via email and WhatsApp
 */
export async function sendTeacherNotification(
  params: NotificationParams
): Promise<NotificationResult> {
  const result: NotificationResult = {
    emailSent: false,
    whatsappSent: false,
    errors: [],
    details: {},
  };

  // Send Email Notification
  try {
    const emailResponse = await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to: params.teacherEmail,
        teacherName: params.teacherName,
        emailType: params.type,
        feedback: params.feedback,
      }),
    });

    const emailData = await emailResponse.json();

    if (emailResponse.ok) {
      result.emailSent = true;
      result.details.email = emailData;
    } else {
      result.errors.push(`Email error: ${emailData.error || 'Unknown error'}`);
      result.details.email = emailData;
    }
  } catch (error: any) {
    result.errors.push(`Email exception: ${error.message}`);
  }

  // Send WhatsApp Notification (if phone number provided)
  if (params.teacherPhone) {
    try {
      const whatsappResponse = await fetch('/api/notifications/send-whatsapp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          to: params.teacherPhone,
          teacherName: params.teacherName,
          messageType: params.type,
        }),
      });

      const whatsappData = await whatsappResponse.json();

      if (whatsappResponse.ok) {
        result.whatsappSent = true;
        result.details.whatsapp = whatsappData;
      } else {
        // Don't treat WhatsApp errors as critical if it's a configuration issue
        if (whatsappResponse.status === 503) {
          result.errors.push('WhatsApp not configured (skipped)');
        } else {
          result.errors.push(`WhatsApp error: ${whatsappData.error || 'Unknown error'}`);
        }
        result.details.whatsapp = whatsappData;
      }
    } catch (error: any) {
      result.errors.push(`WhatsApp exception: ${error.message}`);
    }
  } else {
    // Phone number not provided
    result.errors.push('WhatsApp skipped: no phone number provided');
  }

  return result;
}

/**
 * Send approval notification
 */
export async function sendApprovalNotification(
  teacherName: string,
  teacherEmail: string,
  teacherPhone?: string
): Promise<NotificationResult> {
  return sendTeacherNotification({
    teacherName,
    teacherEmail,
    teacherPhone,
    type: 'approved',
  });
}

/**
 * Send rejection notification with optional feedback
 */
export async function sendRejectionNotification(
  teacherName: string,
  teacherEmail: string,
  feedback?: string,
  teacherPhone?: string
): Promise<NotificationResult> {
  return sendTeacherNotification({
    teacherName,
    teacherEmail,
    teacherPhone,
    type: 'rejected',
    feedback,
  });
}

/**
 * Format phone number to E.164 format
 * Example: (555) 123-4567 -> +15551234567
 */
export function formatPhoneE164(phone: string, countryCode: string = '+1'): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  // If already starts with country code, return as is
  if (digits.length > 10 && digits.startsWith(countryCode.replace('+', ''))) {
    return `+${digits}`;
  }
  
  // Otherwise, prepend country code
  return `${countryCode}${digits}`;
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic E.164 check)
 */
export function isValidPhone(phone: string): boolean {
  // E.164 format: +[country code][number]
  // Length should be 10-15 digits after country code
  const e164Regex = /^\+[1-9]\d{9,14}$/;
  return e164Regex.test(phone);
}
