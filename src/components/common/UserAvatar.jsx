import { useState, useEffect } from 'react';

const sizeMap = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl',
  '2xl': 'w-24 h-24 sm:w-28 sm:h-28 text-3xl',
};

export default function UserAvatar({
  src,
  alt = 'User avatar',
  name = '',
  size = 'md',
  className = '',
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state if image source changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const sizeClasses = sizeMap[size] || sizeMap.md;
  const initial = (name?.trim()?.charAt(0) || 'U').toUpperCase();

  if (src && !hasError) {
    return (
      <div
        className={`relative inline-block overflow-hidden rounded-2xl bg-surface border border-border/80 shadow-sm shrink-0 ${sizeClasses} ${className}`}
      >
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
          loading="lazy"
        />
      </div>
    );
  }

  return (
    <div
      className={`relative inline-flex items-center justify-center rounded-2xl font-serif font-bold text-primary bg-gradient-to-br from-primary/15 via-primary/10 to-primary/5 border border-primary/20 shadow-sm select-none shrink-0 ${sizeClasses} ${className}`}
      aria-label={alt}
    >
      <span>{initial}</span>
    </div>
  );
}

