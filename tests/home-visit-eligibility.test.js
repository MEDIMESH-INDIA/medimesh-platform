import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {
  ELIGIBILITY_REASON,
  ELIGIBILITY_MESSAGES,
  getHomeVisitEligibility,
  isHomeVisitEligible,
  validateHomeVisitAppointment,
} from '../src/lib/doctors/homeVisitEligibility.js';
import { normalizeCanonicalDoctor } from '../src/lib/data/doctorRepository.js';

const VALID_BASELINE_DOCTOR = {
  id: 'doc-001',
  slug: 'dr-verified-claimed',
  full_name: 'Dr. Aarav Mehta',
  specialization: 'General Physician',
  publication_status: 'published',
  verification_status: 'verified',
  claimed_by_user_id: 'usr-provider-123',
  offers_home_visits: true,
  home_visit_days: ['Monday', 'Wednesday', 'Friday'],
  home_visit_start_time: '09:00:00',
  home_visit_end_time: '17:00:00',
  home_visit_service_areas: ['Vashi', 'Koparkhairane'],
  locality: 'Vashi',
  city: 'Navi Mumbai',
};

test('1. Fully eligible doctor passes all verification and schedule checks', () => {
  const result = getHomeVisitEligibility(VALID_BASELINE_DOCTOR);
  assert.equal(result.eligible, true);
  assert.equal(result.reason, ELIGIBILITY_REASON.ELIGIBLE);
  assert.equal(isHomeVisitEligible(VALID_BASELINE_DOCTOR), true);

  // Also check normalized representation
  const normalized = normalizeCanonicalDoctor(VALID_BASELINE_DOCTOR);
  assert.equal(normalized.isClaimed, true);
  assert.equal(normalized.verificationStatus, 'verified');
  assert.equal(normalized.publicationStatus, 'published');
  const normalizedResult = getHomeVisitEligibility(normalized);
  assert.equal(normalizedResult.eligible, true);
  assert.equal(normalizedResult.reason, ELIGIBILITY_REASON.ELIGIBLE);
});

test('2. Rejection: Unpublished status cannot accept home visits', () => {
  const statuses = ['draft', 'under_review', 'archived', ''];
  for (const status of statuses) {
    const doc = { ...VALID_BASELINE_DOCTOR, publication_status: status };
    const res = getHomeVisitEligibility(doc);
    assert.equal(res.eligible, false, `Expected publication status '${status}' to be ineligible`);
    assert.equal(res.reason, ELIGIBILITY_REASON.UNPUBLISHED);
    assert.equal(res.message, ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.UNPUBLISHED]);
  }
});

test('3. Rejection: Unverified or pending verification doctors are blocked', () => {
  const unverifiedStatuses = ['unreviewed', 'pending', 'rejected', 'unverified', null, undefined];
  for (const status of unverifiedStatuses) {
    const doc = { ...VALID_BASELINE_DOCTOR, verification_status: status };
    const res = getHomeVisitEligibility(doc);
    assert.equal(res.eligible, false, `Expected verification status '${status}' to be ineligible`);
    assert.equal(res.reason, ELIGIBILITY_REASON.PENDING_VERIFICATION);
    assert.equal(res.message, ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.PENDING_VERIFICATION]);
  }
});

test('4. Rejection: Unclaimed doctors are blocked from receiving bookings', () => {
  const unclaimedFalsy = [null, undefined, '', false];
  for (const claimValue of unclaimedFalsy) {
    const doc = { ...VALID_BASELINE_DOCTOR, claimed_by_user_id: claimValue };
    const res = getHomeVisitEligibility(doc);
    assert.equal(res.eligible, false);
    assert.equal(res.reason, ELIGIBILITY_REASON.UNCLAIMED);
    assert.equal(res.message, ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.UNCLAIMED]);
  }
});

test('5. Rejection: Home visits disabled flag blocks booking controls', () => {
  const doc = { ...VALID_BASELINE_DOCTOR, offers_home_visits: false };
  const res = getHomeVisitEligibility(doc);
  assert.equal(res.eligible, false);
  assert.equal(res.reason, ELIGIBILITY_REASON.HOME_VISITS_DISABLED);
  assert.equal(res.message, ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.HOME_VISITS_DISABLED]);
});

