import React, { useState } from "react";
import axios from "axios";
import { getHash } from "../services/blockchain";
import { Search, ShieldCheck, ShieldAlert, User, Activity, ExternalLink } from "lucide-react";

const VerifierForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [ipfsData, setIpfsData] = useState(null);
  const [backend, setBackend] = useState(null);
  const [search, setSearch] = useState({ patient_id: "", full_name: "", dob: "", check_postmortem: false });

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true); setResult(null); setIpfsData(null);
    try {
      const res = await axios.post("http://localhost:8000/verify-report", search);
      const chainRaw = await getHash(search.patient_id.trim());
      const chainData = JSON.parse(chainRaw);
      
      const bHash = search.check_postmortem ? res.data.postmortem_hash : res.data.death_hash;
      const cHash = search.check_postmortem ? chainData.postmortemHash : chainData.reportHash;

      if (bHash === cHash) {
        setResult("valid"); setBackend(res.data.data);
        if (chainData.ipfsCid) {
           const ipfsRes = await fetch(`https://gateway.pinata.cloud/ipfs/${chainData.ipfsCid}`);
           setIpfsData(await ipfsRes.json());
        }
      } else { setResult("invalid"); }
    } catch { setResult("error"); }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-[#111114] p-8 rounded-3xl border border-white/5 mb-8">
          <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2"><Search size={20} className="text-blue-500"/> Audit Verification</h2>
          <form onSubmit={handleVerify} className="grid md:grid-cols-4 gap-4">
            <input placeholder="Patient ID" onChange={(e)=>setSearch({...search, patient_id: e.target.value})} className="bg-[#1a1a1e] border border-white/10 p-3 rounded-xl" />
            <input placeholder="Full Name" onChange={(e)=>setSearch({...search, full_name: e.target.value})} className="bg-[#1a1a1e] border border-white/10 p-3 rounded-xl" />
            <input type="date" onChange={(e)=>setSearch({...search, dob: e.target.value})} className="bg-[#1a1a1e] border border-white/10 p-3 rounded-xl" />
            <button className="bg-blue-600 text-white font-bold rounded-xl" disabled={loading}>Verify</button>
            <label className="flex items-center gap-2 text-xs md:col-span-4"><input type="checkbox" onChange={(e)=>setSearch({...search, check_postmortem: e.target.checked})}/> Audit Postmortem Forensic Data</label>
          </form>
        </div>

        {result === "valid" && ipfsData && (
          <div className="bg-[#111114] border border-white/5 rounded-3xl overflow-hidden animate-in fade-in duration-700">
            <div className="p-8 bg-gradient-to-r from-slate-900 to-transparent border-b border-white/5">
              <h1 className="text-2xl font-black text-white uppercase tracking-tighter">Forensic Audit Result</h1>
              <p className="text-xs text-emerald-500 font-bold">✓ Blockchain Verified Integrity</p>
            </div>
            <div className="p-8 grid md:grid-cols-2 gap-12">
               <div>
                  <h3 className="text-blue-400 text-[14px] font-bold uppercase mb-4 tracking-widest">Identification</h3>
                  <div className="space-y-2 text-[16px]">
                    <p><span className="text-slate-200">Name:</span> {backend.full_name}</p>
                    <p><span className="text-slate-200">D.O.B:</span> {backend.dob}</p>
                    <p><span className="text-slate-200">Initial Cause:</span> {backend.cause_of_death}</p>
                  </div>
                  {search.check_postmortem && (
                    <div className="mt-8 space-y-4">
                      <h3 className="text-purple-400 text-[14px] font-bold uppercase tracking-widest">Forensic findings</h3>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[14px] text-slate-200 uppercase mb-1">External Examination</p>
                        <p className="text-sm">{ipfsData.findings.external}</p>
                      </div>
                      <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                        <p className="text-[14px] text-slate-200 uppercase mb-1">Final Opinion</p>
                        <p className="text-sm italic">"{ipfsData.findings.opinion}"</p>
                      </div>
                    </div>
                  )}
               </div>
               {search.check_postmortem && (
                 <div>
                    <h3 className="text-blue-400 text-[14px] font-bold uppercase mb-4 tracking-widest">Forensic Evidence</h3>
                    <img src={ipfsData.media} className="w-full rounded-2xl border border-white/5 opacity-80" alt="Evidence" />
                    <p className="mt-4 text-[12px] text-slate-200">Certified by: Dr. {ipfsData.examiner_id}</p>
                 </div>
               )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifierForm;