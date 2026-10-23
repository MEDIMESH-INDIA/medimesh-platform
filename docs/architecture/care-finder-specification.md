# MEDIMESH Care Finder — Architecture & Matching Specification

## 1. Overview and Product Mission

**Care Finder** is a guided, explainable hospital discovery and decision-support capability integrated into the MEDIMESH platform. It empowers patients and families to identify hospitals matching their specific care requirements, understand exactly why each facility appears in their results, and clearly recognize which hospital information is unverified or missing.

### Clinical Boundary
Care Finder is strictly a healthcare directory discovery tool. It does **not**:
- Provide clinical diagnoses or interpret symptoms.
- Prescribe medical treatments or predict clinical outcomes.
- Provide real-time emergency capacity or act as an emergency dispatch service.

An emergency disclaimer is prominent across the experience:
> *"Care Finder is an informational discovery tool based on public records. If you are experiencing a life-threatening medical emergency, immediately call 112 or proceed to the nearest emergency department."*

---

## 2. Architecture & Data Flow

Care Finder reuses the single canonical hospital repository and database schema without introducing secondary catalogs or duplicate models.

```
[ Patient Guided Wizard ]
         │
         ▼
[ Criteria State (Client) ] ── (Care Category, Location, Mandatory/Preferences)
         │
         ▼
[ Care Finder Service ] ── (Server-side Location Filters)
         │
         ▼
[ Canonical Hospital Repository ] ── (eq publication_status = 'published')
         │
         ▼
[ Supabase PostgreSQL ] ── (public.hospitals + taxonomies + hospital_evidence)
         │
         ▼
[ Canonical Hospital Normalizer ] ── (normalizeHospital)
         │
         ▼
[ Explainable Matching Engine ] ── (matchHospitals: evaluates mandatory & preferences)
         │
         ▼
[ Partitioned Results ] ── (Confirmed Matches vs. Unable to Confirm)
         │
         ▼
[ Care Finder UI & Comparison Integration ]
```

---

## 3. Supported Criteria & Grounded Schema Fields

Every criterion maps directly to verified fields in the existing MEDIMESH database schema:

| Criterion Type | Input | Source Schema Fields | Supported Values |
| :--- | :--- | :--- | :--- |
| **Care Category / Specialty** | Selected specialty | `hospital_specialties` -> `specialties.name` | Cardiology, Orthopedics, Neurology, Pediatrics, Oncology, General Medicine, Obstetrics & Gynecology, Critical Care, etc. |
| **Administrative City** | Selected city | `public.hospitals.city` | Canonical cities (e.g., 'Navi Mumbai', 'Sindhudurg') |
| **Locality / Sector** | Selected locality | `public.hospitals.locality` | Localities mapped to city |
| **Emergency Department** | Boolean toggle | `public.hospitals.emergency_department`, `hospital_facilities.name`, `hospital_services_catalog.name` | `true`, `false`, `null` |
| **Ambulance Service** | Boolean toggle | `public.hospitals.ambulance_available`, `hospital_services_catalog.name` | `true`, `false`, `null` |
| **Intensive Care Unit (ICU)** | Boolean toggle | `public.hospitals.icu_beds`, `hospital_facilities.name` | `icu_beds > 0` or facility named 'Intensive Care Unit' |
| **Hospital Classification** | Type dropdown | `public.hospitals.hospital_type` | `general_hospital`, `speciality_hospital`, `multispeciality`, `mother_child_health_center`, `nursing_home`, `trauma_care` |
| **Facilities** | Specific facility | `hospital_facilities` -> `facilities.name` | Blood Bank, Diagnostic Imaging, Operation Theatre, Laboratory, Pharmacy, etc. |
| **Minimum Beds** | Bed threshold | `public.hospitals.total_beds` | Integer total bed count |

---

## 4. Evaluation States and Matching Rules

The explainable matching engine evaluates each criterion into one of four deterministic states:

1. **`match`**: The hospital record explicitly and positively confirms the criterion.
2. **`does_not_match`**: The hospital record explicitly contradicts the criterion (e.g., `emergency_department = false`, or hospital is located in a different city).
3. **`unknown`**: The requested attribute is not provided, null, or unverified in the public directory record.
4. **`not_applicable`**: The criterion was not selected by the user.

