import { useEffect, useState, useMemo } from 'react';
import {
  Compass,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ShieldAlert,
  Search,
  SlidersHorizontal,
  Building2,
  Stethoscope,
  Sparkles,
  Info,
} from 'lucide-react';
import AppPageContainer from '../../components/layout/AppPageContainer';
import Button from '../../components/common/Button';
import FrostedPanel from '../../components/common/FrostedPanel';
import LoadingState from '../../components/common/LoadingState';
import EmptyState from '../../components/common/EmptyState';
import CareFinderCard from '../../components/careFinder/CareFinderCard';
import CompareTray from '../../components/hospital/CompareTray';
import {
  getCareFinderOptions,
  executeCareFinder,
} from '../../lib/careFinder/careFinderService';
import {
  CRITERION_MODE,
} from '../../lib/careFinder/careFinderMatching';
import { useCompare } from '../../hooks/useCompare';
import { formatHospitalType } from '../../lib/utils/formatters';

const STEPS = [
  { id: 0, title: 'Care Need', subtitle: 'Select medical category' },
  { id: 1, title: 'Location', subtitle: 'Target city or locality' },
  { id: 2, title: 'Requirements', subtitle: 'Facilities & preferences' },
  { id: 3, title: 'Review', subtitle: 'Confirm selected criteria' },
  { id: 4, title: 'Matches', subtitle: 'Explainable results' },
];

