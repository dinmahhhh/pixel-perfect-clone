import { Link } from "@tanstack/react-router";
import { Logo } from "./logo";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-navy py-12 text-navy-foreground">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 md:flex-row md:items-start md:justify-between">
        <div className="max-w-sm">
          <Logo inverted />
          <p className="mt-3 text-sm text-navy-foreground/70">
            AI-powered business intelligence for small and growing retailers. Upload your sales
            data, get answers you can act on.
          </p>
        </div>

        <div className="flex gap-14 text-sm">
          <div className="space-y-3">
            <p className="font-semibold">Product</p>
            <a href="/#features" className="block text-navy-foreground/70 hover:text-primary">
              Features
            </a>
            <Link to="/pricing" className="block text-navy-foreground/70 hover:text-primary">
              Pricing
            </Link>
            <a href="/#how-it-works" className="block text-navy-foreground/70 hover:text-primary">
              How it works
            </a>
          </div>
          <div className="space-y-3">
            <p className="font-semibold">Company</p>
            <span className="block text-navy-foreground/70">About</span>
            <span className="block text-navy-foreground/70">Privacy</span>
            <span className="block text-navy-foreground/70">Terms</span>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-10 w-full max-w-6xl px-5 text-xs text-navy-foreground/50">
        © {new Date().getFullYear()} Avenlytics. All rights reserved.
      </div>
    </footer>
  );
}
