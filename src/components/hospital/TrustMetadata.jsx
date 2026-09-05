import { Database, ShieldCheck, Clock, Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import FrostedPanel from '../common/FrostedPanel';
import { formatReviewStatus } from '../../lib/utils/formatters';

export default function TrustMetadata({ provenance, compact = false }) {
  if (compact) {
    if (!provenance) {
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground/80">
          <ShieldCheck className="w-3.5 h-3.5 opacity-50" />
          <span>Source Unknown</span>
        </div>
      );
    }

    let badgeText = 'Public source';
    if (provenance.reviewStatus === 'demonstration') badgeText = 'Demo Data';
    else if (provenance.reviewStatus === 'manually_reviewed') badgeText = 'Verified';
    else if (provenance.reviewStatus === 'source_matched') badgeText = 'Public source';
    
    return (
      <div className="flex flex-wrap items-center gap-1.5 text-xs text-muted-foreground group relative">
        <div className="flex items-center gap-1.5 px-2 py-0.5 bg-surface/50 border border-border/50 rounded-md cursor-help" title={provenance.sourceName || 'Unknown Source'}>
          <ShieldCheck className={`w-3 h-3 ${provenance.reviewStatus === 'manually_reviewed' ? 'text-green-500' : 'text-primary/70'}`} />
          <span className="font-medium text-[11px] uppercase tracking-wider">{badgeText}</span>
        </div>
        
        {provenance.checkedAt && (
          <span className="text-[11.5px]">
            · Checked {new Date(provenance.checkedAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric'})}
          </span>
        )}
      </div>
    );
  }

  // Full detail (for Hospital Detail page)
  const steps = [
    {
      icon: Database,
      label: 'Source',
      value: provenance?.sourceName || 'Unknown',
      color: 'text-blue-500'
    },
    {
      icon: ShieldCheck,
      label: 'Review Status',
      value: formatReviewStatus(provenance?.reviewStatus) || 'Unverified',
      color: 'text-amber-500'
    },
    {
      icon: Clock,
      label: 'Last Checked',
      value: provenance?.checkedAt ? new Date(provenance.checkedAt).toLocaleDateString() : 'Not provided',
      color: 'text-primary'
    }
  ];

  return (
    <FrostedPanel className="rounded-[20px] p-5 space-y-4">
      <div className="flex items-center gap-2 mb-2">
        <Activity className="w-5 h-5 text-primary" />
        <h3 className="font-semibold text-foreground font-serif">Data Provenance</h3>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {steps.map((step, idx) => (
          <div key={step.label} className="flex-1 flex flex-col items-center text-center relative group">
            <div className={`w-10 h-10 rounded-full bg-surface border border-border flex items-center justify-center mb-2 z-10 relative bg-white`}>
              <step.icon className={`w-4 h-4 ${step.color}`} />
            </div>
            
            {idx < steps.length - 1 && (
              <div className="hidden md:block absolute top-5 left-1/2 w-full h-[2px] bg-border/50 -z-0">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: '100%' }}
                  transition={{ duration: 1, delay: idx * 0.2 }}
                  className="h-full bg-primary/20"
                />
              </div>
            )}
            
            {idx < steps.length - 1 && (
              <div className="md:hidden absolute left-5 top-10 h-full w-[2px] bg-border/50 -z-0"></div>
            )}

            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">{step.label}</span>
            <span className="text-sm font-medium text-foreground capitalize">{step.value}</span>
          </div>
        ))}
      </div>
    </FrostedPanel>
  );
}