test('6. Rejection: Incomplete, missing, or invalid schedule is rejected', () => {
  // Empty days
  const emptyDaysDoc = { ...VALID_BASELINE_DOCTOR, home_visit_days: [] };
  const res1 = getHomeVisitEligibility(emptyDaysDoc);
  assert.equal(res1.eligible, false);
  assert.equal(res1.reason, ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE);

  // Missing start time
  const missingStartDoc = { ...VALID_BASELINE_DOCTOR, home_visit_start_time: null };
  const res2 = getHomeVisitEligibility(missingStartDoc);
  assert.equal(res2.eligible, false);
  assert.equal(res2.reason, ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE);

  // Inverted hours (end_time <= start_time)
  const invertedHoursDoc = {
    ...VALID_BASELINE_DOCTOR,
    home_visit_start_time: '17:00:00',
    home_visit_end_time: '09:00:00',
  };
  const res3 = getHomeVisitEligibility(invertedHoursDoc);
  assert.equal(res3.eligible, false);
  assert.equal(res3.reason, ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE);

  // Equal hours (zero duration)
  const equalHoursDoc = {
    ...VALID_BASELINE_DOCTOR,
    home_visit_start_time: '10:00:00',
    home_visit_end_time: '10:00:00',
  };
  const res4 = getHomeVisitEligibility(equalHoursDoc);
  assert.equal(res4.eligible, false);
  assert.equal(res4.reason, ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE);
});

test('7. validateHomeVisitAppointment: Enforces published days, hours, and future time', () => {
  // Doctor visits Monday, Wednesday, Friday from 09:00 to 17:00
  // Fix "now" to a Monday at 10:00:00
  // 2026-10-26 is a Monday
  const fixedNow = new Date('2026-10-26T10:00:00Z');

  // Valid future appointment: Wednesday 2026-10-28 at 14:00
  const validAppt = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-28', // Wednesday
    startTime: '14:00',
    now: fixedNow,
  });
  assert.equal(validAppt.valid, true);

  // Invalid day: Tuesday 2026-10-27 (doctor only visits Mon/Wed/Fri)
  const invalidDayAppt = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-27', // Tuesday
    startTime: '11:00',
    now: fixedNow,
  });
  assert.equal(invalidDayAppt.valid, false);
  assert.equal(invalidDayAppt.reason, 'INVALID_DAY');

  // Invalid time: Before start hours (08:30 < 09:00)
  const tooEarlyAppt = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-28',
    startTime: '08:30',
    now: fixedNow,
  });
  assert.equal(tooEarlyAppt.valid, false);
  assert.equal(tooEarlyAppt.reason, 'INVALID_TIME');

  // Invalid time: Exceeds end hours (16:45 + 30 min = 17:15 > 17:00)
  const tooLateAppt = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-28',
    startTime: '16:45',
    now: fixedNow,
  });
  assert.equal(tooLateAppt.valid, false);
  assert.equal(tooLateAppt.reason, 'INVALID_TIME');

  // Exact boundary times: 09:00 (start boundary) and 16:30 (end boundary: 16:30 + 30m = 17:00)
  const startBoundary = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-28',
    startTime: '09:00',
    now: fixedNow,
  });
  assert.equal(startBoundary.valid, true);

  const endBoundary = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-28',
    startTime: '16:30',
    now: fixedNow,
  });
  assert.equal(endBoundary.valid, true);

  // Past time: 2026-10-26 09:00 is in the past relative to 10:00 now
  const pastAppt = validateHomeVisitAppointment({
    doctor: VALID_BASELINE_DOCTOR,
    date: '2026-10-26',
    startTime: '09:00',
    now: fixedNow,
  });
  assert.equal(pastAppt.valid, false);
  assert.equal(pastAppt.reason, 'PAST_DATETIME');

  // Ineligible doctor cannot validate appointments
  const unverifiedDoctor = { ...VALID_BASELINE_DOCTOR, verification_status: 'pending' };
  const ineligibleAppt = validateHomeVisitAppointment({
    doctor: unverifiedDoctor,
    date: '2026-10-28',
    startTime: '14:00',
    now: fixedNow,
  });
  assert.equal(ineligibleAppt.valid, false);
  assert.equal(ineligibleAppt.reason, ELIGIBILITY_REASON.PENDING_VERIFICATION);
});

