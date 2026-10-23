-- ==============================================================================
-- MEDIMESH: Patient Emergency Contacts Unique Constraint
-- ==============================================================================
-- Enforces a 1:1 relationship between patient profile and primary emergency contact.
-- Allows ON CONFLICT (patient_id) upsert operations to succeed deterministically.
-- ==============================================================================

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint
    WHERE conname = 'patient_emergency_contacts_patient_id_key'
  ) THEN
    ALTER TABLE public.patient_emergency_contacts
      ADD CONSTRAINT patient_emergency_contacts_patient_id_key UNIQUE (patient_id);
  END IF;
END $$;

