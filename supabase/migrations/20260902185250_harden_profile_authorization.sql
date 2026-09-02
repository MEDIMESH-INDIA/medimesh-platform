begin;

-- Profiles are created by public.handle_new_user(), not by browser clients.
-- Browser users may read their own row and update only user-controlled fields.
revoke all privileges on table public.profiles from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (
  first_name,
  last_name,
  display_name,
  phone,
  avatar_url,
  city,
  country,
  onboarding_completed
) on table public.profiles to authenticated;

drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles
  for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "profiles_update_own"
  on public.profiles
  for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Column UPDATE privileges are the protected-field boundary. The old trigger
-- relied on current_user, which identifies the Postgres role rather than the
-- authenticated person, so keeping it would provide misleading protection.
drop trigger if exists check_profile_fields_before_update on public.profiles;
drop function if exists public.protect_profile_fields();

-- Role-specific onboarding tables are not available to signed-out clients.
-- Signed-in clients receive only the CRUD operations exposed by the app; RLS
-- then enforces both row ownership and the authoritative role in profiles.
revoke all privileges on table
  public.patient_medical_profiles,
  public.patient_emergency_contacts,
  public.doctor_affiliations,
  public.doctor_qualifications,
  public.doctor_specializations,
  public.hospital_details,
  public.hospital_services
from anon, authenticated;

grant select, insert, update, delete on table
  public.patient_medical_profiles,
  public.patient_emergency_contacts,
  public.doctor_affiliations,
  public.doctor_qualifications,
  public.doctor_specializations,
  public.hospital_details,
  public.hospital_services
to authenticated;

-- Patient-owned records.
drop policy if exists "patient_medical_select_own" on public.patient_medical_profiles;
drop policy if exists "patient_medical_insert_own" on public.patient_medical_profiles;
drop policy if exists "patient_medical_update_own" on public.patient_medical_profiles;
drop policy if exists "patient_medical_delete_own" on public.patient_medical_profiles;

create policy "patient_medical_select_own"
  on public.patient_medical_profiles
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_medical_insert_own"
  on public.patient_medical_profiles
  for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_medical_update_own"
  on public.patient_medical_profiles
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_medical_delete_own"
  on public.patient_medical_profiles
  for delete
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

drop policy if exists "patient_emergency_select_own" on public.patient_emergency_contacts;
drop policy if exists "patient_emergency_insert_own" on public.patient_emergency_contacts;
drop policy if exists "patient_emergency_update_own" on public.patient_emergency_contacts;
drop policy if exists "patient_emergency_delete_own" on public.patient_emergency_contacts;

create policy "patient_emergency_select_own"
  on public.patient_emergency_contacts
  for select
  to authenticated
  using (
    (select auth.uid()) = patient_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_emergency_insert_own"
  on public.patient_emergency_contacts
  for insert
  to authenticated
  with check (
    (select auth.uid()) = patient_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_emergency_update_own"
  on public.patient_emergency_contacts
  for update
  to authenticated
  using (
    (select auth.uid()) = patient_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = patient_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

create policy "patient_emergency_delete_own"
  on public.patient_emergency_contacts
  for delete
  to authenticated
  using (
    (select auth.uid()) = patient_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'patient'::public.user_role
    )
  );

-- Doctor-owned records.
drop policy if exists "doctor_affil_select_own" on public.doctor_affiliations;
drop policy if exists "doctor_affil_insert_own" on public.doctor_affiliations;
drop policy if exists "doctor_affil_update_own" on public.doctor_affiliations;
drop policy if exists "doctor_affil_delete_own" on public.doctor_affiliations;

create policy "doctor_affil_select_own"
  on public.doctor_affiliations
  for select
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_affil_insert_own"
  on public.doctor_affiliations
  for insert
  to authenticated
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_affil_update_own"
  on public.doctor_affiliations
  for update
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_affil_delete_own"
  on public.doctor_affiliations
  for delete
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

drop policy if exists "doctor_qual_select_own" on public.doctor_qualifications;
drop policy if exists "doctor_qual_insert_own" on public.doctor_qualifications;
drop policy if exists "doctor_qual_update_own" on public.doctor_qualifications;
drop policy if exists "doctor_qual_delete_own" on public.doctor_qualifications;

create policy "doctor_qual_select_own"
  on public.doctor_qualifications
  for select
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_qual_insert_own"
  on public.doctor_qualifications
  for insert
  to authenticated
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_qual_update_own"
  on public.doctor_qualifications
  for update
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_qual_delete_own"
  on public.doctor_qualifications
  for delete
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

drop policy if exists "doctor_spec_select_own" on public.doctor_specializations;
drop policy if exists "doctor_spec_insert_own" on public.doctor_specializations;
drop policy if exists "doctor_spec_update_own" on public.doctor_specializations;
drop policy if exists "doctor_spec_delete_own" on public.doctor_specializations;

create policy "doctor_spec_select_own"
  on public.doctor_specializations
  for select
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_spec_insert_own"
  on public.doctor_specializations
  for insert
  to authenticated
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_spec_update_own"
  on public.doctor_specializations
  for update
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

create policy "doctor_spec_delete_own"
  on public.doctor_specializations
  for delete
  to authenticated
  using (
    (select auth.uid()) = doctor_id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'doctor'::public.user_role
    )
  );

-- Hospital-owned records.
drop policy if exists "hospital_details_select_own" on public.hospital_details;
drop policy if exists "hospital_details_insert_own" on public.hospital_details;
drop policy if exists "hospital_details_update_own" on public.hospital_details;
drop policy if exists "hospital_details_delete_own" on public.hospital_details;

create policy "hospital_details_select_own"
  on public.hospital_details
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_details_insert_own"
  on public.hospital_details
  for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_details_update_own"
  on public.hospital_details
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_details_delete_own"
  on public.hospital_details
  for delete
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

drop policy if exists "hospital_services_select_own" on public.hospital_services;
drop policy if exists "hospital_services_insert_own" on public.hospital_services;
drop policy if exists "hospital_services_update_own" on public.hospital_services;
drop policy if exists "hospital_services_delete_own" on public.hospital_services;

create policy "hospital_services_select_own"
  on public.hospital_services
  for select
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_services_insert_own"
  on public.hospital_services
  for insert
  to authenticated
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_services_update_own"
  on public.hospital_services
  for update
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  )
  with check (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

create policy "hospital_services_delete_own"
  on public.hospital_services
  for delete
  to authenticated
  using (
    (select auth.uid()) = id
    and exists (
      select 1
      from public.profiles
      where profiles.id = (select auth.uid())
        and profiles.role = 'hospital'::public.user_role
    )
  );

commit;
