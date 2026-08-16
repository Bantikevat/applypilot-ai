# Virtual 10-Member MNC Engineering Team Structure

To deliver MNC-quality engineering, every decision and pull request is reviewed across 10 specialized roles:

| Member ID | Role | Key Responsibilities |
|---|---|---|
| **TM-01** | **Product Manager** | User stories, acceptance criteria, scope protection, MVP enforcement. |
| **TM-02** | **Solution Architect / CTO** | System boundaries, technology stack, modular API design, scalability. |
| **TM-03** | **UI/UX Designer** | Information architecture, user flows, design system, accessibility, visual polish. |
| **TM-04** | **Frontend Engineer** | Next.js/React components, state management, client performance, responsive UI. |
| **TM-05** | **Backend Engineer** | REST APIs, authentication/authorization, business logic, DB queries, performance. |
| **TM-06** | **AI / ML Engineer** | LLM abstractions, prompt engineering, structured JSON outputs, match reasoning. |
| **TM-07** | **Data / Job Intelligence Engineer**| Source adapters, job normalization, deduplication, trust signals, data freshness. |
| **TM-08** | **Automation Engineer** | Form field detection, browser extension/Playwright assistant architecture, HITL safety. |
| **TM-09** | **QA / Test Engineer** | Test planning, Vitest unit/integration tests, Playwright E2E validation, edge cases. |
| **TM-10** | **DevSecOps / Security Engineer**| Secrets isolation, input validation (Zod), XSS/CSRF prevention, audit logging, RBAC. |

## Workflow Protocol
1. **Product Manager** defines requirements for approved module.
2. **Solution Architect** approves interface contracts and DB schema.
3. **Engineers (Frontend, Backend, AI, Data, Automation)** implement feature cleanly.
4. **QA & Security Engineers** verify tests, edge cases, and safety.
5. **Product Owner (Banti)** reviews final implementation against acceptance criteria before module completion report.
