-- =============================================================================
-- Migration: 20260917000000_init_data_architecture
-- Description: Initial Relational Healthcare Data Architecture for MEDIMESH INDIA 2.0
-- Canonical Schema: prisma/schema.prisma
-- Target: PostgreSQL
-- =============================================================================

-- 1. Create Enums
CREATE TYPE "VerificationState" AS ENUM (
  'PUBLIC_SOURCE',
  'FACILITY_REPORTED',
  'MEDIMESH_VERIFIED',
  'PENDING_VERIFICATION',
  'NOT_CONFIRMED',
  'UNABLE_TO_VERIFY'
);

CREATE TYPE "WorkflowStatus" AS ENUM (
  'DRAFT',
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_INFORMATION',
  'APPROVED',
  'REJECTED',
  'UNABLE_TO_VERIFY',
  'PUBLISHED',
  'ARCHIVED'
);

CREATE TYPE "CorrectionStatus" AS ENUM (
  'SUBMITTED',
  'UNDER_REVIEW',
  'NEEDS_INFORMATION',
  'ACCEPTED',
  'REJECTED',
  'UNABLE_TO_VERIFY'
);

CREATE TYPE "DataOrigin" AS ENUM (
  'SYNTHETIC_DEMO',
  'STAGED_RESEARCH',
  'PUBLISHED_PRODUCTION'
);

CREATE TYPE "FacilityCategory" AS ENUM (
  'Hospital',
  'Clinic',
  'Diagnostic_Laboratory',
  'Specialty_Centre',
  'Emergency_Critical_Care',
  'Rehabilitation',
  'Home_Healthcare',
  'Pharmacy'
);

CREATE TYPE "HospitalType" AS ENUM (
  'Super_Specialty_Hospital',
  'Multi_Specialty_Hospital',
  'Single_Specialty_Hospital',
  'Government_Medical_College_Hospital',
  'Community_Health_Center',
  'Daycare_Polyclinic'
);

CREATE TYPE "ClinicalDomain" AS ENUM (
  'Cardiology',
  'Orthopedics',
  'Neurology_Neurosurgery',
  'Oncology',
  'Nephrology_Urology',
  'Pediatrics',
  'General_Medicine',
  'Obstetrics_Gynecology',
  'Gastroenterology',
  'Emergency_Critical_Care'
);

CREATE TYPE "ServiceCategory" AS ENUM (
  'Critical_Care',
  'Diagnostic_Imaging',
  'Laboratory',
  'Surgical',
  'Therapeutic',
  'Emergency_Support'
);

CREATE TYPE "SourceType" AS ENUM (
  'FACILITY_REPORTED',
  'GOVERNMENT_PUBLICATION',
  'PUBLIC_REGISTRY',
  'PROFESSIONAL_REGISTRY',
  'OFFICIAL_SCHEME_SOURCE',
  'PUBLIC_DOCUMENT',
  'OTHER_PUBLIC_SOURCE',
  'SYNTHETIC_DEMO'
);

CREATE TYPE "AvailabilityStatus" AS ENUM (
  'ACTIVE',
  'LIMITED',
  'NOT_REPORTED',
  'CLOSED',
  'UNKNOWN'
);

-- 2. Create Source Provenance Table
CREATE TABLE "source_provenances" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "source_type" "SourceType" NOT NULL,
  "source_organization" TEXT NOT NULL,
  "source_title" TEXT,
  "source_url" TEXT,
  "published_at" TIMESTAMP(3),
  "collected_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "last_reviewed_at" TIMESTAMP(3),
  "collected_by" TEXT,
  "reviewed_by" TEXT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "notes" TEXT,
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_sources_type" ON "source_provenances"("source_type");
CREATE INDEX "idx_sources_verification" ON "source_provenances"("verification_state");
CREATE INDEX "idx_sources_origin" ON "source_provenances"("data_origin");

-- 3. Create Record Revisions Table
CREATE TABLE "record_revisions" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "revision_number" INTEGER NOT NULL,
  "change_summary" TEXT NOT NULL,
  "previous_data" JSONB,
  "newData" JSONB NOT NULL,
  "created_by" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  CONSTRAINT "uq_record_revision" UNIQUE ("entity_type", "entity_id", "revision_number")
);

CREATE INDEX "idx_revisions_entity" ON "record_revisions"("entity_type", "entity_id");

-- 4. Create Workflow Reviews Table
CREATE TABLE "workflow_reviews" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "revision_id" TEXT NOT NULL REFERENCES "record_revisions"("id") ON DELETE RESTRICT,
  "reviewer_id" TEXT NOT NULL,
  "status" "WorkflowStatus" NOT NULL,
  "decision_notes" TEXT NOT NULL,
  "reviewed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_workflow_reviews_revision" ON "workflow_reviews"("revision_id");
