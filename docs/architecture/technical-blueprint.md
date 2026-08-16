# ApplyPilot AI — Technical Architecture & Component Specification Blueprint

AUTHOR: Solution Architect / CTO (TM-02) & Backend Engineer (TM-05)  
TARGET: MNC-Level Maintainability, Modular Domain Architecture, Clean API Contracts  

---

## 1. Technical Stack Architecture

```
+-------------------------------------------------------------------------------+
|                             CLIENT / PRESENTATION                             |
|          Next.js (App Router) + React 19 + TypeScript + Tailwind CSS           |
|                UI Components: Radix Primitives + Lucide Icons                 |
+-------------------------------------------------------------------------------+
                                        |  REST API / JSON Payloads
                                        v
+-------------------------------------------------------------------------------+
|                              APPLICATION / API LAYER                          |
|         Node.js / Express / Next.js API Handlers + Zod Schema Validation     |
+-------------------------------------------------------------------------------+
       |                                |                               |
       v                                v                               v
+-----------------------+   +-----------------------+   +-----------------------+
|   AUTH & SECURITY     |   |   DOMAIN MODULES      |   |   AI PROVIDER LAYER   |
| Argon2id + JWT/Session|   |  Services (M01-M15)   |   |   (Gemini / OpenAI)   |
+-----------------------+   +-----------------------+   +-----------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                               PERSISTENCE LAYER                               |
|                         MongoDB Atlas / Mongoose ORM                          |
+-------------------------------------------------------------------------------+
```

---

## 2. Directory Layout Specification
```text
/c/Users/hp/Desktop/ai/
├── docs/                      # Architectural, Design & Product Specifications
│   ├── architecture/          # Architecture blueprints & decisions
│   ├── design/                # Master Design System & UI/UX Guidelines
│   ├── development/           # Code quality & testing rules
│   ├── product/               # Vision & roadmap
│   ├── security/              # Security baseline & compliance
│   └── team/                  # Virtual MNC team roles
├── src/
│   ├── app/                   # Next.js App Router (Pages, Layouts, API Routes)
│   ├── components/            # Reusable UI Components
│   │   ├── ui/                # Design System Primitive Components (Buttons, Cards, Inputs)
│   │   └── shared/            # Common Layout headers, sidebars, modals
│   ├── modules/               # Domain-driven Modules (Strictly Isolated)
│   │   ├── m01-identity/      # M01 Domain logic, models, controllers, tests
│   │   └── ...                # Future modules
│   └── lib/                   # Cross-cutting utilities
│       ├── db/                # Database connections
│       ├── ai/                # AI Provider Abstractions
│       ├── errors/            # Centralized Error Handlers
│       └── security/          # Password hashing, JWT & Rate Limiter
└── tests/                     # Integration and E2E Test Suites
```

---

## 3. Standard API Error & Response Contracts

### Success Response Contract
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "meta": {
    "timestamp": "2026-08-09T13:33:00Z"
  }
}
```

### Error Response Contract
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid email address format",
    "details": [
      {
        "field": "email",
        "issue": "Must be a valid email string"
      }
    ]
  },
  "meta": {
    "timestamp": "2026-08-09T13:33:00Z"
  }
}
```

---

## 4. Database Modeling Standard (M01 Identity Schema)

```typescript
// M01 Identity User Schema Model Specification
export interface IUser {
  _id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  isVerified: boolean;
  role: 'CANDIDATE' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}
```
