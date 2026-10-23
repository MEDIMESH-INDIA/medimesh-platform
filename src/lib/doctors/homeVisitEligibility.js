/**
 * Shared verification-aware eligibility gate for doctor home-visit booking.
 * 
 * Requirements:
 * 1. The canonical doctor record is published (publication_status = 'published').
 * 2. verification_status = 'verified'.
 * 3. The doctor is claimed by an eligible doctor account (claimed_by_user_id is not null).
 * 4. offers_home_visits = true.
 * 5. A usable schedule exists: valid published days and start_time < end_time.
 */

export const ELIGIBILITY_REASON = {
  ELIGIBLE: 'ELIGIBLE',
  UNPUBLISHED: 'UNPUBLISHED',
  PENDING_VERIFICATION: 'PENDING_VERIFICATION',
  UNCLAIMED: 'UNCLAIMED',
  HOME_VISITS_DISABLED: 'HOME_VISITS_DISABLED',
  INCOMPLETE_SCHEDULE: 'INCOMPLETE_SCHEDULE',
};

export const ELIGIBILITY_MESSAGES = {
  [ELIGIBILITY_REASON.ELIGIBLE]: 'Doctor is eligible for home-visit booking.',
  [ELIGIBILITY_REASON.UNPUBLISHED]: 'This practitioner profile is not published for online booking.',
  [ELIGIBILITY_REASON.PENDING_VERIFICATION]: 'Home-visit booking is unavailable until this provider completes verification.',
  [ELIGIBILITY_REASON.UNCLAIMED]: 'Home-visit booking is unavailable until this practitioner claims and activates their profile.',
  [ELIGIBILITY_REASON.HOME_VISITS_DISABLED]: 'This practitioner does not offer home visits at this time.',
  [ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE]: 'This doctor has not published a complete, claimed home-visit schedule. MEDIMESH will not invent appointment times.',
};

const WEEKDAYS_MAP = {
  sunday: 'Sunday',
  sun: 'Sunday',
  monday: 'Monday',
  mon: 'Monday',
  tuesday: 'Tuesday',
  tue: 'Tuesday',
  wednesday: 'Wednesday',
  wed: 'Wednesday',
  thursday: 'Thursday',
  thu: 'Thursday',
  friday: 'Friday',
  fri: 'Friday',
  saturday: 'Saturday',
  sat: 'Saturday',
};

const normalizeDay = day => {
  if (!day || typeof day !== 'string') return null;
  const key = day.trim().toLowerCase();
  return WEEKDAYS_MAP[key] || null;
};

const parseTimeToMinutes = timeStr => {
  if (!timeStr || typeof timeStr !== 'string') return null;
  const parts = timeStr.trim().split(':');
  if (parts.length < 2) return null;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (Number.isNaN(hours) || Number.isNaN(minutes)) return null;
  if (hours < 0 || hours > 23 || minutes < 0 || minutes > 59) return null;
  return (hours * 60) + minutes;
};

/**
 * Evaluates whether a doctor is eligible to accept new home-visit bookings.
 * Inspects publication status, verification status, claim status, home-visit enablement,
 * and schedule completeness.
 * 
 * @param {object} doctor Normalized doctor or raw database row
 * @returns {{ eligible: boolean, reason: string, message: string }}
 */
