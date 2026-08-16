# 🛡️ ApplyPilot AI — Master System Architecture & All 15 Modules Documentation

**Product Owner**: Banti  
**Repository**: [https://github.com/Bantikevat/applypilot-ai](https://github.com/Bantikevat/applypilot-ai) (Public)  
**System Architecture**: Next.js 14.2 (App Router) + TypeScript + Tailwind CSS / Vanilla CSS Glassmorphism + Mongoose / MongoDB + Vitest Test Runner  
**Current Test Suite Status**: **121/121 Vitest Unit & Integration Tests Passing (100% Pass Rate)**  
**GitHub Branch**: `main` (Fully Synced)  

---

## 🏛️ Comprehensive Overview of All 15 Platform Modules

```
 ┌─────────────────────────────────────────────────────────────────────────────────────────────┐
 │                                   APPLYPILOT AI PLATFORM                                    │
 ├──────────────────────────┬───────────────────────────┬──────────────────────────────────────┤
 │  FOUNDATION CORE         │  INTELLIGENCE & MATCHING  │  AUTOMATION & CAREER OPERATIONS      │
 │  M01 — Auth & Identity   │  M05 — Multi-Source Jobs  │  M08 — Smart Form Intelligence       │
 │  M02 — Master Profile    │  M06 — Job Match Scoring  │  M09 — HITL Browser Assistant        │
 │  M03 — Document Vault    │  M07 — Skill Gap Agent    │  M10 — Application Tracking          │
 │  M04 — Resume AI Parser  │  M11 — Career Analytics   │  M12 — AI Career Agent Copilot       │
 ├──────────────────────────┴───────────────────────────┴──────────────────────────────────────┤
 │  ENTERPRISE & INFRASTRUCTURE                                                                │
 │  M13 — Notifications Engine   │   M14 — Master Admin Console   │   M15 — SaaS Billing & Sub   │
 └─────────────────────────────────────────────────────────────────────────────────────────────┘
```

---

### 1. Module M01 — Identity & Authentication System
- **Purpose**: Manages secure candidate registration, login, password hashing, JWT session management, and auth schemas.
- **Key Services**: `authService.ts`, `authSchemas.ts`
- **Key Tech**: Bcrypt salt hashing, JWT tokens, MongoDB User collection.
- **Testing**: 9 tests passing (`authService.test.ts`, `authE2E.test.ts`).

### 2. Module M02 — Master Career Profile Engine
- **Purpose**: Stores candidate's canonical career record (Personal Info, Date of Birth, Category OBC/SC/ST/General, Education History, Experience Timeline, Technical Skills).
- **Key Services**: `profileService.ts`, `profileSchemas.ts`
- **Key Features**: Supports both live MongoDB persistence and zero-config In-Memory store fallback.

### 3. Module M03 — Candidate Document Vault
- **Purpose**: Manages candidate uploaded files (Resumes, Photographs, Signatures, Caste/Category Certificates, Degree Transcripts).
- **Key Services**: `documentVaultService.ts`, `vaultSchemas.ts`
- **Key Features**: Upload validation, file MIME checking, SHA-256 metadata indexing, and document retrieval.

### 4. Module M04 — AI Resume Parsing & Customization Engine
- **Purpose**: Extracts structured profile data from PDF/DOCX resumes and generates AI-tailored resumes customized for target job descriptions.
- **Key Services**: `resumeParserService.ts`, `resumeCustomizerService.ts`
- **Key Features**: Custom tailored summary generation, keyword alignment, PDF output rendering.

### 5. Module M05 — Multi-Source Job Discovery Engine (12 Live Feeds)
- **Purpose**: Ingests, normalizes, deduplicates (SHA-256 fingerprint), and indexes canonical jobs across 4 primary categories:
  - **M05-A Government**: UPSC, SSC CGL/CHSL, Railway RRB, State Public Service Commissions.
  - **M05-B Tech MNCs**: Google Careers, DeepMind AI, Microsoft Careers.
  - **M05-C Job Platforms**: RemoteOK Authorized API, Arbeitnow Open Jobs Feed.
  - **M05-D Remote Tech Feeds**: WeWorkRemotely RSS/API, Himalayas, Jobspresso.
- **Key Services**: `jobDiscoveryService.ts`, `GovernmentSourceAdapter`, `CompanyCareerAdapter`, `JobBoardAdapter`, `SpecializedRemoteJobAdapter`.
- **Testing**: 48 integration tests passing (`jobDiscoveryService.test.ts`).

### 6. Module M06 — AI Job Match Scoring & Vector Engine (Audited & Hardened)
- **Purpose**: Computes 0–100% AI Match Percentage and Eligibility Verdict (`ELIGIBLE`, `PARTIALLY_ELIGIBLE`, `INELIGIBLE`) across 5 dimensions:
  1. **Education (Weight: 25)**: `DEGREE_TIER_RANK` (Tiers 0–5) ordinal hierarchy ranking with key-length sorting (`"bca"` vs `"ca"`) and `PROFESSIONAL_CREDENTIALS` (`CA`, `LLB`, `MBBS`) symmetric domain isolation.
  2. **Age (Weight: 15)**: Government category age relaxations (OBC max 35y [+3y], SC/ST max 37y [+5y], General max 32y).
  3. **Experience (Weight: 25)**: Total candidate experience years computation vs min experience required.
  4. **Skills (Weight: 25)**: `normalizeSkillToken()` mapping `c++` -> `cplusplus`, `c#` -> `csharp` preventing false positive word boundary collisions.
  5. **Location (Weight: 10)**: City & remote preference matching.
- **Unbounded Pagination**: Dynamic pagination loop fetching 100% of jobs using `searchJobs()` total count contract, with per-job error isolation.
- **Testing**: 14 tests passing (`jobMatchingService.test.ts`).

### 7. Module M07 — Skill Gap Analysis & Learning Agent
- **Purpose**: Analyzes candidate skills against target career role benchmarks (`fullstack-ai`, `backend-cloud-architect`, `frontend-lead`, `ml-ai-engineer`, `govt-aso`) OR specific job vacancies.
- **Key Features**:
  - Categorizes gaps into **Mastered**, **Critical Gaps**, and **Recommended Skills**.
  - Calculates estimated learning days to mastery.
  - Provides curated learning resource URLs with 1-click profile acquisition ("Mark as Mastered").
- **Testing**: 6 tests passing (`skillGapService.test.ts`).

### 8. Module M08 — Smart Application Intelligence & Pre-fill Readiness Engine
- **Purpose**: Audits candidate profile & document vault completeness before applying.
- **Key Features**: Generates 0–100% Pre-fill Readiness Score, audits mandatory application fields (Name, DOB, Photo, Signature, Resume), and maps candidate fields to portal schemas (Workday, OTR, Greenhouse, Lever).

### 9. Module M09 — Browser Application Assistant & HITL Confirmation Gate
- **Purpose**: Automated application form filling assistant featuring human-in-the-loop (HITL) safety confirmation gate.
- **Key Features**: Pauses at `AWAITING_HUMAN_REVIEW` before final submission; candidate must explicitly confirm before submission.

### 10. Module M10 — Application Tracking & Status Pipeline
- **Purpose**: Manages job application lifecycle pipeline (`APPLIED`, `UNDER_REVIEW`, `INTERVIEW_SCHEDULED`, `OFFER_EXTENDED`, `REJECTED`).
- **Key Features**: Timeline logging, interview reminders, status updates.

### 11. Module M11 — Career Analytics & Market Intelligence
- **Purpose**: Computes career market analytics, salary benchmarks, application conversion rates, and industry skill demand trends.

### 12. Module M12 — AI Career Agent & Copilot
- **Purpose**: Conversational AI career assistant with context fusion (fuses Candidate Profile + Matching Jobs + Skill Gaps + Application Pipeline).

### 13. Module M13 — Notifications Engine
- **Purpose**: Delivers in-app alerts and email notifications for new job matches, application status changes, and interview reminders.

### 14. Module M14 — Master Admin Console
- **Purpose**: System health dashboard, scraper adapter metrics monitoring, manual source sync triggers, and user activity logging.

### 15. Module M15 — SaaS Billing & Subscription Engine
- **Purpose**: Tiered subscription management (`FREE_STARTER`, `PRO_PILOT`, `ENTERPRISE`), metered usage tracking (job matches, resume customizer runs), and subscription lifecycle.

---

## 🧪 Global Verification & Build Metrics

- **Vitest Suite**: 17 Test Files Passed | **121/121 Tests Passing (100%)**
- **Next.js Production Build**: 25 Static & Dynamic API Pages Compiled Cleanly
- **GitHub Repository**: [https://github.com/Bantikevat/applypilot-ai](https://github.com/Bantikevat/applypilot-ai) (Public, Branch `main`)

---

*Report Prepared by Antigravity Lead Engineer & Systems Architect | ApplyPilot AI Platform 2026*
