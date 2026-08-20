require("dotenv").config();
const mongoose = require("mongoose");
const connectDB = require("./db");

const User = require("../models/User");
const Department = require("../models/Department");
const Grievance = require("../models/Grievance");
const generateGrievanceId = require("../services/generateGrievanceId");

const seedData = async () => {
  try {
    await connectDB();

    // Wipe existing data so this script is safely re-runnable
    await Grievance.deleteMany();
    await Department.deleteMany();
    await User.deleteMany();

    console.log("Old data cleared");

    // --- Departments ---
    const departments = await Department.insertMany([
      { name: "Municipal Corporation", category: "Waste Management", slaHours: 72, contactEmail: "waste@city.gov.in" },
      { name: "Water Supply Board", category: "Water Supply", slaHours: 48, contactEmail: "water@city.gov.in" },
      { name: "Roads & Infrastructure", category: "Roads", slaHours: 96, contactEmail: "roads@city.gov.in" },
      { name: "Electricity Board", category: "Street Lighting", slaHours: 48, contactEmail: "power@city.gov.in" },
    ]);
    console.log(`${departments.length} departments created`);

    // --- Users ---
    const admin = await User.create({
      name: "Admin User",
      email: "admin@nivaran.gov.in",
      password: "admin123",
      role: "admin",
    });

    const officer = await User.create({
      name: "Officer Ramesh",
      email: "officer@nivaran.gov.in",
      password: "officer123",
      role: "officer",
      department: departments[0]._id, // Municipal Corporation
    });

    const citizens = await Promise.all([
  User.create({
    name: "Anita Sharma",
    email: "anita@example.com",
    password: "citizen123",
    role: "citizen",
  }),
  User.create({
    name: "Rohit Verma",
    email: "rohit@example.com",
    password: "citizen123",
    role: "citizen",
  }),
  User.create({
    name: "Priya Nair",
    email: "priya@example.com",
    password: "citizen123",
    role: "citizen",
  }),
  User.create({
    name: "Suresh Kumar",
    email: "suresh@example.com",
    password: "citizen123",
    role: "citizen",
  }),
]);
    console.log("Users created (admin, officer, 4 citizens)");

    // --- Grievances, including a pre-linked duplicate cluster ---

    // 3 citizens independently report the SAME pothole -> this is your live duplicate-detection demo
    const clusterGrievances = [];
    const clusterReporters = [citizens[0], citizens[1], citizens[2]];
    const clusterDescriptions = [
      "There is a large pothole on MG Road near the bus stop, very dangerous for two-wheelers.",
      "Deep pothole on MG Road close to the bus stop, my scooter got damaged yesterday.",
      "Big pothole near MG Road bus stop, needs urgent repair, almost caused an accident.",
    ];

    for (let i = 0; i < clusterReporters.length; i++) {
      const g = await Grievance.create({
        grievanceId: generateGrievanceId(),
        citizen: clusterReporters[i]._id,
        title: "Pothole on MG Road",
        description: clusterDescriptions[i],
        category: "Roads",
        department: departments[2]._id, // Roads & Infrastructure
        priority: "High",
        status: "SUBMITTED",
        location: { address: "MG Road, near bus stop" },
        slaRiskScore: 0.4 + i * 0.1,
        statusHistory: [{ status: "SUBMITTED", changedBy: clusterReporters[i]._id }],
      });
      clusterGrievances.push(g);
    }

    // Link them to each other as duplicates (both directions, so any one of them shows the full cluster)
    const clusterIds = clusterGrievances.map((g) => g._id);
    for (const g of clusterGrievances) {
      g.duplicateOf = clusterIds.filter((id) => id.toString() !== g._id.toString());
      await g.save();
    }
    console.log("Duplicate cluster created (3 linked pothole complaints)");

    // A few independent, unrelated grievances for variety on the dashboard
    await Grievance.create({
      grievanceId: generateGrievanceId(),
      citizen: citizens[3]._id,
      title: "Garbage not collected",
      description: "Garbage has not been collected near my apartment for 5 days.",
      category: "Waste Management",
      department: departments[0]._id,
      priority: "Medium",
      status: "IN_PROGRESS",
      location: { address: "Koramangala 5th Block" },
      slaRiskScore: 0.75, // high risk, good for demoing predictive escalation
      statusHistory: [{ status: "SUBMITTED", changedBy: citizens[3]._id }],
    });

    await Grievance.create({
      grievanceId: generateGrievanceId(),
      citizen: citizens[0]._id,
      title: "Water leakage on 2nd Cross",
      description: "Continuous water leakage from a broken pipe for 2 days, wasting a lot of water.",
      category: "Water Supply",
      department: departments[1]._id,
      priority: "High",
      status: "RESOLVED",
      location: { address: "2nd Cross, Indiranagar" },
      slaRiskScore: 0.1,
      resolutionNote: "Pipe repaired by maintenance team.",
      statusHistory: [{ status: "SUBMITTED", changedBy: citizens[0]._id }],
    });

    console.log("Additional demo grievances created");
    console.log("\nSeed complete. Login credentials:");
    console.log("  Admin:   admin@nivaran.gov.in / admin123");
    console.log("  Officer: officer@nivaran.gov.in / officer123");
    console.log("  Citizen: anita@example.com / citizen123");

    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);
    process.exit(1);
  }
};

seedData();