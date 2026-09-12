/**
 * Plan configuration.
 * Kept in one place so it can move to a `plan_limits` table (Lovable Cloud)
 * without touching any UI code — the shape below mirrors that future table.
 */
export type PlanId = "free" | "starter" | "business" | "growth" | "enterprise";

export type Plan = {
  id: PlanId;
  name: string;
  priceMonthly: number | null; // null = custom pricing
  tagline: string;
  mostPopular?: boolean;
  limits: {
    businesses: number | null;
    datasetsPerMonth: number | null;
    rowsPerUpload: number | null;
    aiQuestionsPerMonth: number | null;
    historyMonths: number | null;
    teamMembers: number | null;
  };
  features: string[];
};

export const PLANS: Plan[] = [
  {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    tagline: "See what your data says, at no cost.",
    limits: {
      businesses: 1,
      datasetsPerMonth: 1,
      rowsPerUpload: 1000,
      aiQuestionsPerMonth: 10,
      historyMonths: 3,
      teamMembers: 1,
    },
    features: [
      "1 business",
      "1 upload per month (up to 1,000 rows)",
      "Automated dashboard & KPIs",
      "10 AI questions per month",
      "3 months of history",
    ],
  },
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 19,
    tagline: "For a single shop finding its rhythm.",
    limits: {
      businesses: 1,
      datasetsPerMonth: 10,
      rowsPerUpload: 25000,
      aiQuestionsPerMonth: 100,
      historyMonths: 12,
      teamMembers: 2,
    },
    features: [
      "Everything in Free",
      "10 uploads per month (up to 25,000 rows)",
      "100 AI questions per month",
      "Monthly business reports",
      "12 months of history",
    ],
  },
  {
    id: "business",
    name: "Business",
    priceMonthly: 49,
    tagline: "For growing retailers who watch the numbers.",
    mostPopular: true,
    limits: {
      businesses: 3,
      datasetsPerMonth: 50,
      rowsPerUpload: 150000,
      aiQuestionsPerMonth: 500,
      historyMonths: 24,
      teamMembers: 5,
    },
    features: [
      "Everything in Starter",
      "Up to 3 businesses",
      "50 uploads per month (up to 150,000 rows)",
      "500 AI questions per month",
      "Anomaly detection alerts",
      "5 team members",
    ],
  },
  {
    id: "growth",
    name: "Growth",
    priceMonthly: 99,
    tagline: "For multi-location and multi-channel sellers.",
    limits: {
      businesses: 10,
      datasetsPerMonth: null,
      rowsPerUpload: 1000000,
      aiQuestionsPerMonth: 2000,
      historyMonths: 36,
      teamMembers: 15,
    },
    features: [
      "Everything in Business",
      "Up to 10 businesses",
      "Unlimited uploads (up to 1M rows)",
      "2,000 AI questions per month",
      "Location & channel comparisons",
      "15 team members",
    ],
  },
  {
    id: "enterprise",
    name: "Enterprise",
    priceMonthly: null,
    tagline: "For retail groups with custom needs.",
    limits: {
      businesses: null,
      datasetsPerMonth: null,
      rowsPerUpload: null,
      aiQuestionsPerMonth: null,
      historyMonths: null,
      teamMembers: null,
    },
    features: [
      "Everything in Growth",
      "Unlimited businesses & team members",
      "Custom data retention",
      "Onboarding & priority support",
      "Security review & custom terms",
    ],
  },
];

export const formatPrice = (plan: Plan) =>
  plan.priceMonthly === null ? "Custom" : `$${plan.priceMonthly}`;
