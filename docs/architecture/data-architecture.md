# MEDIMESH INDIA 2.0 — Data Architecture Specification

## 1. Executive Overview & Architecture Principles

MEDIMESH INDIA 2.0 is a mobile-first healthcare discovery, comparison, and navigation platform for India.
The Data Architecture establishes a normalized, auditable relational healthcare data foundation that supports the lifecycle:
$$\text{Research Team} \longrightarrow \text{Data Collection} \longrightarrow \text{Structured Record Revision} \longrightarrow \text{Source/Provenance Attachment} \longrightarrow \text{Staging \& Validation} \longrightarrow \text{MEDIMESH Review} \longrightarrow \text{Publication} \longrightarrow \text{Public Application}$$

### Key Architectural Pillars
1. **Separation of Concerns**:
   - **Domain Layer**: Pure TypeScript entities and enums decoupled from ORM drivers.
   - **Database Model**: PostgreSQL relational schema defined in single canonical Prisma schema.
   - **Repository Boundary**: Domain interfaces with concrete Prisma and Synthetic adapters.
   - **Demo Data Isolation**: Mandatory `data_origin` tagging (`SYNTHETIC_DEMO`).
2. **Granular Record/Revision-Aware Provenance**:
   - Rather than one global facility verification state, each healthcare information block (bed capacity, casualty status, specialty, scheme empanelment, tariff) carries its own source, verification state, freshness, and review history.
3. **Non-Destructive Lifecycle**:
   - Destructive deletion (`delete`) is strictly prohibited for published or submitted healthcare records.
   - Status changes use `archive()`, `deactivate()`, `supersede()`, or `createRevision()`.
   - Hard deletion (`hardDeleteDraft`) is constrained to unpublished draft records prior to workflow submission.
4. **Strict Neutrality & Non-Endorsement**:
   - Zero quality scores, hospital rankings, "best doctor" ratings, or commercial superlatives.
   - Verification denotes *documentation & provenance review*, not clinical accreditation, medical suitability, or regulatory endorsement.
   - Zero patient medical records, personal health identifiers (PHI), or clinical triage claims.

---

## 2. Canonical Schema Location & Migration Source

- **Canonical Schema Location**: `prisma/schema.prisma`
  - Single source of truth for PostgreSQL schema, models, constraints, and Prisma Client generation.
  - No duplicate schema is maintained.
- **Migration Source**: `prisma/migrations/20260917000000_init_data_architecture/migration.sql`
  - Version-tracked SQL DDL archive mirrored in `database/migrations/001_initial_data_architecture.sql`.
- **Target Database**: PostgreSQL 15+ (relational, ACID-compliant, supports JSONB for previous/new state revisions).

---

## 3. Entity-Relationship Model

```
                    ┌───────────────────────────┐
                    │     SourceProvenance      │
                    │   (Universal Provenance)  │
                    └─────────────┬─────────────┘
                                  │ 1:N
         ┌────────────────────────┼────────────────────────┐
         │ 1:N                    │ 1:N                    │ 1:N
┌────────▼─────────┐    ┌─────────▼────────┐    ┌──────────▼─────────┐
│     Facility     │    │ FacilitySpecialty│    │   FacilityScheme   │
│ (Generic Entity) │    │  (Relational)    │    │    (Empanelment)   │
└────────┬─────────┘    └──────────────────┘    └────────────────────┘
         │ 1:1
┌────────▼─────────┐    ┌──────────────────┐    ┌────────────────────┐
│ HospitalProfile  │    │ FacilityService  │    │     TariffItem     │
│(Hospital Fields) │    │ (Capabilities)   │    │  (Informational)   │
└──────────────────┘    └──────────────────┘    └────────────────────┘
         │
┌────────▼─────────┐    ┌──────────────────┐    ┌────────────────────┐
│AvailabilityRecord│    │  DoctorProfile   │    │CorrectionSubmission│
│ (Time-Sensitive) │    │(Public Directory)│    │(Public Feedback)   │
└──────────────────┘    └──────────────────┘    └────────────────────┘
```

### 3.1 Facility & Hospital Profile Separation
- **`Facility`**: Represents any healthcare establishment generically (Hospital, Clinic, Diagnostic Lab, Specialty Centre, Emergency Facility, Rehab, Home Healthcare, Pharmacy). Holds postal location, coordinates, contact, and workflow state.
- **`HospitalProfile`**: Holds hospital-specific attributes (bed capacity, ICU beds, trauma standing, emergency intake status, medical college status). Separating this prevents polluting generic facilities with hospital-only fields.

### 3.2 Taxonomy & Relationships
- **`Specialty`** & **`FacilitySpecialty`**: Reusable discovery taxonomy (Cardiology, Orthopedics, Neurology, etc.). Linked via composite key `(facility_id, specialty_id)` with independent source citation and OPD/inpatient flags.
- **`ServiceCapability`** & **`FacilityService`**: Sourced infrastructure (3T MRI, Flat-Panel Cath Lab, 24/7 Casualty, Hemodialysis, e-Raktkosh Blood Bank).
- **`SchemeInsurance`** & **`FacilityScheme`**: Public schemes (PM-JAY, CGHS, ECHS) and TPA desks. Relationships record empanelment category, effective dates, and source. Never implies government authority endorsement.
- **`TariffItem`**: Publicly listed informational tariffs. Records service, amount, unit, currency, and effective period. Strictly non-promotional.
- **`AvailabilityRecord`**: Records observed casualty intake and capacity observations with `observedAt` and `expiresAt`. Always requires confirmation with facility before travelling; never guarantees bed admission.

