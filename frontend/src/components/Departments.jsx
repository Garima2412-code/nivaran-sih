import React from 'react';
import { 
  Building2, 
  Trash2, 
  Droplet, 
  Zap, 
  Truck, 
  Trees, 
  Construction, 
  Clock 
} from 'lucide-react';

export default function Departments() {
  const departments = [
    {
      name: "Municipal Sanitation & Solid Waste",
      icon: Trash2,
      sla: "24 Hours",
      color: "bg-amber-100 text-[#D97706]",
      description: "Garbage collection, street sweeping, illegal dumping, public bins."
    },
    {
      name: "Public Works Department (PWD Roads)",
      icon: Construction,
      sla: "36 Hours",
      color: "bg-blue-100 text-blue-800",
      description: "Road potholes, asphalt repair, footpath damage, divider maintenance."
    },
    {
      name: "City Water Supply & Drainage Board",
      icon: Droplet,
      sla: "12 Hours",
      color: "bg-emerald-100 text-emerald-800",
      description: "Pipeline leaks, water contamination, sewer overflow, drainage blockages."
    },
    {
      name: "Municipal Electrical & Lighting",
      icon: Zap,
      sla: "48 Hours",
      color: "bg-purple-100 text-purple-800",
      description: "Broken streetlights, dangling power cables, transformer maintenance."
    },
    {
      name: "Urban Transport & Traffic Infrastructure",
      icon: Truck,
      sla: "24 Hours",
      color: "bg-red-100 text-red-800",
      description: "Bus stop damage, traffic signal failure, signboards, parking hazards."
    },
    {
      name: "Horticulture & Public Parks",
      icon: Trees,
      sla: "72 Hours",
      color: "bg-green-100 text-green-800",
      description: "Fallen tree branches, park maintenance, overgrown foliage near roads."
    }
  ];

  return (
    <section id="departments" className="py-14 bg-slate-50 text-slate-900 border-b border-slate-200 font-sans">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-widest text-[#D97706]">
            Ministry Directory
          </span>
          <h3 className="text-2xl sm:text-3xl font-extrabold font-heading text-[#0F2E5A] uppercase mt-1">
            SUPPORTED MoHUA DEPARTMENTS & SLAs
          </h3>
          <p className="text-slate-600 text-xs sm:text-sm mt-2">
            Automated knowledge mapping with predefined Service Level Agreement resolution targets.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map((dept, idx) => {
            const Icon = dept.icon;
            return (
              <div 
                key={idx}
                className="bg-white border border-slate-300 p-5 rounded-lg shadow-2xs hover:shadow-xs transition"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`p-2.5 rounded ${dept.color} font-bold`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center space-x-1.5 bg-slate-100 px-2 py-0.5 rounded border border-slate-300 text-[11px] text-slate-700 font-mono font-bold">
                    <Clock className="w-3 h-3 text-[#D97706]" />
                    <span>SLA: {dept.sla}</span>
                  </div>
                </div>

                <h4 className="text-xs sm:text-sm font-extrabold text-[#0F2E5A] mb-1.5 font-heading">
                  {dept.name}
                </h4>
                
                <p className="text-slate-600 text-xs leading-relaxed">
                  {dept.description}
                </p>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
