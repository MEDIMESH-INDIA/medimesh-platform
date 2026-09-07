import AppPageContainer from '../../../components/layout/AppPageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { HospitalPortalGate } from '../../../components/hospital/portal/HospitalPortalState';
import TaxonomyManager from '../../../components/hospital/portal/TaxonomyManager';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';

export default function HospitalFacilities() {
  const portal = useHospitalPortal();
  return (
    <HospitalPortalGate portal={portal}>
      {workspace => (
        <AppPageContainer>
          <PageHeader eyebrow="Public profile" title="Facilities" description="Maintain durable facility attributes. This area never represents live capacity or availability." />
          <TaxonomyManager kind="facilities" workspace={workspace} onChanged={portal.refresh} title="Listed facilities" description="Provider-supplied terms can be removed; source-backed terms remain protected." emptyText="No facilities have been added yet." />
        </AppPageContainer>
      )}
    </HospitalPortalGate>
  );
}
