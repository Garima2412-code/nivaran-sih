import React, { useState } from 'react';
import { 
  Globe, 
  UserCheck, 
  Menu, 
  X, 
  PhoneCall, 
  Eye, 
  Building2,
  Search,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function Header({ onOpenAuth, currentLang, setCurrentLang, fontSize, setFontSize, highContrast, setHighContrast, t }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const languages = [
    { code: 'en', label: 'English' },
    { code: 'hi', label: 'हिंदी (Hindi)' },
    { code: 'mr', label: 'मराठी (Marathi)' },
    { code: 'ta', label: 'தமிழ் (Tamil)' },
    { code: 'te', label: 'తెలుగు (Telugu)' }
  ];

  return (
    <header className="w-full sticky top-0 z-50 bg-white shadow-sm font-sans border-b border-slate-200">
      
      {/* Top Tricolor Strip */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]"></div>

      {/* 1. Official Government Top Utility Bar */}
      <div className="bg-slate-100 text-slate-700 text-xs py-1.5 px-4 sm:px-8 border-b border-slate-200 flex flex-wrap justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 border-r border-slate-300 pr-4">
            <span className="inline-block w-4 h-3 bg-gradient-to-b from-[#FF9933] via-white to-[#138808] border border-slate-300"></span>
            <span className="font-semibold text-slate-800">{t.govIndia}</span>
          </div>
          <div className="hidden md:flex items-center space-x-2 text-slate-600">
            <Building2 className="w-3.5 h-3.5 text-[#D97706]" />
            <span>{t.mohuaName}</span>
          </div>
        </div>

        {/* Accessibility & Utilities */}
        <div className="flex items-center space-x-4">
          {/* Toll Free Helpline */}
          <div className="hidden lg:flex items-center space-x-1 text-slate-700 font-medium">
            <PhoneCall className="w-3 h-3 text-[#D97706]" />
            <span>{t.tollFree}</span>
          </div>

          {/* Font Controls (A-, A, A+) */}
          <div className="flex items-center space-x-1 bg-white px-2 py-0.5 rounded border border-slate-300 text-[11px]">
            <button 
              onClick={() => setFontSize('sm')} 
              className={`px-1.5 py-0.5 rounded font-black transition ${fontSize === 'sm' ? 'bg-[#D97706] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Small Text Size (A-)"
            >
              A-
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => setFontSize('base')} 
              className={`px-1.5 py-0.5 rounded font-black transition ${fontSize === 'base' ? 'bg-[#D97706] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Normal Text Size (A)"
            >
              A
            </button>
            <span className="text-slate-300">|</span>
            <button 
              onClick={() => setFontSize('lg')} 
              className={`px-1.5 py-0.5 rounded font-black transition ${fontSize === 'lg' ? 'bg-[#D97706] text-white' : 'text-slate-700 hover:bg-slate-100'}`}
              title="Large Text Size (A+)"
            >
              A+
            </button>
          </div>

          {/* High Contrast */}
          <button 
            onClick={() => setHighContrast(!highContrast)} 
            className={`hidden sm:flex items-center space-x-1 text-[11px] px-2 py-0.5 rounded border transition ${highContrast ? 'bg-amber-400 text-slate-950 font-bold border-amber-500' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
          >
            <Eye className="w-3 h-3 text-slate-500" />
            <span>{t.screenReader}</span>
          </button>

          {/* Language Switcher */}
          <div className="flex items-center space-x-1 bg-white px-2.5 py-0.5 rounded border border-slate-300 text-xs font-semibold">
            <Globe className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <select 
              value={currentLang} 
              onChange={(e) => setCurrentLang(e.target.value)}
              className="bg-transparent text-slate-800 text-xs font-bold focus:outline-none cursor-pointer py-0.5"
            >
              {languages.map((l) => (
                <option key={l.code} value={l.code}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* 2. Main Brand Header with Emblem */}
      <div className="px-4 sm:px-8 py-3.5 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          
          {/* Official Emblem & Portal Title */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded bg-[#0F2E5A] text-amber-300 flex items-center justify-center font-serif font-black text-xl border-2 border-amber-400 shadow-xs shrink-0">
                🇮🇳
              </div>
              <div>
                <h1 className="font-heading font-black text-2xl tracking-tight text-[#0F2E5A] leading-tight">
                  {t.portalTitle}
                </h1>
                <p className="text-[11px] font-semibold text-slate-600">
                  {t.portalSubtitle}
                </p>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="hidden sm:flex items-center space-x-3">
            <button 
              onClick={() => onOpenAuth('officer', false)}
              className="flex items-center space-x-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 px-3.5 py-2 rounded border border-slate-300 transition"
            >
              <UserCheck className="w-3.5 h-3.5 text-[#0F2E5A]" />
              <span>{t.officerPortal}</span>
            </button>

            <button 
              onClick={() => onOpenAuth('citizen', false)}
              className="flex items-center space-x-1.5 text-xs font-bold text-[#0F2E5A] bg-white hover:bg-slate-50 px-4 py-2 rounded border border-[#0F2E5A] transition"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>{t.logIn}</span>
            </button>

            <button 
              onClick={() => onOpenAuth('citizen', true)}
              className="flex items-center space-x-1.5 text-xs font-bold text-white bg-[#D97706] hover:bg-[#C2410C] px-4 py-2 rounded shadow-xs transition"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>{t.signUp}</span>
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded bg-slate-100 text-slate-700 hover:bg-slate-200"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>

        </div>
      </div>

      {/* 3. Navigation Bar */}
      <nav className="bg-[#0F2E5A] text-white text-xs font-bold px-4 sm:px-8 py-0 hidden lg:block">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-1 uppercase tracking-wide">
            <a href="#about" className="px-4 py-3 bg-[#D97706] text-white hover:bg-[#C2410C] transition inline-block">
              {t.navHome}
            </a>
            <a href="#about" className="px-4 py-3 hover:bg-white/10 transition inline-block">
              {t.navAbout}
            </a>
            <a href="#features" className="px-4 py-3 hover:bg-white/10 transition inline-block">
              {t.navPillars}
            </a>
            <a href="#journey" className="px-4 py-3 hover:bg-white/10 transition inline-block">
              {t.navWorkflow}
            </a>
            <a href="#departments" className="px-4 py-3 hover:bg-white/10 transition inline-block">
              {t.navDepts}
            </a>
            <a href="#about" className="px-4 py-3 hover:bg-white/10 transition inline-block">
              {t.navLinks}
            </a>
          </div>

          <div className="flex items-center space-x-2 text-white/80 font-normal pr-2">
            <Search className="w-3.5 h-3.5 text-amber-300" />
            <input 
              type="text" 
              placeholder={t.searchPlaceholder}
              className="bg-white/10 border border-white/20 rounded text-xs px-2.5 py-1 text-white placeholder-white/60 focus:outline-none w-36"
            />
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#0F2E5A] text-white px-6 py-4 border-t border-slate-700 shadow-xl">
          <div className="flex flex-col space-y-3 font-semibold text-xs uppercase tracking-wide">
            <a href="#about" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-300 py-1">{t.navAbout}</a>
            <a href="#features" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-300 py-1">{t.navPillars}</a>
            <a href="#journey" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-300 py-1">{t.navWorkflow}</a>
            <a href="#departments" onClick={() => setMobileMenuOpen(false)} className="hover:text-amber-300 py-1">{t.navDepts}</a>

            <div className="pt-3 border-t border-slate-700 flex flex-col space-y-2">
              <button 
                onClick={() => { setMobileMenuOpen(false); onOpenAuth('officer', false); }}
                className="w-full text-center py-2 bg-slate-800 rounded text-xs font-bold text-slate-200 border border-slate-700"
              >
                {t.officerPortal}
              </button>
              <div className="flex gap-2">
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('citizen', false); }}
                  className="flex-1 text-center py-2 bg-white text-[#0F2E5A] font-bold rounded text-xs"
                >
                  {t.logIn}
                </button>
                <button 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('citizen', true); }}
                  className="flex-1 text-center py-2 bg-[#D97706] text-white font-bold rounded text-xs"
                >
                  {t.signUp}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </header>
  );
}
