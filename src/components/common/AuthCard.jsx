import FrostedPanel from './FrostedPanel';
import { cn } from '../../utils/cn';

export default function AuthCard({ children, className }) {
  return (
    <FrostedPanel variant="floating" className={cn('rounded-[26px] p-6 sm:p-8', className)}>
      {children}
    </FrostedPanel>
  );
}
