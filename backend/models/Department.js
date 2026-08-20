const mongoose = require("mongoose");

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      unique: true,
      trim: true,
    },
    category: {
      type: String, // e.g. "Waste Management", "Water Supply", "Roads"
      required: true,
      trim: true,
    },
    slaHours: {
      type: Number, // how many hours before a grievance is considered overdue
      default: 72,
    },
    contactEmail: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Department", departmentSchema);