CREATE INDEX "idx_workflow_reviews_status" ON "workflow_reviews"("status");

-- 5. Create Facilities Table
CREATE TABLE "facilities" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" "FacilityCategory" NOT NULL,
  "ownership_type" TEXT,
  "description" TEXT NOT NULL,
  "address" TEXT NOT NULL,
  "locality" TEXT,
  "city" TEXT NOT NULL,
  "district" TEXT,
  "state" TEXT NOT NULL,
  "country" TEXT NOT NULL DEFAULT 'India',
  "postal_code" TEXT NOT NULL,
  "latitude" DOUBLE PRECISION,
  "longitude" DOUBLE PRECISION,
  "primary_phone" TEXT NOT NULL,
  "emergency_phone" TEXT,
  "email" TEXT,
  "website_url" TEXT,
  "operating_hours" TEXT,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "current_revision_id" TEXT,
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_facilities_slug" ON "facilities"("slug");
CREATE INDEX "idx_facilities_city_state" ON "facilities"("city", "state");
CREATE INDEX "idx_facilities_category" ON "facilities"("category");
CREATE INDEX "idx_facilities_workflow" ON "facilities"("workflow_status");
CREATE INDEX "idx_facilities_verification" ON "facilities"("verification_state");
CREATE INDEX "idx_facilities_origin" ON "facilities"("data_origin");

-- 6. Create Hospital Profiles Table
CREATE TABLE "hospital_profiles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL UNIQUE REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "hospital_type" "HospitalType" NOT NULL,
  "bed_capacity_total" INTEGER NOT NULL DEFAULT 0,
  "icu_bed_capacity" INTEGER NOT NULL DEFAULT 0,
  "trauma_capability" BOOLEAN NOT NULL DEFAULT FALSE,
  "emergency_intake_operational" BOOLEAN NOT NULL DEFAULT FALSE,
  "is_medical_college" BOOLEAN NOT NULL DEFAULT FALSE,
  "accreditation_summary" TEXT,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "current_revision_id" TEXT,
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_hospital_profiles_facility" ON "hospital_profiles"("facility_id");
CREATE INDEX "idx_hospital_profiles_type" ON "hospital_profiles"("hospital_type");
CREATE INDEX "idx_hospital_profiles_workflow" ON "hospital_profiles"("workflow_status");

-- 7. Create Specialties Table
CREATE TABLE "specialties" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "clinical_domain" "ClinicalDomain" NOT NULL,
  "description" TEXT,
  "is_adult" BOOLEAN NOT NULL DEFAULT TRUE,
  "is_pediatric" BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX "idx_specialties_slug" ON "specialties"("slug");
CREATE INDEX "idx_specialties_domain" ON "specialties"("clinical_domain");

-- 8. Create Facility Specialties Join Table
CREATE TABLE "facility_specialties" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "specialty_id" TEXT NOT NULL REFERENCES "specialties"("id") ON DELETE RESTRICT,
  "opd_available" BOOLEAN NOT NULL DEFAULT TRUE,
  "inpatient_available" BOOLEAN NOT NULL DEFAULT TRUE,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "uq_facility_specialty" UNIQUE ("facility_id", "specialty_id")
);

CREATE INDEX "idx_facility_specialties_facility" ON "facility_specialties"("facility_id");
CREATE INDEX "idx_facility_specialties_specialty" ON "facility_specialties"("specialty_id");

-- 9. Create Service Capabilities Table
CREATE TABLE "service_capabilities" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "slug" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "category" "ServiceCategory" NOT NULL,
  "description" TEXT
);

CREATE INDEX "idx_services_slug" ON "service_capabilities"("slug");
CREATE INDEX "idx_services_category" ON "service_capabilities"("category");

-- 10. Create Facility Services Join Table
CREATE TABLE "facility_services" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "service_id" TEXT NOT NULL REFERENCES "service_capabilities"("id") ON DELETE RESTRICT,
  "is_24x7" BOOLEAN NOT NULL DEFAULT FALSE,
  "operational_notes" TEXT,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "uq_facility_service" UNIQUE ("facility_id", "service_id")
);

CREATE INDEX "idx_facility_services_facility" ON "facility_services"("facility_id");
CREATE INDEX "idx_facility_services_service" ON "facility_services"("service_id");

