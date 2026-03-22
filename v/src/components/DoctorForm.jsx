import React, { useState } from "react";
import { submitDeathReport } from "../services/api";
import { storeHash } from "../services/blockchain";
import { uploadToIPFS } from "../services/ipfs";
import axios from "axios";
import {
  ShieldCheck,
  Loader2,
  Upload,
  User,
  Clipboard,
  Calendar,
  MapPin,
  Stethoscope,
  ChevronRight,
  Info,
  CheckCircle2
} from "lucide-react";

const ProtocolStep = ({ number, title, desc }) => (
  <div className="flex gap-4 group items-start">
    <div className="bg-blue-500/10 text-blue-400 font-mono text-[10px] w-6 h-6 rounded-lg flex items-center justify-center border border-blue-500/20 group-hover:bg-blue-500 group-hover:text-white transition-all duration-300">
      {number}
    </div>
    <div className="flex-1">
      <h4 className="text-[10px] font-black text-slate-300 uppercase tracking-widest mb-1 group-hover:text-blue-400 transition-colors">
        {title}
      </h4>
      <p className="text-[10px] text-slate-500 leading-tight leading-relaxed">{desc}</p>
    </div>
  </div>
);

const CustomInput = ({ label, icon, type = "text", name, value, onChange }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] ml-1">
      {label}
    </label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors duration-300">
        {icon}
      </div>
      <input
        type={type}
        name={name}
        value={value}
        required
        onChange={(e) => onChange((prev) => ({ ...prev, [name]: e.target.value }))}
        className="w-full bg-[#16161a] border border-white/5 rounded-xl pl-11 pr-4 py-3.5 text-sm text-white outline-none focus:ring-2 ring-blue-500/20 focus:border-blue-500/40 transition-all placeholder:text-slate-700"
      />
    </div>
  </div>
);

