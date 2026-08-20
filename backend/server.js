require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const { errorHandler, notFound } = require("./middleware/errorHandler");
const startCronJobs = require("./services/cronJobs");

// Connect to MongoDB
connectDB();

const app = express();

// ---------- Global middleware ----------
app.use(cors());
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ---------- Routes ----------
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const departmentRoutes = require("./routes/departmentRoutes");
app.use("/api/departments", departmentRoutes);

const grievanceRoutes = require("./routes/grievanceRoutes");
app.use("/api/grievances", grievanceRoutes);

const slaRoutes = require("./routes/slaRoutes");
app.use("/api/grievances-sla", slaRoutes);

// ---------- Health check ----------
app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "grievance-backend" });
});

// ---------- Error handling (must stay last, in this order) ----------
app.use(notFound);
app.use(errorHandler);

// ---------- Start server ----------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  startCronJobs();
});

module.exports = app;