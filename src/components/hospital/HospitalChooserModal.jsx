import { useState } from 'react';
import { X, Search } from 'lucide-react';
import { demoHospitals } from '../../data/sihDemoHospitals';
import { useCompare } from '../../hooks/useCompare';
import { motion, AnimatePresence } from 'framer-motion';
import FrostedPanel from '../common/FrostedPanel';

export default function HospitalChooserModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const { isCompared, addHospital, removeHospital, canAdd } = useCompare();

  if (!isOpen) return null;

  const filtered = demoHospitals.filter(h => {
    const normalizedQuery = query.trim().toLowerCase();
    return !normalizedQuery || 
      (h.name?.toLowerCase().includes(normalizedQuery)) || 
      (h.location?.toLowerCase().includes(normalizedQuery)) || 
      (h.type?.toLowerCase().includes(normalizedQuery)) || 
      ((h.specialties ?? []).some(s => s?.toLowerCase().includes(normalizedQuery)));
  });

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} 
        />
        
        <FrostedPanel
          as={motion.div}
          variant="floating"
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="w-full max-w-2xl rounded-[26px] relative z-10 flex flex-col max-h-[85vh] overflow-hidden"
        >
          <div className="p-6 border-b border-border flex items-center justify-between bg-surface/50">
            <div>
              <h2 className="text-xl font-bold font-serif text-foreground">Add hospital to comparison</h2>
              <p className="text-sm text-muted-foreground mt-1">Select up to 3 hospitals to compare.</p>
            </div>
            <button onClick={onClose} className="p-2 bg-white rounded-full border border-border hover:bg-surface text-muted-foreground transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          <div className="p-4 border-b border-border bg-white">
            <div className="relative">
              <Search className="w-5 h-5 text-muted-foreground absolute left-4 top-1/2 -translate-y-1/2" />
              <input 
                type="text" 
                autoFocus
                placeholder="Search hospitals, locations..." 
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-surface focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm outline-none"
                value={query}
                onChange={e => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-2">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground text-sm">No hospitals found matching &ldquo;{query}&rdquo;</div>
            ) : (
              <ul className="space-y-1">
                {filtered.map(h => {
                  const selected = isCompared(h.slug);
                  return (
                    <li key={h.id}>
                      <button 
                        onClick={() => {
                          if (selected) removeHospital(h.slug);
                          else if (canAdd) addHospital(h.slug);
                        }}
                        className={`w-full text-left flex items-center justify-between p-4 rounded-xl border transition-all ${
                          selected ? 'bg-primary/5 border-primary/30 ring-1 ring-primary/10' : 'border-transparent hover:bg-surface hover:border-border'
                        }`}
                      >
                        <div>
                          <h4 className="font-semibold text-foreground">{h.name}</h4>
                          <p className="text-xs text-muted-foreground mt-0.5">{h.location} • {h.type}</p>
                        </div>
                        <div className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
                          selected 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-white border border-border text-foreground hover:bg-surface'
                        }`}>
                          {selected ? 'Added' : 'Add'}
                        </div>
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </FrostedPanel>
      </div>
    </AnimatePresence>
  );
}
