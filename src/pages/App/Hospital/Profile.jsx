import { useEffect, useState } from 'react';
import { RotateCcw, Save, ShieldAlert } from 'lucide-react';
import AppPageContainer from '../../../components/layout/AppPageContainer';
import Button from '../../../components/common/Button';
import FormField from '../../../components/common/FormField';
import FrostedPanel from '../../../components/common/FrostedPanel';
import PageHeader from '../../../components/common/PageHeader';
import Toast from '../../../components/common/Toast';
import { HospitalPortalGate } from '../../../components/hospital/portal/HospitalPortalState';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';
import { canManageHospital, updateHospitalProfile } from '../../../lib/data/hospitalPortalRepository';

const textFields = [
  'name', 'legal_name', 'hospital_type', 'address_line_1', 'address_line_2', 'locality', 'city', 'district', 'state', 'country', 'pin_code', 'public_phone', 'public_email', 'website',
];

function toFormValues(hospital) {
  const values = Object.fromEntries(textFields.map(field => [field, hospital[field] ?? '']));
  return {
    ...values,
    year_established: hospital.year_established ?? '',
    total_beds: hospital.total_beds ?? '',
    icu_beds: hospital.icu_beds ?? '',
    emergency_department: hospital.emergency_department == null ? '' : String(hospital.emergency_department),
    ambulance_available: hospital.ambulance_available == null ? '' : String(hospital.ambulance_available),
  };
}

function nullableText(value) {
  const trimmed = value.trim();
  return trimmed || null;
}

function nullableNumber(value) {
  return value === '' ? null : Number(value);
}

function nullableBoolean(value) {
  return value === '' ? null : value === 'true';
}

