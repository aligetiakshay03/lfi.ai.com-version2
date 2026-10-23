/**
 * Post-build SEO / AEO / GEO pass.  Runs after `react-scripts build`.
 *
 * This is a client-rendered app, and most AI crawlers (GPTBot, ClaudeBot,
 * PerplexityBot) - and Bing's first pass - do not run JavaScript. They read
 * the HTML the server sends and nothing else. So everything a crawler needs
 * is written into static files here, from the same data the app renders:
 *
 *   build/<route>.html  one per route in src/data/seo.js, with that route's
 *                       title, description, canonical, robots and social
 *                       tags, its own structured data and its own no-JS text.
 *                       public/.htaccess maps /demos -> demos.html etc.
 *   build/404.html      the not-found shell, served with a real 404 status.
 *   build/index.html    + FAQPage structured data and the FAQ as no-JS text.
 *   build/sitemap.xml   indexable routes, stamped with the build date.
 *   build/llms.txt      the llmstxt.org summary for language models.
 *
 * No dependencies: the data modules are ES modules with extensionless
 * imports, which Node will not resolve, so they are copied to a temp folder
 * with the import paths fixed and loaded from there.
 */

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BUILD = path.join(ROOT, "build");
const DATA = path.join(ROOT, "src", "data");

/* --- load the data modules ------------------------------------------------ */
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "lfi-seo-"));
for (const f of fs.readdirSync(DATA).filter((f) => f.endsWith(".js"))) {
  const src = fs
    .readFileSync(path.join(DATA, f), "utf8")
    .replace(/from\s+"\.\/([\w-]+)"/g, 'from "./$1.mjs"');
  fs.writeFileSync(path.join(tmp, f.replace(/\.js$/, ".mjs")), src);
}
const load = (name) => import(pathToFileURL(path.join(tmp, `${name}.mjs`)).href);
const { SITE, ROUTES } = await load("seo");
const { faqs } = await load("faq");
const { demos, products } = await load("demos");
const { portfolios, industries, about } = await load("profile");
const { company, contact, offices } = await load("company");
fs.rmSync(tmp, { recursive: true, force: true });

/* --- helpers -------------------------------------------------------------- */
const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const ld = (obj) => `<script type="application/ld+json">${JSON.stringify(obj)}</script>`;
const abs = (href) => (href.startsWith("/") ? `${SITE}${href}` : href);
const today = new Date().toISOString().slice(0, 10);

function setAttr(html, re, value, label) {
  if (!re.test(html)) throw new Error(`seo-build: ${label} not found in build/index.html`);
  return html.replace(re, (m, pre, _old, post) => `${pre}${esc(value)}${post}`);
}

/** Rewrite the head of the base document for one route. */
function head(html, route) {
  const url = `${SITE}${route.path}`;
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${esc(route.title)}</title>`);
  html = setAttr(html, /(<link rel="canonical" href=")([^"]*)(")/, url, "canonical");
  html = setAttr(html, /(<meta property="og:url" content=")([^"]*)(")/, url, "og:url");
  html = setAttr(html, /(<meta name="robots" content=")([^"]*)(")/,
    route.noindex ? "noindex, follow" : "index, follow, max-image-preview:large", "robots");
  for (const [re, label] of [
    [/(<meta property="og:title" content=")([^"]*)(")/, "og:title"],
    [/(<meta name="twitter:title" content=")([^"]*)(")/, "twitter:title"],
  ]) html = setAttr(html, re, route.title, label);
  if (route.description) {
    for (const [re, label] of [
      [/(<meta name="description" content=")([^"]*)(")/, "description"],
      [/(<meta property="og:description" content=")([^"]*)(")/, "og:description"],
      [/(<meta name="twitter:description" content=")([^"]*)(")/, "twitter:description"],
    ]) html = setAttr(html, re, route.description, label);
  }
  return html;
}

const NOSCRIPT = /<noscript><main>[\s\S]*?<\/main><\/noscript>/;
const noscript = (html, body) => {
  if (!NOSCRIPT.test(html)) throw new Error("seo-build: body <noscript><main> fallback not found");
  return html.replace(NOSCRIPT, `<noscript><main>${body}</main></noscript>`);
};
const addToHead = (html, tags) => html.replace("</head>", `${tags}</head>`);

const breadcrumb = (route) =>
  ld({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: `${SITE}/` },
      { "@type": "ListItem", position: 2, name: route.title.split(" | ")[0], item: `${SITE}${route.path}` },
    ],
  });

const webPage = (route, type = "WebPage") =>
  ld({
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${SITE}${route.path}#webpage`,
    url: `${SITE}${route.path}`,
    name: route.title,
    description: route.description,
    isPartOf: { "@id": `${SITE}/#website` },
    about: { "@id": `${SITE}/#organization` },
    inLanguage: "en",
    dateModified: today,
  });

const demoList = (items) =>
  `<ul>${items
    .map((d) =>
      d.href && d.access === "public"
        ? `<li><a href="${esc(d.href)}">${esc(d.name)}</a> - ${esc(d.blurb)}</li>`
        : `<li>${esc(d.name)} - ${esc(d.blurb)}</li>`
    )
    .join("")}</ul>`;

