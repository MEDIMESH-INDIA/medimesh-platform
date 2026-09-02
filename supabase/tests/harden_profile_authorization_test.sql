begin;

create temporary table security_test_results (
  label text not null,
  passed boolean not null,
  detail text
) on commit drop;

grant select, insert on table pg_temp.security_test_results to authenticated;

create function pg_temp.record_check(condition boolean, label text)
returns text
language plpgsql
as $$
begin
  insert into pg_temp.security_test_results values (label, coalesce(condition, false), null);
  return label;
end;
$$;

create function pg_temp.expect_lives(statement text, label text)
returns text
language plpgsql
as $$
begin
  execute statement;
  insert into pg_temp.security_test_results values (label, true, null);
  return label;
exception when others then
  insert into pg_temp.security_test_results values (label, false, sqlstate || ': ' || sqlerrm);
  return label;
end;
$$;

create function pg_temp.expect_error(
  statement text,
  expected_state text,
  ignored_message text,
  label text
)
returns text
language plpgsql
as $$
begin
  execute statement;
  insert into pg_temp.security_test_results values (label, false, 'statement unexpectedly succeeded');
  return label;
exception when others then
  insert into pg_temp.security_test_results
  values (label, sqlstate = expected_state, sqlstate || ': ' || sqlerrm);
  return label;
end;
$$;

create function pg_temp.expect_zero_rows(statement text, ignored_query text, label text)
returns text
language plpgsql
as $$
declare
  affected_rows bigint;
begin
  execute statement;
  get diagnostics affected_rows = row_count;
  insert into pg_temp.security_test_results
  values (label, affected_rows = 0, 'affected rows: ' || affected_rows);
  return label;
exception when others then
  insert into pg_temp.security_test_results values (label, false, sqlstate || ': ' || sqlerrm);
  return label;
end;
$$;

create function pg_temp.record_is(actual integer, expected integer, label text)
returns text
language plpgsql
as $$
begin
  insert into pg_temp.security_test_results
  values (label, actual = expected, 'actual: ' || actual || ', expected: ' || expected);
  return label;
end;
$$;

create function pg_temp.finish_security_tests()
returns jsonb
language plpgsql
as $$
declare
  failed_count integer;
  result jsonb;
begin
  select count(*) filter (where not passed),
         jsonb_build_object(
           'total', count(*),
           'passed', count(*) filter (where passed),
           'failed', count(*) filter (where not passed)
         )
  into failed_count, result
  from pg_temp.security_test_results;

  if failed_count > 0 then
    raise exception 'Security tests failed: %', (
      select jsonb_agg(jsonb_build_object('label', label, 'detail', detail))
      from pg_temp.security_test_results
      where not passed
    );
  end if;

  return result;
end;
$$;

-- These tests use the two existing profile IDs as principals, alter fixture
-- state only inside this transaction, and roll everything back at the end.
select set_config(
  'medimesh_test.patient_id',
  (select id::text from public.profiles order by id limit 1),
  true
);
select set_config(
  'medimesh_test.second_id',
  (select id::text from public.profiles order by id offset 1 limit 1),
  true
);

select pg_temp.record_check(
  current_setting('medimesh_test.patient_id', true) is not null
  and current_setting('medimesh_test.second_id', true) is not null
  and current_setting('medimesh_test.patient_id') <> current_setting('medimesh_test.second_id'),
  'two distinct existing users are available for ownership tests'
);

-- Least-privilege and protected-column contract.
select pg_temp.record_check(not has_table_privilege('anon', 'public.profiles', 'UPDATE'),
  'anon has no profile UPDATE privilege');
select pg_temp.record_check(not has_table_privilege('authenticated', 'public.profiles', 'UPDATE'),
  'authenticated has no table-wide profile UPDATE privilege');
select pg_temp.record_check(has_column_privilege('authenticated', 'public.profiles', 'first_name', 'UPDATE'),
  'authenticated may update first_name');
select pg_temp.record_check(has_column_privilege('authenticated', 'public.profiles', 'city', 'UPDATE'),
  'authenticated may update city');
select pg_temp.record_check(has_column_privilege('authenticated', 'public.profiles', 'onboarding_completed', 'UPDATE'),
  'authenticated may update onboarding_completed');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'id', 'UPDATE'),
  'authenticated may not update id');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'role', 'UPDATE'),
  'authenticated may not update role');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'verification_status', 'UPDATE'),
  'authenticated may not update verification_status');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'email', 'UPDATE'),
  'authenticated may not update email');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'created_at', 'UPDATE'),
  'authenticated may not update created_at');
select pg_temp.record_check(not has_column_privilege('authenticated', 'public.profiles', 'updated_at', 'UPDATE'),
  'authenticated may not update updated_at');
