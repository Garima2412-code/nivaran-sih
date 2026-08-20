import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Lock,
  Phone,
  User,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function AuthModal({
  isOpen,
  onClose,
  initialRole = 'citizen',
  initialIsRegister = false,
  onLoginSuccess
}) {
  const [role, setRole] = useState(initialRole);
  const [isRegister, setIsRegister] = useState(initialIsRegister);

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [department, setDepartment] = useState(
    'Municipal Sanitation & Waste'
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // ---------------------------------------------------------
  // RESET WHEN MODAL OPENS / MODE CHANGES
  // ---------------------------------------------------------

  useEffect(() => {
    setRole(initialRole);
    setIsRegister(initialIsRegister);

    setName('');
    setMobile('');
    setEmail('');
    setPassword('');

    setSuccessMsg('');
    setErrorMsg('');
  }, [initialRole, initialIsRegister, isOpen]);

  if (!isOpen) return null;

  // ---------------------------------------------------------
  // VALIDATE INDIAN MOBILE NUMBER
  // ---------------------------------------------------------

  const isValidIndianMobile = (value) => {
    return /^[6-9]\d{9}$/.test(value);
  };

  // ---------------------------------------------------------
  // VALIDATE EMAIL
  // ---------------------------------------------------------

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

  // ---------------------------------------------------------
  // VALIDATE GOVERNMENT EMAIL
  // ---------------------------------------------------------

  const isValidGovernmentEmail = (value) => {
    if (!isValidEmail(value)) {
      return false;
    }

    const domain = value.split('@')[1].toLowerCase();

    return (
      domain.endsWith('.gov.in') ||
      domain.endsWith('.nic.in')
    );
  };

  // ---------------------------------------------------------
  // CITIZEN SUBMIT
  // ---------------------------------------------------------

  const handleCitizenSubmit = () => {
    const cleanMobile = mobile.replace(/\D/g, '');

    if (isRegister && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }

    if (!cleanMobile) {
      setErrorMsg('Please enter your mobile number.');
      return false;
    }

    if (!isValidIndianMobile(cleanMobile)) {
      setErrorMsg(
        'Please enter a valid 10-digit Indian mobile number starting with 6, 7, 8 or 9.'
      );
      return false;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return false;
    }

    if (password.length < 6) {
      setErrorMsg(
        'Password must contain at least 6 characters.'
      );
      return false;
    }

    return true;
  };

  // ---------------------------------------------------------
  // OFFICER SUBMIT
  // ---------------------------------------------------------

  const handleOfficerSubmit = () => {
    if (!email.trim()) {
      setErrorMsg(
        'Please enter your official government email address.'
      );
      return false;
    }

    if (!isValidGovernmentEmail(email.trim())) {
      setErrorMsg(
        'Please enter a valid official government email ending with .gov.in or .nic.in.'
      );
      return false;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return false;
    }

    return true;
  };

  // ---------------------------------------------------------
  // FORM SUBMIT
  // ---------------------------------------------------------

  const handleSubmit = (e) => {
    e.preventDefault();

    setErrorMsg('');
    setSuccessMsg('');

    let isValid = false;

    if (role === 'citizen') {
      isValid = handleCitizenSubmit();
    } else {
      isValid = handleOfficerSubmit();
    }

    if (!isValid) {
      return;
    }

    // -------------------------------------------------------
    // SUCCESS
    // -------------------------------------------------------

    setSuccessMsg(
      role === 'officer'
        ? 'Officer authenticated successfully!'
        : isRegister
        ? 'Citizen account created successfully!'
        : 'Citizen authenticated successfully!'
    );

    setTimeout(() => {
      if (onLoginSuccess) {
        onLoginSuccess({
          role,

          name:
            role === 'citizen'
              ? name.trim() || 'Citizen'
              : 'Officer Rajesh Kumar',

          mobile:
            role === 'citizen'
              ? mobile.replace(/\D/g, '')
              : null,

          email:
            role === 'officer'
              ? email.trim()
              : null,

          department:
            role === 'officer'
              ? department
              : null
        });
      }

      onClose();

      setSuccessMsg('');
      setErrorMsg('');
    }, 700);
  };

  // ---------------------------------------------------------
  // SWITCH TO CITIZEN
  // ---------------------------------------------------------

  const switchToCitizen = () => {
    setRole('citizen');
    setIsRegister(false);

    setName('');
    setMobile('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  // ---------------------------------------------------------
  // SWITCH TO OFFICER
  // ---------------------------------------------------------

  const switchToOfficer = () => {
    setRole('officer');
    setIsRegister(false);

    setName('');
    setMobile('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  // ---------------------------------------------------------
  // RETURN UI
  // ---------------------------------------------------------

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans">

      <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg p-6 text-slate-900 shadow-2xl relative">

        {/* -------------------------------------------------
            CLOSE
        ------------------------------------------------- */}

        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* -------------------------------------------------
            HEADER
        ------------------------------------------------- */}

        <div className="text-center mb-5">

          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-[#0F2E5A] text-amber-300 font-bold mb-2 shadow-sm">

            {role === 'officer' ? (
              <ShieldCheck className="w-5 h-5" />
            ) : isRegister ? (
              <UserPlus className="w-5 h-5" />
            ) : (
              <LogIn className="w-5 h-5" />
            )}

          </div>

          <h3 className="text-lg font-extrabold font-heading text-[#0F2E5A]">

            {role === 'officer'
              ? 'Official Officer Portal'
              : isRegister
              ? 'Citizen Sign Up'
              : 'Citizen Sign In'}

          </h3>

          <p className="text-slate-600 text-xs mt-1">

            {role === 'officer'
              ? 'Ministry of Housing & Urban Affairs Officer Login'
              : isRegister
              ? 'Create your NIVARAN citizen account'
              : 'Access your NIVARAN citizen account'}

          </p>

        </div>

        {/* -------------------------------------------------
            CITIZEN / OFFICER SWITCH
        ------------------------------------------------- */}

        <div className="flex bg-slate-100 p-1 rounded mb-5 border border-slate-300 text-xs font-bold">

          <button
            type="button"
            onClick={switchToCitizen}
            className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1 ${
              role === 'citizen'
                ? 'bg-[#0F2E5A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={switchToOfficer}
            className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1 ${
              role === 'officer'
                ? 'bg-[#0F2E5A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Officer Sign In</span>
          </button>

        </div>

        {/* -------------------------------------------------
            ERROR
        ------------------------------------------------- */}

        {errorMsg && (
          <div
            role="alert"
            className="mb-4 bg-red-50 border border-red-300 text-red-800 p-2.5 rounded text-xs font-semibold"
          >
            {errorMsg}
          </div>
        )}

        {/* -------------------------------------------------
            SUCCESS
        ------------------------------------------------- */}

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded text-xs flex items-center gap-1.5 font-bold">

            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />

            <span>{successMsg}</span>

          </div>
        )}

        {/* -------------------------------------------------
            FORM
        ------------------------------------------------- */}

        <form
          onSubmit={handleSubmit}
          className="space-y-3.5 text-xs"
        >

          {/* =================================================
              CITIZEN
          ================================================= */}

          {role === 'citizen' && (
            <>

              {/* ---------------------------------------------
                  FULL NAME
              --------------------------------------------- */}

              {isRegister && (
                <div>

                  <label className="block text-slate-700 font-bold mb-1">
                    Full Name
                  </label>

                  <div className="relative">

                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                    <input
                      type="text"
                      required
                      autoComplete="name"
                      placeholder="Enter your full name"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        setErrorMsg('');
                      }}
                      className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
                    />

                  </div>

                </div>
              )}

              {/* ---------------------------------------------
                  MOBILE NUMBER
              --------------------------------------------- */}

              <div>

                <label className="block text-slate-700 font-bold mb-1">
                  Mobile Number
                </label>

                <div className="relative">

                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                  <input
                    type="tel"
                    required
                    inputMode="numeric"
                    autoComplete="tel"
                    maxLength={10}
                    placeholder="Enter 10-digit mobile number"
                    value={mobile}
                    onChange={(e) => {
                      const value = e.target.value
                        .replace(/\D/g, '')
                        .slice(0, 10);

                      setMobile(value);
                      setErrorMsg('');
                    }}
                    className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
                  />

                </div>

                <p className="text-[10px] text-slate-500 mt-1">
                  Enter your 10-digit Indian mobile number.
                </p>

              </div>

            </>
          )}

          {/* =================================================
              OFFICER EMAIL
          ================================================= */}

          {role === 'officer' && (
            <div>

              <label className="block text-slate-700 font-bold mb-1">
                Official Government Email ID
              </label>

              <div className="relative">

                <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="officer.name@mohua.gov.in"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setErrorMsg('');
                  }}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
                />

              </div>

              <p className="text-[10px] text-slate-500 mt-1">
                Official .gov.in or .nic.in email required.
              </p>

            </div>
          )}

          {/* =================================================
              OFFICER DEPARTMENT
          ================================================= */}

          {role === 'officer' && (
            <div>

              <label className="block text-slate-700 font-bold mb-1">
                Assigned Ministry Department
              </label>

              <div className="relative">

                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 focus:border-[#0F2E5A] focus:outline-none cursor-pointer"
                >
                  <option value="Municipal Sanitation & Waste">
                    Municipal Sanitation & Waste
                  </option>

                  <option value="Public Works Department (PWD Roads)">
                    Public Works Department (PWD Roads)
                  </option>

                  <option value="Water Supply & Drainage Board">
                    Water Supply & Drainage Board
                  </option>

                  <option value="Municipal Electrical & Lighting">
                    Municipal Electrical & Lighting
                  </option>

                </select>

              </div>

            </div>
          )}

          {/* =================================================
              PASSWORD
          ================================================= */}

          <div>

            <label className="block text-slate-700 font-bold mb-1">
              Password
            </label>

            <div className="relative">

              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

              <input
                type="password"
                required
                minLength={6}
                autoComplete={
                  isRegister
                    ? 'new-password'
                    : 'current-password'
                }
                placeholder="Enter your password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  setErrorMsg('');
                }}
                className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
              />

            </div>

            <p className="text-[10px] text-slate-500 mt-1">
              Minimum 6 characters.
            </p>

          </div>

          {/* =================================================
              SUBMIT BUTTON
          ================================================= */}

          <button
            type="submit"
            className="w-full bg-[#D97706] hover:bg-[#C2410C] text-white font-extrabold py-2.5 rounded shadow-sm transition flex items-center justify-center gap-1.5 text-xs mt-2"
          >

            <span>
              {role === 'citizen'
                ? isRegister
                  ? 'Create Citizen Account'
                  : 'Sign In'
                : 'Sign In to Officer Portal'}
            </span>

            <ArrowRight className="w-4 h-4" />

          </button>

        </form>

        {/* -------------------------------------------------
            CITIZEN SIGN IN / SIGN UP SWITCH
        ------------------------------------------------- */}

        {role === 'citizen' && (
          <div className="mt-4 text-center text-slate-600 text-xs">

            {isRegister ? (
              <p>
                Already have an account?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(false);
                    setName('');
                    setPassword('');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[#0F2E5A] font-bold underline"
                >
                  Sign In
                </button>

              </p>
            ) : (
              <p>
                New to NIVARAN Portal?{' '}

                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setName('');
                    setMobile('');
                    setPassword('');
                    setErrorMsg('');
                    setSuccessMsg('');
                  }}
                  className="text-[#D97706] font-bold underline"
                >
                  Create Account
                </button>

              </p>
            )}

          </div>
        )}

      </div>
    </div>
  );
}