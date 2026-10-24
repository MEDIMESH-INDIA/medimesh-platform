import { cn } from '../../utils/cn';

import logoHorizontal from '../../assets/brand/medimesh-horizontal.png';
import logoStacked from '../../assets/brand/medimesh-stacked.png';

export default function MedimeshLogo({
  variant = 'horizontal', // 'horizontal' | 'full' | 'stacked' | 'mark'
  size = 'md',           // 'sm', 'md', 'lg', 'xl'
  theme = 'light',       // 'light', 'dark'
  className,
  ...props
}) {
  const isStacked = variant === 'stacked' || variant === 'mark';
  const src = isStacked ? logoStacked : logoHorizontal;

  // Sizes based on height while keeping proportional width
  const sizeClasses = {
    sm: isStacked ? 'h-7 w-auto' : 'h-6 w-auto',
    md: isStacked ? 'h-9 w-auto' : 'h-8 w-auto',
    lg: isStacked ? 'h-12 w-auto' : 'h-10 w-auto',
    xl: isStacked ? 'h-16 w-auto' : 'h-14 w-auto',
  }[size] || (isStacked ? 'h-9 w-auto' : 'h-8 w-auto');

  return (
    <img
      src={src}
      alt="MEDIMESH"
      className={cn(
        'object-contain transition-opacity duration-200 select-none',
        sizeClasses,
        theme === 'dark' && 'brightness-110 contrast-105',
        className
      )}
      loading="eager"
      {...props}
    />
  );
}
