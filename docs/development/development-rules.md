# ApplyPilot AI — Development Rules & Quality Standards

## 1. Module-by-Module Rule
- **STRICT ENFORCEMENT**: Development proceeds strictly sequential (M01 -> M02 -> M03 ...).
- **NO EARLY STUBS**: Do not create hollow mock components for future modules unless strictly required as an interface contract by the current active module.

## 2. Coding & Quality Rules
- **Language**: TypeScript (`strict: true`). No `any` types allowed without explicit justification.
- **Validation**: All external inputs (API payloads, query params, environment variables, AI responses) MUST be validated with Zod schemas.
- **Error Handling**: Use central custom error classes (`AppError`, `ValidationError`, `AuthError`, `NotFoundError`). Never expose unhandled database traces or internal stack traces to client responses.
- **Async Safety**: Always handle promise rejections cleanly.
- **No Hardcoded Secrets**: Secrets MUST be stored in `.env.local` and accessed via standard environment variable configurations.

## 3. Testing Rules
- Every module must include unit tests for core utilities and services.
- API endpoints must have integration tests verifying success paths, authorization failures, and validation errors.
- Tests must pass before declaring any module status as COMPLETE.

## 4. Response Format Rule (MNC Reporting Protocol)
When presenting module progress or proposals to Product Owner **Banti**, use the standard 10-point format:
1. UNDERSTANDING
2. PLAN
3. ARCHITECTURE IMPACT
4. IMPLEMENTATION
5. TESTING
6. SECURITY REVIEW
7. FILES CHANGED
8. TEST RESULTS
9. KNOWN LIMITATIONS
10. NEXT RECOMMENDED STEP
