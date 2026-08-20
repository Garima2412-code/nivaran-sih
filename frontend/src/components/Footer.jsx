import React from 'react';
import { 
  Lock, 
  PhoneCall, 
  ExternalLink,
  MapPin,
  Clock
} from 'lucide-react';

export default function Footer({ t }) {
  return (
    <footer className="bg-[#1E293B] text-slate-300 pt-12 pb-8 border-t-4 border-[#D97706] font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        {/* Main Footer Links & Information Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 border-b border-slate-700 text-xs">
          
          {/* Col 1: Government Identity & Address */}
          <div className="space-y-3">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm">
                🇮🇳
              </div>
              <div>
                <span className="font-heading font-extrabold text-base text-white">
                  {t.portalTitle}
                </span>
                <p className="text-[10px] text-slate-400">{t.footerGovInit}</p>
              </div>
            </div>

            <p className="text-slate-400 text-xs leading-relaxed">
              {t.footerDesc}
            </p>

            <div className="pt-1 text-slate-400 space-y-1 text-[11px]">
              <p className="flex items-center space-x-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
                <span>{t.footerAddress}</span>
              </p>
              <p className="flex items-center space-x-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{t.footerHours}</span>
              </p>
            </div>
          </div>

          {/* Col 2: Security & DPDP Compliance */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>Privacy Policy & DPDP</span>
            </h4>
            <ul className="space-y-2 text-slate-400 text-[11px]">
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Compliant with Digital Personal Data Protection (DPDP) Act 2023.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Encrypted record-keeping and role-based officer authentication.</span>
              </li>
              <li className="flex items-start space-x-1.5">
                <span className="text-emerald-400 font-bold">•</span>
                <span>Strict citizen data confidentiality protocols.</span>
              </li>
            </ul>
          </div>

          {/* Col 3: Official National Portals */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading">
              National Portals
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-300">
              <li>
                <a href="https://mohua.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center space-x-1.5 transition">
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>Ministry of Housing & Urban Affairs (mohua.gov.in)</span>
                </a>
              </li>
              <li>
                <a href="https://pgportal.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center space-x-1.5 transition">
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>CPGRAMS National Portal (pgportal.gov.in)</span>
                </a>
              </li>
              <li>
                <a href="https://india.gov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center space-x-1.5 transition">
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>National Portal of India (india.gov.in)</span>
                </a>
              </li>
              <li>
                <a href="https://mygov.in" target="_blank" rel="noreferrer" className="hover:text-amber-300 flex items-center space-x-1.5 transition">
                  <ExternalLink className="w-3 h-3 text-slate-500" />
                  <span>MyGov Citizen Platform (mygov.in)</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Toll Free Helpline */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider font-heading flex items-center space-x-1">
              <PhoneCall className="w-3.5 h-3.5 text-amber-400" />
              <span>{t.footerHelplineTitle}</span>
            </h4>
            <div className="bg-slate-800 border border-slate-700 p-3.5 rounded space-y-1">
              <p className="text-[11px] font-bold text-amber-300">Toll-Free National Helpline:</p>
              <p className="text-base font-extrabold text-white font-mono">1800-11-2026</p>
              <p className="text-[10px] text-slate-400">{t.footerHelplineSub}</p>
            </div>
          </div>

        </div>

        {/* Bottom Copyright Bar */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-400 gap-3">
          <p>{t.footerRights}</p>
          <div className="flex items-center space-x-4 text-slate-400">
            <a href="#about" className="hover:underline">Copyright Policy</a>
            <span>|</span>
            <a href="#about" className="hover:underline">Hyperlinking Policy</a>
            <span>|</span>
            <a href="#about" className="hover:underline">Privacy Policy</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