export function getHomeVisitEligibility(doctor) {
  if (!doctor || typeof doctor !== 'object') {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.UNPUBLISHED,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.UNPUBLISHED],
    };
  }

  // 1. Published check
  const publicationStatus = (doctor.publicationStatus || doctor.publication_status || '').trim().toLowerCase();
  // If not explicitly set, default to published for normalized canonical doctors if marked canonical
  const effectivePubStatus = publicationStatus || (doctor.recordType === 'canonical' ? 'published' : '');
  if (effectivePubStatus !== 'published') {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.UNPUBLISHED,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.UNPUBLISHED],
    };
  }

  // 2. Verification status check
  const verificationStatus = (
    doctor.verificationStatus
    || doctor.verification_status
    || doctor.source?.reviewStatus
    || ''
  ).trim().toLowerCase();
  if (verificationStatus !== 'verified') {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.PENDING_VERIFICATION,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.PENDING_VERIFICATION],
    };
  }

  // 3. Claimed status check
  const hasClaim = Boolean(
    doctor.claimedByUserId
    || doctor.claimed_by_user_id
    || doctor.isClaimed
  );
  if (!hasClaim) {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.UNCLAIMED,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.UNCLAIMED],
    };
  }

  // 4. Home visits enabled check
  const offersHomeVisits = Boolean(
    doctor.offers_home_visits
    ?? doctor.homeVisit?.enabled
  );
  if (!offersHomeVisits) {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.HOME_VISITS_DISABLED,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.HOME_VISITS_DISABLED],
    };
  }

  // 5. Usable schedule check
  const rawDays = doctor.home_visit_days || doctor.homeVisit?.days;
  const days = Array.isArray(rawDays) ? rawDays.map(normalizeDay).filter(Boolean) : [];
  if (days.length === 0) {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE],
    };
  }

  const startTimeStr = doctor.home_visit_start_time || doctor.homeVisit?.startTime;
  const endTimeStr = doctor.home_visit_end_time || doctor.homeVisit?.endTime;
  const startMinutes = parseTimeToMinutes(startTimeStr);
  const endMinutes = parseTimeToMinutes(endTimeStr);

  if (startMinutes === null || endMinutes === null || endMinutes <= startMinutes) {
    return {
      eligible: false,
      reason: ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE,
      message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.INCOMPLETE_SCHEDULE],
    };
  }

  return {
    eligible: true,
    reason: ELIGIBILITY_REASON.ELIGIBLE,
    message: ELIGIBILITY_MESSAGES[ELIGIBILITY_REASON.ELIGIBLE],
  };
}

/**
 * Convenience boolean helper for home-visit eligibility.
 * 
 * @param {object} doctor
 * @returns {boolean}
 */
export function isHomeVisitEligible(doctor) {
  return getHomeVisitEligibility(doctor).eligible;
}

/**
 * Validates a specific home-visit appointment against the doctor's published schedule.
 * 
 * @param {object} options
 * @param {object} options.doctor
 * @param {string|Date} options.date YYYY-MM-DD or Date
 * @param {string} options.startTime HH:MM
 * @param {Date} [options.now]
 * @returns {{ valid: boolean, reason?: string, message?: string }}
 */
export function validateHomeVisitAppointment({ doctor, date, startTime, now = new Date() }) {
  const eligibility = getHomeVisitEligibility(doctor);
  if (!eligibility.eligible) {
    return {
      valid: false,
      reason: eligibility.reason,
      message: eligibility.message,
    };
  }

  // Parse date
  let dateObj;
  if (date instanceof Date) {
    dateObj = date;
  } else if (typeof date === 'string') {
    const [y, m, d] = date.split('-').map(Number);
    if (!y || !m || !d) {
      return { valid: false, reason: 'INVALID_DATE', message: 'Invalid appointment date format.' };
    }
    dateObj = new Date(y, m - 1, d);
  } else {
    return { valid: false, reason: 'INVALID_DATE', message: 'Appointment date is required.' };
  }

  const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const appointmentDay = weekdayNames[dateObj.getDay()];

  const rawDays = doctor.home_visit_days || doctor.homeVisit?.days || [];
  const normalizedDoctorDays = rawDays.map(normalizeDay).filter(Boolean);

  if (!normalizedDoctorDays.includes(appointmentDay)) {
    return {
      valid: false,
      reason: 'INVALID_DAY',
      message: 'The selected date is outside the doctor schedule.',
    };
  }

  const requestedStartMinutes = parseTimeToMinutes(startTime);
  if (requestedStartMinutes === null) {
    return {
      valid: false,
      reason: 'INVALID_TIME',
      message: 'The selected time is invalid.',
    };
  }

  const schedStartMinutes = parseTimeToMinutes(doctor.home_visit_start_time || doctor.homeVisit?.startTime);
  const schedEndMinutes = parseTimeToMinutes(doctor.home_visit_end_time || doctor.homeVisit?.endTime);

  if (
    requestedStartMinutes < schedStartMinutes
    || (requestedStartMinutes + 30) > schedEndMinutes
  ) {
    return {
      valid: false,
      reason: 'INVALID_TIME',
      message: 'The selected time is outside the doctor schedule.',
    };
  }

  // Future check: appointment date + time must be in future
  const appointmentDateTime = new Date(dateObj);
  appointmentDateTime.setHours(Math.floor(requestedStartMinutes / 60), requestedStartMinutes % 60, 0, 0);

  if (appointmentDateTime.getTime() <= now.getTime()) {
    return {
      valid: false,
      reason: 'PAST_DATETIME',
      message: 'Home visit requests must be scheduled in the future.',
    };
  }

  return { valid: true };
}
