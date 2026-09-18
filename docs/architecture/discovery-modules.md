# MEDIMESH INDIA 2.0 — Discovery Modules Architecture Specification

## 1. Executive Overview & Scope

Phase 05 establishes the complete public healthcare discovery surface for MEDIMESH INDIA 2.0.
Spanning 10 distinct modules (Modules A through J), this layer enables citizens, patients, and healthcare navigators across India to discover, inspect, and evaluate healthcare infrastructure with uncompromising provenance, temporal clarity, and strict statutory neutrality.

### The 10 Discovery Modules
| Module | Domain Feature | Canonical Route(s) | Primary Purpose |
| :--- | :--- | :--- | :--- |
| **Module A** | Facilities Discovery | `/facilities`, `/facilities/[slug]` | Multi-type healthcare facility discovery across 6 facility classifications. |
| **Module B** | Specialties Discovery | `/specialties`, `/specialties/[slug]` | Clinical specialty taxonomy catalog with facility empanelment associations. |
| **Module C** | Doctors Discovery | `/doctors`, `/doctors/[slug]` | Healthcare practitioner profiles with public professional registration details. |
| **Module D** | Services & Capabilities | `/services`, `/services/[slug]` | Structured diagnostic, procedural, and technological capability index. |
| **Module E** | Schemes & Insurance | `/schemes`, `/schemes/[slug]` | Public health schemes & private TPA empanelment directory with tri-part separation. |
| **Module F** | Informational Tariffs | `/tariffs` | Transparent hospital and diagnostic tariff cards with temporal validity tags. |
| **Module G** | Emergency & Critical Care | `/emergency` | High-urgency directory for casualty, ICU, NICU, trauma, and blood bank readiness. |
| **Module H** | Ambulance Discovery | `/ambulances`, `/ambulances/[slug]` | Non-dispatch directory of verified medical transport providers and capabilities. |
| **Module I** | Pharmacy Discovery | `/pharmacies`, `/pharmacies/[slug]` | Non-dispensing retail and in-hospital pharmacy discovery with licensing references. |
| **Module J** | Home Healthcare Discovery | `/home-healthcare`, `/home-healthcare/[slug]` | Non-booking home nursing, palliative care, and elderly support provider directory. |

---

## 2. Core Architectural Pillars & Invariants

### 2.1 Pure Repository Pattern & In-Memory Synthetic Execution
- Public App Router pages resolve all data dependencies via the abstract `getDefaultRepository()` interface, backed in default evaluation and build modes by `SyntheticRepository`.
- **Zero External Runtime Blockers**: Page pre-rendering (`generateStaticParams`) and test suites execute without requiring live PostgreSQL instances or external REST APIs.
- Clean separation between domain entity structures (`src/features/data-architecture/domain/entities.ts`) and database ORM definitions.

### 2.2 Strict Neutrality & Zero Commercial Promotion
- **Zero Ratings or Rankings**: No star ratings, numeric reviews, "top doctor", or "best hospital" badges exist anywhere in the platform.
- **Zero Sponsored Placement**: Facilities, doctors, tariffs, and services are sorted strictly by deterministic ordering (alphabetical, city, or specialty).
- **Non-Endorsement Verification**: In MEDIMESH, "Verification" denotes solely *documentation and provenance review* of source material. It never implies clinical excellence, regulatory endorsement, or patient suitability.

### 2.3 Synthetic Demo Isolation
- All demo records carry `dataOrigin: 'SYNTHETIC_DEMO'`.
- Dedicated UI notices and source pills indicate when data is synthetic demo data.

---

## 3. Module-Specific Architectural Semantics

### 3.1 Doctor Professional Registration Language (Module C)
In strict compliance with medical ethics and regulatory boundaries:
- Doctor profiles never use "verified registration badge" or "certified doctor".
- Language is explicitly:
  > *"Public professional registration information, where available, with source, verification state, and freshness."*
- Registration items explicitly identify:
  - Medical Council / Authority (e.g., Karnataka Medical Council, Delhi Medical Council)
  - Registration Number
  - Qualification year & reported degrees
  - Provenance source citation and verification state (`VERIFIED`, `SOURCE_SUBMITTED`, `UNABLE_TO_VERIFY`)
- Mandatory non-endorsement disclaimer: Verification reflects clerical provenance review of publicly stated registration records only.

### 3.2 Time-Sensitive Availability Semantics (Modules A, D, G, H, I)
- **Generic Badges Prohibited**: Unqualified "24x7 Open" or "Always Available" badges are forbidden.
- For services, emergency departments, ICU admissions, pharmacies, and ambulance providers, time-sensitive attributes require:
  - Source attribution (`SOURCE_SUBMITTED`, `FACILITY_REPORTED`, etc.)
  - Explicit phrasing: `"Source-reported 24/7"`
  - Observation/collection timestamp and freshness state (`CURRENT`, `STALE`, `UNCONFIRMED`)
