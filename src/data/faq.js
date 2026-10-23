/**
 * Frequently asked questions.
 *
 * Written for answer engines as much as for people: each answer is a
 * complete, self-contained statement that can be quoted on its own, without
 * the question beside it or the rest of the page around it. That is what
 * gets an answer lifted into a Google AI Overview, a ChatGPT or Perplexity
 * citation, or a featured snippet.
 *
 * Nothing here is new information. Every answer is assembled from the data
 * modules the rest of the site already renders, so the FAQ cannot drift from
 * the page it sits on. The same list feeds the visible FAQ section, the
 * FAQPage structured data and llms.txt (scripts/seo-build.mjs).
 */

import { company, contact, offices } from "./company";
import { portfolios, industries, engagement, partners } from "./profile";
import { demos, publicDemos } from "./demos";

const list = (items) =>
  items.length < 2 ? items.join("") : `${items.slice(0, -1).join(", ")} and ${items[items.length - 1]}`;

// A source phrase reused mid-sentence: lower-case first letter unless it
// starts an acronym ("AI-powered"), and no full stop.
const sentence = (s) =>
  (/^[A-Z]{2}/.test(s) ? s : s.charAt(0).toLowerCase() + s.slice(1)).replace(/\.$/, "");
// "United States" reads as "the United States" inside a sentence.
const country = (c) => (c.startsWith("United") ? `the ${c}` : c);
// The deck sets some product names in lower case on their logos; in running
// text Linkworks is capitalised, as the profile's own prose does.
const productName = (n) => (n === "linkworks" ? "Linkworks" : n);

const portfolioNames = portfolios.map((p) => p.name);
const dataAi = portfolios.find((p) => p.id === "data-ai");
const cyber = portfolios.find((p) => p.id === "cyber-security");
const allIp = portfolios.flatMap((p) => (p.ip || []).map((ip) => productName(ip.name)));

export const faqs = [
  {
    q: "What does Linkfields do?",
    a: `Linkfields Innovations is a technology partner across five portfolios: ${list(portfolioNames)}. It modernises, runs, analyses, secures and scales the enterprise, combining specialist services with its own software and reusable delivery IP. It is headquartered in South Africa and delivers globally.`,
  },
  {
    q: "Where is Linkfields based?",
    a: `Linkfields is headquartered in Midrand, Johannesburg, South Africa, and has offices in ${list(
      offices.filter((o) => o.code !== "ZA").map((o) => country(o.country))
    )}. Its offshore delivery centre is in Hyderabad, India, and a United Kingdom presence is launching.`,
  },
  {
    q: "How big is Linkfields and how long has it been operating?",
    a: `Linkfields Innovations was established in ${company.foundedYear} in South Africa. It has 550+ employees, 80+ clients and 100+ completed projects, and is a B-BBEE Level 1 contributor.`,
  },
  {
    q: "What AI and data services does Linkfields offer?",
    a: `Linkfields' ${dataAi.name} portfolio covers ${list(
      dataAi.deliver.map((d) => `${d.title} (${sentence(d.body)})`)
    )}. Its own AI products include ${list(dataAi.ip.map((ip) => `${ip.name} (${sentence(ip.body)})`))}.`,
  },
  {
    q: "Does Linkfields provide cyber security services?",
    a: `Yes. Linkfields' ${cyber.name} portfolio covers ${list(
      cyber.deliver.map((d) => sentence(d.title))
    )}, alongside its own security products: ${cyber.ip.map((ip) => `${ip.name}, ${sentence(ip.body)}`).join("; ")}.`,
  },
  {
    q: "Which industries does Linkfields work in?",
    a: `Linkfields works across ${list(industries.map((i) => i.name))}, and also delivers for ${list(
      ["Public Sector", "Education", "Hospitality"].filter((x) => engagement.context.includes(x)).map((x) => x.toLowerCase())
    )} clients.`,
  },
  {
    q: "What software products does Linkfields own?",
    a: `Linkfields builds its own software, including ${list(allIp)}. Linkworks, testoriumz, VajraX and the Linkfields AI SaaS products${engagement.software.rest}`,
  },
  {
    q: "How can I engage Linkfields?",
    a: `Linkfields offers ${engagement.models.length} commercial models: ${list(
      engagement.models.map((m) => `${m.name} (${sentence(m.body)})`)
    )}.`,
  },
  {
    q: "Which technology partners does Linkfields work with?",
    a: `Linkfields has a 20+ partner ecosystem across cloud, ERP, CRM, automation and integration, including ${list(
      partners.map((p) => p.name)
    )}.`,
  },
  {
    q: "Can I try Linkfields' AI products before buying?",
    a: `Yes. The Linkfields AI demo catalogue at lfiai.com/demos lists ${demos.length} working demonstrations, ${publicDemos.length} of them publicly reachable, covering conversational AI, document intelligence, fraud detection, churn prediction, forecasting and customer analytics for banking, telecom and insurance.`,
  },
  {
    q: "How do I contact Linkfields?",
    a: `Email ${contact.emails.sales} for sales enquiries or ${contact.emails.general} for general questions. The Linkfields sales team gets in touch within 24 hours and will sign an NDA if required. Office addresses and phone numbers are published at ${contact.contactPage}.`,
  },
];
