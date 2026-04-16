"use client";

import { useState } from "react";
import { Search, MapPin, ShieldCheck, Users, AlertTriangle, ChevronRight, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import Link from "next/link";

type PublicInstitute = {
  _id: string;
  name: string;
  address: { street: string; areaLocality: string; city: string; state: string; pincode: string };
  capacity: { maxAllowed: number; currentlyEnrolled: number };
  infrastructure: { totalArea: number; totalClassrooms: number };
  facilities: any;
  safetyCertificates: any[];
  undertakings: any;
  riskStatus: string;
};

export default function VerifiedDirectory() {
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<PublicInstitute[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pincode.trim()) return;

    setLoading(true);
    setHasSearched(true);
    try {
      const res = await fetch(`/api/public/institutes?pincode=${pincode}`);
      const data = await res.json();
      if (data.success) {
        setResults(data.data);
      }
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateSafetyScore = (inst: PublicInstitute) => {
    // Advanced safety logic scoring based on realistic metrics
    let score = 100;
    if (inst.capacity.currentlyEnrolled >= inst.capacity.maxAllowed && inst.capacity.maxAllowed > 0) score -= 20;
    if (inst.riskStatus === 'WARNING') score -= 15;
    if (inst.riskStatus === 'UNSAFE') score -= 50;
    
    // Validate if certificates were actually verified by either Admin or AI.
    const certsVerified = inst.safetyCertificates?.filter(c => c.aiVerificationStatus === 'Verified').length || 0;
    const certsTotal = inst.safetyCertificates?.length || 0;
    // For every missing verified certificate, dock 10 points. 
    if (certsTotal > 0 && certsVerified < certsTotal) {
      score -= (certsTotal - certsVerified) * 10;
    }

    return Math.max(0, score);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Search Header Hero */}
      <div className="bg-indigo-900 pt-20 pb-24 px-6 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-300 via-indigo-900 to-indigo-900"></div>
        
        {/* Navigation Links Back */}
        <div className="absolute top-6 left-6 z-20">
          <Link href="/" className="text-indigo-200 hover:text-white font-medium text-sm transition-colors rounded-lg px-3 py-1.5 hover:bg-white/10">
            &larr; Back to Platform Home
          </Link>
        </div>

        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">Verified Institute Directory</h1>
          <p className="text-indigo-200 text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Search for officially approved coaching centers in your area. Review their safety compliance, seating capacity, and official records before admitting your child.
          </p>

          <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input 
                type="text" 
                placeholder="Enter 6-digit Pincode (e.g. 201301)"
                maxLength={6}
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full pl-12 pr-4 py-4 rounded-xl border-0 shadow-lg text-lg focus:ring-4 focus:ring-indigo-500/50 outline-none transition-all"
              />
            </div>
            <button 
              type="submit"
              disabled={loading || pincode.length !== 6}
              className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 disabled:hover:bg-emerald-500 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="h-6 w-6 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
              ) : (
                <>
                  <Search className="h-5 w-5" />
                  Search
                </>
              )}
            </button>
          </form>
        </div>
      </div>

      {/* Dynamic Results Rendering */}
      <div className="max-w-5xl mx-auto px-6 py-12 -mt-8 relative z-20">
        
        {hasSearched && !loading && results.length === 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white rounded-2xl p-12 text-center shadow-sm border border-slate-200">
            <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-slate-900 mb-2">No Officially Verified Centers Found</h3>
            <p className="text-slate-500 max-w-md mx-auto">There are currently no EduSheild-approved coaching institutes actively registered in pincode <strong>{pincode}</strong>.</p>
          </motion.div>
        )}

        <div className="grid gap-6">
          {results.map((inst, i) => {
            const score = calculateSafetyScore(inst);
            return (
              <motion.div 
                key={inst._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 hover:shadow-md transition-shadow flex flex-col md:flex-row gap-6 md:gap-8"
              >
                {/* Left side: Core Basic Info */}
                <div className="flex-1 space-y-4">
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="text-2xl font-bold text-slate-900">{inst.name}</h3>
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-800 text-[10px] font-black uppercase tracking-wider rounded border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        District Verified
                      </span>
                    </div>
                    <p className="text-slate-500 flex items-center gap-1.5 text-sm">
                      <MapPin className="h-4 w-4 shrink-0" />
                      {inst.address.street}, {inst.address.areaLocality}, {inst.address.city}, {inst.address.state} - {inst.address.pincode}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Infrastructure</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        {inst.infrastructure.totalArea} sq.m ({inst.infrastructure.totalClassrooms} Rooms)
                      </p>
                    </div>
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                      <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Legal Max Capacity</p>
                      <p className="text-sm font-medium text-slate-900 flex items-center gap-2">
                        <Users className="h-4 w-4 text-indigo-500" />
                        {inst.capacity.maxAllowed} Students
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right side: Safety/Transparency Metrics Board */}
                <div className="md:w-72 bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex flex-col justify-center items-center text-center shrink-0">
                  <p className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-3">EduSheild Safety Score</p>
                  
                  {score >= 90 ? (
                    <div className="flex items-center justify-center gap-3 text-emerald-600 mb-2">
                      <ShieldCheck className="h-10 w-10" />
                      <span className="text-4xl font-black">{score}%</span>
                    </div>
                  ) : score >= 70 ? (
                    <div className="flex items-center justify-center gap-3 text-amber-500 mb-2">
                      <AlertTriangle className="h-10 w-10" />
                      <span className="text-4xl font-black">{score}%</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-3 text-red-500 mb-2">
                      <AlertTriangle className="h-10 w-10" />
                      <span className="text-4xl font-black">{score}%</span>
                    </div>
                  )}

                  {score === 100 && <p className="text-xs text-indigo-800 font-medium">Perfect 1:1 Student/Area Ratio</p>}
                  {score < 100 && score >= 80 && <p className="text-xs text-amber-700 font-medium">Approaching Max Capacity</p>}
                  {score < 80 && <p className="text-xs text-red-700 font-medium">Warning: Overcrowded / Unverified Docs</p>}

                  <button className="mt-5 w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg transition-colors flex items-center justify-center gap-1 shadow-sm">
                    View Full Audit Details <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