- Emergency page (`/emergency`) prominently presents an immediate crisis banner directing life-threatening medical crises to national emergency services (`112` / `108`).

### 3.3 Tri-Part Scheme & Empanelment Architecture (Module E)
Government and philanthropic health schemes (e.g., PM-JAY, CGHS, Ayushman Bharat, RGHS) must avoid giving false assurances of cashless coverage. The architecture strictly enforces a tri-part separation:
1. **Public Scheme Information**: Statutory eligibility criteria, nodal agencies, covered specialties, and official portal links.
2. **Facility-Reported Participation**: Empanelment claims stated directly by the hospital or provider without independent nodal authority verification.
3. **Source-Reviewed Participation**: Verified empanelment records cross-referenced against published nodal government empanelment gazettes or source documents.
- **Statutory Disclaimer**: Explicitly informs citizens that MEDIMESH does *not* guarantee pre-authorization approval, reimbursement, claim admissibility, or hospital cashless acceptance.

### 3.4 Temporal Semantics of Informational Tariffs (Module F)
To prevent misleading pricing perceptions:
- **Temporal State Categorization**:
  - `Active Tariff`: Effective window includes the current date.
  - `Historical / Expired Tariff`: Tariff validity period has expired; displayed with an amber historical warning.
  - `Effective period not confirmed`: Tariff without explicit start/end dates; displayed with an unconfirmed freshness disclaimer.
- **Zero "Cheapest" Comparisons**: Tariffs are listed strictly for informational transparency and price discovery. No sorting by "lowest price" or claims of discount superiority are permitted.
- **Inclusions & Exclusions**: Each tariff item details package inclusions, exclusions, bed category tier, and source documentation.

### 3.5 Non-Dispatch Ambulance Discovery (Module H)
- The ambulance module functions purely as a directory of verified transport infrastructure (Basic Life Support, Advanced Life Support, Patient Transport, Neonatal).
- **Explicit Boundary**: The application provides zero dispatch routing, live GPS tracking, queueing, or response time guarantees. Direct phone contacts and operating bases are presented with freshness timestamps.

### 3.6 Non-Dispensing Pharmacy Discovery (Module I)
- The pharmacy directory indexes licensed 24/7 hospital dispensaries and retail chemists.
- **Explicit Boundary**: MEDIMESH provides zero online ordering, shopping carts, payment gateways, prescription fulfillment, or medication delivery.
- Profiles display drug retail license references (Form 20/21 where published), delivery radius claims (facility-reported), and stock query helplines.

### 3.7 Non-Diagnostic Search Engine Extension
- The search engine (`src/features/hospitals/lib/search-engine.ts`) has been additively extended across all 10 discovery modules.
- Query interpretation relies on deterministic keyword mapping across specialties, facilities, doctor designations, tariffs, and medical equipment.
- **Zero Diagnostic Triage**: Queries are never processed through symptom checkers, algorithmic diagnostic engines, or clinical triage logic.

---

## 4. Static Site Generation (SSG) & Deterministic Routing

Every detail page across the 10 modules defines `generateStaticParams()` to pre-render static HTML at build time for all synthetic seed records:

```typescript
// Example: src/app/(public)/doctors/[slug]/page.tsx
export async function generateStaticParams() {
  const repo = getDefaultRepository();
  const doctors = await repo.listDoctors();
  return doctors.map((d) => ({ slug: d.slug }));
}
```

Pre-rendered routes include:
- `/facilities/[slug]` (18 facilities)
- `/specialties/[slug]` (All synthetic clinical specialties)
- `/doctors/[slug]` (12 doctor profiles)
- `/services/[slug]` (Core diagnostic and procedural services)
- `/schemes/[slug]` (5 major government schemes)
- `/ambulances/[slug]` (Synthetic ambulance services)
- `/pharmacies/[slug]` (Synthetic pharmacy records)
- `/home-healthcare/[slug]` (Synthetic home healthcare providers)

---

## 5. Security, Privacy & Design System Integration

1. **Patient Data Zero-Knowledge**: No patient accounts, appointments, medical histories, or PHI are gathered, stored, or processed.
2. **Design System Adherence**: All modules strictly utilize MEDIMESH tokens (`var(--surface-primary)`, `var(--primary-600)`, `var(--border-subtle)`, `var(--radius-md)`) from `src/design-system/`.
3. **Preservation of Stitch Exports**: Reference design folders (`stitch_medimesh_india(desktop)` and `stitch_medimesh_india(mobile)`) are read-only references and remain strictly unmodified.
