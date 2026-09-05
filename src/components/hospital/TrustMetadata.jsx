import { Database, ShieldCheck, Clock, CheckCircle2, Activity, AlertCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import FrostedPanel from '../common/FrostedPanel';
import SourceBadge from '../common/SourceBadge';

export default function TrustMetadata({ trustMetadata, compact = false }) {
  if (!trustMetadata) return null;

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <SourceBadge>{trustMetadata.sourceLabel || trustMetadata.source || 'Source not provided'}</SourceBadge>
        {trustMetadata.reviewState && (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-1 h-1 rounded-full bg-border"></span>
            <span>{trustMetadata.reviewState}</span>
          </div>
        )}
      </div>
    );
  }

  // Full detailed provenance visual
  const steps = [
    {
      icon: Database,
      label: 'Source',
      value: trustMetadata.sourceLabel || trustMetadata.source || 'Unknown',
      color: 'text-blue-500'
    },
    {
      icon: ShieldCheck,
      label: 'Review Status',
      value: trustMetadata.reviewState || 'Unverified',
      color: 'text-amber-500'
    },
    {
      icon: Clock,
      label: 'Last Checked',
      value: trustMetadata.lastChecked || 'Not provided',
      color: 'text-primary'
    },
    {
      icon: CheckCircle2,
      label: 'MEDIMESH Status',
      value: trustMetadata.dataStatus || 'Display only',
      color: 'text-emerald-500'
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
            
            {/* Connecting line (desktop) */}
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
            
            {/* Connecting line (mobile) */}
            {idx < steps.length - 1 && (
              <div className="md:hidden absolute left-5 top-10 h-full w-[2px] bg-border/50 -z-0"></div>
            )}

            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground mb-0.5">{step.label}</span>
            <span className="text-sm font-medium text-foreground">{step.value}</span>
          </div>
        ))}
      </div>

      {trustMetadata.dataScope && (
        <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-100 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800 font-medium">{trustMetadata.dataScope}</p>
        </div>
      )}
    </FrostedPanel>
  );
}
