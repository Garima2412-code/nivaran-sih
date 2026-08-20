import React, { useState } from 'react';
import { 
  Sparkles, 
  Building2, 
  Layers, 
  AlertTriangle, 
  CheckCircle2, 
  FileText, 
  MapPin, 
  Clock, 
  ShieldCheck, 
  RefreshCw,
  Zap,
  Tag
} from 'lucide-react';

export default function AiPlayground({ initialPrompt = '', onOpenAuth }) {
  const [inputText, setInputText] = useState(
    initialPrompt || "There is heavy garbage piled outside main market entrance near sector 14 for 5 days. Smelling bad and blocking walkway."
  );
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState({
    category: "Waste Management & Sanitation",
    department: "Municipal Corporation (Solid Waste Dept)",
    priority: "HIGH",
    summary: "Uncollected residential solid waste accumulated over 5 days creating public health hazard.",
    slaHours: 24,
    slaRiskScore: 0.82,
    duplicateCount: 3,
    linkedClusterId: "CLST-DEL-2026-891",
    extractedFields: {
      location: "Sector 14 Main Market, Dwarka",
      duration: "5 Days",
      issueType: "Uncollected Garbage Accumulation",
      severity: "High (Health Hazard)"
    }
  });

  const presetExamples = [
    {
      title: "Waste Management",
      text: "Garbage piling up outside apartment building for 5 days near block B street."
    },
    {
      title: "Road Maintenance / Pothole",
      text: "Large pothole on main avenue road causing accidents and heavy waterlogging."
    },
    {
      title: "Street Lighting",
      text: "All 6 streetlights in sector 4 park pathway are dark since last Monday."
    },
    {
      title: "Water Supply Leakage",
      text: "Clean drinking water pipeline leaking continuously near central tank for 2 days."
    }
  ];

  const handleRunAnalysis = (textToAnalyze) => {
    const text = textToAnalyze || inputText;
    if (!text.trim()) return;

    setAnalyzing(true);

    setTimeout(() => {
      // Dynamic mock analysis based on text keywords
      const lower = text.toLowerCase();
      let category = "General Civic Services";
      let department = "Urban Local Body (ULB)";
      let priority = "MEDIUM";
      let slaHours = 48;
      let slaRiskScore = 0.45;
      let duplicateCount = 1;

      if (lower.includes("garbage") || lower.includes("waste") || lower.includes("trash") || lower.includes("कचरा")) {
        category = "Waste Management & Sanitation";
        department = "Municipal Corporation (Sanitation Department)";
        priority = "HIGH";
        slaHours = 24;
        slaRiskScore = 0.84;
        duplicateCount = 3;
      } else if (lower.includes("pothole") || lower.includes("road") || lower.includes("सड़क") || lower.includes("गड्ढा")) {
        category = "Roads & Public Works (PWD)";
        department = "Public Works Department (Civil Maintenance)";
        priority = "HIGH";
        slaHours = 36;
        slaRiskScore = 0.72;
        duplicateCount = 4;
      } else if (lower.includes("light") || lower.includes("dark") || lower.includes("बिजली")) {
        category = "Electrical & Street Lighting";
        department = "Municipal Electrical Division";
        priority = "MEDIUM";
        slaHours = 48;
        slaRiskScore = 0.38;
        duplicateCount = 2;
      } else if (lower.includes("water") || lower.includes("leak") || lower.includes("पानी")) {
        category = "Water Supply & Sewage (Jal Board)";
        department = "City Water Supply & Drainage Board";
        priority = "HIGH";
        slaHours = 12;
        slaRiskScore = 0.91;
        duplicateCount = 5;
      }

      setAiResult({
        category,
        department,
        priority,
        summary: `AI Parsed: ${text.slice(0, 80)}... (Extracted entity & verified against department SLA).`,
        slaHours,
        slaRiskScore,
        duplicateCount,
        linkedClusterId: `CLST-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        extractedFields: {
          location: lower.includes("sector") ? "Extracted Location Tag" : "Detected from Citizen GPS/Input",
          duration: lower.includes("days") ? "Extracted Duration" : "Recently Reported",
          issueType: category,
          severity: priority === "HIGH" ? "Critical Priority" : "Standard Priority"
        }
      });
      setAnalyzing(false);
    }, 900);
  };

  return (
    <section id="ai-demo" className="py-16 bg-slate-900 text-white relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Title */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 bg-amber-400/10 border border-amber-400/30 px-3 py-1 rounded-full text-xs font-bold text-amber-300 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Interactive Live AI Sandbox</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white tracking-tight">
            See AI Grievance Intelligence in Action
          </h2>
          <p className="text-slate-400 text-sm mt-3">
            Type any complaint below or click a preset example. Watch our AI model classify the category, assign the right department, compute SLA risks, and cross-match duplicate complaints in real-time.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Complaint Input & Presets */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-slate-800/80 border border-slate-700 rounded-2xl p-6 shadow-xl">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                1. Describe your grievance in plain language:
              </label>

              <textarea
                rows={5}
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder="Type your complaint naturally here..."
                className="w-full bg-slate-900 border border-slate-700 focus:border-[#FF9933] rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none transition resize-none"
              ></textarea>

              {/* Run Button */}
              <button
                onClick={() => handleRunAnalysis()}
                disabled={analyzing}
                className="w-full mt-4 flex items-center justify-center space-x-2 bg-gradient-to-r from-[#FF9933] via-amber-400 to-[#138808] text-slate-950 font-extrabold text-sm py-3.5 px-6 rounded-xl shadow-lg hover:opacity-95 transition transform active:scale-95 disabled:opacity-50"
              >
                {analyzing ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                    <span>Analyzing Grievance Structure...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-slate-950 fill-current" />
                    <span>Run AI Classification & Duplicate Check</span>
                  </>
                )}
              </button>

            </div>

            {/* Presets Selector */}
            <div className="bg-slate-800/40 border border-slate-700/60 rounded-2xl p-5">
              <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
                Or click a pre-seeded SIH demo scenario:
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                {presetExamples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setInputText(ex.text);
                      handleRunAnalysis(ex.text);
                    }}
                    className="text-left bg-slate-900/80 hover:bg-slate-800 border border-slate-700 hover:border-amber-400/50 p-3 rounded-xl transition text-xs group"
                  >
                    <span className="font-bold text-amber-300 block mb-1 group-hover:text-white">{ex.title}</span>
                    <span className="text-slate-400 text-[11px] line-clamp-2">"{ex.text}"</span>
                  </button>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: Real-time Structured AI Output Visualizer */}
          <div className="lg:col-span-7">
            <div className="bg-slate-800/90 border-2 border-slate-700 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              
              {/* Top Bar of Output Card */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-700 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                  <span className="text-xs font-bold tracking-wider text-slate-300 uppercase">Real-Time AI Processing Result</span>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded border border-emerald-800">
                  Latency: 140ms • LLM + Sentence-Embeddings
                </span>
              </div>

              {analyzing ? (
                <div className="py-16 text-center space-y-4">
                  <RefreshCw className="w-10 h-10 text-[#FF9933] animate-spin mx-auto" />
                  <p className="text-slate-300 font-medium text-sm">Processing Complaint NLP Embeddings...</p>
                  <p className="text-slate-500 text-xs">Matching against MoHUA Department Knowledge Rules & Duplicate Cluster Indices</p>
                </div>
              ) : (
                <div className="space-y-6">
                  
                  {/* Grid 1: Department & Category Routing */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    
                    <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1.5">
                        <Building2 className="w-4 h-4 text-[#FF9933]" />
                        <span>Recommended Department</span>
                      </div>
                      <p className="text-sm font-extrabold text-amber-300">{aiResult.department}</p>
                      <span className="inline-block mt-2 text-[10px] bg-amber-400/20 text-amber-300 font-bold px-2 py-0.5 rounded border border-amber-400/30">
                        100% Match Confidence
                      </span>
                    </div>

                    <div className="bg-slate-900/90 border border-slate-700 p-4 rounded-xl">
                      <div className="flex items-center space-x-2 text-slate-400 text-xs font-semibold mb-1.5">
                        <Tag className="w-4 h-4 text-sky-400" />
                        <span>Predicted Category</span>
                      </div>
                      <p className="text-sm font-extrabold text-white">{aiResult.category}</p>
                      <span className="inline-block mt-2 text-[10px] bg-sky-400/20 text-sky-300 font-bold px-2 py-0.5 rounded border border-sky-400/30">
                        SLA Window: {aiResult.slaHours} Hours
                      </span>
                    </div>

                  </div>

                  {/* Grid 2: Core Differentiators (Duplicate Cluster & Predictive SLA) */}
                  <div className="bg-gradient-to-r from-amber-950/40 via-slate-900 to-emerald-950/40 border border-slate-700 p-4 rounded-xl space-y-4">
                    
                    {/* Duplicate Cluster Badge */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 bg-amber-400/20 text-amber-400 rounded-xl border border-amber-400/30">
                          <Layers className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-slate-200">Cross-Citizen Duplicate Detection</span>
                            <span className="bg-amber-400 text-slate-950 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                              Core SIH Differentiator
                            </span>
                          </div>
                          <p className="text-xs text-amber-300 font-semibold mt-0.5">
                            {aiResult.duplicateCount} similar grievances found nearby in same locality!
                          </p>
                          <p className="text-[11px] text-slate-400 mt-0.5">
                            Automatically linked into cluster <code className="text-slate-300 font-mono">{aiResult.linkedClusterId}</code> instead of creating redundant tickets.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Predictive Escalation Score */}
                    <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <AlertTriangle className="w-4 h-4 text-rose-400" />
                        <span className="text-xs font-semibold text-slate-300">Predictive SLA Breach Risk Score:</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-24 bg-slate-800 h-2.5 rounded-full overflow-hidden border border-slate-700">
                          <div 
                            className="bg-gradient-to-r from-emerald-400 via-amber-400 to-rose-500 h-full rounded-full"
                            style={{ width: `${aiResult.slaRiskScore * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-extrabold text-rose-400 font-mono">{(aiResult.slaRiskScore * 100).toFixed(0)}% Risk</span>
                      </div>
                    </div>

                  </div>

                  {/* Plain Language Status Summary */}
                  <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
                      Citizen Plain-Language Summary:
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed italic">
                      "{aiResult.summary}"
                    </p>
                  </div>

                  {/* Submit Button */}
                  <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
                    <button
                      onClick={() => onOpenAuth('citizen')}
                      className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-extrabold text-xs py-3 px-5 rounded-xl shadow-lg transition flex items-center justify-center space-x-2"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Submit Official Grievance with AI Tags</span>
                    </button>
                    
                    <button
                      onClick={() => handleRunAnalysis()}
                      className="w-full sm:w-auto bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold py-3 px-4 rounded-xl border border-slate-700 transition"
                    >
                      Re-run Test
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
