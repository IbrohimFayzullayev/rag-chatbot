import { OpenAI as LangchainOpenAI } from "@langchain/openai";
import { OpenAI as OpenAIEmbeddings } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";

// export const runtime = "edge";
// env
const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

new LangchainOpenAI({
  apiKey: OPENAI_API_KEY,
});

const openai = new OpenAIEmbeddings({
  apiKey: OPENAI_API_KEY,
});

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);

const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  namespace: ASTRA_DB_NAMESPACE!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    try {
      const collection = db.collection(ASTRA_DB_COLLECTION!);
      const cursor = collection.find(null, {
        sort: {
          $vector: embedding.data[0].embedding,
        },
        limit: 10,
      });

      const documents = await cursor.toArray();
      const docsMap = documents.map((doc) => doc.text);
      docContext = JSON.stringify(docsMap);
    } catch (error) {
      console.error("DB Error:", error);
    }

    const systemPrompt = {
      role: "system",
      content: `
        You are an AI assistant developed to provide helpful and accurate information specifically about UzTelecom.
        Follow all the instructions below carefully and consistently in every response:
    
        Rules:
        1. You must always reply in the **Uzbek language**, using clear, simple, and natural expressions.
        2. Use **friendly, helpful, and respectful** language in every answer.
        3. If the user's question can be answered using the given context, do so.
        4. If the context is not sufficient, use your general knowledge — but never say anything about the context itself.
        5. **Never mention or reference the context** directly in any way.
        6. Your answers should **never contain links, images, citations, or markdown** — only plain text.
        7. Keep the answers **useful, accurate, and easy to understand**, especially for people unfamiliar with the topic.
        8. Do not repeat the user’s question. Go straight to answering it.
    
        Additional actions:
        - Provide users with quality information about Uztelecom's as a mobile operator, Uztelecom tariffs and their connection.
        - Do not provide speculative or misleading information.
        - Avoid unnecessary details that do not help clarify the topic.
    
        ----------------------------------------
        KONTEKSTDAGI MA’LUMOTLAR:
        ${docContext}
        ----------------------------------------
        FOYDALANUVCHI SAVOLI:
        ${latestMessage}
        ----------------------------------------
      `,
    };

    const response = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [systemPrompt, ...messages.slice(-5)],
    });

    const reply = response.choices[0]?.message?.content || "No response";

    return new NextResponse(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (e) {
    console.error("Error:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
