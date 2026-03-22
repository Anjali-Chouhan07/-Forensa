import React, { useState } from "react";
import axios from "axios";
import { uploadToIPFS } from "../services/ipfs";
import { storeHash } from "../services/blockchain";
import { 
  Activity, 
  Loader2, 
  ShieldAlert, 
  CheckCircle2, 
  Search, 
  FileText, 
  Stethoscope, 
  Eye, 
  Image as ImageIcon,
  Send,
  UserCheck
} from "lucide-react";

// Modern Textarea Component
const ReportArea = ({ label, icon: Icon, placeholder, value, onChange }) => (
  <div className="flex flex-col gap-2 group">
    <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1 flex items-center gap-2">
      <Icon size={12} className="text-purple-500" /> {label}
    </label>
    <textarea
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className="w-full bg-[#1a1a1e] border border-white/5 p-4 rounded-2xl text-white text-sm h-28 resize-none outline-none focus:ring-2 ring-purple-500/20 focus:border-purple-500/50 transition-all placeholder:text-slate-600"
    />
  </div>
);

export default function PostmortemForm() {
  const [pid, setPid] = useState("");
  const [allowed, setAllowed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState({ type: "", content: "" });

  const [form, setForm] = useState({
    pdoctor_id: "",
    external_examination: "",
    internal_examination: "",
    viscera_report: "",
    sexual_assault_findings: "",
    final_opinion: ""
  });

  /* CHECK PATIENT LOGIC (REMAINS SAME) */
  const checkPatient = async () => {
    if (!pid) return;
    setLoading(true);
    try {
      const res = await axios.get(`http://localhost:8000/check-patient/${pid}`);
      if (res.data.exists) {
        setAllowed(true);
        setMsg({ type: "success", content: "Identity verified. Accessing forensic logs..." });
      } else {
        setMsg({ type: "error", content: "Unauthorized: Patient ID not found in registry." });
      }
    } catch {
      setMsg({ type: "error", content: "Infrastructure error. Connection refused." });
    }
    setLoading(false);
  };

  /* SUBMIT LOGIC (REMAINS SAME) */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) return setMsg({ type: "error", content: "Forensic evidence image required." });
    setLoading(true);
    try {
      const imgCid = await uploadToIPFS(file);
      const deathRes = await axios.get(`http://localhost:8000/get-death-hash/${pid}`);
      const deathHash = deathRes.data.death_hash;

      const metadata = {
        examiner_id: form.pdoctor_id,
        findings: {
          external: form.external_examination,
          internal: form.internal_examination,
          toxicology: form.viscera_report,
          assault: form.sexual_assault_findings,
          opinion: form.final_opinion
        },
        media: `https://gateway.pinata.cloud/ipfs/${imgCid}`,
        timestamp: new Date().toISOString()
      };

      const metaCid = await uploadToIPFS(new File([JSON.stringify(metadata)], "pm.json"));

      const res = await axios.post("http://localhost:8000/submit-postmortem", {
        ...form,
        patient_id: pid,
        death_hash: deathHash,
        ipfs_hash: metaCid
      });

      if (res.data.status === "error") {
        setMsg({ type: "error", content: res.data.message });
        setLoading(false);
        return;
      }

      console.log("%c--- POSTMORTEM HASHES ---", "color: #bc13fe; font-weight: bold;");
      console.log("Final Chain Hash:", res.data.final_hash);

      await storeHash(pid, res.data.final_hash);

      setMsg({ type: "success", content: "Autopsy report cryptographically anchored." });
      setAllowed(false);
      setPid("");
    } catch (err) {
      setMsg({ type: "error", content: "Protocol failure. Submission aborted." });
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 flex justify-center items-center p-6 font-sans">
      <div className="w-full max-w-4xl bg-[#111114] border border-white/5 rounded-[2.5rem] shadow-2xl overflow-hidden">
        
        {/* HEADER */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-purple-500/10 to-transparent flex justify-between items-center">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-600 rounded-2xl shadow-lg shadow-purple-600/20 text-white">
              <Activity size={24} />
            </div>
            <div>
              <h2 className="text-white font-black text-xl tracking-tight uppercase">Forensic Lab Unit</h2>
              <p className="text-[10px] text-slate-500 font-bold tracking-widest uppercase opacity-60">Autopsy & Postmortem Registry</p>
            </div>
          </div>
          <div className="hidden md:block text-right">
            <p className="text-[10px] text-slate-500 font-mono italic">Protocol: SHA-256 / IPFS-P2P</p>
            <p className="text-[10px] text-purple-500 font-bold uppercase tracking-tighter">Secure Uplink Active</p>
          </div>
        </div>

        <div className="p-8">
          {/* NOTIFICATION MESSAGES */}
          {msg.content && (
            <div className={`mb-8 p-4 rounded-2xl flex gap-4 items-center border transition-all animate-in fade-in slide-in-from-top-2 ${
              msg.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
              msg.type === "error" ? "bg-red-500/10 border-red-500/20 text-red-400" :
              "bg-purple-500/10 border-purple-500/20 text-purple-400"
            }`}>
              {msg.type === "error" ? <ShieldAlert size={20} /> :
               msg.type === "success" ? <CheckCircle2 size={20} /> :
               <Loader2 size={20} className="animate-spin" />}
              <span className="text-sm font-medium">{msg.content}</span>
            </div>
          )}

          {!allowed ? (
            /* PHASE 1: PATIENT VERIFICATION */
            <div className="max-w-md mx-auto py-12 text-center space-y-8">
              <div className="space-y-2">
                <div className="inline-flex p-4 bg-white/5 rounded-full mb-4">
                  <UserCheck size={32} className="text-slate-400" />
                </div>
                <h3 className="text-xl font-bold text-white">Identity Check</h3>
                <p className="text-sm text-slate-500">Enter the system-generated Patient ID to unlock the forensic form.</p>
              </div>

              <div className="relative group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-purple-500 transition-colors" size={18} />
                <input
                  value={pid}
                  onChange={(e) => setPid(e.target.value)}
                  placeholder="Scan or Type ID"
                  className="w-full pl-12 pr-4 py-4 bg-[#1a1a1e] border border-white/10 rounded-2xl text-white text-center text-lg font-mono tracking-widest outline-none focus:ring-2 ring-purple-500/20 transition-all"
                />
              </div>

              <button
                onClick={checkPatient}
                disabled={loading}
                className="w-full bg-white hover:bg-slate-200 text-black py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="animate-spin" /> : "Verify and Proceed"}
              </button>
            </div>

          ) : (
            /* PHASE 2: FORENSIC FORM */
            <form onSubmit={handleSubmit} className="space-y-8">
              
              {/* Doctor Info Section */}
              <div className="grid md:grid-cols-2 gap-6 items-end">
                 <div className="flex flex-col gap-2">
                   <label className="text-[11px] font-black uppercase tracking-widest text-slate-500 ml-1">Assigned Pathologist ID</label>
                   <div className="relative">
                      <Stethoscope size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
                      <input
                        value={form.pdoctor_id}
                        onChange={(e) => setForm({ ...form, pdoctor_id: e.target.value })}
                        placeholder="DOC-LAB-XXXX"
                        className="w-full bg-[#1a1a1e] border border-white/5 pl-12 pr-4 py-4 rounded-2xl text-white text-sm outline-none focus:border-purple-500/50"
                        required
                      />
                   </div>
                 </div>
                 <div className="bg-purple-500/5 border border-purple-500/10 p-4 rounded-2xl flex items-center gap-3">
                    <ShieldAlert size={16} className="text-purple-500" />
                    <p className="text-[10px] text-slate-400 leading-tight uppercase font-bold">Secure data entry: all entries are cryptographically hashed and cannot be modified.</p>
                 </div>
              </div>

              {/* Grid of Findings */}
              <div className="grid md:grid-cols-2 gap-6">
                <ReportArea 
                  label="External Examination" icon={Eye} 
                  placeholder="Observations of the body surface..." 
                  value={form.external_examination}
                  onChange={(e) => setForm({ ...form, external_examination: e.target.value })}
                />
                <ReportArea 
                  label="Internal Examination" icon={Activity} 
                  placeholder="Detailed findings of internal organs..." 
                  value={form.internal_examination}
                  onChange={(e) => setForm({ ...form, internal_examination: e.target.value })}
                />
                <ReportArea 
                  label="Viscera & Toxicology" icon={FileText} 
                  placeholder="Chemical analysis and lab results..." 
                  value={form.viscera_report}
                  onChange={(e) => setForm({ ...form, viscera_report: e.target.value })}
                />
                <ReportArea 
                  label="Forensic Findings" icon={ShieldAlert} 
                  placeholder="Specific assault or trauma details..." 
                  value={form.sexual_assault_findings}
                  onChange={(e) => setForm({ ...form, sexual_assault_findings: e.target.value })}
                />
              </div>

              {/* Final Opinion (Full Width) */}
              <ReportArea 
                label="Final Medical Opinion" icon={CheckCircle2} 
                placeholder="Concluding cause of death and expert opinion..." 
                value={form.final_opinion}
                onChange={(e) => setForm({ ...form, final_opinion: e.target.value })}
              />

              {/* Evidence Upload */}
              <div className="flex flex-col gap-4 p-6 bg-[#1a1a1e] rounded-3xl border border-dashed border-white/10">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <ImageIcon size={20} className="text-purple-500" />
                    <p className="text-sm font-bold">Forensic Evidence (JPG/PNG)</p>
                  </div>
                  <input
                    type="file"
                    id="file-upload"
                    className="hidden"
                    onChange={(e) => setFile(e.target.files[0])}
                  />
                  <label htmlFor="file-upload" className="cursor-pointer bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors border border-white/5">
                    Choose File
                  </label>
                </div>
                {file && <p className="text-xs text-purple-400 font-mono italic">Attachment: {file.name}</p>}
              </div>

              {/* Action Button */}
              <button
                disabled={loading}
                className="w-full bg-purple-600 hover:bg-purple-700 py-5 rounded-[1.5rem] text-white font-black text-xs uppercase tracking-[0.2em] transition-all shadow-xl shadow-purple-600/20 flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : (
                  <> <Send size={16} /> Finalize Autopsy & Anchor to Chain </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}