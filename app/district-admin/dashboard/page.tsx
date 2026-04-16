"use client";

import { useState, useEffect } from "react";
import { CheckCircle2, XCircle, Building2, MapPin, Loader2, ShieldCheck, Phone, Mail } from "lucide-react";
import { motion } from "framer-motion";

export default function DistrictAdminDashboard() {
  const [pending, setPending] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/pending-institutes");
      const data = await res.json();
      if (data.success) {
        setPending(data.data);
      }
    } catch (error) {
      console.error("Failed to fetch pending institutes", error);
    } finally {
      setLoading(false);
    }
  };

  const handleAction = async (id: string, action: "Approve" | "Reject") => {
    if (!confirm(`Are you sure you want to ${action.toUpperCase()} this application?`)) return;
    
    setProcessingId(id);
    try {
      const res = await fetch("/api/admin/pending-institutes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, action })
      });
      const data = await res.json();
      if (data.success) {
        alert(data.message || `Application ${action}d successfully.`);
        fetchPending(); // Refresh list
      } else {
        alert(data.error);
      }
    } catch (error) {
      alert("Failed to process action");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 p-6 pb-12">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-neutral-900 border-l-4 border-indigo-600 pl-3">District Admin Dashboard</h2>
          <p className="text-neutral-500 mt-1 max-w-2xl pl-4">
            Review and officially approve incoming Coaching Institute registrations.
          </p>
        </div>
        <div className="text-right">
          <p className="text-sm font-semibold text-neutral-500 uppercase">Pending Applications</p>
          <p className="text-3xl font-black text-indigo-600">{pending.length}</p>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 text-indigo-600 animate-spin" />
        </div>
      ) : pending.length === 0 ? (
        <div className="bg-white rounded-xl border border-neutral-200 p-12 text-center shadow-sm">
          <CheckCircle2 className="h-12 w-12 text-emerald-500 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-neutral-900">All Caught Up!</h3>
          <p className="text-neutral-500 mt-1">There are no pending institute registrations to review at the moment.</p>
        </div>
      ) : (
        <div className="grid gap-6">
          {pending.map((req) => (
            <motion.div 
              key={req._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl border border-neutral-200 p-6 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex flex-col lg:flex-row justify-between gap-6">
                
                <div className="space-y-4 flex-1">
                  <div className="flex items-center gap-3">
                    <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
                      <Building2 className="h-6 w-6" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-neutral-900">{req.name}</h3>
                      <p className="text-xs font-mono text-neutral-500">{req.instituteId}</p>
                    </div>
                    <span className="ml-auto px-3 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full border border-amber-200">
                      PENDING VERIFICATION
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-neutral-50 p-4 rounded-lg border border-neutral-100">
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Owner Details</h4>
                      <div className="flex items-center gap-3">
                        {req.ownerDetails?.photoUrl && (
                          <img src={req.ownerDetails.photoUrl} alt="Owner" className="w-10 h-10 rounded-full border border-neutral-200 object-cover" />
                        )}
                        <div>
                          <p className="text-sm font-semibold text-neutral-900">{req.ownerDetails?.name}</p>
                          <p className="text-xs text-emerald-600 flex items-center gap-1"><Phone className="h-3 w-3"/> Verified</p>
                          <p className="text-xs text-emerald-600 flex items-center gap-1"><Mail className="h-3 w-3"/> Verified</p>
                        </div>
                      </div>
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase tracking-wider mb-2">Location</h4>
                      <p className="text-sm text-neutral-800 flex items-start gap-2">
                        <MapPin className="h-4 w-4 text-neutral-400 mt-0.5 shrink-0" />
                        <span>
                          {req.address?.street}, {req.address?.areaLocality}<br/>
                          {req.address?.city}, {req.address?.state} - {req.address?.pincode}
                        </span>
                      </p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-white">
                        <span className="text-sm text-neutral-600">Max Capacity</span>
                        <span className="font-bold text-indigo-600">{req.capacity?.maxAllowed} Students</span>
                     </div>
                     <div className="flex items-center justify-between p-3 border border-neutral-200 rounded-lg bg-white">
                        <span className="text-sm text-neutral-600">Undertakings</span>
                        <span className="font-semibold text-emerald-600 flex items-center gap-1"><ShieldCheck className="h-4 w-4"/> Agreed (5/5)</span>
                     </div>
                  </div>

                  <div className="flex gap-3">
                    <a href={req.safetyCertificates[0]?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline hover:text-indigo-800">View Fire Cert</a>
                    <a href={req.safetyCertificates[1]?.url} target="_blank" rel="noreferrer" className="text-xs text-indigo-600 underline hover:text-indigo-800">View Building Cert</a>
                  </div>

                </div>

                <div className="flex lg:flex-col justify-end gap-3 lg:border-l lg:border-neutral-100 lg:pl-6 min-w-[200px]">
                  <button 
                    disabled={processingId === req._id}
                    onClick={() => handleAction(req._id, "Approve")}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-lg shadow-sm transition-colors disabled:opacity-50"
                  >
                    {processingId === req._id ? <Loader2 className="h-5 w-5 animate-spin" /> : <CheckCircle2 className="h-5 w-5" />}
                    Approve Request
                  </button>
                  <button 
                    disabled={processingId === req._id}
                    onClick={() => handleAction(req._id, "Reject")}
                    className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-white border border-red-200 hover:bg-red-50 text-red-600 font-semibold py-3 px-4 rounded-lg transition-colors disabled:opacity-50"
                  >
                    <XCircle className="h-5 w-5" />
                    Reject
                  </button>
                  <p className="hidden lg:block text-xs text-center text-neutral-400 mt-2">
                    Approving will automatically generate and email the secure credentials to the owner.
                  </p>
                </div>

              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
