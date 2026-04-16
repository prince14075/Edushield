"use client";

import { motion } from "framer-motion";
import { Settings, ShieldAlert, Cpu, Users, Database, Save, CheckCircle } from "lucide-react";

export default function AdminSettings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Platform Configuration</h2>
        <p className="text-slate-500 mt-1">Manage global system parameters and compliance thresholds.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Global Compliance Parameters */}
        <div className="lg:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center gap-3">
              <ShieldAlert className="h-5 w-5 text-red-500" />
              <div>
                <h3 className="text-lg font-semibold text-slate-900">Safety & Compliance Rules</h3>
                <p className="text-sm text-slate-500">Configure automated verification parameters for institute registrations.</p>
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Student Area Ratio (sq.m/student)</label>
                  <div className="flex items-center">
                    <input type="number" defaultValue={1.0} step="0.1" className="w-24 rounded-l-md border border-r-0 border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none" />
                    <span className="bg-slate-50 border border-slate-300 px-3 py-2 rounded-r-md text-sm text-slate-500">sq.m</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-2">Sets the maximum capacity calculation formula.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Strict Age Verification</label>
                  <select className="w-full rounded-md border border-slate-300 px-4 py-2 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none">
                    <option>Enforce Minimum 16 Years</option>
                    <option>Warning Only</option>
                    <option>Disabled</option>
                  </select>
                  <p className="text-xs text-slate-500 mt-2">Auto-reject students under 16.</p>
                </div>
              </div>

              <hr className="border-slate-100" />

              <div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" defaultChecked className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                  <span className="text-sm font-medium text-slate-900">Enable AI-Powered Document OCR (Beta)</span>
                </label>
                <p className="text-xs text-slate-500 mt-1 pl-7">Automatically scan uploaded safety certificates for expiry dates and authenticity markers.</p>
              </div>
            </div>
          </motion.div>

          <div className="flex justify-end pt-2 gap-3">
            <button className="px-5 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
              Reset Defaults
            </button>
            <button className="flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800 transition-colors shadow-sm">
              <Save className="h-4 w-4" />
              Apply Global Changes
            </button>
          </div>
        </div>

        {/* System Status Sidebar */}
        <div className="lg:col-span-1 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
          >
            <h3 className="text-sm font-semibold text-slate-900 uppercase tracking-wider mb-4">Service Integrations</h3>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Cpu className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">SMS Gateway</p>
                    <p className="text-xs text-slate-500">Twilio API (Active)</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-full bg-emerald-100 flex items-center justify-center">
                    <Database className="h-4 w-4 text-emerald-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Cloud Storage</p>
                    <p className="text-xs text-slate-500">Cloudinary (Active)</p>
                  </div>
                </div>
                <CheckCircle className="h-5 w-5 text-emerald-500" />
              </div>
            </div>
          </motion.div>
        </div>

      </div>
    </div>
  );
}
