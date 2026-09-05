import { cn } from '../../utils/cn';

import logoFull from '../../assets/brand/medimesh-logo.png';
import logoMark from '../../assets/brand/medimesh-mark.png';
import logoWordmark from '../../assets/brand/medimesh-wordmark.png';

export default function MedimeshLogo({
  variant = 'full', // 'full', 'mark', 'wordmark'
  size = 'md',      // 'sm', 'md', 'lg', 'xl'
  theme = 'light',  // 'light', 'dark'
  className,
  ...props
}) {
  const src = {
    full: logoFull,
    mark: logoMark,
    wordmark: logoWordmark,
  }[variant];

  // The sizes are conceptually based on height.
  const sizeClasses = {
    sm: 'h-6',
    md: 'h-8',
    lg: 'h-10',
    xl: 'h-14',
  }[size];

  // Apply contrast filter for dark mode if using wordmark or full.
  const isDark = theme === 'dark';
  const applyFilter = isDark && (variant === 'full' || variant === 'wordmark');

  return (
    <img
      src={src}
      alt="MEDIMESH"
      className={cn(
        'object-contain transition-opacity duration-300',
        sizeClasses,
        applyFilter && 'brightness-0 invert opacity-90',
        className
      )}
      {...props}
    />
  );
}