### Strict Data Invariants
- **Missing data is NEVER treated as a match.**
- **Missing data is NEVER silently interpreted as false or an explicit absence.**
- **Hospital names NEVER infer clinical specialties** (e.g., a hospital called "Heart Institute" without Cardiology in its specialty list evaluates as `unknown`, not `match`).
- **Unverified coordinates are NEVER used for distance ranking.** Proximity calculations remain withheld until facility entrance coordinates have verified provenance.

---

## 5. Result Partitioning and Deterministic Ordering

Matches are partitioned into two transparent, user-facing sections:

### 1. Confirmed Matches
Hospitals where **all** user-selected mandatory criteria evaluated as `match`.
- **Ordering**:
  1. Primary: Number of user preferences satisfied (`matchedPreferencesCount`, descending).
  2. Secondary (Tie-Breaker): Alphabetical by canonical hospital name (`(a.name).localeCompare(b.name)`).
- **Presentation**: Green "Confirmed Match" badge with detailed breakdown of which criteria matched.

### 2. Unable to Confirm
Hospitals matching the patient's general location where one or more mandatory criteria evaluated as `unknown` due to incomplete directory records.
- **Ordering**:
  1. Primary: Number of confirmed criteria (`matchedCriteriaCount`, descending).
  2. Secondary: Alphabetical by name.
- **Presentation**: Amber "Unable to Confirm" badge with transparent explanations of exactly which data fields were missing.

### 3. Excluded Facilities
Hospitals where at least one mandatory criterion evaluated as `does_not_match` are excluded from results and recorded in `excludedCount`.

---

## 6. Comparison Integration (Phase E.1 Continuity)

Care Finder integrates directly with MEDIMESH's existing comparison drawer and shareable URLs:
- Patients can click `+ Add to compare` on any Care Finder result.
- The global maximum of **3 hospitals** is strictly preserved.
- When two or more hospitals are selected, the comparison drawer and `/compare` route allow generating canonical comparison URLs (e.g., `/compare?compare=apollo-hospital,fortis-hospital`).
- Existing test suite `tests/shareable-comparison.test.js` passes with zero regressions.

---

## 7. Database, RLS, and Security Review

### Schema Decision: No New Migration Required
Inspection of `public.hospitals` and existing taxonomy migrations (`20260906012415_public_catalog_foundation.sql`, `20260907201237_hospital_portal_security_and_taxonomy.sql`) confirmed that:
- All required fields, foreign keys, and taxonomy relations already exist.
- Existing RLS policies (`"Public can read published hospitals"`, `"Public can read active specialties"`, `"Public can read published hospital facilities"`) permit anonymous and authenticated reads strictly for `publication_status = 'published'` records.
- Creating a new database table or modifying RLS would introduce unnecessary complexity and potential permission regressions.

### Privacy Safeguards
- **Zero Sensitive Health Data Collection**: Care Finder does not collect symptoms, clinical notes, patient names, or medical history.
- **Client-Side State**: Search criteria are managed in local component state and are not persisted in URL query strings or browser analytics.
- **Booking Isolation**: Care Finder does not touch, query, or expose home-visit bookings, patient addresses, or private doctor records.

---

## 8. Verification & Test Coverage

The test suite [`tests/care-finder.test.js`](file:///home/parth/Desktop/CODE%20PLAYGROUND/HACKATHON%20PROJECTS/MEDICARE/medicare-platform/tests/care-finder.test.js) verifies 14 test cases:
1. Individual criterion evaluation states (match, does_not_match, unknown).
2. All mandatory criteria satisfied -> `CONFIRMED`.
3. Mandatory criterion failed -> `EXCLUDED`.
4. Mandatory criterion unknown -> `UNCONFIRMED`.
5. Missing data never matches.
6. Missing data never treated as negative.
7. Empty criteria produces documented baseline.
8. Hospital name never infers specialties.
9. Deterministic tie-breaking by preference score and name.
10. Unverified coordinates cannot produce distance ranking.
11. Canonical normalizer compatibility.
12. Privacy check: no booking/patient fields exposed.
13. UI integration: `/care-finder` routes and navbar links present.
14. Phase E.1 Comparison integration: shareable links and max 3 limit preserved.

Total platform test suite: **68 tests passing across 8 test suites**.

