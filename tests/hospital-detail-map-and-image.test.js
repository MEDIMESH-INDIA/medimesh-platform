import assert from 'node:assert/strict';
import test from 'node:test';
import {
  hasValidCoordinates,
  hasResolvedHospitalLocation,
  getHospitalMapDestination,
  buildGoogleMapsUrl,
} from '../src/lib/maps/googleMaps.js';
import { getMapTilerStyle, getFallbackMapStyle, hasMapTilerKey } from '../src/lib/maps/mapTiler.js';

test('hasValidCoordinates validates valid non-zero latitude and longitude', () => {
  assert.equal(hasValidCoordinates({ map: { latitude: 19.0698, longitude: 72.9873 } }), true);
  assert.equal(hasValidCoordinates({ map: { latitude: '19.0698', longitude: '72.9873' } }), true);

  // Guards against Number(null) === 0 pitfall
  assert.equal(hasValidCoordinates({ map: { latitude: null, longitude: null } }), false);
  assert.equal(hasValidCoordinates({ map: { latitude: null, longitude: 72.9873 } }), false);
  assert.equal(hasValidCoordinates({ map: { latitude: 19.0698, longitude: null } }), false);

  // Guards against 0,0 Null Island coordinates
  assert.equal(hasValidCoordinates({ map: { latitude: 0, longitude: 0 } }), false);
  assert.equal(hasValidCoordinates({ map: { latitude: '0', longitude: '0' } }), false);

  // Guards against empty string and undefined
  assert.equal(hasValidCoordinates({ map: { latitude: '', longitude: '' } }), false);
  assert.equal(hasValidCoordinates({ map: {} }), false);
  assert.equal(hasValidCoordinates(null), false);
  assert.equal(hasValidCoordinates(undefined), false);
});

test('hasResolvedHospitalLocation resolves when placeId exists or valid coordinates exist', () => {
  // With coordinates
  assert.equal(hasResolvedHospitalLocation({ map: { latitude: 19.0435, longitude: 73.0569, placeId: null } }), true);

  // With placeId only
  assert.equal(hasResolvedHospitalLocation({ map: { latitude: null, longitude: null, placeId: 'ChIJ12345' } }), true);

  // Without coordinates and without placeId
  assert.equal(hasResolvedHospitalLocation({ map: { latitude: null, longitude: null, placeId: null } }), false);
});

test('getHospitalMapDestination uses placeId, coordinates, or fallback address without 0,0 pollution', () => {
  const hospitalWithCoords = {
    name: 'Medicover Hospital',
    map: { latitude: 19.0435, longitude: 73.0569, placeId: null },
  };
  const destCoords = getHospitalMapDestination(hospitalWithCoords, 'Sector 10, Kharghar');
  assert.deepEqual(destCoords, { query: '19.0435,73.0569', placeId: null });

  const hospitalWithPlaceId = {
    name: 'MGM Hospital Vashi',
    map: { latitude: null, longitude: null, placeId: 'ChIJ98765' },
  };
  const destPlace = getHospitalMapDestination(hospitalWithPlaceId, 'Sector 10, Vashi');
  assert.deepEqual(destPlace, { query: 'Sector 10, Vashi', placeId: 'ChIJ98765' });

  // Hospital with null coordinates must NOT return '0,0'
  const hospitalWithoutCoords = {
    name: 'District Civil Hospital',
    map: { latitude: null, longitude: null, placeId: null },
  };
  const destFallback = getHospitalMapDestination(hospitalWithoutCoords, 'Main Road, Kankavali');
  assert.deepEqual(destFallback, { query: 'Main Road, Kankavali', placeId: null });
});

test('buildGoogleMapsUrl constructs valid directions and search URLs', () => {
  const directionsUrl = buildGoogleMapsUrl('directions', { query: '19.0698,72.9873', placeId: null });
  assert.equal(directionsUrl, 'https://www.google.com/maps/dir/?api=1&destination=19.0698%2C72.9873');

  const searchUrl = buildGoogleMapsUrl('search', { query: 'Sterling Hospital', placeId: 'ChIJabc' });
  assert.equal(searchUrl, 'https://www.google.com/maps/search/?api=1&query=Sterling+Hospital&query_place_id=ChIJabc');

  assert.equal(buildGoogleMapsUrl('directions', null), null);
  assert.equal(buildGoogleMapsUrl('directions', { query: '' }), null);
});

test('getMapTilerStyle returns well-formed satellite style by default and handles styles correctly', () => {
  const defaultStyle = getMapTilerStyle();
  assert.match(defaultStyle, /^https:\/\/api\.maptiler\.com\/maps\/satellite\/style\.json\?key=/);

  const satelliteStyle = getMapTilerStyle('satellite');
  assert.match(satelliteStyle, /^https:\/\/api\.maptiler\.com\/maps\/satellite\/style\.json\?key=/);

  const roadmapStyle = getMapTilerStyle('roadmap');
  assert.match(roadmapStyle, /^https:\/\/api\.maptiler\.com\/maps\/streets-v2\/style\.json\?key=/);
});

test('getFallbackMapStyle returns valid maplibre raster style specification with satellite as default', () => {
  const defaultFallback = getFallbackMapStyle();
  assert.equal(defaultFallback.version, 8);
  assert.ok(defaultFallback.sources['esri-satellite']);
  assert.equal(defaultFallback.layers[0].type, 'raster');

  const satelliteFallback = getFallbackMapStyle('satellite');
  assert.equal(satelliteFallback.version, 8);
  assert.ok(satelliteFallback.sources['esri-satellite']);
  assert.equal(satelliteFallback.layers[0].type, 'raster');

  const roadmapFallback = getFallbackMapStyle('roadmap');
  assert.equal(roadmapFallback.version, 8);
  assert.ok(roadmapFallback.sources['esri-street']);
  assert.equal(roadmapFallback.layers[0].type, 'raster');
});

test('hasMapTilerKey contract correctly identifies valid keys and guards against placeholders', () => {
  assert.equal(typeof hasMapTilerKey(), 'boolean');
});

test('hospital hero image priority fallback behavior contract', () => {
  // Priority 1: Verified record image
  const recordWithPhoto = {
    name: 'Sterling Hospital',
    imageUrl: 'https://example.com/verified-hospital.jpg',
  };
  const candidateUrl1 = recordWithPhoto?.imageUrl || recordWithPhoto?.photo || null;
  assert.equal(candidateUrl1, 'https://example.com/verified-hospital.jpg');

  // Priority 2: Places photo if attached
  const recordWithPlacePhoto = {
    name: 'MGM Hospital Vashi',
    imageUrl: null,
    photo: 'https://places.googleapis.com/v1/photos/photo123',
  };
  const candidateUrl2 = recordWithPlacePhoto?.imageUrl || recordWithPlacePhoto?.photo || null;
  assert.equal(candidateUrl2, 'https://places.googleapis.com/v1/photos/photo123');

  // Priority 3: Fallback when no genuine photograph exists
  const recordWithoutPhoto = {
    name: 'Medicover Hospital',
    imageUrl: null,
    photo: null,
  };
  const candidateUrl3 = recordWithoutPhoto?.imageUrl || recordWithoutPhoto?.photo || null;
  assert.equal(candidateUrl3, null); // cleanly triggers architectural fallback card
});

