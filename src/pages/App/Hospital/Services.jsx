import AppPageContainer from '../../../components/layout/AppPageContainer';
import PageHeader from '../../../components/common/PageHeader';
import { HospitalPortalGate } from '../../../components/hospital/portal/HospitalPortalState';
import TaxonomyManager from '../../../components/hospital/portal/TaxonomyManager';
import { useHospitalPortal } from '../../../hooks/useHospitalPortal';

export default function HospitalServices() {
  const portal = useHospitalPortal();
  return (
    <HospitalPortalGate portal={portal}>
      {workspace => (
        <AppPageContainer>
          <PageHeader eyebrow="Public profile" title="Services catalog" description="Choose the normalized care services this hospital provides. Do not use this list for real-time service availability." />
          <TaxonomyManager kind="services" workspace={workspace} onChanged={portal.refresh} title="Listed services" description="Only canonical MEDIMESH service terms can be attached to a hospital." emptyText="No services have been added yet." />
        </AppPageContainer>
      )}
    </HospitalPortalGate>
  );
}
