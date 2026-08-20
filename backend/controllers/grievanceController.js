const Grievance = require("../models/Grievance");
const generateGrievanceId = require("../services/generateGrievanceId");
const { analyzeGrievance } = require("../services/aiService");
const asyncHandler = require("../middleware/asyncHandler");
const ApiError = require("../middleware/apiError");

// @route POST /api/grievances  (citizen)
const createGrievance = asyncHandler(async (req, res) => {
  const { title, description, location } = req.body;

  const aiResult = await analyzeGrievance(description);

  const grievance = await Grievance.create({
    grievanceId: generateGrievanceId(),
    citizen: req.user._id,
    title,
    description,
    category: aiResult.category,
    department: aiResult.department,
    priority: aiResult.priority,
    aiSummary: aiResult.summary,
    duplicateOf: aiResult.duplicateOf,
    slaRiskScore: aiResult.slaRiskScore,
    location: location || {},
    statusHistory: [{ status: "SUBMITTED", changedBy: req.user._id }],
  });

  res.status(201).json({
    ...grievance.toObject(),
    aiProcessed: aiResult.success,
  });
});

// @route GET /api/grievances/my  (citizen)
const getMyGrievances = asyncHandler(async (req, res) => {
  const grievances = await Grievance.find({ citizen: req.user._id })
    .populate("department", "name category")
    .sort({ createdAt: -1 });

  res.json(grievances);
});

// @route GET /api/grievances/:id
const getGrievanceById = asyncHandler(async (req, res) => {
  const grievance = await Grievance.findById(req.params.id)
    .populate("department", "name category")
    .populate("citizen", "name email")
    .populate("duplicateOf", "grievanceId title status");

  if (!grievance) {
    throw new ApiError(404, "Grievance not found");
  }

  const isOwner = grievance.citizen._id.toString() === req.user._id.toString();
  const isStaff = ["officer", "admin"].includes(req.user.role);

  if (!isOwner && !isStaff) {
    throw new ApiError(403, "Access denied");
  }

  res.json(grievance);
});

// @route GET /api/grievances  (officer/admin)
const getAllGrievances = asyncHandler(async (req, res) => {
  const { status, department, priority } = req.query;

  const filter = {};
  if (status) filter.status = status;
  if (department) filter.department = department;
  if (priority) filter.priority = priority;

  const grievances = await Grievance.find(filter)
    .populate("department", "name category")
    .populate("citizen", "name email")
    .sort({ createdAt: -1 });

  res.json(grievances);
});

// @route PATCH /api/grievances/:id/status  (officer/admin)
const updateGrievanceStatus = asyncHandler(async (req, res) => {
  const { status, resolutionNote } = req.body;

  const grievance = await Grievance.findById(req.params.id);
  if (!grievance) {
    throw new ApiError(404, "Grievance not found");
  }

  grievance.status = status;
  if (resolutionNote) grievance.resolutionNote = resolutionNote;
  grievance.statusHistory.push({ status, changedBy: req.user._id });

  await grievance.save();
  res.json(grievance);
});

module.exports = {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
};