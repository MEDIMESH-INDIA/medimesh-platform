# MEDIMESH DIRECTORY RUNTIME DATA BUG

## ROOT CAUSE
The `searchDoctors` repository function was querying for the `professional_summary` and `years_of_experience` columns, which do not exist in the new `public.doctors` schema (the correct column is `experience_years`). PostgREST rigidly rejects queries requesting undefined columns. This triggered a silent failure in the `try/catch` block, which then legitimately returned an empty array `[]` because the `USE_DEMO_FALLBACK` was appropriately disabled. Additionally, the existing repository lacked dynamic Supabase query filtering and facet generation, relying on the disabled demo fallback.

## EXACT SUPABASE QUERY ERROR
ERROR CODE: 42703
ERROR MESSAGE: column doctors.professional_summary does not exist

## DIRECT ANON QUERY
Published doctors count       50
Home visit doctors count      20

## REPOSITORY PIPELINE
Raw rows                      12 (default page size via `.range()`)
Normalized rows               12
After filters                 12 (default unfiltered)

## UI
/doctors                      50
/home-visits                  20

## NETWORK
Doctor request status         200 OK
Response                      Array of normalized canonical doctor objects with proper headers

## FACETS
Specializations populated     PASS
Hospitals populated           PASS

## QUALITY
npm run lint                  PASS
npm run build                 PASS
npm run check                 PASS
Browser console               CLEAN

## FILES MODIFIED
- `src/lib/data/doctorRepository.js` (Removed stale column selects, safely mapped canonical specialization, implemented dynamic Supabase text/ilike filtering, and implemented dynamic facet querying against `public.doctors`).

READY FOR USER REVIEW
STOP.
