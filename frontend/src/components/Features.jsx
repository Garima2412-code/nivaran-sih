import React from 'react';
import { 
  Layers, 
  AlertTriangle, 
  MessageSquare, 
  ShieldCheck, 
  Globe2, 
  CheckCircle2, 
  XCircle,
  Building2,
  Bot
} from 'lucide-react';

export default function Features() {
  const differentiators = [
    {
      icon: MessageSquare,
      title: "Multilingual Voice & Text Intake",
      description: "Citizens describe civic issues naturally through text or speech in regional Indian languages. Eliminates manual bureaucratic category drop-downs.",
      badge: "Citizen Centric",
      iconBg: "bg-amber-100 text-[#D97706]"
    },
    {
      icon: Layers,
      title: "Cross-Citizen Issue Clustering",
      description: "When multiple citizens independently report the same local pothole or garbage dump, the platform unifies them into 1 priority ticket.",
      badge: "Duplicate Engine",
      iconBg: "bg-[#0F2E5A] text-amber-300"
    },
    {
      icon: AlertTriangle,
      title: "Predictive SLA Risk Escalation",
      description: "Algorithms evaluate department workload and category urgency to flag grievances at risk of SLA breach before deadlines pass.",
      badge: "Proactive Governance",
      iconBg: "bg-rose-100 text-rose-700"
    },
    {
      icon: Bot,
      title: "Plain-Language Status Tracking",
      description: "Translates obscure internal administrative status codes into simple, human-understandable progress updates.",
      badge: "Transparency",
      iconBg: "bg-sky-100 text-sky-700"
    },
    {
      icon: ShieldCheck,
      title: "Graceful Fallback Mechanism",
      description: "Ensures 99.9% portal reliability. If automated routing API experiences latency, manual municipal department selection is seamlessly presented.",
      badge: "Reliability",
      iconBg: "bg-purple-100 text-purple-700"
    },
    {
      icon: Globe2,
      title: "Regional Multilingual Inclusion",
      description: "Full support for 22 regional Indian languages (Hindi, Marathi, Tamil, Telugu, English) with screen reader accessibility.",
      badge: "Inclusive Digital India",
      iconBg: "bg-emerald-100 text-emerald-800"
    }
  ];

  const comparisonRows = [
    {
      feature: "Grievance Submission",
      traditional: "Manual department/category dropdown selection",
      nivaran: "Natural language text & voice in 22 Indian languages"
    },
    {
      feature: "Duplicate Complaint Reports",
      traditional: "Generates separate isolated tickets for same issue",
      nivaran: "Links multiple reports into 1 unified priority cluster ticket"
    },
    {
      feature: "SLA Tracking & Risk Alert",
      traditional: "Flags grievances only after SLA breach occurs",
      nivaran: "Predictive SLA risk scoring before deadline breach"
    },
    {
      feature: "Citizen Progress Updates",
      traditional: "Obscure administrative codes ('File sent to Sec-IV')",
      nivaran: "Plain-language summary updates for citizens"
    },
    {
      feature: "Municipal Integration",
      traditional: "Monolithic, complete replacement required",
      nivaran: "Overlay intelligence layer on existing CPGRAMS / MoHUA systems"
    }
  ];

  return (
    <section id="features" className="py-14 bg-slate-50 text-slate-900 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">
            Architectural Framework
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E5A] uppercase mt-1">
            KEY PLATFORM PILLARS & COMPARISON
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Designed for MoHUA civic challenges — shifting from passive ticket filing to proactive, intelligent grievance resolution.
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {differentiators.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-300 rounded-lg p-6 shadow-2xs hover:shadow-md transition"
              >
                <div className={`w-10 h-10 rounded ${feat.iconBg} flex items-center justify-center mb-4 font-bold shadow-2xs`}>
                  <Icon className="w-5 h-5" />
                </div>

                <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-bold text-[10px] rounded mb-2 border border-slate-200">
                  {feat.badge}
                </span>

                <h4 className="text-sm sm:text-base font-extrabold text-[#0F2E5A] mb-1.5 font-heading">
                  {feat.title}
                </h4>

                <p className="text-slate-600 text-xs leading-relaxed">
                  {feat.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* CPGRAMS vs Nivaran Platform Comparison Table (Clean Formal Table) */}
        <div className="mt-14 bg-white border border-slate-300 rounded-lg p-6 sm:p-8 shadow-xs">
          
          <div className="mb-6 border-b border-slate-200 pb-4">
            <h4 className="text-lg sm:text-xl font-extrabold font-heading text-[#0F2E5A]">
              Platform Comparison: Legacy Systems vs. NIVARAN Portal
            </h4>
            <p className="text-slate-600 text-xs mt-1">
              Comparative analysis demonstrating efficiency gains in municipal grievance processing.
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-slate-300 bg-slate-100 text-slate-700">
                  <th className="py-3 px-4 font-extrabold uppercase tracking-wider">Feature Dimension</th>
                  <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-slate-600">Legacy / CPGRAMS Systems</th>
                  <th className="py-3 px-4 font-extrabold uppercase tracking-wider text-[#0F2E5A]">NIVARAN Portal Framework</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {comparisonRows.map((row, index) => (
                  <tr key={index} className="hover:bg-slate-50 transition">
                    <td className="py-3.5 px-4 font-bold text-slate-900">{row.feature}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      <div className="flex items-center space-x-1.5">
                        <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                        <span>{row.traditional}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#0F2E5A]">
                      <div className="flex items-center space-x-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span>{row.nivaran}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

        </div>

      </div>
    </section>
  );
}