/* --- build ---------------------------------------------------------------- */
const base = fs.readFileSync(path.join(BUILD, "index.html"), "utf8");
const written = [];
const write = (file, html) => {
  fs.writeFileSync(path.join(BUILD, file), html);
  written.push(file);
};

// Per-route documents.
const extras = {
  demos: (r) => ({
    ld:
      webPage(r, "CollectionPage") +
      breadcrumb(r) +
      ld({
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Linkfields AI demo catalogue",
        numberOfItems: demos.length,
        itemListElement: demos.map((d, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: d.name,
          description: d.blurb,
          ...(d.href && d.access === "public" ? { url: abs(d.href) } : {}),
        })),
      }),
    body:
      `<h1>Linkfields AI demo catalogue</h1><p>${esc(r.description)}</p>` +
      `<h2>Products</h2>${demoList(products)}<h2>All demonstrations</h2>${demoList(demos)}` +
      `<p><a href="/">Linkfields home</a> · <a href="mailto:${contact.primaryEmail}">${contact.primaryEmail}</a></p>`,
  }),
};
const legacyDemo = (r) => {
  const d = demos.find((x) => x.href === r.path);
  return {
    ld: webPage(r) + breadcrumb(r),
    body:
      `<h1>${esc(r.title.split(" | ")[0])}</h1><p>${esc(r.description)}</p>` +
      (d ? `<p>${esc(d.blurb)}</p>` : "") +
      `<p><a href="/demos">All Linkfields AI demonstrations</a> · <a href="/">Linkfields home</a></p>`,
  };
};

for (const [key, route] of Object.entries(ROUTES)) {
  if (route.path === "/") continue;
  let html = head(base, route);
  const extra = extras[key]
    ? extras[key](route)
    : !route.noindex
      ? legacyDemo(route)
      : { ld: "", body: `<h1>${esc(route.title.split(" | ")[0])}</h1><p><a href="/">Linkfields home</a> · <a href="/demos">AI demonstrations</a></p>` };
  if (extra.ld) html = addToHead(html, extra.ld);
  html = noscript(html, extra.body);
  write(route.path === "/404" ? "404.html" : `${route.path.slice(1)}.html`, html);
}

// Homepage: FAQPage structured data, and the FAQ in the no-JS fallback.
{
  const faqLd = ld({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "@id": `${SITE}/#faq`,
    mainEntity: faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  });
  const faqHtml =
    "<h2>Frequently asked questions</h2>" +
    faqs.map((f) => `<h3>${esc(f.q)}</h3><p>${esc(f.a)}</p>`).join("");
  let html = addToHead(base, faqLd + webPage(ROUTES.home));
  html = html.replace(/(<noscript><main>[\s\S]*?)(<h2>Contact<\/h2>)/, `$1${faqHtml}$2`);
  if (!html.includes("Frequently asked questions")) throw new Error("seo-build: FAQ not placed");
  write("index.html", html);
}

// Sitemap: indexable routes only.
{
  const urls = Object.values(ROUTES)
    .filter((r) => !r.noindex)
    .map(
      (r) =>
        `  <url>\n    <loc>${SITE}${r.path}</loc>\n    <lastmod>${today}</lastmod>\n  </url>`
    )
    .join("\n");
  write(
    "sitemap.xml",
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  );
}

// llms.txt (https://llmstxt.org): a plain-text brief for language models.
{
  const md = [
    `# ${company.name}`,
    "",
    `> ${about.intro}`,
    "",
    `Established in ${company.foundedYear} in South Africa. 550+ employees, 80+ clients, 100+ projects completed, B-BBEE Level 1 contributor. Brand for AI work: ${company.aiBrand} (lfiai.com). Corporate site: https://www.linkfields.com/.`,
    "",
    "## Portfolios",
    "",
    ...portfolios.map(
      (p) =>
        `- **${p.name}**: ${p.summary} Delivers: ${p.deliver.map((d) => `${d.title} (${d.body})`).join("; ")}.` +
        (p.ip ? ` Linkfields IP: ${p.ip.map((ip) => `${ip.name} - ${ip.body}`).join(" ")}` : "")
    ),
    "",
    "## Industries",
    "",
    ...industries.map((i) => `- **${i.name}**: ${i.body}`),
    "",
    "## Products and demos",
    "",
    `- [AI demo catalogue](${SITE}/demos): ${demos.length} working demonstrations.`,
    ...products.filter((p) => p.href).map((p) => `- [${p.name}](${abs(p.href)}): ${p.blurb}`),
    "",
    "## FAQ",
    "",
    ...faqs.flatMap((f) => [`### ${f.q}`, "", f.a, ""]),
    "## Contact",
    "",
    `- Sales: ${contact.emails.sales}`,
    `- General: ${contact.emails.general}`,
    `- Careers: ${contact.emails.careers}`,
    `- LinkedIn: ${contact.linkedin}`,
    ...offices.map((o) => `- ${o.country}: ${o.address} (${o.phone})`),
    "",
  ].join("\n");
  write("llms.txt", md);
}

console.log(`seo-build: wrote ${written.join(", ")}`);
