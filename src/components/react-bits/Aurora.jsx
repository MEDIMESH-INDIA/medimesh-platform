import { cn } from "../../utils/cn";

export default function Aurora({ className }) {
  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      <div className="absolute -top-[50%] -left-[50%] w-[200%] h-[200%] opacity-30 mix-blend-soft-light">
        <div 
          className="absolute inset-0 bg-gradient-to-tr from-primary/30 via-transparent to-secondary-accent/20 blur-3xl animate-[spin_20s_linear_infinite]"
          style={{
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%',
          }}
        />
        <div 
          className="absolute inset-0 bg-gradient-to-bl from-transparent via-primary/20 to-transparent blur-3xl animate-[spin_15s_linear_infinite_reverse]"
          style={{
            borderRadius: '60% 40% 30% 70% / 60% 30% 70% 40%',
            animationDelay: '-5s'
          }}
        />
      </div>
    </div>
  );
}
