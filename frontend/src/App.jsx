import React, { useState } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import AboutPlatform from './components/AboutPlatform';
import Features from './components/Features';
import CitizenJourney from './components/CitizenJourney';
import Departments from './components/Departments';
import AuthModal from './components/AuthModal';
import Footer from './components/Footer';
import { translations } from './utils/translations';

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState('citizen');
  const [authIsRegister, setAuthIsRegister] = useState(false);
  const [currentLang, setCurrentLang] = useState('en');
  const [fontSize, setFontSize] = useState('base'); // 'sm', 'base', 'lg'
  const [highContrast, setHighContrast] = useState(false);
  const [user, setUser] = useState(null);

  // Active translation dictionary
  const t = translations[currentLang] || translations.en;

  const handleOpenAuth = (role = 'citizen', isRegister = false) => {
    setAuthRole(role);
    setAuthIsRegister(isRegister);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser(userData);
  };

  const handleSignOut = () => {
    setUser(null);
  };

  // Dynamic root font scale style
  const fontStyle = {
    fontSize: fontSize === 'sm' ? '13px' : fontSize === 'lg' ? '18px' : '15px'
  };

  return (
    <div 
      style={fontStyle}
      className={`min-full flex flex-col min-h-screen transition-all ${highContrast ? 'bg-black text-amber-300' : 'bg-slate-50 text-slate-900'}`}
    >
      
      {/* Top Banner when user is logged in */}
      {user && (
        <div className="bg-[#0F2E5A] text-white px-4 py-2 text-xs flex justify-between items-center shadow-md border-b border-amber-400">
          <div className="flex items-center space-x-2 font-semibold">
            <span className="w-2 h-2 bg-emerald-400 rounded-full animate-ping"></span>
            <span>Welcome, <strong>{user.name}</strong> ({user.role === 'officer' ? `Officer - ${user.department}` : 'Registered Citizen'})</span>
          </div>
          <button 
            onClick={handleSignOut}
            className="bg-slate-900 hover:bg-slate-950 px-3 py-1 rounded text-amber-300 font-bold border border-slate-700 transition"
          >
            Sign Out
          </button>
        </div>
      )}

      {/* Main Header Component */}
      <Header 
        onOpenAuth={handleOpenAuth} 
        currentLang={currentLang} 
        setCurrentLang={setCurrentLang}
        fontSize={fontSize}
        setFontSize={setFontSize}
        highContrast={highContrast}
        setHighContrast={setHighContrast}
        t={t}
      />

      {/* Landing Page Content */}
      <main className="flex-1">
        
        {/* 1. Hero Section */}
        <Hero 
          onOpenAuth={handleOpenAuth} 
          t={t}
        />

        {/* 2. About Platform Section */}
        <AboutPlatform 
          onOpenAuth={handleOpenAuth}
          t={t}
        />

        {/* 3. Core Differentiators & Comparison Table */}
        <Features 
          t={t}
        />

        {/* 4. Citizen Journey Workflow */}
        <CitizenJourney 
          t={t}
        />

        {/* 5. Supported Departments Knowledge Directory */}
        <Departments 
          t={t}
        />

      </main>

      {/* Footer */}
      <Footer 
        t={t}
      />

      {/* Auth Modal for Login & Registration */}
      <AuthModal 
        isOpen={authModalOpen} 
        onClose={() => setAuthModalOpen(false)} 
        initialRole={authRole}
        initialIsRegister={authIsRegister}
        onLoginSuccess={handleLoginSuccess}
        t={t}
      />

    </div>
  );
}
