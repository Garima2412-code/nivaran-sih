const cron = require("node-cron");
const { recalculateSlaRisk } = require("./slaService");

const startCronJobs = () => {
  // Runs every 15 minutes. For a hackathon demo, this is frequent enough
  // to show live changes without needing to wait long.
  cron.schedule("*/15 * * * *", async () => {
    console.log("Running scheduled SLA recalculation...");
    try {
      await recalculateSlaRisk();
    } catch (error) {
      console.error("Scheduled SLA recalculation failed:", error.message);
    }
  });

  console.log("Cron jobs started (SLA recalculation every 15 minutes)");
};

module.exports = startCronJobs;