test('8. Database migration security contract verifies server-side defense', () => {
  const migrationPath = path.resolve(
    process.cwd(),
    'supabase/migrations/20261024000000_secure_home_visit_eligibility.sql',
  );
  assert.ok(fs.existsSync(migrationPath), 'Migration file must exist in supabase/migrations');

  const sql = fs.readFileSync(migrationPath, 'utf8');

  // Verify trigger function updates verification_status check
  assert.ok(
    sql.includes("visit_doctor.verification_status <> 'verified'"),
    'Trigger function guard_home_visit_booking_insert must check verification_status <> verified',
  );
  assert.ok(
    sql.includes("visit_doctor.claimed_by_user_id is null"),
    'Trigger function must check claimed_by_user_id is null',
  );

  // Verify tightened INSERT RLS policy
  assert.ok(
    sql.includes('create policy "Patients can request home visits"'),
    'Migration must recreate "Patients can request home visits" policy',
  );
  assert.ok(
    sql.includes("d.verification_status = 'verified'"),
    'Policy must require d.verification_status = verified in EXISTS clause',
  );
  assert.ok(
    sql.includes("d.claimed_by_user_id is not null"),
    'Policy must require d.claimed_by_user_id IS NOT NULL',
  );

  // Verify RPC function slot availability check
  assert.ok(
    sql.includes('get_home_visit_unavailable_slots'),
    'Migration must update get_home_visit_unavailable_slots RPC',
  );
});

test('9. normalizeCanonicalDoctor preserves and exposes verification, claim, and publication status', () => {
  const rawDbDoc = {
    id: 'doc-norm-1',
    slug: 'dr-norm',
    full_name: 'Dr. Normalizer Test',
    publication_status: 'published',
    verification_status: 'verified',
    claimed_by_user_id: 'usr-claim-999',
    offers_home_visits: true,
    home_visit_days: ['Tuesday'],
    home_visit_start_time: '10:00:00',
    home_visit_end_time: '14:00:00',
  };

  const normalized = normalizeCanonicalDoctor(rawDbDoc);
  assert.equal(normalized.publicationStatus, 'published');
  assert.equal(normalized.verificationStatus, 'verified');
  assert.equal(normalized.isClaimed, true);
  assert.equal(normalized.claimedByUserId, 'usr-claim-999');
  assert.equal(normalized.homeVisit.enabled, true);
  assert.deepEqual(normalized.homeVisit.days, ['Tuesday']);

  const unclaimedRaw = { ...rawDbDoc, claimed_by_user_id: null };
  const unclaimedNorm = normalizeCanonicalDoctor(unclaimedRaw);
  assert.equal(unclaimedNorm.isClaimed, false);
  assert.equal(unclaimedNorm.claimedByUserId, null);
});

test('10. UI components import and enforce shared home-visit eligibility contract', () => {
  const cardPath = path.resolve(process.cwd(), 'src/components/doctor/DoctorCard.jsx');
  const detailPath = path.resolve(process.cwd(), 'src/pages/App/DoctorDetailExperience.jsx');
  const bookingPath = path.resolve(process.cwd(), 'src/pages/App/Patient/HomeVisitBooking.jsx');

  const cardCode = fs.readFileSync(cardPath, 'utf8');
  assert.ok(
    cardCode.includes('getHomeVisitEligibility'),
    'DoctorCard must import and call getHomeVisitEligibility',
  );
  assert.ok(
    cardCode.includes('isBookable = eligibility.eligible'),
    'DoctorCard must determine isBookable using eligibility.eligible',
  );

  const detailCode = fs.readFileSync(detailPath, 'utf8');
  assert.ok(
    detailCode.includes('getHomeVisitEligibility'),
    'DoctorDetailExperience must import and call getHomeVisitEligibility',
  );
  assert.ok(
    detailCode.includes('eligibility.message'),
    'DoctorDetailExperience must display eligibility.message when unbookable',
  );

  const bookingCode = fs.readFileSync(bookingPath, 'utf8');
  assert.ok(
    bookingCode.includes('getHomeVisitEligibility'),
    'HomeVisitBooking must import getHomeVisitEligibility',
  );
  assert.ok(
    bookingCode.includes('validateHomeVisitAppointment'),
    'HomeVisitBooking must validate appointment against doctor schedule before submitting',
  );
});
