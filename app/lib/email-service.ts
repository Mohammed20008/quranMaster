export async function sendEmail(to: string, subject: string, body: string): Promise<boolean> {
  // Simulate network delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Log the email to console (mocking the sending)
  console.log(`
    📨 MOCK EMAIL SENDING...
    to: ${to}
    subject: ${subject}
    body: ${body}
    ------------------------
  `);
  
  return true;
}

export function generateAcceptanceEmail(teacherName: string, profileUrl: string): string {
  return `
    Dear ${teacherName},

    Congratulations! Your application to join QuranMaster as a teacher has been approved.
    
    You can view your public profile here:
    ${profileUrl}
    
    Please log in to your dashboard to complete your profile setup and set your availability.
    
    Welcome to the team!
    QuranMaster Team
  `;
}

export function generateRejectionEmail(teacherName: string, reason: string): string {
  return `
    Dear ${teacherName},

    Thank you for your interest in joining QuranMaster.
    
    After reviewing your application, we regret to inform you that we cannot accept it at this time.
    
    Reason:
    ${reason}
    
    You are welcome to apply again in the future.
    
    Best regards,
    QuranMaster Team
  `;
}
