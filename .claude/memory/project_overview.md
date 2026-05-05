---
name: Naturen Configurator Project Overview
description: Full-stack Next.js 16 + Firebase app for Naturen door-sales management across 8 Romanian showrooms
type: project
---

Multi-module SaaS built for Naturen (door manufacturer/retailer), all UI in Romanian.

**Why:** Manages the complete sales lifecycle — door configuration → PDF offers → showroom daily reports → analytics → complaints → tasks.

**Stack:** Next.js 16.1.6 App Router, React 19, TypeScript, Firebase (Auth + Firestore), Tailwind CSS v4, jsPDF, Recharts, date-fns, Nodemailer.

**Modules:** Showroom (configurator + PDF), Management (CRM dashboard), Reclamatii (complaints), Depozit (coming soon), Service (coming soon).

**Auth roles:** admin > superior > management > showroom. Role-based route protection.

**Key files:**
- `app/components/Configurator.tsx` — door configurator, cart, PDF generation trigger
- `app/lib/generatePdf.ts` — jsPDF offer document
- `app/lib/offerStore.ts` — localStorage cart persistence (DoorLineItem type)
- `app/data/constants.ts` — product data, hardware pricing
- `app/management/analytics/page.tsx` — Recharts analytics dashboard
- `lib/reclamatii.ts` — complaints CRUD + Firestore subscriptions
- `contexts/AuthContext.tsx` — Firebase auth + role context
- `components/Navbar.tsx` — global sticky nav with mobile menu (added 2026-05-05)

**How to apply:** Always preserve existing business logic when changing UI; the configurator cascade (finisaj→colectie→model→price) and Firestore collection schemas are the most sensitive parts.
