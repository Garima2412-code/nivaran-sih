import React from 'react';
import { 
  ArrowRight, 
  Building2, 
  ShieldCheck, 
  Globe2, 
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Hero({ onOpenAuth, t }) {
  return (
    <div className="relative font-sans">
      
      {/* 1. Terracotta / Saffron Hero Banner */}
      <section className="bg-gradient-to-r from-[#D97706] via-[#EA580C] to-[#C2410C] text-white pt-10 pb-20 px-4 sm:px-8 relative overflow-hidden">
        
        <div className="absolute inset-0 z-0 opacity-10 mix-blend-overlay pointer-events-none">
          <img 
            src="/assets/india_gate.jpg" 
            alt="Monument Texture" 
            className="w-full h-full object-cover object-center"
          />
        </div>

        {/* Decorative Wave/Splay Divider */}
        <div className="absolute -bottom-1 left-0 right-0 h-10 bg-slate-50 z-10">
          <svg className="w-full h-full text-slate-50" viewBox="0 0 1440 40" fill="none" preserveAspectRatio="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 16C240 32 480 40 720 24C960 8 1200 0 1440 16V40H0V16Z" fill="currentColor"/>
          </svg>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center pb-6">
            
            {/* Left Column */}
            <div className="lg:col-span-7 space-y-5 text-center sm:text-left">
              
              <div className="inline-flex items-center space-x-2 bg-black/20 border border-white/20 px-3.5 py-1 rounded text-xs font-semibold text-amber-100">
                <Building2 className="w-4 h-4 text-amber-200" />
                <span>{t.heroMinistryBadge}</span>
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold font-heading text-white tracking-tight leading-tight">
                {t.heroTitle}
              </h2>

              <div className="bg-black/15 p-4 sm:p-5 rounded-lg border border-white/20 text-xs sm:text-sm leading-relaxed text-slate-100 space-y-2">
                <p>{t.heroDesc1}</p>
                <p>{t.heroDesc2}</p>
              </div>

              {/* Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-3">
                
                <button
                  onClick={() => onOpenAuth('citizen', true)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-white text-[#C2410C] hover:bg-slate-100 font-extrabold text-xs px-6 py-3 rounded shadow-md transition"
                >
                  <UserPlus className="w-4 h-4 text-[#EA580C]" />
                  <span>{t.heroBtnSignUp}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => onOpenAuth('citizen', false)}
                  className="w-full sm:w-auto flex items-center justify-center space-x-2 bg-[#0F2E5A] hover:bg-[#0A192F] text-white font-extrabold text-xs px-6 py-3 rounded border border-white/30 shadow-md transition"
                >
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>{t.heroBtnLogIn}</span>
                </button>

                <button
                  onClick={() => onOpenAuth('officer', false)}
                  className="text-xs text-amber-200 hover:text-white font-bold underline py-2 sm:py-0"
                >
                  {t.heroOfficerSignIn}
                </button>

              </div>

              {/* Attributes */}
              <div className="pt-2 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs text-slate-200 font-medium">
                <span className="flex items-center space-x-1">
                  <Globe2 className="w-3.5 h-3.5 text-emerald-300" />
                  <span>{t.heroLangBadge}</span>
                </span>
                <span>•</span>
                <span className="flex items-center space-x-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                  <span>{t.heroPrivacyBadge}</span>
                </span>
              </div>

            </div>

            {/* Right Column */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white p-2 rounded-xl shadow-xl border border-white/40">
                <div className="relative rounded-lg overflow-hidden h-72 sm:h-80 bg-slate-100 border border-slate-200">
                  <img 
                    src="/assets/citizens.jpg" 
                    alt="Ministry Governance Framework" 
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/40 to-transparent p-4 text-white text-xs">
                    <p className="font-bold text-amber-300">{t.heroBannerTitle}</p>
                    <p className="text-[11px] text-slate-200 mt-0.5">{t.heroBannerSubtitle}</p>
                  </div>
                </div>
              </div>
            </div>

          </div>

        </div>

      </section>

      {/* 2. Banner Strip */}
      <section className="bg-amber-50/90 border-b border-amber-200 py-3.5 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-slate-800 text-xs">
          
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded bg-[#138808] text-white flex items-center justify-center font-bold text-[10px] shrink-0">
              MoHUA
            </div>
            <div>
              <span className="font-extrabold text-[#0F2E5A] uppercase">{t.heroBannerTitle}</span>
              <p className="text-slate-600 text-[11px]">{t.heroBannerSubtitle}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3 font-bold">
            <button 
              onClick={() => onOpenAuth('citizen', false)}
              className="bg-white hover:bg-slate-100 text-[#0F2E5A] px-3.5 py-1.5 rounded border border-slate-300 shadow-xs"
            >
              {t.logIn}
            </button>
            <button 
              onClick={() => onOpenAuth('citizen', true)}
              className="bg-[#D97706] hover:bg-[#C2410C] text-white px-3.5 py-1.5 rounded shadow-xs"
            >
              {t.signUp}
            </button>
          </div>

        </div>
      </section>

      {/* 3. Statistics */}
      <section className="bg-white py-8 border-b border-slate-200 text-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6">
          
          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] font-mono">98.4%</p>
            <p className="text-xs text-slate-600 font-medium mt-1">{t.statAccuracy}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#D97706] font-mono">45,820+</p>
            <p className="text-xs text-slate-600 font-medium mt-1">{t.statResolved}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-700 font-mono">&lt; 18 Hrs</p>
            <p className="text-xs text-slate-600 font-medium mt-1">{t.statSlaTime}</p>
          </div>

          <div className="bg-slate-50 border border-slate-200 p-4 rounded text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-[#0F2E5A] font-mono">14+</p>
            <p className="text-xs text-slate-600 font-medium mt-1">{t.statDepts}</p>
          </div>

        </div>
      </section>

    </div>
  );
}
