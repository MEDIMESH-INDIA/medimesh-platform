import assert from 'node:assert/strict';
import test from 'node:test';
import { normalizeHospital } from '../src/lib/data/hospitalRepository.js';
import { getVerifiedHospitalCoordinates, VERIFIED_HOSPITAL_COORDINATES } from '../src/lib/maps/verifiedHospitalCoordinates.js';

test('getVerifiedHospitalCoordinates retrieves entries by both ID and slug', () => {
  assert.ok(Object.keys(VERIFIED_HOSPITAL_COORDINATES).length > 0);
  const byId = getVerifiedHospitalCoordinates('06ceccf9-f578-4ac7-aabe-d3ee7e26ce6e', null);
  const bySlug = getVerifiedHospitalCoordinates(null, 'life-line-hospital-medical-research-centre');
  assert.equal(byId.latitude, 18.991176);
  assert.equal(bySlug.latitude, 18.991176);
  assert.equal(getVerifiedHospitalCoordinates(null, null), null);
  assert.equal(getVerifiedHospitalCoordinates('unknown-id', 'unknown-slug'), null);
});

test('Life Line Hospital Panvel resolves to Panvel and corrects legacy Sanpada displacement', () => {
  // Legacy record had Sanpada coordinates (19.067579, 73.012303)
  const legacyRecord = {
    id: '06ceccf9-f578-4ac7-aabe-d3ee7e26ce6e',
    slug: 'life-line-hospital-medical-research-centre',
    name: 'Life Line Hospital & Medical Research Centre',
    address_line_1: 'Sai Arcade, Opp. S.T. Bus Stand, Shivaji Road, Panvel',
    locality: 'Panvel',
    city: 'Navi Mumbai',
    latitude: 19.0675788,
    longitude: 73.0123031,
  };

  const normalized = normalizeHospital(legacyRecord);
  assert.equal(normalized.map.latitude, 18.991176);
  assert.equal(normalized.map.longitude, 73.115263);

  // Address must remain intact
  assert.equal(normalized.location.addressLine1, 'Sai Arcade, Opp. S.T. Bus Stand, Shivaji Road, Panvel');
  assert.equal(normalized.location.locality, 'Panvel');
});

test('Ashtvinayak Hospital resolves to Khanda Colony New Panvel instead of Old Panvel municipal centroid', () => {
  const legacyRecord = {
    id: 'e4d009e1-65b3-41b1-8951-456afd7244ee',
    slug: 'ashtvinayak-hospitals-private-limited',
    name: 'Ashtvinayak Hospitals Private Limited',
    address_line_1: 'Plot No. 10, Sector 6, Khanda Colony, near Khandeshwar Lake, New Panvel (W)',
    locality: 'New Panvel',
    city: 'Navi Mumbai',
    latitude: 18.9861,
    longitude: 73.1111,
  };

  const normalized = normalizeHospital(legacyRecord);
  assert.equal(normalized.map.latitude, 19.010551);
  assert.equal(normalized.map.longitude, 73.107588);
  assert.equal(normalized.location.locality, 'New Panvel');
});

test('Nerul hospitals resolve to distinct individual facility locations instead of a shared centroid', () => {
  const terna = normalizeHospital({
    id: '3527b125-e4c6-4aa2-a323-694f52f0f0ed',
    slug: 'terna-speciality-hospital-research-centre',
    name: 'Terna Speciality Hospital & Research Centre',
    latitude: 19.0335938,
    longitude: 73.018164,
  });

  const shushrusha = normalizeHospital({
    id: '1cd24430-5530-472f-a55d-acdbb35b68bf',
    slug: 'shushrusha-heart-care-centre-speciality-hospital',
    name: 'Shushrusha Heart Care Centre & Speciality Hospital',
    latitude: 19.0335938,
    longitude: 73.018164,
  });

  const nmmcNerul = normalizeHospital({
    id: '3c518eac-7b9e-4fe3-beb4-a7057745f128',
    slug: 'nmmc-general-hospital-nerul',
    name: 'NMMC General Hospital Nerul',
    latitude: 19.0335938,
    longitude: 73.018164,
  });

  // Terna (opposite Nerul Railway Station West)
  assert.equal(terna.map.latitude, 19.0314);
  assert.equal(terna.map.longitude, 73.0161);

  // Shushrusha (Palm Beach Road Sector 6)
  assert.equal(shushrusha.map.latitude, 19.04327);
  assert.equal(shushrusha.map.longitude, 73.00951);

  // NMMC Nerul (Sector 15)
  assert.equal(nmmcNerul.map.latitude, 19.03416);
  assert.equal(nmmcNerul.map.longitude, 73.02077);

  // None of the three should share coordinates
  assert.notEqual(`${terna.map.latitude},${terna.map.longitude}`, `${shushrusha.map.latitude},${shushrusha.map.longitude}`);
  assert.notEqual(`${terna.map.latitude},${terna.map.longitude}`, `${nmmcNerul.map.latitude},${nmmcNerul.map.longitude}`);
  assert.notEqual(`${shushrusha.map.latitude},${shushrusha.map.longitude}`, `${nmmcNerul.map.latitude},${nmmcNerul.map.longitude}`);
});

