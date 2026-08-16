"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ShieldAlert,
  ArrowLeft,
  Activity,
  Server,
  Database,
  Users,
  Briefcase,
  FolderLock,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Play,
  Zap,
  Globe,
  Sliders,
} from "lucide-react";

interface AdapterInfo {
  adapterId: string;
  name: string;
  type: string;
  status: string;
  lastSyncAt: string;
  totalJobsIngested: number;
  successRatePercentage: number;
}

interface SystemHealth {
  databaseStatus: string;
  totalUsersRegistered: number;
  totalCanonicalJobsIngested: number;
  totalVaultDocumentsStored: number;
  apiUptimePercentage: number;
  adaptersHealth: AdapterInfo[];
}

interface CandidateAudit {
  userId: string;
  fullName: string;
  email: string;
  role: string;
  pciScore: number;
  registeredAt: string;
}

export default function AdminPage() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
  const [users, setUsers] = useState<CandidateAudit[]>([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    setErrorMsg("");
    try {
      const [hRes, uRes] = await Promise.all([
        fetch("/api/v1/admin/health"),
        fetch("/api/v1/admin/users"),
      ]);

      const hData = await hRes.json();
      const uData = await uRes.json();

      if (hRes.ok && hData.success) {
        setHealth(hData.data.health);
      }
      if (uRes.ok && uData.success) {
        setUsers(uData.data.users);
      }
    } catch {
      setErrorMsg("Failed to fetch admin system data.");
    } finally {
      setLoading(false);
    }
  };

  const handleTriggerSync = async (adapterId = "ALL") => {
    setSyncing(true);
    setErrorMsg("");
    setSuccessMsg("");

    try {
      const res = await fetch("/api/v1/admin/trigger-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ adapterId }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccessMsg(data.message || "Manual scraper sync completed!");
        fetchAdminData();
      } else {
        setErrorMsg(data.error?.message || "Failed to trigger scraper sync.");
      }
    } catch {
      setErrorMsg("Network error triggering scraper sync.");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-text-main flex flex-col">
      {/* Header */}
      <header className="border-b border-accent-danger/30 glass-panel sticky top-0 z-50 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/dashboard" className="p-2 rounded-md glass-panel glass-panel-hover text-text-muted hover:text-text-main">
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2 text-xl font-bold tracking-tight text-accent-danger">
            <ShieldAlert className="w-5 h-5" />
            <span>Master Admin Platform Console</span>
          </div>
        </div>

        <button
          onClick={() => handleTriggerSync("ALL")}
          disabled={syncing}
          className="px-4 py-2 rounded-md bg-accent-danger text-white font-bold text-xs shadow-luxury disabled:opacity-50 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${syncing ? "animate-spin" : ""}`} />
          <span>{syncing ? "Syncing Adapters..." : "Trigger Manual Scraper Sync"}</span>
        </button>
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

        {loading ? (
          <div className="glass-panel p-12 rounded-lg text-center text-text-subtle text-xs animate-pulse">
            Fetching platform health & scraper adapter status...
          </div>
        ) : health ? (
          <>
            {/* System Health Radar Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="glass-panel p-5 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Database Engine</span>
                  <Database className="w-4 h-4 text-accent-success" />
                </div>
                <span className="text-xl font-bold text-accent-success">{health.databaseStatus}</span>
                <p className="text-[11px] text-text-subtle">MongoDB Connection Active</p>
              </div>

              <div className="glass-panel p-5 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>API Service Uptime</span>
                  <Activity className="w-4 h-4 text-primary" />
                </div>
                <span className="text-xl font-bold text-primary">{health.apiUptimePercentage}%</span>
                <p className="text-[11px] text-text-subtle">High Availability Service</p>
              </div>

              <div className="glass-panel p-5 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Ingested Canonical Jobs</span>
                  <Briefcase className="w-4 h-4 text-accent-warning" />
                </div>
                <span className="text-xl font-bold text-accent-warning">{health.totalCanonicalJobsIngested} Jobs</span>
                <p className="text-[11px] text-text-subtle">Multi-Source Deduplicated</p>
              </div>

              <div className="glass-panel p-5 rounded-lg border border-white/10 space-y-2 shadow-luxury">
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Vault Assets Stored</span>
                  <FolderLock className="w-4 h-4 text-secondary" />
                </div>
                <span className="text-xl font-bold text-secondary">{health.totalVaultDocumentsStored} Documents</span>
                <p className="text-[11px] text-text-subtle">Encrypted Metadata Storage</p>
              </div>
            </div>

            {/* Source Scraper Adapters Table */}
            <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-text-main">Job Discovery Source Scraper Adapters</h3>
                  <p className="text-xs text-text-muted">Live health, scraper yield count, and manual execution status.</p>
                </div>

                <span className="text-xs font-mono text-accent-success bg-accent-success/10 px-2.5 py-1 rounded border border-accent-success/30">
                  {health.adaptersHealth.length} Adapters Active
                </span>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-1 text-text-muted font-bold border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Adapter Name</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Health Status</th>
                      <th className="p-3">Jobs Ingested</th>
                      <th className="p-3">Success Rate</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {health.adaptersHealth.map((adapter) => (
                      <tr key={adapter.adapterId} className="hover:bg-surface-1/50 transition-colors">
                        <td className="p-3 font-semibold text-text-main">{adapter.name}</td>
                        <td className="p-3 text-text-subtle">{adapter.type}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-accent-success/10 text-accent-success border border-accent-success/30">
                            {adapter.status}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-text-main">{adapter.totalJobsIngested}</td>
                        <td className="p-3 font-mono text-primary font-bold">{adapter.successRatePercentage}%</td>
                        <td className="p-3">
                          <button
                            onClick={() => handleTriggerSync(adapter.adapterId)}
                            disabled={syncing}
                            className="px-2.5 py-1 rounded bg-surface-1 border border-white/10 text-[11px] font-semibold text-text-main hover:bg-surface-2 flex items-center gap-1"
                          >
                            <Play className="w-3 h-3 text-accent-success" />
                            <span>Run Scraper</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Candidate User Audit Table */}
            <div className="glass-panel p-6 rounded-lg border border-white/10 space-y-4 shadow-luxury">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <div>
                  <h3 className="text-base font-bold text-text-main">Candidate User Administration Audit</h3>
                  <p className="text-xs text-text-muted">Registered candidate accounts, PCI completeness index, and access roles.</p>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-primary" />
                  <span className="text-xs font-bold text-text-main">{users.length} Registered Candidates</span>
                </div>
              </div>

              <div className="border border-white/10 rounded-lg overflow-hidden">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-1 text-text-muted font-bold border-b border-white/10 uppercase text-[10px]">
                    <tr>
                      <th className="p-3">Candidate Name</th>
                      <th className="p-3">Email Address</th>
                      <th className="p-3">Account Role</th>
                      <th className="p-3">PCI Score</th>
                      <th className="p-3">Registered Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {users.map((user) => (
                      <tr key={user.userId} className="hover:bg-surface-1/50 transition-colors">
                        <td className="p-3 font-semibold text-text-main">{user.fullName}</td>
                        <td className="p-3 text-text-muted font-mono">{user.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-primary/10 text-primary border border-primary/30">
                            {user.role}
                          </span>
                        </td>
                        <td className="p-3 font-mono font-bold text-accent-success">{user.pciScore}%</td>
                        <td className="p-3 text-text-subtle">{new Date(user.registeredAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
