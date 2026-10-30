# MEDIMESH Codebase Cleanup — Deleted Files Record

**Repository**: `MEDIMESH-INDIA/medimesh-platform`  
**Branch**: `chore/codebase-cleanup`  
**Date**: October 31, 2026  
**Auditor**: MEDIMESH Engineering & QA Hygiene Team  

This document provides a complete audit trail of all candidate files evaluated and deleted during the MEDIMESH repository cleanup pass. Every file was inspected at the content level, checked for references across all source files, scripts, CI/CD pipelines, and configuration files, and confirmed obsolete before deletion.

---

## Summary of Deleted Files

| # | File Path | Original Size | Line Count | Classification | Technical Justification |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | `import_report.md` | 1.8 KB | 56 lines | Redundant Scratch Report | Pre-import checkpoint report superseded by `import_completion_report.md`. Proposed dropping auth foreign keys, which was rejected in favor of the decoupled `public.doctors` architecture. |
| 2 | `runtime_bug_report.md` | 1.5 KB | 41 lines | Transient Debug Report | Documented PostgREST Error 42703 (`professional_summary` column mismatch). The bug was permanently resolved in `src/lib/data/doctorRepository.js`. |
| 3 | `import_doctors.mjs` | 4.8 KB | 158 lines | Deprecated Schema Script | Prototype script generating SQL for the discarded `doctor_profiles` schema. Superseded by `scripts/data-import/import_navi_mumbai_doctors.mjs` which populates `public.doctors`. |
| 4 | `seed_doctors.sql` | 4.9 KB | 63 lines | Invalid Schema Seed | Contained SQL targeting `public.doctor_profiles`. In the production architecture, `doctor_profiles.doctor_id` enforces a foreign key constraint to `auth.users`, making this seed unexecutable. Canonical seed migration resides in `supabase/migrations/20260907000002_seed_canonical_doctors.sql`. |
| 5 | `tmp/test_routes.mjs` | 1.4 KB | 52 lines | Obsolete Scratch Test | Ad-hoc Puppeteer script in `tmp/`. Imported `puppeteer` (not present in `package.json`). Superseded by official test runner `node --test tests/*.test.js` (143 passing tests). Directory `tmp/` removed. |
| 6 | `supabase/apply_locations.sql` | 1.4 KB | 14 lines | Broken SQL Snippet | Contained raw `UPDATE public.hospitals` statements without trigger bypass. Failed execution due to `protect_hospital_controlled_fields` trigger. Superseded by `supabase/queries/apply_locations_with_bypass.sql`. |
| 7 | `supabase/check_tables.sql` | 145 B | 5 lines | Ad-hoc Scratch Query | Single query testing `information_schema.tables` for `home_visit_bookings` during initial schema provisioning. Redundant with canonical migrations and table verification queries. |

---

## Detailed File-by-File Analysis

### 1. `import_report.md`
- **Path**: `medicare-platform/import_report.md`
- **Content Summary**: A preliminary feasibility report written before doctor catalog migration. Explicitly concluded:
  > *"Rows inserted: 0 (Pending schema review)... Migration applied: NONE. Awaiting your approval before applying this material schema change."*
  It proposed dropping foreign key constraints on `public.doctor_profiles` (`ALTER TABLE public.doctor_profiles DROP CONSTRAINT doctor_profiles_doctor_id_fkey`), which was rejected because unclaimed public doctors must not compromise auth account integrity.
- **Reference Check**:
  - `package.json`: None
  - `.github/workflows/`: None
  - `src/` & `tests/`: None
- **Historical Preservation**: All valid data points (30 IMR rows, 20 Home Visit rows, 6 NMC verified, 44 pending) and final architectural decisions are fully preserved in `docs/reports/import_completion_report.md` and `supabase/migrations/20260907000001_canonical_doctors.sql`.

---

### 2. `runtime_bug_report.md`
- **Path**: `medicare-platform/runtime_bug_report.md`
- **Content Summary**: Detailed Root Cause Analysis (RCA) regarding PostgREST error `42703 (column doctors.professional_summary does not exist)` caused by stale select fields in `doctorRepository.js`.
- **Reference Check**:
  - No active references in source code, scripts, or build configs.
- **Historical Preservation**: The fix is permanent and regression-tested in `tests/doctor-filter-panel.test.js` and `tests/home-visit-eligibility.test.js`.

---

### 3. `import_doctors.mjs`
- **Path**: `medicare-platform/import_doctors.mjs`
- **Content Summary**: Standalone script that parsed `raw_data/*.xlsx` and wrote out `seed_doctors.sql` targeting `public.doctor_profiles`.
- **Reference Check**:
  - No references in `package.json` scripts, CI workflows, or dynamic imports.
- **Historical Preservation**: The operational ingestion logic was rewritten to target `public.doctors` and `public.doctor_affiliations_directory` in `scripts/data-import/import_navi_mumbai_doctors.mjs` with full dry-run safety locks.

---

### 4. `seed_doctors.sql`
- **Path**: `medicare-platform/seed_doctors.sql`
- **Content Summary**: Raw SQL insertions into `public.doctor_profiles (doctor_id, slug, public_display_name, ...)`.
- **Reference Check**:
  - No references in database migrations, build scripts, or deployment configs.
- **Technical Justification**: If accidentally executed in Supabase, this script would fail with foreign key violation errors against `auth.users`. Canonical seed data is already permanently applied in production and tracked in migration `supabase/migrations/20260907000002_seed_canonical_doctors.sql`.

---

### 5. `tmp/test_routes.mjs`
- **Path**: `medicare-platform/tmp/test_routes.mjs`
- **Content Summary**: 52-line script using `puppeteer` to iterate over 17 routes on `http://localhost:5173`.
- **Reference Check**:
  - Unreferenced. `puppeteer` is not declared in `package.json` dependencies; running this script fails with `ERR_MODULE_NOT_FOUND`.
- **Technical Justification**: The project uses the Node.js native test runner (`node --test tests/*.test.js`) and Playwright for automated integration and regression testing. The temporary directory `tmp/` was pruned.

---

### 6. `supabase/apply_locations.sql`
- **Path**: `medicare-platform/supabase/apply_locations.sql`
- **Content Summary**: 12 `UPDATE public.hospitals SET latitude = ..., longitude = ...` statements without trigger management.
- **Reference Check**:
  - Generated by `resolve-hospital-locations.mjs`.
- **Technical Justification**: The database table `public.hospitals` enforces a trigger `protect_hospital_controlled_fields` that prevents unprivileged direct updates. Running this SQL produces a database trigger exception. The correct, trigger-safe operational script is preserved at `supabase/queries/apply_locations_with_bypass.sql`.

---

### 7. `supabase/check_tables.sql`
- **Path**: `medicare-platform/supabase/check_tables.sql`
- **Content Summary**:
  ```sql
  SELECT EXISTS (
      SELECT FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name = 'home_visit_bookings'
  );
  ```
- **Technical Justification**: One-line diagnostic scratch file used during Phase 5 verification. Fully redundant with standard database introspection and `supabase/queries/verify_counts.sql`.

---

## Confirmation of Data & Architecture Integrity
1. **Zero Production Data Loss**: No production tables, rows, or storage objects were modified.
2. **Zero Migration Tampering**: All 19 schema migrations in `supabase/migrations/` remain strictly immutable.
3. **Preservation of Reference Data**: Canonical hospital coordinate ground truth was retained in `scripts/data/hospitals.json`.
4. **Preservation of Operational Queries**: Critical DBA verification and trigger-bypass queries were organized into `supabase/queries/`.

