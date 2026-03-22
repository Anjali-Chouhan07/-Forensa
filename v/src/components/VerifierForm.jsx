import React, { useState } from "react";
import axios from "axios";
import { getHash } from "../services/blockchain";
import { Search, ShieldCheck, ShieldAlert, Database, Hash, Activity, Loader2, User, Landmark, ClipboardList, Eye, FileText } from "lucide-react";
import CryptoJS from "crypto-js";

const VerifierForm = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); 
  const [backend, setBackend] = useState(null);
  const [trusted, setTrusted] = useState(null);
  const [recalculatedHash, setRecalculatedHash] = useState("");

  const [search, setSearch] = useState({
    patient_id: "",
    full_name: "",
    dob: ""
  });

  const sha = (data) => {
    if (!data) return ""; 
    return CryptoJS.SHA256(data).toString(CryptoJS.enc.Hex);
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);
    setBackend(null);
    setTrusted(null);
    setRecalculatedHash("");

    try {
      const res = await axios.post("https://forensabackend-s6ck.vercel.app/verify-report", search);
      const dbData = res.data?.data || res.data;

      if (!dbData || !dbData.patient_id || res.data.status === "error") {
        setResult("error");
        setLoading(false);
        return;
      }

      const raw = await getHash(search.patient_id.trim());
      let blockchainHash = null;
      let chainData = null;
      try {
        chainData = JSON.parse(raw);
        blockchainHash = chainData.finalHash || chainData.postmortemHash || chainData.reportHash || raw;
      } catch {
        blockchainHash = raw;
      }

      const pid = (dbData.patient_id || "").toString().trim().toLowerCase();
      const fullName = (dbData.full_name || "").toString().trim().toLowerCase();

      const docFieldsInput = 
        (dbData.gender || "") + 
        (dbData.hospital_id || "") + 
        (dbData.doctor_id || "") + 
        (dbData.date_time_of_death || "") + 
        (dbData.cause_of_death || "");
      const docFieldsHash = sha(docFieldsInput);

      const recalcDeathHash = sha(pid + fullName + (dbData.dob || "") + docFieldsHash + (dbData.death_image_cid || ""));
      let finalHashVal = recalcDeathHash;

      if (dbData.postmortem_hash) {
        const pmFieldsInput = 
          (dbData.external_examination || "") + 
          (dbData.internal_examination || "") + 
          (dbData.viscera_report || "") + 
          (dbData.sexual_assault_findings || "") + 
          (dbData.final_opinion || "") + 
          (dbData.pdoctor_id || "");
        
        const pmFieldsHash = sha(pmFieldsInput);
        const recalcPMHash = sha(recalcDeathHash + pmFieldsHash + (dbData.ipfs_cid || ""));
        finalHashVal = sha(recalcDeathHash + recalcPMHash);
      }

      setRecalculatedHash(finalHashVal);
      const isMatch = (finalHashVal === blockchainHash);
      setBackend(dbData);
      
      let trustedData = { rawHash: blockchainHash };
      const originalCid = chainData?.ipfsCid || dbData.ipfs_cid || dbData.death_image_cid;
      
      if (originalCid) {
        try {
          const ipfsRes = await fetch(`https://gateway.pinata.cloud/ipfs/${originalCid}`);
          trustedData.postmortem = await ipfsRes.json();
        } catch (e) { console.log("IPFS Fetch Failed"); }
      }

      setTrusted(trustedData);
      setResult(isMatch ? "valid" : "tampered");

    } catch (err) {
      console.error(err);
      setResult("error");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-slate-300 p-6 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* 🔍 SEARCH FORM */}
        <div className="bg-[#111114] p-8 rounded-3xl mb-8 border border-white/5 shadow-2xl">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-white flex gap-2 items-center tracking-tight">
              <Search size={20} className="text-blue-500"/> Audit Verification System
            </h2>
            {result === "tampered" && (
              <span className="bg-red-500/20 text-red-500 text-[10px] px-3 py-1 rounded-full border border-red-500/50 font-black uppercase tracking-widest animate-pulse">
                Data Compromised
              </span>
            )}
          </div>
          <form onSubmit={handleVerify} className="grid md:grid-cols-4 gap-4">
            <input placeholder="Patient ID" onChange={(e)=>setSearch({...search, patient_id:e.target.value})} className="bg-[#1a1a1e] p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all text-sm" />
            <input placeholder="Full Name" onChange={(e)=>setSearch({...search, full_name:e.target.value})} className="bg-[#1a1a1e] p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all text-sm" />
            <input type="date" onChange={(e)=>setSearch({...search, dob:e.target.value})} className="bg-[#1a1a1e] p-3 rounded-xl border border-white/10 outline-none focus:border-blue-500 transition-all text-sm" />
            <button className="bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all flex items-center justify-center text-sm" disabled={loading}>
              {loading ? <Loader2 className="animate-spin" size={20}/> : "Verify Report"}
            </button>
          </form>
        </div>

        {/* 📊 RESULT RENDERING */}
        {(result === "valid" || result === "tampered") && backend && (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
            
            {/* Status Header */}
            <div className={`p-5 rounded-3xl flex items-center gap-4 border-2 shadow-lg ${
              result === "valid" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500 text-red-500 shadow-red-500/10"
            }`}>
              {result === "valid" ? <ShieldCheck size={40}/> : <ShieldAlert size={40} className="animate-pulse" />}
              <div>
                <h2 className="font-black text-2xl uppercase tracking-tighter">{result === "valid" ? "Authentic Record" : "Tampering Detected"}</h2>
                <p className="text-sm opacity-90 font-medium">
                  {result === "valid" ? "Data integrity verified against blockchain signature." : "Database mismatch! Local data differs from original blockchain audit."}
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 items-start">
              
              {/* 🔴 COLUMN 1: LOCAL DATABASE (CURRENT STATE) */}
              <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${result === "tampered" ? "border-red-500/30 bg-red-500/5" : "border-white/5 bg-[#111114]"}`}>
                <h3 className="text-slate-400 font-bold mb-6 flex items-center gap-2 border-b border-white/5 pb-2 uppercase text-xs tracking-widest">
                  <Database size={16}/> Local Database Data
                </h3>
                
                <div className="space-y-6">
                  {/* Doctor Form Section */}
                  <div className="space-y-3">
                    <p className="text-blue-500 text-[10px] font-black uppercase tracking-widest">Death Certificate Info</p>
                    <div className="grid grid-cols-2 gap-4 text-xs">
                      <div><p className="text-slate-500 mb-1">Full Name</p><p className="font-bold">{backend.full_name}</p></div>
                      <div><p className="text-slate-500 mb-1">Gender</p><p className="font-bold">{backend.gender}</p></div>
                      <div><p className="text-slate-500 mb-1">Hospital ID</p><p className="font-bold flex items-center gap-1"><Landmark size={12}/> {backend.hospital_id}</p></div>
                      <div><p className="text-slate-500 mb-1">Doctor ID</p><p className="font-bold">{backend.doctor_id}</p></div>
                      <div className="col-span-2">
                        <p className="text-slate-500 mb-1">Cause of Death</p>
                        <p className={`font-bold p-2 rounded-lg ${result === "tampered" ? "bg-red-500/20 text-red-400 underline decoration-wavy" : "bg-emerald-500/10 text-emerald-400"}`}>
                          {backend.cause_of_death}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Postmortem Section */}
                  {backend.postmortem_hash && (
                    <div className="space-y-3 pt-4 border-t border-white/5">
                      <p className="text-purple-500 text-[10px] font-black uppercase tracking-widest">Postmortem Findings</p>
                      <div className="grid grid-cols-1 gap-3 text-xs">
                        <div className="bg-white/5 p-3 rounded-xl"><p className="text-slate-500 mb-1 flex items-center gap-1"><Eye size={12}/> External Examination</p><p>{backend.external_examination}</p></div>
                        <div className="bg-white/5 p-3 rounded-xl"><p className="text-slate-500 mb-1 flex items-center gap-1"><FileText size={12}/> Internal Examination</p><p>{backend.internal_examination}</p></div>
                        <div><p className="text-slate-500 mb-1 font-bold">Final Opinion</p><p className="p-2 bg-purple-500/10 rounded-lg text-purple-300 italic">"{backend.final_opinion}"</p></div>
                      </div>
                    </div>
                  )}

                  {/* Hash Summary */}
                  <div className="mt-4 p-4 bg-black/40 rounded-2xl border border-white/5">
                    <p className="text-[10px] text-slate-500 uppercase mb-2 font-black">Generated Verification Hash</p>
                    <p className="text-[10px] font-mono break-all leading-relaxed opacity-60">{recalculatedHash}</p>
                  </div>
                </div>
              </div>

              {/* 🔵 COLUMN 2: BLOCKCHAIN DATA (SOURCE OF TRUTH) */}
              <div className={`p-6 rounded-[2.5rem] border-2 transition-all ${result === "tampered" ? "border-blue-500 bg-blue-600/10 shadow-2xl shadow-blue-500/20" : "border-white/5 bg-[#111114]"}`}>
                <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-2">
                  <h3 className="text-blue-400 font-bold flex items-center gap-2 uppercase text-xs tracking-widest">
                    <ShieldCheck size={16}/> Blockchain Registry
                  </h3>
                  <span className="bg-blue-600 text-white text-[9px] px-2 py-0.5 rounded-full font-black uppercase tracking-tighter">Immutable</span>
                </div>

                {trusted?.postmortem ? (
                  <div className="space-y-6">
                    {/* Immutable Death Info */}
                    <div className="space-y-3">
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Verified Death Info</p>
                      <div className="grid grid-cols-2 gap-4 text-xs">
                        <div><p className="text-slate-500 mb-1">Reported Name</p><p className="font-bold text-blue-200">{trusted.postmortem.full_name || "As Submitted"}</p></div>
                        <div>
                          <p className="text-slate-500 mb-1">Original Cause</p>
                          <p className="font-bold text-blue-400 text-sm">
                            {trusted.postmortem.findings?.opinion || trusted.postmortem.cause_of_death}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Immutable Forensic Info */}
                    <div className="space-y-3 pt-4 border-t border-blue-500/20">
                      <p className="text-blue-400 text-[10px] font-black uppercase tracking-widest">Locked Forensic Metadata</p>
                      <div className="bg-blue-500/5 p-4 rounded-2xl border border-blue-500/20 text-xs leading-relaxed italic text-blue-100/70">
                        "{trusted.postmortem.findings?.external?.substring(0, 100)}..."
                      </div>
                    </div>

                    {/* Original Evidence */}
                    {(trusted.postmortem.media || backend.death_image_cid) && (
                      <div className="mt-4">
                        <p className="text-[10px] text-blue-400 font-black mb-2 uppercase">Original IPFS Evidence</p>
                        <img 
                          src={trusted.postmortem.media || `https://gateway.pinata.cloud/ipfs/${backend.death_image_cid}`} 
                          className="rounded-3xl w-full h-56 object-cover border-2 border-blue-500/30 shadow-xl brightness-110" 
                          alt="Blockchain Record" 
                        />
                      </div>
                    )}

                    {/* Immutable Signature */}
                    <div className="mt-4 p-4 bg-blue-500/10 rounded-2xl border border-blue-500/20">
                      <p className="text-[10px] text-blue-400 uppercase mb-2 font-black">Blockchain Signature (SHA-256)</p>
                      <p className="text-[10px] font-mono break-all opacity-80 text-blue-300 leading-relaxed">{trusted?.rawHash}</p>
                    </div>
                  </div>
                ) : (
                  <div className="h-96 flex flex-col items-center justify-center text-slate-500 italic text-sm">
                    <Loader2 className="animate-spin mb-3 text-blue-500" size={40} />
                    Fetching P2P Record from IPFS...
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* ⚠️ NO RECORD FOUND */}
        {result === "error" && (
          <div className="p-10 bg-yellow-500/5 border-2 border-dashed border-yellow-500/30 rounded-[3rem] text-yellow-500 text-center flex flex-col items-center">
            <ShieldAlert size={50} className="mb-4 opacity-40"/>
            <h3 className="text-xl font-bold uppercase tracking-tight">Record Audit Failed</h3>
            <p className="text-sm opacity-70 mt-2 max-w-sm">The Patient ID provided does not exist in our system or the session has expired.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifierForm;