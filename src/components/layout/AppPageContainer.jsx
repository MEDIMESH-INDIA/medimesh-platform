import PageTransition from './PageTransition';
import { cn } from '../../utils/cn';

export default function AppPageContainer({ children, className }) {
  return (
    <PageTransition className={cn("medimesh-page relative z-10 mx-auto w-full max-w-[1400px] px-4 sm:px-6 lg:px-8 py-7 sm:py-8 lg:py-9", className)}>
      {children}
    </PageTransition>
  );
}
