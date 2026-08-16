# ApplyPilot AI — Security Baseline & Compliance Policy

## 1. Authentication & Tenant Isolation
- **Authentication**: Secure password hashing (Argon2id or bcrypt with high work factor) or robust JWT/Session tokens.
- **Tenant Isolation**: Every database query operating on user-owned data MUST explicitly filter by `userId` derived from the validated server-side session context. Never trust client-supplied user IDs.

## 2. Secrets & Environment Management
- Environment variables template strictly maintained in `.env.example`.
- Secrets (`JWT_SECRET`, `DATABASE_URL`, `AI_API_KEY`) strictly ignored by Git.

## 3. Data Protection & Document Vault Security
- User upload files (resumes, ID cards, photo/signature assets) stored with random UUID filenames.
- Vault files must not be exposed via unauthenticated public static URLs. Access requires signed/authenticated tokens or secured stream endpoints.

## 4. Automation & Compliance Boundaries
- **Strict Prohibition**: No CAPTCHA solver integration, no automated OTP bypass, no auto-payment execution, no unauthorized web scraping against terms of service.
- All form assistance operations MUST run under explicit human supervision (Human-in-the-Loop).
