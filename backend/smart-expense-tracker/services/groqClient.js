const OpenAI = require("openai");

const GROQ_BASE_URL = "https://api.groq.com/openai/v1";

/**
 * Groq exposes an OpenAI-compatible Chat Completions API.
 * @returns {import("openai").OpenAI | null}
 */
function getGroqClient() {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey || !String(apiKey).trim()) return null;
  return new OpenAI({
    apiKey: String(apiKey).trim(),
    baseURL: GROQ_BASE_URL,
  });
}

function getGroqModel() {
  return process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
}

module.exports = { getGroqClient, getGroqModel };
