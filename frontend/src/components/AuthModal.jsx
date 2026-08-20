import React, { useEffect, useState } from 'react';
import {
  X,
  ShieldCheck,
  Building2,
  Mail,
  User,
  Lock,
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus,
  Loader2,
} from 'lucide-react';

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

export default function AuthModal({
  isOpen,
  onClose,
  initialRole = 'citizen',
  initialIsRegister = false,
  onLoginSuccess,
}) {
  const [role, setRole] = useState(initialRole);
  const [isRegister, setIsRegister] = useState(initialIsRegister);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [department, setDepartment] = useState(
    'Municipal Sanitation & Waste'
  );

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setRole(initialRole);
    setIsRegister(initialIsRegister);

    setName('');
    setEmail('');
    setPassword('');

    setSuccessMsg('');
    setErrorMsg('');
    setLoading(false);
  }, [initialRole, initialIsRegister, isOpen]);

  if (!isOpen) {
    return null;
  }

  const isValidEmail = (value) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  };

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

  const getErrorMessage = async (response) => {
    try {
      const data = await response.json();

      if (Array.isArray(data?.errors) && data.errors.length > 0) {
        return data.errors.map((error) => error.message).join(' ');
      }

      if (data?.message) {
        return data.message;
      }

      return 'Something went wrong. Please try again.';
    } catch {
      return 'Unable to communicate with the server. Please try again.';
    }
  };

  const handleCitizenValidation = () => {
    if (isRegister && !name.trim()) {
      setErrorMsg('Please enter your full name.');
      return false;
    }

    if (!email.trim()) {
      setErrorMsg('Please enter your email address.');
      return false;
    }

    if (!isValidEmail(email.trim())) {
      setErrorMsg('Please enter a valid email address.');
      return false;
    }

    if (!password.trim()) {
      setErrorMsg('Please enter your password.');
      return false;
    }

    if (password.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleOfficerValidation = () => {
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

    if (password.length < 6) {
      setErrorMsg('Password must contain at least 6 characters.');
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      return;
    }

    setErrorMsg('');
    setSuccessMsg('');

    const isValid =
      role === 'citizen'
        ? handleCitizenValidation()
        : handleOfficerValidation();

    if (!isValid) {
      return;
    }

    setLoading(true);

    try {
      const endpoint = isRegister
        ? `${API_BASE_URL}/api/auth/register`
        : `${API_BASE_URL}/api/auth/login`;

      const requestBody = isRegister
        ? {
            name: name.trim(),
            email: email.trim().toLowerCase(),
            password,
          }
        : {
            email: email.trim().toLowerCase(),
            password,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const message = await getErrorMessage(response);
        throw new Error(message);
      }

      const userData = await response.json();

      if (!userData?.token) {
        throw new Error(
          'Authentication succeeded, but no authentication token was returned by the server.'
        );
      }

      localStorage.setItem('nivaran_token', userData.token);

      localStorage.setItem(
        'nivaran_user',
        JSON.stringify({
          _id: userData._id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          department: userData.department || null,
        })
      );

      setSuccessMsg(
        isRegister
          ? 'Citizen account created successfully!'
          : role === 'officer'
          ? 'Officer authenticated successfully!'
          : 'Citizen authenticated successfully!'
      );

      if (onLoginSuccess) {
        onLoginSuccess({
          ...userData,
          department:
            userData.department ||
            (role === 'officer' ? department : null),
        });
      }

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
        setErrorMsg('');
      }, 500);
    } catch (error) {
      setErrorMsg(
        error?.message ||
          'Unable to authenticate. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const switchToCitizen = () => {
    setRole('citizen');
    setIsRegister(false);

    setName('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchToOfficer = () => {
    setRole('officer');
    setIsRegister(false);

    setName('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchToRegister = () => {
    setRole('citizen');
    setIsRegister(true);

    setName('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  const switchToLogin = () => {
    setIsRegister(false);

    setName('');
    setEmail('');
    setPassword('');

    setErrorMsg('');
    setSuccessMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm font-sans">
      <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg p-6 text-slate-900 shadow-2xl relative max-h-[95vh] overflow-y-auto">
        {/* Close */}
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition disabled:opacity-50"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
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

        {/* Role switch */}
        <div className="flex bg-slate-100 p-1 rounded mb-5 border border-slate-300 text-xs font-bold">
          <button
            type="button"
            onClick={switchToCitizen}
            disabled={loading}
            className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1 ${
              role === 'citizen'
                ? 'bg-[#0F2E5A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            } disabled:opacity-50`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>

          <button
            type="button"
            onClick={switchToOfficer}
            disabled={loading}
            className={`flex-1 py-2 rounded transition flex items-center justify-center gap-1 ${
              role === 'officer'
                ? 'bg-[#0F2E5A] text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            } disabled:opacity-50`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Officer Sign In</span>
          </button>
        </div>

        {/* Citizen login/register switch */}
        {role === 'citizen' && (
          <div className="flex items-center justify-center gap-2 text-xs mb-5">
            <button
              type="button"
              onClick={switchToLogin}
              disabled={loading}
              className={`font-bold ${
                !isRegister
                  ? 'text-[#0F2E5A]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Sign In
            </button>

            <span className="text-slate-300">|</span>

            <button
              type="button"
              onClick={switchToRegister}
              disabled={loading}
              className={`font-bold ${
                isRegister
                  ? 'text-[#0F2E5A]'
                  : 'text-slate-400 hover:text-slate-700'
              }`}
            >
              Create Account
            </button>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            role="alert"
            className="mb-4 bg-red-50 border border-red-300 text-red-800 p-2.5 rounded text-xs font-semibold"
          >
            {errorMsg}
          </div>
        )}

        {/* Success */}
        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded text-xs flex items-center gap-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-3.5 text-xs"
        >
          {/* Citizen */}
          {role === 'citizen' && (
            <>
              {/* Full name */}
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
                      onChange={(event) => {
                        setName(event.target.value);
                        setErrorMsg('');
                      }}
                      disabled={loading}
                      className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none disabled:bg-slate-100"
                    />
                  </div>
                </div>
              )}

              {/* Email */}
              <div>
                <label className="block text-slate-700 font-bold mb-1">
                  Email Address
                </label>

                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                  <input
                    type="email"
                    required
                    autoComplete="email"
                    placeholder="Enter your email address"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrorMsg('');
                    }}
                    disabled={loading}
                    className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none disabled:bg-slate-100"
                  />
                </div>

                <p className="text-[10px] text-slate-500 mt-1">
                  Use the same email address when signing in.
                </p>
              </div>
            </>
          )}

          {/* Officer email */}
          {role === 'officer' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Official Government Email ID
              </label>

              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                <input
                  type="email"
                  required
                  autoComplete="email"
                  placeholder="officer.name@mohua.gov.in"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    setErrorMsg('');
                  }}
                  disabled={loading}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none disabled:bg-slate-100"
                />
              </div>

              <p className="text-[10px] text-slate-500 mt-1">
                Official .gov.in or .nic.in email required.
              </p>
            </div>
          )}

          {/* Officer department */}
          {role === 'officer' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">
                Assigned Ministry Department
              </label>

              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

                <select
                  value={department}
                  onChange={(event) =>
                    setDepartment(event.target.value)
                  }
                  disabled={loading}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 focus:border-[#0F2E5A] focus:outline-none cursor-pointer disabled:bg-slate-100"
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

          {/* Password */}
          <div>
            <label className="block text-slate-700 font-bold mb-1">
              Password
            </label>

            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />

              <input
                type="password"
                required
                autoComplete={
                  isRegister ? 'new-password' : 'current-password'
                }
                placeholder={
                  isRegister
                    ? 'Create a password'
                    : 'Enter your password'
                }
                value={password}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setErrorMsg('');
                }}
                disabled={loading}
                className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none disabled:bg-slate-100"
              />
            </div>

            <p className="text-[10px] text-slate-500 mt-1">
              Password must contain at least 6 characters.
            </p>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#0F2E5A] hover:bg-[#0A192F] text-white font-extrabold py-2.5 rounded flex items-center justify-center gap-2 transition disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>
                  {isRegister
                    ? 'Creating Account...'
                    : 'Signing In...'}
                </span>
              </>
            ) : (
              <>
                {isRegister ? (
                  <UserPlus className="w-4 h-4 text-amber-300" />
                ) : (
                  <LogIn className="w-4 h-4 text-amber-300" />
                )}

                <span>
                  {isRegister
                    ? 'Create Citizen Account'
                    : role === 'officer'
                    ? 'Officer Sign In'
                    : 'Citizen Sign In'}
                </span>

                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Security notice */}
        <div className="mt-5 pt-4 border-t border-slate-200 flex items-start gap-2 text-[10px] text-slate-500">
          <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />

          <span>
            Your credentials are securely processed by the
            NIVARAN backend. Authentication uses a protected
            access token for authorized portal operations.
          </span>
        </div>
      </div>
    </div>
  );
}