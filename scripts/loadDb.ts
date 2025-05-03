import { DataAPIClient } from "@datastax/astra-db-ts";
import { PuppeteerWebBaseLoader } from "@langchain/community/document_loaders/web/puppeteer";
import { OpenAI } from "@langchain/openai";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
//import { OpenAIEmbeddings } from "@langchain/openai";
import { OpenAI as openAIEmbeddings } from "openai";

import "dotenv/config";

type SimilarityMetric = "dot_product" | "cosine" | "euclidean";

// fetching all the env variables
const {
  OPENAI_API_KEY,
  ASTRA_DB_NAMESPACE,
  ASTRA_DB_COLLECTION,
  ASTRA_DB_API_ENDPOINT,
  ASTRA_DB_APPLICATION_TOKEN,
} = process.env;

new OpenAI({
  apiKey: OPENAI_API_KEY,
  temperature: 0.7,
});

const openEmbeddings = new openAIEmbeddings();

const f1Data = [
  "https://uztelecom.uz/",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/tarif-rejalar#gsm_Mobile",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-mini",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-optimal",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-balance",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-ideal",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-lux",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/mobil-aloqa/gsm/tariflar/mobile/mobile-elite",
  "https://uztelecom.uz/uz/jismoniy-shaxslarga/boshqa-tariflar#gsm_Foydali%20tariflar",
];

const client = new DataAPIClient(ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(ASTRA_DB_API_ENDPOINT, {
  namespace: ASTRA_DB_NAMESPACE,
});

const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 512,
  chunkOverlap: 100,
});

const createCollection = async (
  similarityMetric: SimilarityMetric = "dot_product"
) => {
  const res = await db.createCollection(ASTRA_DB_COLLECTION, {
    vector: {
      dimension: 1536,
      metric: similarityMetric,
    },
  });
  console.log(res);
};

const loadSampleData = async () => {
  const collection = db.collection(ASTRA_DB_COLLECTION);

  for await (const url of f1Data) {
    const content = await scrapePage(url);
    const chunks = await splitter.splitText(content);
    for await (const chunk of chunks) {
      const embedding = await openEmbeddings.embeddings.create({
        model: "text-embedding-3-small",
        input: chunk,
        encoding_format: "float",
      });

      const vector = embedding.data[0].embedding;

      const res = await collection.insertOne({
        $vector: vector,
        text: chunk,
      });

      console.log(res);
    }
  }
};

const scrapePage = async (url: string) => {
  const loader = new PuppeteerWebBaseLoader(url, {
    launchOptions: {
      headless: true,
    },
    gotoOptions: {
      waitUntil: "domcontentloaded",
    },
    evaluate: async (page, browser) => {
      const result = await page.evaluate(() => document.body.innerHTML);
      await browser.close();

      return result;
    },
  });
  return (await loader.scrape())?.replace(/<[^>]*>?/gm, "");
};

createCollection().then(() => loadSampleData());
