# ApplyPilot AI — Ultra-Premium Master Design System Specification

VERSION: 1.0  
AUTHOR: UI/UX Lead (TM-03) & Solution Architect (TM-02)  
TARGET QUALITY: Ultra-Luxury, MNC-Grade, State-of-the-Art SaaS Interface  

---

## 1. Visual Philosophy & Design Identity
ApplyPilot AI is designed to look and feel like an elite, next-generation AI platform (combining Apple-level minimalism, Stripe-level precision, and Linear-level fluidity).

### Key Design Pillars
- **Glassmorphism & Depth**: Multi-layered backdrop blurs (`backdrop-filter: blur(16px)`), subtle translucent borders, and soft glowing ambient ambient lights.
- **Dynamic Lighting & Micro-Gradients**: Modern HSL-tailored electric gradients that react to hover and interactive states.
- **Fluid Micro-Animations**: Smooth 60fps springs and cubic-bezier transitions for state updates, modals, and tab switches.
- **Information Density Control**: Clean whitespace layout with high visual hierarchy, ensuring zero cognitive overload for candidates.

---

## 2. Color Palette & Theme Tokens (HSL Tailored System)

### Dark Mode (Primary SaaS Theme — Default)
- **Background Canvas (`--bg-dark`)**: `hsl(224, 25%, 6%)` (#0b0f19 — Deep Space Navy)
- **Surface Elevation 1 (`--surface-1`)**: `hsl(224, 22%, 10%)` (#111726 — Elevated Panel)
- **Surface Elevation 2 (`--surface-2`)**: `hsl(224, 20%, 14%)` (#192238 — Card / Modal Surface)
- **Glass Panel Surface (`--glass-bg`)**: `hsla(224, 25%, 12%, 0.65)` + `backdrop-filter: blur(20px)`

### Brand Accent & Dynamic Gradients
- **Primary Electric Violet (`--primary`)**: `hsl(262, 83%, 58%)` (#8b5cf6)
- **Secondary Cyber Cyan (`--secondary`)**: `hsl(187, 92%, 53%)` (#06b6d4)
- **Accent Emerald Trust (`--accent-success`)**: `hsl(158, 64%, 52%)` (#10b981)
- **Accent Amber Alert (`--accent-warning`)**: `hsl(38, 92%, 50%)` (#f59e0b)
- **Accent Rose Error (`--accent-danger`)**: `hsl(346, 84%, 61%)` (#f43f5e)

### Signature Luxury Gradients
- **Hero Electric Aura**: `linear-gradient(135deg, hsl(262, 83%, 58%) 0%, hsl(187, 92%, 53%) 100%)`
- **Glass Edge Border**: `linear-gradient(135deg, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0.03) 100%)`
- **Subtle Ambient Glow**: `radial-gradient(circle at 50% 0%, rgba(139, 92, 246, 0.18) 0%, transparent 70%)`

---

## 3. Typography System
Modern Google Font Pairing: **Outfit** (Display / Headings) + **Plus Jakarta Sans** (Body / UI Elements) + **JetBrains Mono** (Data / Codes).

### Font Weights & Scale
- **Display Hero (`--text-display`)**: Font: `Outfit`, Size: `3.5rem` (56px), Weight: `800`, Tracking: `-0.03em`, Line Height: `1.1`
- **Heading 1 (`--text-h1`)**: Font: `Outfit`, Size: `2.25rem` (36px), Weight: `700`, Tracking: `-0.02em`, Line Height: `1.2`
- **Heading 2 (`--text-h2`)**: Font: `Outfit`, Size: `1.75rem` (28px), Weight: `600`, Line Height: `1.3`
- **Heading 3 (`--text-h3`)**: Font: `Outfit`, Size: `1.25rem` (20px), Weight: `600`, Line Height: `1.4`
- **Body Large (`--text-body-lg`)**: Font: `Plus Jakarta Sans`, Size: `1.0625rem` (17px), Weight: `400`, Line Height: `1.6`
- **Body Regular (`--text-body`)**: Font: `Plus Jakarta Sans`, Size: `0.9375rem` (15px), Weight: `400`, Line Height: `1.5`
- **Caption / Label (`--text-caption`)**: Font: `Plus Jakarta Sans`, Size: `0.8125rem` (13px), Weight: `500`, Tracking: `0.02em`

---

## 4. UI Components & Micro-Interactions Standards

### 1. Luxury Glassmorphism Cards
- **Border**: `1px solid rgba(255, 255, 255, 0.08)`
- **Shadow**: `0 12px 40px -10px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.05) inset`
- **Hover State**: Lift `-4px` smoothly with `cubic-bezier(0.16, 1, 0.3, 1)` transition over `300ms`. Glowing border gradient shifts from `0.08` to `0.25` opacity.

### 2. Interactive Premium Inputs & Form Fields
- **Background**: `rgba(17, 23, 38, 0.7)` with `1px solid rgba(255, 255, 255, 0.1)`
- **Focus State**: `border-color: #8b5cf6`, `box-shadow: 0 0 0 4px rgba(139, 92, 246, 0.2)`
- **Validation Feedbacks**: Micro-floating icon with smooth fade-in and clear helper text.

### 3. Glow Buttons (Primary CTA)
- **Background**: Electric Violet Gradient
- **Hover Micro-animation**: Scale `1.02`, glow opacity increase `0.4` -> `0.7`, cursor Pointer.
- **Active Click State**: Scale `0.98` for tactile feedback.

---

## 5. Animation & Motion Guidelines
- **Duration Tokens**:
  - Micro-interactions (hover, active): `150ms`
  - Medium transitions (dropdowns, tabs): `250ms`
  - Page transitions & modals: `400ms`
- **Easing Curve**: `cubic-bezier(0.16, 1, 0.3, 1)` (Apple/Framer Motion standard spring feel).

---

## 6. Theme Tokens CSS Variables Definition (`index.css` Blueprint)

```css
:root {
  /* Colors */
  --bg-dark: hsl(224, 25%, 6%);
  --surface-1: hsl(224, 22%, 10%);
  --surface-2: hsl(224, 20%, 14%);
  --glass-bg: rgba(17, 23, 38, 0.65);
  
  --primary: hsl(262, 83%, 58%);
  --primary-glow: rgba(139, 92, 246, 0.35);
  --secondary: hsl(187, 92%, 53%);
  --secondary-glow: rgba(6, 182, 212, 0.35);
  
  --text-main: hsl(210, 40%, 98%);
  --text-muted: hsl(215, 20%, 65%);
  --text-subtle: hsl(215, 15%, 45%);
  
  /* Radii */
  --radius-sm: 8px;
  --radius-md: 14px;
  --radius-lg: 24px;
  --radius-full: 9999px;
  
  /* Shadows */
  --shadow-luxury: 0 20px 50px -12px rgba(0, 0, 0, 0.6);
  --shadow-glow: 0 0 25px var(--primary-glow);
}
```
