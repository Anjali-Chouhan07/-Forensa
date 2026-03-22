import React, { useState, useEffect } from "react";
import DoctorForm from "../components/DoctorForm";
import VerifierForm from "../components/VerifierForm";
import PostmortemForm from "../components/PostmortemForm";
import { 
  ShieldCheck, Activity, Search, Cpu, Menu, X, 
  Globe, Lock, Zap, Fingerprint, Layers, Terminal 
} from "lucide-react";

const Dashboard = () => {
  const [active, setActive] = useState("doctor");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#08080a] text-slate-200 selection:bg-blue-500/40 font-['Inter'] overflow-x-hidden">
      
      {/* --- CYBER BACKGROUND ELEMENTS --- */}
      <div className="fixed top-[-15%] left-[-10%] w-[500px] h-[500px] bg-blue-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed bottom-[-15%] right-[-10%] w-[500px] h-[500px] bg-indigo-600/10 blur-[150px] rounded-full pointer-events-none animate-pulse" />
      <div className="fixed inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      {/* --- ULTRA MODERN NAVBAR --- */}
      <nav className={`fixed top-0 w-full z-[100] transition-all duration-700 ${
        scrolled ? "bg-[#0d0d10]/80 backdrop-blur-2xl py-4 border-b border-white/10 shadow-2xl" : "bg-transparent py-8 border-b border-transparent"
      }`}>
        <div className="max-w-[1440px] mx-auto px-8 md:px-12 flex items-center justify-between">
          
          {/* BRANDING */}
          <div className="flex items-center gap-5 group cursor-pointer">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-600/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative h-14 w-14 flex items-center justify-center border border-white/10 bg-[#111114] rounded-2xl group-hover:border-blue-500/50 transition-all duration-500 shadow-2xl overflow-hidden">
                 <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-all" />
                 <Fingerprint size={28} className="text-blue-500 group-hover:scale-110 transition-transform duration-500" />
                 <div className="absolute top-0 left-0 w-full h-[2px] bg-blue-500/40 animate-[scan_2s_linear_infinite]" />
              </div>
            </div>

            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <h1 className="text-3xl md:text-4xl font-black tracking-[-0.05em] text-white italic">
                  FOREN<span className="text-blue-500">SA</span>
                </h1>
                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse mt-2" />
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <span className="h-[1px] w-6 bg-blue-500/40" />
                <p className="text-[9px] uppercase tracking-[0.5em] font-black text-slate-500">Decentralized Forensic Ledger</p>
              </div>
            </div>
          </div>

          {/* NAVIGATION */}
          <div className="hidden lg:flex items-center bg-[#16161a]/40 backdrop-blur-md p-1.5 rounded-[24px] border border-white/5 shadow-inner">
            <NavTab label="Medical Entry" icon={<ShieldCheck size={16} />} active={active === "doctor"} onClick={() => setActive("doctor")} theme="blue" />
            <NavTab label="Forensic Lab" icon={<Activity size={16} />} active={active === "Postmortem"} onClick={() => setActive("Postmortem")} theme="purple" />
            <NavTab label="Audit Logs" icon={<Search size={16} />} active={active === "verifier"} onClick={() => setActive("verifier")} theme="emerald" />
          </div>

          <button className="lg:hidden p-4 bg-white/5 rounded-2xl border border-white/10" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- CONTENT AREA --- */}
      <main className="relative z-10 max-w-[1400px] mx-auto pt-40 pb-16 px-8 md:px-12">
        <div className="mb-10 flex items-center justify-between">
           <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-full border border-white/5 shadow-sm">
              <Terminal size={12} className="text-blue-500" />
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                Current Protocol: <span className="text-white">{active.toUpperCase()} REPORTING</span>
              </span>
           </div>
           <div className="hidden md:flex items-center gap-6 text-[10px] font-bold text-slate-600 uppercase tracking-widest">
              <span className="flex items-center gap-2"><Globe size={12} className="text-emerald-500" /> Network: Online</span>
              <span className="flex items-center gap-2"><Layers size={12} className="text-blue-500" /> Sharding: Active</span>
           </div>
        </div>

        <div className="transition-all duration-700">
          {active === "doctor" && <DoctorForm />}
          {active === "Postmortem" && <PostmortemForm />}
          {active === "verifier" && <VerifierForm />}
        </div>

        {/* --- SYSTEM FOOTER --- */}
        <footer className="mt-32 py-20 border-t border-white/5 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-12">
            <div className="flex flex-col items-center md:items-start">
              <p className="text-slate-500 text-[10px] uppercase font-black tracking-[0.6em] mb-6">Security Compliance Suite</p>
              <div className="flex flex-wrap justify-center gap-4">
                <StatusPill label="LATENCY" value="0.04 MS" color="text-blue-400" />
                <StatusPill label="CIPHER" value="RSA-4096" color="text-purple-400" />
                <StatusPill label="UPTIME" value="99.9%" color="text-emerald-400" />
              </div>
            </div>
            <div className="text-center md:text-right">
              <h4 className="text-white font-black text-lg tracking-tighter italic mb-1">#FORENSA</h4>
              <p className="text-slate-600 text-[10px] uppercase font-bold tracking-[0.3em] opacity-60 italic">Justice Hashed. Forensic Accountability Ledger.</p>
            </div>
          </div>
        </footer>
      </main>

      {/* ✅ Fixed Style Tag inside return block */}
      <style>
        {`
          @keyframes scan {
            0% { transform: translateY(0); opacity: 0; }
            50% { opacity: 1; }
            100% { transform: translateY(56px); opacity: 0; }
          }
        `}
      </style>
    </div>
  );
};

/* --- COMPONENTS --- */

const NavTab = ({ label, icon, active, onClick, theme }) => {
  const themes = {
    blue: "bg-blue-600 shadow-[0_0_25px_rgba(37,99,235,0.4)] border-blue-400/40",
    purple: "bg-purple-600 shadow-[0_0_25px_rgba(147,51,234,0.4)] border-purple-400/40",
    emerald: "bg-emerald-600 shadow-[0_0_25px_rgba(16,185,129,0.4)] border-emerald-400/40"
  };

  return (
    <button onClick={onClick} className={`flex items-center gap-3 px-8 py-3.5 rounded-[20px] font-black text-[11px] uppercase tracking-widest transition-all duration-500 border ${active ? `${themes[theme]} text-white scale-105` : "text-slate-500 border-transparent hover:text-slate-200 hover:bg-white/5"}`}>
      {icon}
      <span>{label}</span>
    </button>
  );
};

const StatusPill = ({ label, value, color }) => (
  <div className="flex items-center gap-3 bg-white/[0.03] px-5 py-2.5 rounded-2xl border border-white/5 backdrop-blur-md">
    <div className={`h-1.5 w-1.5 rounded-full ${color.replace('text', 'bg')} animate-pulse`} />
    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{label}:</span>
    <span className={`text-[10px] font-black uppercase text-white`}>{value}</span>
  </div>
);

export default Dashboard;