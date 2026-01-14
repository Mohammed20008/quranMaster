import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse } from '@/app/lib/ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    const result = await generateAIResponse(message, conversationHistory);

    if (result.success) {
      return NextResponse.json({
        message: result.message,
        success: true,
      });
    } else {
      // Return the specific error message from the AI service
      return NextResponse.json({
        message: result.message,
        success: false,
        errorType: result.error,
      }, { status: 200 }); // Return 200 so frontend can show the message
    }
  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat request' },
      { status: 500 }
    );
  }
}
