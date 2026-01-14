import { GoogleGenerativeAI } from '@google/generative-ai';

const apiKey = process.env.GEMINI_API_KEY;

if (!apiKey) {
  throw new Error('GEMINI_API_KEY is not configured in environment variables');
}

const genAI = new GoogleGenerativeAI(apiKey);

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

export async function generateAIResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }> = []) {
  const maxRetries = 2;
  let lastError: any = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      const model = genAI.getGenerativeModel({
        model: 'gemini-pro', // Using stable production model
        systemInstruction: SYSTEM_INSTRUCTION,
      });

      // Build the chat history
      const history = conversationHistory.map(msg => ({
        role: msg.role === 'user' ? 'user' : 'model',
        parts: [{ text: msg.content }],
      }));

      const chat = model.startChat({
        history,
        generationConfig: {
          maxOutputTokens: 800,
          temperature: 0.7,
          topP: 0.9,
        },
      });

      const result = await chat.sendMessage(userMessage);
      const response = result.response;
      const text = response.text();

      return {
        success: true,
        message: text,
      };
    } catch (error: any) {
      lastError = error;
      console.error(`AI Generation Error (attempt ${attempt + 1}):`, error);

      // Check for rate limit or quota errors
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        if (attempt < maxRetries) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, (attempt + 1) * 2000));
          continue;
        }
        return {
          success: false,
          message: '⚠️ The AI is currently busy due to rate limits. Please wait a moment and try again, or click the admin button to get human assistance.',
          error: 'RATE_LIMIT',
        };
      }

      // Check for quota exceeded
      if (error?.message?.includes('quota') || error?.message?.includes('QUOTA_EXCEEDED')) {
        return {
          success: false,
          message: '⚠️ The AI quota has been exceeded. Please contact the admin for assistance, or try again later.',
          error: 'QUOTA_EXCEEDED',
        };
      }

      // For other errors, retry if we have attempts left
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        continue;
      }
    }
  }

  // If all retries failed
  return {
    success: false,
    message: 'I apologize, but I encountered an error processing your request. Please try again in a moment, or click the admin button for human assistance.',
    error: lastError instanceof Error ? lastError.message : 'Unknown error',
  };
}

export async function generateStreamingResponse(userMessage: string, conversationHistory: Array<{ role: string; content: string }> = []) {
  try {
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: SYSTEM_INSTRUCTION,
    });

    const history = conversationHistory.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    }));

    const chat = model.startChat({
      history,
      generationConfig: {
        maxOutputTokens: 1000,
        temperature: 0.7,
        topP: 0.9,
      },
    });

    const result = await chat.sendMessageStream(userMessage);
    return result.stream;
  } catch (error) {
    console.error('AI Streaming Error:', error);
    throw error;
  }
}
