/* eslint-disable react/prop-types */
import { Database, ShieldCheck, Clock, ExternalLink } from 'lucide-react';

export default function TrustMetadata({ trustMetadata }) {
  if (!trustMetadata) return null;

  return (
    <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground bg-surface/50 p-3 rounded-lg border border-border/50">
      {trustMetadata.source && (
        <div className="flex items-center gap-1.5" title="Data Source">
          <Database className="w-3.5 h-3.5 text-primary/70" />
          <span>{trustMetadata.source}</span>
        </div>
      )}
      
      {trustMetadata.reviewState && (
        <div className="flex items-center gap-1.5" title="Review State">
          <ShieldCheck className="w-3.5 h-3.5 text-green-600/70" />
          <span>{trustMetadata.reviewState}</span>
        </div>
      )}

      {trustMetadata.lastChecked && (
        <div className="flex items-center gap-1.5" title="Last Checked">
          <Clock className="w-3.5 h-3.5 text-primary/70" />
          <span>{trustMetadata.lastChecked}</span>
        </div>
      )}

      {trustMetadata.dataScope && (
        <div className="flex items-center gap-1.5 font-medium text-amber-600 bg-amber-50 px-2 py-0.5 rounded" title="Data Scope">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>{trustMetadata.dataScope}</span>
        </div>
      )}
    </div>
  );
}

