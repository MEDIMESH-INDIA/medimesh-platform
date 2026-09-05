import { cn } from '../../utils/cn';
import SectionEyebrow from './SectionEyebrow';

export default function PageHeader({ eyebrow, title, description, actions, className }) {
  return (
    <header className={cn('mb-8 flex flex-col gap-5 sm:mb-10 md:flex-row md:items-end md:justify-between', className)}>
      <div className="max-w-3xl">
        {eyebrow && <SectionEyebrow>{eyebrow}</SectionEyebrow>}
        <h1 className="mt-2 font-serif text-3xl font-semibold leading-tight tracking-[-0.035em] text-foreground sm:text-4xl">
          {title}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground sm:text-base">{description}</p>}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </header>
  );
}