function isSafePublicWebsite(value) {
  if (!value.trim()) return true;
  try {
    return ['http:', 'https:'].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

function Section({ title, description, children }) {
  return (
    <FrostedPanel className="p-5 sm:p-6">
      <div className="border-b border-border/70 pb-4">
        <h2 className="font-serif text-xl font-semibold">{title}</h2>
        <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
      </div>
      <div className="mt-5 grid gap-5 sm:grid-cols-2">{children}</div>
    </FrostedPanel>
  );
}

function HospitalProfileForm({ workspace, refresh }) {
  const [values, setValues] = useState(() => toFormValues(workspace.hospital));
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const canEdit = canManageHospital(workspace);

  useEffect(() => {
    setValues(toFormValues(workspace.hospital));
  }, [workspace.hospital]);

  const update = event => setValues(current => ({ ...current, [event.target.name]: event.target.value }));
  const reset = () => setValues(toFormValues(workspace.hospital));

  const submit = async event => {
    event.preventDefault();
    if (!canEdit || saving) return;

    const name = values.name.trim();
    if (!name) {
      setToast({ tone: 'error', message: 'Hospital name is required.' });
      return;
    }
    if (!values.country.trim()) {
      setToast({ tone: 'error', message: 'Country is required by the hospital record.' });
      return;
    }
    if (!isSafePublicWebsite(values.website)) {
      setToast({ tone: 'error', message: 'Website must be a complete http:// or https:// address.' });
      return;
    }

    const totalBeds = nullableNumber(values.total_beds);
    const icuBeds = nullableNumber(values.icu_beds);
    if ((totalBeds != null && totalBeds < 0) || (icuBeds != null && icuBeds < 0)) {
      setToast({ tone: 'error', message: 'Bed capacity cannot be negative.' });
      return;
    }
    if (totalBeds != null && icuBeds != null && icuBeds > totalBeds) {
      setToast({ tone: 'error', message: 'ICU bed capacity cannot exceed total bed capacity.' });
      return;
    }

    const payload = Object.fromEntries(textFields.map(field => [field, ['name', 'country'].includes(field) ? values[field].trim() : nullableText(values[field])]));
    payload.year_established = nullableNumber(values.year_established);
    payload.total_beds = totalBeds;
    payload.icu_beds = icuBeds;
    payload.emergency_department = nullableBoolean(values.emergency_department);
    payload.ambulance_available = nullableBoolean(values.ambulance_available);

    setSaving(true);
    try {
      await updateHospitalProfile(workspace.hospital.id, payload);
      await refresh();
      setToast({ tone: 'success', message: 'Hospital profile updated.' });
    } catch (error) {
      console.error('Could not update hospital profile:', error);
      setToast({ tone: 'error', message: 'Could not save the profile. Your existing record was not changed.' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <form onSubmit={submit} className="space-y-5">
        {!canEdit && (
          <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>Your membership is view-only. An organization owner or administrator can update this profile.</p>
          </div>
        )}

        <Section title="Identity" description="Use the hospital’s official public-facing identity. The URL slug and publication state remain reviewer-controlled.">
          <FormField id="hospital-name" name="name" label="Hospital name" value={values.name} onChange={update} required disabled={!canEdit} />
          <FormField id="legal-name" name="legal_name" label="Legal name" value={values.legal_name} onChange={update} placeholder="Not provided" disabled={!canEdit} />
          <FormField id="hospital-type" name="hospital_type" label="Hospital type" value={values.hospital_type} onChange={update} placeholder="e.g. General hospital" disabled={!canEdit} />
          <FormField id="year-established" name="year_established" label="Year established" value={values.year_established} onChange={update} type="number" min="1800" max={new Date().getFullYear()} placeholder="Not provided" disabled={!canEdit} />
        </Section>

        <Section title="Location" description="Public address details used on the hospital profile.">
          <FormField id="address-line-1" name="address_line_1" label="Address line 1" value={values.address_line_1} onChange={update} placeholder="Not provided" disabled={!canEdit} className="sm:col-span-2" />
          <FormField id="address-line-2" name="address_line_2" label="Address line 2" value={values.address_line_2} onChange={update} placeholder="Not provided" disabled={!canEdit} className="sm:col-span-2" />
          <FormField id="locality" name="locality" label="Locality" value={values.locality} onChange={update} placeholder="Not provided" disabled={!canEdit} />
          <FormField id="city" name="city" label="City" value={values.city} onChange={update} placeholder="Not provided" disabled={!canEdit} />
          <FormField id="district" name="district" label="District" value={values.district} onChange={update} placeholder="Not provided" disabled={!canEdit} />
          <FormField id="state" name="state" label="State" value={values.state} onChange={update} placeholder="Not provided" disabled={!canEdit} />
          <FormField id="country" name="country" label="Country" value={values.country} onChange={update} required disabled={!canEdit} />
          <FormField id="pin-code" name="pin_code" label="PIN code" value={values.pin_code} onChange={update} inputMode="numeric" placeholder="Not provided" disabled={!canEdit} />
        </Section>

        <Section title="Public contact" description="Only enter contact details intended to appear on the public hospital page.">
          <FormField id="public-phone" name="public_phone" label="Public phone" value={values.public_phone} onChange={update} type="tel" placeholder="Not provided" disabled={!canEdit} />
          <FormField id="public-email" name="public_email" label="Public email" value={values.public_email} onChange={update} type="email" placeholder="Not provided" disabled={!canEdit} />
          <FormField id="website" name="website" label="Website" value={values.website} onChange={update} type="url" placeholder="https://example.org" disabled={!canEdit} className="sm:col-span-2" />
        </Section>

        <Section title="Capacity and emergency facts" description="These are static profile facts. MEDIMESH does not treat them as live occupancy or availability.">
          <FormField id="total-beds" name="total_beds" label="Total bed capacity" value={values.total_beds} onChange={update} type="number" min="0" placeholder="Not provided" disabled={!canEdit} />
          <FormField id="icu-beds" name="icu_beds" label="ICU bed capacity" value={values.icu_beds} onChange={update} type="number" min="0" placeholder="Not provided" disabled={!canEdit} />
          <FormField as="select" id="emergency-department" name="emergency_department" label="Emergency department" value={values.emergency_department} onChange={update} disabled={!canEdit}>
            <option value="">Not provided</option><option value="true">Available</option><option value="false">Not available</option>
          </FormField>
          <FormField as="select" id="ambulance-available" name="ambulance_available" label="Ambulance service" value={values.ambulance_available} onChange={update} disabled={!canEdit}>
            <option value="">Not provided</option><option value="true">Available</option><option value="false">Not available</option>
          </FormField>
        </Section>

        {canEdit && (
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Button type="button" variant="ghost" onClick={reset} disabled={saving} className="gap-2"><RotateCcw className="h-4 w-4" /> Reset changes</Button>
            <Button type="submit" disabled={saving} className="gap-2"><Save className="h-4 w-4" /> {saving ? 'Saving…' : 'Save profile'}</Button>
          </div>
        )}
      </form>
      <Toast message={toast?.message} tone={toast?.tone} onClose={() => setToast(null)} />
    </>
  );
}

export default function HospitalProfile() {
  const portal = useHospitalPortal();
  return (
    <HospitalPortalGate portal={portal}>
      {workspace => (
        <AppPageContainer>
          <PageHeader eyebrow="Hospital profile" title="Profile details" description="Manage safe structured facts on the canonical hospital record." />
          <HospitalProfileForm workspace={workspace} refresh={portal.refresh} />
        </AppPageContainer>
      )}
    </HospitalPortalGate>
  );
}
