/**
 * MEDIMESH INDIA — Configuration Constants
 *
 * Application-wide configuration values derived from environment
 * variables with safe defaults.
 */

export const config = {
  /** Public-facing application URL */
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',

  /** Application display name */
  appName: process.env.NEXT_PUBLIC_APP_NAME ?? 'MEDIMESH INDIA',

  /** Whether the app is running in demo mode (no real data) */
  isDemoMode: process.env.NEXT_PUBLIC_DEMO_MODE === 'true',

  /** Maximum hospitals in a comparison */
  maxComparisonItems: 2,

  /** Desktop max content width in px */
  maxContentWidth: 1280,

  /** Breakpoints in px */
  breakpoints: {
    mobile: 640,
    tablet: 1024,
  },
} as const;
