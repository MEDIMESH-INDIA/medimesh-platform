import React from 'react';
import { cn } from '@/lib/utils';
import { PersonIcon } from '@/components/global/icons';

export interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt?: string;
  name?: string;
  size?: 'sm' | 'md' | 'lg';
}

const sizeStyles = {
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-12 h-12 text-base',
};

export function Avatar({
  src,
  alt = 'Avatar',
  name,
  size = 'md',
  className,
  ...props
}: AvatarProps) {
  const [hasError, setHasError] = React.useState(false);

  const getInitials = (n: string) => {
    const parts = n.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return n.slice(0, 2).toUpperCase();
  };

  return (
    <div
      role="img"
      aria-label={name || alt}
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden shrink-0 select-none font-heading font-semibold',
        'bg-[var(--color-primary)] text-[var(--color-on-primary)] border border-[var(--color-outline-variant)] shadow-sm',
        sizeStyles[size],
        className
      )}
      {...props}
    >
      {src && !hasError ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          onError={() => setHasError(true)}
          className="w-full h-full object-cover"
        />
      ) : name ? (
        <span>{getInitials(name)}</span>
      ) : (
        <PersonIcon size={size === 'sm' ? 16 : size === 'lg' ? 24 : 20} className="text-[var(--color-on-primary)]" />
      )}
    </div>
  );
}
