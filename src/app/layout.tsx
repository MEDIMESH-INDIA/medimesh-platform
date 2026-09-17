import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, Inter } from 'next/font/google';
import './globals.css';

/**
 * Plus Jakarta Sans — headings and display typography.
 * Used for hero headings, section titles, and prominent UI text.
 */
const plusJakartaSans = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta-sans',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

/**
 * Inter — body text, labels, data, and operational copy.
 * Used for body text, form labels, numeric data, badges, and metadata.
 */
const inter = Inter({
  variable: '--font-inter',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'MEDIMESH INDIA — Healthcare Discovery & Information Platform',
    template: '%s | MEDIMESH INDIA',
  },
  description:
    'Discover and compare verified hospitals, clinical specialties, diagnostic services, and government scheme access across India. MEDIMESH provides transparent, sourced healthcare information.',
  applicationName: 'MEDIMESH INDIA',
  keywords: [
    'healthcare',
    'hospitals',
    'India',
    'medical',
    'specialties',
    'doctors',
    'PM-JAY',
    'CGHS',
    'ECHS',
    'healthcare discovery',
  ],
  robots: {
    index: true,
    follow: true,
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${plusJakartaSans.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col antialiased">
        {children}
      </body>
    </html>
  );
}
