# Architecture Decision Records (ADRs)

## ADR-001: Next.js + TypeScript Fullstack Framework Selection
- **Status**: Approved
- **Context**: ApplyPilot AI requires a fast, responsive SaaS frontend combined with secure REST/API endpoints and SSR capabilities.
- **Decision**: Use Next.js (App Router) with TypeScript across frontend and API layers.
- **Consequences**:
  - Unified codebase for UI and API endpoints.
  - End-to-end type safety between backend responses and client components.
  - Easy zero-cost deployment on modern node runtimes.

## ADR-002: Modular Architecture Pattern
- **Status**: Approved
- **Context**: Building 15 modules requires strict isolation so that early modules (e.g., M01 Identity) remain stable while later modules (e.g., M08 Smart Form Assistant) are developed.
- **Decision**: Structure the codebase into explicit domain directories (`/src/modules/mXX-...`) with public interfaces and strict boundaries.
- **Consequences**: Prevents horizontal scope creep and spaghetti code.

## ADR-003: AI Provider Abstraction (`AIProvider`)
- **Status**: Approved
- **Context**: AI models change rapidly and costs vary. The application must not lock itself into a single AI SDK.
- **Decision**: Create a adapter interface `AIProvider` supporting structured outputs via JSON schema.
- **Consequences**: Allows switching between Gemini, OpenAI, or local models via standard environment configuration (`AI_PROVIDER=gemini`).

## ADR-004: Strict Human-In-The-Loop (HITL) Automation Scope
- **Status**: Approved
- **Context**: Government & job application portals enforce strict anti-bot and security terms (CAPTCHA, OTP, payment gateways, self-declarations).
- **Decision**: Application automation must operate as an interactive assistant (form pre-filling, validation highlights, document matching) rather than headlessly submitting forms autonomously.
- **Consequences**: 100% legal compliance, zero risk of account ban, maximum user trust.
