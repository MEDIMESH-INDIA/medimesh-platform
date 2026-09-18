'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import {
  MenuIcon,
  SearchIcon,
  NotificationsIcon,
  PersonIcon,
  LocationIcon,
  ChevronDownIcon,
  CloseIcon,
  HomeIcon,
  ScaleIcon,
  BookmarkIcon,
  HelpIcon,
  ArrowBackIcon,
  ChevronRightIcon,
  HospitalIcon,
  EmergencyIcon,
  MedicalServicesIcon,
  ShieldIcon,
  InfoIcon,
} from '@/components/global/icons';
import { DropdownMenu, DropdownTrigger, DropdownContent, DropdownItem, DropdownLabel, DropdownDivider } from '@/design-system/primitives/dropdown-menu';
import { LocationSelector } from '@/components/location';
import type { UserLocation } from '@/types';

export interface HeaderProps {
  currentLocation?: UserLocation;
  onLocationChange?: (loc: UserLocation) => void;
  onSearchClick?: () => void;
}

export function Header({
  currentLocation = { mode: 'SELECTED', displayName: 'Bengaluru, KA' },
  onLocationChange,
  onSearchClick,
}: HeaderProps) {
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);
  const [isLocationSelectorOpen, setIsLocationSelectorOpen] = useState(false);

  const handleLocationSelect = (loc: UserLocation) => {
    onLocationChange?.(loc);
  };

  return (
    <>
      <header className="sticky top-0 left-0 right-0 w-full z-40 bg-[var(--color-surface,#faf8ff)]/95 backdrop-blur-md border-b border-[var(--color-border-default)] shadow-[var(--shadow-header)]">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-4">
          {/* Mobile Menu Button + Brand Logo */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden p-2 -ml-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <MenuIcon size={22} />
            </button>

            <Link href="/" className="flex items-center gap-2 group">
              <div className="w-8 h-8 rounded-[var(--radius-sm)] bg-[var(--color-primary)] flex items-center justify-center text-[var(--color-on-primary)] font-bold text-base shadow-sm">
                +
              </div>
              <div className="flex items-baseline gap-1.5">
                <span className="font-heading text-lg md:text-xl font-bold tracking-tight text-[var(--color-on-surface)] group-hover:text-[var(--color-primary)] transition-colors">
                  MEDIMESH
                </span>
                <span className="font-label-sm text-[10px] md:text-xs font-bold tracking-widest text-[var(--color-primary)] uppercase">
                  INDIA
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links with Dropdowns */}
          <nav aria-label="Main Navigation" className="hidden lg:flex items-center gap-1">
            {/* Discover Dropdown */}
            <DropdownMenu>
              <DropdownTrigger>
                <div className="px-3 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors flex items-center gap-1 select-none">
                  <span>Discover</span>
                  <ChevronDownIcon size={14} />
                </div>
              </DropdownTrigger>
              <DropdownContent align="left" width="w-64">
                <DropdownLabel>Healthcare Facilities</DropdownLabel>
                <DropdownItem icon={<HospitalIcon size={16} />}>
                  <Link href="/facilities">Hospitals</Link>
                </DropdownItem>
                <DropdownItem icon={<PersonIcon size={16} />}>
                  <Link href="/doctors">Doctors &amp; Specialists</Link>
                </DropdownItem>
                <DropdownItem icon={<MedicalServicesIcon size={16} />}>
                  <Link href="/specialties">Clinical Specialties</Link>
                </DropdownItem>
                <DropdownItem icon={<HospitalIcon size={16} />}>
                  <Link href="/services">Services &amp; Capabilities</Link>
                </DropdownItem>
                <DropdownDivider />
                <DropdownLabel>Emergency &amp; Support</DropdownLabel>
                <DropdownItem icon={<EmergencyIcon size={16} />}>
                  <Link href="/emergency">Emergency &amp; Critical Care</Link>
                </DropdownItem>
                <DropdownItem icon={<HospitalIcon size={16} />}>
                  <Link href="/ambulances">Ambulance &amp; Patient Transport</Link>
                </DropdownItem>
                <DropdownItem icon={<MedicalServicesIcon size={16} />}>
                  <Link href="/pharmacies">Pharmacies</Link>
                </DropdownItem>
                <DropdownItem icon={<HospitalIcon size={16} />}>
                  <Link href="/home-healthcare">Home Healthcare</Link>
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu>

            {/* Compare Dropdown */}
            <DropdownMenu>
              <DropdownTrigger>
                <div className="px-3 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors flex items-center gap-1 select-none">
                  <span>Compare</span>
                  <ChevronDownIcon size={14} />
                </div>
              </DropdownTrigger>
              <DropdownContent align="left" width="w-56">
                <DropdownItem icon={<ScaleIcon size={16} />}>
                  <Link href="/#compare">Compare Hospitals</Link>
                </DropdownItem>
                <DropdownItem icon={<BookmarkIcon size={16} />}>
                  <Link href="/#saved-comparisons">Saved Comparisons</Link>
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu>

            {/* Directories Dropdown */}
            <DropdownMenu>
              <DropdownTrigger>
                <div className="px-3 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors flex items-center gap-1 select-none">
                  <span>Directories</span>
                  <ChevronDownIcon size={14} />
                </div>
              </DropdownTrigger>
              <DropdownContent align="left" width="w-60">
                <DropdownItem icon={<HospitalIcon size={16} />}>
                  <Link href="/facilities">Hospital Directory</Link>
                </DropdownItem>
                <DropdownItem icon={<PersonIcon size={16} />}>
                  <Link href="/doctors">Doctors Directory</Link>
                </DropdownItem>
                <DropdownItem icon={<MedicalServicesIcon size={16} />}>
                  <Link href="/specialties">Specialties Index</Link>
                </DropdownItem>
                <DropdownItem icon={<ShieldIcon size={16} />}>
                  <Link href="/schemes">Schemes (PM-JAY, CGHS)</Link>
                </DropdownItem>
                <DropdownItem icon={<InfoIcon size={16} />}>
                  <Link href="/tariffs">Tariffs &amp; Cost Information</Link>
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu>

            {/* Resources Dropdown */}
            <DropdownMenu>
              <DropdownTrigger>
                <div className="px-3 py-2 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors flex items-center gap-1 select-none">
                  <span>Resources</span>
                  <ChevronDownIcon size={14} />
                </div>
              </DropdownTrigger>
              <DropdownContent align="left" width="w-64">
                <DropdownItem icon={<ShieldIcon size={16} />}>
                  <Link href="/#schemes-access">Government Healthcare Access</Link>
                </DropdownItem>
                <DropdownItem icon={<InfoIcon size={16} />}>
                  <Link href="/#trust">Data Sources &amp; Trust Center</Link>
                </DropdownItem>
                <DropdownItem icon={<HelpIcon size={16} />}>
                  <Link href="/#help">Help &amp; Support</Link>
                </DropdownItem>
                <DropdownItem icon={<InfoIcon size={16} />}>
                  <Link href="/#legal">Legal &amp; Platform Policies</Link>
                </DropdownItem>
              </DropdownContent>
            </DropdownMenu>
          </nav>

          {/* Right Controls: Location Pill, Notifications, User */}
          <div className="flex items-center gap-2">
            {/* Location Pill Button */}
            <button
              type="button"
              onClick={() => setIsLocationSelectorOpen(true)}
              aria-label={`Change location. Currently ${currentLocation.displayName}`}
              className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-[var(--radius-md)] bg-[var(--color-surface-container-low)] hover:bg-[var(--color-surface-container)] border border-[var(--color-border-default)] text-xs font-semibold text-[var(--color-on-surface)] transition-colors cursor-pointer"
            >
              <LocationIcon size={15} className="text-[var(--color-primary)]" />
              <span className="max-w-[130px] truncate">{currentLocation.displayName}</span>
              <ChevronDownIcon size={13} className="text-[var(--color-outline)]" />
            </button>

            {/* Global Search Icon Button (Mobile / Tablet) */}
            <button
              type="button"
              onClick={onSearchClick}
              aria-label="Open search"
              className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <SearchIcon size={20} />
            </button>

            {/* Notifications Button */}
            <Link
              href="/account/notifications"
              aria-label="Notifications"
              className="p-2 text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)] hover:bg-[var(--color-surface-container)] rounded-[var(--radius-md)] transition-colors cursor-pointer"
            >
              <NotificationsIcon size={20} />
            </Link>

            {/* Account Avatar / Button */}
            <Link
              href="/account"
              aria-label="My MEDIMESH account"
              className="w-8 h-8 rounded-full bg-[var(--color-primary)] text-[var(--color-on-primary)] flex items-center justify-center text-xs font-semibold shadow-xs hover:bg-[var(--color-primary-container)] transition-colors"
            >
              <PersonIcon size={16} />
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <MobileDrawer
        isOpen={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        currentLocation={currentLocation}
        onOpenLocation={() => setIsLocationSelectorOpen(true)}
      />

      {/* Location Selector Modal */}
      <LocationSelector
        isOpen={isLocationSelectorOpen}
        onClose={() => setIsLocationSelectorOpen(false)}
        currentLocation={currentLocation}
        onSelectLocation={handleLocationSelect}
      />
    </>
  );
}