select pg_temp.record_check(not has_table_privilege('authenticated', 'public.profiles', 'INSERT'),
  'authenticated clients cannot create profile rows');
select pg_temp.record_check(not has_table_privilege('authenticated', 'public.profiles', 'DELETE'),
  'authenticated clients cannot delete profile rows');
select pg_temp.record_check(to_regprocedure('public.protect_profile_fields()') is null,
  'broken protect_profile_fields function is removed');
select pg_temp.record_check(not exists (
  select 1 from pg_trigger
  where tgname = 'check_profile_fields_before_update'
    and tgrelid = 'public.profiles'::regclass
), 'broken profile protection trigger is removed');

-- Prepare reversible fixtures. No changes survive the final rollback.
update public.profiles
set role = 'patient', verification_status = 'pending', onboarding_completed = false
where id in (
  current_setting('medimesh_test.patient_id')::uuid,
  current_setting('medimesh_test.second_id')::uuid
);
delete from public.patient_medical_profiles
where id in (
  current_setting('medimesh_test.patient_id')::uuid,
  current_setting('medimesh_test.second_id')::uuid
);
delete from public.doctor_qualifications
where doctor_id in (
  current_setting('medimesh_test.patient_id')::uuid,
  current_setting('medimesh_test.second_id')::uuid
);
delete from public.hospital_details
where id in (
  current_setting('medimesh_test.patient_id')::uuid,
  current_setting('medimesh_test.second_id')::uuid
);

-- Patient profile and patient-table behavior.
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('medimesh_test.patient_id'), true);

select pg_temp.expect_lives(
  $$update public.profiles set first_name = 'Security test patient' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  'patient updates own first_name'
);
select pg_temp.expect_lives(
  $$update public.profiles set city = 'Security test city' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  'patient updates own city'
);
select pg_temp.expect_lives(
  $$update public.profiles set onboarding_completed = true where id = current_setting('medimesh_test.patient_id')::uuid$$,
  'patient updates onboarding_completed'
);
select pg_temp.expect_error(
  $$update public.profiles set role = 'admin' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot become admin'
);
select pg_temp.expect_error(
  $$update public.profiles set role = 'doctor' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot become doctor'
);
select pg_temp.expect_error(
  $$update public.profiles set role = 'hospital' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot become hospital'
);
select pg_temp.expect_error(
  $$update public.profiles set verification_status = 'verified' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot self-verify'
);
select pg_temp.expect_error(
  $$update public.profiles set verification_status = 'rejected' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot self-reject'
);
select pg_temp.expect_error(
  $$update public.profiles set email = 'blocked@example.invalid' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'patient cannot directly change profile email'
);
select pg_temp.expect_zero_rows(
  $$update public.profiles set first_name = 'cross-user-write' where id = current_setting('medimesh_test.second_id')::uuid returning id::text$$,
  $$select null::text where false$$,
  'patient A cannot update patient B profile'
);
select pg_temp.expect_lives(
  $$insert into public.patient_medical_profiles (id, blood_group) values (current_setting('medimesh_test.patient_id')::uuid, 'O+')$$,
  'patient inserts own medical profile'
);
select pg_temp.expect_lives(
  $$insert into public.patient_emergency_contacts (patient_id, contact_name, phone) values (current_setting('medimesh_test.patient_id')::uuid, 'Security Test', '0000000000')$$,
  'patient inserts own emergency contact'
);
select pg_temp.expect_error(
  $$insert into public.doctor_qualifications (doctor_id, medical_registration_number, medical_council) values (current_setting('medimesh_test.patient_id')::uuid, 'BLOCKED', 'BLOCKED')$$,
  '42501', null, 'patient cannot insert a doctor qualification'
);
select pg_temp.expect_error(
  $$insert into public.hospital_details (id, hospital_type) values (current_setting('medimesh_test.patient_id')::uuid, 'BLOCKED')$$,
  '42501', null, 'patient cannot insert hospital details'
);

