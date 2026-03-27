const { getGroqClient, getGroqModel } = require("./groqClient");

const GREETING_REGEX = /^(hi|hello|hey|hii|heyy|good morning|good afternoon|good evening)[!. ]*$/i;

/**
 * Identify the user's intent from their message.
 * Expected intents: greeting, expense_query, category_analysis, budget_status, goal_planning, general_advice, unrelated
 */
exports.detectIntent = async (userMessage) => {
  const trimmedMessage = (userMessage || "").trim();
  if (GREETING_REGEX.test(trimmedMessage)) {
    return {
      intent: "greeting",
      entities: { category: null, timeframe: null, goal: null, amount: null }
    };
  }

  const client = getGroqClient();
  if (!client) {
    return {
      intent: "general_advice",
      entities: { category: null, timeframe: null, goal: null, amount: null }
    };
  }

  const prompt = `You are an AI financial intent parser.
Classify the user's message into one of these intents:
1. "greeting" (e.g. hi, hello, hey)
2. "expense_query" (e.g. How much did I spend on food? What did I spend this week?)
3. "category_analysis" (e.g. Where am I spending the most? Breakdown my expenses)
4. "budget_status" (e.g. How much money is left this month? Am I over budget?)
5. "goal_planning" (e.g. I want to buy a laptop next month. Can I afford a bike?)
6. "general_advice" (e.g. How can I save money? Give me financial tips)
7. "unrelated" (if not about personal finance, expenses, budgets, savings, goals, or money management)

Return ONLY a valid JSON object matching this structure:
{
  "intent": "...",
  "entities": {
    "category": "...", // e.g. "food", "entertainment", "all", null if not found
    "timeframe": "...", // e.g. "this_month", "last_month", "this_week", "custom", null if not found
    "goal": "...", // e.g. "buy a laptop", null if not found
    "amount": null // parsed number if present, else null
  }
}

User Message: "${trimmedMessage}"`;

  try {
    const response = await client.chat.completions.create({
      model: getGroqModel(),
      messages: [{ role: "system", content: prompt }],
      temperature: 0,
    });

    const parsed = JSON.parse(response.choices[0].message.content);
    const allowedIntents = new Set([
      "greeting",
      "expense_query",
      "category_analysis",
      "budget_status",
      "goal_planning",
      "general_advice",
      "unrelated",
    ]);

    return {
      intent: allowedIntents.has(parsed.intent) ? parsed.intent : "general_advice",
      entities: {
        category: parsed?.entities?.category ?? null,
        timeframe: parsed?.entities?.timeframe ?? null,
        goal: parsed?.entities?.goal ?? null,
        amount: parsed?.entities?.amount ?? null,
      }
    };
  } catch (err) {
    console.error("Intent Detection Error:", err);
    return {
      intent: "general_advice",
      entities: { category: null, timeframe: null, goal: null, amount: null }
    };
  }
};
