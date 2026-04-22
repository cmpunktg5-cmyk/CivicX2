require('dotenv').config();
const { GoogleGenerativeAI } = require("@google/generative-ai");

async function testAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error("❌ GEMINI_API_KEY not found in .env file");
    return;
  }

  console.log("🚀 Testing Gemini AI Integration...");
  console.log("🔑 API Key found, initializing...");

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // Using gemini-2.5-flash as the primary high-performance model
    const modelName = "gemini-2.5-flash";
    const model = genAI.getGenerativeModel({ model: modelName });

    console.log(`📡 Sending test message to ${modelName}...`);
    const prompt = "Hello! This is a test message from CivicX AI Platform. Please respond with a short confirmation message if you are working correctly.";

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    console.log("\n✅ AI RESPONSE RECEIVED:");
    console.log("------------------------");
    console.log(text);
    console.log("------------------------");
    console.log("\n✨ Integration Test Passed!");
  } catch (error) {
    console.error("\n❌ AI INTEGRATION FAILED:");
    console.error(error.message);
    if (error.message.includes("404")) {
      console.log("💡 Tip: The model name might be incorrect or unavailable for your API key.");
    } else if (error.message.includes("429")) {
      console.log("💡 Tip: You've hit the rate limit or quota.");
    }
  }
}

testAI();
