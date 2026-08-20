const Grievance = require("../models/Grievance");
const generateGrievanceId = require("../services/generateGrievanceId");

// @route POST /api/grievances  (citizen)
const createGrievance = async (req, res) => {
  try {
    const { title, description, category, department, location } = req.body;

    if (!title || !description) {
      return res.status(400).json({ message: "Title and description are required" });
    }

    const grievance = await Grievance.create({
      grievanceId: generateGrievanceId(),
      citizen: req.user._id,
      title,
      description,
      category: category || "Uncategorized",
      department: department || null,
      location: location || {},
      statusHistory: [
        { status: "SUBMITTED", changedBy: req.user._id },
      ],
    });

    res.status(201).json(grievance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/grievances/my  (citizen - their own grievances)
const getMyGrievances = async (req, res) => {
  try {
    const grievances = await Grievance.find({ citizen: req.user._id })
      .populate("department", "name category")
      .sort({ createdAt: -1 });

    res.json(grievances);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/grievances/:id  (citizen who owns it, or officer/admin)
const getGrievanceById = async (req, res) => {
  try {
    const grievance = await Grievance.findById(req.params.id)
      .populate("department", "name category")
      .populate("citizen", "name email")
      .populate("duplicateOf", "grievanceId title status");

    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    const isOwner = grievance.citizen._id.toString() === req.user._id.toString();
    const isStaff = ["officer", "admin"].includes(req.user.role);

    if (!isOwner && !isStaff) {
      return res.status(403).json({ message: "Access denied" });
    }

    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route GET /api/grievances  (officer/admin - all grievances, optionally filtered)
const getAllGrievances = async (req, res) => {
  try {
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
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @route PATCH /api/grievances/:id/status  (officer/admin)
const updateGrievanceStatus = async (req, res) => {
  try {
    const { status, resolutionNote } = req.body;

    const validStatuses = ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }

    const grievance = await Grievance.findById(req.params.id);
    if (!grievance) {
      return res.status(404).json({ message: "Grievance not found" });
    }

    grievance.status = status;
    if (resolutionNote) grievance.resolutionNote = resolutionNote;
    grievance.statusHistory.push({ status, changedBy: req.user._id });

    await grievance.save();
    res.json(grievance);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

module.exports = {
  createGrievance,
  getMyGrievances,
  getGrievanceById,
  getAllGrievances,
  updateGrievanceStatus,
};