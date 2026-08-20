import React, { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Clock3,
  FileText,
  Home,
  LogOut,
  MapPin,
  Menu,
  PlusCircle,
  Search,
  ShieldCheck,
  User,
  X,
  Loader2,
} from "lucide-react";

import {
  createGrievance,
  getGrievanceById,
  getMyGrievances,
  logout,
} from "../services/api";

const STATUS_LABELS = {
  SUBMITTED: "Submitted",
  ASSIGNED: "Assigned",
  IN_PROGRESS: "In Progress",
  RESOLVED: "Resolved",
  CLOSED: "Closed",
};

const STATUS_ORDER = [
  "SUBMITTED",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
];

const getStatusLabel = (status) => {
  return STATUS_LABELS[status] || status || "Unknown";
};

const getStatusClass = (status) => {
  switch (status) {
    case "RESOLVED":
    case "CLOSED":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";

    case "IN_PROGRESS":
      return "bg-blue-100 text-blue-800 border-blue-200";

    case "ASSIGNED":
      return "bg-amber-100 text-amber-800 border-amber-200";

    case "SUBMITTED":
      return "bg-slate-100 text-slate-700 border-slate-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const getPriorityClass = (priority) => {
  switch (priority) {
    case "High":
      return "bg-red-100 text-red-800 border-red-200";

    case "Medium":
      return "bg-amber-100 text-amber-800 border-amber-200";

    case "Low":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";

    default:
      return "bg-slate-100 text-slate-700 border-slate-200";
  }
};

const formatDate = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

const formatDateTime = (dateValue) => {
  if (!dateValue) {
    return "—";
  }

  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const getDepartmentName = (grievance) => {
  if (!grievance?.department) {
    return "Department pending";
  }

  if (typeof grievance.department === "string") {
    return grievance.department;
  }

  return grievance.department.name || "Department pending";
};

function StatCard({ icon: Icon, label, value, description }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            {label}
          </p>

          <p className="text-3xl font-extrabold text-[#0F2E5A] mt-2">
            {value}
          </p>

          <p className="text-xs text-slate-500 mt-1">
            {description}
          </p>
        </div>

        <div className="w-10 h-10 rounded-lg bg-slate-100 text-[#0F2E5A] flex items-center justify-center">
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}

function GrievanceCard({ grievance, onTrack }) {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-mono font-bold text-[#D97706]">
            {grievance.grievanceId || "Reference pending"}
          </p>

          <h4 className="text-base font-extrabold text-[#0F2E5A] mt-1 break-words">
            {grievance.title || "Untitled grievance"}
          </h4>
        </div>

        <span
          className={`inline-flex w-fit items-center px-2.5 py-1 rounded-full border text-[11px] font-bold ${getStatusClass(
            grievance.status
          )}`}
        >
          {getStatusLabel(grievance.status)}
        </span>
      </div>

      <p className="text-sm text-slate-600 leading-relaxed mt-3 line-clamp-3">
        {grievance.description || "No description available."}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Category
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {grievance.category || "Pending AI classification"}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Department
          </p>

          <p className="text-xs font-semibold text-slate-700 mt-1">
            {getDepartmentName(grievance)}
          </p>
        </div>

        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">
            Priority
          </p>

          <span
            className={`inline-flex mt-1 px-2 py-0.5 rounded border text-[10px] font-bold ${getPriorityClass(
              grievance.priority
            )}`}
          >
            {grievance.priority || "Medium"}
          </span>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mt-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
          <Clock3 className="w-3.5 h-3.5" />
          <span>
            Submitted {formatDate(grievance.createdAt)}
          </span>
        </div>

        <button
          type="button"
          onClick={() => onTrack(grievance)}
          className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-[#0F2E5A] text-white text-xs font-bold hover:bg-[#0A192F] transition"
        >
          Track grievance
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}

function TrackPanel({ grievance, onBack }) {
  const currentIndex = STATUS_ORDER.indexOf(grievance?.status);

  const history = Array.isArray(grievance?.statusHistory)
    ? grievance.statusHistory
    : [];

  return (
    <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
      <div className="p-5 sm:p-6 border-b border-slate-200">
        <button
          type="button"
          onClick={onBack}
          className="text-xs font-bold text-[#0F2E5A] hover:underline mb-4"
        >
          ← Back to grievances
        </button>

        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div>
            <p className="text-[11px] font-mono font-bold text-[#D97706]">
              {grievance.grievanceId}
            </p>

            <h3 className="text-xl font-extrabold text-[#0F2E5A] mt-1">
              {grievance.title}
            </h3>

            <p className="text-xs text-slate-500 mt-2">
              Submitted {formatDateTime(grievance.createdAt)}
            </p>
          </div>

          <span
            className={`inline-flex w-fit items-center px-3 py-1.5 rounded-full border text-xs font-bold ${getStatusClass(
              grievance.status
            )}`}
          >
            {getStatusLabel(grievance.status)}
          </span>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <h4 className="text-sm font-extrabold text-[#0F2E5A] mb-3">
              Current grievance details
            </h4>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Description
                </p>

                <p className="text-slate-700 leading-relaxed mt-1">
                  {grievance.description || "—"}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Category
                  </p>

                  <p className="font-semibold text-slate-700 mt-1">
                    {grievance.category || "—"}
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-slate-400">
                    Priority
                  </p>

                  <p className="font-semibold text-slate-700 mt-1">
                    {grievance.priority || "—"}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-[10px] uppercase font-bold text-slate-400">
                  Assigned department
                </p>

                <p className="font-semibold text-slate-700 mt-1">
                  {getDepartmentName(grievance)}
                </p>
              </div>

              {grievance.aiSummary && (
                <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-blue-700">
                    AI-generated summary
                  </p>

                  <p className="text-blue-900 leading-relaxed mt-1">
                    {grievance.aiSummary}
                  </p>
                </div>
              )}

              {grievance.resolutionNote && (
                <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                  <p className="text-[10px] uppercase font-bold text-emerald-700">
                    Resolution note
                  </p>

                  <p className="text-emerald-900 leading-relaxed mt-1">
                    {grievance.resolutionNote}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div>
            <h4 className="text-sm font-extrabold text-[#0F2E5A] mb-3">
              Status timeline
            </h4>

            <div className="space-y-4">
              {STATUS_ORDER.map((status, index) => {
                const reached =
                  currentIndex >= index && currentIndex >= 0;

                const historyItem = history.find(
                  (item) => item.status === status
                );

                return (
                  <div
                    key={status}
                    className="flex items-start gap-3"
                  >
                    <div
                      className={`w-8 h-8 rounded-full shrink-0 flex items-center justify-center border ${
                        reached
                          ? "bg-[#0F2E5A] border-[#0F2E5A] text-white"
                          : "bg-white border-slate-300 text-slate-400"
                      }`}
                    >
                      {reached ? (
                        <CheckCircle2 className="w-4 h-4" />
                      ) : (
                        <span className="text-xs font-bold">
                          {index + 1}
                        </span>
                      )}
                    </div>

                    <div className="pt-1">
                      <p
                        className={`text-xs font-bold ${
                          reached
                            ? "text-[#0F2E5A]"
                            : "text-slate-400"
                        }`}
                      >
                        {getStatusLabel(status)}
                      </p>

                      {historyItem?.changedAt && (
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {formatDateTime(historyItem.changedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {grievance.location &&
              (grievance.location.address ||
                grievance.location.lat ||
                grievance.location.lng) && (
                <div className="mt-6 p-3 bg-slate-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#D97706]" />

                    <p className="text-xs font-bold text-[#0F2E5A]">
                      Reported location
                    </p>
                  </div>

                  {grievance.location.address && (
                    <p className="text-xs text-slate-600 mt-2">
                      {grievance.location.address}
                    </p>
                  )}

                  {(grievance.location.lat ||
                    grievance.location.lng) && (
                    <p className="text-[10px] text-slate-500 mt-1">
                      Coordinates:{" "}
                      {grievance.location.lat ?? "—"},{" "}
                      {grievance.location.lng ?? "—"}
                    </p>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CitizenDashboard({
  user,
  onSignOut,
}) {
  const [activeView, setActiveView] = useState("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [grievances, setGrievances] = useState([]);
  const [selectedGrievance, setSelectedGrievance] = useState(null);

  const [loadingGrievances, setLoadingGrievances] =
    useState(true);

  const [loadingDetails, setLoadingDetails] = useState(false);

  const [submitting, setSubmitting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    title: "",
    description: "",
    address: "",
    lat: "",
    lng: "",
  });

  const loadGrievances = async () => {
    setLoadingGrievances(true);
    setError("");

    try {
      const data = await getMyGrievances();

      setGrievances(Array.isArray(data) ? data : []);
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to load your grievances."
      );
    } finally {
      setLoadingGrievances(false);
    }
  };

  useEffect(() => {
    loadGrievances();
  }, []);

  const stats = useMemo(() => {
    const total = grievances.length;

    const open = grievances.filter(
      (item) =>
        !["RESOLVED", "CLOSED"].includes(item.status)
    ).length;

    const resolved = grievances.filter((item) =>
      ["RESOLVED", "CLOSED"].includes(item.status)
    ).length;

    const highPriority = grievances.filter(
      (item) => item.priority === "High"
    ).length;

    return {
      total,
      open,
      resolved,
      highPriority,
    };
  }, [grievances]);

  const recentGrievances = grievances.slice(0, 5);

  const navigate = (view) => {
    setActiveView(view);
    setMobileMenuOpen(false);
    setError("");
    setSuccess("");

    if (view !== "track") {
      setSelectedGrievance(null);
    }
  };

  const handleSignOut = () => {
    logout();

    if (onSignOut) {
      onSignOut();
    }
  };

  const handleTrack = async (grievance) => {
    setError("");
    setSuccess("");
    setLoadingDetails(true);

    try {
      /*
       * The backend's /api/grievances/:id endpoint expects
       * the MongoDB _id, not the human-readable grievanceId.
       */
      const id = grievance?._id;

      if (!id) {
        throw new Error(
          "This grievance does not contain a valid record ID."
        );
      }

      const details = await getGrievanceById(id);

      setSelectedGrievance(details);
      setActiveView("track");
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to load grievance details."
      );
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  const handleSubmitGrievance = async (event) => {
    event.preventDefault();

    setError("");
    setSuccess("");

    const title = form.title.trim();
    const description = form.description.trim();
    const address = form.address.trim();

    if (!title) {
      setError("Please enter a grievance title.");
      return;
    }

    if (title.length > 150) {
      setError(
        "The grievance title must be under 150 characters."
      );
      return;
    }

    if (!description) {
      setError("Please describe your grievance.");
      return;
    }

    if (description.length < 10) {
      setError(
        "The grievance description must contain at least 10 characters."
      );
      return;
    }

    const hasLat = form.lat.trim() !== "";
    const hasLng = form.lng.trim() !== "";

    if (hasLat !== hasLng) {
      setError(
        "Please provide both latitude and longitude, or leave both blank."
      );
      return;
    }

    let location;

    if (hasLat && hasLng) {
      const lat = Number(form.lat);
      const lng = Number(form.lng);

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        setError(
          "Latitude and longitude must be valid numbers."
        );
        return;
      }

      if (lat < -90 || lat > 90) {
        setError("Latitude must be between -90 and 90.");
        return;
      }

      if (lng < -180 || lng > 180) {
        setError(
          "Longitude must be between -180 and 180."
        );
        return;
      }

      location = {
        lat,
        lng,
        ...(address ? { address } : {}),
      };
    } else if (address) {
      /*
       * The backend model supports address, but its validator
       * only validates lat/lng when those fields are supplied.
       */
      location = {
        address,
      };
    }

    setSubmitting(true);

    try {
      const created = await createGrievance({
        title,
        description,
        location,
      });

      setForm({
        title: "",
        description: "",
        address: "",
        lat: "",
        lng: "",
      });

      await loadGrievances();

      setSuccess(
        created?.grievanceId
          ? `Your grievance has been submitted successfully. Reference ID: ${created.grievanceId}`
          : "Your grievance has been submitted successfully."
      );

      setActiveView("dashboard");
    } catch (requestError) {
      setError(
        requestError?.message ||
          "Unable to submit your grievance."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const renderDashboardHome = () => (
    <>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-bold text-[#D97706]">
          Citizen Dashboard
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] mt-1">
          Welcome, {user?.name || "Citizen"}
        </h2>

        <p className="text-sm text-slate-600 mt-2">
          View your grievances, submit a new civic issue, and
          track its progress.
        </p>
      </div>

      {success && (
        <div className="mb-6 flex items-start gap-2 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-4 text-sm">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <span>{success}</span>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={FileText}
          label="Total grievances"
          value={stats.total}
          description="All grievances submitted"
        />

        <StatCard
          icon={Clock3}
          label="Open"
          value={stats.open}
          description="Not yet resolved or closed"
        />

        <StatCard
          icon={CheckCircle2}
          label="Resolved"
          value={stats.resolved}
          description="Resolved or closed cases"
        />

        <StatCard
          icon={AlertCircle}
          label="High priority"
          value={stats.highPriority}
          description="Cases marked high priority"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <button
          type="button"
          onClick={() => navigate("lodge")}
          className="text-left bg-[#0F2E5A] text-white rounded-xl p-6 hover:bg-[#0A192F] transition shadow-sm"
        >
          <PlusCircle className="w-7 h-7 text-amber-300 mb-4" />

          <h3 className="text-lg font-extrabold">
            Lodge a Grievance
          </h3>

          <p className="text-xs text-slate-300 mt-2 leading-relaxed">
            Describe your civic issue and submit it for
            AI-assisted classification and routing.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mt-5">
            Submit grievance
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("grievances")}
          className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
        >
          <FileText className="w-7 h-7 text-[#D97706] mb-4" />

          <h3 className="text-lg font-extrabold text-[#0F2E5A]">
            My Grievances
          </h3>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            View all grievances submitted from your citizen
            account.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-[#0F2E5A] mt-5">
            View grievances
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>

        <button
          type="button"
          onClick={() => navigate("profile")}
          className="text-left bg-white border border-slate-200 rounded-xl p-6 hover:shadow-md transition"
        >
          <User className="w-7 h-7 text-emerald-700 mb-4" />

          <h3 className="text-lg font-extrabold text-[#0F2E5A]">
            My Profile
          </h3>

          <p className="text-xs text-slate-500 mt-2 leading-relaxed">
            View the account information associated with your
            NIVARAN account.
          </p>

          <div className="flex items-center gap-2 text-xs font-bold text-[#0F2E5A] mt-5">
            View profile
            <ArrowRight className="w-4 h-4" />
          </div>
        </button>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-extrabold text-[#0F2E5A]">
              Recent grievances
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              Your latest submitted civic issues.
            </p>
          </div>

          <button
            type="button"
            onClick={() => navigate("grievances")}
            className="text-xs font-bold text-[#0F2E5A] hover:underline"
          >
            View all
          </button>
        </div>

        <div className="p-5">
          {loadingGrievances ? (
            <div className="flex items-center justify-center py-10 text-slate-500">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs font-semibold">
                Loading grievances...
              </span>
            </div>
          ) : recentGrievances.length === 0 ? (
            <div className="text-center py-10">
              <FileText className="w-8 h-8 text-slate-300 mx-auto" />

              <p className="text-sm font-bold text-slate-600 mt-3">
                No grievances submitted yet
              </p>

              <p className="text-xs text-slate-400 mt-1">
                Your submitted grievances will appear here.
              </p>

              <button
                type="button"
                onClick={() => navigate("lodge")}
                className="mt-4 bg-[#0F2E5A] text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-[#0A192F]"
              >
                Lodge your first grievance
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentGrievances.map((grievance) => (
                <GrievanceCard
                  key={grievance._id || grievance.grievanceId}
                  grievance={grievance}
                  onTrack={handleTrack}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );

  const renderLodgeGrievance = () => (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-bold text-[#D97706]">
          Citizen Services
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] mt-1">
          Lodge a Grievance
        </h2>

        <p className="text-sm text-slate-600 mt-2">
          Describe your civic issue clearly. The backend will
          send the description to the configured AI service for
          classification and routing.
        </p>
      </div>

      <form
        onSubmit={handleSubmitGrievance}
        className="bg-white border border-slate-200 rounded-xl shadow-sm p-5 sm:p-7"
      >
        <div className="space-y-5">
          <div>
            <label
              htmlFor="title"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Grievance title
            </label>

            <input
              id="title"
              name="title"
              type="text"
              maxLength={150}
              value={form.title}
              onChange={handleFormChange}
              placeholder="Example: Garbage not collected for three days"
              disabled={submitting}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2E5A] focus:ring-1 focus:ring-[#0F2E5A] disabled:bg-slate-100"
            />

            <p className="text-[10px] text-slate-400 mt-1">
              Maximum 150 characters.
            </p>
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-xs font-bold text-slate-700 mb-1.5"
            >
              Describe your grievance
            </label>

            <textarea
              id="description"
              name="description"
              rows={7}
              value={form.description}
              onChange={handleFormChange}
              placeholder="Explain what happened, where the issue is located, how long it has existed, and any other useful details."
              disabled={submitting}
              className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm resize-y focus:outline-none focus:border-[#0F2E5A] focus:ring-1 focus:ring-[#0F2E5A] disabled:bg-slate-100"
            />

            <p className="text-[10px] text-slate-400 mt-1">
              Minimum 10 characters.
            </p>
          </div>

          <div className="border-t border-slate-200 pt-5">
            <div className="flex items-center gap-2 mb-3">
              <MapPin className="w-4 h-4 text-[#D97706]" />

              <h3 className="text-sm font-extrabold text-[#0F2E5A]">
                Location
              </h3>

              <span className="text-[10px] text-slate-400">
                Optional
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label
                  htmlFor="address"
                  className="block text-xs font-bold text-slate-700 mb-1.5"
                >
                  Address / locality
                </label>

                <input
                  id="address"
                  name="address"
                  type="text"
                  value={form.address}
                  onChange={handleFormChange}
                  placeholder="Example: Main Road, Ward 12"
                  disabled={submitting}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2E5A] focus:ring-1 focus:ring-[#0F2E5A] disabled:bg-slate-100"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="lat"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Latitude
                  </label>

                  <input
                    id="lat"
                    name="lat"
                    type="number"
                    step="any"
                    value={form.lat}
                    onChange={handleFormChange}
                    placeholder="12.9716"
                    disabled={submitting}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2E5A] focus:ring-1 focus:ring-[#0F2E5A] disabled:bg-slate-100"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lng"
                    className="block text-xs font-bold text-slate-700 mb-1.5"
                  >
                    Longitude
                  </label>

                  <input
                    id="lng"
                    name="lng"
                    type="number"
                    step="any"
                    value={form.lng}
                    onChange={handleFormChange}
                    placeholder="77.5946"
                    disabled={submitting}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#0F2E5A] focus:ring-1 focus:ring-[#0F2E5A] disabled:bg-slate-100"
                  />
                </div>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs font-semibold"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              disabled={submitting}
              className="px-5 py-2.5 rounded-lg border border-slate-300 text-slate-700 text-xs font-bold hover:bg-slate-50 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="flex-1 bg-[#0F2E5A] hover:bg-[#0A192F] text-white px-5 py-2.5 rounded-lg text-xs font-extrabold flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting grievance...
                </>
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  Submit grievance
                </>
              )}
            </button>
          </div>
        </div>
      </form>
    </div>
  );

  const renderGrievances = () => (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-bold text-[#D97706]">
          Citizen Services
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] mt-1">
          My Grievances
        </h2>

        <p className="text-sm text-slate-600 mt-2">
          All grievances submitted using your NIVARAN account.
        </p>
      </div>

      {loadingGrievances ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 flex justify-center items-center">
          <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#0F2E5A]" />

          <span className="text-xs font-semibold text-slate-500">
            Loading your grievances...
          </span>
        </div>
      ) : grievances.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />

          <h3 className="text-base font-extrabold text-slate-700 mt-4">
            No grievances found
          </h3>

          <p className="text-xs text-slate-500 mt-1">
            You have not submitted any grievances yet.
          </p>

          <button
            type="button"
            onClick={() => navigate("lodge")}
            className="mt-5 bg-[#0F2E5A] text-white px-5 py-2.5 rounded-lg text-xs font-bold"
          >
            Lodge a grievance
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {grievances.map((grievance) => (
            <GrievanceCard
              key={grievance._id || grievance.grievanceId}
              grievance={grievance}
              onTrack={handleTrack}
            />
          ))}
        </div>
      )}
    </div>
  );

  const renderProfile = () => (
    <div>
      <div className="mb-6">
        <p className="text-xs uppercase tracking-widest font-bold text-[#D97706]">
          Account
        </p>

        <h2 className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] mt-1">
          My Profile
        </h2>

        <p className="text-sm text-slate-600 mt-2">
          Account information returned by the NIVARAN backend.
        </p>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl shadow-sm p-6 max-w-2xl">
        <div className="flex items-center gap-4 pb-5 border-b border-slate-200">
          <div className="w-14 h-14 rounded-full bg-[#0F2E5A] text-white flex items-center justify-center">
            <User className="w-6 h-6" />
          </div>

          <div>
            <h3 className="text-lg font-extrabold text-[#0F2E5A]">
              {user?.name || "Citizen"}
            </h3>

            <p className="text-xs text-slate-500 mt-1">
              {user?.role || "citizen"}
            </p>
          </div>
        </div>

        <div className="space-y-4 mt-5">
          <div>
            <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
              Full Name
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              {user?.name || "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
              Email
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1">
              {user?.email || "—"}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase tracking-wide font-bold text-slate-400">
              Account Role
            </p>

            <p className="text-sm font-semibold text-slate-700 mt-1 capitalize">
              {user?.role || "citizen"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    if (activeView === "lodge") {
      return renderLodgeGrievance();
    }

    if (activeView === "grievances") {
      return renderGrievances();
    }

    if (activeView === "track") {
      if (loadingDetails) {
        return (
          <div className="bg-white border border-slate-200 rounded-xl p-12 flex justify-center items-center">
            <Loader2 className="w-5 h-5 animate-spin mr-2 text-[#0F2E5A]" />

            <span className="text-xs font-semibold text-slate-500">
              Loading grievance details...
            </span>
          </div>
        );
      }

      if (!selectedGrievance) {
        return renderGrievances();
      }

      return (
        <TrackPanel
          grievance={selectedGrievance}
          onBack={() => navigate("grievances")}
        />
      );
    }

    if (activeView === "profile") {
      return renderProfile();
    }

    return renderDashboardHome();
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Dashboard top bar */}
      <header className="bg-[#0F2E5A] text-white border-b-4 border-amber-400 sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="h-16 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 bg-amber-400 text-[#0F2E5A] rounded-lg flex items-center justify-center font-black">
                🇮🇳
              </div>

              <div className="min-w-0">
                <p className="font-extrabold font-heading text-base truncate">
                  NIVARAN
                </p>

                <p className="text-[10px] text-slate-300 truncate">
                  Citizen Grievance Portal
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <div className="text-right">
                <p className="text-xs font-bold">
                  {user?.name || "Citizen"}
                </p>

                <p className="text-[10px] text-slate-300">
                  {user?.email || ""}
                </p>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                className="flex items-center gap-2 bg-slate-900/50 border border-slate-600 hover:bg-slate-900 px-3 py-2 rounded-lg text-xs font-bold transition"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>

            <button
              type="button"
              onClick={() =>
                setMobileMenuOpen((current) => !current)
              }
              className="md:hidden p-2 rounded-lg hover:bg-slate-800"
              aria-label="Open dashboard menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>
          </div>

          {mobileMenuOpen && (
            <div className="md:hidden border-t border-slate-700 py-3 space-y-2">
              <p className="text-xs font-bold">
                {user?.name || "Citizen"}
              </p>

              <p className="text-[10px] text-slate-400 mb-3">
                {user?.email || ""}
              </p>

              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2 justify-center bg-slate-900/60 border border-slate-600 px-3 py-2 rounded-lg text-xs font-bold"
              >
                <LogOut className="w-3.5 h-3.5" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-[1600px] mx-auto flex min-h-[calc(100vh-64px)]">
        {/* Sidebar */}
        <aside className="hidden md:flex w-64 shrink-0 bg-white border-r border-slate-200 flex-col">
          <div className="p-5 border-b border-slate-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />

              <div>
                <p className="text-xs font-extrabold text-[#0F2E5A]">
                  Authenticated Citizen
                </p>

                <p className="text-[10px] text-slate-400 mt-0.5">
                  Secure portal access
                </p>
              </div>
            </div>
          </div>

          <nav className="p-3 space-y-1">
            <button
              type="button"
              onClick={() => navigate("dashboard")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeView === "dashboard"
                  ? "bg-[#0F2E5A] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <Home className="w-4 h-4" />
              Dashboard
            </button>

            <button
              type="button"
              onClick={() => navigate("lodge")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeView === "lodge"
                  ? "bg-[#0F2E5A] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <PlusCircle className="w-4 h-4" />
              Lodge Grievance
            </button>

            <button
              type="button"
              onClick={() => navigate("grievances")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeView === "grievances" ||
                activeView === "track"
                  ? "bg-[#0F2E5A] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <FileText className="w-4 h-4" />
              My Grievances
            </button>

            <button
              type="button"
              onClick={() => navigate("profile")}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-bold transition ${
                activeView === "profile"
                  ? "bg-[#0F2E5A] text-white"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              <User className="w-4 h-4" />
              Profile
            </button>
          </nav>

          <div className="mt-auto p-4">
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              <p className="text-[10px] font-bold text-[#0F2E5A]">
                Need assistance?
              </p>

              <p className="text-[10px] text-slate-500 mt-1 leading-relaxed">
                Use the grievance form to report civic issues
                through the NIVARAN portal.
              </p>
            </div>
          </div>
        </aside>

        {/* Mobile navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden fixed inset-x-0 top-16 z-30 bg-white border-b border-slate-200 shadow-lg p-3">
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => navigate("dashboard")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 text-xs font-bold text-[#0F2E5A]"
              >
                <Home className="w-4 h-4" />
                Dashboard
              </button>

              <button
                type="button"
                onClick={() => navigate("lodge")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 text-xs font-bold text-[#0F2E5A]"
              >
                <PlusCircle className="w-4 h-4" />
                Lodge
              </button>

              <button
                type="button"
                onClick={() => navigate("grievances")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 text-xs font-bold text-[#0F2E5A]"
              >
                <FileText className="w-4 h-4" />
                My Grievances
              </button>

              <button
                type="button"
                onClick={() => navigate("profile")}
                className="flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-slate-100 text-xs font-bold text-[#0F2E5A]"
              >
                <User className="w-4 h-4" />
                Profile
              </button>
            </div>
          </div>
        )}

        {/* Main */}
        <main className="flex-1 min-w-0">
          <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
            {error && activeView !== "lodge" && (
              <div
                role="alert"
                className="mb-6 flex items-start gap-2 bg-red-50 border border-red-200 text-red-800 rounded-lg p-3 text-xs font-semibold"
              >
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {renderContent()}
          </div>
        </main>
      </div>
    </div>
  );
}