import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  MapPin,
  CheckCircle2,
  HelpCircle,
  XCircle,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  GitCompare,
  Check,
  ArrowRight,
  AlertTriangle,
} from 'lucide-react';
import FrostedPanel from '../common/FrostedPanel';
import { formatHospitalType } from '../../lib/utils/formatters';
import { useCompare } from '../../hooks/useCompare';
import { MATCH_DISPOSITION } from '../../lib/careFinder/careFinderMatching';

export default function CareFinderCard({ matchResult }) {
  const [detailsOpen, setDetailsOpen] = useState(false);
  const locationPath = useLocation().pathname;
  const basePath = locationPath.startsWith('/app') ? '/app' : '';

  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();

  const {
    hospital = {},
    disposition,
    evaluations = [],
    matchedPreferencesCount = 0,
    totalPreferencesCount = 0,
    confirmedExplanations = [],
    unknownExplanations = [],
    provenanceSummary = {},
  } = matchResult || {};

  const { slug, name = 'Hospital', location = {}, type } = hospital;
  const compared = isCompared(slug);

  const locParts = [location.locality, location.city].filter(Boolean);
  const locString = locParts.length > 0 ? locParts.join(', ') : 'Location not provided';

  const isConfirmed = disposition === MATCH_DISPOSITION.CONFIRMED;

  return (
    <FrostedPanel
      variant="elevated"
      className={`rounded-2xl p-5 sm:p-6 transition-all duration-200 flex flex-col h-full border ${
        isConfirmed
          ? 'border-border/80 bg-surface/90 hover:border-primary/40'
          : 'border-amber-200/80 bg-amber-50/20'
      }`}
    >
      {/* Header: Name, Disposition Badge, and Location */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            {isConfirmed ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Confirmed Match</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>Unable to Confirm</span>
              </span>
            )}

            {type && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-surface-elevated text-muted-foreground border border-border/60">
                {formatHospitalType(type)}
              </span>
            )}

            {totalPreferencesCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                {matchedPreferencesCount} of {totalPreferencesCount} preferences met
              </span>
            )}
          </div>

          <Link
            to={`${basePath}/hospitals/${slug}`}
            className="group/link inline-block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-sm"
          >
            <h3 className="text-xl font-serif font-bold text-foreground leading-snug group-hover/link:text-primary transition-colors">
              {name}
            </h3>
          </Link>

          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-muted-foreground/80" />
            <span>{locString}</span>
          </div>
        </div>
      </div>

      {/* Primary Match Highlights (Preview) */}
      <div className="my-3 space-y-1.5 text-xs">
        {confirmedExplanations.slice(0, 2).map((exp, idx) => (
          <div key={idx} className="flex items-start gap-2 text-foreground/90 font-medium">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
            <span>{exp}</span>
          </div>
        ))}

        {!isConfirmed && unknownExplanations.slice(0, 2).map((exp, idx) => (
          <div key={idx} className="flex items-start gap-2 text-amber-900 font-medium bg-amber-50/60 p-2 rounded-lg border border-amber-200/60">
            <HelpCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{exp}</span>
          </div>
        ))}
      </div>

      {/* Expandable Explanation Details */}
      {evaluations.length > 0 && (
        <div className="pt-2 border-t border-border/50">
          <button
            type="button"
            onClick={() => setDetailsOpen(prev => !prev)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:text-primary-hover transition-colors py-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded"
            aria-expanded={detailsOpen}
          >
            <span>{detailsOpen ? 'Hide criteria evaluation' : 'Why this hospital matches (inspect evaluations)'}</span>
            {detailsOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>

          {detailsOpen && (
            <div className="mt-3 space-y-2 rounded-xl bg-surface-elevated/40 p-3.5 border border-border/60 text-xs">
              <p className="font-semibold text-foreground/80 mb-2">Detailed Criteria Breakdown:</p>
              
              {evaluations.map(ev => {
                let Icon = HelpCircle;
                let textColor = 'text-amber-800';
                let iconColor = 'text-amber-600';
                let badgeText = 'Unknown';
                let badgeStyle = 'bg-amber-50 text-amber-800 border-amber-200';

                if (ev.status === 'match') {
                  Icon = CheckCircle2;
                  textColor = 'text-foreground';
                  iconColor = 'text-emerald-600';
                  badgeText = 'Match';
                  badgeStyle = 'bg-emerald-50 text-emerald-800 border-emerald-200';
                } else if (ev.status === 'does_not_match') {
                  Icon = XCircle;
                  textColor = 'text-[#A85047]';
                  iconColor = 'text-[#A85047]';
                  badgeText = 'Does Not Match';
                  badgeStyle = 'bg-coral/10 text-[#A85047] border-coral/20';
                }

                return (
                  <div key={ev.id} className="flex items-start justify-between gap-3 py-1.5 border-b border-border/40 last:border-b-0">
                    <div className="flex items-start gap-2 min-w-0">
                      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${iconColor}`} />
                      <div>
                        <span className="font-medium text-foreground block">{ev.label}</span>
                        <span className={`text-[11px] ${textColor}`}>{ev.explanation}</span>
                      </div>
                    </div>
                    <span className={`shrink-0 px-2 py-0.5 rounded text-[10px] font-semibold border ${badgeStyle}`}>
                      {ev.mode === 'mandatory' ? 'Mandatory: ' : 'Preference: '}{badgeText}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* Provenance Footer */}
      <div className="mt-3 pt-3 border-t border-border/60 text-[11px] text-muted-foreground flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 truncate">
          <ShieldCheck className={`w-3.5 h-3.5 shrink-0 ${provenanceSummary.hasReviewedEvidence ? 'text-primary' : 'text-muted-foreground/70'}`} />
          <span className="truncate">{provenanceSummary.description}</span>
        </div>
      </div>

      {/* Actions */}
      <div className="pt-3 border-t border-border/60 flex items-center gap-2 mt-auto">
        <button
          type="button"
          onClick={(e) => {
            e.preventDefault();
            if (compared) removeHospital(slug);
            else if (canAdd) addHospital(hospital);
          }}
          disabled={!compared && !canAdd}
          title={!compared && !canAdd ? 'Comparison limited to 3 hospitals' : ''}
          className={`flex-1 flex items-center justify-center gap-1.5 min-h-9 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 active:scale-95 border ${
            compared
              ? 'bg-primary/10 text-primary border-primary/25 hover:bg-primary/15'
              : 'border-border/70 text-foreground/80 hover:bg-surface-elevated hover:text-foreground hover:border-border'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
          {compared ? <Check className="w-3.5 h-3.5 shrink-0" /> : <GitCompare className="w-3.5 h-3.5 shrink-0" />}
          <span className="truncate">{compared ? 'In comparison' : '+ Add to compare'}</span>
        </button>

        <Link
          to={`${basePath}/hospitals/${slug}`}
          className="flex-1 sm:flex-initial sm:ml-auto inline-flex items-center justify-center gap-1.5 min-h-9 px-3.5 py-1.5 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary-hover transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 shadow-sm active:scale-95 shrink-0"
        >
          <span>View profile</span>
          <ArrowRight className="w-3.5 h-3.5 shrink-0" />
        </Link>
      </div>
    </FrostedPanel>
  );
}
