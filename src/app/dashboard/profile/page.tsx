"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Sparkles,
  ArrowLeft,
  User,
  GraduationCap,
  Briefcase,
  Code2,
  SlidersHorizontal,
  CheckCircle2,
  AlertCircle,
  Save,
  Plus,
  Trash2,
  PieChart,
  Wand2,
  FileText,
} from "lucide-react";

interface PersonalInfo {
  phone?: string;
  dateOfBirth?: string;
  gender?: string;
  category?: string;
  city?: string;
  state?: string;
  country?: string;
  address?: string;
  pincode?: string;
}

interface EducationItem {
  id?: string;
  level: string;
  degree: string;
  institution: string;
  boardOrUniversity?: string;
  yearOfPassing: number;
  percentageOrCgpa?: string;
  specialization?: string;
  isPursuing?: boolean;
}

interface ExperienceItem {
  id?: string;
  company: string;
  role: string;
  location?: string;
  startDate: string;
  endDate?: string;
  isCurrent: boolean;
  responsibilities?: string;
}

interface Skills {
  technicalSkills: string[];
  softSkills: string[];
  toolsAndFrameworks: string[];
  languages: string[];
}

interface Preferences {
  preferredJobTypes: string[];
  preferredWorkModes: string[];
  preferredLocations: string[];
  targetSalaryMin?: number;
  targetRoles: string[];
}

