import React, { useState } from "react";
import axios from "axios";
import { uploadToIPFS } from "../services/ipfs";
import { storeHash } from "../services/blockchain";
import { Activity, Loader2, Search, ClipboardList, ShieldAlert, FileSearch, Upload, CheckCircle2 } from "lucide-react";

const PostmortemForm = () => {
  const [pid, setPid] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: "", content: "" });
  const [form, setForm] = useState({ 
    doctor_id: "", 
    external_examination: "", 
    internal_examination: "", 
    viscera_report: "", 
    sexual_assault_findings: "None Observed", // Default state
    final_opinion: "" 
  });

  const checkPatient = async () => {
    if (!pid) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/check-patient/${pid}`);
      if (res.data.exists) {
        setAllowed(true);
        setMsg({ type: "success", content: "Access Granted: Death record identified. Proceed with autopsy entry." });
      } else {
        setMsg({ type: "error", content: "Unauthorized: No valid death registration found for this ID." });
      }
    } catch {
      setMsg({ type: "error", content: "System connection failed." });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: "error", content: "Forensic evidence imagery is required." });
    setLoading(true);
    setMsg({ type: "loading", content: "Sealing forensic report..." });

    try {
      const imgCid = await uploadToIPFS(file);
      const deathRes = await axios.get(`http://localhost:8000/get-death-hash/${pid}`);
      
      const metadata = {
        examiner_id: form.doctor_id,
        findings: { 
            external: form.external_examination, 
            internal: form.internal_examination, 
            toxicology: form.viscera_report, 
            assault: form.sexual_assault_findings, // Sensitive data wrapped in IPFS
            opinion: form.final_opinion 
        },
        media: `https://gateway.pinata.cloud/ipfs/${imgCid}`,
        timestamp: new Date().toISOString()
      };

      const metaCid = await uploadToIPFS(new File([new Blob([JSON.stringify(metadata)], {type:'application/json'})], "pm_report.json"));
      const res = await axios.post("http://localhost:8000/submit-postmortem", { ...form, patient_id: pid, death_hash: deathRes.data.death_hash, ipfs_hash: metaCid });
      await storeHash(pid.trim(), JSON.stringify({ postmortemHash: res.data.postmortem_hash, ipfsCid: metaCid }));
      
      setMsg({ type: "success", content: "Forensic Audit Sealed Successfully." });
      setAllowed(false);
      setPid("");
    } catch { 
      setMsg({ type: "error", content: "Error: Could not anchor forensic report." }); 
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-[#111114] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* Top Header Section */}
        <div className="bg-gradient-to-r from-purple-900/20 to-transparent p-8 border-b border-white/5 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-black text-white flex items-center gap-3 tracking-tight">
              <Activity className="text-purple-500" />
              FORENSIC LAB UNIT
            </h2>
            <p className="text-slate-500 text-[10px] uppercase font-bold tracking-[0.2em] mt-1">Post-Mortem Integrity Protocol</p>
          </div>
          {allowed && (
            <div className="bg-purple-500/10 border border-purple-500/30 text-purple-400 px-4 py-1.5 rounded-full text-[14px] font-black">
              PATIENT ID: {pid}
            </div>
          )}
        </div>

        <div className="p-8">
          {/* Status Message Box */}
          {msg.content && (
            <div className={`mb-8 p-4 rounded-2xl border flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-500 ${
              msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              msg.type === "error" ? "bg-red-500/10 border-red-500/30 text-red-400" : "bg-purple-500/10 border-purple-500/30 text-purple-400"
            }`}>
              {msg.type === "loading" ? <Loader2 size={18} className="animate-spin" /> : msg.type === "error" ? <ShieldAlert size={18} /> : <CheckCircle2 size={18} />}
              <span className="text-xs font-semibold">{msg.content}</span>
            </div>
          )}

          {!allowed ? (
            /* Phase 1: Verify ID */
            <div className="max-w-md mx-auto py-12 text-center space-y-6">
              <div className="bg-white/5 w-20 h-20 rounded-full flex items-center justify-center mx-auto border border-white/10">
                <FileSearch className="text-slate-500" size={32} />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Identify Subject</h3>
                <p className="text-slate-500 text-sm mt-1">Enter the Patient Registration ID to begin the forensic audit.</p>
              </div>
              <div className="flex flex-col gap-3">
                <input 
                  value={pid} 
                  onChange={(e)=>setPid(e.target.value)} 
                  placeholder="E.g. P-100234" 
                  className="w-full bg-[#1a1a1e] border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-purple-500/20 text-center text-white font-mono" 
                />
                <button 
                  onClick={checkPatient} 
                  disabled={loading}
                  className="w-full py-4 bg-white text-black font-black uppercase tracking-widest text-xs rounded-2xl hover:bg-slate-200 transition-all flex justify-center items-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={16} /> : "Validate Security Clearance"}
                </button>
              </div>
            </div>
          ) : (
            /* Phase 2: Forensic Form */
            <form onSubmit={handleSubmit} className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
              <div className="grid md:grid-cols-2 gap-6">
                <CustomField label="Examiner License ID" placeholder="Dr. Signature ID" onChange={(v)=>setForm({...form, doctor_id: v})} />
                
                <div className="flex flex-col gap-2">
                    <label className="text-[14px] uppercase text-slate-200 tracking-widest ml-1">Autopsy Evidence</label>
                    <label className="flex items-center gap-3 w-full bg-[#1a1a1e] border border-white/10 p-3 rounded-xl cursor-pointer hover:border-purple-500/50 transition">
                        <Upload size={16} className="text-purple-500" />
                        <span className="text-xs text-slate-200 truncate">{file ? file.name : "Upload evidence imagery..."}</span>
                        <input type="file" className="hidden" onChange={(e)=>setFile(e.target.files[0])} />
                    </label>
                </div>
              </div>

              <div className="space-y-6">
                <CustomTextArea label="External Examination Findings" placeholder="Describe external trauma, markings, etc." onChange={(v)=>setForm({...form, external_examination: v})} />
                <div className="grid md:grid-cols-2 gap-6">
                    <CustomTextArea label="Internal Observations" placeholder="Detailed organ analysis findings..." onChange={(v)=>setForm({...form, internal_examination: v})} />
                    <CustomTextArea label="Toxicology / Viscera" placeholder="Chemical and viscera status..." onChange={(v)=>setForm({...form, viscera_report: v})} />
                </div>

                {/* SENSITIVE SECTION (RAPE/ASSAULT) */}
                <div className="bg-red-900/10 border border-red-500/20 p-6 rounded-3xl">
                    <div className="flex items-center gap-2 mb-4 text-red-400">
                        <ShieldAlert size={16} />
                        <span className="text-[10px] font-black uppercase tracking-widest">Medico-Legal Findings (Assault/Rape)</span>
                    </div>
                    <CustomTextArea 
                        label="Assault Evidence / Struggle Marks" 
                        placeholder="Detail any forensic evidence of struggle, DNA swabs taken, etc." 
                        onChange={(v)=>setForm({...form, sexual_assault_findings: v})} 
                    />
                </div>

                <div className="bg-purple-600/5 border border-purple-500/20 p-6 rounded-3xl">
                    <CustomTextArea label="Final Forensic Opinion" placeholder="Conclusive medical cause of death..." onChange={(v)=>setForm({...form, final_opinion: v})} />
                </div>
              </div>

              <button disabled={loading} className="w-full py-5 bg-purple-600 hover:bg-purple-500 rounded-2xl text-white uppercase tracking-[0.3em] text-[14px] transition-all shadow-xl shadow-purple-900/20 flex justify-center items-center gap-2">
                {loading ? <><Loader2 className="animate-spin" /> Sealing Ledger</> : "Anchor Forensic Audit to Blockchain"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

/* Internal UI Helpers */
const CustomField = ({ label, placeholder, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[14px] uppercase text-slate-200 tracking-widest ml-1">{label}</label>
    <input 
      type="text" 
      placeholder={placeholder}
      onChange={(e)=>onChange(e.target.value)}
      className="bg-[#1a1a1e] border border-white/10 p-3.5 rounded-2xl outline-none focus:ring-2 ring-purple-500/20 text-white text-sm" 
    />
  </div>
);

const CustomTextArea = ({ label, placeholder, onChange }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[14px] capitalize text-slate-100 tracking-widest ml-1">{label}</label>
    <textarea 
      placeholder={placeholder}
      onChange={(e)=>onChange(e.target.value)}
      className="bg-[#1a1a1e] border border-white/10 p-4 rounded-2xl outline-none focus:ring-2 ring-purple-500/20 text-white text-sm h-28 resize-none placeholder:text-slate-400" 
    />
  </div>
);

export default PostmortemForm;