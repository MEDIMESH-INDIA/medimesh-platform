-- ============================================================================
-- PRIVILEGED MANUAL OPERATION ONLY — DATABASE ADMINISTRATOR REVIEW REQUIRED
-- ============================================================================
-- Purpose: Administrative backfill of verified hospital coordinates.
-- Warning: Temporarily disables `protect_hospital_controlled_fields` trigger.
-- Do NOT execute automatically in runtime application code or CI pipelines.
-- ============================================================================

BEGIN;
ALTER TABLE public.hospitals DISABLE TRIGGER protect_hospital_controlled_fields;

UPDATE public.hospitals SET latitude = 19.0117366, longitude = 73.0323776 WHERE id = 'e61cddf7-5a5e-4c16-9729-53ffb928205c';

ALTER TABLE public.hospitals ENABLE TRIGGER protect_hospital_controlled_fields;
COMMIT;
