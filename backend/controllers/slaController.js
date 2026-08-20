const Grievance = require("../models/Grievance");
const asyncHandler = require("../middleware/asyncHandler");
const { recalculateSlaRisk } = require("../services/slaService");

// @route GET /api/grievances-sla/at-risk  (officer/admin)
// Returns open grievances above a risk threshold, highest risk first.
const getAtRiskGrievances = asyncHandler(async (req, res) => {
  const threshold = parseFloat(req.query.threshold) || 0.7;

  const grievances = await Grievance.find({
    status: { $in: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"] },
    slaRiskScore: { $gte: threshold },
  })
    .populate("department", "name category slaHours")
    .populate("citizen", "name email")
    .sort({ slaRiskScore: -1 });

  res.json({ threshold, count: grievances.length, grievances });
});

// @route POST /api/grievances-sla/recalculate  (admin) - manual trigger, useful for demo
const triggerRecalculation = asyncHandler(async (req, res) => {
  const result = await recalculateSlaRisk();
  res.json({ message: "SLA risk recalculated", ...result });
});

module.exports = { getAtRiskGrievances, triggerRecalculation };