test('Kharghar hospitals (MITR and Polaris) resolve to distinct coordinates in Sector 5 and Sector 20', () => {
  const mitr = normalizeHospital({
    id: 'a08a625c-fd27-4ab6-93ea-6669bc4f0fc0',
    slug: 'mitr-hospital',
    name: 'MITR Hospital',
    latitude: 19.025773,
    longitude: 73.0591845,
  });

  const polaris = normalizeHospital({
    id: '98f8c868-1d9c-426d-9d57-19dc99fff98c',
    slug: 'polaris-hospital',
    name: 'Polaris Hospital',
    latitude: 19.025773,
    longitude: 73.0591845,
  });

  assert.equal(mitr.map.latitude, 19.063023);
  assert.equal(mitr.map.longitude, 73.070042);

  assert.equal(polaris.map.latitude, 19.04793);
  assert.equal(polaris.map.longitude, 73.07308);

  assert.notEqual(`${mitr.map.latitude},${mitr.map.longitude}`, `${polaris.map.latitude},${polaris.map.longitude}`);
});

test('Sanpada hospitals (MPCT and Suraj) resolve to distinct coordinates in Sector 4 and Sector 15', () => {
  const mpct = normalizeHospital({
    id: '02344e48-6505-4d10-86f9-ce7e33bc7692',
    slug: 'mpct-hospital',
    name: 'MPCT Hospital',
    latitude: 19.0659774,
    longitude: 73.0095329,
  });

  const suraj = normalizeHospital({
    id: '995b9de8-349a-4d9d-8396-8b8916e51812',
    slug: 'dr-r-n-patils-suraj-hospital',
    name: 'Dr. R.N. Patil\'s Suraj Hospital',
    latitude: 19.0659774,
    longitude: 73.0095329,
  });

  assert.equal(mpct.map.latitude, 19.0606);
  assert.equal(mpct.map.longitude, 73.014);

  assert.equal(suraj.map.latitude, 19.057467);
  assert.equal(suraj.map.longitude, 73.011009);

  assert.notEqual(`${mpct.map.latitude},${mpct.map.longitude}`, `${suraj.map.latitude},${suraj.map.longitude}`);
});

test('Vashi hospitals (NMMC, ESIS, and Jijamata) resolve to distinct coordinates in Sector 10A, 5, and 9', () => {
  const nmmcVashi = normalizeHospital({
    id: 'c617386a-9fad-4817-9e57-2d11e3dea73f',
    slug: 'nmmc-general-hospital-vashi',
    latitude: 19.0632481,
    longitude: 72.9987966,
  });

  const esis = normalizeHospital({
    id: '234dad87-1e98-4230-8c69-dee6e3db6b77',
    slug: 'esis-hospital-vashi',
    latitude: 19.0632481,
    longitude: 72.9987966,
  });

  const jijamata = normalizeHospital({
    id: 'b3027259-b91f-4a38-95c8-542e4d416559',
    slug: 'jijamata-hospital',
    latitude: 19.0632481,
    longitude: 72.9987966,
  });

  assert.equal(nmmcVashi.map.latitude, 19.0744);
  assert.equal(nmmcVashi.map.longitude, 72.9978);

  assert.equal(esis.map.latitude, 19.0742);
  assert.equal(esis.map.longitude, 72.9908);

  assert.equal(jijamata.map.latitude, 19.0778);
  assert.equal(jijamata.map.longitude, 72.9944);

  assert.notEqual(`${nmmcVashi.map.latitude},${nmmcVashi.map.longitude}`, `${esis.map.latitude},${esis.map.longitude}`);
  assert.notEqual(`${nmmcVashi.map.latitude},${nmmcVashi.map.longitude}`, `${jijamata.map.latitude},${jijamata.map.longitude}`);
  assert.notEqual(`${esis.map.latitude},${esis.map.longitude}`, `${jijamata.map.latitude},${jijamata.map.longitude}`);
});

test('Valid existing hospitals retain their original database coordinates without alteration', () => {
  const dypatil = normalizeHospital({
    id: '6eb3c35b-2052-471a-9045-d5d98ee6131e',
    slug: 'd-y-patil-hospital',
    name: 'D.Y. Patil Hospital',
    latitude: 19.0384,
    longitude: 73.0256,
  });
  assert.equal(dypatil.map.latitude, 19.0384);
  assert.equal(dypatil.map.longitude, 73.0256);

  const fortis = normalizeHospital({
    id: '99c0e6bc-cc93-4d92-a106-56dd2d54410a',
    slug: 'fortis-hiranandani-hospital',
    name: 'Fortis Hiranandani Hospital',
    latitude: 19.0682,
    longitude: 72.9965,
  });
  assert.equal(fortis.map.latitude, 19.0682);
  assert.equal(fortis.map.longitude, 72.9965);

  const medicover = normalizeHospital({
    id: '8776103e-7c97-4c8a-93c3-89218d30e2ee',
    slug: 'medicover-hospital',
    name: 'Medicover Hospital',
    latitude: 19.0435,
    longitude: 73.0569,
  });
  assert.equal(medicover.map.latitude, 19.0435);
  assert.equal(medicover.map.longitude, 73.0569);
});

test('Rural hospitals without coordinates retain null coordinates for safe unmapped fallback', () => {
  const rural = normalizeHospital({
    id: 'da767d42-fab1-401b-8c38-8c0c2530d31c',
    slug: 'rural-hospital-devgad',
    name: 'Rural Hospital Devgad',
    latitude: null,
    longitude: null,
  });
  assert.equal(rural.map.latitude, null);
  assert.equal(rural.map.longitude, null);
});
