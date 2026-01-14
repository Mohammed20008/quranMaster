import Groq from 'groq-sdk';

// Error types for better error handling
export enum AIErrorType {
  API_KEY_INVALID = 'API_KEY_INVALID',
  RATE_LIMIT = 'RATE_LIMIT',
  QUOTA_EXCEEDED = 'QUOTA_EXCEEDED',
  NETWORK_ERROR = 'NETWORK_ERROR',
  MODEL_ERROR = 'MODEL_ERROR',
  UNKNOWN = 'UNKNOWN',
}

interface AIResponse {
  success: boolean;
  message: string;
  errorType?: AIErrorType;
  errorDetails?: string;
}

const apiKey = process.env.GROQ_API_KEY;

// Validate API key on initialization
let groq: Groq | null = null;

function initializeAI(): Groq {
  if (!apiKey || apiKey.trim() === '') {
    console.error('❌ GROQ_API_KEY is not configured in environment variables');
    throw new Error('GROQ_API_KEY is not configured');
  }

  if (!groq) {
    groq = new Groq({ apiKey });
    console.log('✅ Groq AI initialized successfully');
  }

  return groq;
}

const SYSTEM_INSTRUCTION = `You are a knowledgeable and respectful Islamic AI assistant for QuranMaster, an app helping Muslims read and learn the Quran and Hadith.

Your responsibilities:
- Answer questions about the Quran, Hadith, Islamic teachings, and practices
- Provide accurate information about Surahs, verses, and their meanings
- Explain Islamic concepts with clarity and respect
- Guide users in their spiritual journey
- Always cite Quran verses or Hadith references when applicable

Guidelines:
- Be respectful and humble in all responses
- If unsure about Islamic rulings, recommend consulting with a qualified scholar
- Keep responses concise but informative
- Use simple language accessible to all knowledge levels
- Never provide incorrect or fabricated Islamic information
- If a question is beyond your knowledge, be honest about limitations
- For complex fiqh (jurisprudence) questions, suggest speaking with a local imam or scholar

When users ask about specific Surahs or verses, provide context, meaning, and practical application.

Remember: You're here to educate, inspire, and support Muslims in their faith journey.`;

/**
 * Classify error and return appropriate error type
 */
function classifyError(error: any): AIErrorType {
  const errorMessage = error?.message?.toLowerCase() || '';
  const errorCode = error?.code || error?.status;
  const errorType = error?.type?.toLowerCase() || '';

  console.log('🔍 Error Classification Debug:', {
    message: errorMessage,
    code: errorCode,
    type: errorType,
  });

  // API Key errors
  if (
    errorMessage.includes('invalid api key') ||
    errorMessage.includes('incorrect api key') ||
    errorMessage.includes('unauthorized') ||
    errorMessage.includes('authentication') ||
    errorCode === 401
  ) {
    return AIErrorType.API_KEY_INVALID;
  }

  // Rate limiting
  if (errorMessage.includes('rate limit') || errorCode === 429) {
    return AIErrorType.RATE_LIMIT;
  }

  // Quota/billing errors
  if (
    errorMessage.includes('quota') ||
    errorMessage.includes('insufficient_quota') ||
    errorMessage.includes('billing')
  ) {
    return AIErrorType.QUOTA_EXCEEDED;
  }

  // Network errors
  if (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('enotfound') ||
    errorMessage.includes('timeout')
  ) {
    return AIErrorType.NETWORK_ERROR;
  }

  // Model errors
  if (errorMessage.includes('model') || errorCode === 400 || errorCode === 503) {
    return AIErrorType.MODEL_ERROR;
  }

  return AIErrorType.UNKNOWN;
}

/**
 * Get user-friendly error message based on error type
 */
