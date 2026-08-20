import React, { useEffect, useState } from "react";

import Header from "./components/Header";
import Hero from "./components/Hero";
import AboutPlatform from "./components/AboutPlatform";
import Features from "./components/Features";
import CitizenJourney from "./components/CitizenJourney";
import Departments from "./components/Departments";
import AuthModal from "./components/AuthModal";
import Footer from "./components/Footer";
import CitizenDashboard from "./components/CitizenDashboard";

import { translations } from "./utils/translations";
import {
  getAuthenticatedUser,
  logout,
} from "./services/api";

export default function App() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authRole, setAuthRole] = useState("citizen");
  const [authIsRegister, setAuthIsRegister] = useState(false);

  const [currentLang, setCurrentLang] = useState("en");
  const [fontSize, setFontSize] = useState("base");
  const [highContrast, setHighContrast] = useState(false);

  const [user, setUser] = useState(null);

  const t =
    translations[currentLang] || translations.en;

  /*
   * Restore the authenticated user when the application
   * starts or the browser is refreshed.
   */
  useEffect(() => {
    const storedUser = getAuthenticatedUser();

    if (storedUser) {
      setUser(storedUser);
    }
  }, []);

  const handleOpenAuth = (
    role = "citizen",
    isRegister = false
  ) => {
    setAuthRole(role);
    setAuthIsRegister(isRegister);
    setAuthModalOpen(true);
  };

  const handleLoginSuccess = (userData) => {
    setUser({
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      role: userData.role,
      department: userData.department || null,
    });

    setAuthModalOpen(false);
  };

  const handleSignOut = () => {
    logout();
    setUser(null);
  };

  const fontStyle = {
    fontSize:
      fontSize === "sm"
        ? "13px"
        : fontSize === "lg"
        ? "18px"
        : "15px",
  };

  /*
   * Authenticated citizen:
   * show the actual working dashboard instead
   * of the public landing page.
   */
  if (user) {
    return (
      <div
        style={fontStyle}
        className={`min-h-screen ${
          highContrast
            ? "bg-black text-amber-300"
            : "bg-slate-50 text-slate-900"
        }`}
      >
        <CitizenDashboard
          user={user}
          onSignOut={handleSignOut}
        />
      </div>
    );
  }

  /*
   * Logged-out public landing page.
   */
  return (
    <div
      style={fontStyle}
      className={`min-h-screen flex flex-col transition-all ${
        highContrast
          ? "bg-black text-amber-300"
          : "bg-slate-50 text-slate-900"
      }`}
    >
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

      <main className="flex-1">
        <Hero
          onOpenAuth={handleOpenAuth}
          t={t}
        />

        <AboutPlatform
          onOpenAuth={handleOpenAuth}
          t={t}
        />

        <Features t={t} />

        <CitizenJourney t={t} />

        <Departments t={t} />
      </main>

      <Footer t={t} />

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