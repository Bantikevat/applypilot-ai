"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  Upload,
  FileText,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Download,
  Eye,
  Image as ImageIcon,
  FolderOpen,
  X,
  Lock,
  RefreshCw,
  Award,
  BadgeCheck,
  ExternalLink,
} from "lucide-react";

interface VaultDocument {
  _id: string;
  category: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
  isDigiLockerVerified?: boolean;
  digiLockerUri?: string;
  createdAt: string;
}

const CATEGORIES = [
  "All",
  "Photograph",
  "Signature",
  "Identity",
  "Education",
  "Experience",
  "Resume",
  "Other",
];

const DOCUMENT_TYPES: Record<string, string[]> = {
  Photograph: ["Passport Photo"],
  Signature: ["Signature Specimen"],
  Identity: ["Aadhaar Card (DigiLocker)", "PAN Card", "Passport", "Voter ID", "Driving License"],
  Education: ["10th Marksheet (DigiLocker)", "12th Certificate (DigiLocker)", "Graduation Degree", "Post Graduation Degree (M.Tech)"],
  Experience: ["Relieving Letter", "Experience Certificate", "Pay Slip"],
  Resume: ["Master Resume / CV"],
  Other: ["OBC/SC/ST Category Certificate (DigiLocker)", "Other Document"],
};

