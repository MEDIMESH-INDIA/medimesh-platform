import { useState, useMemo } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollapsibleFilter({ title, icon: Icon, options, value, onChange, defaultOpen = false, formatOption = (opt) => opt }) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');
  
  const showSearch = options.length > 8;
  
  const filteredOptions = useMemo(() => {
    if (!search) return options;
    return options.filter(opt => formatOption(opt).toLowerCase().includes(search.toLowerCase()));
  }, [options, search, formatOption]);

  return (
    <div className="border-b border-border/50 last:border-0 pb-4">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-sm font-semibold text-foreground uppercase tracking-wider group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-md"
      >
        <span className="flex items-center gap-2">
          {Icon && <Icon className="w-4 h-4 text-primary" />}
          {title}
        </span>
        {isOpen ? <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground" />}
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="pt-3 pb-2 space-y-3">
              {showSearch && (
                <div className="relative mb-3">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder={`Search ${title.toLowerCase()}...`}
                    className="w-full pl-8 pr-8 py-1.5 text-sm bg-surface/50 border border-border rounded-md focus:outline-none focus:border-primary/50 focus:ring-1 focus:ring-primary/50 transition-colors"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-border/50"
                      aria-label={`Clear ${title.toLowerCase()} search`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}
              
              <div className="space-y-1 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                <label className="flex items-center gap-3 py-1.5 cursor-pointer group rounded-md hover:bg-surface/50 px-2 -mx-2 transition-colors">
                  <input 
                    type="radio"
                    className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-surface checked:ring-primary transition-all"
                    checked={value === ''}
                    onChange={() => onChange('')}
                  />
                  <span className="text-[13px] text-foreground group-hover:text-primary transition-colors">Any {title.toLowerCase()}</span>
                </label>
                {filteredOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2 px-2">No matches found.</p>
                ) : (
                  filteredOptions.map(opt => (
                    <label key={opt} className="flex items-center gap-3 py-1.5 cursor-pointer group rounded-md hover:bg-surface/50 px-2 -mx-2 transition-colors">
                      <input 
                        type="radio"
                        className="w-4 h-4 text-primary focus:ring-primary border-border cursor-pointer appearance-none checked:bg-primary rounded-full checked:border-transparent ring-1 ring-offset-1 ring-surface checked:ring-primary transition-all"
                        checked={value === opt}
                        onChange={() => onChange(opt)}
                      />
                      <span className="text-[13px] text-foreground group-hover:text-primary transition-colors">{formatOption(opt)}</span>
                    </label>
                  ))
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
