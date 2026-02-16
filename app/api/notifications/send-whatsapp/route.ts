import { NextRequest, NextResponse } from 'next/server';
import twilio from 'twilio';

// Initialize Twilio client
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioWhatsAppNumber = process.env.TWILIO_WHATSAPP_NUMBER || 'whatsapp:+14155238886';

let twilioClient: ReturnType<typeof twilio> | null = null;

// Only initialize if credentials are available
if (accountSid && authToken) {
  twilioClient = twilio(accountSid, authToken);
}

export async function POST(request: NextRequest) {
  try {
    // Check if Twilio is configured
    if (!twilioClient) {
      return NextResponse.json(
        {
          error: 'WhatsApp notifications are not configured',
          message: 'Missing Twilio credentials in environment variables',
        },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { 
      to, // Phone number in E.164 format (e.g., +1234567890)
      teacherName,
      messageType, // 'approved' or 'rejected'
    } = body;

    // Validation
    if (!to || !teacherName || !messageType) {
      return NextResponse.json(
        { error: 'Missing required fields: to, teacherName, messageType' },
        { status: 400 }
      );
    }

    if (!['approved', 'rejected'].includes(messageType)) {
      return NextResponse.json(
        { error: 'messageType must be either "approved" or "rejected"' },
        { status: 400 }
      );
    }

    // Ensure phone number has whatsapp: prefix
    const whatsappNumber = to.startsWith('whatsapp:') ? to : `whatsapp:${to}`;

    // Base URL for links
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

    // Prepare message content based on type
    let messageBody: string;

    if (messageType === 'approved') {
      messageBody = `🎉 *Congratulations, ${teacherName}!*\n\n` +
        `Your QuranMaster teacher application has been *approved*! ✅\n\n` +
        `You are now part of our elite community of Quran educators.\n\n` +
        `*Next Steps:*\n` +
        `1️⃣ Complete your profile\n` +
        `2️⃣ Set your availability\n` +
        `3️⃣ Start teaching!\n\n` +
        `Login now: ${baseUrl}/login\n\n` +
        `Welcome to the QuranMaster family! 🌟`;
    } else {
      messageBody = `Dear ${teacherName},\n\n` +
        `Thank you for your interest in joining QuranMaster as a teacher.\n\n` +
        `After careful review, we are unable to approve your application at this time. We encourage you to strengthen your qualifications and reapply in the future.\n\n` +
        `For guidance, contact: support@quranmaster.com\n\n` +
        `May Allah bless your journey. 🤲`;
    }

    // Send WhatsApp message via Twilio
    const message = await twilioClient.messages.create({
      from: twilioWhatsAppNumber,
      to: whatsappNumber,
      body: messageBody,
    });

    return NextResponse.json({
      success: true,
      messageSid: message.sid,
      status: message.status,
      message: `WhatsApp ${messageType === 'approved' ? 'approval' : 'rejection'} message sent to ${to}`,
    });

  } catch (error) {
    const twilioError = error as { code: number; message: string };
    console.error('Error sending WhatsApp message:', twilioError);

    // Handle specific Twilio errors
    if (twilioError.code === 21211) {
      return NextResponse.json(
        {
          error: 'Invalid phone number',
          message: 'The provided phone number is not valid for WhatsApp',
          details: twilioError.message,
        },
        { status: 400 }
      );
    }

    if (twilioError.code === 21408) {
      return NextResponse.json(
        {
          error: 'Permission denied',
          message: 'Your Twilio account does not have permission to send WhatsApp messages',
          details: twilioError.message,
        },
        { status: 403 }
      );
    }

    return NextResponse.json(
      {
        error: 'Failed to send WhatsApp message',
        details: twilioError.message,
        code: twilioError.code,
      },
      { status: 500 }
    );
  }
}

// GET endpoint to check WhatsApp configuration status
export async function GET() {
  const isConfigured = !!(accountSid && authToken && twilioWhatsAppNumber);

  return NextResponse.json({
    configured: isConfigured,
    message: isConfigured 
      ? 'WhatsApp notifications are configured and ready' 
      : 'WhatsApp notifications require Twilio credentials',
    environment: {
      hasSID: !!accountSid,
      hasToken: !!authToken,
      hasNumber: !!twilioWhatsAppNumber,
    },
  });
}