export function MobileDrawer({
  isOpen,
  onClose,
  currentLocation,
  onOpenLocation,
}: {
  isOpen: boolean;
  onClose: () => void;
  currentLocation?: UserLocation;
  onOpenLocation?: () => void;
}) {
  if (!isOpen) return null;

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex bg-[var(--color-on-surface,#131b2e)]/50 backdrop-blur-sm lg:hidden animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation Menu"
        className="w-4/5 max-w-xs h-full bg-[var(--color-surface-container-lowest,#ffffff)] flex flex-col shadow-xl animate-in slide-in-from-left duration-200 overflow-y-auto"
      >
        {/* Drawer Header */}
        <div className="p-4 border-b border-[var(--color-border-default)] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-[var(--radius-sm)] bg-[var(--color-primary)] text-white flex items-center justify-center font-bold text-sm">
              +
            </div>
            <span className="font-heading font-bold text-base text-[var(--color-on-surface)]">
              MEDIMESH INDIA
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close menu"
            className="p-1.5 text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container)] rounded-md"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        {/* Location selector in drawer */}
        {currentLocation && (
          <div className="p-4 bg-[var(--color-surface-container-low)] border-b border-[var(--color-border-default)]">
            <span className="font-label-sm text-[11px] text-[var(--color-outline)] uppercase tracking-wider block mb-1">
              Active Reference Location
            </span>
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenLocation?.();
              }}
              className="flex items-center justify-between w-full text-xs font-semibold text-[var(--color-on-surface)]"
            >
              <div className="flex items-center gap-1.5 truncate">
                <LocationIcon size={16} className="text-[var(--color-primary)] shrink-0" />
                <span className="truncate">{currentLocation.displayName}</span>
              </div>
              <span className="text-[var(--color-primary)] text-xs font-medium shrink-0">
                Change
              </span>
            </button>
          </div>
        )}

        {/* Drawer Links */}
        <div className="p-4 flex flex-col gap-6 font-body text-sm">
          {/* Section: Discover */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider">
              Discover Healthcare
            </span>
            <Link href="/facilities" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Hospitals
            </Link>
            <Link href="/doctors" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Doctors &amp; Specialists
            </Link>
            <Link href="/specialties" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Clinical Specialties
            </Link>
            <Link href="/services" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Services &amp; Capabilities
            </Link>
            <Link href="/emergency" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Emergency &amp; Critical Care
            </Link>
            <Link href="/ambulances" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Ambulance Transport
            </Link>
            <Link href="/pharmacies" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Pharmacies
            </Link>
            <Link href="/home-healthcare" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Home Healthcare
            </Link>
            <Link href="/tariffs" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Informational Tariffs
            </Link>
          </div>

          {/* Section: Compare & Save */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider">
              Compare &amp; Saved
            </span>
            <Link href="/account/comparisons" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Compare Hospitals (Max 2)
            </Link>
            <Link href="/account/saved" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Saved Items
            </Link>
            <Link href="/account" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              My Account
            </Link>
          </div>

          {/* Section: Resources */}
          <div className="flex flex-col gap-1.5">
            <span className="font-label-sm text-xs font-bold text-[var(--color-outline)] uppercase tracking-wider">
              Resources &amp; Trust
            </span>
            <Link href="/schemes" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Government Scheme Empanelment
            </Link>
            <Link href="/#trust" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Data Sources &amp; Methodology
            </Link>
            <Link href="/#help" onClick={onClose} className="py-2 px-2 hover:bg-[var(--color-surface-container)] rounded font-medium text-[var(--color-on-surface)]">
              Help &amp; Support
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function MobileBottomNav({
  activeTab = 'home',
  onTabSelect,
}: {
  activeTab?: 'home' | 'discover' | 'compare' | 'saved' | 'account';
  onTabSelect?: (tab: 'home' | 'discover' | 'compare' | 'saved' | 'account') => void;
}) {
  const tabs = [
    { id: 'home' as const, label: 'Home', icon: <HomeIcon size={20} />, href: '/' },
    { id: 'discover' as const, label: 'Discover', icon: <SearchIcon size={20} />, href: '/search' },
    { id: 'compare' as const, label: 'Compare', icon: <ScaleIcon size={20} />, href: '/account/comparisons' },
    { id: 'saved' as const, label: 'Saved', icon: <BookmarkIcon size={20} />, href: '/account/saved' },
    { id: 'account' as const, label: 'Account', icon: <PersonIcon size={20} />, href: '/account' },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-[var(--color-surface-container-lowest,#ffffff)] border-t border-[var(--color-border-default)] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]"
    >
      <div className="grid grid-cols-5 h-16 max-w-md mx-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <Link
              key={tab.id}
              href={tab.href}
              onClick={() => onTabSelect?.(tab.id)}
              aria-current={isActive ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center justify-center gap-1 font-label-sm text-[11px] font-semibold transition-colors select-none',
                isActive
                  ? 'text-[var(--color-primary)]'
                  : 'text-[var(--color-on-surface-variant)] hover:text-[var(--color-on-surface)]'
              )}
            >
              <div
                className={cn(
                  'p-1 rounded-full transition-transform',
                  isActive && 'bg-[var(--color-healthcare-anchor-bg,#f0fdfa)] scale-110'
                )}
              >
                {tab.icon}
              </div>
              <span className="leading-none">{tab.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

export function Breadcrumbs({
  items,
  className,
}: {
  items: BreadcrumbItem[];
  className?: string;
}) {
  return (
    <nav aria-label="Breadcrumbs" className={cn('flex items-center text-xs font-body', className)}>
      <ol className="flex items-center gap-1.5 flex-wrap">
        <li>
          <Link href="/" className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors">
            Home
          </Link>
        </li>
        {items.map((item, i) => {
          const isLast = i === items.length - 1;
          return (
            <React.Fragment key={i}>
              <li aria-hidden="true" className="text-[var(--color-outline-variant)]">
                <ChevronRightIcon size={13} />
              </li>
              <li>
                {isLast || !item.href ? (
                  <span
                    aria-current={isLast ? 'page' : undefined}
                    className="font-semibold text-[var(--color-on-surface)] truncate max-w-[200px] inline-block align-bottom"
                  >
                    {item.label}
                  </span>
                ) : (
                  <Link
                    href={item.href}
                    className="text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors truncate max-w-[150px] inline-block align-bottom"
                  >
                    {item.label}
                  </Link>
                )}
              </li>
            </React.Fragment>
          );
        })}
      </ol>
    </nav>
  );
}

export function MobileBackButton({
  onBack,
  label = 'Back',
  className,
}: {
  onBack?: () => void;
  label?: string;
  className?: string;
}) {
  const handleClick = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== 'undefined') {
      window.history.back();
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Go back"
      className={cn(
        'inline-flex items-center gap-1.5 py-2 px-1 text-sm font-semibold text-[var(--color-on-surface-variant)] hover:text-[var(--color-primary)] transition-colors cursor-pointer select-none',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--color-primary)]',
        className
      )}
    >
      <ArrowBackIcon size={18} />
      <span>{label}</span>
    </button>
  );
}
