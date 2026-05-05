---
name: Design System
description: Tailwind v4 design tokens, color palette, and component patterns used across the app
type: project
---

**Landing page background:** `#0b1929` dark navy with radial-gradient overlays (indigo/emerald/rose).

**Inner pages background:** `bg-slate-50` white-gray.

**Module accent colors:**
- Showroom / Configurator: indigo-600
- Management: emerald-600
- Reclamatii: rose-600
- Tasks: teal-600
- Activity: orange-600
- Analytics: purple-600

**Navbar:** White sticky header, active route = `bg-indigo-50 text-indigo-700` pill, mobile hamburger slides down with `animate-slide-down`.

**Card pattern (management dashboard):** `border-l-4 border-l-{color}` left accent on white card with `shadow-sm hover:shadow-lg`.

**Configurator sections:** `StepSection` component with numbered badge (indigo/blue/slate accent).

**Custom CSS utilities in globals.css:** `.animate-fade-in`, `.animate-slide-up`, `.animate-slide-down`, `.animate-pulse-dot` — all defined as `@keyframes` + class pairs (Tailwind v4 compatible).

**How to apply:** New pages should follow inner-page pattern (slate-50 bg + white cards + colored accents). Landing uses dark glassmorphism. Always use existing accent maps rather than hardcoding colors.
