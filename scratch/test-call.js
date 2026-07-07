import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JGSodA7LOxevna5bgFinKbEmmTRMvfurNlxif2hw0ULw";
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });
  const result = await model.generateContent("Say hello in JSON: { \"message\": \"...\" }");
  console.log(result.response.text());
}

main().catch(console.error);
