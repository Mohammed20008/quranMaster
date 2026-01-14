import { NextRequest, NextResponse } from 'next/server';
import { generateAIResponse, AIErrorType } from '@/app/lib/ai-service';

// Simple in-memory rate limiting (for production, use Redis or similar)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 10;

function getRateLimitKey(request: NextRequest): string {
  // Use IP address or session ID for rate limiting
  const forwarded = request.headers.get('x-forwarded-for');
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
  return ip;
}

function checkRateLimit(key: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const record = rateLimitMap.get(key);

  if (!record || now > record.resetTime) {
    // Reset or create new record
    rateLimitMap.set(key, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW,
    });
    return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - 1 };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    return { allowed: false, remaining: 0 };
  }

  record.count++;
  return { allowed: true, remaining: MAX_REQUESTS_PER_WINDOW - record.count };
}

export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    // Rate limiting
    const rateLimitKey = getRateLimitKey(request);
    const { allowed, remaining } = checkRateLimit(rateLimitKey);

    if (!allowed) {
      console.warn(`⚠️ Rate limit exceeded for ${rateLimitKey}`);
      return NextResponse.json(
        {
          success: false,
          message: '⏱️ Too many requests. Please wait a moment before trying again.',
          errorType: 'RATE_LIMIT',
        },
        { 
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': String(Date.now() + RATE_LIMIT_WINDOW),
          }
        }
      );
    }

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('❌ Failed to parse request body:', parseError);
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid request format',
          errorType: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    const { message, conversationHistory = [] } = body;

    // Validate message
    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { 
          success: false,
          message: 'Message is required and must be a string',
          errorType: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate message length
    if (message.trim().length === 0) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Message cannot be empty',
          errorType: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    if (message.length > 2000) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Message is too long. Please keep it under 2000 characters.',
          errorType: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    // Validate conversation history
    if (!Array.isArray(conversationHistory)) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Conversation history must be an array',
          errorType: 'VALIDATION_ERROR',
        },
        { status: 400 }
      );
    }

    console.log(`📝 AI Chat Request: "${message.substring(0, 50)}${message.length > 50 ? '...' : ''}"`);

    // Generate AI response
    const result = await generateAIResponse(message, conversationHistory);

    const duration = Date.now() - startTime;
    console.log(`⏱️ AI Response generated in ${duration}ms`);

    if (result.success) {
      return NextResponse.json(
        {
          message: result.message,
          success: true,
        },
        {
          headers: {
            'X-RateLimit-Remaining': String(remaining),
            'X-Response-Time': String(duration),
          }
        }
      );
    } else {
      // Return the specific error message from the AI service
      console.warn(`⚠️ AI Error Type: ${result.errorType}`);
      
      return NextResponse.json(
        {
          message: result.message,
          success: false,
          errorType: result.errorType,
          errorDetails: process.env.NODE_ENV === 'development' ? result.errorDetails : undefined,
        },
        { 
          status: 200, // Return 200 so frontend can show the user-friendly message
          headers: {
            'X-RateLimit-Remaining': String(remaining),
            'X-Response-Time': String(duration),
          }
        }
      );
    }
  } catch (error: any) {
    const duration = Date.now() - startTime;
    console.error('❌ Chat API Error:', {
      error: error?.message || error,
      stack: error?.stack,
      duration,
    });

    return NextResponse.json(
      { 
        success: false,
        message: 'An unexpected error occurred. Please try again later or contact support.',
        errorType: 'SERVER_ERROR',
        errorDetails: process.env.NODE_ENV === 'development' ? error?.message : undefined,
      },
      { 
        status: 500,
        headers: {
          'X-Response-Time': String(duration),
        }
      }
    );
  }
}
