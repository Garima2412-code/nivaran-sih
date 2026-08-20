const express = require("express");
const app = express();
app.use(express.json());

app.post("/ai/analyze-grievance", (req, res) => {
  const { description } = req.body;

  // Extremely simple fake classification, just to prove the pipeline works
  const isGarbage = /garbage|waste|trash/i.test(description);

  res.json({
    category: isGarbage ? "Waste Management" : "General",
    department: null, // no real department _id yet, that's fine for now
    priority: "Medium",
    summary: description.slice(0, 100),
    duplicateOf: [],
    slaRiskScore: 0.3,
  });
});

app.listen(8000, () => console.log("Mock AI backend running on port 8000"));