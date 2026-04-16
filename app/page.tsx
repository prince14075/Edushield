"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, Building2, Users, AlertTriangle, ArrowRight, Shield } from "lucide-react";
import Link from "next/link";

export default function Home() {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Hide splash screen after 2.5 seconds
    const timer = setTimeout(() => {
      setShowSplash(false);
    }, 2500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <main className="min-h-screen bg-neutral-50 selection:bg-blue-200">
      <AnimatePresence mode="wait">
        {showSplash ? (
          <SplashScreen key="splash" />
        ) : (
          <HomePage key="home" />
        )}
      </AnimatePresence>
    </main>
  );
}

function SplashScreen() {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-blue-600"
    >
      <motion.div
        initial={{ scale: 0.8, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="flex flex-col items-center"
      >
        <div className="relative flex h-32 w-32 items-center justify-center rounded-3xl bg-white text-blue-600 shadow-2xl">
          <ShieldCheck size={72} strokeWidth={1.5} />
          {/* Decorative ping animation */}
          <div className="absolute inset-0 rounded-3xl border-4 border-white opacity-20 animate-ping"></div>
        </div>
        
        <motion.h1 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.5 }}
          className="mt-8 text-4xl font-bold tracking-tight text-white"
        >
          EduSheild
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6, duration: 0.5 }}
          className="mt-3 text-blue-100 font-medium tracking-wide"
        >
          Ministry of Education Compliance Portal
        </motion.p>
      </motion.div>
    </motion.div>
  );
}

function HomePage() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="flex min-h-screen flex-col"
    >
      {/* Navbar */}
      <header className="sticky top-0 z-40 w-full border-b border-neutral-200 bg-white/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-2">
            <Shield className="h-6 w-6 text-blue-600" />
            <span className="text-xl font-bold tracking-tight text-neutral-900">EduSheild</span>
          </div>
          <nav className="hidden gap-6 md:flex items-center">
            <Link href="/directory" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 transition-colors flex items-center gap-1">
              Search by Pincode
            </Link>
            <Link href="/district-admin/dashboard" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
              Admin Area
            </Link>
            <Link href="#features" className="text-sm font-medium text-neutral-600 hover:text-blue-600 transition-colors">Features</Link>
          </nav>
          <div className="flex items-center gap-3">
            <Link 
              href="/login" 
              className="px-4 py-2 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
            >
              Sign In
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-24 pb-32">
          {/* Background decorations */}
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-blue-100 blur-3xl opacity-50"></div>
          <div className="absolute top-48 -left-24 h-72 w-72 rounded-full bg-indigo-100 blur-3xl opacity-50"></div>
          
          <div className="container relative mx-auto px-4 md:px-6 text-center">
            <h1 className="mx-auto max-w-4xl text-5xl font-extrabold tracking-tight text-neutral-900 sm:text-6xl md:text-7xl">
              Ensuring <span className="text-blue-600">Safety & Transparency</span> in Coaching Institutes
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg text-neutral-600 md:text-xl">
              A centralized digital compliance monitoring system aligned with the Ministry of Education guidelines. Register your institute, track capacity, and ensure student safety.
            </p>
            
            <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link 
                href="/admin/register-institute" 
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-blue-600 px-8 font-medium text-white transition-all hover:bg-blue-700 hover:shadow-lg sm:w-auto"
              >
                Register Institute
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link 
                href="/directory" 
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-emerald-600 px-8 font-medium text-white transition-all hover:bg-emerald-700 hover:shadow-lg sm:w-auto"
              >
                Search Institutes by Pincode
              </Link>
              <Link 
                href="/complaint" 
                className="group flex h-12 w-full items-center justify-center gap-2 rounded-full bg-white border border-neutral-200 px-8 font-medium text-neutral-900 transition-all hover:border-neutral-300 hover:bg-neutral-50 shadow-sm sm:w-auto"
              >
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                File a Complaint
              </Link>
            </div>
          </div>
        </section>

        {/* Portals Section */}
        <section className="bg-white py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="mb-12 text-center">
              <h2 className="text-3xl font-bold tracking-tight text-neutral-900 sm:text-4xl">Platform Access</h2>
              <p className="mt-4 text-neutral-600">Select your role to continue to the respective portal.</p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-5xl mx-auto">
              
              {/* Institute Portal */}
              <div className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-blue-200">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                  <Building2 size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-neutral-900">Institute Portal</h3>
                <p className="text-neutral-600 mb-6 font-medium text-sm">
                  Register your coaching center, upload infrastructure AI verifications, and manage student capacity.
                </p>
                <Link href="/login" className="inline-flex items-center text-sm font-semibold text-blue-600 hover:text-blue-700">
                  Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>

              {/* Authority Portal */}
              <div className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-indigo-200">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                  <ShieldCheck size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-neutral-900">Admin Authority</h3>
                <p className="text-neutral-600 mb-6 font-medium text-sm">
                  Monitor all registered institutes, approve registrations, review AI flagged risks, and handle complaints.
                </p>
                <div className="flex flex-col gap-3">
                  <Link href="/login" className="inline-flex items-center text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                    Enter Portal <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                  <div className="pt-3 border-t border-indigo-50 flex flex-col gap-2">
                    <span className="text-xs text-indigo-400 font-semibold uppercase tracking-wider">Direct Testing Links</span>
                    <Link href="/admin/dashboard" className="inline-flex items-center text-xs font-medium text-indigo-500 hover:text-indigo-700 bg-indigo-50/50 px-2 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                      Platform Admin Dashboard
                    </Link>
                    <Link href="/district-admin/dashboard" className="inline-flex items-center text-xs font-medium text-indigo-500 hover:text-indigo-700 bg-indigo-50/50 px-2 py-1.5 rounded-md hover:bg-indigo-100 transition-colors">
                      District Admin Dashboard
                    </Link>
                  </div>
                </div>
              </div>

              {/* Public Portal */}
              <div className="group relative overflow-hidden rounded-3xl border border-neutral-200 bg-white p-8 shadow-sm transition-all hover:shadow-md hover:border-emerald-200 md:col-span-2 lg:col-span-1">
                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                  <Users size={28} />
                </div>
                <h3 className="mb-3 text-xl font-bold text-neutral-900">Students & Parents</h3>
                <p className="text-neutral-600 mb-6 font-medium text-sm">
                  Search for verified institutes, check safety ratings, and securely submit violations or complaints.
                </p>
                <Link href="/directory" className="inline-flex items-center text-sm font-semibold text-emerald-600 hover:text-emerald-700">
                  View Directory <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </div>
              
            </div>
          </div>
        </section>
      </main>

      {/* Basic Footer */}
      <footer className="border-t border-neutral-200 bg-white py-8">
        <div className="container mx-auto px-4 md:px-6 text-center flex flex-col md:flex-row items-center justify-between">
          <p className="text-sm text-neutral-500">© 2026 EduSheild. Enforcing the Ministry of Education Guidelines.</p>
          <div className="flex gap-4 mt-4 md:mt-0">
            <Link href="/privacy" className="text-sm text-neutral-500 hover:text-neutral-900">Privacy Policy</Link>
            <Link href="/terms" className="text-sm text-neutral-500 hover:text-neutral-900">Terms of Service</Link>
          </div>
        </div>
      </footer>
    </motion.div>
  );
}
