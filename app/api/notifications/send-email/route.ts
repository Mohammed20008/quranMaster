import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { render } from '@react-email/render';
import TeacherApprovedEmail from '@/app/emails/teacher-approved';
import TeacherRejectedEmail from '@/app/emails/teacher-rejected';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      to, 
      teacherName, 
      emailType, // 'approved' or 'rejected'
      feedback, // Optional feedback for rejection
    } = body;

    // Validation
    if (!to || !teacherName || !emailType) {
      return NextResponse.json(
        { error: 'Missing required fields: to, teacherName, emailType' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(emailType)) {
      return NextResponse.json(
        { error: 'emailType must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Base URLs
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const loginUrl = `${baseUrl}/login`;
    const profileUrl = `${baseUrl}/teacher/profile`;
    const reapplyUrl = `${baseUrl}/learn/join-teacher`;
    const supportEmail = process.env.ADMIN_EMAIL || 'support@quranmaster.com';

    // Prepare email content based on type
    let subject: string;
    let emailHtml: string;

    if (emailType === 'approved') {
      subject = '🎉 Congratulations! Your QuranMaster Teacher Application is Approved';
      emailHtml = render(
        TeacherApprovedEmail({
          teacherName,
          loginUrl,
          profileUrl,
        })
      );
    } else {
      subject = 'Update on Your QuranMaster Teacher Application';
      emailHtml = render(
        TeacherRejectedEmail({
          teacherName,
          reapplyUrl,
          supportEmail,
          feedback,
        })
      );
    }

    // Send email using Resend
    const data = await resend.emails.send({
      from: 'QuranMaster <no-reply@quranmaster.com>',
      to: [to],
      subject,
      html: emailHtml,
    });

    return NextResponse.json({
      success: true,
      messageId: data.id,
      message: `${emailType === 'approved' ? 'Approval' : 'Rejection'} email sent successfully to ${to}`,
    });

  } catch (error: any) {
    console.error('Error sending email:', error);
    
    return NextResponse.json(
      {
        error: 'Failed to send email',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to test email templates (development only)
export async function GET(request: NextRequest) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  const searchParams = request.nextUrl.searchParams;
  const type = searchParams.get('type') || 'approved';

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  
  try {
    let emailHtml: string;

    if (type === 'approved') {
      emailHtml = render(
        TeacherApprovedEmail({
          teacherName: 'Ahmad Abdullah',
          loginUrl: `${baseUrl}/login`,
          profileUrl: `${baseUrl}/teacher/profile`,
        })
      );
    } else {
      emailHtml = render(
        TeacherRejectedEmail({
          teacherName: 'Ahmad Abdullah',
          reapplyUrl: `${baseUrl}/learn/join-teacher`,
          supportEmail: 'support@quranmaster.com',
          feedback: 'Thank you for your application. We recommend gaining more teaching experience and obtaining Ijazah certification before reapplying.',
        })
      );
    }

    return new NextResponse(emailHtml, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
