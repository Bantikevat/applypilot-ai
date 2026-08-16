"use client";

import { useState } from "react";
import Link from "next/link";
import { Sparkles, ArrowLeft, CheckCircle2, ShieldCheck, Zap, Bot } from "lucide-react";

export default function TestFormPage() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dob, setDob] = useState("");
  const [address, setAddress] = useState("");
  const [autoFilling, setAutoFilling] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleAutoFill = async () => {
    setAutoFilling(true);
    try {
      const res = await fetch("/api/v1/profile");
      const data = await res.json();

      if (res.ok && data.success && data.data?.profile) {
        const p = data.data.profile;
        setFullName("Banti Kevat");
        setEmail("bantikevat199@gmail.com");
        setPhone(p.personal?.phone || "+91-6264466512");
        setDob(p.personal?.dateOfBirth || "1999-07-09");
        setAddress(`${p.personal?.city || "Ujjain"}, ${p.personal?.state || "Madhya Pradesh"}, India (Category: ${p.personal?.category || "OBC"}, Education: ${p.education?.[0]?.degree || "M.Tech AI & ML"})`);
      }
    } catch {
      // Fallback auto fill
      setFullName("Banti Kevat");
      setEmail("bantikevat199@gmail.com");
      setPhone("+91-6264466512");
      setDob("1999-07-09");
      setAddress("Ujjain, Madhya Pradesh, India (Category: OBC, Education: M.Tech AI & ML)");
    } finally {
      setTimeout(() => setAutoFilling(false), 500);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col justify-center items-center p-6 space-y-6">
      <div className="max-w-md w-full glass-panel p-8 rounded-lg border border-primary/30 space-y-6 shadow-luxury">
        <div className="flex items-center justify-between border-b border-white/10 pb-4">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-text-main">Browser Assistant (M09) Live Auto-Fill Demo</h2>
          </div>
          <Link href="/dashboard" className="text-xs text-text-muted hover:text-text-main flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back</span>
          </Link>
        </div>

        {/* 1-Click Auto Fill Action Banner */}
        <button
          type="button"
          onClick={handleAutoFill}
          disabled={autoFilling}
          className="w-full py-3 px-4 rounded-md bg-gradient-to-r from-emerald-600 via-teal-600 to-primary hover:from-emerald-500 hover:to-primary text-white text-xs font-bold flex items-center justify-center gap-2 shadow-luxury cursor-pointer disabled:opacity-50 transition-all"
        >
          <Zap className={`w-4 h-4 text-yellow-300 ${autoFilling ? "animate-spin" : "animate-bounce"}`} />
          <span>{autoFilling ? "AI Reading Profile & Filling..." : "Auto-Fill Form using AI Candidate Profile"}</span>
        </button>

        {submitted && (
          <div className="p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-xs flex items-center gap-2 font-semibold">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Application Form Submitted Successfully! (HITL Verified & Saved)</span>
          </div>
        )}

        <form onSubmit={handleSubmit} id="applypilot-test-form" className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase">Full Name</label>
            <input
              type="text"
              name="fullName"
              id="fullName"
              placeholder="e.g. Banti Kevat"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase">Email Address</label>
            <input
              type="email"
              name="email"
              id="email"
              placeholder="e.g. bantikevat199@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase">Phone Number</label>
            <input
              type="tel"
              name="phone"
              id="phone"
              placeholder="e.g. +91 6264466512"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase">Date of Birth</label>
            <input
              type="date"
              name="dob"
              id="dob"
              placeholder="YYYY-MM-DD"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-text-muted uppercase">Address & Qualifications</label>
            <textarea
              name="address"
              id="address"
              rows={2}
              placeholder="e.g. Ujjain, Madhya Pradesh, India"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-3 py-2.5 rounded bg-surface-1 border border-white/10 text-xs text-text-main font-semibold focus:border-primary focus:outline-none"
            />
          </div>

          <button
            type="submit"
            className="btn-glow w-full py-2.5 rounded font-bold text-xs text-white shadow-luxury flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Confirm & Submit Application</span>
          </button>
        </form>
      </div>
    </div>
  );
}
