-- =============================================================================
-- MEDIMESH INDIA 2.0 — Reference Database Migration Archive
-- File: database/migrations/003_corrections_trust.sql
-- Canonical Location: prisma/migrations/20260919000000_corrections_trust/migration.sql
-- Target Database: PostgreSQL
-- =============================================================================

-- 1. Alter Table corrections: Add authenticated user relation, snapshot protection fields, drop guest contact
ALTER TABLE "corrections" ADD COLUMN "user_id" TEXT NOT NULL;
ALTER TABLE "corrections" ADD COLUMN "current_value_at_submission" TEXT;
ALTER TABLE "corrections" ADD COLUMN "target_revision_id_at_submission" TEXT;
ALTER TABLE "corrections" DROP COLUMN IF EXISTS "submitter_contact";

-- 2. Create Index on corrections(user_id)
CREATE INDEX "corrections_user_id_idx" ON "corrections"("user_id");

-- 3. Add Foreign Key on corrections(user_id) -> users(id)
ALTER TABLE "corrections" ADD CONSTRAINT "corrections_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 4. Create Table correction_evidence_items (Append-only clarification evidence for NEEDS_INFORMATION workflow)
CREATE TABLE "correction_evidence_items" (
  "id" TEXT NOT NULL,
  "correction_id" TEXT NOT NULL,
  "evidence_text" TEXT NOT NULL,
  "source_url" TEXT,
  "submitted_by" TEXT NOT NULL,
  "submitted_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "correction_evidence_items_pkey" PRIMARY KEY ("id")
);

-- 5. Create Indexes on correction_evidence_items
CREATE INDEX "correction_evidence_items_correction_id_idx" ON "correction_evidence_items"("correction_id");
CREATE INDEX "correction_evidence_items_submitted_by_idx" ON "correction_evidence_items"("submitted_by");

-- 6. Add Foreign Key on correction_evidence_items(correction_id) -> corrections(id)
ALTER TABLE "correction_evidence_items" ADD CONSTRAINT "correction_evidence_items_correction_id_fkey" FOREIGN KEY ("correction_id") REFERENCES "corrections"("id") ON DELETE CASCADE ON UPDATE CASCADE;