---

## 4. Provenance, Verification & Freshness Model

### 4.1 Granular Verification Chain
Every verifiable entity points to a `SourceProvenance` record:
```
Record → Revision → SourceProvenance → WorkflowReview → PublishedState
```

### 4.2 Canonical Verification States
1. **`PUBLIC_SOURCE`**: Sourced from official public health portals or gazette notices.
2. **`FACILITY_REPORTED`**: Formally declared by the facility administration.
3. **`MEDIMESH_VERIFIED`**: Documentation, regulatory standing, or registration reviewed by MEDIMESH research desk. *Does not constitute clinical quality endorsement.*
4. **`PENDING_VERIFICATION`**: Information collected by research team awaiting verification review.
5. **`NOT_CONFIRMED`**: Unverified listing or unconfirmed availability.
6. **`UNABLE_TO_VERIFY`**: Record attempted verification but documentation could not be validated.

### 4.3 Freshness & Temporal Model
Healthcare data changes frequently. The schema enforces temporal awareness:
- `collected_at`: When research team gathered the data point.
- `published_at`: When source document was originally published.
- `last_reviewed_at`: When MEDIMESH verification desk last confirmed the record.
- `observed_at`: Exact timestamp for volatile operational data (e.g. casualty intake).
- `expires_at`: When an observed state is considered stale.
- `effective_from` / `effective_to`: Validity window for tariffs and scheme empanelment.

---

## 5. Research $\to$ Review $\to$ Publication Workflow

```
[DRAFT] ──(Researcher submits)──> [SUBMITTED]
                                      │
                                      ▼
                               [UNDER_REVIEW]
                                 │    │    │
            ┌────────────────────┘    │    └────────────────────┐
            ▼                         ▼                         ▼
   [NEEDS_INFORMATION]           [REJECTED]                 [APPROVED]
            │                                                   │
            └──────────(resubmit)───────────┐                   ▼
                                            │              [PUBLISHED]
                                            ▼                   │
                                      [UNDER_REVIEW]            ▼
                                                           [ARCHIVED]
```

- **Drafting**: Researchers stage data as `DRAFT`.
- **Review**: Reviewers inspect source citations and provenance.
- **Publication**: Only records in `APPROVED` state transition to `PUBLISHED`.
- **Public Visibility**: The public application only displays `PUBLISHED` records where `is_archived = false`.

---

## 6. Correction Submission Workflow

MEDIMESH provides an open correction pipeline for facilities and the public:
1. User submits correction with target entity, field, proposed value, justification, and source citation (`CorrectionStatus = SUBMITTED`).
2. Published record remains completely unaltered during review.
3. MEDIMESH review desk inspects correction (`UNDER_REVIEW`).
4. Upon acceptance (`ACCEPTED`), a new `RecordRevision` is generated, and the published record is updated with the new revision reference.

---

## 7. Demo Data Isolation Architecture

- **`data_origin` Enum**:
  - `SYNTHETIC_DEMO`: Strictly isolated demonstration records for development and UI preview.
  - `STAGED_RESEARCH`: Internal researcher staging data under review.
  - `PUBLISHED_PRODUCTION`: Verified production healthcare data.
- **Safety Constraints**:
  - Synthetic records cite `MEDIMESH Demo Data Generator (Synthetic Sample)`.
  - Zero fake government URLs or fabricated accreditation certificates are allowed.
  - Public search engine in Phase 03 continues to use the synthetic dataset, preventing accidental exposure of incomplete research staging.

---

## 8. Security, Privacy & Compliance Boundaries

- **Zero Patient Data**: Database schema contains no patient tables, no patient names, no medical diagnoses tied to individuals, and no prescriptions.
- **Zero Protected Health Information (PHI)**: MEDIMESH is a public healthcare discovery platform, not an Electronic Health Record (EHR) system.
- **Facility Coordinates**: Latitudes and longitudes represent physical facility properties, never tracking user locations.
- **Credentials Protection**: Database access is strictly server-side. `DATABASE_URL` is environment-based and never exposed to client bundles.

---

## 9. Repository Implementation Architecture

The repository layer abstracts storage behind strongly typed interfaces:
- **`IFacilityRepository`**, **`IHospitalRepository`**, **`ISpecialtyRepository`**, **`IServiceRepository`**, **`ISchemeRepository`**, **`ITariffRepository`**, **`IAvailabilityRepository`**, **`ISourceRepository`**, **`ICorrectionRepository`**, **`IAuditLogRepository`**.
- **`PrismaRepository`**: Production adapter executing relational PostgreSQL queries via Prisma Client.
- **`SyntheticRepository`**: In-memory adapter backed by the Phase 03 synthetic dataset, allowing local dev and test runner to execute with zero external database dependencies.
