import { NextResponse } from "next/server";
import Groq from "groq-sdk";

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY, // Ensure this is set in your .env.local file
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    // Validate messages
    if (!messages || !messages.length) {
      return NextResponse.json(
        { error: "Invalid request data. 'messages' array is required." },
        { status: 400 }
      );
    }

    // Get the last user message
    const lastUserMessage = messages[messages.length - 1];

    // Check if the user message is "hi"
    if (
      lastUserMessage.role === "user" &&
      lastUserMessage.content.toLowerCase().trim() === "hi"
    ) {
      // Return a short predefined response
      return NextResponse.json(
        { response: "Hello! 👋 How can I help you today?" },
        { status: 200 }
      );
    }

    // Otherwise, send the messages to Groq for a response
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content:
            "You are a friendly e-commerce AI chatbot. Your goal is to assist customers with their shopping needs, provide product recommendations, and facilitate a seamless checkout process.",
        },
        ...messages,
      ],
      model: "mixtral-8x7b-32768",
    });

    // Extract the response content
    const response = completion.choices[0]?.message?.content || "";

    return NextResponse.json({ response }, { status: 200 });
  } catch (error) {
    console.error("Error in /api/chat:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
