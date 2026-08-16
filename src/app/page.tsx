import Link from "next/link";
import { Sparkles, ShieldCheck, Zap, ArrowRight } from "lucide-react";

export default function Home() {
  return (
    <main className="relative min-h-screen flex flex-col items-center justify-center p-6 overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/20 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[400px] h-[400px] bg-secondary/15 rounded-full blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl w-full text-center space-y-8">
        {/* Top Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass-panel border border-primary/30 text-xs font-semibold text-primary tracking-wide uppercase shadow-glow">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <span>ApplyPilot AI — Personal Career & Application Agent</span>
        </div>

        {/* Hero Title */}
        <h1 className="text-4xl sm:text-6xl font-bold tracking-tight text-text-main leading-tight">
          Apply to Dream Jobs in <br />
          <span className="text-gradient">Minutes, Not Hours</span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-lg sm:text-xl text-text-muted">
          Your Personal AI Career Agent. Streamline discovery, eligibility analysis, document preparation, and application workflows with 100% security & candidate control.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link
            href="/register"
            className="btn-glow px-8 py-4 rounded-md text-white font-semibold flex items-center gap-2 text-base shadow-luxury"
          >
            <span>Get Started Free</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="/login"
            className="px-8 py-4 rounded-md glass-panel glass-panel-hover text-text-main font-semibold text-base border border-white/10"
          >
            Candidate Sign In
          </Link>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-16 text-left">
          <div className="glass-panel glass-panel-hover p-6 rounded-md border border-white/5 space-y-3">
            <div className="p-3 w-fit rounded-sm bg-primary/10 border border-primary/20 text-primary">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-main">10-20 Min Target</h3>
            <p className="text-sm text-text-muted">
              Cut tedious repetitive data entry down to minutes per application safely.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-md border border-white/5 space-y-3">
            <div className="p-3 w-fit rounded-sm bg-secondary/10 border border-secondary/20 text-secondary">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-main">AI Eligibility & Matching</h3>
            <p className="text-sm text-text-muted">
              Get explainable match scores and skill gap recommendations before applying.
            </p>
          </div>

          <div className="glass-panel glass-panel-hover p-6 rounded-md border border-white/5 space-y-3">
            <div className="p-3 w-fit rounded-sm bg-accent-success/10 border border-accent-success/20 text-accent-success">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-semibold text-text-main">Human-in-the-Loop</h3>
            <p className="text-sm text-text-muted">
              Sensitive actions, OTPs, and payments remain strictly under user control.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
