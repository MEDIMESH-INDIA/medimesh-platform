# MEDIMESH INDIA 2.0

> A unified healthcare discovery, comparison, and navigation platform for India.

## Phase 01: Project Foundation

This repository contains the foundational application scaffold for MEDIMESH INDIA 2.0, built on Next.js App Router, React 19, TypeScript, and Tailwind CSS v4.

### Design System: "Warm Rationalism & Data Transparency"

The visual architecture is derived canonically from `DESIGN.md` ("MediMesh India Canvas"):
- **Primary Institutional Anchor:** `#005C55` (Deep Pine-Teal)
- **Primary Container:** `#0F766E`
- **Secondary Public Data Blue:** `#0051D5`
- **Caution / Freshness Warning:** `#7D4200`
- **Error:** `#BA1A1A`
- **Surfaces:** `#FAF8FF` warm off-white canvas
- **Typography:** Plus Jakarta Sans (headings/display) and Inter (body/labels/data) loaded via `next/font/google`
- **Responsive Breakpoints:** Mobile (`< 640px`), Tablet (`640px–1024px`), Desktop (`> 1024px`), Max Content Width `1280px`

### Project Architecture

```text
medimesh-app/
├── database/               # Database migrations, schemas, seeds (scaffold)
├── src/
│   ├── app/                # App Router layouts, routes, error/loading states
│   │   ├── (public)/       # Public discovery routes layout
│   │   ├── (user)/         # Authenticated user routes layout
│   │   ├── admin/          # Internal administration layout
│   │   ├── portal/         # Healthcare facility portal layout
│   │   ├── error.tsx       # Route-level error boundary
│   │   ├── global-error.tsx# Catastrophic root error boundary
│   │   ├── globals.css     # Design tokens as CSS variables + Tailwind v4 theme
│   │   ├── layout.tsx      # Root HTML shell with font configuration
│   │   ├── loading.tsx     # Structural route transition loading state
│   │   ├── not-found.tsx   # 404 state with platform navigation
│   │   └── page.tsx        # Foundation verification placeholder homepage
│   ├── components/         # Shared component library (scaffold)
│   ├── design-system/      # Centralized design tokens (tokens.ts, index.ts)
│   ├── features/           # Domain-oriented feature modules (scaffold)
│   ├── lib/                # Configuration, utility functions, future clients
│   └── types/              # Core trust model, provenance, location contracts
└── tests/                  # Automated foundation tests (node:test)
```

### Safety & Trust Boundary Architecture

MEDIMESH strictly adheres to core safety principles:
- Information is categorized under 5 trust states: `PUBLIC_SOURCE`, `FACILITY_REPORTED`, `MEDIMESH_VERIFIED`, `PENDING_VERIFICATION`, and `NOT_CONFIRMED`.
- Location is categorized as `SELECTED`, `APPROXIMATE`, or `ACTUAL` (only when explicitly authorized).
- Distances are strictly expressed as approximate estimates (`~X.X km approx`).
- Non-clinical, non-ranking, and emergency disclaimers are enforced at the type and data contract level.

### Development Commands

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Run automated tests
npm test

# Run ESLint
npm run lint

# Validate TypeScript types
npx tsc --noEmit

# Create optimized production build
npm run build
```
