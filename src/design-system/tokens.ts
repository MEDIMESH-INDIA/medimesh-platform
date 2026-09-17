/**
 * MEDIMESH INDIA Design Tokens
 *
 * Canonical design specification derived from DESIGN.md (Stitch MediMesh India Canvas).
 * Design movement: "Warm Rationalism & Data Transparency"
 *
 * These tokens are the single source of truth for the application's visual system.
 * They map directly to CSS custom properties defined in globals.css.
 */

// ---------------------------------------------------------------------------
// Colors — Material-style semantic tokens from DESIGN.md YAML frontmatter
// ---------------------------------------------------------------------------

export const colors = {
  // Core surfaces
  surface: '#faf8ff',
  'surface-dim': '#d2d9f4',
  'surface-bright': '#faf8ff',
  'surface-container-lowest': '#ffffff',
  'surface-container-low': '#f2f3ff',
  'surface-container': '#eaedff',
  'surface-container-high': '#e2e7ff',
  'surface-container-highest': '#dae2fd',

  // On-surface text
  'on-surface': '#131b2e',
  'on-surface-variant': '#3e4947',

  // Inverse
  'inverse-surface': '#283044',
  'inverse-on-surface': '#eef0ff',

  // Outline / borders
  outline: '#6e7977',
  'outline-variant': '#bdc9c6',

  // Primary — deep pine-teal for verified institutional care
  'surface-tint': '#006a63',
  primary: '#005c55',
  'on-primary': '#ffffff',
  'primary-container': '#0f766e',
  'on-primary-container': '#a3faef',
  'inverse-primary': '#80d5cb',

  // Secondary — public schemes and registry data
  secondary: '#0051d5',
  'on-secondary': '#ffffff',
  'secondary-container': '#316bf3',
  'on-secondary-container': '#fefcff',

  // Tertiary — amber-ochre for freshness/review warnings
  tertiary: '#7d4200',
  'on-tertiary': '#ffffff',
  'tertiary-container': '#a15600',
  'on-tertiary-container': '#ffe6d5',

  // Error
  error: '#ba1a1a',
  'on-error': '#ffffff',
  'error-container': '#ffdad6',
  'on-error-container': '#93000a',

  // Fixed tones
  'primary-fixed': '#9cf2e8',
  'primary-fixed-dim': '#80d5cb',
  'on-primary-fixed': '#00201d',
  'on-primary-fixed-variant': '#00504a',

  'secondary-fixed': '#dbe1ff',
  'secondary-fixed-dim': '#b4c5ff',
  'on-secondary-fixed': '#00174b',
  'on-secondary-fixed-variant': '#003ea8',

  'tertiary-fixed': '#ffdcc3',
  'tertiary-fixed-dim': '#ffb77d',
  'on-tertiary-fixed': '#2f1500',
  'on-tertiary-fixed-variant': '#6e3900',

  // Background
  background: '#faf8ff',
  'on-background': '#131b2e',

  // Surface variant
  'surface-variant': '#dae2fd',
} as const;

// Functional accent colors used in DESIGN.md prose (maps to semantic roles)
export const functionalColors = {
  /** Primary healthcare anchor — verified facilities */
  healthcareAnchor: '#0f766e',
  healthcareAnchorHover: '#0d9488',
  healthcareAnchorBg: '#f0fdfa',
  healthcareAnchorBorder: '#ccfbf1',

  /** Public schemes & official registry data */
  civicBlue: '#2563eb',
  civicBlueBg: '#eff6ff',
  civicBlueBorder: '#bfdbfe',

  /** Freshness caution — unverified or stale data */
  auditAmber: '#d97706',
  auditAmberBg: '#fef3c7',
  auditAmberBorder: '#fde68a',

  /** Text hierarchy */
  textPrimary: '#0f172a',
  textSecondary: '#1e293b',
  textTertiary: '#64748b',
  textPlaceholder: '#94a3b8',

  /** Borders */
  borderDefault: '#e2e8f0',
  borderLight: '#f1f5f9',
  borderInput: '#cbd5e1',

  /** Warm canvas */
  canvasBase: '#fbfbfa',
  surfaceLayer1: '#f4f4f1',
} as const;

// ---------------------------------------------------------------------------
// Typography — Plus Jakarta Sans (headings) + Inter (body/data)
// ---------------------------------------------------------------------------