export default function CareFinderExperience({ mode = 'canonical' }) {
  const { compareList } = useCompare();

  // Wizard state
  const [currentStep, setCurrentStep] = useState(0);
  const [options, setOptions] = useState({
    categories: [],
    cities: [],
    localities: [],
    cityToLocalities: {},
    facilities: [],
    types: [],
  });
  const [optionsLoading, setOptionsLoading] = useState(true);

  // Criteria state
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categoryMode, setCategoryMode] = useState(CRITERION_MODE.MANDATORY);

  const [selectedCity, setSelectedCity] = useState('');
  const [selectedLocality, setSelectedLocality] = useState('');

  // Requirement toggles: { [key]: { enabled: boolean, mode: 'mandatory' | 'preference' } }
  const [requirements, setRequirements] = useState({
    emergency: { enabled: false, mode: CRITERION_MODE.MANDATORY },
    ambulance: { enabled: false, mode: CRITERION_MODE.PREFERENCE },
    icu: { enabled: false, mode: CRITERION_MODE.PREFERENCE },
  });

  const [selectedFacilities, setSelectedFacilities] = useState({}); // { [facilityName]: mode }
  const [selectedType, setSelectedType] = useState('');
  const [typeMode, setTypeMode] = useState(CRITERION_MODE.PREFERENCE);

  // Results state
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [results, setResults] = useState(null);

  // Load directory options on mount
  useEffect(() => {
    let active = true;
    setOptionsLoading(true);
    getCareFinderOptions({ mode })
      .then(data => {
        if (active) setOptions(data);
      })
      .catch(err => {
        if (active) console.error('Failed to load Care Finder options:', err);
      })
      .finally(() => {
        if (active) setOptionsLoading(false);
      });
    return () => { active = false; };
  }, [mode]);

  // Available localities based on selected city
  const availableLocalities = useMemo(() => {
    if (!selectedCity) return options.localities || [];
    return options.cityToLocalities?.[selectedCity] || [];
  }, [selectedCity, options.cityToLocalities, options.localities]);

  // Assemble active criteria list from state
  const assembledCriteria = useMemo(() => {
    const list = [];

    if (selectedCategory) {
      list.push({
        id: 'specialty_primary',
        type: 'specialty',
        value: selectedCategory,
        label: `${selectedCategory} Specialty`,
        mode: categoryMode,
      });
    }

    if (selectedCity) {
      list.push({
        id: 'location_city',
        type: 'city',
        value: selectedCity,
        label: `City: ${selectedCity}`,
        mode: CRITERION_MODE.MANDATORY,
      });
    }

    if (selectedLocality) {
      list.push({
        id: 'location_locality',
        type: 'locality',
        value: selectedLocality,
        label: `Locality: ${selectedLocality}`,
        mode: CRITERION_MODE.MANDATORY,
      });
    }

    if (requirements.emergency?.enabled) {
      list.push({
        id: 'req_emergency',
        type: 'emergency',
        value: true,
        label: '24/7 Emergency Department',
        mode: requirements.emergency.mode,
      });
    }

    if (requirements.ambulance?.enabled) {
      list.push({
        id: 'req_ambulance',
        type: 'ambulance',
        value: true,
        label: 'Ambulance Service',
        mode: requirements.ambulance.mode,
      });
    }

    if (requirements.icu?.enabled) {
      list.push({
        id: 'req_icu',
        type: 'icu',
        value: true,
        label: 'Intensive Care Unit (ICU)',
        mode: requirements.icu.mode,
      });
    }

    Object.entries(selectedFacilities).forEach(([facilityName, facMode]) => {
      if (facMode) {
        list.push({
          id: `facility_${facilityName}`,
          type: 'facility',
          value: facilityName,
          label: `${facilityName} Facility`,
          mode: facMode,
        });
      }
    });

    if (selectedType) {
      list.push({
        id: 'req_hospital_type',
        type: 'hospital_type',
        value: selectedType,
        label: `Hospital Type: ${formatHospitalType(selectedType)}`,
        mode: typeMode,
      });
    }

    return list;
  }, [selectedCategory, categoryMode, selectedCity, selectedLocality, requirements, selectedFacilities, selectedType, typeMode]);

  // Execute matching
  const runMatching = async () => {
    setSearching(true);
    setSearchError(null);
    setCurrentStep(4);
    try {
      const matchData = await executeCareFinder({ criteria: assembledCriteria, mode });
      setResults(matchData);
    } catch (err) {
      console.error('Care Finder matching error:', err);
      setSearchError('An error occurred while evaluating hospital directory records. Please check your connection and try again.');
    } finally {
      setSearching(false);
    }
  };

  const handleReset = () => {
    setSelectedCategory('');
    setCategoryMode(CRITERION_MODE.MANDATORY);
    setSelectedCity('');
    setSelectedLocality('');
    setRequirements({
      emergency: { enabled: false, mode: CRITERION_MODE.MANDATORY },
      ambulance: { enabled: false, mode: CRITERION_MODE.PREFERENCE },
      icu: { enabled: false, mode: CRITERION_MODE.PREFERENCE },
    });
    setSelectedFacilities({});
    setSelectedType('');
    setTypeMode(CRITERION_MODE.PREFERENCE);
    setResults(null);
    setCurrentStep(0);
  };

  const toggleFacility = (facName) => {
    setSelectedFacilities(prev => {
      const next = { ...prev };
      if (next[facName]) {
        delete next[facName];
      } else {
        next[facName] = CRITERION_MODE.PREFERENCE;
      }
      return next;
    });
  };

  const setFacilityMode = (facName, mode) => {
    setSelectedFacilities(prev => ({
      ...prev,
      [facName]: mode,
    }));
  };

  if (optionsLoading) {
    return (
      <AppPageContainer className="py-12">
        <LoadingState label="Preparing Care Finder directory options…" />
      </AppPageContainer>
    );
  }

  return (
    <AppPageContainer className="space-y-8 pb-16">
      {/* Hero Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
          <Compass className="w-3.5 h-3.5" />
          <span>Guided Decision Support</span>
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif font-bold text-foreground tracking-tight">
          Care Finder
        </h1>
        <p className="max-w-2xl text-sm sm:text-base text-muted-foreground leading-relaxed">
          Find hospitals matching your care requirements, understand exactly why each hospital appears, and see which information remains unverified.
        </p>
      </div>

      {/* Emergency Disclaimer Banner */}
      <div className="flex items-start gap-3 p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs sm:text-sm">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <p className="font-semibold">Not for emergency medical triage</p>
          <p className="text-amber-800/90 text-xs leading-relaxed">
            Care Finder is an informational discovery tool based on public records. If you are experiencing a life-threatening medical emergency, immediately call <strong>112</strong> or proceed to the nearest emergency department.
          </p>
        </div>
      </div>

      {/* Step Indicator / Wizard Progress */}
      <nav aria-label="Care Finder Steps" className="overflow-x-auto pb-2">
        <ol className="flex items-center min-w-[560px] sm:min-w-0 border-b border-border/60">
          {STEPS.map((s, idx) => {
            const isCurrent = currentStep === s.id;
            const isCompleted = currentStep > s.id;
            return (
              <li key={s.id} className="flex-1">
                <button
                  type="button"
                  onClick={() => {
                    // Allow navigating backwards or to review
                    if (currentStep > s.id || (s.id <= 3 && assembledCriteria.length > 0)) {
                      setCurrentStep(s.id);
                    }
                  }}
                  disabled={currentStep < s.id && assembledCriteria.length === 0}
                  className={`w-full text-left py-3 px-2 border-b-2 transition-all text-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isCurrent
                      ? 'border-primary text-primary font-bold'
                      : isCompleted
                      ? 'border-emerald-600 text-emerald-800 font-semibold'
                      : 'border-transparent text-muted-foreground'
                  }`}
                  aria-current={isCurrent ? 'step' : undefined}
                >
                  <span className="block text-[10px] uppercase tracking-wider opacity-75">
                    Step 0{idx + 1}
                  </span>
                  <span className="font-serif text-sm sm:text-base font-medium">
                    {s.title}
                  </span>
                </button>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* ----------------- STEP 0: CARE NEED ----------------- */}
      {currentStep === 0 && (
        <section aria-labelledby="step0-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="step0-heading" className="text-2xl font-serif font-bold text-foreground">
                What type of care are you looking for?
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Select a specialty grounded in the hospital directory catalog. (This is a directory category, not a clinical diagnosis).
              </p>
            </div>
            {selectedCategory && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={() => setSelectedCategory('')}
              >
                Clear specialty
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
            {options.categories.map(cat => {
              const isSelected = selectedCategory === cat.name;
              return (
                <button
                  key={cat.name}
                  type="button"
                  onClick={() => setSelectedCategory(cat.name)}
                  className={`p-4 rounded-2xl border text-left transition-all duration-150 flex flex-col justify-between min-h-28 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                    isSelected
                      ? 'border-primary bg-primary/10 ring-2 ring-primary/20 shadow-sm'
                      : 'border-border/70 bg-surface hover:border-primary/40 hover:bg-surface-elevated'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-base font-bold text-foreground">{cat.name}</span>
                      {isSelected && <Check className="w-4 h-4 text-primary shrink-0" />}
                    </div>
                    <p className="text-xs text-muted-foreground leading-snug line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                  {!cat.availableInCatalog && (
                    <span className="mt-2 text-[10px] text-amber-700 font-medium">
                      Limited directory data
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {selectedCategory && (
            <div className="p-4 rounded-xl bg-surface-elevated/60 border border-border/60 flex flex-wrap items-center justify-between gap-4 text-xs">
              <span className="font-medium text-foreground">
                Selected Specialty: <strong>{selectedCategory}</strong>
              </span>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Match enforcement:</span>
                <button
                  type="button"
                  onClick={() => setCategoryMode(CRITERION_MODE.MANDATORY)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    categoryMode === CRITERION_MODE.MANDATORY
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-muted-foreground border-border'
                  }`}
                >
                  Mandatory (Must have)
                </button>
                <button
                  type="button"
                  onClick={() => setCategoryMode(CRITERION_MODE.PREFERENCE)}
                  className={`px-2.5 py-1 rounded-lg font-semibold border ${
                    categoryMode === CRITERION_MODE.PREFERENCE
                      ? 'bg-primary text-white border-primary'
                      : 'bg-surface text-muted-foreground border-border'
                  }`}
                >
                  Preference (Nice to have)
                </button>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <span className="text-xs text-muted-foreground">
              You can also proceed without selecting a specific specialty.
            </span>
            <Button
              type="button"
              onClick={() => setCurrentStep(1)}
              className="gap-2"
            >
              <span>Continue to Location</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      )}

      {/* ----------------- STEP 1: LOCATION ----------------- */}
      {currentStep === 1 && (
        <section aria-labelledby="step1-heading" className="space-y-6">
          <div>
            <h2 id="step1-heading" className="text-2xl font-serif font-bold text-foreground">
              Where are you looking for care?
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Select an administrative city or locality. Care Finder filters by directory records and does not rely on unverified distance rankings.
            </p>
          </div>

          <FrostedPanel className="rounded-2xl p-6 border border-border/70 space-y-6 max-w-2xl">
            {/* City Selection */}
            <div className="space-y-2">
              <label htmlFor="city-select" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                City / Municipality
              </label>
              <select
                id="city-select"
                value={selectedCity}
                onChange={e => {
                  setSelectedCity(e.target.value);
                  setSelectedLocality('');
                }}
                className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
              >
                <option value="">Any City / All Regions</option>
                {options.cities.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            {/* Locality Selection */}
            {selectedCity && (
              <div className="space-y-2">
                <label htmlFor="locality-select" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Locality / Sector (Optional)
                </label>
                <select
                  id="locality-select"
                  value={selectedLocality}
                  onChange={e => setSelectedLocality(e.target.value)}
                  className="w-full rounded-xl border border-border/80 bg-surface px-4 py-2.5 text-sm font-medium text-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                >
                  <option value="">All localities in {selectedCity}</option>
                  {availableLocalities.map(loc => (
                    <option key={loc} value={loc}>{loc}</option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex items-start gap-2 p-3 rounded-xl bg-surface-elevated/70 border border-border/50 text-xs text-muted-foreground">
              <Info className="w-4 h-4 text-primary shrink-0 mt-0.5" />
              <span>
                Care Finder uses official administrative locations recorded in public hospital profiles. Geospatial distance calculations are withheld until facility coordinates are verified.
              </span>
            </div>
          </FrostedPanel>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentStep(0)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back</span>
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(2)}
              className="gap-2"
            >
              <span>Continue to Requirements</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      )}

      {/* ----------------- STEP 2: REQUIREMENTS ----------------- */}
      {currentStep === 2 && (
        <section aria-labelledby="step2-heading" className="space-y-6">
          <div>
            <h2 id="step2-heading" className="text-2xl font-serif font-bold text-foreground">
              Set facilities and service requirements
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Specify what capabilities you require. Distinguish between mandatory needs (must have) and preferences (nice to have).
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Critical Care & Emergency Capabilities */}
            <FrostedPanel className="rounded-2xl p-5 sm:p-6 border border-border/70 space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Stethoscope className="w-4 h-4 text-primary" />
                <span>Emergency & Critical Care</span>
              </h3>

              <div className="space-y-3">
                {/* Emergency Dept */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">24/7 Emergency Department</span>
                    <span className="text-xs text-muted-foreground">Dedicated emergency room & triage</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRequirements(prev => ({
                        ...prev,
                        emergency: { ...prev.emergency, enabled: !prev.emergency.enabled }
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        requirements.emergency.enabled
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {requirements.emergency.enabled ? 'Requested' : '+ Add'}
                    </button>
                    {requirements.emergency.enabled && (
                      <select
                        value={requirements.emergency.mode}
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          emergency: { ...prev.emergency, mode: e.target.value }
                        }))}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium"
                      >
                        <option value={CRITERION_MODE.MANDATORY}>Mandatory</option>
                        <option value={CRITERION_MODE.PREFERENCE}>Preference</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* Ambulance */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">Ambulance Service</span>
                    <span className="text-xs text-muted-foreground">Patient transport capability</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRequirements(prev => ({
                        ...prev,
                        ambulance: { ...prev.ambulance, enabled: !prev.ambulance.enabled }
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        requirements.ambulance.enabled
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {requirements.ambulance.enabled ? 'Requested' : '+ Add'}
                    </button>
                    {requirements.ambulance.enabled && (
                      <select
                        value={requirements.ambulance.mode}
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          ambulance: { ...prev.ambulance, mode: e.target.value }
                        }))}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium"
                      >
                        <option value={CRITERION_MODE.MANDATORY}>Mandatory</option>
                        <option value={CRITERION_MODE.PREFERENCE}>Preference</option>
                      </select>
                    )}
                  </div>
                </div>

                {/* ICU */}
                <div className="p-3.5 rounded-xl border border-border/70 bg-surface flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="font-semibold text-sm text-foreground block">Intensive Care Unit (ICU)</span>
                    <span className="text-xs text-muted-foreground">Critical care bed infrastructure</span>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => setRequirements(prev => ({
                        ...prev,
                        icu: { ...prev.icu, enabled: !prev.icu.enabled }
                      }))}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                        requirements.icu.enabled
                          ? 'bg-primary text-white border-primary shadow-sm'
                          : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                      }`}
                    >
                      {requirements.icu.enabled ? 'Requested' : '+ Add'}
                    </button>
                    {requirements.icu.enabled && (
                      <select
                        value={requirements.icu.mode}
                        onChange={e => setRequirements(prev => ({
                          ...prev,
                          icu: { ...prev.icu, mode: e.target.value }
                        }))}
                        className="rounded-lg border border-border bg-surface px-2 py-1 text-xs font-medium"
                      >
                        <option value={CRITERION_MODE.MANDATORY}>Mandatory</option>
                        <option value={CRITERION_MODE.PREFERENCE}>Preference</option>
                      </select>
                    )}
                  </div>
                </div>
              </div>
            </FrostedPanel>

            {/* Facilities & Hospital Type */}
            <FrostedPanel className="rounded-2xl p-5 sm:p-6 border border-border/70 space-y-4">
              <h3 className="font-serif text-lg font-bold text-foreground flex items-center gap-2">
                <Building2 className="w-4 h-4 text-primary" />
                <span>Facilities & Classification</span>
              </h3>

              {/* Hospital Type */}
              <div className="space-y-2">
                <label htmlFor="hospital-type-select" className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Hospital Classification
                </label>
                <div className="flex gap-2">
                  <select
                    id="hospital-type-select"
                    value={selectedType}
                    onChange={e => setSelectedType(e.target.value)}
                    className="flex-1 rounded-xl border border-border bg-surface px-3 py-2 text-xs font-medium"
                  >
                    <option value="">Any classification</option>
                    {options.types.map(t => (
                      <option key={t} value={t}>{formatHospitalType(t)}</option>
                    ))}
                  </select>
                  {selectedType && (
                    <select
                      value={typeMode}
                      onChange={e => setTypeMode(e.target.value)}
                      className="rounded-xl border border-border bg-surface px-2 py-2 text-xs font-medium"
                    >
                      <option value={CRITERION_MODE.PREFERENCE}>Preference</option>
                      <option value={CRITERION_MODE.MANDATORY}>Mandatory</option>
                    </select>
                  )}
                </div>
              </div>

              {/* Specific Facilities */}
              <div className="space-y-2 pt-2 border-t border-border/50">
                <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Listed Hospital Facilities
                </label>
                <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                  {options.facilities.map(fac => {
                    const isSelected = Boolean(selectedFacilities[fac]);
                    const currentMode = selectedFacilities[fac] || CRITERION_MODE.PREFERENCE;

                    return (
                      <div
                        key={fac}
                        className="flex items-center justify-between p-2 rounded-lg bg-surface border border-border/60 text-xs"
                      >
                        <span className="font-medium text-foreground">{fac}</span>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => toggleFacility(fac)}
                            className={`px-2 py-1 rounded text-[11px] font-semibold border ${
                              isSelected
                                ? 'bg-primary text-white border-primary'
                                : 'bg-surface-elevated text-muted-foreground border-border hover:text-foreground'
                            }`}
                          >
                            {isSelected ? 'Selected' : '+ Add'}
                          </button>
                          {isSelected && (
                            <select
                              value={currentMode}
                              onChange={e => setFacilityMode(fac, e.target.value)}
                              className="rounded border border-border bg-surface px-1 py-0.5 text-[10px]"
                            >
                              <option value={CRITERION_MODE.PREFERENCE}>Preference</option>
                              <option value={CRITERION_MODE.MANDATORY}>Mandatory</option>
                            </select>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </FrostedPanel>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentStep(1)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Location</span>
            </Button>
            <Button
              type="button"
              onClick={() => setCurrentStep(3)}
              className="gap-2"
            >
              <span>Review Criteria</span>
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </section>
      )}

      {/* ----------------- STEP 3: REVIEW CRITERIA ----------------- */}
      {currentStep === 3 && (
        <section aria-labelledby="step3-heading" className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 id="step3-heading" className="text-2xl font-serif font-bold text-foreground">
                Review your search criteria
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Before evaluating hospitals, verify your mandatory requirements and preferences.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleReset}
              className="gap-1.5 self-start sm:self-auto"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset all</span>
            </Button>
          </div>

          <FrostedPanel className="rounded-2xl p-6 border border-border/70 space-y-4 max-w-3xl">
            {assembledCriteria.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <p className="text-sm text-muted-foreground">
                  No criteria have been selected. Running Care Finder will display all published hospitals in the directory.
                </p>
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setCurrentStep(0)}
                >
                  Add a specialty or location
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                  Selected Criteria ({assembledCriteria.length}):
                </p>
                <div className="divide-y divide-border/60">
                  {assembledCriteria.map(crit => (
                    <div key={crit.id} className="py-3 flex items-center justify-between gap-4">
                      <div>
                        <span className="font-medium text-sm text-foreground block">{crit.label}</span>
                        <span className="text-[11px] text-muted-foreground">Type: {crit.type}</span>
                      </div>
                      <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        crit.mode === CRITERION_MODE.MANDATORY
                          ? 'bg-rose-50 text-rose-800 border-rose-200'
                          : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      }`}>
                        {crit.mode === CRITERION_MODE.MANDATORY ? 'Mandatory (Must have)' : 'Preference (Nice to have)'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </FrostedPanel>

          <div className="flex items-center justify-between pt-4 border-t border-border/60">
            <Button
              type="button"
              variant="ghost"
              onClick={() => setCurrentStep(2)}
              className="gap-2"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Edit Requirements</span>
            </Button>
            <Button
              type="button"
              onClick={runMatching}
              className="gap-2 px-6"
            >
              <Sparkles className="w-4 h-4" />
              <span>Find Matching Hospitals</span>
            </Button>
          </div>
        </section>
      )}

      {/* ----------------- STEP 4: MATCHES ----------------- */}
      {currentStep === 4 && (
        <section aria-labelledby="step4-heading" className="space-y-6">
          {searching ? (
            <div className="py-16 text-center">
              <LoadingState label="Evaluating hospital directory records against your criteria…" />
            </div>
          ) : searchError ? (
            <EmptyState
              icon={AlertTriangle}
              eyebrow="Evaluation Error"
              title="Unable to complete matching"
              description={searchError}
              action={
                <Button type="button" onClick={runMatching}>
                  Retry matching
                </Button>
              }
            />
          ) : results ? (
            <>
              {/* Summary Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-surface-elevated/70 border border-border/70">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{results.confirmedMatches.length} Confirmed {results.confirmedMatches.length === 1 ? 'Match' : 'Matches'}</span>
                  </span>

                  {results.unconfirmedMatches.length > 0 && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                      <span>{results.unconfirmedMatches.length} Unable to Confirm</span>
                    </span>
                  )}

                  <span className="text-xs text-muted-foreground">
                    ({results.totalEvaluated} published hospitals evaluated)
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={() => setCurrentStep(2)}
                    className="gap-1.5 text-xs"
                  >
                    <SlidersHorizontal className="w-3.5 h-3.5" />
                    <span>Adjust Criteria</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleReset}
                    className="gap-1.5 text-xs"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Start Over</span>
                  </Button>
                </div>
              </div>

              {/* Confirmed Matches Section */}
              {results.confirmedMatches.length > 0 ? (
                <div className="space-y-4">
                  <h2 id="step4-heading" className="text-2xl font-serif font-bold text-foreground">
                    Confirmed Matches
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    These published hospitals satisfy all your selected mandatory criteria, ranked by your preferences.
                  </p>

                  <div className="grid gap-5 md:grid-cols-2">
                    {results.confirmedMatches.map(res => (
                      <CareFinderCard key={res.hospital.id || res.hospital.slug} matchResult={res} />
                    ))}
                  </div>
                </div>
              ) : (
                <EmptyState
                  icon={Search}
                  eyebrow="No Confirmed Matches"
                  title="No hospitals matched all mandatory requirements"
                  description="None of the published hospitals in your target location confirmed every mandatory criterion you selected. Try changing one or more mandatory requirements to preferences."
                  action={
                    <Button type="button" onClick={() => setCurrentStep(2)}>
                      Adjust Requirements
                    </Button>
                  }
                />
              )}

              {/* Unconfirmed Matches Section */}
              {results.unconfirmedMatches.length > 0 && (
                <div className="space-y-4 pt-8 border-t border-border/60">
                  <div className="space-y-1">
                    <h3 className="text-xl font-serif font-bold text-foreground flex items-center gap-2">
                      <AlertTriangle className="w-5 h-5 text-amber-600" />
                      <span>Unable to Confirm ({results.unconfirmedMatches.length})</span>
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      These hospitals match your general location, but their public directory records are missing one or more of your mandatory fields. MEDIMESH does not guess or assume unverified services.
                    </p>
                  </div>

                  <div className="grid gap-5 md:grid-cols-2">
                    {results.unconfirmedMatches.map(res => (
                      <CareFinderCard key={res.hospital.id || res.hospital.slug} matchResult={res} />
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : null}
        </section>
      )}

      {/* Persistent Compare Tray if hospitals have been added to compare */}
      {compareList.length > 0 && <CompareTray />}
    </AppPageContainer>
  );
}