function getUserFriendlyError(errorType: AIErrorType, errorDetails?: string): string {
  switch (errorType) {
    case AIErrorType.API_KEY_INVALID:
      return '🔑 The AI service is not properly configured. Please contact the administrator to update the API key.';
    
    case AIErrorType.RATE_LIMIT:
      return '⏱️ Too many requests at the moment. Please wait 30-60 seconds and try again.';
    
    case AIErrorType.QUOTA_EXCEEDED:
      return '📊 The AI service has reached its daily quota. Please try again tomorrow or contact the administrator.';
    
    case AIErrorType.NETWORK_ERROR:
      return '🌐 Unable to connect to the AI service. Please check your internet connection and try again.';
    
    case AIErrorType.MODEL_ERROR:
      return '🤖 The AI model is temporarily unavailable. Please try again in a moment.';
    
    case AIErrorType.UNKNOWN:
    default:
      return '❌ An unexpected error occurred. Please try again in a moment. If the problem persists, please contact support.';
  }
}

/**
 * Generate AI response with robust error handling and retry logic
 */
export async function generateAIResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
): Promise<AIResponse> {
  const maxRetries = 3;
  let lastError: any = null;

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      console.log(`🤖 AI Request (Attempt ${attempt}/${maxRetries}): "${userMessage.substring(0, 50)}..."`);

      const ai = initializeAI();

      // Build messages array for chat completion
      const messages: Groq.Chat.ChatCompletionMessageParam[] = [
        { role: 'system', content: SYSTEM_INSTRUCTION },
        ...conversationHistory.map(msg => ({
          role: msg.role,
          content: msg.content,
        } as Groq.Chat.ChatCompletionMessageParam)),
        { role: 'user', content: userMessage },
      ];

      // Use Groq's chat completion with Llama 3
      const response = await ai.chat.completions.create({
        model: 'llama3-8b-8192', // Fast, free, and high quality
        messages,
        max_tokens: 500,
        temperature: 0.7,
      });

      const aiMessage = response.choices[0]?.message?.content?.trim() || '';

      if (!aiMessage) {
        throw new Error('Empty response from Groq');
      }

      console.log(`✅ AI Response received: "${aiMessage.substring(0, 50)}..."`);

      return {
        success: true,
        message: aiMessage,
      };

    } catch (error: any) {
      lastError = error;
      const errorType = classifyError(error);

      console.error(`❌ AI Error (Attempt ${attempt}/${maxRetries}):`, {
        errorType,
        message: error?.message,
        status: error?.status,
      });

      // Don't retry for certain error types
      if (errorType === AIErrorType.API_KEY_INVALID || errorType === AIErrorType.QUOTA_EXCEEDED) {
        console.error('🛑 Non-retryable error detected. Stopping attempts.');
        break;
      }

      // For rate limits, wait longer before retrying
      if (errorType === AIErrorType.RATE_LIMIT && attempt < maxRetries) {
        const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff: 2s, 4s, 8s
        console.log(`⏳ Rate limit hit. Waiting ${waitTime}ms before retry...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
        continue;
      }

      // For other errors, short delay before retry
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  // All retries failed
  const errorType = classifyError(lastError);
  const userFriendlyMessage = getUserFriendlyError(errorType, lastError?.message);

  console.error('💥 All retry attempts failed:', {
    errorType,
    originalError: lastError?.message,
  });

  return {
    success: false,
    message: userFriendlyMessage,
    errorType,
    errorDetails: process.env.NODE_ENV === 'development' ? lastError?.message : undefined,
  };
}

/**
 * Generate streaming AI response (for future implementation)
 */
export async function generateStreamingResponse(
  userMessage: string,
  conversationHistory: Array<{ role: 'user' | 'assistant'; content: string }> = []
) {
  try {
    const ai = initializeAI();

    const messages: Groq.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: SYSTEM_INSTRUCTION },
      ...conversationHistory.map(msg => ({
        role: msg.role,
        content: msg.content,
      } as Groq.Chat.ChatCompletionMessageParam)),
      { role: 'user', content: userMessage },
    ];

    const stream = await ai.chat.completions.create({
      model: 'llama3-8b-8192',
      messages,
      max_tokens: 500,
      temperature: 0.7,
      stream: true,
    });

    return stream;
  } catch (error: any) {
    const errorType = classifyError(error);
    console.error('❌ AI Streaming Error:', {
      errorType,
      status: error?.status,
      message: error?.message,
    });
    throw error;
  }
}

// Export type for use in API routes
export type { AIResponse };
