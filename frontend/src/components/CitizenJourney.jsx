import React from 'react';
import { 
  MessageSquare, 
  Cpu, 
  Building2, 
  Layers, 
  CheckCircle2, 
  Search 
} from 'lucide-react';

export default function CitizenJourney() {
  const steps = [
    {
      num: "01",
      title: "Grievance Intake",
      desc: "Citizen submits grievance in plain English or regional Indian language via text or voice.",
      icon: MessageSquare
    },
    {
      num: "02",
      title: "Automated Parameter Indexing",
      desc: "System identifies category, location details, and urgency level automatically.",
      icon: Cpu
    },
    {
      num: "03",
      title: "Municipal Dispatch",
      desc: "Routes grievance directly to the assigned municipal department and officer under MoHUA rules.",
      icon: Building2
    },
    {
      num: "04",
      title: "Duplicate Issue Linking",
      desc: "Cross-references locality reports to cluster duplicate grievances into a unified ticket.",
      icon: Layers
    },
    {
      num: "05",
      title: "Grievance ID Generation",
      desc: "Generates structured summary and unique Grievance Reference ID (e.g. GRV-2026-88192).",
      icon: CheckCircle2
    },
    {
      num: "06",
      title: "Status Resolution Tracking",
      desc: "Citizen tracks progress with plain-language updates until resolution and SLA signoff.",
      icon: Search
    }
  ];

  return (
    <section id="journey" className="py-14 bg-white text-slate-900 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">
            Operational Workflow
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E5A] uppercase mt-1">
            CITIZEN GOVERNANCE FRAMEWORK
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Structured 6-step lifecycle from submission to verified resolution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div 
                key={idx}
                className="bg-slate-50 border border-slate-300 p-5 rounded-lg relative hover:border-[#0F2E5A] hover:bg-white transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <span className="text-lg font-black font-mono text-[#D97706]">{s.num}</span>
                  <div className="p-2 bg-white text-[#0F2E5A] rounded border border-slate-300">
                    <Icon className="w-4 h-4" />
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2E5A] mb-1.5 font-heading">{s.title}</h4>
                <p className="text-slate-600 text-xs leading-relaxed">{s.desc}</p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
