import { NextRequest, NextResponse } from "next/server";
import fetch from 'node-fetch';

// Rate limiting configuration (optional)
const RATE_LIMIT = {
  MAX_REQUESTS: 10, // Maximum number of requests allowed
  WINDOW_SIZE: 60 * 1000, // Time window in milliseconds (e.g., 1 minute)
};

// In-memory rate limit store (replace with a proper store like Redis in production)
const rateLimitStore = new Map<string, { count: number; lastRequest: number }>();

// Helper function to check rate limits
function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    rateLimitStore.set(identifier, { count: 1, lastRequest: now });
    return true;
  }

  if (now - record.lastRequest > RATE_LIMIT.WINDOW_SIZE) {
    rateLimitStore.set(identifier, { count: 1, lastRequest: now });
    return true;
  }

  if (record.count >= RATE_LIMIT.MAX_REQUESTS) {
    return false;
  }

  rateLimitStore.set(identifier, { count: record.count + 1, lastRequest: now });
  return true;
}

// System prompt for the chatbot
const systemPrompt = `You are a friendly e-commerce AI chatbot. Your goal is to assist customers with their shopping needs, provide product recommendations, and facilitate a seamless checkout process.`;

export async function POST(req: NextRequest) {
  // Use a custom identifier for rate limiting (e.g., API key, session ID, or user ID)
  const identifier =
    req.headers.get("x-api-key") || // Use API key from headers
    req.headers.get("authorization") || // Use authorization token
    "anonymous"; // Fallback for anonymous users

  // Check rate limit
  if (!checkRateLimit(identifier)) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    // Extracting and Formatting the Request Data
    const data = await req.json();
    const messages = Array.isArray(data) ? data : [data];

    // Validate and ensure the request data has 'role' and 'content' properties
    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: "Invalid request data. 'messages' array is required." },
        { status: 400 }
      );
    }

    // Use the system prompt if needed (for future use cases)
    console.log(systemPrompt);

    // Check if someone says "hi"
    const userMessage = messages.find(msg => msg.content.toLowerCase() === "hi");
    let responseMessage;

    if (userMessage) {
      responseMessage = "hi, how can I help you?";
    } else {
      // Fetch response from Groq API
      const apiKey = process.env.GROQ_API_KEY;
      const response = await fetch('https://api.groq.com/v1/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({ messages })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch response from Groq API');
      }

      const jsonResponse = await response.json();
      responseMessage = jsonResponse.reply;
    }

    // Sending the Final Response
    return NextResponse.json({ response: responseMessage }, { status: 200 });
  } catch (error) {
    // Handle any errors that occur during the process
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
