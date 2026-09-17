'use client';

import React, { useState } from 'react';
import {
  Header,
  Footer,
  MobileBottomNav,
  Breadcrumbs,
  MobileBackButton,
  SearchIcon,
  ShieldIcon,
  LocationIcon,
  HospitalIcon,
  TuneIcon,
  InfoIcon,
  BookmarkIcon,
} from '@/components/global';
import {
  Button,
  IconButton,
  Badge,
  StatusBadge,
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  InfoCard,
  InsetArea,
  Section,
  SectionHeader,
  Container,
  Divider,
  Tabs,
  TabList,
  TabTrigger,
  TabContent,
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
  Dialog,
  DialogFooter,
  BottomSheet,
  BottomSheetFooter,
  Tooltip,
  Skeleton,
  SkeletonText,
  SkeletonCard,
  SkeletonCircle,
  Avatar,
  ToastProvider,
  useToast,
} from '@/design-system';
import {
  Input,
  Select,
  Textarea,
  Checkbox,
  Radio,
  Switch,
} from '@/components/forms';
import {
  VerificationBadge,
  SourceBadge,
  FreshnessIndicator,
  LastUpdated,
  ProvenanceRow,
  TrustPanel,
  SourceInfo,
} from '@/components/trust';
import {
  DistanceLabel,
  LocationIndicator,
  LocationSelector,
} from '@/components/location';
import {
  GlobalSearch,
  SearchInterpretation,
  SearchFilterButton,
} from '@/components/discovery';
import {
  SaveButton,
  CompareButton,
  ComparisonLimitNotice,
} from '@/components/comparison';
import {
  EmptyState,
  ErrorState,
  OfflineBanner,
  InlineLoading,
} from '@/components/system';
import type { UserLocation, Source } from '@/types';

const DEMO_NOW_ISO = '2026-09-17T09:15:00.000Z';
const DEMO_STALE_ISO = '2026-09-14T09:15:00.000Z';

// Mock provenance record for demonstration
const demoSource: Source = {
  verificationState: 'MEDIMESH_VERIFIED',
  sourceOrganization: 'National Health Authority (PM-JAY Registry)',
  sourceTitle: 'Empaneled Hospital Master Registry 2026',
  sourceUrl: 'https://example.gov.in/registry',
  publishedDate: '2026-01-15',
  lastUpdated: '2026-09-10',
  lastReviewed: '2026-09-12',
  verifiedBy: 'MEDIMESH Data Team',
  verificationDate: '2026-09-12',
};