-- Doctor behavior, using the second account as a rolled-back fixture.
reset role;
update public.profiles
set role = 'doctor', onboarding_completed = false
where id = current_setting('medimesh_test.second_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('medimesh_test.second_id'), true);

select pg_temp.expect_error(
  $$update public.profiles set role = 'admin' where id = current_setting('medimesh_test.second_id')::uuid$$,
  '42501', null, 'doctor cannot become admin'
);
select pg_temp.expect_lives(
  $$insert into public.doctor_qualifications (doctor_id, medical_registration_number, medical_council) values (current_setting('medimesh_test.second_id')::uuid, 'TEST-REG', 'TEST-COUNCIL')$$,
  'doctor inserts own qualification'
);
select pg_temp.expect_error(
  $$insert into public.patient_medical_profiles (id, blood_group) values (current_setting('medimesh_test.second_id')::uuid, 'A+')$$,
  '42501', null, 'doctor cannot insert a patient medical profile'
);
select pg_temp.expect_error(
  $$insert into public.patient_emergency_contacts (patient_id, contact_name, phone) values (current_setting('medimesh_test.second_id')::uuid, 'Blocked', '0000000000')$$,
  '42501', null, 'doctor cannot insert a patient emergency contact'
);
select pg_temp.expect_lives(
  $$update public.profiles set onboarding_completed = true where id = current_setting('medimesh_test.second_id')::uuid$$,
  'doctor onboarding completion remains writable'
);

-- Hospital behavior, reusing the second rolled-back fixture.
reset role;
update public.profiles
set role = 'hospital', onboarding_completed = false
where id = current_setting('medimesh_test.second_id')::uuid;
insert into public.hospital_details (id, hospital_type)
values (current_setting('medimesh_test.second_id')::uuid, 'Security Test');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('medimesh_test.second_id'), true);

select pg_temp.expect_error(
  $$update public.profiles set role = 'admin' where id = current_setting('medimesh_test.second_id')::uuid$$,
  '42501', null, 'hospital cannot become admin'
);
select pg_temp.expect_lives(
  $$update public.hospital_details set state = 'Security Test State' where id = current_setting('medimesh_test.second_id')::uuid$$,
  'hospital updates own hospital details'
);
select pg_temp.expect_lives(
  $$insert into public.hospital_services (id, specialties) values (current_setting('medimesh_test.second_id')::uuid, '[]')$$,
  'hospital inserts own hospital services'
);
select pg_temp.expect_lives(
  $$update public.profiles set onboarding_completed = true where id = current_setting('medimesh_test.second_id')::uuid$$,
  'hospital onboarding completion remains writable'
);

-- A patient still cannot update a pre-existing hospital row under their ID.
reset role;
insert into public.hospital_details (id, hospital_type)
values (current_setting('medimesh_test.patient_id')::uuid, 'Server Fixture');
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('medimesh_test.patient_id'), true);
select pg_temp.expect_zero_rows(
  $$update public.hospital_details set state = 'blocked' where id = current_setting('medimesh_test.patient_id')::uuid returning id::text$$,
  $$select null::text where false$$,
  'patient cannot update hospital details'
);

-- Server-controlled status remains protected even when its starting value is verified.
reset role;
update public.profiles
set verification_status = 'verified'
where id = current_setting('medimesh_test.patient_id')::uuid;
set local role authenticated;
select set_config('request.jwt.claim.sub', current_setting('medimesh_test.patient_id'), true);
select pg_temp.expect_error(
  $$update public.profiles set verification_status = 'pending' where id = current_setting('medimesh_test.patient_id')::uuid$$,
  '42501', null, 'verified user cannot reset verification to pending'
);

reset role;
select pg_temp.record_is(
  (select count(*)::integer from pg_policies
   where schemaname = 'public'
     and tablename in (
       'profiles',
       'patient_medical_profiles',
       'patient_emergency_contacts',
       'doctor_affiliations',
       'doctor_qualifications',
       'doctor_specializations',
       'hospital_details',
       'hospital_services'
     )
     and roles = array['authenticated']::name[]),
  30,
  'all hardened policies target authenticated explicitly'
);
select pg_temp.record_check(
  not has_table_privilege('anon', 'public.patient_medical_profiles', 'SELECT')
  and not has_table_privilege('anon', 'public.patient_medical_profiles', 'INSERT')
  and not has_table_privilege('anon', 'public.patient_medical_profiles', 'UPDATE')
  and not has_table_privilege('anon', 'public.patient_medical_profiles', 'DELETE'),
  'anon has no patient-table CRUD privileges'
);
select pg_temp.record_check(
  not has_table_privilege('anon', 'public.doctor_qualifications', 'SELECT')
  and not has_table_privilege('anon', 'public.doctor_qualifications', 'INSERT')
  and not has_table_privilege('anon', 'public.doctor_qualifications', 'UPDATE')
  and not has_table_privilege('anon', 'public.doctor_qualifications', 'DELETE'),
  'anon has no doctor-table CRUD privileges'
);
select pg_temp.record_check(
  not has_table_privilege('anon', 'public.hospital_details', 'SELECT')
  and not has_table_privilege('anon', 'public.hospital_details', 'INSERT')
  and not has_table_privilege('anon', 'public.hospital_details', 'UPDATE')
  and not has_table_privilege('anon', 'public.hospital_details', 'DELETE'),
  'anon has no hospital-table CRUD privileges'
);

select pg_temp.finish_security_tests() as security_test_summary;
rollback;
