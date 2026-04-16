"use client";

import { motion } from "framer-motion";
import { User, Bell, Lock, Shield, Building2, Save } from "lucide-react";

export default function InstituteSettings() {
  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">Institute Settings</h2>
        <p className="text-slate-500 mt-1">Manage your coaching center profile, notifications, and security preferences.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Settings Navigation Sidebar */}
        <div className="md:col-span-1 space-y-1">
          <button className="w-full flex items-center gap-3 px-4 py-3 bg-indigo-50 text-indigo-700 rounded-lg font-medium transition-colors border border-indigo-100">
            <Building2 className="h-5 w-5" />
            General Profile
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Bell className="h-5 w-5" />
            Notifications
          </button>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-lg font-medium transition-colors">
            <Lock className="h-5 w-5" />
            Security
          </button>
        </div>

        {/* Settings Content Area */}
        <div className="md:col-span-2 space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-slate-900">General Profile</h3>
                <p className="text-sm text-slate-500">Update your institute's public details and contact information.</p>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-md border border-emerald-100">
                <Shield className="h-3.5 w-3.5" />
                Verified
              </div>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Institute Name</label>
                  <input type="text" defaultValue="Registered Coaching Center" className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                  <input type="email" defaultValue="admin@institute.edu" className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm bg-slate-50 cursor-not-allowed text-slate-500" readOnly />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Support Phone</label>
                  <input type="tel" defaultValue="+91 9876543210" className="w-full rounded-md border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all" />
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          >
            <div className="p-6 border-b border-slate-100">
              <h3 className="text-lg font-semibold text-slate-900">Communication Preferences</h3>
              <p className="text-sm text-slate-500">Decide how you want to be notified about platform alerts.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">New Student Registrations</p>
                  <p className="text-xs text-slate-500">Receive an email when a new student enrolls in your institute.</p>
                </div>
              </label>
              <label className="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" defaultChecked className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-600" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Compliance & Safety Alerts</p>
                  <p className="text-xs text-slate-500">Critical notifications from District Administration (Cannot be disabled).</p>
                </div>
              </label>
            </div>
          </motion.div>

          <div className="flex justify-end pt-4">
            <button className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 text-white font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm">
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>

        </div>
      </div>
    </div>
  );
}
