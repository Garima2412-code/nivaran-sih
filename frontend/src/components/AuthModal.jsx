import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Building2, 
  Lock, 
  Mail, 
  User, 
  ArrowRight,
  CheckCircle2,
  LogIn,
  UserPlus
} from 'lucide-react';

export default function AuthModal({ isOpen, onClose, initialRole = 'citizen', initialIsRegister = false, onLoginSuccess }) {
  const [role, setRole] = useState(initialRole);
  const [isRegister, setIsRegister] = useState(initialIsRegister);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [department, setDepartment] = useState('Municipal Sanitation & Waste');
  const [successMsg, setSuccessMsg] = useState('');

  React.useEffect(() => {
    setRole(initialRole);
    setIsRegister(initialIsRegister);
  }, [initialRole, initialIsRegister, isOpen]);

  if (!isOpen) return null;

  const handleFillDemoCitizen = () => {
    setRole('citizen');
    setIsRegister(false);
    setEmail('citizen.demo@sih2026.gov.in');
    setPassword('CitizenPass123!');
  };

  const handleFillDemoOfficer = () => {
    setRole('officer');
    setIsRegister(false);
    setEmail('officer.sanitation@mohua.gov.in');
    setPassword('OfficerPass123!');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSuccessMsg(`Authenticated as ${role === 'officer' ? 'Department Officer' : 'Citizen'} successfully!`);
    
    setTimeout(() => {
      onLoginSuccess({
        role,
        email: email || (role === 'officer' ? 'officer.sanitation@mohua.gov.in' : 'citizen.demo@sih2026.gov.in'),
        name: name || (role === 'officer' ? 'Officer Rajesh Kumar' : 'Rahul Sharma'),
        department: role === 'officer' ? department : null
      });
      onClose();
      setSuccessMsg('');
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs font-sans">
      <div className="bg-white border border-slate-300 w-full max-w-md rounded-lg p-6 text-slate-900 shadow-2xl relative">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 p-1.5 rounded hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center mb-5">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded bg-[#0F2E5A] text-amber-300 font-bold mb-2 shadow-xs">
            {role === 'officer' ? <ShieldCheck className="w-5 h-5" /> : (isRegister ? <UserPlus className="w-5 h-5" /> : <LogIn className="w-5 h-5" />)}
          </div>

          <h3 className="text-lg font-extrabold font-heading text-[#0F2E5A]">
            {role === 'officer' ? 'Official Officer Portal' : (isRegister ? 'Citizen Sign Up' : 'Citizen Sign In')}
          </h3>
          <p className="text-slate-600 text-xs mt-0.5">
            {role === 'officer' ? 'Ministry of Housing & Urban Affairs Officer Login' : 'Access your NIVARAN citizen account'}
          </p>
        </div>

        {/* Role Tab Switcher */}
        <div className="flex bg-slate-100 p-1 rounded mb-5 border border-slate-300 text-xs font-bold">
          <button
            onClick={() => { setRole('citizen'); setIsRegister(false); }}
            className={`flex-1 py-2 rounded transition flex items-center justify-center space-x-1 ${role === 'citizen' ? 'bg-[#0F2E5A] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Citizen Portal</span>
          </button>
          
          <button
            onClick={() => { setRole('officer'); setIsRegister(false); }}
            className={`flex-1 py-2 rounded transition flex items-center justify-center space-x-1 ${role === 'officer' ? 'bg-[#0F2E5A] text-white shadow-2xs' : 'text-slate-600 hover:text-slate-900'}`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Officer Sign In</span>
          </button>
        </div>

        {/* Quick Demo Pre-fill Credentials */}
        <div className="bg-amber-50 border border-amber-200 rounded p-2.5 mb-5 text-xs">
          <p className="font-bold text-[#D97706] uppercase text-[10px] tracking-wider mb-1.5">
            SIH Judge Auto-Fill Demo Credentials:
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleFillDemoCitizen}
              className="flex-1 bg-white hover:bg-slate-50 text-slate-800 text-[11px] font-bold py-1 px-2 rounded border border-slate-300 shadow-2xs"
            >
              Demo Citizen
            </button>
            <button
              type="button"
              onClick={handleFillDemoOfficer}
              className="flex-1 bg-[#0F2E5A] hover:bg-[#0A192F] text-amber-300 text-[11px] font-bold py-1 px-2 rounded border border-[#0F2E5A] shadow-2xs"
            >
              Demo Officer
            </button>
          </div>
        </div>

        {successMsg && (
          <div className="mb-4 bg-emerald-50 border border-emerald-300 text-emerald-800 p-2.5 rounded text-xs flex items-center space-x-1.5 font-bold">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          
          {isRegister && role === 'citizen' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">
              {role === 'officer' ? 'Official Gov Email ID' : 'Email Address or Mobile Number'}
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder={role === 'officer' ? 'officer.name@mohua.gov.in' : 'citizen@example.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
              />
            </div>
          </div>

          {role === 'officer' && (
            <div>
              <label className="block text-slate-700 font-bold mb-1">Assigned Ministry Department</label>
              <div className="relative">
                <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <select
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 focus:border-[#0F2E5A] focus:outline-none cursor-pointer"
                >
                  <option value="Municipal Sanitation & Waste">Municipal Sanitation & Waste</option>
                  <option value="Public Works Department (PWD Roads)">Public Works Department (PWD Roads)</option>
                  <option value="Water Supply & Drainage Board">Water Supply & Drainage Board</option>
                  <option value="Municipal Electrical & Lighting">Municipal Electrical & Lighting</option>
                </select>
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-700 font-bold mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="password"
                required
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-white border border-slate-300 rounded py-2 pl-9 pr-3 text-slate-900 placeholder-slate-400 focus:border-[#0F2E5A] focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-[#D97706] hover:bg-[#C2410C] text-white font-extrabold py-2.5 rounded shadow-xs transition flex items-center justify-center space-x-1.5 text-xs mt-2"
          >
            <span>{isRegister ? 'Create Citizen Account' : 'Sign In to Account'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>

        {/* Footer Mode Switcher */}
        {role === 'citizen' && (
          <div className="mt-4 text-center text-slate-600 text-xs">
            {isRegister ? (
              <p>Already have an account? <button onClick={() => setIsRegister(false)} className="text-[#0F2E5A] font-bold underline">Sign In</button></p>
            ) : (
              <p>New to NIVARAN Portal? <button onClick={() => setIsRegister(true)} className="text-[#D97706] font-bold underline">Create Account</button></p>
            )}
          </div>
        )}

      </div>
    </div>
  );
}
