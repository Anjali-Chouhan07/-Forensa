import React, { useState } from "react";
import DoctorForm from "../components/DoctorForm";
import VerifierForm from "../components/VerifierForm";
import PostmortemForm from "../components/PostmortemForm";
import { ShieldCheck, Activity, Search, Cpu, Menu, X } from "lucide-react";

const Dashboard = () => {
  const [active, setActive] = useState("doctor");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // For mobile menu toggle

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 selection:bg-blue-500/30 font-['Inter']">
      
      {/* Global Header / Navbar */}
      <div className="flex flex-col lg:flex-row items-center justify-between px-6 md:px-12 py-6 lg:py-8 border-b border-white/5 bg-[#0d0d10]/80 backdrop-blur-xl sticky top-0 z-50">
        
        {/* Branding - Responsive Scaling */}
        <div className="flex items-center justify-between w-full lg:w-auto mb-6 lg:mb-0 group cursor-default">
          <div className="flex flex-col items-center lg:items-start">
            <div className="flex items-center gap-2 md:gap-3">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 p-1.5 md:p-2 rounded-xl shadow-lg shadow-purple-500/20">
                <Cpu size={22} className="text-white md:w-7 md:h-7" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black tracking-tighter bg-gradient-to-r from-blue-400 via-purple-500 to-indigo-500 bg-clip-text text-transparent font-['Montserrat'] italic">
                #Forensa
              </h1>
            </div>
            <p className="hidden md:block text-[10px] md:text-[11px] uppercase tracking-[0.3em] md:tracking-[0.4em] font-black text-slate-500 mt-2 ml-1 md:ml-14 opacity-80">
              Unaltered Evidence • Unshakeable Justice
            </p>
          </div>

          {/* Mobile Menu Toggle */}
          <button 
            className="lg:hidden p-2 text-slate-400 hover:text-white"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* Navigation Switch - Responsive Grid/Row */}
        <div className={`
          ${isMenuOpen ? "flex" : "hidden lg:flex"} 
          flex-col lg:flex-row w-full lg:w-auto bg-[#1a1a1e] p-2 rounded-2xl border border-white/5 gap-2 md:gap-3 shadow-2xl
        `}>
          <NavBtn 
            label="Doctor Unit" 
            icon={<ShieldCheck size={18} />}
            active={active === "doctor"} 
            onClick={() => { setActive("doctor"); setIsMenuOpen(false); }}
            color="blue"
          />
          <NavBtn 
            label="Forensic Lab" 
            icon={<Activity size={18} />}
            active={active === "Postmortem"} 
            onClick={() => { setActive("Postmortem"); setIsMenuOpen(false); }}
            color="purple"
          />
          <NavBtn 
            label="Audit Verifier" 
            icon={<Search size={18} />}
            active={active === "verifier"} 
            onClick={() => { setActive("verifier"); setIsMenuOpen(false); }}
            color="emerald"
          />
        </div>
      </div>

      {/* Main Content Area - Responsive Margins */}
      <div className="max-w-[1400px] mx-auto py-6 md:py-12 px-4 md:px-8">
        
        {/* Dynamic Panel Rendering with Smooth Transition */}
        <div className="animate-in fade-in zoom-in-95 duration-500 overflow-x-hidden">
          {active === "doctor" && <DoctorForm />}
          {active === "Postmortem" && <PostmortemForm />}
          {active === "verifier" && <VerifierForm />}
        </div>

        {/* System Status Footer - Stacks on Mobile */}
        <div className="mt-16 md:mt-24 py-8 md:py-12 border-t border-white/5 flex flex-col items-center gap-4 md:gap-6">
            <div className="flex flex-wrap justify-center gap-4 md:gap-8">
                <StatusItem label="Nodes" value="Active" color="text-emerald-500" />
                <StatusItem label="Network" value="Mainnet" color="text-blue-500" />
                <StatusItem label="Security" value="AES-256" color="text-purple-500" />
            </div>
            <p className="text-slate-600 text-[9px] md:text-[10px] text-center uppercase font-black tracking-[0.3em] md:tracking-[0.5em] mt-2 px-4">
                Decentralized Forensic Accountability Protocol v2.0
            </p>
        </div>
      </div>
    </div>
  );
};

/* Internal Navigation Button Component - Adjusted for Mobile Tap Targets */
const NavBtn = ({ label, icon, active, onClick, color }) => {
  const colors = {
    blue: "bg-blue-600 shadow-blue-500/20 border-blue-400/30",
    purple: "bg-purple-600 shadow-purple-500/20 border-purple-400/30",
    emerald: "bg-emerald-600 shadow-emerald-500/20 border-emerald-400/30"
  };

  return (
    <button
      onClick={onClick}
      className={`
        flex items-center justify-center lg:justify-start gap-3 px-4 md:px-8 py-3 md:py-4 rounded-xl font-black text-xs md:text-sm uppercase tracking-tighter transition-all duration-300 border w-full lg:w-auto
        ${active 
          ? `${colors[color]} text-white shadow-2xl scale-[1.02] lg:scale-105 border-opacity-50` 
          : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5"}
      `}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

/* Footer Status Helper */
const StatusItem = ({ label, value, color }) => (
    <div className="flex items-center gap-2">
        <span className="text-[9px] md:text-[10px] font-bold text-slate-500 uppercase">{label}:</span>
        <span className={`text-[9px] md:text-[10px] font-black uppercase ${color}`}>{value}</span>
    </div>
);

export default Dashboard;