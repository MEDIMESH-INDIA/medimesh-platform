import { useState, useMemo, useId } from 'react';
import { ChevronDown, ChevronUp, Search, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function CollapsibleFilter({
  title,
  icon: Icon,
  options = [],
  value = '',
  onChange,
  defaultOpen = false,
  formatOption = (opt) => opt,
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [search, setSearch] = useState('');
  const radioGroup = useId();

  const safeOptions = useMemo(() => (Array.isArray(options) ? options.filter(Boolean) : []), [options]);
  const showSearch = safeOptions.length > 8;

  const filteredOptions = useMemo(() => {
    if (!search) return safeOptions;
    const cleanSearch = String(search).toLowerCase();
    return safeOptions.filter(opt => {
      const formatted = String(formatOption(opt) ?? '');
      return formatted.toLowerCase().includes(cleanSearch);
    });
  }, [safeOptions, search, formatOption]);

  const hasSelectedValue = Boolean(value);

  return (
    <div className="border-b border-border/60 last:border-0 pb-2.5 pt-1">
      <button
        type="button"
        aria-expanded={isOpen}
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between py-2 text-xs font-bold text-foreground tracking-wide group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-lg px-1 transition-colors"
      >
        <span className="flex items-center gap-2 min-w-0">
          {Icon && <Icon className="w-4 h-4 text-primary shrink-0" />}
          <span className="truncate">{title}</span>
        </span>
        <div className="flex items-center gap-1.5 shrink-0 ml-2">
          {hasSelectedValue && (
            <span
              className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold bg-primary/10 text-primary truncate max-w-[120px] normal-case"
              title={formatOption(value)}
            >
              {formatOption(value)}
            </span>
          )}
          {isOpen ? (
            <ChevronUp className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          ) : (
            <ChevronDown className="w-4 h-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          )}
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.18, ease: 'easeOut' }}
            className="overflow-hidden"
          >
            <div className="pt-2 pb-1 space-y-2">
              {showSearch && (
                <div className="relative mb-2">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
                  <input
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    aria-label={`Search ${title.toLowerCase()}`}
                    placeholder={`Filter ${title.toLowerCase()}...`}
                    className="w-full pl-8 pr-8 py-1.5 text-xs bg-surface-elevated/70 border border-border rounded-lg focus:outline-none focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/10 text-foreground placeholder:text-muted-foreground transition-all"
                  />
                  {search && (
                    <button
                      type="button"
                      onClick={() => setSearch('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-border/40"
                      aria-label={`Clear ${title.toLowerCase()} search`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              )}

              <div className="space-y-0.5 max-h-[220px] overflow-y-auto pr-1 custom-scrollbar">
                <label
                  className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                    value === ''
                      ? 'bg-primary/5 text-primary font-semibold'
                      : 'text-foreground/90 hover:bg-surface-elevated/80'
                  }`}
                >
                  <input
                    type="radio"
                    name={radioGroup}
                    className="w-3.5 h-3.5 text-primary accent-primary focus:ring-primary/30 border-border cursor-pointer shrink-0"
                    checked={value === ''}
                    onChange={() => onChange('')}
                  />
                  <span className="truncate">Any {title.toLowerCase()}</span>
                </label>

                {filteredOptions.length === 0 ? (
                  <p className="text-xs text-muted-foreground py-2.5 px-2 text-center">No matching options</p>
                ) : (
                  filteredOptions.map(opt => {
                    const isSelected = value === opt;
                    const label = formatOption(opt);
                    return (
                      <label
                        key={opt}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg cursor-pointer transition-colors text-xs ${
                          isSelected
                            ? 'bg-primary/5 text-primary font-semibold'
                            : 'text-foreground/90 hover:bg-surface-elevated/80'
                        }`}
                      >
                        <input
                          type="radio"
                          name={radioGroup}
                          className="w-3.5 h-3.5 text-primary accent-primary focus:ring-primary/30 border-border cursor-pointer shrink-0"
                          checked={isSelected}
                          onChange={() => onChange(opt)}
                        />
                        <span className="truncate">{label}</span>
                      </label>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
