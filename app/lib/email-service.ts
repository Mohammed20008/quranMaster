import { render } from '@react-email/render';
import { TeacherApprovalEmail } from '@/app/emails/teacher-approval';
import { TeacherRejectionEmail } from '@/app/emails/teacher-rejection';

export async function sendEmail(to: string, subject: string, htmlBody: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Log the email to console (mocking the sending)
  // In production, you would use 'resend' or 'nodemailer' here with the htmlBody
  console.log(`
    📨 MOCK EMAIL SENDING...
    to: ${to}
    subject: ${subject}
    html (preview): ${htmlBody.substring(0, 100)}...
    ------------------------
  `);
  
  return true;
}


export async function sendWhatsAppNotification(to: string, message: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 800));

  console.log(`
    📱 MOCK WHATSAPP SENDING...
    to: ${to}
    message: ${message}
    ------------------------
  `);

  if (typeof window !== 'undefined') {
      const encodedMessage = encodeURIComponent(message);
      // Clean phone number: remove non-numeric or +, depending on standard.
      // Assuming 'to' is like '+123...'
      const cleanPhone = to.replace(/[^\d+]/g, ''); 
      window.open(`https://wa.me/${cleanPhone}?text=${encodedMessage}`, '_blank');
  }

  return true;
}

export async function generateAcceptanceEmail(teacherName: string, profileUrl: string): Promise<string> {
  return await render(TeacherApprovalEmail({ teacherName, profileUrl }));
}

export async function generateRejectionEmail(teacherName: string, reason: string): Promise<string> {
  return await render(TeacherRejectionEmail({ teacherName, reason }));
}
