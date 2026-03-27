const { detectIntent } = require("../services/chatbotIntentService");
const { fetchFinancialData } = require("../services/chatbotDataService");
const { analyzeFinancials } = require("../services/chatbotAnalysisService");
const { generateResponse } = require("../services/chatbotResponseService");

exports.handleChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const userId = req.user.userId; // matches JWT structure

    if (!message) {
      return res.status(400).json({ error: "Message is required." });
    }

    // Step 1: Detect Intent
    const intentData = await detectIntent(message);

    // Fast responses for non-analytical intents
    if (intentData.intent === "greeting") {
      return res.status(200).json({
        reply: "Hey! I can help you track expenses, check budgets, and plan savings goals. What would you like to do?",
        debug: { intent: intentData.intent }
      });
    }

    if (intentData.intent === "unrelated") {
      return res.status(200).json({
        reply: "I can help with your expenses and financial planning. Try asking about your spending, budgets, or savings goals.",
        debug: { intent: intentData.intent }
      });
    }

    // Step 2: Fetch Data
    const rawData = await fetchFinancialData(userId, intentData);

    // Step 3: Analyze
    const analysisResults = analyzeFinancials(rawData, intentData);

    // Step 4: Generate String Response
    const finalAdvice = await generateResponse(message, analysisResults, intentData.intent);

    res.status(200).json({
      reply: finalAdvice,
      debug: {
        intent: intentData.intent,
        analysis: analysisResults
      }
    });
  } catch (error) {
    console.error("Chatbot Controller Error:", error);
    res.status(500).json({ error: "Internal Server Error in Chatbot module" });
  }
};
