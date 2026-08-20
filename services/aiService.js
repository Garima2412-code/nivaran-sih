const axios = require("axios");

const AI_BASE_URL = process.env.AI_BACKEND_URL || "http://localhost:8000";

// Calls the AI backend to classify a grievance.
// Returns a normalized result no matter what — callers never need to
// handle "AI is down" themselves.
const analyzeGrievance = async (description) => {
  try {
    const response = await axios.post(
      `${AI_BASE_URL}/ai/analyze-grievance`,
      { description },
      { timeout: 5000 } // don't let a slow AI call hang the request
    );

    const data = response.data || {};

    return {
      success: true,
      category: data.category || "Uncategorized",
      department: data.department || null,
      priority: data.priority || "Medium",
      summary: data.summary || "",
      duplicateOf: Array.isArray(data.duplicateOf) ? data.duplicateOf : [],
      slaRiskScore: typeof data.slaRiskScore === "number" ? data.slaRiskScore : 0,
    };
  } catch (error) {
    // AI backend is down, slow, or returned something invalid.
    // Fall back to safe defaults so grievance creation NEVER fails because of this.
    console.error("AI backend call failed, using fallback:", error.message);

    return {
      success: false,
      category: "Uncategorized",
      department: null,
      priority: "Medium",
      summary: "",
      duplicateOf: [],
      slaRiskScore: 0,
    };
  }
};

module.exports = { analyzeGrievance };