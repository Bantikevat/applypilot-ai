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
  File,
  Image as ImageIcon,
  FolderOpen,
  X,
  Lock,
} from "lucide-react";

interface VaultDocument {
  _id: string;
  category: string;
  documentType: string;
  originalFileName: string;
  mimeType: string;
  fileSize: number;
  verificationStatus: "UNVERIFIED" | "VERIFIED" | "REJECTED";
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
  Identity: ["Aadhaar Card", "PAN Card", "Passport", "Voter ID", "Driving License"],
  Education: ["10th Marksheet", "12th Certificate", "Graduation Degree", "Post Graduation Degree"],
  Experience: ["Relieving Letter", "Experience Certificate", "Pay Slip"],
  Resume: ["Resume / CV"],
  Other: ["Other Document"],
};

export default function VaultPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState("All");
  const [documents, setDocuments] = useState<VaultDocument[]>([]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadCategory, setUploadCategory] = useState("Resume");
  const [uploadDocType, setUploadDocType] = useState("Resume / CV");

  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
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
            <span>Document Vault</span>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-accent-success bg-accent-success/10 border border-accent-success/30 px-3 py-1.5 rounded-full">
          <Lock className="w-3.5 h-3.5" />
          <span>Encrypted Local Storage</span>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Messages */}
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

        {/* Upload Card Zone */}
        <div className="glass-panel p-8 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 space-y-6 shadow-luxury">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary">
            <Upload className="w-4 h-4" />
            <span>Upload Document to Vault</span>
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
                <label className="text-xs font-semibold text-text-muted">Document Type</label>
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
                  <span className="text-xs text-text-subtle">(Max 10MB per document)</span>
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={uploading || !selectedFile}
              className="btn-glow w-full py-3.5 px-6 rounded-md text-white font-semibold text-sm shadow-luxury disabled:opacity-50 flex items-center justify-center gap-2"
            >
              <Upload className="w-4 h-4" />
              <span>{uploading ? "Encrypting & Uploading..." : "Upload Document to Secure Vault"}</span>
            </button>
          </form>
        </div>

        {/* Vault Filter Tabs & Grid */}
        <div className="space-y-6">
          {/* Category Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-2 rounded-md text-xs font-semibold transition-all ${
                  activeCategory === cat ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Document Cards Grid */}
          {loading ? (
            <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10">
              <Sparkles className="w-6 h-6 text-primary mx-auto mb-2 animate-spin" />
              <span>Decrypting Vault Index...</span>
            </div>
          ) : documents.length === 0 ? (
            <div className="p-12 text-center text-text-muted text-sm glass-panel rounded-lg border border-white/10 space-y-3">
              <FolderOpen className="w-12 h-12 text-text-subtle mx-auto" />
              <p className="font-semibold text-text-main">No documents found in '{activeCategory}' vault</p>
              <p className="text-xs text-text-subtle">Upload your resumes, marksheets, ID cards, or certificates above.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc._id} className="glass-panel glass-panel-hover p-6 rounded-lg border border-white/10 space-y-4 relative flex flex-col justify-between">
                  {/* Top Bar */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-3 rounded-md bg-primary/10 border border-primary/20 text-primary">
                        {doc.mimeType.startsWith("image/") ? <ImageIcon className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-text-main truncate max-w-[150px]">{doc.documentType}</h4>
                        <span className="text-xs text-text-subtle">{doc.category}</span>
                      </div>
                    </div>

                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-accent-success/10 border border-accent-success/30 text-accent-success">
                      Verified
                    </span>
                  </div>

                  {/* Document Meta */}
                  <div className="space-y-1 text-xs text-text-muted border-t border-b border-white/5 py-3 my-2">
                    <p className="truncate font-mono text-text-subtle" title={doc.originalFileName}>📄 {doc.originalFileName}</p>
                    <p>💾 Size: <span className="text-text-main">{formatBytes(doc.fileSize)}</span></p>
                    <p>📅 Uploaded: <span className="text-text-main">{new Date(doc.createdAt).toLocaleDateString()}</span></p>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between gap-2 pt-1">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setPreviewDoc(doc)}
                        className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-medium text-text-main flex items-center gap-1 border border-white/10"
                      >
                        <Eye className="w-3.5 h-3.5 text-primary" />
                        <span>Preview</span>
                      </button>

                      <a
                        href={`/api/v1/documents/${doc._id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3 py-1.5 rounded-md glass-panel glass-panel-hover text-xs font-medium text-text-main flex items-center gap-1 border border-white/10"
                      >
                        <Download className="w-3.5 h-3.5 text-secondary" />
                        <span>Download</span>
                      </a>
                    </div>

                    <button
                      onClick={() => handleDelete(doc._id, doc.originalFileName)}
                      className="p-2 rounded-md hover:bg-accent-danger/20 text-text-subtle hover:text-accent-danger transition-colors"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
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
                <h3 className="text-base font-bold text-text-main">{previewDoc.documentType}</h3>
                <p className="text-xs text-text-muted">{previewDoc.originalFileName}</p>
              </div>
              <button onClick={() => setPreviewDoc(null)} className="p-2 rounded-full hover:bg-white/10 text-text-muted">
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
