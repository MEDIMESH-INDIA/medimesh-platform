-- Hospital portal access controls and canonical taxonomy foundation.
-- This migration is intentionally prepared for review and is not applied by Codex.

create or replace function public.is_hospital_editor(check_hospital_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select (select auth.uid()) is not null
    and exists (
      select 1
      from public.hospital_memberships membership
      where membership.hospital_id = check_hospital_id
        and membership.user_id = (select auth.uid())
        and membership.status = 'active'
        and membership.membership_role in ('owner', 'admin', 'editor')
    );
$$;

revoke execute on function public.is_hospital_editor(uuid) from public, anon;
grant execute on function public.is_hospital_editor(uuid) to authenticated, service_role;

create or replace function public.protect_hospital_controlled_fields()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select public.is_platform_admin()) then
    return new;
  end if;

  if new.id is distinct from old.id
    or new.slug is distinct from old.slug
    or new.publication_status is distinct from old.publication_status
    or new.data_status is distinct from old.data_status
    or new.latitude is distinct from old.latitude
    or new.longitude is distinct from old.longitude
    or new.created_at is distinct from old.created_at then
    raise exception using
      errcode = '42501',
      message = 'Hospital-controlled review fields cannot be changed by provider accounts.';
  end if;

  return new;
end;
$$;

revoke execute on function public.protect_hospital_controlled_fields() from public, anon, authenticated;

drop trigger if exists protect_hospital_controlled_fields on public.hospitals;
create trigger protect_hospital_controlled_fields
before update on public.hospitals
for each row execute function public.protect_hospital_controlled_fields();

drop policy if exists "Hospital members can read their hospital" on public.hospitals;
create policy "Hospital members can read their hospital"
on public.hospitals for select to authenticated
using ((select public.is_hospital_member(id)));

drop policy if exists "Hospital editors can update profile fields" on public.hospitals;
create policy "Hospital editors can update profile fields"
on public.hospitals for update to authenticated
using ((select public.is_hospital_editor(id)))
with check ((select public.is_hospital_editor(id)));

alter table public.hospital_facilities
  add column if not exists source_evidence_id uuid
  references public.hospital_evidence(id) on delete set null;

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'hospital_specialties_source_evidence_id_fkey'
      and conrelid = 'public.hospital_specialties'::regclass
  ) then
    alter table public.hospital_specialties
      add constraint hospital_specialties_source_evidence_id_fkey
      foreign key (source_evidence_id) references public.hospital_evidence(id) on delete set null;
  end if;

  if not exists (
    select 1 from pg_constraint
    where conname = 'hospital_services_catalog_source_evidence_id_fkey'
      and conrelid = 'public.hospital_services_catalog'::regclass
  ) then
    alter table public.hospital_services_catalog
      add constraint hospital_services_catalog_source_evidence_id_fkey
      foreign key (source_evidence_id) references public.hospital_evidence(id) on delete set null;
  end if;
end;
$$;

create index if not exists hospital_facilities_source_evidence_id_idx
  on public.hospital_facilities(source_evidence_id);
create index if not exists hospital_specialties_source_evidence_id_idx
  on public.hospital_specialties(source_evidence_id);
create index if not exists hospital_services_source_evidence_id_idx
  on public.hospital_services_catalog(source_evidence_id);
create index if not exists hospital_memberships_user_status_idx
  on public.hospital_memberships(user_id, status, created_at);
create index if not exists hospital_organizations_hospital_id_idx
  on public.hospital_organizations(hospital_id);
create index if not exists doctor_affiliations_directory_hospital_id_idx
  on public.doctor_affiliations_directory(hospital_id);
create index if not exists doctor_hospital_affiliations_hospital_id_idx
  on public.doctor_hospital_affiliations(hospital_id);
create index if not exists verification_requests_subject_idx
  on public.verification_requests(subject_type, subject_id, submitted_at desc);
create unique index if not exists verification_requests_one_open_subject_idx
  on public.verification_requests(subject_type, subject_id)
  where status in ('pending', 'under_review');

