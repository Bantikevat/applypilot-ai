# 🚀 ApplyPilot AI — Master Career Assistant & Live Job Discovery Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.2-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Vitest-108%2F108_Passing-green?style=for-the-badge&logo=vitest)](https://vitest.dev/)
[![License](https://img.shields.io/badge/License-Proprietary-red?style=for-the-badge)](LICENSE)

**ApplyPilot AI** is an enterprise-grade, compliant AI career assistant and automated job discovery platform built with Next.js 14 (App Router), TypeScript, Tailwind CSS / Vanilla CSS Glassmorphism, Mongoose / MongoDB, and Chrome Extension Manifest V3.

---

## 🌟 Key Features & Capabilities

- 🏛️ **Live Government Job Discovery**: Direct compliant ingestion from UPSC & SSC official notices without web scraping bypasses.
- 🏢 **Tech MNC Career Engine**: Live official career feeds for Google, DeepMind, Microsoft, and IBM.
- 🌐 **Authorized Job Platforms**: Ingestion from RemoteOK, Arbeitnow, and TechJobBoard APIs.
- 💻 **Niche & Remote Tech Discovery**: Real-time remote job feeds from WeWorkRemotely, Himalayas, and Jobspresso.
- 🎓 **AI Resume Auto-Fill Engine**: Instant extraction of Education history (including currently enrolled M.Tech/B.Tech degrees), Technical Skills, Experience, and Target Roles.
- 🤖 **HITL Browser Assistant Extension**: Manifest V3 extension featuring Human-In-The-Loop review gates before form submissions.
- 📊 **Master Admin Console & Analytics**: Scraper health metrics, active user tracking, and system telemetry.

---

## 🏗️ System Architecture (15 Modules)

| Module | Name | Functionality |
| :--- | :--- | :--- |
| **M01** | `Identity` | User Auth, JWT Cookie Session, Rate Limiting & Security |
| **M02** | `Candidate Profile` | PCI Meter, Auto-Fill Engine & Enrolled M.Tech Support |
| **M03** | `Document Vault` | Secure encrypted resume & document storage |
| **M04** | `Asset Engine` | Passport photo & signature aspect ratio processing |
| **M05** | `Job Discovery Engine` | Multi-source Live Ingestion (Govt, MNCs, Platforms, Remote) |
| **M06** | `Job Matching` | TF-IDF & Skill Vector Match Scoring |
| **M07** | `Skill Gap Analysis` | Market benchmark gap detection & course suggestions |
| **M08** | `Form Intelligence` | Smart field mapping & application readiness |
| **M09** | `Browser Assistant` | Chrome Extension V3 with HITL Human Approval Gate |
| **M10** | `Application Tracker` | Status tracking pipeline (Applied, Interview, Offer) |
| **M11** | `Career Analytics` | Salary trends & market intelligence overview |
| **M12** | `AI Career Agent` | Conversational career advisor with context fusion |
| **M13** | `Notifications` | System alerts & job notification dispatch |
| **M14** | `Admin Console` | System health overview & manual source sync |
| **M15** | `SaaS Billing` | Subscriptions, tier limits & metered usage |

---

## 💻 Tech Stack

- **Framework**: Next.js 14 (App Router, Server Components, API Routes)
- **Language**: TypeScript (Strict Type System)
- **Database**: Mongoose / MongoDB (with resilient In-Memory Dev Fallback)
- **Testing**: Vitest (108/108 Unit & Integration Tests Passing)
- **Styling**: Tailwind CSS & Glassmorphism Theme System
- **Browser Extension**: Manifest V3 Chrome Extension

---

## ⚡ Quick Start & Commands

```bash
# 1. Install Dependencies
npm install

# 2. Run Vitest Test Suite (108 Tests)
npm run test

# 3. Production Build Validation
npm run build

# 4. Start Development Server
npm run dev
```

Dev Server runs locally at `http://localhost:3000`.

---

## 🔒 Security & Compliance

- **No Unauthorized Scraping**: Strict compliance with site `robots.txt`, Terms of Service, and official API endpoints.
- **SSRF Protection**: URL validation and scheme verification on all external feed links.
- **XSS & HTML Sanitization**: Input sanitization on job descriptions and candidate profile data.

---

*Product Owner: Banti | ApplyPilot AI Platform 2026*
