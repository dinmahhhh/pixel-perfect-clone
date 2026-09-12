import { cn } from "@/lib/utils";
import logoAsset from "@/assets/avenlytics-logo.png.asset.json";

/**
 * Brand lockup. On navy surfaces (`inverted`) the wordmark sits on a light
 * plate so the navy letterforms stay legible.
 */
export function Logo({ className, inverted = false }: { className?: string; inverted?: boolean }) {
  return (
    <span
      className={cn(
        "inline-flex items-center",
        inverted && "rounded-lg bg-background px-3 py-2",
        className,
      )}
    >
      <img
        src={logoAsset.url}
        alt="Avenlytics"
        width={1920}
        height={640}
        className="h-9 w-auto"
      />
    </span>
  );
}
