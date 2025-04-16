import { OpenAI as LangchainOpenAI } from "@langchain/openai";
import { OpenAI as OpenAIEmbeddings } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";

// .env dan o'qiladi
const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

// Langchain uchun OpenAI
new LangchainOpenAI({
  apiKey: OPENAI_API_KEY,
});

// Embedding va Chat uchun OpenAI SDK
const openai = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
});

// Astra DB klienti
const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);

const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  namespace: ASTRA_DB_NAMESPACE!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages?.length - 1]?.content;

    let docContext = "";

    // Embedding yaratish
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    // Astra DB dan mos keladigan hujjatlarni topish
    try {
      const collection = db.collection(ASTRA_DB_COLLECTION!);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();
      const docsMap = documents?.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.error("DB Error:", error);
      docContext = "";
    }

    // System promptni tayyorlash
    const systemPrompt = {
      role: "system",
      content: `
        You are an AI assistant who knows everything about Formula One. Use the below context to augment what you know about Formula One racing. The context will provide you with the most recent page data from wikipedia, the official F1 website and others. If the context doesn't include the info you need, answer based on your existing knowledge and don't mention the source of your info or what the context does or doesn't include. Format responses using markdown where applicable and don't return images.

        -----------------------
        START CONTEXT
        ${docContext}
        END CONTEXT
        -----------------------
        QUESTION: ${latestMessage}
        -----------------------
      `,
    };

    // Chat API orqali streaming javob olish
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemPrompt, ...messages],
      stream: true,
    });

    // Streaming bilan javobni yuborish
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        for await (const chunk of response) {
          const content = chunk.choices?.[0]?.delta?.content;
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    });

    return new NextResponse(stream, {
      headers: {
        "Content-Type": "text/plain",
      },
    });
  } catch (e) {
    console.error("Unhandled Error:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
