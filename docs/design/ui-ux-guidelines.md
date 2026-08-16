# ApplyPilot AI — Ultra-Premium UX & Interface Flow Guidelines

AUTHOR: UI/UX Designer (TM-03) & Product Manager (TM-01)  
TARGET: World-Class Candidate Experience, Zero Friction, High Conversion  

---

## 1. Core User Flow Principles
ApplyPilot AI transforms complex job application work into a seamless, delight-driven workflow.

### UX Rules
1. **Never Block the Candidate**: Form entries must auto-save transient states. If a field fails validation, highlight it inline with clear guidance.
2. **Contextual Intelligence Over Blank Forms**: Always pre-fill detected information from the Master Career Profile (M02) into forms with visual verification badges.
3. **Transparent Progress & Feedback**: Every operation taking >200ms must show visual progress indicators (skeleton shimmer, dynamic micro-spinners, or progress steppers).
4. **Human-In-The-Loop Control (HITL)**: Clear, tactile confirmation triggers for sensitive actions (applying, uploading verified IDs, submitting).

---

## 2. Standard State Designs

### 1. Skeleton Loading States
- Use animated shimmer gradients (`linear-gradient(90deg, var(--surface-1) 0%, var(--surface-2) 50%, var(--surface-1) 100%)`).
- Match exact container layout dimensions to prevent layout shifts (CLS < 0.01).

### 2. Interactive Empty States
- Never show a plain blank screen or text.
- Pair a modern vector/glass SVG icon with a compelling title, explanatory paragraph, and primary glowing CTA button.

### 3. Error States & Field Validation
- Errors must be non-aggressive yet instantly recognizable.
- Soft Rose tint background (`hsla(346, 84%, 61%, 0.1)`) with a subtle `1px solid #f43f5e` border and helper icon.

---

## 3. Responsive Layout Strategy
- **Mobile (<640px)**: Bottom-sheet drawers, touch-friendly 48px minimum touch targets, collapsible navigation.
- **Tablet (640px - 1024px)**: Adaptive 2-column split layouts.
- **Desktop (>1024px)**: Fixed luxury sidebar + dynamic main workspace with contextual action panel on the right.

---

## 4. Accessibility Standards (WCAG AAA Target)
- High contrast ratio (minimum `7:1` for body text against dark backgrounds).
- Keyboard Navigation (`Tab`, `Shift+Tab`, `Enter`, `Escape`) fully supported across all modals, dropdowns, and form steppers.
- Screen reader ARIA attributes (`aria-expanded`, `aria-live="polite"`, `aria-describedby`) pre-wired into reusable UI components.
