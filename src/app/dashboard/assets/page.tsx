"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Image as ImageIcon,
  PenTool,
  Sliders,
  CheckCircle2,
  AlertCircle,
  FolderPlus,
  Zap,
  Gauge,
} from "lucide-react";

interface PresetInfo {
  id: string;
  name: string;
  category: string;
  photo: {
    targetWidthPx: number;
    targetHeightPx: number;
    minSizeKb: number;
    maxSizeKb: number;
    description: string;
  };
  signature: {
    targetWidthPx: number;
    targetHeightPx: number;
    minSizeKb: number;
    maxSizeKb: number;
    description: string;
  };
}

const PRESETS: Record<string, PresetInfo> = {
  ssc: {
    id: "ssc",
    name: "SSC (Staff Selection Commission)",
    category: "Government",
    photo: { targetWidthPx: 350, targetHeightPx: 450, minSizeKb: 20, maxSizeKb: 50, description: "3.5cm x 4.5cm Passport Photo (20-50 KB)" },
    signature: { targetWidthPx: 140, targetHeightPx: 60, minSizeKb: 10, maxSizeKb: 20, description: "Signature on white paper (10-20 KB)" },
  },
  upsc: {
    id: "upsc",
    name: "UPSC (Civil Services)",
    category: "Government",
    photo: { targetWidthPx: 350, targetHeightPx: 350, minSizeKb: 20, maxSizeKb: 300, description: "350x350 px Photo with Name & Date (20-300 KB)" },
    signature: { targetWidthPx: 350, targetHeightPx: 350, minSizeKb: 20, maxSizeKb: 300, description: "350x350 px Signature Scan (20-300 KB)" },
  },
  ibps: {
    id: "ibps",
    name: "IBPS / Banking",
    category: "Banking",
    photo: { targetWidthPx: 200, targetHeightPx: 230, minSizeKb: 20, maxSizeKb: 50, description: "200x230 px Passport Photo (20-50 KB)" },
    signature: { targetWidthPx: 140, targetHeightPx: 60, minSizeKb: 10, maxSizeKb: 20, description: "140x60 px Signature (10-20 KB)" },
  },
  standard: {
    id: "standard",
    name: "Standard Job Portals",
    category: "General",
    photo: { targetWidthPx: 400, targetHeightPx: 400, minSizeKb: 10, maxSizeKb: 2000, description: "High-res square profile photo (Up to 2MB)" },
    signature: { targetWidthPx: 300, targetHeightPx: 150, minSizeKb: 5, maxSizeKb: 1000, description: "Signature scan (Up to 1MB)" },
  },
};

