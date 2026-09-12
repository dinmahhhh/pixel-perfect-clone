import { createFileRoute, Link } from "@tanstack/react-router";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/marketing/site-header";
import { SiteFooter } from "@/components/marketing/site-footer";
import { PLANS, formatPrice } from "@/lib/plans";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pricing")({
  head: () => ({
    meta: [
      { title: "Pricing — Avenlytics Retail Analytics Plans" },
      {
        name: "description",
        content:
          "Simple plans for small retailers: start free, then Starter $19, Business $49 or Growth $99 per month. Enterprise pricing on request.",
      },
      { property: "og:title", content: "Pricing — Avenlytics Retail Analytics Plans" },
      {
        property: "og:description",
        content:
          "Start free and upgrade as you grow. Dashboards, AI insights and monthly reports for small retail businesses.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Pricing,
});

const faqs = [
  {
    q: "What happens when I hit my plan limit?",
    a: "Nothing is deleted. Uploads and AI questions pause until the next month or until you upgrade, and your dashboards keep working.",
  },
  {
    q: "Do I need cost prices?",
    a: "No. Without cost prices you still get revenue, orders and average order value. Profit stays locked with a clear note rather than a made-up figure.",
  },
  {
    q: "Can I change plans later?",
    a: "Yes — upgrade or downgrade at any time. Limits apply from the moment the change takes effect.",
  },
];

function Pricing() {
  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      <main>
        <section className="bg-surface py-16 md:py-20">
          <div className="mx-auto w-full max-w-3xl px-5 text-center">
            <h1 className="text-4xl font-semibold text-navy md:text-5xl">
              Pricing that fits one shop or ten
            </h1>
            <p className="mt-4 text-lg text-muted-foreground">
              Start free. Upgrade when the answers start paying for themselves.
            </p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-6xl px-5 py-16">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <div
                key={plan.id}
                className={cn(
                  "flex flex-col rounded-xl border bg-card p-7 shadow-card",
                  plan.mostPopular ? "border-primary shadow-lift" : "border-border",
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <h2 className="text-lg font-semibold text-navy">{plan.name}</h2>
                  {plan.mostPopular ? (
                    <span className="rounded-full bg-highlight/15 px-2.5 py-1 text-[11px] font-semibold text-highlight-foreground">
                      Most Popular
                    </span>
                  ) : null}
                </div>

                <div className="mt-5 flex items-baseline gap-1.5">
                  <span className="text-4xl font-semibold text-navy">{formatPrice(plan)}</span>
                  {plan.priceMonthly !== null ? (
                    <span className="text-sm text-muted-foreground">/month</span>
                  ) : null}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{plan.tagline}</p>

                <ul className="mt-6 flex-1 space-y-3 text-sm">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-2.5">
                      <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  className="mt-8"
                  variant={plan.mostPopular ? "default" : "outline"}
                  asChild
                >
                  <Link to="/">
                    {plan.priceMonthly === null
                      ? "Talk to us"
                      : plan.priceMonthly === 0
                        ? "Start free"
                        : `Choose ${plan.name}`}
                  </Link>
                </Button>
              </div>
            ))}
          </div>

          <p className="mt-8 text-center text-sm text-muted-foreground">
            All plans include automated dashboards, column-mapping confirmation and full data
            isolation between businesses.
          </p>
        </section>

        <section className="bg-surface py-16">
          <div className="mx-auto w-full max-w-3xl px-5">
            <h2 className="text-center text-3xl font-semibold text-navy">Common questions</h2>
            <div className="mt-10 space-y-4">
              {faqs.map((faq) => (
                <div key={faq.q} className="rounded-xl border border-border bg-card p-6">
                  <h3 className="font-semibold text-navy">{faq.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{faq.a}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