export default function ProfilePage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"personal" | "education" | "experience" | "skills" | "preferences">("personal");

  const [personal, setPersonal] = useState<PersonalInfo>({});
  const [education, setEducation] = useState<EducationItem[]>([]);
  const [experience, setExperience] = useState<ExperienceItem[]>([]);
  const [skills, setSkills] = useState<Skills>({ technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] });
  const [preferences, setPreferences] = useState<Preferences>({ preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] });

  const [completenessScore, setCompletenessScore] = useState(0);
  const [missingFields, setMissingFields] = useState<string[]>([]);

  const [techSkillInput, setTechSkillInput] = useState("");
  const [targetRoleInput, setTargetRoleInput] = useState("");

  const [resumeText, setResumeText] = useState("");
  const [isParsingResume, setIsParsingResume] = useState(false);
  const [resumeSuccessMsg, setResumeSuccessMsg] = useState("");

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        setResumeText(content);
        setResumeSuccessMsg(`📄 Uploaded "${file.name}"! Click "Extract Resume with AI" to auto-populate.`);
      }
    };
    reader.readAsText(file);
  };

  const handleParseResume = async () => {
    if (!resumeText.trim()) {
      setErrorMsg("Please paste your resume text or bio details first!");
      return;
    }

    setIsParsingResume(true);
    setErrorMsg("");
    setResumeSuccessMsg("");

    try {
      const res = await fetch("/api/v1/profile/parse-resume", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ resumeText }),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const p = data.data.profile;
        setPersonal(p.personal || {});
        setEducation(p.education || []);
        setExperience(p.experience || []);
        setSkills(p.skills || { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] });
        setPreferences(p.preferences || { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] });

        setCompletenessScore(data.data.completeness?.score || 0);
        setMissingFields(data.data.completeness?.missingFields || []);
        setResumeSuccessMsg("✨ Resume extracted successfully! Education, experience & skills auto-populated.");
        setTimeout(() => setResumeSuccessMsg(""), 6000);
      } else {
        setErrorMsg(data.error?.message || "Failed to parse resume content.");
      }
    } catch {
      setErrorMsg("Network error during AI resume parsing.");
    } finally {
      setIsParsingResume(false);
    }
  };

  useEffect(() => {
    async function fetchProfile() {
      try {
        const res = await fetch("/api/v1/profile");
        const data = await res.json();

        if (res.ok && data.success) {
          const p = data.data.profile;
          setPersonal(p.personal || {});
          setEducation(p.education || []);
          setExperience(p.experience || []);
          setSkills(p.skills || { technicalSkills: [], softSkills: [], toolsAndFrameworks: [], languages: [] });
          setPreferences(p.preferences || { preferredJobTypes: [], preferredWorkModes: [], preferredLocations: [], targetRoles: [] });

          setCompletenessScore(data.data.completeness?.score || 0);
          setMissingFields(data.data.completeness?.missingFields || []);
        } else if (res.status === 401) {
          router.push("/login");
        }
      } catch {
        setErrorMsg("Failed to load profile data.");
      } finally {
        setLoading(false);
      }
    }

    fetchProfile();
  }, [router]);

  const handleSaveProfile = async () => {
    setSaving(true);
    setSaveSuccess(false);
    setErrorMsg("");

    try {
      const payload = {
        personal,
        education,
        experience,
        skills,
        preferences,
      };

      const res = await fetch("/api/v1/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok && data.success) {
        setSaveSuccess(true);
        setCompletenessScore(data.data.completeness?.score || 0);
        setMissingFields(data.data.completeness?.missingFields || []);
        setTimeout(() => setSaveSuccess(false), 3000);
      } else {
        setErrorMsg(data.error?.message || "Failed to update profile.");
      }
    } catch {
      setErrorMsg("Network error saving profile.");
    } finally {
      setSaving(false);
    }
  };

  // Handlers for adding/removing items
  const addEducation = () => {
    setEducation([
      ...education,
      {
        level: "Post Graduation",
        degree: "M.Tech - Master of Technology",
        institution: "IIT / Central / State University",
        yearOfPassing: 2026,
        isPursuing: true,
      },
    ]);
  };

  const removeEducation = (index: number) => {
    setEducation(education.filter((_, i) => i !== index));
  };

  const addExperience = () => {
    setExperience([
      ...experience,
      { company: "Tech Global Inc", role: "Software Engineer", startDate: "2024-01-01", isCurrent: true },
    ]);
  };

  const removeExperience = (index: number) => {
    setExperience(experience.filter((_, i) => i !== index));
  };

  const addTechSkill = () => {
    if (!techSkillInput.trim()) return;
    if (!skills.technicalSkills.includes(techSkillInput.trim())) {
      setSkills({ ...skills, technicalSkills: [...skills.technicalSkills, techSkillInput.trim()] });
    }
    setTechSkillInput("");
  };

  const removeTechSkill = (skill: string) => {
    setSkills({ ...skills, technicalSkills: skills.technicalSkills.filter((s) => s !== skill) });
  };

  const addTargetRole = () => {
    if (!targetRoleInput.trim()) return;
    if (!preferences.targetRoles.includes(targetRoleInput.trim())) {
      setPreferences({ ...preferences, targetRoles: [...preferences.targetRoles, targetRoleInput.trim()] });
    }
    setTargetRoleInput("");
  };

  const removeTargetRole = (role: string) => {
    setPreferences({ ...preferences, targetRoles: preferences.targetRoles.filter((r) => r !== role) });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-text-muted text-sm">
        <div className="flex items-center gap-3 glass-panel p-6 rounded-md border border-white/10">
          <Sparkles className="w-5 h-5 text-primary animate-spin" />
          <span>Loading Master Career Profile Workspace...</span>
        </div>
      </div>
    );
  }

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
            <span>Master Career Profile</span>
          </div>
        </div>

        <button
          onClick={handleSaveProfile}
          disabled={saving}
          className="btn-glow px-6 py-2.5 rounded-md text-white text-xs font-semibold flex items-center gap-2 shadow-luxury disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? "Saving Changes..." : "Save Master Profile"}</span>
        </button>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 space-y-8">
        {/* Status Alerts */}
        {saveSuccess && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-success/10 border border-accent-success/30 text-accent-success text-sm">
            <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
            <span>Master Career Profile updated successfully! Completeness score synced.</span>
          </div>
        )}

        {errorMsg && (
          <div className="flex items-center gap-3 p-4 rounded-md bg-accent-danger/10 border border-accent-danger/30 text-accent-danger text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Profile Completeness Meter Card (PCI) */}
        <div className="glass-panel p-6 rounded-lg border border-primary/20 bg-gradient-to-r from-primary/10 via-surface-1 to-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-luxury">
          <div className="space-y-2 text-center sm:text-left">
            <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-semibold text-primary uppercase tracking-wider">
              <PieChart className="w-4 h-4" />
              <span>Profile Completeness Index (PCI)</span>
            </div>
            <h2 className="text-2xl font-bold text-text-main">
              Profile Readiness: <span className="text-gradient">{completenessScore}% Complete</span>
            </h2>
            {missingFields.length > 0 ? (
              <p className="text-xs text-text-muted">
                Missing to reach 100%: <span className="text-accent-warning">{missingFields.join(", ")}</span>
              </p>
            ) : (
              <p className="text-xs text-accent-success font-medium">✓ Your profile is 100% complete and ready for AI Job Matching!</p>
            )}
          </div>

          {/* Meter Circular Ring */}
          <div className="relative w-24 h-24 flex items-center justify-center rounded-full border-4 border-primary/30 bg-surface-1/80 shadow-glow">
            <span className="text-xl font-bold text-text-main">{completenessScore}%</span>
          </div>
        </div>

        {/* ⚡ AI Resume Auto-Fill & Extraction Box */}
        <div className="glass-panel p-6 rounded-lg border border-primary/30 bg-surface-1/90 space-y-4 shadow-luxury">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-lg bg-primary/20 text-primary border border-primary/30">
                <Wand2 className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-bold text-text-main flex items-center gap-2">
                  <span>AI Resume Auto-Fill Engine</span>
                  <span className="px-2 py-0.5 rounded-full bg-accent-success/20 text-accent-success text-[10px] font-bold tracking-wider uppercase border border-accent-success/30">
                    Instant Auto-Populate
                  </span>
                </h3>
                <p className="text-xs text-text-muted">
                  Paste your resume text or bio details below — AI will automatically extract Education (M.Tech/B.Tech), Skills & Experience without manual typing!
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              rows={3}
              placeholder="Paste your Resume text here (e.g., M.Tech Computer Science student at IIT, skilled in React, Next.js, Python, Node.js, TypeScript...)"
              value={resumeText}
              onChange={(e) => setResumeText(e.target.value)}
              className="w-full px-4 py-3 rounded-md bg-surface-1 border border-white/10 text-sm text-text-main placeholder-text-subtle focus:outline-none focus:border-primary resize-none"
            />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <label className="px-4 py-2 rounded-md bg-surface-1 border border-white/20 text-xs font-semibold text-text-main flex items-center gap-2 cursor-pointer hover:border-primary transition-all">
                  <FileText className="w-4 h-4 text-primary" />
                  <span>Upload Resume File (.pdf, .docx, .txt)</span>
                  <input
                    type="file"
                    accept=".pdf,.docx,.doc,.txt"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
                <span className="text-xs text-text-subtle hidden sm:inline">or paste text directly</span>
              </div>

              <button
                onClick={handleParseResume}
                disabled={isParsingResume || !resumeText.trim()}
                className="btn-glow px-5 py-2.5 rounded-md text-white text-xs font-semibold flex items-center justify-center gap-2 shadow-luxury disabled:opacity-50 flex-shrink-0"
              >
                <Sparkles className="w-4 h-4" />
                <span>{isParsingResume ? "Extracting & Auto-Filling..." : "Extract Resume with AI"}</span>
              </button>
            </div>
          </div>

          {resumeSuccessMsg && (
            <div className="p-3.5 rounded bg-accent-success/20 border border-accent-success/40 text-accent-success text-xs font-semibold flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>{resumeSuccessMsg}</span>
            </div>
          )}
        </div>

        {/* Workspace Tabbed Interface */}
        <div className="space-y-6">
          {/* Navigation Bar Tabs */}
          <div className="flex flex-wrap items-center gap-2 border-b border-white/10 pb-3">
            <button
              onClick={() => setActiveTab("personal")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "personal" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              <User className="w-4 h-4" />
              <span>Personal Details</span>
            </button>

            <button
              onClick={() => setActiveTab("education")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "education" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Education ({education.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("experience")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "experience" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              <Briefcase className="w-4 h-4" />
              <span>Experience ({experience.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("skills")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "skills" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Skills ({skills.technicalSkills.length})</span>
            </button>

            <button
              onClick={() => setActiveTab("preferences")}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-md text-xs font-semibold transition-all ${
                activeTab === "preferences" ? "bg-primary text-white shadow-glow" : "glass-panel text-text-muted hover:text-text-main"
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Job Preferences</span>
            </button>
          </div>

          {/* TAB 1: PERSONAL DETAILS */}
          {activeTab === "personal" && (
            <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-text-main">Personal Information</h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Phone Number</label>
                  <input
                    type="text"
                    placeholder="+91 9876543210"
                    value={personal.phone || ""}
                    onChange={(e) => setPersonal({ ...personal, phone: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main placeholder-text-subtle text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Date of Birth</label>
                  <input
                    type="date"
                    value={personal.dateOfBirth || ""}
                    onChange={(e) => setPersonal({ ...personal, dateOfBirth: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Gender</label>
                  <select
                    value={personal.gender || "Male"}
                    onChange={(e) => setPersonal({ ...personal, gender: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                    <option value="Prefer not to say">Prefer not to say</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Category</label>
                  <select
                    value={personal.category || "General"}
                    onChange={(e) => setPersonal({ ...personal, category: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                  >
                    <option value="General">General</option>
                    <option value="OBC">OBC</option>
                    <option value="SC">SC</option>
                    <option value="ST">ST</option>
                    <option value="EWS">EWS</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">City</label>
                  <input
                    type="text"
                    placeholder="New Delhi / Bangalore"
                    value={personal.city || ""}
                    onChange={(e) => setPersonal({ ...personal, city: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main placeholder-text-subtle text-sm focus:outline-none focus:border-primary"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">State</label>
                  <input
                    type="text"
                    placeholder="Delhi / Karnataka"
                    value={personal.state || ""}
                    onChange={(e) => setPersonal({ ...personal, state: e.target.value })}
                    className="w-full px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main placeholder-text-subtle text-sm focus:outline-none focus:border-primary"
                  />
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: EDUCATION */}
          {activeTab === "education" && (
            <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6">
              <datalist id="degree-suggestions">
                <option value="M.Tech - Master of Technology" />
                <option value="M.Tech Computer Science & Engineering" />
                <option value="M.Tech Artificial Intelligence & Data Science" />
                <option value="M.Tech VLSI & Embedded Systems" />
                <option value="B.Tech - Bachelor of Technology" />
                <option value="B.Tech Computer Science & Engineering" />
                <option value="B.E. - Bachelor of Engineering" />
                <option value="M.E. - Master of Engineering" />
                <option value="M.S. - Master of Science" />
                <option value="M.Sc - Master of Science" />
                <option value="MCA - Master of Computer Applications" />
                <option value="BCA - Bachelor of Computer Applications" />
                <option value="B.Sc - Bachelor of Science" />
                <option value="Ph.D. - Doctor of Philosophy" />
                <option value="Diploma in Engineering" />
                <option value="12th / Senior Secondary" />
                <option value="10th / Secondary" />
              </datalist>

              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-bold text-text-main">Education History & Running Qualifications</h3>
                  <p className="text-xs text-text-muted">Add your completed or currently pursuing degrees (e.g. M.Tech, B.Tech)</p>
                </div>
                <button
                  onClick={addEducation}
                  className="px-3.5 py-2 rounded-md bg-primary/20 border border-primary/40 text-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/30 transition-all shadow-glow"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Degree / Qualification</span>
                </button>
              </div>

              {education.length === 0 ? (
                <p className="text-sm text-text-muted italic">No education entries added yet. Click above to add M.Tech, B.Tech, 12th or 10th.</p>
              ) : (
                <div className="space-y-4">
                  {education.map((item, idx) => (
                    <div key={idx} className="p-5 rounded-lg bg-surface-1/70 border border-white/10 space-y-4 relative shadow-md">
                      <button
                        onClick={() => removeEducation(idx)}
                        className="absolute top-4 right-4 text-text-subtle hover:text-accent-danger transition-colors p-1"
                        title="Remove Education"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                        <div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Level</label>
                          <select
                            value={item.level}
                            onChange={(e) => {
                              const copy = [...education];
                              copy[idx].level = e.target.value;
                              setEducation(copy);
                            }}
                            className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary"
                          >
                            <option value="Post Graduation">Post Graduation (M.Tech / MCA / M.Sc)</option>
                            <option value="Graduation">Graduation (B.Tech / B.E. / BCA / B.Sc)</option>
                            <option value="Diploma">Diploma</option>
                            <option value="12th">12th / Senior Secondary</option>
                            <option value="10th">10th / Secondary</option>
                            <option value="Certification">Certification</option>
                            <option value="Other">Other</option>
                          </select>
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Degree / Qualification Title</label>
                          <input
                            type="text"
                            list="degree-suggestions"
                            placeholder="e.g. M.Tech Computer Science"
                            value={item.degree}
                            onChange={(e) => {
                              const copy = [...education];
                              copy[idx].degree = e.target.value;
                              setEducation(copy);
                            }}
                            className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary placeholder-text-subtle"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Institution / College</label>
                          <input
                            type="text"
                            placeholder="e.g. IIT / NIT / University"
                            value={item.institution}
                            onChange={(e) => {
                              const copy = [...education];
                              copy[idx].institution = e.target.value;
                              setEducation(copy);
                            }}
                            className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary placeholder-text-subtle"
                          />
                        </div>

                        <div>
                          <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">
                            {item.isPursuing ? "Expected Completion Year" : "Year of Passing"}
                          </label>
                          <input
                            type="number"
                            placeholder={item.isPursuing ? "e.g. 2026" : "e.g. 2024"}
                            value={item.yearOfPassing}
                            onChange={(e) => {
                              const copy = [...education];
                              copy[idx].yearOfPassing = Number(e.target.value);
                              setEducation(copy);
                            }}
                            className="w-full px-3 py-2 rounded bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary"
                          />
                        </div>
                      </div>

                      {/* Currently Pursuing / Running Checkbox Row */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-white/5">
                        <label className="flex items-center gap-2.5 cursor-pointer text-xs font-semibold text-primary hover:text-white transition-colors">
                          <input
                            type="checkbox"
                            checked={item.isPursuing || false}
                            onChange={(e) => {
                              const copy = [...education];
                              copy[idx].isPursuing = e.target.checked;
                              setEducation(copy);
                            }}
                            className="w-4 h-4 rounded border-white/20 bg-surface-1 text-primary focus:ring-primary focus:ring-offset-background cursor-pointer"
                          />
                          <span>🎓 Currently Pursuing / Running Degree (e.g., M.Tech Running)</span>
                        </label>

                        {item.isPursuing && (
                          <span className="px-3 py-1 rounded-full bg-accent-success/20 border border-accent-success/40 text-accent-success text-[11px] font-bold uppercase tracking-wider flex items-center gap-1.5 shadow-sm">
                            <span className="w-2 h-2 rounded-full bg-accent-success animate-pulse"></span>
                            <span>Currently Enrolled / Running (Expected {item.yearOfPassing})</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: WORK EXPERIENCE */}
          {activeTab === "experience" && (
            <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-text-main">Work Experience</h3>
                <button
                  onClick={addExperience}
                  className="px-3 py-1.5 rounded-md bg-primary/20 border border-primary/30 text-primary text-xs font-semibold flex items-center gap-1.5 hover:bg-primary/30"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Experience</span>
                </button>
              </div>

              {experience.length === 0 ? (
                <p className="text-sm text-text-muted italic">No work experience added yet. Click above to add company roles.</p>
              ) : (
                <div className="space-y-4">
                  {experience.map((item, idx) => (
                    <div key={idx} className="p-4 rounded-md bg-surface-1/60 border border-white/5 space-y-3 relative">
                      <button
                        onClick={() => removeExperience(idx)}
                        className="absolute top-4 right-4 text-text-subtle hover:text-accent-danger"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="text-xs text-text-muted">Company Name</label>
                          <input
                            type="text"
                            value={item.company}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].company = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full px-3 py-2 rounded-sm bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-text-muted">Job Role / Title</label>
                          <input
                            type="text"
                            value={item.role}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].role = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full px-3 py-2 rounded-sm bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary"
                          />
                        </div>

                        <div>
                          <label className="text-xs text-text-muted">Start Date</label>
                          <input
                            type="date"
                            value={item.startDate}
                            onChange={(e) => {
                              const copy = [...experience];
                              copy[idx].startDate = e.target.value;
                              setExperience(copy);
                            }}
                            className="w-full px-3 py-2 rounded-sm bg-surface-1 border border-white/10 text-sm text-text-main focus:border-primary"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: SKILLS & TOOLS */}
          {activeTab === "skills" && (
            <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-text-main">Technical Skills & Frameworks</h3>

              <div className="space-y-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. React, Next.js, Python, TypeScript, Node.js"
                    value={techSkillInput}
                    onChange={(e) => setTechSkillInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={addTechSkill}
                    className="btn-glow px-6 py-3 rounded-md text-white font-semibold text-xs shadow-luxury"
                  >
                    Add Skill
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {skills.technicalSkills.map((skill, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary/20 border border-primary/40 text-primary text-xs font-semibold">
                      <span>{skill}</span>
                      <button onClick={() => removeTechSkill(skill)} className="hover:text-accent-danger font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: JOB PREFERENCES */}
          {activeTab === "preferences" && (
            <div className="glass-panel p-8 rounded-lg border border-white/10 space-y-6">
              <h3 className="text-lg font-bold text-text-main">Target Roles & Preferences</h3>

              <div className="space-y-4">
                <label className="text-xs font-semibold text-text-muted uppercase tracking-wider">Target Roles</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="e.g. Full Stack Developer, AI Engineer, Software Architect"
                    value={targetRoleInput}
                    onChange={(e) => setTargetRoleInput(e.target.value)}
                    className="flex-1 px-4 py-3 rounded-md bg-surface-1/80 border border-white/10 text-text-main text-sm focus:outline-none focus:border-primary"
                  />
                  <button
                    onClick={addTargetRole}
                    className="btn-glow px-6 py-3 rounded-md text-white font-semibold text-xs shadow-luxury"
                  >
                    Add Role
                  </button>
                </div>

                <div className="flex flex-wrap gap-2 pt-2">
                  {preferences.targetRoles.map((role, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-secondary/20 border border-secondary/40 text-secondary text-xs font-semibold">
                      <span>{role}</span>
                      <button onClick={() => removeTargetRole(role)} className="hover:text-accent-danger font-bold">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