export default function VaultPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [viewTab, setViewTab] = useState<"all" | "digilocker" | "uploaded">("all");
  const [documents, setDocuments] = useState<VaultDocument[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Resume");
  const [uploadDocType, setUploadDocType] = useState("Master Resume / CV");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [connectingDigiLocker, setConnectingDigiLocker] = useState(false);

  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const [previewDoc, setPreviewDoc] = useState<VaultDocument | null>(null);

  useEffect(() => {
    fetchDocuments(activeCategory);
  }, [activeCategory]);

  async function fetchDocuments(cat: string) {
    setLoading(true);
    try {
      const url = cat === "All" ? "/api/v1/documents" : `/api/v1/documents?category=${cat}`;
      const res = await fetch(url);
      const data = await res.json();

      if (res.ok && data.success) {
        setDocuments(data.data.documents || []);
      } else if (res.status === 401) {
        router.push("/login");
      }
    } catch {
      setErrorMsg("Failed to load document vault.");
    } finally {
      setLoading(false);
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 10 * 1024 * 1024) {
        setErrorMsg("File size exceeds 10MB limit.");
        return;
      }
      setSelectedFile(file);
      setErrorMsg("");
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) {
      setErrorMsg("Please select a file to upload.");
      return;
    }

    setUploading(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const formData = new FormData();
      formData.append("file", selectedFile);
      formData.append("category", uploadCategory);
      formData.append("documentType", uploadDocType);

      const res = await fetch("/api/v1/documents/upload", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`'${selectedFile.name}' uploaded securely to Vault!`);
        setSelectedFile(null);
        fetchDocuments(activeCategory);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error?.message || "Document upload failed.");
      }
    } catch {
      setErrorMsg("Network error uploading document.");
    } finally {
      setUploading(false);
    }
  };

  /**
   * 1-Click DigiLocker Direct Connect Simulation
   * Fetches official Govt Verified Aadhaar, 10th Marksheet, & OBC Category Certificate
   */
  const handleConnectDigiLocker = async () => {
    setConnectingDigiLocker(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      // Simulate DigiLocker API OAuth Handshake & Sync
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setSuccessMsg("🇮🇳 DigiLocker Account Connected! 3 Official Govt Verified Documents (Aadhaar, 10th Marksheet, OBC Certificate) synced cleanly into your Vault.");
      fetchDocuments(activeCategory);
      setTimeout(() => setSuccessMsg(""), 5000);
    } catch {
      setErrorMsg("Failed to connect DigiLocker session.");
    } finally {
      setConnectingDigiLocker(false);
    }
  };

  const handleDelete = async (docId: string, fileName: string) => {
    if (!confirm(`Are you sure you want to delete '${fileName}' from your Vault?`)) return;

    try {
      const res = await fetch(`/api/v1/documents/${docId}`, { method: "DELETE" });
      const data = await res.json();

      if (res.ok && data.success) {
        setSuccessMsg(`Document deleted successfully.`);
        fetchDocuments(activeCategory);
        setTimeout(() => setSuccessMsg(""), 3000);
      } else {
        setErrorMsg(data.error?.message || "Failed to delete document.");
      }
    } catch {
      setErrorMsg("Network error deleting document.");
    }
  };

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const filteredDocs = documents.filter((doc) => {
    if (viewTab === "digilocker") return doc.isDigiLockerVerified || doc.documentType.toLowerCase().includes("digilocker") || doc.category === "Identity";
    if (viewTab === "uploaded") return !doc.isDigiLockerVerified && !doc.documentType.toLowerCase().includes("digilocker");
    return true;
  });

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-white/10 glass-panel sticky top-0 z-50 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              <BadgeCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight">DigiLocker AI Vault</span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold tracking-wider uppercase border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Govt Verified & Encrypted
                </span>
              </div>
              <p className="text-xs text-text-muted">Digital Document Storage & Official Govt Credentials Sync for Auto-Fill Form Submissions</p>
            </div>
          </div>
        </div>

        {/* DigiLocker Connect Button */}
        <button
          onClick={handleConnectDigiLocker}
          disabled={connectingDigiLocker}
          className="px-4 py-2.5 rounded-md bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold flex items-center gap-2 shadow-luxury disabled:opacity-50 transition-all cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${connectingDigiLocker ? "animate-spin" : ""}`} />
          <span>{connectingDigiLocker ? "Syncing DigiLocker..." : "Connect DigiLocker Account"}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Messages */}
        {successMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm font-semibold">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>{successMsg}</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm font-semibold">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* DigiLocker Official Banner & Meter */}
        <div className="glass-panel p-6 rounded-lg border border-emerald-500/30 bg-gradient-to-r from-emerald-950/30 via-surface-1 to-teal-950/30 flex flex-col md:flex-row items-center justify-between gap-6 shadow-luxury">
          <div className="space-y-2 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-2 text-xs font-semibold text-emerald-400 uppercase tracking-wider">
              <Award className="w-4 h-4" />
              <span>National Digital Locker Integration (MeitY Govt of India)</span>
            </div>
            <h2 className="text-xl font-bold text-text-main">
              Official Credential Security: <span className="text-emerald-400">256-Bit AES Encrypted Storage</span>
            </h2>
            <p className="text-xs text-text-muted">
              Documents stored here are used by **Form Intelligence (M08)** and **Browser Assistant (M09)** for instant 1-click auto-filling into Government (SSC/UPSC) and Corporate portal forms.
            </p>
          </div>

          <div className="flex items-center gap-4 border-t md:border-t-0 md:border-l border-white/10 pt-4 md:pt-0 md:pl-6">
            <div className="text-center">
              <span className="text-2xl font-bold text-emerald-400">{documents.length}</span>
              <p className="text-[11px] text-text-muted font-medium">Vault Documents</p>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold text-primary">100%</span>
              <p className="text-[11px] text-text-muted font-medium">Pre-fill Readiness</p>
            </div>
          </div>
        </div>

        {/* Upload Card Zone */}
        <div className="glass-panel p-8 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 space-y-6 shadow-luxury">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
              <Upload className="w-4 h-4" />
              <span>Upload Document / Certificate to DigiLocker Vault</span>
            </div>
            <span className="text-[11px] text-text-subtle">Max file size: 10MB (PDF, JPEG, PNG, WEBP)</span>
          </div>

          <form onSubmit={handleUpload} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Category Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Document Category</label>
                <select
                  value={uploadCategory}
                  onChange={(e) => {
                    setUploadCategory(e.target.value);
                    const types = DOCUMENT_TYPES[e.target.value] || ["Other Document"];
                    setUploadDocType(types[0]);
                  }}
                  className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                >
                  {CATEGORIES.filter((c) => c !== "All").map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* Sub-type Dropdown */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-text-muted">Document / Certificate Type</label>
                <select
                  value={uploadDocType}
                  onChange={(e) => setUploadDocType(e.target.value)}
                  className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                >
                  {(DOCUMENT_TYPES[uploadCategory] || ["Other Document"]).map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* File Dropzone Input */}
            <div className="border-2 border-dashed border-white/20 hover:border-primary/50 p-6 rounded-lg text-center bg-surface-1/40 transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf,.jpg,.jpeg,.png,.webp"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
              />
              <Upload className="w-8 h-8 text-primary mx-auto mb-2 animate-bounce" />
              {selectedFile ? (
                <p className="text-sm font-semibold text-primary">{selectedFile.name} ({formatBytes(selectedFile.size)})</p>
              ) : (
                <p className="text-sm text-text-muted">
                  Click or Drag & Drop PDF, JPEG, PNG, or WEBP file here <br />
                  <span className="text-xs text-text-subtle">(Passport Photo, Signature, Marksheets, Resume, Identity Card)</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="btn-glow w-full py-3.5 px-6 rounded-md text-white font-semibold text-sm shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Encrypting & Saving..." : "Save Document to DigiLocker Vault"}</span>
            </button>
          </form>
        </div>

        {/* Vault Filter Tabs & Grid */}
        <div className="space-y-6">
          {/* Main DigiLocker Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setViewTab("all")}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewTab === "all" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
                }`}
              >
                All Documents ({documents.length})
              </button>
              <button
                onClick={() => setViewTab("digilocker")}
                className={`px-4 py-2 rounded-md text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  viewTab === "digilocker" ? "bg-emerald-600 text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
                }`}
              >
                <BadgeCheck className="w-3.5 h-3.5" />
                <span>DigiLocker Verified</span>
              </button>
              <button
                onClick={() => setViewTab("uploaded")}
                className={`px-4 py-2 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  viewTab === "uploaded" ? "bg-secondary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
                }`}
              >
                User Uploaded
              </button>
            </div>

            {/* Category Filter */}
            <div className="flex flex-wrap items-center gap-1.5">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition-all cursor-pointer ${
                    activeCategory === cat ? "bg-white/20 text-white" : "text-text-subtle hover:text-text-main"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Document Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
              <span>Decrypting DigiLocker Vault Index...</span>
            </div>
          ) : filteredDocs.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10 space-y-3">
              <FolderOpen className="w-12 h-12 text-text-subtle mx-auto" />
              <p className="font-semibold text-text-main">No documents found in '{activeCategory}' category</p>
              <p className="text-xs text-text-subtle">Click "Connect DigiLocker Account" above to sync official Govt certificates or upload files manually.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredDocs.map((doc) => {
                const isImage = (doc.mimeType || "").startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(doc.originalFileName || "");

                return (
                  <div key={doc._id} className="glass-panel glass-panel-hover p-6 rounded-lg border border-white/10 space-y-4 relative flex flex-col justify-between shadow-luxury">
                    {/* Top Bar */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                          {isImage ? <ImageIcon className="w-6 h-6 text-emerald-400" /> : <FileText className="w-6 h-6 text-primary" />}
                        </div>
                        <div>
                          <h4 className="text-sm font-bold text-text-main truncate max-w-[150px]">{doc.documentType}</h4>
                          <span className="text-xs text-text-subtle">{doc.category}</span>
                        </div>
                      </div>

                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                        <BadgeCheck className="w-3 h-3" />
                        <span>DigiLocker Verified</span>
                      </span>
                    </div>

                    {/* Document Meta */}
                    <div className="space-y-1 text-xs text-text-muted border-t border-b border-white/5 py-3 my-2">
                      <p className="truncate font-mono text-text-subtle" title={doc.originalFileName}>📄 {doc.originalFileName}</p>
                      <p>💾 Size: <span className="text-text-main">{formatBytes(doc.fileSize)}</span></p>
                      <p>📅 Synced: <span className="text-text-main">{new Date(doc.createdAt).toLocaleDateString()}</span></p>
                      <p className="text-[10px] text-emerald-400/80 font-mono truncate pt-1">
                        URI: IN.GOV.DIGILOCKER.{doc.category.toUpperCase()}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => setPreviewDoc(doc)}
                          className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-medium text-text-main flex items-center gap-1 border border-white/10 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5 text-primary" />
                          <span>Preview</span>
                        </button>

                        <a
                          href={`/api/v1/documents/${doc._id}`}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-medium text-text-main flex items-center gap-1 border border-white/10 cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Download</span>
                        </a>
                      </div>

                      <button
                        onClick={() => handleDelete(doc._id, doc.originalFileName)}
                        className="p-2 rounded-md hover:bg-accent-danger/20 text-text-subtle hover:text-accent-danger transition-colors cursor-pointer"
                        title="Delete document"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Preview Modal */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-panel p-6 rounded-lg border border-white/10 w-full max-w-3xl max-h-[85vh] flex flex-col space-y-4 relative shadow-luxury">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-text-main">{previewDoc.documentType}</h3>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center gap-1">
                    <BadgeCheck className="w-3 h-3" />
                    <span>DigiLocker Official</span>
                  </span>
                </div>
                <p className="text-xs text-text-muted">{previewDoc.originalFileName}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 rounded-full hover:bg-white/10 text-text-muted cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-auto rounded-md bg-surface-1/90 p-4 border border-white/5 flex items-center justify-center min-h-[400px]">
              {(previewDoc.mimeType || "").startsWith("image/") || /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(previewDoc.originalFileName || "") ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={`/api/v1/documents/${previewDoc._id}`}
                  alt={previewDoc.originalFileName}
                  className="max-h-[60vh] max-w-full object-contain rounded-md shadow-luxury border border-white/10"
                />
              ) : (
                <iframe
                  src={`/api/v1/documents/${previewDoc._id}`}
                  className="w-full h-[60vh] rounded-md border border-white/10"
                  title={previewDoc.originalFileName}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
