import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { userName, userEmail, message } = body;

    if (!userName || !userEmail || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Admin WhatsApp number from environment
    const adminWhatsApp = process.env.NEXT_PUBLIC_ADMIN_WHATSAPP || '+201097677202';
    
    // Create WhatsApp message
    const whatsappMessage = encodeURIComponent(
      `🔔 *New Support Request from QuranMaster*\n\n` +
      `👤 *User:* ${userName}\n` +
      `📧 *Email:* ${userEmail}\n` +
      `💬 *Message:*\n${message}\n\n` +
      `_Sent at ${new Date().toLocaleString()}_`
    );

    // Generate wa.me link
    const whatsappLink = `https://wa.me/${adminWhatsApp.replace(/[^0-9]/g, '')}?text=${whatsappMessage}`;

    return NextResponse.json({
      success: true,
      whatsappLink,
      message: 'Admin notification prepared',
    });
  } catch (error) {
    console.error('Notify Admin API Error:', error);
    return NextResponse.json(
      { error: 'Failed to create admin notification' },
      { status: 500 }
    );
  }
}
