import React from 'react';
import { 
  Building2, 
  ArrowRight, 
  Layers, 
  ShieldCheck, 
  Clock, 
  ChevronRight, 
  LogIn,
  Info
} from 'lucide-react';

export default function AboutPlatform({ onOpenAuth, t }) {
  const pillarCards = [
    {
      title: "Multilingual Voice & NLP Intake",
      desc: "Citizens submit grievances naturally in English or regional Indian languages. Natural Language Processing extracts details seamlessly.",
      badge: "Language Inclusion"
    },
    {
      title: "Cross-Citizen Issue Clustering",
      desc: "When multiple citizens report the same local pothole or garbage dump, the platform unifies them into 1 priority ticket.",
      badge: "Duplicate Engine"
    },
    {
      title: "Automated SLA Escalation",
      desc: "Predictive algorithms monitor department workload to flag grievances nearing SLA breach before deadlines pass.",
      badge: "SLA Enforcement"
    },
    {
      title: "Plain-Language Status Tracking",
      desc: "Translates internal administrative status codes into clear, human-understandable updates for citizens.",
      badge: "Transparency"
    }
  ];

  const newsItems = [
    {
      date: "20 August 2026",
      title: "MoHUA Extends NIVARAN Platform to 45 Municipal Corporations",
      desc: "Full automated grievance routing expanded across major municipal authorities in India."
    },
    {
      date: "12 August 2026",
      title: "SIH 2026 Benchmark Performance",
      desc: "Achieved 98.4% automated department allocation accuracy using zero-shot NLP models."
    },
    {
      date: "01 August 2026",
      title: "DPDP Act 2023 Security Audit Completed",
      desc: "Full compliance verified for citizen personal data encryption and privacy protections."
    }
  ];

  const officialLogos = [
    { name: "Government of India", label: "india.gov.in" },
    { name: "MoHUA", label: "Ministry of Housing" },
    { name: "Digital India", label: "Digital Governance" },
    { name: "CPGRAMS", label: "Grievance Portal" },
    { name: "Incredible India", label: "National Portal" }
  ];

  return (
    <div id="about" className="bg-slate-50 text-slate-900 font-sans border-b border-slate-200">
      
      {/* 1. ABOUT PLATFORM SECTION */}
      <section className="py-14 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          {/* Section Heading */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">
              {t.aboutBadge}
            </span>
            <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E5A] uppercase mt-1">
              {t.aboutHeading}
            </h3>
            <p className="text-slate-600 text-xs sm:text-sm mt-2">
              {t.aboutSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Sidebar Menu */}
            <div className="lg:col-span-4 bg-slate-50 border border-slate-300 rounded-lg p-5">
              <h4 className="text-xs font-extrabold text-[#0F2E5A] uppercase tracking-wider border-b border-slate-300 pb-2 mb-3">
                {t.aboutSidebarTitle}
              </h4>

              <ul className="space-y-2 text-xs font-medium text-slate-700">
                <li>
                  <a href="#about" className="flex items-center justify-between p-2 rounded bg-white border border-slate-200 text-[#D97706] font-bold">
                    <span className="flex items-center space-x-2">
                      <Info className="w-3.5 h-3.5 text-[#D97706]" />
                      <span>{t.aboutSidebarItem1}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </a>
                </li>
                <li>
                  <a href="#departments" className="flex items-center justify-between p-2 rounded hover:bg-white hover:border hover:border-slate-200 hover:text-[#0F2E5A] transition">
                    <span className="flex items-center space-x-2">
                      <Building2 className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.aboutSidebarItem2}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="#journey" className="flex items-center justify-between p-2 rounded hover:bg-white hover:border hover:border-slate-200 hover:text-[#0F2E5A] transition">
                    <span className="flex items-center space-x-2">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.aboutSidebarItem3}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="#features" className="flex items-center justify-between p-2 rounded hover:bg-white hover:border hover:border-slate-200 hover:text-[#0F2E5A] transition">
                    <span className="flex items-center space-x-2">
                      <Layers className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.aboutSidebarItem4}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
                <li>
                  <a href="#features" className="flex items-center justify-between p-2 rounded hover:bg-white hover:border hover:border-slate-200 hover:text-[#0F2E5A] transition">
                    <span className="flex items-center space-x-2">
                      <ShieldCheck className="w-3.5 h-3.5 text-slate-500" />
                      <span>{t.aboutSidebarItem5}</span>
                    </span>
                    <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </li>
              </ul>
            </div>

            {/* Right Main Highlight Card */}
            <div className="lg:col-span-8 bg-amber-50/40 border border-amber-200 rounded-lg p-6">
              <div className="space-y-3">
                <span className="inline-block px-2.5 py-0.5 bg-[#D97706] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                  {t.aboutCardBadge}
                </span>

                <h4 className="text-xl font-bold font-heading text-[#0F2E5A]">
                  {t.aboutCardTitle}
                </h4>

                <p className="text-slate-700 text-xs sm:text-sm leading-relaxed">
                  {t.aboutCardDesc}
                </p>

                <div className="pt-3 flex flex-wrap items-center gap-3">
                  <button 
                    onClick={() => onOpenAuth('citizen', true)}
                    className="bg-[#D97706] hover:bg-[#C2410C] text-white font-extrabold text-xs px-5 py-2.5 rounded shadow-xs transition flex items-center space-x-1.5"
                  >
                    <span>{t.signUp}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button 
                    onClick={() => onOpenAuth('citizen', false)}
                    className="bg-white hover:bg-slate-100 text-[#0F2E5A] font-bold text-xs px-4 py-2.5 rounded border border-slate-300 shadow-xs transition"
                  >
                    {t.logIn}
                  </button>
                </div>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 2. PROGRAM / KEY PILLARS GRID */}
      <section className="py-14 px-4 sm:px-8 bg-slate-100 border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h3 className="text-xl sm:text-2xl font-extrabold font-heading text-[#0F2E5A] uppercase tracking-tight">
              {t.pillarsHeading}
            </h3>
            <p className="text-slate-600 text-xs mt-1">
              {t.pillarsSubheading}
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {pillarCards.map((card, idx) => (
              <div 
                key={idx}
                className="bg-white border border-slate-300 rounded-lg p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="w-8 h-8 rounded bg-amber-100 text-[#D97706] flex items-center justify-center mb-3 font-bold text-xs">
                    {idx + 1}
                  </div>
                  
                  <span className="inline-block px-2 py-0.5 bg-slate-100 text-slate-700 font-semibold text-[10px] rounded mb-2 border border-slate-200">
                    {card.badge}
                  </span>

                  <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2E5A] mb-1.5 font-heading">
                    {card.title}
                  </h4>

                  <p className="text-slate-600 text-xs leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100">
                  <button 
                    onClick={() => onOpenAuth('citizen', true)}
                    className="text-[11px] font-bold text-[#D97706] hover:underline flex items-center space-x-1"
                  >
                    <span>Read More</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* 3. UPDATES & NOTICES */}
      <section className="py-14 px-4 sm:px-8 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Box 1: What's New */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-5">
              <h4 className="text-xs font-extrabold text-[#0F2E5A] uppercase tracking-wider border-b border-slate-300 pb-2 mb-3">
                {t.whatsNew}
              </h4>

              <div className="space-y-3 text-xs">
                {newsItems.map((item, idx) => (
                  <div key={idx} className="border-b border-slate-200 last:border-0 pb-2.5 last:pb-0">
                    <span className="text-[10px] font-bold text-[#D97706]">{item.date}</span>
                    <h5 className="font-bold text-slate-800 mt-0.5">{item.title}</h5>
                    <p className="text-slate-600 text-[11px] mt-0.5">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Box 2: Official Circulars */}
            <div className="bg-slate-50 border border-slate-300 rounded-lg p-5">
              <h4 className="text-xs font-extrabold text-[#0F2E5A] uppercase tracking-wider border-b border-slate-300 pb-2 mb-3">
                {t.guidelines}
              </h4>

              <div className="space-y-3 text-xs">
                <div className="bg-white border border-slate-200 p-3 rounded shadow-2xs">
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">SLA Circular</span>
                  <h5 className="font-bold text-slate-800 mt-1">24-Hour Urgent Response Protocol</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">Mandatory SLA initial response timeline for municipal water and sanitation grievances.</p>
                </div>

                <div className="bg-white border border-slate-200 p-3 rounded shadow-2xs">
                  <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">Security Notice</span>
                  <h5 className="font-bold text-slate-800 mt-1">Citizen Data Protection</h5>
                  <p className="text-slate-600 text-[11px] mt-0.5">All grievance records are encrypted under DPDP 2023 regulations.</p>
                </div>
              </div>
            </div>

            {/* Box 3: Portal Access & Sign Up */}
            <div className="bg-[#0F2E5A] text-white rounded-lg p-5 flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 bg-white/10 px-2 py-0.5 rounded">
                  {t.portalAccess}
                </span>

                <h4 className="text-base font-bold font-heading text-white mt-3">
                  NIVARAN Citizen Account
                </h4>

                <p className="text-slate-300 text-xs mt-2 leading-relaxed">
                  Log in to track existing submissions or register a new citizen account.
                </p>
              </div>

              <div className="mt-5 space-y-2">
                <button
                  onClick={() => onOpenAuth('citizen', false)}
                  className="w-full py-2 bg-[#D97706] hover:bg-[#C2410C] text-white font-extrabold text-xs rounded transition flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span>{t.logIn}</span>
                </button>

                <button
                  onClick={() => onOpenAuth('citizen', true)}
                  className="w-full py-2 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded border border-white/20 transition text-center"
                >
                  {t.signUp}
                </button>
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* 4. GOVERNMENT LOGOS SLIDER */}
      <section className="py-8 px-4 sm:px-8 bg-slate-100">
        <div className="max-w-7xl mx-auto">
          <p className="text-center text-[11px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">
            Official Ministry Initiatives
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {officialLogos.map((logo, idx) => (
              <div 
                key={idx}
                className="flex items-center space-x-2 bg-white px-3.5 py-1.5 rounded border border-slate-300 shadow-2xs"
              >
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold">
                  🇮🇳
                </div>
                <div>
                  <p className="text-xs font-bold text-slate-800 leading-none">{logo.name}</p>
                  <p className="text-[10px] text-slate-500 mt-0.5">{logo.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

    </div>
  );
}
