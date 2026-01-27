import React, { useState } from "react";
import { submitDeathReport } from "../services/api";
import { storeHash } from "../services/blockchain";
import { uploadToIPFS } from "../services/ipfs";
import { ShieldCheck, Loader2, Upload, User, Clipboard, Calendar, MapPin, Stethoscope } from "lucide-react";

// Helper Component for the Left Side Steps
const ProtocolStep = ({ number, title, desc }) => (
  <div className="flex gap-4 group">
    <div className="text-blue-500/50 font-black text-xs mt-1 font-mono group-hover:text-blue-400 transition-colors">
      {number}
    </div>
    <div>
      <h4 className="text-xs font-bold text-slate-200 uppercase tracking-widest mb-1">
        {title}
      </h4>
      <p className="text-[11px] text-slate-500 leading-tight">
        {desc}
      </p>
    </div>
  </div>
);

// Internal Helper Component for Modern Inputs
const CustomInput = ({ label, icon, type = "text", name, value, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[12px] capitalize text-slate-200 tracking-widest ml-1">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-blue-500 transition-colors">
        {icon}
      </div>
      <input 
        type={type}
        name={name}
        value={value}
        onChange={(e) => onChange(prev => ({ ...prev, [name]: e.target.value }))}
        className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:ring-2 ring-blue-500/20 focus:bg-[#212126] transition-all" 
        required 
      />
    </div>
  </div>
);

const DoctorForm = () => {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: "", content: "" });

  const [report, setReport] = useState({
    patient_id: "", full_name: "", dob: "", gender: "Male", doctor_id: "", hospital_id: "",
    date_time_of_death: "", place_of_death: "", cause_of_death: "", death_recorded_by: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: "error", content: "Please attach a signed medical certificate." });
    
    setLoading(true); 
    setMsg({ type: "loading", content: "Securing data on Blockchain & IPFS..." });

    try {
      const res = await submitDeathReport(report);
      const cid = await uploadToIPFS(file);
      const blockchainPayload = JSON.stringify({ reportHash: res.death_hash, ipfsCid: cid });
      await storeHash(report.patient_id.trim(), blockchainPayload);
      
      setMsg({ type: "success", content: "Certificate successfully anchored to Distributed Ledger." });
      setFile(null);
    } catch { 
      setMsg({ type: "error", content: "Network Error: Failed to commit registration." }); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex items-center justify-center p-4 font-['Inter']">
      <div className="w-full max-w-6xl bg-[#111114] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row">
        
        {/* Left Side: Branding/Info */}
        <div className="md:w-1/3 bg-gradient-to-br from-blue-600/20 via-transparent to-indigo-900/40 p-10 flex flex-col justify-between border-r border-white/5 relative overflow-hidden">
          <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-blue-600/10 blur-[80px] rounded-full"></div>

          <div className="relative z-10">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-8 shadow-[0_0_30px_rgba(37,99,235,0.3)] border border-blue-400/20">
              <ShieldCheck className="text-white" size={32} />
            </div>
            
            <h2 className="text-4xl  text-white leading-tight tracking-widest font-semibold uppercase  font-['Poppins']">
              Hashing The Truth With  <br /> 
              <span className="text-blue-500"> #Forensa</span>
            </h2>

            <div className="mt-8 space-y-6">
              <ProtocolStep number="01" title="Data Encryption" desc="AES-256 standard applied to all inputs." />
              <ProtocolStep number="02" title="Hash Generation" desc="SHA-256 cryptographic fingerprinting." />
              <ProtocolStep number="03" title="Chain Commit" desc="Immutable storage on Distributed Ledger." />
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/5 relative z-10">
            <div className="flex items-center gap-3">
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-75"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                </div>
                <span className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">System Integrity: Optimal</span>
            </div>
          </div>
        </div>

        {/* Right Side: Form */}
        <div className="md:w-2/3 p-10 bg-[#111114]">
          {msg.content && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300 ${
              msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : 
              msg.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-blue-500/10 border-blue-500/30 text-blue-400"
            }`}>
              {msg.type === "loading" ? <Loader2 size={18} className="animate-spin" /> : <ShieldCheck size={18} />}
              <span className="text-sm font-medium">{msg.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <CustomInput label="Patient Full Name" icon={<User size={14}/>} name="full_name" value={report.full_name} onChange={setReport} />
              
              <div className="flex flex-col gap-2">
                <label className="text-[12px] uppercase text-slate-200 tracking-widest ml-1 font-['Inter']">Gender</label>
                <select 
                   value={report.gender}
                   onChange={(e)=>setReport({...report, gender: e.target.value})} 
                   className="w-full bg-[#1a1a1e] border border-white/5 rounded-2xl px-4 py-3.5 text-sm text-white outline-none focus:ring-2 ring-blue-500/20 transition-all appearance-none cursor-pointer"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <CustomInput label="Date of Birth" icon={<Calendar size={14}/>} type="date" name="dob" value={report.dob} onChange={setReport} />
              <CustomInput label="Patient Registration ID" icon={<Clipboard size={14}/>} name="patient_id" value={report.patient_id} onChange={setReport} />
              <CustomInput label="License ID (Doctor)" icon={<Stethoscope size={14}/>} name="doctor_id" value={report.doctor_id} onChange={setReport} />
              <CustomInput label="Hospital ID" icon={<MapPin size={14}/>} name="hospital_id" value={report.hospital_id} onChange={setReport} />
              <CustomInput label="Time of Death" icon={<Calendar size={14}/>} type="datetime-local" name="date_time_of_death" value={report.date_time_of_death} onChange={setReport} />
              <div className="md:col-span-2">
                 <CustomInput label="Primary Cause of Death" icon={<Clipboard size={14}/>} name="cause_of_death" value={report.cause_of_death} onChange={setReport} />
              </div>
            </div>

            <div className="pt-6 border-t border-white/5 space-y-6">
              <div className="flex flex-col gap-2">
                <label className="text-[12px] uppercase text-slate-300 font-black tracking-widest ml-1">Evidence Documentation</label>
                <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-white/10 rounded-[1.5rem] cursor-pointer hover:bg-blue-600/5 hover:border-blue-500/50 transition-all duration-300">
                  <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                    <Upload className={`mb-2 transition-colors ${file ? 'text-blue-500' : 'text-slate-500 group-hover:text-blue-400'}`} size={24} />
                    <p className="text-xs text-slate-400 font-medium px-4">
                      {file ? <span className="text-blue-400 font-bold">{file.name}</span> : "Drop signed certificate or click to browse"}
                    </p>
                  </div>
                  <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
                </label>
              </div>

              <button 
                disabled={loading} 
                type="submit"
                className="w-full py-5 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl font-black text-white uppercase tracking-widest text-sm hover:scale-[1.01] active:scale-[0.99] transition-all shadow-xl shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-3"
              >
                {loading ? <><Loader2 className="animate-spin" size={20} /> Authorizing...</> : "Anchor To Blockchain"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default DoctorForm;