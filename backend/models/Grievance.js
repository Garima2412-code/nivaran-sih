const mongoose = require("mongoose");

const grievanceSchema = new mongoose.Schema(
  {
    grievanceId: {
      type: String,
      unique: true,
      required: true, // generated in the controller before save
    },
    citizen: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    category: {
      type: String,
      trim: true,
      default: "Uncategorized", // filled by AI backend, or manually as fallback
    },
    department: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department",
      default: null,
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },
    status: {
      type: String,
      enum: ["SUBMITTED", "ASSIGNED", "IN_PROGRESS", "RESOLVED", "CLOSED"],
      default: "SUBMITTED",
    },
    location: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      address: { type: String, trim: true, default: "" },
    },
    duplicateOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Grievance",
      },
    ],
    slaRiskScore: {
      type: Number, // 0 to 1, higher = closer to breaching SLA
      default: 0,
    },
    aiSummary: {
      type: String,
      default: "",
    },
    resolutionNote: {
      type: String,
      default: "",
    },
    statusHistory: [
      {
        status: { type: String },
        changedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        changedAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Grievance", grievanceSchema);