import { OpenAI as LangchainOpenAI } from "@langchain/openai";
import { OpenAI as OpenAIEmbeddings } from "openai";
import { DataAPIClient } from "@datastax/astra-db-ts";
import { NextResponse } from "next/server";

export const runtime = "edge";

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

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN!);

const db = client.db(ASTRA_DB_API_ENDPOINT!, {
  namespace: ASTRA_DB_NAMESPACE!,
});

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const latestMessage = messages[messages.length - 1]?.content;

    let docContext = "";

    // Embedding yaratish
    const embedding = await openai.embeddings.create({
      model: "text-embedding-3-small",
      input: latestMessage,
      encoding_format: "float",
    });

    // Astra DB'dan hujjatlarni olish
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
        Siz sun'iy intellektga asoslangan yordamchisiz. Sizning asosiy vazifangiz —
        foydalanuvchilarga O‘zbekiston haqida aniq va foydali ma’lumotlarni taqdim
        etish. Quyidagi kontekstda berilgan ma’lumotlardan foydalanib javob bering.
        Agar savolga kontekstda javob topilmasa, siz mavjud bilimlaringizga asoslanib
        javob bera olasiz. Har doim javoblaringizni o‘zbek tilida yozing va iloji
        boricha tushunarli, sodda, va aniq tarzda tushuntiring.
        Hech qachon “kontekstda bu bor” yoki “kontekstda bu yo‘q” degan jumlalarni
        ishlatmang. Javoblaringizda havolalar, manbalar yoki rasmga oid kontentni
        keltirmang. Faqat matn ko‘rinishida izoh bering.
    
        ----------------------------------------
        KONTEKSTDAGI MA’LUMOTLAR:
        ${docContext}
        ----------------------------------------
        FOYDALANUVCHI SAVOLI:
        ${latestMessage}
        ----------------------------------------
      `,
    };

    // OpenAI Chat javobini olish
    // const openaiRes = await openai.chat.completions.create({
    //   model: "gpt-4",
    //   stream: true,
    //   messages: [systemPrompt, ...messages],
    // });
    const reply = await openai.chat.completions.create({
      model: "gpt-4",
      stream: true,
      messages: [systemPrompt, ...messages],
    });

    // return result.toDataStreamResponse();
    // const encoder = new TextEncoder();
    // const stream = new ReadableStream({
    //   async start(controller) {
    //     try {
    //       for await (const chunk of aiStream) {
    //         // chunk.choices[0].delta.content ichidagi har bir qism
    //         const text = chunk.choices[0]?.delta?.content;
    //         if (text) {
    //           // SSE event: data: {"role":"assistant","content":"…"}\n\n
    //           const payload = JSON.stringify({
    //             role: "assistant",
    //             content: text,
    //           });
    //           controller.enqueue(encoder.encode(`data: ${payload}\n\n`));
    //         }
    //       }
    //     } catch (e) {
    //       controller.error(e);
    //     } finally {
    //       controller.close();
    //     }
    //   },
    // });
    // console.log("Stream:", stream);
    // return new NextResponse(stream, {
    //   headers: {
    //     "Content-Type": "text/event-stream",
    //     "Cache-Control": "no-cache, no-transform",
    //     Connection: "keep-alive",
    //   },
    // });

    // const reply = response.choices[0]?.message?.content || "No response";
    // const stream = openaiRes.body as ReadableStream;

    // Javobni foydalanuvchiga qaytarish
    // console.log("Reply:", reply);
    // return Response.json({
    //   role: "assistant",
    //   id: crypto.randomUUID(),
    //   content: reply,
    // });
    return new NextResponse(JSON.stringify({ reply }), {
      headers: {
        "Content-Type": "application/json", // JSON formatida yuborish
      },
    });
    // return new NextResponse(reply, {
    //   headers: {
    //     "Content-Type": "application/json", // JSON formatida yuborish
    //   },
    // });
  } catch (e) {
    console.error("Error:", e);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