export const typography = {
  fontFamilyHeading: 'Plus Jakarta Sans',
  fontFamilyBody: 'Inter',

  'display-lg': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '40px',
    fontWeight: '700',
    lineHeight: '48px',
    letterSpacing: '-0.02em',
  },
  'display-lg-mobile': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '30px',
    fontWeight: '700',
    lineHeight: '38px',
    letterSpacing: '-0.015em',
  },
  'headline-xl': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '32px',
    fontWeight: '600',
    lineHeight: '40px',
    letterSpacing: '-0.015em',
  },
  'headline-xl-mobile': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '24px',
    fontWeight: '600',
    lineHeight: '32px',
    letterSpacing: '-0.01em',
  },
  'headline-md': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '22px',
    fontWeight: '600',
    lineHeight: '28px',
    letterSpacing: '-0.01em',
  },
  'headline-sm': {
    fontFamily: 'Plus Jakarta Sans',
    fontSize: '18px',
    fontWeight: '600',
    lineHeight: '24px',
  },
  'title-md': {
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '600',
    lineHeight: '22px',
  },
  'body-lg': {
    fontFamily: 'Inter',
    fontSize: '16px',
    fontWeight: '400',
    lineHeight: '26px',
  },
  'body-md': {
    fontFamily: 'Inter',
    fontSize: '14px',
    fontWeight: '400',
    lineHeight: '22px',
  },
  'body-sm': {
    fontFamily: 'Inter',
    fontSize: '13px',
    fontWeight: '400',
    lineHeight: '18px',
  },
  'label-md': {
    fontFamily: 'Inter',
    fontSize: '12px',
    fontWeight: '600',
    lineHeight: '16px',
    letterSpacing: '0.02em',
  },
  'label-sm': {
    fontFamily: 'Inter',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '14px',
    letterSpacing: '0.03em',
  },
  'numeric-data': {
    fontFamily: 'Inter',
    fontSize: '15px',
    fontWeight: '600',
    lineHeight: '20px',
  },
} as const;

// ---------------------------------------------------------------------------
// Spacing — 8px cadence with 4px substep for micro elements
// ---------------------------------------------------------------------------

export const spacing = {
  'space-xs': '0.25rem', // 4px
  'space-sm': '0.5rem',  // 8px
  'space-md': '1rem',    // 16px
  'space-lg': '1.5rem',  // 24px
  'space-xl': '2.5rem',  // 40px

  'gutter': '1.5rem',         // 24px — desktop column gutter
  'gutter-mobile': '0.75rem', // 12px — mobile column gutter
  'margin': '2rem',           // 32px — desktop outer margin
  'margin-mobile': '1rem',    // 16px — mobile outer margin
} as const;

// ---------------------------------------------------------------------------
// Border Radius — restrained, editorial geometry (never > 8px)
// ---------------------------------------------------------------------------

export const radius = {
  /** Badges, chips, indicators */
  sm: '0.125rem',  // 2px
  /** Default */
  DEFAULT: '0.25rem', // 4px
  /** Buttons, inputs, dropdowns */
  md: '0.375rem',  // 6px
  /** Cards, modals, comparison cells */
  lg: '0.5rem',    // 8px
  xl: '0.75rem',   // 12px
  full: '9999px',
} as const;

// ---------------------------------------------------------------------------
// Elevation — layered tonal surfaces, disciplined hairline borders
// ---------------------------------------------------------------------------

export const elevation = {
  /** Level 0 — flat base */
  none: 'none',
  /** Level 1 — structural inset: 1px solid border */
  xs: '0 1px 2px rgba(15, 23, 42, 0.02)',
  /** Level 2 — verified card elevation */
  sm: '0 1px 3px rgba(15, 23, 42, 0.04), 0 1px 2px rgba(15, 23, 42, 0.02)',
  /** Level 3 — focused/selected card */
  focus: '0 0 0 1px #0f766e',
  /** Level 4 — contextual dialogs & overlays */
  lg: '0 12px 32px -4px rgba(15, 23, 42, 0.08), 0 4px 12px -2px rgba(15, 23, 42, 0.04)',
  /** Header shadow */
  header: '0 1px 8px rgba(0, 0, 0, 0.04)',
} as const;

// ---------------------------------------------------------------------------
// Breakpoints — from DESIGN.md layout specification
// ---------------------------------------------------------------------------

export const breakpoints = {
  /** Mobile: single-column stream */
  mobile: '640px',
  /** Tablet: 6-column fluid structure */
  tablet: '1024px',
  /** Desktop max content width */
  maxContent: '1280px',
} as const;