export default function DoctorForm() {
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: "", content: "" });
  const [report, setReport] = useState({
    patient_id: "",
    full_name: "",
    dob: "",
    gender: "Male",
    doctor_id: "",
    hospital_id: "",
    date_time_of_death: "",
    cause_of_death: ""
  });

  const checkExistingPatient = async () => {
    if (!report.patient_id) return true;
    try {
      const res = await axios.get(`http://localhost:8000/check-patient/${report.patient_id}`);
      if (res.data.exists) {
        setMsg({ type: "error", content: "Registry Alert: Patient already registered in system." });
        return true;
      }
      return false;
    } catch (err) {
      setMsg({ type: "error", content: "Connection Error: Backend unreachable." });
      return true;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: "error", content: "Evidence Missing: Upload signed certificate." });
    
    const exists = await checkExistingPatient();
    if (exists) return;

    try {
      setLoading(true);
      setMsg({ type: "loading", content: "Protocol Initiated: Securing data hashes..." });
      
      const cid = await uploadToIPFS(file);
      const payload = { ...report, death_image_cid: cid };
      const res = await submitDeathReport(payload);

      await storeHash(report.patient_id.trim(), res.death_hash);
      
      setMsg({ type: "success", content: "Chain Commit Successful: Data anchored to Block." });
      setFile(null);
      setReport({ patient_id: "", full_name: "", dob: "", gender: "Male", doctor_id: "", hospital_id: "", date_time_of_death: "", cause_of_death: "" });
    } catch (err) {
      setMsg({ type: "error", content: err.message || "Network Protocol Violation" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-200 flex items-center justify-center p-6 font-sans">
      <div className="w-full max-w-5xl bg-[#111114] border border-white/5 rounded-[2.5rem] shadow-[0_22px_70px_4px_rgba(0,0,0,0.56)] overflow-hidden flex flex-col md:flex-row min-h-[750px]">
        
        {/* LEFT PANEL: SECURITY TERMINAL */}
        <div className="md:w-[35%] bg-[#0d0d10] p-10 flex flex-col justify-between relative overflow-hidden border-r border-white/5">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 via-transparent to-transparent pointer-events-none" />
          
          <div className="relative z-10">
            <div className="bg-blue-600 w-14 h-14 rounded-2xl flex items-center justify-center mb-10 shadow-lg shadow-blue-600/30">
              <ShieldCheck className="text-white" size={30} />
            </div>

            <h2 className="text-3xl font-black text-white leading-tight uppercase tracking-tighter mb-4">
              Forensa <br />
              <span className="text-blue-500">Terminal v3.0</span>
            </h2>
            <p className="text-[11px] text-slate-500 font-bold uppercase tracking-[0.2em] mb-12">Security Protocol Active</p>

            <div className="space-y-8">
              <ProtocolStep number="01" title="Node Isolation" desc="Local instance connected to private node cluster." />
              <ProtocolStep number="02" title="IPFS Sharding" desc="Distributing encrypted file fragments via P2P." />
              <ProtocolStep number="03" title="Blockchain Commit" desc="Immutable time-stamping on main-net." />
            </div>
          </div>

          <div className="relative z-10 pt-10 border-t border-white/5 flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
             <p className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">System Link: Stable</p>
          </div>
        </div>

        {/* RIGHT PANEL: FORM INPUTS */}
        <div className="md:w-[65%] p-12 overflow-y-auto">
          {msg.content && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-4 animate-in fade-in slide-in-from-top-2 duration-300 ${
              msg.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
              msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              "bg-blue-500/10 border-blue-500/20 text-blue-400"
            }`}>
              {msg.type === "loading" ? <Loader2 size={18} className="animate-spin" /> : 
               msg.type === "success" ? <CheckCircle2 size={18} /> : <Info size={18} />}
              <span className="text-[11px] font-black uppercase tracking-widest">{msg.content}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="grid md:grid-cols-2 gap-x-8 gap-y-6">
              <CustomInput label="Patient Full Name" icon={<User size={14} />} name="full_name" value={report.full_name} onChange={setReport} />
              <CustomInput label="Identity Number (PID)" icon={<Clipboard size={14} />} name="patient_id" value={report.patient_id} onChange={setReport} />
              <CustomInput label="Date of Birth" icon={<Calendar size={14} />} type="date" name="dob" value={report.dob} onChange={setReport} />
              <CustomInput label="Authorizing Doctor ID" icon={<Stethoscope size={14} />} name="doctor_id" value={report.doctor_id} onChange={setReport} />
              <CustomInput label="Healthcare Facility ID" icon={<MapPin size={14} />} name="hospital_id" value={report.hospital_id} onChange={setReport} />
              <CustomInput label="Precise Time of Death" icon={<Calendar size={14} />} type="datetime-local" name="date_time_of_death" value={report.date_time_of_death} onChange={setReport} />
              
              <div className="md:col-span-2">
                <CustomInput label="Primary Cause of Death" icon={<Clipboard size={14} />} name="cause_of_death" value={report.cause_of_death} onChange={setReport} />
              </div>
            </div>

            {/* ENHANCED FILE UPLOAD */}
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase text-slate-500 tracking-[0.15em] ml-1">Official Documentation</label>
              <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all duration-300 ${file ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-white/10 hover:border-blue-500/40 hover:bg-white/5'}`}>
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle2 className="text-emerald-500" size={24} />
                    <p className="text-[11px] text-emerald-400 font-bold uppercase">{file.name}</p>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Upload className="text-slate-500 group-hover:text-blue-400" size={24} />
                    <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Attach Signed Certificate</p>
                  </div>
                )}
                <input type="file" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              </label>
            </div>

            {/* ACTION BUTTON */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-2xl font-black text-white uppercase tracking-[0.25em] text-xs transition-all shadow-xl shadow-blue-600/20 flex items-center justify-center gap-3 group"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  Communicate to Blockchain
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}