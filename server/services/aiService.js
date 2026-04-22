const { GoogleGenerativeAI } = require("@google/generative-ai");
const stringSimilarity = require("string-similarity");

// Model name configuration
const GEMINI_MODEL = "gemini-2.5-flash";

const getModel = () => {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  return genAI.getGenerativeModel({ model: GEMINI_MODEL });
};

const CATEGORIES = [
  'garbage', 'pothole', 'streetlight', 'water', 'sewage', 
  'noise', 'encroachment', 'traffic', 'electrical', 'other'
];

/**
 * Classifies a complaint using Google Gemini AI with high-fidelity analysis
 * @param {string} text - Complaint description
 * @param {string} imageDescription - Optional description from image processing
 * @returns {Promise<Object>} Structured AI analysis
 */
const classifyComplaint = async (text, imageDescription = '') => {
  try {
    const combinedText = `Description: ${text}\n${imageDescription ? 'Image Context: ' + imageDescription : ''}`;

    const prompt = `
      You are an expert senior civic system architect and issue analyzer. 
      Analyze the following civic complaint for a smart city platform.
      
      Complaint Text: "${combinedText}"
      
      Analyze and return ONLY a JSON object with these specific fields:
      - category: One of [${CATEGORIES.join(', ')}]
      - priority: One of [low, medium, high, critical]
      - sentiment: One of [frustrated, concerned, neutral, angry, emergency]
      - keywords: Array of 5-8 relevant keywords
      - summary: A professional 1-sentence summary
      - confidence: A decimal between 0 and 1
      - urgency_score: A number from 1 to 10 based on safety risk (10 = life threatening)
      - suggested_resolution: A short, actionable technical suggestion for city workers
      
      JSON format only, no other text.
    `;

    console.log("🤖 AI Analysis Starting for:", text.substring(0, 50) + "...");
    const model = getModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const rawText = response.text();
    
    // Improved JSON extraction: find the first { and last }
    const jsonMatch = rawText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error("❌ No JSON found in Gemini response:", rawText);
      throw new Error("Invalid AI response format");
    }

    const jsonStr = jsonMatch[0];
    
    try {
      const analysis = JSON.parse(jsonStr);
      return {
        ...analysis,
        source: 'gemini-2.5-flash'
      };
    } catch (parseError) {
      console.error("❌ Gemini JSON Parse Error:", parseError, jsonStr);
      throw new Error("Failed to parse AI response");
    }
  } catch (error) {
    console.error("❌ Gemini API Error:", error.message);
    return fallbackAnalysis(text);
  }
};

/**
 * Simple keyword-based fallback if Gemini fails
 */
const fallbackAnalysis = (text) => {
  const lowerText = text.toLowerCase();
  let category = 'other';
  if (lowerText.includes('trash') || lowerText.includes('garbage')) category = 'garbage';
  else if (lowerText.includes('pothole') || lowerText.includes('road')) category = 'pothole';
  else if (lowerText.includes('water') || lowerText.includes('leak')) category = 'water';
  
  return {
    category,
    priority: 'medium',
    sentiment: 'concerned',
    keywords: ['fallback'],
    summary: 'Civic issue reported (AI Fallback mode)',
    confidence: 0.5,
    urgency_score: 5,
    suggested_resolution: 'Inspect site and determine necessary repairs.',
    source: 'fallback'
  };
};

/**
 * Advanced duplicate detection using string similarity and location
 */
const checkDuplicate = async (ComplaintModel, text, coordinates, timeWindowHours = 48) => {
  if (!coordinates || coordinates.length < 2) return null;

  const timeWindow = new Date(Date.now() - timeWindowHours * 60 * 60 * 1000);

  const nearbyComplaints = await ComplaintModel.find({
    'location.coordinates': {
      $near: {
        $geometry: { type: 'Point', coordinates },
        $maxDistance: 500 // 500 meters
      }
    },
    createdAt: { $gte: timeWindow },
    status: { $nin: ['resolved', 'rejected', 'duplicate'] }
  }).limit(20);

  let bestMatch = null;
  let maxSimilarity = 0;

  for (const complaint of nearbyComplaints) {
    const similarity = stringSimilarity.compareTwoStrings(
      text.toLowerCase(),
      complaint.description.toLowerCase()
    );

    if (similarity > maxSimilarity) {
      maxSimilarity = similarity;
      bestMatch = complaint;
    }
  }

  // Threshold for duplicate detection
  if (maxSimilarity > 0.6) {
    return {
      id: bestMatch._id,
      similarity: maxSimilarity
    };
  }

  return null;
};

/**
 * Calculate Fraud Score based on user submission patterns
 */
const calculateFraudScore = async (ComplaintModel, userId) => {
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
  const recentComplaintsCount = await ComplaintModel.countDocuments({
    user: userId,
    createdAt: { $gte: oneHourAgo }
  });

  let score = 0;
  if (recentComplaintsCount > 5) score += 40;
  else if (recentComplaintsCount > 3) score += 20;

  return Math.min(score, 100);
};

module.exports = { 
  classifyComplaint, 
  checkDuplicate,
  calculateFraudScore
};
