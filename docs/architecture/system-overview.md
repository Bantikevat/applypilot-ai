# ApplyPilot AI — System Architecture Overview

## 1. Architectural Philosophy
ApplyPilot AI follows a **Modular Monolith** architecture designed for low initial cost, clean domain boundaries, high testability, and seamless future microservice extraction.

```
+-----------------------------------------------------------------------+
|                             Frontend Layer                            |
|          Next.js (App Router) + React + TypeScript + Tailwind         |
+-----------------------------------------------------------------------+
                                   | REST API / Server Actions
                                   v
+-----------------------------------------------------------------------+
|                             Backend Layer                             |
|          Node.js / Express / Next.js API Routes + Zod Validation       |
+-----------------------------------------------------------------------+
         |                         |                      |
         v                         v                      v
+------------------+     +-------------------+  +-------------------+
|  AI Service Layer|     |  Data Layer       |  | Document/Asset Engine|
|  (Provider Abs)  |     |  MongoDB / Mongoose| | Local / S3 Vault  |
+------------------+     +-------------------+  +-------------------+
```

## 2. Core Architectural Principles
- **Loose Coupling**: Modules communicate through strictly defined interfaces and contracts.
- **Provider Abstraction**: AI components interact via an standard interface (`AIProvider`), isolating the core logic from specific underlying LLMs (Gemini, OpenAI, Local models).
- **Source Adapter Pattern**: External job sources connect via custom adapters (`JobSourceAdapter`), outputting canonical, normalized job models.
- **Strict Validation**: All incoming requests and AI responses are parsed through Zod schemas.
- **Human-In-The-Loop (HITL)**: Automation and form assistance never execute silent or autonomous submissions, CAPTCHA bypasses, or payment handling.

## 3. High-Level Directory Layout
```
/
├── docs/                      # Architectural & Product Documentation
├── src/
│   ├── modules/               # Domain-Driven Modules (M01 - M15)
│   │   ├── m01-identity/      # Identity & Account Management
│   │   ├── m02-profile/       # Master Career Profile
│   │   └── ...                # Future modules
│   ├── shared/                # Cross-cutting Concerns
│   │   ├── ai/                # AI Provider Abstractions
│   │   ├── database/          # Database connection & shared utilities
│   │   ├── errors/            # Standard error definitions
│   │   ├── security/          # Auth guards & token utilities
│   │   └── utils/             # Helper utilities
│   └── public/                # Static assets
└── tests/                     # Integration and E2E Test suites
```

## 4. Scalability & Cost Strategy
- Designed for single-instance / serverless deployment during early MVP phases.
- Zero expensive cloud dependencies required initially; compatible with free-tier MongoDB Atlas / local MongoDB, local disk / S3-compatible vault, and standard free/low-cost AI API tiers.
