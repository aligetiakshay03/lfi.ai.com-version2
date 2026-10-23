/**
 * Per-route metadata - the single source for every route's title,
 * description and indexability.
 *
 * Read twice: by the pages at runtime (utils/meta.js `setMeta`), and by
 * scripts/seo-build.mjs after `react-scripts build`, which writes one static
 * HTML file per route carrying the same head. That second copy is what
 * crawlers that do not run JavaScript see - GPTBot, ClaudeBot, PerplexityBot
 * and Bing's first pass among them - so without it every route would be
 * served with the homepage's title and canonical.
 *
 * Adding a route to App.js? Add it here too, or the server will 404 it
 * (public/.htaccess only serves routes that have a generated file).
 */

export const SITE = "https://lfiai.com";

export const ROUTES = {
  home: {
    path: "/",
    title: "Linkfields - Integrating your business for a better future",
    description:
      "Linkfields is a technology partner across five portfolios - Digital Transformation, Intelligent Enterprise Platforms, Data & AI, Talent Advisory & GCC and Cyber Security. Headquartered in South Africa, delivering globally.",
  },
  demos: {
    path: "/demos",
    title: "AI Demo Catalogue | Linkfields AI",
    description:
      "Open and use the working AI and analytics demonstrations built by Linkfields Innovations - conversational AI, document intelligence, fraud detection, churn, forecasting and risk analytics.",
  },
  bankingAnalytics: {
    path: "/BankingAnalytics",
    title: "Banking Churn & Customer Segmentation Analytics | Linkfields AI",
    description:
      "Banking customer churn and segmentation analytics demo from Linkfields Innovations: who is about to leave, which segment they sit in, and what that is worth.",
  },
  telecomAnalytics: {
    path: "/TelecomAnalytics",
    title: "Telecom Churn & Customer Segmentation Analytics | Linkfields AI",
    description:
      "Telecom customer churn and segmentation analytics demo from Linkfields Innovations: churn and segmentation modelling on a telecom subscriber base.",
  },
  bankingTelecomAnalytics: {
    path: "/BankingTelecomAnalytics",
    title: "Banking & Telecom Customer Analytics | Linkfields AI",
    description:
      "Combined banking and telecom customer analytics demo from Linkfields Innovations: one customer view across two industries' data.",
  },

  // Reachable, but not pages a search result should land on: the original
  // explorer, internal-network demos and internal tooling.
  explore: { path: "/explore", title: "Demo Explorer | Linkfields AI", noindex: true },
  golf: { path: "/golf-analyzer", title: "Golf Pose Analyzer | Linkfields AI", noindex: true },
  resume: { path: "/resume-summarizer", title: "Resume Summarisation | Linkfields AI", noindex: true },
  jdcv: { path: "/jd-cv-comparison", title: "JD & CV Comparison | Linkfields AI", noindex: true },
  users: { path: "/users", title: "Users | Linkfields AI", noindex: true },
  report: { path: "/generate-report", title: "Report Generator | Linkfields AI", noindex: true },

  notFound: {
    path: "/404",
    title: "Page not found | Linkfields AI",
    description: "That page does not exist on lfiai.com.",
    noindex: true,
  },
};
