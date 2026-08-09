import { cn } from "../../utils/cn";

export default function ShinyText({ text, className }) {
  return (
    <span
      className={cn(
        "inline-block relative overflow-hidden bg-clip-text text-transparent bg-[linear-gradient(110deg,#1A1A1A,45%,#0A7A6A,55%,#1A1A1A)] bg-[length:200%_100%] animate-[shine_2.5s_linear_infinite]",
        className
      )}
    >
      {text}
    </span>
  );
}
