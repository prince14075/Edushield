"use client";

import { useState } from "react";
import { Copy, Building2, User, KeyRound, CheckCircle2, ArrowRight, ShieldCheck, Upload, X, Eye, Scan } from "lucide-react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function RegisterInstituteForm() {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [generatedId, setGeneratedId] = useState("");
  const [generatedPass, setGeneratedPass] = useState("");
  const [copied, setCopied] = useState(false);
  
  const defaultFormData = {
    name: "",
    ownerDetails: {
      name: "",
      email: "",
      contact: "",
      aadhaarPan: "",
      photoUrl: ""
    },
    address: { street: "", areaLocality: "", city: "", state: "Uttar Pradesh", pincode: "" },
    infrastructure: { totalArea: 0, totalClassrooms: 0, classroomDimensions: "" },
    facilities: { drinkingWater: false, separateToilets: false, cctvInstalled: false, firstAid: false, ventilation: false, emergencyExits: false, facilityPhotos: [] as string[] },
    safetyCertificates: [
      { type: 'Fire', url: 'mock_fire_cert.pdf', aiVerificationStatus: 'Pending', fileName: '' },
      { type: 'Building', url: 'mock_building_cert.pdf', aiVerificationStatus: 'Pending', fileName: '' }
    ],
    undertakings: {
      noUnder16: false,
      noSchoolHours: false,
      graduateTutors: false,
      noMisleadingAds: false,
      oneSqMeterRule: false
    },
    capacity: { maxAllowed: 0 }
  };

  const [formData, setFormData] = useState(defaultFormData);
  const [ownerPhotoPreview, setOwnerPhotoPreview] = useState<string | null>(null);
  const [previewModal, setPreviewModal] = useState<{ isOpen: boolean, url: string, name: string, type: 'image' | 'pdf', uploadCallback?: (url: string, file: File) => void, isOwnerPhoto?: boolean } | null>(null);
  const [ocrStatus, setOcrStatus] = useState<{ [key: string]: { status: 'scanning' | 'verified' | 'failed', text?: string } }>({});

  // OTP Verification States
  const [phoneOTP, setPhoneOTP] = useState("");
  const [emailOTP, setEmailOTP] = useState("");
  const [phoneVerified, setPhoneVerified] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [phoneOTPSent, setPhoneOTPSent] = useState(false);
  const [emailOTPSent, setEmailOTPSent] = useState(false);

  const sendOTP = async (type: "Email" | "Phone", identifier: string) => {
    if (!identifier) return alert(`Please enter your ${type}`);
    
    // Check if it is a gmail address
    if (type === "Email" && !identifier.toLowerCase().endsWith("@gmail.com")) {
      return alert("Only @gmail.com email addresses are allowed.");
    }

    try {
      const res = await fetch("/api/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type === "Email" ? "Email_Verification" : "Phone_Verification", identifier })
      });
      const data = await res.json();
      if (data.success) {
        if (type === "Email") setEmailOTPSent(true);
        else setPhoneOTPSent(true);
        alert(data.message || `OTP sent to ${identifier}`);
      } else alert(data.error);
    } catch { alert("Failed to send OTP"); }
  };

  const verifyOTP = async (type: "Email" | "Phone", identifier: string, code: string) => {
    if (!code) return alert("Please enter the OTP");
    try {
      const res = await fetch("/api/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type: type === "Email" ? "Email_Verification" : "Phone_Verification", identifier, code })
      });
      const data = await res.json();
      if (data.success) {
        if (type === "Email") setEmailVerified(true);
        else setPhoneVerified(true);
      } else alert(data.error);
    } catch { alert("Failed to verify OTP"); }
  };

  const handlePincodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (!/^\d*$/.test(value)) return;
    
    // Immediately update the pincode strictly
    setFormData(prev => ({
      ...prev,
      address: { ...prev.address, pincode: value }
    }));

    if (value.length === 6) {
      try {
        const res = await fetch(`/api/pincode/${value}`);
        const result = await res.json();
        
        if (result.success && result.data) {
          const postOffice = result.data;
          
          setFormData(prev => ({
            ...prev,
            address: {
              ...prev.address,
              pincode: value,
              areaLocality: postOffice.Name || "",
              city: postOffice.District || postOffice.Block || postOffice.Region || "",
              state: postOffice.State || "Uttar Pradesh"
            }
          }));
        } else {
          console.log("Pincode API failed", result.error);
        }
      } catch (error) {
        console.error("API Fetch Error:", error);
      }
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, callback: (url: string, file: File) => void, isOwnerPhoto = false) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Step 2: Show preview immediately
      if (isOwnerPhoto) {
        setOwnerPhotoPreview(URL.createObjectURL(file));
      }

      // Step 3: Upload
      const form = new FormData();
      form.append("file", file);
      try {
        const res = await fetch("/api/upload", { method: "POST", body: form });
        const data = await res.json();
        if (data.success) {
          callback(data.url, file);
          setPreviewModal({
            isOpen: true,
            url: data.url,
            name: file.name,
            type: file.type.startsWith('image/') || isOwnerPhoto ? 'image' : 'pdf',
            uploadCallback: callback,
            isOwnerPhoto: isOwnerPhoto
          });

          // Kick off OCR
          if (file.type === 'application/pdf' || isOwnerPhoto) {
            const ocrKey = isOwnerPhoto ? 'ownerPhoto' : file.name;
            setOcrStatus(prev => ({ ...prev, [ocrKey]: { status: 'scanning' } }));

            const ocrForm = new FormData();
            ocrForm.append("file", file);
            try {
              const ocrRes = await fetch("/api/ocr", { method: "POST", body: ocrForm });
              const ocrData = await ocrRes.json();
              if (ocrData.success) {
                setOcrStatus(prev => ({ ...prev, [ocrKey]: { status: 'verified', text: ocrData.text } }));
              } else {
                setOcrStatus(prev => ({ ...prev, [ocrKey]: { status: 'failed' } }));
              }
            } catch {
              setOcrStatus(prev => ({ ...prev, [ocrKey]: { status: 'failed' } }));
            }
          }
        }
      } catch (err) {
        alert("Upload failed");
      }
    }
  };

  const handleAreaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const area = Number(e.target.value) || 0;
    setFormData(prev => ({
      ...prev,
      infrastructure: { ...prev.infrastructure, totalArea: area },
      capacity: { maxAllowed: area } // 1 sq.m per student rule
    }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneVerified || !emailVerified) {
      alert("Please verify both Email and Contact Number via OTP before registering.");
      return;
    }

    const allUndertakingsChecked = Object.values(formData.undertakings).every(v => v === true);
    if (!allUndertakingsChecked) {
      alert("All undertakings must be agreed to before registration.");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('/api/institutes/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        setGeneratedId(data.data.instituteId);
        setSuccess(true);
      } else {
        alert(data.error || 'Failed to register institute');
      }
    } catch (error) {
      console.error('Registration failed:', error);
      alert('An error occurred during registration. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const copyCredentials = () => {
    navigator.clipboard.writeText(`Institute ID: ${generatedId}\nPassword: ${generatedPass}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const mockUpload = (field: string) => {
    alert(`Mock Upload triggered for ${field}. In production, this uploads to secure storage.`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-12">
      
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-neutral-900">Registration of Coaching Institute</h2>
        <p className="text-neutral-500 mt-1 max-w-2xl">
          Complete this detailed registration form in accordance with the 2024 Ministry Guidelines. All fields are mandatory.
        </p>
      </div>

      {!success ? (
        <motion.div 
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-neutral-200 bg-white p-8 shadow-sm"
        >
          <form onSubmit={handleRegister} className="space-y-6">
            
            <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-neutral-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-neutral-400" />
                  Institute Display Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    placeholder="Enter Institute Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-neutral-500">As per new guidelines, names are anonymized publicly.</p>
                </div>
              </div>

              <div className="sm:col-span-2">
                <hr className="border-neutral-100 my-2" />
                <h3 className="text-sm font-semibold text-neutral-900 mt-4 mb-2">Owner / Point of Contact Details</h3>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900 flex items-center gap-2">
                  <User className="h-4 w-4 text-neutral-400" />
                  Full Name
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.ownerDetails.name}
                    onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, name: e.target.value}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900">
                  Aadhaar Card Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    maxLength={12}
                    pattern="[0-9]{12}"
                    value={formData.ownerDetails.aadhaarPan}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                      setFormData({...formData, ownerDetails: {...formData.ownerDetails, aadhaarPan: val}});
                    }}
                    placeholder="12-digit Aadhaar number"
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm"
                  />
                  <p className="mt-1 text-xs text-neutral-500">
                    Enter exactly 12 digits ({formData.ownerDetails.aadhaarPan.length}/12)
                  </p>
                </div>
              </div>

              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium leading-6 text-neutral-900">
                    Contact Number
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="tel"
                      required
                      disabled={phoneVerified}
                      pattern="[0-9]{10}"
                      maxLength={10}
                      value={formData.ownerDetails.contact}
                      onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, contact: e.target.value}})}
                      className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
                    />
                    {!phoneVerified && (
                      <button type="button" onClick={() => sendOTP("Phone", formData.ownerDetails.contact)} className="whitespace-nowrap rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200">
                        {phoneOTPSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    )}
                  </div>
                  {phoneOTPSent && !phoneVerified && (
                    <div className="mt-2 flex gap-2">
                      <input type="text" placeholder="Enter OTP" maxLength={6} value={phoneOTP} onChange={(e) => setPhoneOTP(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-sm ring-1 ring-inset ring-neutral-300" />
                      <button type="button" onClick={() => verifyOTP("Phone", formData.ownerDetails.contact, phoneOTP)} className="whitespace-nowrap rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Verify</button>
                    </div>
                  )}
                  {phoneVerified && <p className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Number Verified</p>}
                </div>

                <div>
                  <label className="block text-sm font-medium leading-6 text-neutral-900">
                    Official Email Address
                  </label>
                  <div className="mt-2 flex gap-2">
                    <input
                      type="email"
                      required
                      disabled={emailVerified}
                      value={formData.ownerDetails.email}
                      onChange={(e) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, email: e.target.value}})}
                      className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm disabled:bg-neutral-100 disabled:text-neutral-500"
                    />
                    {!emailVerified && (
                      <button type="button" onClick={() => sendOTP("Email", formData.ownerDetails.email)} className="whitespace-nowrap rounded-md bg-neutral-100 px-3 py-2 text-sm font-medium text-neutral-700 hover:bg-neutral-200">
                        {emailOTPSent ? "Resend OTP" : "Send OTP"}
                      </button>
                    )}
                  </div>
                  {emailOTPSent && !emailVerified && (
                    <div className="mt-2 flex gap-2">
                      <input type="text" placeholder="Enter OTP" maxLength={6} value={emailOTP} onChange={(e) => setEmailOTP(e.target.value)} className="block w-full rounded-md border-0 py-1.5 px-3 text-sm ring-1 ring-inset ring-neutral-300" />
                      <button type="button" onClick={() => verifyOTP("Email", formData.ownerDetails.email, emailOTP)} className="whitespace-nowrap rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-indigo-500">Verify</button>
                    </div>
                  )}
                  {emailVerified && <p className="mt-1 text-sm font-medium text-emerald-600 flex items-center gap-1"><CheckCircle2 className="h-4 w-4"/> Email Verified</p>}
                </div>
              </div>

              <div className="sm:col-span-2 flex items-center justify-between p-4 border border-dashed border-neutral-300 rounded-lg">
                <div className="flex items-center gap-4">
                  {ownerPhotoPreview && (
                    <button type="button" onClick={() => setPreviewModal({ isOpen: true, url: formData.ownerDetails.photoUrl || ownerPhotoPreview, name: 'Owner Photo', type: 'image', isOwnerPhoto: true, uploadCallback: (url) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, photoUrl: url}}) })} className="h-12 w-12 rounded-full overflow-hidden border border-neutral-200 shrink-0 cursor-pointer hover:ring-2 hover:ring-indigo-500 transition-all">
                      <img src={ownerPhotoPreview} alt="Owner Preview" className="h-full w-full object-cover" />
                    </button>
                  )}
                  <div>
                    <h4 className="text-sm font-medium text-neutral-900">Owner Passport Photo</h4>
                    <p className="text-xs text-neutral-500 mt-1">Clear recent photograph max 2MB</p>
                    {ocrStatus['ownerPhoto']?.status === 'scanning' && <p className="text-xs text-indigo-600 mt-1.5 flex items-center gap-1 animate-pulse"><Scan className="h-3 w-3" /> AI Scanning...</p>}
                    {ocrStatus['ownerPhoto']?.status === 'verified' && <p className="text-xs text-emerald-600 mt-1.5 flex items-center gap-1"><ShieldCheck className="h-3 w-3" /> AI Verified</p>}
                  </div>
                </div>
                <label className="cursor-pointer px-4 py-2 bg-neutral-100 text-sm font-medium rounded-md hover:bg-neutral-200">
                  <span>{formData.ownerDetails.photoUrl && formData.ownerDetails.photoUrl.startsWith('http') ? "Change Image" : formData.ownerDetails.photoUrl ? "Change Image" : "Upload Image"}</span>
                  <input type="file" accept="image/*" className="hidden" onChange={(e) => 
                    handleFileUpload(e, (url) => setFormData({...formData, ownerDetails: {...formData.ownerDetails, photoUrl: url}}), true)
                  } />
                </label>
              </div>

              <div className="sm:col-span-2">
                <hr className="border-neutral-100 my-2" />
                <h3 className="text-sm font-semibold text-neutral-900 mt-4 mb-2">Location & Address</h3>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-neutral-900">Street Address</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.address.street}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, street: e.target.value}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-neutral-900">Area / Locality</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.address.areaLocality}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, areaLocality: e.target.value}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900">Pincode (Auto-fills City & State)</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    pattern="[0-9]{6}"
                    maxLength={6}
                    value={formData.address.pincode}
                    onChange={handlePincodeChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900">City / District</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.address.city}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, city: e.target.value}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium leading-6 text-neutral-900">State</label>
                <div className="mt-2">
                  <input
                    type="text"
                    required
                    value={formData.address.state}
                    onChange={(e) => setFormData({...formData, address: {...formData.address, state: e.target.value}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2">
                <hr className="border-neutral-100 my-2" />
                <h3 className="text-sm font-semibold text-neutral-900 mt-4 mb-2">Infrastructure & Capacity</h3>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900">Number of Classrooms</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.infrastructure.totalClassrooms}
                    onChange={(e) => setFormData({...formData, infrastructure: {...formData.infrastructure, totalClassrooms: Number(e.target.value)}})}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium leading-6 text-neutral-900">Total Classroom Area (sq.m)</label>
                <div className="mt-2">
                  <input
                    type="number"
                    min="1"
                    required
                    value={formData.infrastructure.totalArea}
                    onChange={handleAreaChange}
                    className="block w-full rounded-md border-0 py-2 px-3 text-neutral-900 shadow-sm ring-1 ring-inset ring-neutral-300 sm:text-sm"
                  />
                </div>
              </div>

              <div className="sm:col-span-2 bg-indigo-50 border border-indigo-100 rounded-lg p-4 flex justify-between items-center">
                <div>
                  <h4 className="text-sm font-bold text-indigo-900">Auto-Calculated Approved Max Capacity</h4>
                  <p className="text-xs text-indigo-700">Calculated strictly as Area (sq.m) ÷ 1</p>
                </div>
                <div className="text-3xl font-black text-indigo-600 px-4 py-2 bg-white rounded-lg shadow-sm">
                  {formData.capacity.maxAllowed}
                </div>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Mandatory Certificate Uploads</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Fire Safety Certificate (PDF)</span>
                      {ocrStatus[formData.safetyCertificates[0].fileName]?.status === 'scanning' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-500 animate-pulse"><Scan className="h-3 w-3" /> Scanning</span>
                      ) : ocrStatus[formData.safetyCertificates[0].fileName]?.status === 'verified' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><ShieldCheck className="h-3 w-3" /> AI Verified</span>
                      ) : (
                        <Upload className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                    {formData.safetyCertificates[0].url && !formData.safetyCertificates[0].url.startsWith('mock_') ? (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                        <button type="button" onClick={() => setPreviewModal({ isOpen: true, url: formData.safetyCertificates[0].url, name: formData.safetyCertificates[0].fileName || 'Fire Safety Certificate', type: 'pdf', uploadCallback: (url, file) => { const updated = [...formData.safetyCertificates]; updated[0].url = url; updated[0].fileName = file.name; setFormData({...formData, safetyCertificates: updated}); } })} className="text-xs text-indigo-600 hover:underline truncate max-w-[150px] flex items-center gap-1 text-left">
                          <Eye className="h-3 w-3 shrink-0" /> {formData.safetyCertificates[0].fileName || 'Uploaded File'}
                        </button>
                        <label className="cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          Change File
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, (url, file) => {
                              const updated = [...formData.safetyCertificates];
                              updated[0].url = url;
                              updated[0].fileName = file.name;
                              setFormData({...formData, safetyCertificates: updated});
                          })}/>
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full mt-2 text-center text-xs font-medium bg-white border border-neutral-200 py-1.5 rounded hover:bg-neutral-50 transition-colors">
                        Upload File
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, (url, file) => {
                            const updated = [...formData.safetyCertificates];
                            updated[0].url = url;
                            updated[0].fileName = file.name;
                            setFormData({...formData, safetyCertificates: updated});
                        })}/>
                      </label>
                    )}
                  </div>
                  
                  <div className="p-4 border border-dashed border-neutral-300 rounded-lg bg-neutral-50 flex flex-col gap-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-neutral-700">Building Safety Certificate (PDF)</span>
                      {ocrStatus[formData.safetyCertificates[1].fileName]?.status === 'scanning' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-indigo-500 animate-pulse"><Scan className="h-3 w-3" /> Scanning</span>
                      ) : ocrStatus[formData.safetyCertificates[1].fileName]?.status === 'verified' ? (
                        <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600"><ShieldCheck className="h-3 w-3" /> AI Verified</span>
                      ) : (
                        <Upload className="h-4 w-4 text-neutral-500" />
                      )}
                    </div>
                    {formData.safetyCertificates[1].url && !formData.safetyCertificates[1].url.startsWith('mock_') ? (
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-neutral-200">
                        <button type="button" onClick={() => setPreviewModal({ isOpen: true, url: formData.safetyCertificates[1].url, name: formData.safetyCertificates[1].fileName || 'Building Safety Certificate', type: 'pdf', uploadCallback: (url, file) => { const updated = [...formData.safetyCertificates]; updated[1].url = url; updated[1].fileName = file.name; setFormData({...formData, safetyCertificates: updated}); } })} className="text-xs text-indigo-600 hover:underline truncate max-w-[150px] flex items-center gap-1 text-left">
                          <Eye className="h-3 w-3 shrink-0" /> {formData.safetyCertificates[1].fileName || 'Uploaded File'}
                        </button>
                        <label className="cursor-pointer text-xs font-medium text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded">
                          Change File
                          <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, (url, file) => {
                              const updated = [...formData.safetyCertificates];
                              updated[1].url = url;
                              updated[1].fileName = file.name;
                              setFormData({...formData, safetyCertificates: updated});
                          })}/>
                        </label>
                      </div>
                    ) : (
                      <label className="cursor-pointer w-full mt-2 text-center text-xs font-medium bg-white border border-neutral-200 py-1.5 rounded hover:bg-neutral-50 transition-colors">
                        Upload File
                        <input type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFileUpload(e, (url, file) => {
                            const updated = [...formData.safetyCertificates];
                            updated[1].url = url;
                            updated[1].fileName = file.name;
                            setFormData({...formData, safetyCertificates: updated});
                        })}/>
                      </label>
                    )}
                  </div>
                </div>
              </div>

              <div className="sm:col-span-2">
                <h3 className="text-sm font-semibold text-neutral-900 mb-4">Mandatory Facilities</h3>
                <div className="flex flex-col gap-4 border border-neutral-200 rounded-lg p-5 bg-white">
                  <div className="grid grid-cols-2 gap-4">
                    {['First Aid', 'CCTV', 'Ventilation', 'Separate Toilets', 'Emergency Exits'].map((facility, i) => {
                      const keys = ['firstAid', 'cctvInstalled', 'ventilation', 'separateToilets', 'emergencyExits'] as const;
                      const key = keys[i];
                      return (
                        <div key={key} className="flex items-center justify-between">
                          <label className="flex items-center gap-3 text-sm text-neutral-700 cursor-pointer">
                            <input
                              type="checkbox"
                              className="h-4 w-4 rounded border-neutral-300 text-indigo-600 focus:ring-indigo-600"
                              checked={formData.facilities[key]}
                              onChange={(e) => setFormData({...formData, facilities: {...formData.facilities, [key]: e.target.checked}})}
                            />
                            {facility} Required
                          </label>
                          <label className="cursor-pointer text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors border border-indigo-100">
                            + Add Photo
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => handleFileUpload(e, (url) => {
                              setFormData({...formData, facilities: {...formData.facilities, facilityPhotos: [...formData.facilities.facilityPhotos, url]}});
                            })}/>
                          </label>
                        </div>
                      );
                    })}
                  </div>
                  {formData.facilities.facilityPhotos.length > 0 && (
                    <div className="mt-4 pt-4 border-t border-neutral-200">
                      <h4 className="text-xs font-semibold text-neutral-500 uppercase mb-3">Uploaded Facility Photos</h4>
                      <div className="flex flex-wrap gap-3">
                        {formData.facilities.facilityPhotos.map((url, index) => (
                          <div key={index} className="relative group w-20 h-20 rounded-md border border-neutral-200 overflow-hidden bg-neutral-50 shrink-0">
                            <img src={url} alt={`Facility photo ${index + 1}`} className="w-full h-full object-cover cursor-pointer hover:opacity-80 transition-opacity" onClick={() => setPreviewModal({ isOpen: true, url, name: `Facility Photo ${index + 1}`, type: 'image', uploadCallback: (newUrl) => { const updated = [...formData.facilities.facilityPhotos]; updated[index] = newUrl; setFormData({...formData, facilities: {...formData.facilities, facilityPhotos: updated}}); } })} />
                            <button 
                              type="button" 
                              onClick={(e) => {
                                e.stopPropagation();
                                const updated = [...formData.facilities.facilityPhotos];
                                updated.splice(index, 1);
                                setFormData({...formData, facilities: {...formData.facilities, facilityPhotos: updated}});
                              }}
                              className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded font-medium shadow-sm border border-red-400">Remove</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="sm:col-span-2">
                <hr className="border-neutral-100 my-2" />
                <h3 className="text-sm font-semibold text-red-700 mt-4 mb-2 flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5" />
                  Statutory Undertakings
                </h3>
                <div className="space-y-4 bg-red-50/50 p-5 rounded-lg border border-red-100">
                  <label className="flex items-start gap-3 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" required className="mt-1 h-4 w-4" checked={formData.undertakings.noUnder16} onChange={(e) => setFormData({...formData, undertakings: {...formData.undertakings, noUnder16: e.target.checked}})} />
                    I undertake that the institute will NOT enroll any student below 16 years of age.
                  </label>
                  <label className="flex items-start gap-3 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" required className="mt-1 h-4 w-4" checked={formData.undertakings.noSchoolHours} onChange={(e) => setFormData({...formData, undertakings: {...formData.undertakings, noSchoolHours: e.target.checked}})} />
                    I undertake that classes will NOT be conducted during regular school hours.
                  </label>
                  <label className="flex items-start gap-3 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" required className="mt-1 h-4 w-4" checked={formData.undertakings.graduateTutors} onChange={(e) => setFormData({...formData, undertakings: {...formData.undertakings, graduateTutors: e.target.checked}})} />
                    I undertake that all tutors hold a minimum of a graduation degree.
                  </label>
                  <label className="flex items-start gap-3 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" required className="mt-1 h-4 w-4" checked={formData.undertakings.noMisleadingAds} onChange={(e) => setFormData({...formData, undertakings: {...formData.undertakings, noMisleadingAds: e.target.checked}})} />
                    I undertake that the institute will not publish misleading advertisements.
                  </label>
                  <label className="flex items-start gap-3 text-sm text-neutral-800 cursor-pointer">
                    <input type="checkbox" required className="mt-1 h-4 w-4" checked={formData.undertakings.oneSqMeterRule} onChange={(e) => setFormData({...formData, undertakings: {...formData.undertakings, oneSqMeterRule: e.target.checked}})} />
                    I undertake to strictly follow the minimum 1 sq.m per student per classroom rule.
                  </label>
                </div>
              </div>

            </div>

            <div className="mt-8 pt-6 border-t border-neutral-100 flex items-center justify-end gap-x-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full sm:w-auto rounded-md bg-indigo-600 px-8 py-3 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-70 flex justify-center items-center gap-2 transition-all"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin"></div>
                    Processing Protocol...
                  </>
                ) : (
                  <>
                    <KeyRound className="h-4 w-4" />
                    Submit Formal Registration
                  </>
                )}
              </button>
            </div>
            
          </form>
        </motion.div>

      ) : (

        // SUCCESS STATE (Pending Approval)
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="rounded-xl border border-indigo-200 bg-white p-8 shadow-sm text-center max-w-2xl mx-auto mt-12"
        >
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 mb-6">
            <CheckCircle2 className="h-8 w-8 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-neutral-900 mb-2">Application Submitted Successfully</h3>
          <p className="text-neutral-600 mb-8 px-4">
            Your application is now <strong className="text-amber-600">Pending Approval</strong> by the District Education Officer. 
            Once approved, your secure Login ID and Password will be actively dispatched to your verified Email and Mobile Number.
          </p>

          <div className="bg-neutral-50 rounded-xl p-6 border border-neutral-200 mb-8 text-center relative overflow-hidden">
            <div className="space-y-2 relative z-0">
              <p className="text-xs font-semibold uppercase text-neutral-500 tracking-wider mb-1">Application Reference ID</p>
              <p className="text-2xl font-mono font-bold text-neutral-900 bg-white inline-block px-3 py-1 rounded border border-neutral-200 select-all">{generatedId}</p>
            </div>
            <p className="text-xs text-neutral-400 mt-4">Save this reference ID to track your application status.</p>
          </div>

          <div className="flex gap-4 justify-center">
            <button 
              onClick={() => {
                setSuccess(false);
                setFormData(defaultFormData);
                setOwnerPhotoPreview(null);
                setPhoneOTP(""); setEmailOTP("");
                setPhoneVerified(false); setEmailVerified(false);
                setPhoneOTPSent(false); setEmailOTPSent(false);
              }}
              className="text-sm font-semibold text-indigo-600 hover:text-indigo-700 bg-indigo-50 px-6 py-2.5 rounded-lg transition-colors"
            >
              Submit Another Application
            </button>
            <Link 
              href="/"
              className="flex items-center gap-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 px-6 py-2.5 rounded-lg transition-colors"
            >
              Back to Home <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </motion.div>
      )}

      {/* Document Preview Modal */}
      {previewModal && previewModal.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-xl shadow-2xl overflow-hidden w-full max-w-4xl max-h-[90vh] flex flex-col"
          >
            <div className="flex items-center justify-between px-6 py-4 border-b border-neutral-200 bg-neutral-50 shrink-0">
              <h3 className="text-lg font-semibold text-neutral-900 truncate pr-4">{previewModal.name}</h3>
              <button type="button" onClick={() => setPreviewModal(null)} className="p-1 rounded-md text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex-1 overflow-auto p-6 bg-neutral-100 flex items-center justify-center min-h-[50vh]">
              {previewModal.type === 'pdf' ? (
                <iframe src={previewModal.url} className="w-full h-full min-h-[60vh] rounded border border-neutral-300 bg-white" title={previewModal.name} />
              ) : (
                <img src={previewModal.url} alt={previewModal.name} className="max-w-full max-h-[70vh] object-contain rounded shadow-sm" />
              )}
            </div>

            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-neutral-200 bg-white shrink-0">
              <button type="button" onClick={() => setPreviewModal(null)} className="px-5 py-2 text-sm font-medium text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-md transition-colors">
                Looks Good
              </button>
              {previewModal.uploadCallback && (
                <label className="cursor-pointer px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-colors shadow-sm flex items-center gap-2">
                  <Upload className="h-4 w-4" />
                  Change Document
                  <input type="file" accept={previewModal.type === 'pdf' ? "application/pdf" : "image/*"} className="hidden" onChange={(e) => {
                    if (previewModal.uploadCallback) {
                      handleFileUpload(e, previewModal.uploadCallback, previewModal.isOwnerPhoto);
                      setPreviewModal(null);
                    }
                  }} />
                </label>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}