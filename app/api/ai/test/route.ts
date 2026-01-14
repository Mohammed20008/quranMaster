import { NextResponse } from 'next/server';
import Groq from 'groq-sdk';

export async function GET() {
  const apiKey = process.env.GROQ_API_KEY;
  
  // Check if API key exists
  if (!apiKey) {
    return NextResponse.json({
      success: false,
      error: 'API key not configured',
      message: 'GROQ_API_KEY environment variable is missing'
    }, { status: 500 });
  }

  // Test connection to Groq API
  try {
    const groq = new Groq({ apiKey });

    // Make a simple test request
    const response = await groq.chat.completions.create({
      model: 'llama3-8b-8192',
      messages: [
        { role: 'user', content: 'Say "Hi" in one word' }
      ],
      max_tokens: 10,
      temperature: 0.7,
    });

    const message = response.choices[0]?.message?.content || 'No response';

    return NextResponse.json({
      success: true,
      message: 'Groq connection successful! ⚡',
      apiKeyValid: true,
      testResponse: message,
      model: 'llama3-8b-8192 (Meta Llama 3)'
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: 'Connection failed',
      message: error.message,
      details: 'Unable to connect to Groq API. Check your API key and network connection.'
    }, { status: 500 });
  }
}
