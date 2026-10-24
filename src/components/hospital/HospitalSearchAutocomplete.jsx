import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, X, MapPin, Building2, Sparkles, AlertCircle, Loader2 } from 'lucide-react';
import { getHospitalSuggestions } from '../../lib/data/hospitalRepository';
import { cn } from '../../utils/cn';

export default function HospitalSearchAutocomplete({
  value = '',
  onChange,
  onSelect,
  onSubmit,
  placeholder = 'Search by hospital name, specialty, or locality...',
  mode = 'canonical',
  filters = {},
  className = '',
  autoNavigate = false,
  basePath = '',
  id = 'hospital-search-autocomplete',
  'aria-label': ariaLabel = 'Search hospitals',
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [activeIndex, setActiveIndex] = useState(-1);

  const containerRef = useRef(null);
  const inputRef = useRef(null);
  const requestRef = useRef(0);

  // Keep internal query in sync if parent value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  const fetchSuggestions = useCallback(async (searchQuery) => {
    const trimmed = (searchQuery || '').trim();
    if (!trimmed) {
      setSuggestions([]);
      setLoading(false);
      setError(null);
      setIsOpen(false);
      return;
    }

    const currentReqId = ++requestRef.current;
    setLoading(true);
    setError(null);

    try {
      const results = await getHospitalSuggestions({
        query: trimmed,
        filters,
        limit: 6,
        mode,
      });

      if (currentReqId === requestRef.current) {
        setSuggestions(results || []);
        setIsOpen(true);
        setActiveIndex(-1);
      }
    } catch (err) {
      if (currentReqId === requestRef.current) {
        console.warn('Failed to load hospital suggestions:', err);
        setError('Could not load suggestions');
        setIsOpen(true);
      }
    } finally {
      if (currentReqId === requestRef.current) {
        setLoading(false);
      }
    }
  }, [filters, mode]);

  // Debounced search trigger
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim().length >= 1) {
        fetchSuggestions(query);
      } else {
        setSuggestions([]);
        setIsOpen(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, fetchSuggestions]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e) => {
    const next = e.target.value;
    setQuery(next);
    onChange?.(next);
  };

  const handleClear = () => {
    setQuery('');
    onChange?.('');
    setSuggestions([]);
    setIsOpen(false);
    inputRef.current?.focus();
  };

  const handleSelect = (hospital) => {
    setIsOpen(false);
    setQuery(hospital.name);
    onChange?.(hospital.name);

    if (onSelect) {
      onSelect(hospital);
    } else if (autoNavigate) {
      const target = basePath ? `${basePath}/hospitals/${hospital.slug}` : `/hospitals/${hospital.slug}`;
      navigate(target);
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setIsOpen(false);
    if (activeIndex >= 0 && suggestions[activeIndex]) {
      handleSelect(suggestions[activeIndex]);
      return;
    }
    onSubmit?.(query);
  };

  const handleKeyDown = (e) => {
    if (!isOpen || (!suggestions.length && !error)) {
      if (e.key === 'Enter') {
        handleFormSubmit(e);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < suggestions.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : suggestions.length - 1));
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && suggestions[activeIndex]) {
        e.preventDefault();
        handleSelect(suggestions[activeIndex]);
      } else {
        handleFormSubmit(e);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  return (
    <div ref={containerRef} className={cn('relative w-full', className)}>
      <form onSubmit={handleFormSubmit} className="relative flex items-center w-full">
        <label htmlFor={id} className="sr-only">
          {ariaLabel}
        </label>
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground">
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin text-primary" />
          ) : (
            <Search className="w-4 h-4" />
          )}
        </div>

        <input
          ref={inputRef}
          id={id}
          type="search"
          autoComplete="off"
          aria-autocomplete="list"
          aria-expanded={isOpen}
          aria-controls={`${id}-suggestions`}
          aria-label={ariaLabel}
          placeholder={placeholder}
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (query.trim().length >= 1 && (suggestions.length || error)) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          className="h-12 w-full rounded-xl border border-border bg-white/95 pl-10 pr-20 text-sm text-foreground shadow-xs outline-none transition focus:border-primary focus:bg-white focus:ring-2 focus:ring-primary/20 placeholder:text-muted-foreground/60"
        />

        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-black/5"
              aria-label="Clear query text"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-hover shadow-xs transition"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions Dropdown */}
      {isOpen && (
        <div
          id={`${id}-suggestions`}
          role="listbox"
          className="absolute z-50 left-0 right-0 top-full mt-1.5 max-h-80 overflow-y-auto rounded-2xl border border-border bg-surface p-1.5 shadow-xl backdrop-blur-xl"
        >
          {error ? (
            <div className="flex items-center justify-between p-3 text-xs text-rose-700 bg-rose-50/80 rounded-xl">
              <span className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </span>
              <button
                type="button"
                onClick={() => fetchSuggestions(query)}
                className="font-bold underline hover:text-rose-900"
              >
                Retry
              </button>
            </div>
          ) : suggestions.length > 0 ? (
            <div>
              <div className="flex items-center justify-between px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-muted-foreground border-b border-border/50">
                <span>Hospital Suggestions</span>
                <span className="flex items-center gap-1 text-primary lowercase tracking-normal font-semibold">
                  <Sparkles className="w-3 h-3" /> contextual recommendations
                </span>
              </div>
              <ul className="mt-1 space-y-0.5">
                {suggestions.map((item, idx) => {
                  const isSelected = activeIndex === idx;
                  return (
                    <li
                      key={item.id || item.slug}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setActiveIndex(idx)}
                      className={cn(
                        'flex items-center justify-between gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-xs transition duration-150',
                        isSelected
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground hover:bg-white/80'
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 shrink-0 text-primary/70" />
                          <span className="truncate font-semibold text-foreground text-sm">
                            {item.name}
                          </span>
                        </div>
                        <div className="mt-0.5 flex items-center gap-2 text-[11px] text-muted-foreground">
                          <span className="flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 shrink-0" />
                            {item.location}
                          </span>
                        </div>
                      </div>

                      {item.matchReason && (
                        <span className="shrink-0 rounded-md bg-white border border-border/80 px-2 py-0.5 text-[10px] font-bold text-primary">
                          {item.matchReason}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          ) : (
            <div className="p-4 text-center text-xs text-muted-foreground">
              <p className="font-semibold text-foreground">No hospitals match “{query}”</p>
              <p className="mt-1">Try another hospital name, specialty, or area.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

