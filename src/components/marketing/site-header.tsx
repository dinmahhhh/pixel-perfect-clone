import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Logo } from "./logo";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5">
        <Link to="/" aria-label="Avenlytics home">
          <Logo />
        </Link>

        <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
          <a href="/#how-it-works" className="transition-colors hover:text-navy">
            How it works
          </a>
          <a href="/#features" className="transition-colors hover:text-navy">
            Features
          </a>
          <Link to="/pricing" className="transition-colors hover:text-navy">
            Pricing
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="hidden sm:inline-flex" asChild>
            <Link to="/pricing">Log in</Link>
          </Button>
          <Button size="sm" asChild>
            <Link to="/pricing">Try It Free</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
