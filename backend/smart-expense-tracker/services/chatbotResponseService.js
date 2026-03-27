const { getGroqClient, getGroqModel } = require("./groqClient");

/**
 * Generate human-like advice using structured analysis
 */
exports.generateResponse = async (userMessage, analysisData, intent) => {
  if (intent === "greeting") {
    return "Hey! I can help you track expenses, check budgets, and plan savings goals. What would you like to do?";
  }
  if (intent === "unrelated") {
    return "I can help with your expenses and financial planning. Try asking about your spending, budgets, or savings goals.";
  }

  const client = getGroqClient();
  if (!client) {
    return "I could not access AI advice because GROQ_API_KEY is missing. Add it in backend/smart-expense-tracker/.env and restart the backend server.";
  }

  const prompt = `You are an AI-powered financial assistant inside Smart Expense Tracker.

Your behavior must follow these rules:
1) Do NOT generate full financial analysis unless explicitly asked.
2) Keep responses short and relevant.
3) Only use financial data when required by intent.
4) Never hallucinate numbers.

Intent-specific behavior:
- expense_query: answer only what is asked.
- category_analysis: provide category breakdown and brief insight.
- budget_status: show remaining balance clearly and warn if negative.
- goal_planning: provide detailed financial guidance and where to reduce spending.
- general_advice: give practical saving tips based on available data.

The user asked: "${userMessage}"
Their detected intent: "${intent}"

Here is the deterministic analysis of their finances for the current month:
${JSON.stringify(analysisData, null, 2)}

Respond in clean natural language (no JSON).`;

  try {
    const response = await client.chat.completions.create({
      model: getGroqModel(),
      messages: [{ role: "system", content: prompt }],
      temperature: 0.7,
      max_tokens: 250
    });

    return response.choices[0].message.content;
  } catch (err) {
    console.error("Response Generation Error:", err);
    if (err && err.status === 401) {
      return "Your Groq API key was rejected (401). Replace GROQ_API_KEY in backend/smart-expense-tracker/.env with a valid key, then restart the backend server.";
    }
    if (err && err.status === 429) {
      return "Groq rate limit or quota reached (429). Wait a moment or check your Groq console limits, then try again.";
    }
    return "I'm having trouble connecting to my advisory modules right now. Please try again later.";
  }
};