drop policy if exists "Hospital members can read their specialties" on public.hospital_specialties;
create policy "Hospital members can read their specialties"
on public.hospital_specialties for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Hospital editors can add specialties" on public.hospital_specialties;
create policy "Hospital editors can add specialties"
on public.hospital_specialties for insert to authenticated
with check (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital editors can remove submitted specialties" on public.hospital_specialties;
create policy "Hospital editors can remove submitted specialties"
on public.hospital_specialties for delete to authenticated
using (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital members can read their facilities" on public.hospital_facilities;
create policy "Hospital members can read their facilities"
on public.hospital_facilities for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Hospital editors can add facilities" on public.hospital_facilities;
create policy "Hospital editors can add facilities"
on public.hospital_facilities for insert to authenticated
with check (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital editors can remove submitted facilities" on public.hospital_facilities;
create policy "Hospital editors can remove submitted facilities"
on public.hospital_facilities for delete to authenticated
using (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital members can read their services" on public.hospital_services_catalog;
create policy "Hospital members can read their services"
on public.hospital_services_catalog for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Hospital editors can add services" on public.hospital_services_catalog;
create policy "Hospital editors can add services"
on public.hospital_services_catalog for insert to authenticated
with check (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital editors can remove submitted services" on public.hospital_services_catalog;
create policy "Hospital editors can remove submitted services"
on public.hospital_services_catalog for delete to authenticated
using (
  (select public.is_hospital_editor(hospital_id))
  and source_evidence_id is null
);

drop policy if exists "Hospital members can read hospital evidence" on public.hospital_evidence;
create policy "Hospital members can read hospital evidence"
on public.hospital_evidence for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Hospital members can read directory affiliations" on public.doctor_affiliations_directory;
create policy "Hospital members can read directory affiliations"
on public.doctor_affiliations_directory for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Hospital members can read provider affiliations" on public.doctor_hospital_affiliations;
create policy "Hospital members can read provider affiliations"
on public.doctor_hospital_affiliations for select to authenticated
using ((select public.is_hospital_member(hospital_id)));

drop policy if exists "Submitters can insert own requests" on public.verification_requests;
create policy "Providers can submit scoped verification requests"
on public.verification_requests for insert to authenticated
with check (
  submitted_by = (select auth.uid())
  and request_type = 'profile_verification'
  and status = 'pending'
  and reviewed_by is null
  and reviewed_at is null
  and review_notes is null
  and (
    (
      subject_type = 'hospital'
      and (select public.is_hospital_editor(subject_id))
    )
    or (
      subject_type = 'doctor'
      and exists (
        select 1
        from public.doctors doctor
        where doctor.id = subject_id
          and doctor.claimed_by_user_id = (select auth.uid())
      )
    )
  )
);

drop policy if exists "Hospital members can view hospital requests" on public.verification_requests;
create policy "Hospital members can view hospital requests"
on public.verification_requests for select to authenticated
using (
  subject_type = 'hospital'
  and (select public.is_hospital_member(subject_id))
);

grant select, update on public.hospitals to authenticated;
grant select on public.hospital_organizations, public.hospital_memberships to authenticated;
grant select, insert, delete on public.hospital_specialties to authenticated;
grant select, insert, delete on public.hospital_facilities to authenticated;
grant select, insert, delete on public.hospital_services_catalog to authenticated;
grant select on public.doctor_affiliations_directory, public.doctor_hospital_affiliations to authenticated;
grant select on public.hospital_evidence to authenticated;
grant select, insert on public.verification_requests to authenticated;

insert into public.specialties (slug, name, description)
values
  ('cardiology', 'Cardiology', 'Heart and cardiovascular care'),
  ('critical-care', 'Critical Care', 'Care for critically ill patients'),
  ('dermatology', 'Dermatology', 'Skin, hair, and nail care'),
  ('ent', 'ENT', 'Ear, nose, and throat care'),
  ('general-medicine', 'General Medicine', 'Adult primary and internal medicine'),
  ('nephrology', 'Nephrology', 'Kidney care'),
  ('neurology', 'Neurology', 'Brain and nervous system care'),
  ('obstetrics-gynecology', 'Obstetrics & Gynecology', 'Pregnancy and reproductive healthcare'),
  ('oncology', 'Oncology', 'Cancer diagnosis and treatment'),
  ('orthopedics', 'Orthopedics', 'Bone, joint, and musculoskeletal care'),
  ('pediatrics', 'Pediatrics', 'Medical care for children'),
  ('urology', 'Urology', 'Urinary tract and related surgical care')
on conflict (slug) do nothing;

insert into public.facilities (slug, name, description)
values
  ('blood-bank', 'Blood Bank', 'Blood storage and transfusion support'),
  ('diagnostic-imaging', 'Diagnostic Imaging', 'Imaging and radiology infrastructure'),
  ('emergency-department', 'Emergency Department', 'Dedicated emergency care department'),
  ('intensive-care-unit', 'Intensive Care Unit', 'Critical care infrastructure'),
  ('laboratory', 'Laboratory', 'Clinical laboratory infrastructure'),
  ('operation-theatre', 'Operation Theatre', 'Surgical theatre infrastructure'),
  ('pharmacy', 'Pharmacy', 'On-site medicine dispensing facility')
on conflict (slug) do nothing;

insert into public.services (slug, name, description)
values
  ('ambulance-services', 'Ambulance Services', 'Patient transport services'),
  ('diagnostic-services', 'Diagnostic Services', 'Clinical diagnostic services'),
  ('emergency-care', 'Emergency Care', 'Non-scheduled emergency treatment'),
  ('inpatient-care', 'Inpatient Care', 'Admitted patient care'),
  ('outpatient-consultation', 'Outpatient Consultation', 'Scheduled outpatient consultations'),
  ('pharmacy-services', 'Pharmacy Services', 'Prescription dispensing services')
on conflict (slug) do nothing;
