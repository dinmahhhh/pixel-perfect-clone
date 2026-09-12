import { cn } from "@/lib/utils";

export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary">
        <svg viewBox="0 0 24 24" className="size-5" aria-hidden="true">
          <path
            d="M4 19 12 5l8 14"
            fill="none"
            stroke="currentColor"
            className="text-navy"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </span>
      <span
        className={cn(
          "text-lg font-semibold tracking-tight",
          inverted ? "text-navy-foreground" : "text-navy",
        )}
      >
        Avenlytics
      </span>
    </span>
  );
}
