const axios = require("axios");

const AI_BASE_URL =
  process.env.AI_BACKEND_URL || "http://localhost:8000";

// Calls the JanSahay FastAPI AI service.
// The AI service is responsible for Gemini-based grievance analysis.
// This Node service normalizes the response so the rest of the
// grievance backend does not need to know the AI implementation details.
const analyzeGrievance = async (description, location = {}) => {
  try {
    const payload = {
      complaint: description,
    };

    // Forward location coordinates when available.
    // The AI service can use these for location context.
    if (
      location &&
      typeof location.lat === "number" &&
      typeof location.lng === "number"
    ) {
      payload.latitude = location.lat;
      payload.longitude = location.lng;
    }

    const response = await axios.post(
      `${AI_BASE_URL}/api/ai/analyze`,
      payload,
      {
        timeout: 15000,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    const data = response.data || {};

    return {
      success: true,

      // AI classification
      category: data.category || "Uncategorized",
      subCategory: data.sub_category || null,
      department: data.department || null,
      issue: data.issue || "",
      priority: data.priority || "MEDIUM",

      // AI-generated explanation
      summary: data.summary || "",
      reason: data.reason || "",

      // Extracted information
      location: data.location || null,
      duration: data.duration || null,

      // AI confidence/language
      confidence:
        typeof data.confidence === "number" ? data.confidence : 0,
      language: data.language || null,
      languageName: data.language_name || null,

      // Additional context returned by JanSahay
      locationContext: data.location_context || null,
    };
  } catch (error) {
    console.error(
      "JanSahay AI backend call failed, using fallback:",
      error.response?.data || error.message
    );

    return {
      success: false,
      category: "Uncategorized",
      subCategory: null,
      department: null,
      issue: "",
      priority: "MEDIUM",
      summary: "",
      reason: "",
      location: null,
      duration: null,
      confidence: 0,
      language: null,
      languageName: null,
      locationContext: null,
    };
  }
};

module.exports = { analyzeGrievance };