import { createFileRoute, Link } from "@tanstack/react-router";
import {
  UploadCloud,
  Sparkles,
  LineChart,
  LayoutDashboard,
  Brain,
  PackageSearch,
  AlertTriangle,
  FileText,
  Plug,
  ArrowRight,
  ShieldCheck,
  Check,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import dashboardPreview from "@/assets/dashboard-preview.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Avenlytics — AI Business Intelligence for Small Retailers" },
      {
        name: "description",
        content:
          "Upload your sales data and get an automated dashboard, AI insights and clear recommendations. No BI tools, SQL or analyst required.",
      },
      {
        property: "og:title",
        content: "Avenlytics — AI Business Intelligence for Small Retailers",
      },
      {
        property: "og:description",
        content:
          "Your sales data deserves better answers. Automated dashboards, AI insights and monthly reports for small retail businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Landing,
});

const steps = [
  {
    icon: UploadCloud,
    title: "Upload",
    body: "Drop in a CSV or Excel export from your till, Shopify or spreadsheet. We confirm every column with you before anything is saved.",
  },
  {
    icon: LineChart,
    title: "Analyze",
    body: "Revenue, profit, order counts and growth are calculated in code — precise, repeatable numbers you can check against your own books.",
  },
  {
    icon: Sparkles,
    title: "Insights",
    body: "Plain-English explanations of what changed and what to do next, grounded only in the data you uploaded.",
  },
];

const features = [
  {
    icon: LayoutDashboard,
    title: "Automated Dashboards",
    body: "KPI cards, revenue trend and category breakdown built the moment your file finishes importing.",
  },
  {
    icon: Brain,
    title: "AI Business Insights",
    body: "\"Revenue rose 12%, but profit only 3% — costs climbed in your top category.\" Written for owners, not analysts.",
  },
  {
    icon: PackageSearch,
    title: "Sales & Product Analysis",
    body: "See your best and worst performers by revenue, units or profit margin — not just by what sells the most.",
  },
  {
    icon: AlertTriangle,
    title: "Anomaly Detection",
    body: "Unusual dips, spikes and margin drops get flagged so you notice them in week one, not at year end.",
  },
  {
    icon: FileText,
    title: "Automated Reports",
    body: "A monthly business report with growth, top and worst products, category performance and recommendations.",
  },
  {
    icon: Plug,
    title: "Easy Integrations",
    body: "Direct connections to Shopify, Square and more, so you can stop exporting files by hand.",
    soon: true,
  },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="relative overflow-hidden bg-surface">
          <div className="mx-auto w-full max-w-6xl px-5 pt-16 pb-12 md:pt-24">
            <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
              <div>
                <Badge
                  variant="secondary"
                  className="mb-5 rounded-full border border-border bg-background px-3 py-1 text-xs font-medium text-muted-foreground"
                >
                  <ShieldCheck className="mr-1.5 size-3.5 text-primary" />
                  Built for small retail, not data teams
                </Badge>

                <h1 className="text-4xl leading-[1.08] font-semibold text-navy md:text-5xl lg:text-[3.4rem]">
                  Your Sales Data Deserves Better Answers.
                </h1>

                <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                  Avenlytics turns a sales export into an automated dashboard, clear AI insights and
                  recommendations you can act on this week. No BI tools, no SQL, no data analyst.
                </p>

                <div className="mt-8 flex flex-wrap items-center gap-3">
                  <Button size="lg" asChild>
                    <Link to="/pricing">
                      Try It Free
                      <ArrowRight className="size-4" />
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" asChild>
                    <a href="#how-it-works">Watch Demo</a>
                  </Button>
                </div>

                <p className="mt-4 text-sm text-muted-foreground">
                  Free plan, no card required. Your data stays private to your business.
                </p>
              </div>

              <div className="relative">
                <div className="overflow-hidden rounded-xl border border-border bg-card shadow-lift">
                  <img
                    src={dashboardPreview}
                    alt="Avenlytics dashboard showing revenue, orders, gross profit and top selling products"
                    width={1600}
                    height={1104}
                    className="w-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* How it works */}
        <section id="how-it-works" className="mx-auto w-full max-w-6xl scroll-mt-20 px-5 py-20">
          <div className="max-w-2xl">
            <p className="text-sm font-semibold tracking-wide text-primary uppercase">
              How it works
            </p>
            <h2 className="mt-3 text-3xl font-semibold text-navy md:text-4xl">
              Three steps from spreadsheet to decision
            </h2>
          </div>

          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={step.title}
                className="rounded-xl border border-border bg-card p-7 shadow-card"
              >
                <div className="flex items-center gap-3">
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <step.icon className="size-5" />
                  </span>
                  <span className="text-sm font-semibold text-muted-foreground">
                    Step {i + 1}
                  </span>
                </div>
                <h3 className="mt-5 text-xl font-semibold text-navy">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Features */}
        <section id="features" className="scroll-mt-20 bg-surface py-20">
          <div className="mx-auto w-full max-w-6xl px-5">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold tracking-wide text-primary uppercase">Features</p>
              <h2 className="mt-3 text-3xl font-semibold text-navy md:text-4xl">
                A virtual business analyst, always on
              </h2>
              <p className="mt-4 text-muted-foreground">
                Every number is calculated from your own rows. When the data isn't there — like
                missing cost prices — Avenlytics says so instead of guessing.
              </p>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-xl border border-border bg-card p-7 shadow-card"
                >
                  <span className="flex size-10 items-center justify-center rounded-lg bg-accent text-accent-foreground">
                    <feature.icon className="size-5" />
                  </span>
                  <div className="mt-5 flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-navy">{feature.title}</h3>
                    {feature.soon ? (
                      <span className="rounded-full bg-highlight/15 px-2 py-0.5 text-[11px] font-semibold text-highlight-foreground">
                        Coming soon
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {feature.body}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Trust strip */}
        <section className="mx-auto w-full max-w-6xl px-5 py-20">
          <div className="rounded-2xl border border-border bg-navy px-8 py-12 text-navy-foreground md:px-14">
            <div className="grid gap-10 md:grid-cols-[1.2fr_1fr] md:items-center">
              <div>
                <h2 className="text-3xl font-semibold">Numbers you can trust with your books</h2>
                <ul className="mt-6 space-y-3 text-sm text-navy-foreground/80">
                  {[
                    "Revenue, profit and growth are calculated in code — never by the AI.",
                    "You confirm how every column maps before a single row is saved.",
                    "Each upload is kept as its own version, so month-over-month keeps working.",
                    "Your business data is isolated at the database level, not just in the app.",
                  ].map((line) => (
                    <li key={line} className="flex gap-3">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span>{line}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-navy-foreground/15 bg-navy-foreground/5 p-6">
                <p className="text-sm font-semibold text-highlight">AI insight</p>
                <p className="mt-3 text-lg leading-relaxed">
                  “Footwear revenue grew 18% last month, but margin fell from 44% to 39% — the
                  discounting on sneakers cost you about $2,100 in profit.”
                </p>
                <p className="mt-4 text-xs text-navy-foreground/60">
                  Generated from your uploaded rows only. No estimates, no invented figures.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-surface py-20">
          <div className="mx-auto w-full max-w-3xl px-5 text-center">
            <h2 className="text-3xl font-semibold text-navy md:text-4xl">
              Find out what last month was really telling you
            </h2>
            <p className="mt-4 text-muted-foreground">
              Upload a sales export and see your first dashboard in a couple of minutes.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <Button size="lg" asChild>
                <Link to="/pricing">
                  Try It Free
                  <ArrowRight className="size-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link to="/pricing">See pricing</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