function ShowcaseContent() {
  const { showToast } = useToast();

  // State management for interactive showcase components
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<UserLocation>({
    mode: 'SELECTED',
    displayName: 'Bengaluru, Karnataka',
    city: 'Bengaluru',
    state: 'Karnataka',
  });

  // Action states
  const [isSaved, setIsSaved] = useState(false);
  const [comparedCount, setComparedCount] = useState(1);
  const [isCompared, setIsCompared] = useState(false);
  const [activeFilter, setActiveFilter] = useState('cardiology');
  const [switchChecked, setSwitchChecked] = useState(true);

  // Button loading toggle
  const [isBtnLoading, setIsBtnLoading] = useState(false);

  const handleToggleSave = () => {
    const next = !isSaved;
    setIsSaved(next);
    showToast(next ? 'Saved to My MEDIMESH' : 'Removed from saved items', 'info');
  };

  const handleToggleCompare = () => {
    if (!isCompared && comparedCount >= 2) {
      showToast('Maximum 2 facilities can be compared at a time.', 'info');
      return;
    }
    const next = !isCompared;
    setIsCompared(next);
    setComparedCount((prev) => (next ? prev + 1 : prev - 1));
    showToast(next ? 'Added to comparison' : 'Removed from comparison', 'success');
  };

  return (
    <div className="flex flex-col min-h-screen bg-[var(--color-background)]">
      {/* Offline Banner Preview */}
      <OfflineBanner lastUpdatedDate="12 Sep 2026, 09:30 IST" />

      {/* Global Navigation Header */}
      <Header
        currentLocation={currentLocation}
        onLocationChange={(loc) => {
          setCurrentLocation(loc);
          showToast(`Location set to ${loc.displayName}`);
        }}
        onSearchClick={() => showToast('Global search modal trigger')}
      />

      <main className="flex-1 pb-24">
        {/* Showcase Intro Banner */}
        <div className="bg-[var(--color-surface-container-low)] border-b border-[var(--color-border-default)] py-6">
          <Container>
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-col gap-1">
                <Breadcrumbs
                  items={[
                    { label: 'System Design', href: '/showcase' },
                    { label: 'Component Showcase' },
                  ]}
                  className="mb-2"
                />
                <div className="flex items-center gap-2">
                  <h1 className="font-heading text-2xl md:text-3xl font-bold text-[var(--color-on-surface)]">
                    MEDIMESH Design System Showcase
                  </h1>
                  <Badge variant="primary" size="sm">
                    DEV ONLY
                  </Badge>
                </div>
                <p className="font-body text-xs md:text-sm text-[var(--color-on-surface-variant)] max-w-2xl">
                  Internal visual validation canvas for Prompt 02. Demonstrates all reusable tokens, primitives, form controls, trust badges, location UI, and system states.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <MobileBackButton onBack={() => showToast('Navigated back')} />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setIsBtnLoading(true);
                    setTimeout(() => setIsBtnLoading(false), 1500);
                  }}
                >
                  Test Loading States
                </Button>
              </div>
            </div>
          </Container>
        </div>

        <Container className="py-8 flex flex-col gap-12">
          {/* SECTION 1: BUTTONS & ICON BUTTONS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Primitives"
              title="1. Button System"
              subtitle="Accessible interactive buttons supporting primary teal branding, secondary civic accents, destructive actions, focus rings, and loading spinners."
            />

            <div className="flex flex-col gap-4 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <div className="flex items-center flex-wrap gap-3">
                <Button variant="primary" size="md" isLoading={isBtnLoading}>
                  Primary Button
                </Button>
                <Button variant="secondary" size="md" isLoading={isBtnLoading}>
                  Secondary Action
                </Button>
                <Button variant="outline" size="md">
                  Outline Neutral
                </Button>
                <Button variant="ghost" size="md">
                  Ghost Button
                </Button>
                <Button variant="destructive" size="md">
                  Destructive
                </Button>
                <Button variant="tertiary" size="md">
                  Tertiary Link Button
                </Button>
              </div>

              <Divider spacing="sm" />

              <div className="flex items-center flex-wrap gap-3">
                <Button variant="primary" size="sm" leftIcon={<HospitalIcon size={14} />}>
                  Small with Icon
                </Button>
                <Button variant="primary" size="md" leftIcon={<SearchIcon size={16} />}>
                  Medium with Left Icon
                </Button>
                <Button variant="primary" size="lg" rightIcon={<ShieldIcon size={18} />}>
                  Large with Right Icon
                </Button>
                <Button variant="primary" size="md" disabled>
                  Disabled State
                </Button>
              </div>

              <Divider spacing="sm" />

              <div className="flex items-center gap-3">
                <span className="font-label-sm text-xs text-[var(--color-outline)]">Icon Buttons (min 44px mobile touch target):</span>
                <IconButton
                  aria-label="Search facilities"
                  variant="outline"
                  size="md"
                  icon={<SearchIcon size={18} />}
                  onClick={() => showToast('Search clicked')}
                />
                <IconButton
                  aria-label="Save facility"
                  variant="ghost"
                  size="md"
                  icon={<BookmarkIcon size={18} />}
                  onClick={() => showToast('Save clicked')}
                />
                <IconButton
                  aria-label="View locations"
                  variant="primary"
                  size="md"
                  icon={<LocationIcon size={18} />}
                  onClick={() => setIsLocationModalOpen(true)}
                />
              </div>
            </div>
          </Section>

          {/* SECTION 2: FORM CONTROLS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Form Controls"
              title="2. Form Inputs & Selection"
              subtitle="Inputs, search controls, dropdown selects, textareas, checkboxes, radio groups, and switches with accessible labels and error states."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <Input
                label="Standard Text Input"
                placeholder="e.g. Cardiological examination"
                helperText="Enter medical condition or specialty keyword"
                leftIcon={<SearchIcon size={16} />}
              />

              <Input
                label="Input with Error State"
                defaultValue="Invalid query #"
                errorText="Special characters are filtered out during search"
                required
              />

              <Select
                label="Filter by Facility Type"
                helperText="Choose accredited institution category"
                options={[
                  { value: 'all', label: 'All Facility Types' },
                  { value: 'multi', label: 'Multi-Specialty Hospital' },
                  { value: 'single', label: 'Single-Specialty Cardiac Center' },
                  { value: 'govt', label: 'Government Medical College' },
                ]}
              />

              <Textarea
                label="Correction Report Details"
                placeholder="Describe outdated information or tariff discrepancies..."
                helperText="Include official gazette reference or hospital notice if available"
                showCharCount
                maxLength={300}
                rows={3}
              />

              <div className="flex flex-col gap-3">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  Checkboxes &amp; Switches
                </span>
                <Checkbox
                  label="Ayushman Bharat (PM-JAY) Empaneled Only"
                  helperText="Filter for facilities offering cashless public coverage"
                  defaultChecked
                />
                <Checkbox
                  label="24/7 Casualty &amp; Emergency Intake"
                  helperText="Verify operational emergency desk"
                />
                <div className="pt-2">
                  <Switch
                    label="Show approximate distance estimates"
                    helperText="Calculates distance from selected city centre"
                    checked={switchChecked}
                    onCheckedChange={setSwitchChecked}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-3">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  Radio Selection
                </span>
                <Radio
                  name="sort-option"
                  label="Distance (Nearest reference point first)"
                  defaultChecked
                />
                <Radio
                  name="sort-option"
                  label="Data Freshness (Recent casualty updates)"
                />
                <Radio
                  name="sort-option"
                  label="Facility Name (Alphabetical A–Z)"
                />
              </div>
            </div>
          </Section>

          {/* SECTION 3: SEARCH COMPLEX & DISCOVERY */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Discovery UI"
              title="3. Search Primitives & Query Parsing"
              subtitle="Search input complex with voice dictation, common query suggestion ribbons, interpreted queries, and filter buttons."
            />

            <div className="flex flex-col gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <GlobalSearch
                onSearch={(q) => showToast(`Search executed: "${q}"`)}
                onSelectSuggestion={(s) => showToast(`Selected: "${s}"`)}
              />

              <SearchInterpretation
                query="Cardiology in Bengaluru"
                specialty="Cardiology"
                location="Bengaluru, KA"
                facilityType="Tertiary Care Hospital"
                onLocationChange={() => setIsLocationModalOpen(true)}
                onEditSearch={() => showToast('Editing search query')}
              />

              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-label-sm text-xs text-[var(--color-outline)] uppercase tracking-wider mr-1">
                  Active Filters:
                </span>
                <SearchFilterButton
                  label="Cardiology"
                  icon={<TuneIcon size={14} />}
                  active={activeFilter === 'cardiology'}
                  count={4}
                  onClear={() => {
                    setActiveFilter('');
                    showToast('Cleared specialty filter');
                  }}
                />
                <SearchFilterButton
                  label="PM-JAY Empaneled"
                  hasDropdown
                  onClick={() => showToast('Opening scheme filter dropdown')}
                />
                <SearchFilterButton
                  label="24/7 Emergency Casualty"
                  hasDropdown
                  onClick={() => showToast('Opening casualty filter dropdown')}
                />
              </div>
            </div>
          </Section>

          {/* SECTION 4: BADGES, TRUST & PROVENANCE */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Trust Architecture"
              title="4. Verification States & Provenance"
              subtitle="The five canonical MEDIMESH trust states, operational status badges, and source transparency cards."
            />

            <div className="flex flex-col gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              {/* Verification States */}
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  The 5 Locked Verification States:
                </span>
                <div className="flex items-center flex-wrap gap-3">
                  <VerificationBadge state="MEDIMESH_VERIFIED" />
                  <VerificationBadge state="FACILITY_REPORTED" />
                  <VerificationBadge state="PUBLIC_SOURCE" />
                  <VerificationBadge state="PENDING_VERIFICATION" />
                  <VerificationBadge state="NOT_CONFIRMED" />
                  <SourceBadge source={demoSource} />
                </div>
              </div>

              {/* Generic Status Badges */}
              <div className="flex flex-col gap-2">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  Operational Status Badges:
                </span>
                <div className="flex items-center flex-wrap gap-3">
                  <StatusBadge status="active" label="Casualty: Active Normal" />
                  <StatusBadge status="updated" label="Bed Data: Updated 2h ago" />
                  <StatusBadge status="pending" label="Audit In Progress" />
                  <StatusBadge status="stale" label="Data > 48h Stale" />
                  <StatusBadge status="unavailable" label="Casualty: Closed/Diverted" />
                </div>
              </div>

              {/* Freshness & Timestamps */}
              <div className="flex items-center flex-wrap gap-6 p-4 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)]">
                <FreshnessIndicator
                  isoDate={DEMO_NOW_ISO}
                  reporter="Facility Admin Desk"
                />
                <FreshnessIndicator
                  isoDate={DEMO_STALE_ISO}
                  reporter="Public Gazette"
                />
                <LastUpdated isoDate={DEMO_NOW_ISO} />
              </div>

              {/* Trust Panel & Provenance Rows */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <TrustPanel source={demoSource} />

                <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-border-default)] rounded-[var(--radius-lg)] p-4 flex flex-col justify-between">
                  <div>
                    <h3 className="font-heading font-semibold text-sm text-[var(--color-on-surface)] mb-3 pb-2 border-b border-[var(--color-border-default)]">
                      Facility Provenance Details
                    </h3>
                    <ProvenanceRow label="NABH Accreditation" value="Level 3 Institutional" source={demoSource} />
                    <ProvenanceRow label="Ayushman Bharat Empanelment" value="Active AB-PMJAY" source={demoSource} />
                    <ProvenanceRow
                      label="Emergency Department Capability"
                      value="Hospital Reported"
                      source={{ ...demoSource, verificationState: 'FACILITY_REPORTED' }}
                    />
                    <ProvenanceRow
                      label="Robotic Cardiac Surgery"
                      value="Declaration Pending"
                      source={{ ...demoSource, verificationState: 'NOT_CONFIRMED' }}
                    />
                  </div>
                  <div className="pt-3">
                    <SourceInfo source={demoSource} />
                  </div>
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 5: CARDS & CONTAINERS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Containers"
              title="5. Cards, Inset Areas & Information Blocks"
              subtitle="Standard structural cards, interactive items, and informational callout containers in neutral, teal, blue, and amber tones."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card elevation="low" className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <VerificationBadge state="MEDIMESH_VERIFIED" size="sm" />
                    <DistanceLabel km={3.2} />
                  </div>
                  <CardTitle>Example Hospital Card</CardTitle>
                  <CardDescription>
                    Tertiary Care Multi-Specialty Hospital with dedicated 24/7 cardiac ICU and diagnostic labs.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-[var(--color-on-surface-variant)] space-y-1">
                    <p>📍 Jayanagar 4th Block, Bengaluru</p>
                    <p>🏥 350 Inpatient Beds · 24 ICU Beds</p>
                  </div>
                </CardContent>
                <CardFooter>
                  <SaveButton
                    isSaved={isSaved}
                    onToggleSave={handleToggleSave}
                    showText
                  />
                  <CompareButton
                    isComparing={isCompared}
                    onToggleCompare={handleToggleCompare}
                  />
                </CardFooter>
              </Card>

              <Card variant="interactive" elevation="raised" className="flex flex-col justify-between">
                <CardHeader>
                  <div className="flex items-center justify-between mb-1">
                    <VerificationBadge state="FACILITY_REPORTED" size="sm" />
                    <DistanceLabel km={6.8} />
                  </div>
                  <CardTitle>Interactive Facility Card</CardTitle>
                  <CardDescription>
                    Clicking lifts the card with elevated shadow for accessible navigation.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <InsetArea variant="teal" className="text-xs">
                    <strong>Casualty Intake Status:</strong> Active Normal (Adult Emergency)
                  </InsetArea>
                </CardContent>
                <CardFooter>
                  <span className="text-xs font-semibold text-[var(--color-primary)]">
                    View Verified Record →
                  </span>
                </CardFooter>
              </Card>

              <div className="flex flex-col gap-3">
                <InfoCard variant="neutral" title="Neutral Information">
                  Standard guidance regarding healthcare documentation and operational hours.
                </InfoCard>

                <InfoCard variant="teal" title="Verified Facility Anchor">
                  Accredited institutional care verified against state gazette records.
                </InfoCard>

                <InfoCard variant="blue" title="Public Scheme Notice">
                  Ayushman Bharat PM-JAY and CGHS cashless admission guidelines.
                </InfoCard>

                <InfoCard variant="amber" title="Freshness Notice">
                  Information older than 48 hours requires facility confirmation.
                </InfoCard>
              </div>
            </div>
          </Section>

          {/* SECTION 6: ACTIONS & COMPARISON */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Actions"
              title="6. Save & Compare Actions"
              subtitle="Two-facility comparison limiter, save/bookmark buttons, and interactive feedback toasts."
            />

            <div className="flex flex-col gap-4 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <div className="flex items-center flex-wrap gap-4">
                <SaveButton isSaved={isSaved} onToggleSave={handleToggleSave} showText />
                <CompareButton isComparing={isCompared} onToggleCompare={handleToggleCompare} />
                <Button
                  variant="outline"
                  size="md"
                  onClick={() => showToast('Link copied to clipboard', 'info')}
                >
                  Test Toast Notification
                </Button>
              </div>

              <ComparisonLimitNotice />
            </div>
          </Section>

          {/* SECTION 7: LOCATION COMPONENTS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Location"
              title="7. Location & Distance Architecture"
              subtitle="Strict adherence to approximate distance indicators (~X.X km approx), location mode indicators, and city selector modal."
            />

            <div className="flex flex-col md:flex-row items-start justify-between gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <LocationIndicator
                location={currentLocation}
                onChangeClick={() => setIsLocationModalOpen(true)}
              />

              <div className="flex items-center gap-3">
                <span className="text-xs text-[var(--color-outline)] font-body">Distance Labels:</span>
                <DistanceLabel km={1.5} />
                <span className="text-[var(--color-outline-variant)]">·</span>
                <DistanceLabel km={4.2} />
                <span className="text-[var(--color-outline-variant)]">·</span>
                <DistanceLabel km={12.0} />
              </div>

              <Button
                variant="primary"
                size="sm"
                leftIcon={<LocationIcon size={16} />}
                onClick={() => setIsLocationModalOpen(true)}
              >
                Change Location Modal
              </Button>
            </div>
          </Section>

          {/* SECTION 8: MODALS, SHEETS, TABS & ACCORDIONS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Overlays & Layout Primitives"
              title="8. Tabs, Accordion, Dialog, BottomSheet & Tooltip"
              subtitle="Accessible modal dialog with focus trapping, mobile bottom sheet, tabs with arrow key navigation, and accordion."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              {/* Tabs */}
              <div className="flex flex-col gap-3">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  Accessible Tabs Component
                </span>
                <Tabs defaultValue="hospitals">
                  <TabList>
                    <TabTrigger value="hospitals">Hospitals (24)</TabTrigger>
                    <TabTrigger value="specialties">Specialties (12)</TabTrigger>
                    <TabTrigger value="schemes">Schemes (4)</TabTrigger>
                  </TabList>
                  <TabContent value="hospitals">
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                      Showing verified hospitals matching your selected search query. Use arrow keys to cycle tabs.
                    </p>
                  </TabContent>
                  <TabContent value="specialties">
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                      Clinical specialties categorized by super-specialty, diagnostic support, and surgery units.
                    </p>
                  </TabContent>
                  <TabContent value="schemes">
                    <p className="text-xs text-[var(--color-on-surface-variant)] leading-relaxed">
                      Government healthcare access schemes including Ayushman Bharat PM-JAY and CGHS empanelment.
                    </p>
                  </TabContent>
                </Tabs>
              </div>

              {/* Accordion */}
              <div className="flex flex-col gap-3">
                <span className="font-label-md text-xs font-semibold text-[var(--color-on-surface)]">
                  Accessible Accordion Component
                </span>
                <Accordion type="single" defaultValue="item-1">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>How does MEDIMESH verify healthcare information?</AccordionTrigger>
                    <AccordionContent>
                      Records are verified by cross-referencing state health gazettes, public hospital registries, and direct institutional documentation. No commercial sponsorship affects listing order.
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="item-2">
                    <AccordionTrigger>What does &ldquo;Not Confirmed&rdquo; indicate?</AccordionTrigger>
                    <AccordionContent>
                      &ldquo;Not Confirmed&rdquo; means there is currently insufficient public or facility-reported information to verify that specific service or metric. It does not imply the information is false.
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </div>

              {/* Modal and Bottom Sheet Triggers */}
              <div className="flex items-center gap-4 pt-2">
                <Button variant="primary" size="md" onClick={() => setIsDialogOpen(true)}>
                  Open Dialog Modal
                </Button>
                <Button variant="secondary" size="md" onClick={() => setIsSheetOpen(true)}>
                  Open Mobile Bottom Sheet
                </Button>
              </div>

              {/* Tooltip & Avatar */}
              <div className="flex items-center gap-6 pt-2">
                <Tooltip content="Verified against state health department records">
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-[var(--color-primary)] cursor-help border-b border-dashed border-[var(--color-primary)]">
                    <InfoIcon size={14} />
                    <span>Hover for Tooltip</span>
                  </span>
                </Tooltip>

                <div className="flex items-center gap-2">
                  <Avatar name="Ananya Sharma" size="sm" />
                  <Avatar name="Rahul Verma" size="md" />
                  <Avatar size="md" />
                </div>
              </div>
            </div>
          </Section>

          {/* SECTION 9: LOADING & SKELETONS */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="Loading States"
              title="9. Skeletons & Inline Indicators"
              subtitle="Loading skeletons that preserve layout geometry without ever presenting fabricated medical records."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-[var(--color-surface-container-lowest)] p-6 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
              <SkeletonCard />
              <div className="flex flex-col gap-4 p-4 rounded-[var(--radius-lg)] border border-[var(--color-border-default)]">
                <div className="flex items-center gap-3">
                  <SkeletonCircle size={40} />
                  <Skeleton className="h-4 w-32" />
                </div>
                <SkeletonText lines={3} />
              </div>
              <div className="flex flex-col items-center justify-center p-6 border border-[var(--color-border-default)] rounded-[var(--radius-lg)] gap-3">
                <InlineLoading text="Querying public health registry..." />
                <span className="text-xs text-[var(--color-outline)]">Subtle non-blocking loading state</span>
              </div>
            </div>
          </Section>

          {/* SECTION 10: SYSTEM STATES */}
          <Section spacing="sm">
            <SectionHeader
              eyebrow="System States"
              title="10. Empty & Error States"
              subtitle="Standardized recovery states for missing data, network timeouts, and non-existent facilities."
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <EmptyState
                title="No cardiology facilities found in this area"
                description="Try expanding the approximate radius to 25 km or clearing specialty filters."
                action={
                  <Button variant="primary" size="sm" onClick={() => showToast('Filters reset')}>
                    Reset filters
                  </Button>
                }
              />

              <ErrorState
                title="Unable to load facility tariffs"
                description="The public tariff registry response timed out. Healthcare records remain safe. Please retry."
                onRetry={() => showToast('Retrying network request...')}
              />
            </div>
          </Section>
        </Container>
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Mobile Bottom Navigation Shell */}
      <MobileBottomNav />

      {/* Modal Dialog Instance */}
      <Dialog
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        title="Information Disclosure Notice"
        description="MEDIMESH verification guidelines and operational policies."
        size="md"
      >
        <div className="flex flex-col gap-3 text-xs md:text-sm leading-relaxed text-[var(--color-on-surface-variant)]">
          <p>
            MEDIMESH provides structured access to public and facility-reported healthcare intelligence across India. All facility records include explicit provenance labels detailing the source organization and verification date.
          </p>
          <p>
            Distances displayed are approximations calculated from the geographic center of your chosen municipality or district.
          </p>
        </div>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setIsDialogOpen(false)}>
            Close
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsDialogOpen(false)}>
            I Understand
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Mobile Bottom Sheet Instance */}
      <BottomSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        title="Facility Filter Options"
        description="Refine healthcare results by capability and scheme."
      >
        <div className="flex flex-col gap-4 py-2">
          <Checkbox label="NABH Accredited Facilities" defaultChecked />
          <Checkbox label="AB-PMJAY Cashless Direct Desk" defaultChecked />
          <Checkbox label="24/7 Emergency Casualty Operational" defaultChecked />
          <Checkbox label="Pediatric Intensive Care Unit (PICU)" />
        </div>
        <BottomSheetFooter>
          <Button variant="outline" size="sm" onClick={() => setIsSheetOpen(false)}>
            Cancel
          </Button>
          <Button variant="primary" size="sm" onClick={() => setIsSheetOpen(false)}>
            Apply 3 Filters
          </Button>
        </BottomSheetFooter>
      </BottomSheet>

      {/* Location Modal Instance */}
      <LocationSelector
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={(loc) => {
          setCurrentLocation(loc);
          showToast(`Location changed to ${loc.displayName}`);
        }}
      />
    </div>
  );
}

export default function ShowcasePage() {
  return (
    <ToastProvider>
      <ShowcaseContent />
    </ToastProvider>
  );
}
