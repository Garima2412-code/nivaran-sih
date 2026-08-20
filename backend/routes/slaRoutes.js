const express = require("express");
const { getAtRiskGrievances, triggerRecalculation } = require("../controllers/slaController");
const { protect, authorizeRoles } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/at-risk", protect, authorizeRoles("officer", "admin"), getAtRiskGrievances);
router.post("/recalculate", protect, authorizeRoles("admin"), triggerRecalculation);

module.exports = router;