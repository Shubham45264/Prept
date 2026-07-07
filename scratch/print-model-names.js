import { GoogleGenerativeAI } from "@google/generative-ai";

async function main() {
  const apiKey = process.env.GEMINI_API_KEY || "AQ.Ab8RN6JGSodA7LOxevna5bgFinKbEmmTRMvfurNlxif2hw0ULw";
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  const res = await fetch(url);
  const data = await res.json();
  const names = data.models ? data.models.map(m => m.name) : [];
  console.log("Model Names:\n", names.filter(n => n.includes("flash") || n.includes("pro")).join("\n"));
}

main().catch(console.error);
