// app/api/ask/route.ts
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const userMessage: string = body.message;
    console.log("User message:", userMessage);

    if (!userMessage) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    // Oddiy misol: user bergan matn bo‘yicha javob qaytaramiz
    let reply = "";

    if (userMessage.toLowerCase().includes("hello")) {
      reply = "Hi there! How can I help you today?";
    } else if (userMessage.toLowerCase().includes("how are you")) {
      reply = "I'm just a bot, but I'm functioning perfectly!";
    } else {
      reply = `You said: "${userMessage}". But I don't know how to respond to that yet.`;
    }

    return NextResponse.json({ reply });
  } catch (error) {
    console.error("Error occurred:", error);
    return NextResponse.json(
      { error: "Something went wrong" },
      { status: 500 }
    );
  }
}
