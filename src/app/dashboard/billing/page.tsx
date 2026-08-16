"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  CreditCard,
  Zap,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Check,
  Download,
  Star,
  FileText,
} from "lucide-react";

interface Subscription {
  tier: "FREE_STARTER" | "PRO_JOBSEEKER" | "ENTERPRISE_AI";
  status: string;
  autoAppliesLimit: number;
  autoAppliesUsed: number;
  aiMatchesLimit: number;
  aiMatchesUsed: number;
  vaultStorageLimitMb: number;
  vaultStorageUsedMb: number;
  currentPeriodEnd: string;
}

interface Invoice {
  invoiceId: string;
  tier: string;
  amountInr: number;
  status: string;
  paidAt: string;
}

export default function BillingPage() {
  const [sub, setSub] = useState<Subscription | null>(null);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [upgrading, setUpgrading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchBillingData();
  }, []);

  const fetchBillingData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [sRes, iRes] = await Promise.all([
        fetch("/api/v1/billing/subscription"),
        fetch("/api/v1/billing/invoices"),
      ]);

      const sData = await sRes.json();
      const iData = await iRes.json();

      if (sRes.ok && sData.success) {
        setSub(sData.data.subscription);
      }
      if (iRes.ok && iData.success) {
        setInvoices(iData.data.invoices);
      }
    } catch {
      setErrorMsg("Failed to load SaaS billing data.");
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeTier = async (targetTier: string) => {
    setUpgrading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/billing/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetTier }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSub(data.data.subscription);
        setSuccessMsg(data.message || `Upgraded to ${targetTier} plan successfully!`);
        fetchBillingData();
      } else {
        setErrorMsg(data.error?.message || "Failed to process plan upgrade.");
      }
    } catch {
      setErrorMsg("Network error upgrading tier.");
    } finally {
      setUpgrading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight">
            <Sparkles className="w-5 h-5 text-primary" />
            <span>SaaS Billing, Metering & Tier Subscriptions</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-accent-success bg-accent-success/10 border border-accent-success/30 px-3 py-1.5 rounded-full">
          <CreditCard className="w-3.5 h-3.5" />
          <span>Transparent Usage Metering Active</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Alerts */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Active Plan Metering Banner */}
        {sub && (
          <div className="glass-panel p-6 rounded-lg border border-primary/30 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 space-y-6 shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-[10px] uppercase font-bold text-primary tracking-wider">Current Active Plan</span>
                <h3 className="text-xl font-black text-text-main">{sub.tier.replace("_", " ")}</h3>
                <p className="text-xs text-text-muted">Renews on {new Date(sub.currentPeriodEnd).toLocaleDateString()}</p>
              </div>

              <span className="px-3 py-1.5 rounded-full text-xs font-bold bg-accent-success/10 text-accent-success border border-accent-success/30">
                ● ACTIVE SUBSCRIPTION
              </span>
            </div>

            {/* Metered Usage Progress Bars */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-muted">Auto-Applies Quota</span>
                  <span className="font-mono text-primary">{sub.autoAppliesUsed} / {sub.autoAppliesLimit}</span>
                </div>
                <div className="w-full bg-surface-1 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-primary h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (sub.autoAppliesUsed / sub.autoAppliesLimit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-muted">AI Matches Quota</span>
                  <span className="font-mono text-secondary">{sub.aiMatchesUsed} / {sub.aiMatchesLimit}</span>
                </div>
                <div className="w-full bg-surface-1 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-secondary h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (sub.aiMatchesUsed / sub.aiMatchesLimit) * 100)}%` }}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-text-muted">Document Vault Storage</span>
                  <span className="font-mono text-accent-success">{sub.vaultStorageUsedMb} MB / {sub.vaultStorageLimitMb} MB</span>
                </div>
                <div className="w-full bg-surface-1 h-2 rounded-full overflow-hidden border border-white/5">
                  <div
                    className="bg-accent-success h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (sub.vaultStorageUsedMb / sub.vaultStorageLimitMb) * 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* 3-Tier Pricing Matrix */}
        <div className="space-y-6">
          <div className="text-center space-y-1">
            <h3 className="text-xl font-bold text-text-main">Choose Your Candidate Plan</h3>
            <p className="text-xs text-text-muted">Upgrade anytime to unlock unlimited AI job matches, high-volume auto-applies, and priority scrapers.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Free Starter */}
            <div className={`glass-panel p-6 rounded-lg border space-y-6 shadow-luxury flex flex-col justify-between ${
              sub?.tier === "FREE_STARTER" ? "border-primary bg-primary/5" : "border-white/10"
            }`}>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-text-subtle">Starter</span>
                  <h4 className="text-lg font-bold text-text-main">Free Candidate</h4>
                  <div className="mt-2 text-2xl font-black text-text-main">₹0 <span className="text-xs text-text-subtle font-normal">/ month</span></div>
                </div>

                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent-success" />
                    <span>5 Auto-Applies per month</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent-success" />
                    <span>10 AI Eligibility Evaluations</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent-success" />
                    <span>5 MB Document Vault Storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-accent-success" />
                    <span>Basic Photo Resizer</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={sub?.tier === "FREE_STARTER" || upgrading}
                onClick={() => handleUpgradeTier("FREE_STARTER")}
                className="w-full py-2.5 rounded-md glass-panel text-xs font-bold text-text-main border border-white/10 disabled:opacity-50"
              >
                {sub?.tier === "FREE_STARTER" ? "Current Plan" : "Downgrade to Free"}
              </button>
            </div>

            {/* Pro Jobseeker (POPULAR) */}
            <div className={`glass-panel p-6 rounded-lg border relative space-y-6 shadow-luxury flex flex-col justify-between ${
              sub?.tier === "PRO_JOBSEEKER" ? "border-primary bg-primary/10" : "border-primary/50"
            }`}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-primary text-white text-[10px] font-extrabold uppercase tracking-wider flex items-center gap-1 shadow-glow">
                <Star className="w-3 h-3 fill-current" />
                <span>MOST POPULAR</span>
              </div>

              <div className="space-y-4 pt-2">
                <div>
                  <span className="text-[10px] uppercase font-bold text-primary">Pro Candidate</span>
                  <h4 className="text-lg font-bold text-text-main">Pro Jobseeker</h4>
                  <div className="mt-2 text-2xl font-black text-primary">₹499 <span className="text-xs text-text-subtle font-normal">/ month</span></div>
                </div>

                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2 font-semibold text-text-main">
                    <Check className="w-4 h-4 text-primary" />
                    <span>50 Auto-Applies per month</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-text-main">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Unlimited AI Match Runs</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>50 MB Document Vault Storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Priority Government & Corporate Scrapers</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    <span>Fuzzy Form Intelligence Pre-fill</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={sub?.tier === "PRO_JOBSEEKER" || upgrading}
                onClick={() => handleUpgradeTier("PRO_JOBSEEKER")}
                className="btn-glow w-full py-2.5 rounded-md text-white font-bold text-xs shadow-luxury disabled:opacity-50"
              >
                {sub?.tier === "PRO_JOBSEEKER" ? "Current Plan" : "Upgrade to Pro (₹499)"}
              </button>
            </div>

            {/* Enterprise AI */}
            <div className={`glass-panel p-6 rounded-lg border space-y-6 shadow-luxury flex flex-col justify-between ${
              sub?.tier === "ENTERPRISE_AI" ? "border-secondary bg-secondary/10" : "border-white/10"
            }`}>
              <div className="space-y-4">
                <div>
                  <span className="text-[10px] uppercase font-bold text-secondary">Unlimited</span>
                  <h4 className="text-lg font-bold text-text-main">Enterprise AI</h4>
                  <div className="mt-2 text-2xl font-black text-secondary">₹1,499 <span className="text-xs text-text-subtle font-normal">/ month</span></div>
                </div>

                <ul className="space-y-2 text-xs text-text-muted">
                  <li className="flex items-center gap-2 font-semibold text-text-main">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>Unlimited Auto-Applies</span>
                  </li>
                  <li className="flex items-center gap-2 font-semibold text-text-main">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>Dedicated Browser Assistant</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>500 MB Encrypted Vault Storage</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>1-on-1 AI Career Advisor (M12)</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-secondary" />
                    <span>Real-time SMS & Push Alerts (M13)</span>
                  </li>
                </ul>
              </div>

              <button
                disabled={sub?.tier === "ENTERPRISE_AI" || upgrading}
                onClick={() => handleUpgradeTier("ENTERPRISE_AI")}
                className="w-full py-2.5 rounded-md bg-secondary hover:opacity-90 text-white font-bold text-xs shadow-luxury disabled:opacity-50"
              >
                {sub?.tier === "ENTERPRISE_AI" ? "Current Plan" : "Upgrade to Enterprise (₹1,499)"}
              </button>
            </div>
          </div>
        </div>

        {/* Invoice History Log */}
        <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <h3 className="text-base font-bold text-text-main flex items-center gap-2">
              <FileText className="w-4 h-4 text-primary" />
              <span>Billing Invoice History</span>
            </h3>

            <span className="text-xs text-text-subtle">{invoices.length} Invoices Recorded</span>
          </div>

          <div className="border border-white/10 rounded-lg overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-surface-1 text-text-muted font-bold border-b border-white/10 uppercase text-[10px]">
                <tr>
                  <th className="p-3">Invoice ID</th>
                  <th className="p-3">Plan Tier</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {invoices.map((inv) => (
                  <tr key={inv.invoiceId} className="hover:bg-surface-1/50 transition-colors">
                    <td className="p-3 font-mono font-semibold text-text-main">{inv.invoiceId}</td>
                    <td className="p-3 text-text-subtle">{inv.tier.replace("_", " ")}</td>
                    <td className="p-3 font-mono font-bold text-accent-success">₹{inv.amountInr}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-success/10 text-accent-success border border-accent-success/30">
                        {inv.status}
                      </span>
                    </td>
                    <td className="p-3 text-text-subtle">{new Date(inv.paidAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
