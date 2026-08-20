const Grievance = require("../models/Grievance");
const Department = require("../models/Department");
const generateGrievanceId = require("../services/generateGrievanceId");

const { analyzeGrievance } = require("../services/aiService");

// @route POST /api/grievances  (citizen)
const createGrievance = async (req, res) => {
  try {
    const { title, description, location } = req.body;

    if (!title || !description) {
      return res
        .status(400)
        .json({ message: "Title and description are required" });
    }

    // Ask the JanSahay AI backend to classify the complaint.
    // If AI fails, aiService returns safe fallback values.
    const aiResult = await analyzeGrievance(description);

    // Convert the AI department name into the corresponding
    // MongoDB Department document/ObjectId.
    const department = aiResult.department
      ? await Department.findOne({ name: aiResult.department })
      : null;

    // Convert JanSahay AI priority values into the values
    // expected by the MongoDB Grievance schema.
    const priorityMap = {
      LOW: "Low",
      MEDIUM: "Medium",
      HIGH: "High",
      CRITICAL: "Critical",
    };

    const normalizedPriority =
      priorityMap[String(aiResult.priority).toUpperCase()] || "Medium";

    const grievance = await Grievance.create({
      grievanceId: generateGrievanceId(),
      citizen: req.user._id,
      title,
      description,

      // AI classification
      category: aiResult.category,

      // MongoDB expects a Department ObjectId, not the AI's
      // department-name string.
      department: department ? department._id : null,

      // MongoDB expects Low/Medium/High/Critical.
      priority: normalizedPriority,

      aiSummary: aiResult.summary,
      duplicateOf: aiResult.duplicateOf,
      slaRiskScore: aiResult.slaRiskScore,

      location: location || {},

      statusHistory: [
        {
          status: "SUBMITTED",
          changedBy: req.user._id,
        },
      ],
    });

    res.status(201).json({
      ...grievance.toObject(),

      // true = JanSahay AI successfully processed the complaint
      // false = safe fallback was used
      aiProcessed: aiResult.success,
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @route GET /api/grievances/my
// @description Citizen gets their own grievances
const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({
      citizen: req.user._id,
    })
      .populate("department", "name category")
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @route GET /api/grievances/:id
// @description Citizen who owns grievance, officer, or admin
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("department", "name category")
      .populate("citizen", "name email")
      .populate("duplicateOf", "grievanceId title status");

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    const isOwner =
      grievance.citizen._id.toString() === req.user._id.toString();

    const isStaff = ["officer", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    res.json(grievance);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @route GET /api/grievances
// @description Officer/admin gets all grievances, optionally filtered
const getAllGrievances = async (req, res) => {
  try {
    const { status, department, priority } = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (department) {
      filter.department = department;
    }

    if (priority) {
      filter.priority = priority;
    }

    const grievances = await Grievance.find(filter)
      .populate("department", "name category")
      .populate("citizen", "name email")
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

// @route PATCH /api/grievances/:id/status
// @description Officer/admin updates grievance status
const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const validStatuses = [
      "SUBMITTED",
      "ASSIGNED",
      "IN_PROGRESS",
      "RESOLVED",
      "CLOSED",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        message: "Invalid status value",
      });
    }

    const grievance = await Grievance.findById(req.params.id);

    if (!grievance) {
      return res.status(404).json({
        message: "Grievance not found",
      });
    }

    grievance.status = status;

    if (resolutionNote) {
      grievance.resolutionNote = resolutionNote;
    }

    grievance.statusHistory.push({
      status,
      changedBy: req.user._id,
    });

    await grievance.save();

    res.json(grievance);
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message,
    });
  }
};

module.exports = {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
};