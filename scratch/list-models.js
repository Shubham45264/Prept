import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JGSodA7LOxevna5bgFinKbEmmTRMvfurNlxif2hw0ULw";
  const genAI = new GoogleGenerativeAI(apiKey);
  // Note: the SDK doesn't expose a direct listModels method, but we can do a simple request
  // or fetch directly using fetch
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  console.log(JSON.stringify(data, null, 2));
}

main().catch(console.error);
