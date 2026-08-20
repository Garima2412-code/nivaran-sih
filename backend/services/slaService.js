const Grievance = require("../models/Grievance");
const Department = require("../models/Department");

// Recalculates slaRiskScore for every open grievance based on how much
// of its department's SLA window has elapsed.
// Score: 0 = just submitted, 1 = at or past the SLA deadline.
const recalculateSlaRisk = async () => {
  const openStatuses = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS"];

  const grievances = await Grievance.find({ status: { $in: openStatuses } }).populate(
    "department",
    "slaHours"
  );

  let updatedCount = 0;
  let escalatedCount = 0;

  for (const grievance of grievances) {
    const slaHours = grievance.department?.slaHours || 72; // default if no department assigned yet
    const elapsedHours = (Date.now() - grievance.createdAt.getTime()) / (1000 * 60 * 60);

    let riskScore = elapsedHours / slaHours;
    riskScore = Math.min(Math.round(riskScore * 100) / 100, 1); // clamp to [0, 1], 2 decimal places

    if (grievance.slaRiskScore !== riskScore) {
      grievance.slaRiskScore = riskScore;
      await grievance.save();
      updatedCount++;
    }

    if (riskScore >= 1) escalatedCount++;
  }

  console.log(
    `SLA recalculation done: ${updatedCount} updated, ${escalatedCount} at/past deadline`
  );

  return { checked: grievances.length, updated: updatedCount, escalated: escalatedCount };
};

module.exports = { recalculateSlaRisk };