-- 11. Create Doctor Profiles Table
CREATE TABLE "doctor_profiles" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "name" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "qualifications" TEXT NOT NULL,
  "specialty_id" TEXT NOT NULL REFERENCES "specialties"("id") ON DELETE RESTRICT,
  "registration_reference" TEXT,
  "opd_timings" TEXT,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_doctor_profiles_facility" ON "doctor_profiles"("facility_id");
CREATE INDEX "idx_doctor_profiles_specialty" ON "doctor_profiles"("specialty_id");

-- 12. Create Schemes Table
CREATE TABLE "schemes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "code" TEXT NOT NULL UNIQUE,
  "name" TEXT NOT NULL,
  "provider_type" TEXT NOT NULL,
  "state_scope" TEXT,
  "description" TEXT
);

CREATE INDEX "idx_schemes_code" ON "schemes"("code");

-- 13. Create Facility Schemes Join Table
CREATE TABLE "facility_schemes" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "scheme_id" TEXT NOT NULL REFERENCES "schemes"("id") ON DELETE RESTRICT,
  "empanelment_category" TEXT,
  "helpdesk_location" TEXT,
  "effective_from" TIMESTAMP(3),
  "effective_to" TIMESTAMP(3),
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "uq_facility_scheme" UNIQUE ("facility_id", "scheme_id")
);

CREATE INDEX "idx_facility_schemes_facility" ON "facility_schemes"("facility_id");
CREATE INDEX "idx_facility_schemes_scheme" ON "facility_schemes"("scheme_id");

-- 14. Create Tariffs Table
CREATE TABLE "tariffs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "service_id" TEXT NOT NULL REFERENCES "service_capabilities"("id") ON DELETE RESTRICT,
  "amount" DOUBLE PRECISION NOT NULL,
  "currency" TEXT NOT NULL DEFAULT 'INR',
  "unit" TEXT NOT NULL,
  "effective_from" TIMESTAMP(3),
  "effective_to" TIMESTAMP(3),
  "notes" TEXT,
  "workflow_status" "WorkflowStatus" NOT NULL DEFAULT 'DRAFT',
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "is_archived" BOOLEAN NOT NULL DEFAULT FALSE,
  "last_reviewed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_tariffs_facility" ON "tariffs"("facility_id");
CREATE INDEX "idx_tariffs_service" ON "tariffs"("service_id");

-- 15. Create Availability Records Table
CREATE TABLE "availability_records" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "facility_id" TEXT NOT NULL REFERENCES "facilities"("id") ON DELETE RESTRICT,
  "capability_type" TEXT NOT NULL,
  "status" "AvailabilityStatus" NOT NULL,
  "observed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "expires_at" TIMESTAMP(3),
  "source_id" TEXT NOT NULL REFERENCES "source_provenances"("id") ON DELETE RESTRICT,
  "verification_state" "VerificationState" NOT NULL DEFAULT 'PENDING_VERIFICATION',
  "requires_confirmation" BOOLEAN NOT NULL DEFAULT TRUE,
  "context_notes" TEXT,
  "data_origin" "DataOrigin" NOT NULL DEFAULT 'SYNTHETIC_DEMO',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX "idx_availability_facility" ON "availability_records"("facility_id");
CREATE INDEX "idx_availability_observed" ON "availability_records"("observed_at");

-- 16. Create Corrections Table
CREATE TABLE "corrections" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "target_entity_type" TEXT NOT NULL,
  "target_entity_id" TEXT NOT NULL,
  "target_field" TEXT NOT NULL,
  "current_value" TEXT,
  "proposed_value" TEXT NOT NULL,
  "justification" TEXT NOT NULL,
  "source_citation" TEXT NOT NULL,
  "submitter_contact" TEXT,
  "status" "CorrectionStatus" NOT NULL DEFAULT 'SUBMITTED',
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "reviewed_by" TEXT,
  "resolution_notes" TEXT,
  "resulting_revision_id" TEXT,
  "resolved_at" TIMESTAMP(3)
);

CREATE INDEX "idx_corrections_target" ON "corrections"("target_entity_type", "target_entity_id");
CREATE INDEX "idx_corrections_status" ON "corrections"("status");

-- 17. Create Audit Logs Table
CREATE TABLE "audit_logs" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "actor_id" TEXT NOT NULL,
  "actor_role" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "entity_type" TEXT NOT NULL,
  "entity_id" TEXT NOT NULL,
  "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "previous_state_ref" TEXT,
  "new_state_ref" TEXT,
  "metadata" JSONB
);

CREATE INDEX "idx_audit_logs_entity" ON "audit_logs"("entity_type", "entity_id");
CREATE INDEX "idx_audit_logs_actor" ON "audit_logs"("actor_id");
CREATE INDEX "idx_audit_logs_timestamp" ON "audit_logs"("timestamp");