export default function AssetEnginePage() {
  const [activeTab, setActiveTab] = useState<"photo" | "signature">("photo");
  const [selectedPreset, setSelectedPreset] = useState("ssc");

  // Form controls
  const [file, setFile] = useState<File | null>(null);
  const [widthPx, setWidthPx] = useState(350);
  const [heightPx, setHeightPx] = useState(450);
  const [maxKb, setMaxKb] = useState(50);
  const [exportVault, setExportVault] = useState(true);

  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const applyPreset = (presetKey: string) => {
    setSelectedPreset(presetKey);
    const p = PRESETS[presetKey];
    if (activeTab === "photo") {
      setWidthPx(p.photo.targetWidthPx);
      setHeightPx(p.photo.targetHeightPx);
      setMaxKb(p.photo.maxSizeKb);
    } else {
      setWidthPx(p.signature.targetWidthPx);
      setHeightPx(p.signature.targetHeightPx);
      setMaxKb(p.signature.maxSizeKb);
    }
  };

  const handleProcess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setErrorMsg("Please select an image file to process.");
      return;
    }

    setProcessing(true);
    setErrorMsg("");
    setSuccessMsg("");
    setResult(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("presetId", selectedPreset);
      formData.append("targetWidthPx", String(widthPx));
      formData.append("targetHeightPx", String(heightPx));
      formData.append("targetMaxKb", String(maxKb));
      formData.append("exportToVault", String(exportVault));

      const endpoint = activeTab === "photo" ? "/api/v1/assets/process-photo" : "/api/v1/assets/process-signature";
      const res = await fetch(endpoint, { method: "POST", body: formData });
      const data = await res.json();

      if (res.ok && data.success) {
        setResult(data.data);
        setSuccessMsg(`Asset processed successfully! Size: ${data.data.fileSizeKb} KB (${data.data.widthPx}x${data.data.heightPx} px)`);
      } else {
        setErrorMsg(data.error?.message || "Failed to process asset.");
      }
    } catch {
      setErrorMsg("Network error processing asset.");
    } finally {
      setProcessing(false);
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
            <span>Photo & Signature Asset Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-primary bg-primary/10 border border-primary/30 px-3 py-1.5 rounded-full">
          <Zap className="w-3.5 h-3.5" />
          <span>Portal Dimension & KB Auditor</span>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Presets Cards Row */}
        <div className="space-y-3">
          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Select Recruitment Portal Preset</label>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            {Object.keys(PRESETS).map((key) => {
              const p = PRESETS[key];
              const isSelected = selectedPreset === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => applyPreset(key)}
                  className={`p-4 rounded-lg text-left transition-all border ${
                    isSelected
                      ? "bg-primary/15 border-primary shadow-glow text-text-main"
                      : "glass-panel glass-panel-hover border-white/10 text-text-muted hover:text-text-main"
                  }`}
                >
                  <span className="text-xs font-bold uppercase text-primary block">{p.category}</span>
                  <h4 className="text-sm font-bold text-text-main">{p.name}</h4>
                  <p className="text-[11px] text-text-subtle mt-1">{activeTab === "photo" ? p.photo.description : p.signature.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center gap-3 border-b border-white/10 pb-3">
          <button
            onClick={() => { setActiveTab("photo"); applyPreset(selectedPreset); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === "photo" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
            }`}
          >
            <ImageIcon className="w-4 h-4" />
            <span>Photograph Resizer</span>
          </button>

          <button
            onClick={() => { setActiveTab("signature"); applyPreset(selectedPreset); }}
            className={`flex items-center gap-2 px-6 py-3 rounded-md text-xs font-semibold transition-all ${
              activeTab === "signature" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
            }`}
          >
            <PenTool className="w-4 h-4" />
            <span>Signature Studio & Contrast</span>
          </button>
        </div>

        {/* Studio Panel */}
        <div className="glass-panel p-8 rounded-lg border border-white/10 grid grid-cols-1 lg:grid-cols-2 gap-8 shadow-luxury">
          {/* Controls Form */}
          <form onSubmit={handleProcess} className="space-y-6">
            <h3 className="text-lg font-bold text-text-main flex items-center gap-2">
              <Sliders className="w-5 h-5 text-primary" />
              <span>{activeTab === "photo" ? "Photo Resizer Controls" : "Signature Enhancer Controls"}</span>
            </h3>

            {errorMsg && (
              <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* File Input */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-text-muted">Select Image File</label>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
                className="w-full p-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm"
              />
            </div>

            {/* Dimensions Control */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Width (Pixels)</label>
                <input
                  type="number"
                  value={widthPx}
                  onChange={(e) => setWidthPx(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-md bg-surface-1 border border-white/10 text-text-main text-sm focus:border-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Height (Pixels)</label>
                <input
                  type="number"
                  value={heightPx}
                  onChange={(e) => setHeightPx(Number(e.target.value))}
                  className="w-full px-4 py-2.5 rounded-md bg-surface-1 border border-white/10 text-text-main text-sm focus:border-primary"
                />
              </div>
            </div>

            {/* Target Max KB Limit */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-text-muted">Max File Size Limit</span>
                <span className="font-bold text-primary">{maxKb} KB</span>
              </div>
              <input
                type="range"
                min="10"
                max="500"
                value={maxKb}
                onChange={(e) => setMaxKb(Number(e.target.value))}
                className="w-full accent-primary"
              />
            </div>

            {/* Auto Export to Vault Toggle */}
            <div className="flex items-center gap-3 p-4 rounded-md bg-surface-1/60 border border-white/5">
              <input
                type="checkbox"
                id="exportVault"
                checked={exportVault}
                onChange={(e) => setExportVault(e.target.checked)}
                className="w-4 h-4 accent-primary rounded cursor-pointer"
              />
              <label htmlFor="exportVault" className="text-xs font-semibold text-text-main cursor-pointer flex items-center gap-1.5">
                <FolderPlus className="w-4 h-4 text-primary" />
                <span>Auto-Export Processed Asset to M03 Document Vault</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={processing || !file}
              className="btn-glow w-full py-3.5 px-6 rounded-md text-white font-semibold text-sm shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Zap className="w-4 h-4" />
              <span>{processing ? "Optimizing Asset..." : "Process & Audit Asset Specs"}</span>
            </button>
          </form>

          {/* Audit Result Display */}
          <div className="p-6 rounded-lg bg-surface-1/60 border border-white/10 space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="text-base font-bold text-text-main flex items-center gap-2">
                <Gauge className="w-5 h-5 text-secondary" />
                <span>Live Asset Audit & Specs Result</span>
              </h4>

              {result ? (
                <div className="space-y-4">
                  <div className="p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-xs font-semibold space-y-1">
                    <p>✓ Dimensions: {result.widthPx} x {result.heightPx} px</p>
                    <p>✓ File Size: {result.fileSizeKb} KB (Target Max: {maxKb} KB)</p>
                    <p>✓ Portal Audit Status: {result.isWithinTargetKb ? "PASSED (Compliant)" : "FAILED (Exceeds KB Limit)"}</p>
                  </div>

                  {result.vaultDocumentId && (
                    <div className="p-3 rounded-md bg-primary/10 border border-primary/30 text-primary text-xs font-semibold flex items-center justify-between">
                      <span>Saved in Vault under {activeTab === "photo" ? "Photograph" : "Signature"}</span>
                      <Link href="/dashboard/vault" className="underline">View in Vault →</Link>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-16 text-text-subtle text-xs space-y-2">
                  <ImageIcon className="w-12 h-12 text-text-subtle mx-auto opacity-50" />
                  <p>Upload an image and click "Process Asset" to preview audit results.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
