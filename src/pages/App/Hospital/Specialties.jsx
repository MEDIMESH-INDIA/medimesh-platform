import AppPageContainer from '../../../components/layout/AppPageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { HospitalPortalGate } from '../../../components/hospital/portal/HospitalPortalState';
import TaxonomyManager from '../../../components/hospital/portal/TaxonomyManager';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';

export default function HospitalSpecialties() {
  const portal = useHospitalPortal();
  return (
    <HospitalPortalGate portal={portal}>
      {workspace => (
        <AppPageContainer>
          <PageHeader eyebrow="Public profile" title="Clinical specialties" description="Select the normalized specialties that accurately describe this hospital’s clinical focus." />
          <TaxonomyManager kind="specialties" workspace={workspace} onChanged={portal.refresh} title="Listed specialties" description="These terms appear as structured specialties on the hospital profile." emptyText="No specialties have been added yet." />
        </AppPageContainer>
      )}
    </HospitalPortalGate>
  );
}
