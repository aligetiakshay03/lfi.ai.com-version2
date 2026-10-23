# Linkfields AI — lfiai.com

The AI and analytics site of **Linkfields Innovations**. A Create React App
single-page app with three parts:

- **`/`** — the Linkfields Corporate Profile 2026 as a scrolling site: who
  Linkfields is, its five portfolios, products, industries, clients, partners,
  commercial models, FAQ and contact.
- **`/demos`** — a filterable catalogue of every working AI and analytics
  demonstration.
- **The original routes** — the earlier analytics pages, explorer and internal
  tools, all kept at their original URLs so published links keep working.

| | |
| --- | --- |
| Live site | <https://lfiai.com> |
| Parent company site | <https://www.linkfields.com> |
| Stack | React 19, React Router 7, Create React App 5, GSAP 3 (+ SplitText, ScrollTrigger), Lenis smooth scroll |
| Hosting | Apache, deployed over FTP by Azure Pipelines on push to `main` |
| Tests | Browser verification harness (`npm run verify`); no unit tests |

---

## Contents

1. [Running it locally](#running-it-locally)
2. [Project structure](#project-structure)
3. [Routes](#routes)
4. [The homepage](#the-homepage)
5. [Content and data](#content-and-data)
6. [Design system](#design-system)
7. [Motion and animation](#motion-and-animation)
8. [SEO, AEO and GEO](#seo-aeo-and-geo)
9. [Configuration and the contact form](#configuration-and-the-contact-form)
10. [Verifying the UI](#verifying-the-ui)
11. [Build and deployment](#build-and-deployment)
12. [Common tasks](#common-tasks)
13. [Known limitations](#known-limitations)

---

## Running it locally

Requires Node 20+.

```bash
npm ci          # install from the lockfile (npm install also works)
npm start       # dev server on http://localhost:3000
npm run build   # production build into ./build (includes the SEO pass)
```

`npm start` picks another port if 3000 is taken; to force one:

```bash
PORT=3001 npm start            # macOS / Linux / Git Bash
$env:PORT=3001; npm start      # PowerShell
```

To check a production build, serve `build/` with any static server. The
per-route HTML files the build generates (`demos.html` etc.) need "clean URL"
support, which `serve` has by default:

```bash
npx serve build
```

| Script | What it does |
| --- | --- |
| `npm start` | Dev server with hot reload |
| `npm run build` | `react-scripts build`, then `scripts/seo-build.mjs` (see [SEO](#seo-aeo-and-geo)) |
| `npm run verify` | Browser checks against a running site (see [Verifying the UI](#verifying-the-ui)) |
| `npm test` | Wired to react-scripts; there are currently no tests |

---

## Project structure

```
public/
  .htaccess               Apache rules: canonical host, routes, real 404s, caching
  index.html              head metadata, structured data, no-JS text fallback
  robots.txt              crawler rules (AI crawlers explicitly allowed)
  og-image.jpg            1200x630 social share image
  manifest.json, favicon.ico, logo192.png, logo512.png, apple-touch-icon.png
  assets/brand/           official logo files (see "Brand")
  assets/img/             corporate-profile imagery: clients, partners,
                          culture, industries, ip, portfolio, recognition
  images/                 product wordmarks used on the product cards

scripts/
  seo-build.mjs           post-build SEO/AEO/GEO pass (runs in npm run build)
  verify-ui.js            Playwright browser verification harness
  generate-globe-mask.mjs builds src/data/landMask.js (globe + map coastline)

src/
  index.js, App.js        entry point and routes
  Pages/
    Home.js               the homepage (section order documented in the file)
    Demos.js              the /demos catalogue
    NotFound.js           404 page
    Industries.js         the original catalogue explorer, kept at /explore
    *_Analytics.js        the original analytics pages
  components/
    layout/               Header (+ mobile drawer), Footer, Layout,
                          ScrollManager, ScrollProgress, Ambient (lighting)
    profile/              the homepage sections (one component + CSS each)
    sections/             Products and Contact are used on the homepage;
                          the rest are earlier sections, not currently rendered
    ui/                   shared building blocks: Button, Logo, Icon, Reveal,
                          SectionHeading, CountUp, GlyphGlobe, useFitScreen ...
    *.js                  legacy demo components, unchanged in behaviour
  data/                   ALL site content, separated from presentation
  motion/                 GSAP setup, LineReveal (heading reveal), SmoothScroll
  styles/
    tokens.css            palette, type scale, spacing, motion tokens
    global.css            layout primitives, all namespaced `lfi-`
    atmosphere.css        the fixed lighting layer
    animations.css        reveal system and reduced-motion fallback
    hud.css, scrub.css    decorative card corners and scroll-scrub effects
    legacy-bootstrap.css  Bootstrap, for the legacy pages only
  utils/meta.js           sets per-route title/description/canonical/robots
```

Every class the redesign adds is prefixed `lfi-` (site-wide) or `pf-`
(corporate-profile sections), so nothing collides with Bootstrap or the legacy
pages' own styling.

### Components that are not currently rendered

`src/components/sections/` still holds the previous homepage's sections —
`Hero`, `Introduction`, `Solutions`, `Services`, `Process`, `Insights`,
`Enterprise`, `WhyLinkfields` and `IndustriesSection` — together with the UI
pieces only they use (`NetworkSphere`, `CapabilityVisual`, `Scrub`,
`useScrollScrub`). Nothing imports them. They are kept for reference and can be
deleted when no longer wanted; only `Products` and `Contact` from that folder
are live.

---

## Routes

| Route | What it is | Indexed |
| --- | --- | --- |
| `/` | Homepage | yes |
| `/demos` | Filterable catalogue of every demonstration | yes |
| `/BankingAnalytics`, `/TelecomAnalytics`, `/BankingTelecomAnalytics` | Original analytics pages (two buttons each, opening churn and segmentation demos) | yes |
| `/explore` | The original interactive catalogue explorer | no |
| `/golf-analyzer`, `/resume-summarizer`, `/jd-cv-comparison` | Original demos — **corporate network only** | no |
| `/users`, `/generate-report` | Original internal tooling — **corporate network only** | no |
| anything else | 404 page, served with a real HTTP 404 | no |

Every route's title, description and indexability lives in
**`src/data/seo.js`**. Adding a route means adding it there as well as in
`App.js` — the server only serves routes that have a generated HTML file, so a
route missing from `seo.js` will 404 in production.

The demo catalogue cards no longer point at the three analytics pages: each
churn and segmentation demo has its own card that opens the live demo
directly. The pages remain reachable for links already published to them.

### Routes that need the corporate network

These call services on `10.2.0.x`, so they cannot load for a visitor outside
the Linkfields network. They are kept working and labelled as internal in the
catalogue rather than presented as links anyone can open:

| Route | Backend |
| --- | --- |
| `/golf-analyzer` | `http://10.2.0.70:5001/analyze/` |
| `/resume-summarizer` | `http://10.2.0.70:5002/summarize-pdf` |
| `/jd-cv-comparison` | `http://10.2.0.70:5002/match-jd-cv/` |
| `/users` | `http://10.2.0.65:8020/users` |
| `/generate-report` | an ngrok tunnel (see [Known limitations](#known-limitations)) |

These URLs are hard-coded in the components. Moving them to `REACT_APP_*`
variables would be the natural next cleanup.

---

## The homepage

`src/Pages/Home.js` renders these sections in order. Each lives in
`src/components/profile/` unless noted, and each declares a key light for the
[lighting layer](#the-lighting-layer).

| Section | Component | Anchor | Content source |
| --- | --- | --- | --- |
| Hero (title, portfolio chips, facts, glyph globe) | `ProfileHero` | `#top` | `profile.js` → `hero` |
| Who we are (positioning, mission, vision) | `WhoWeAre` | `#who-we-are` | `profile.js` → `about` |
| Culture | `Culture` | `#culture` | `profile.js` → `culture` |
| Scale (the figures) | `Scale` | `#scale` | `profile.js` → `stats` |
| Global reach (map of offices) | `GlobalReach` | `#global` | `profile.js` → `locations`, `reach` |
| Five portfolios (carousel) | `Portfolios` | `#portfolios` | `profile.js` → `portfolios` |
| Products | `sections/Products` | `#products` | `demos.js` → `products` |
| Industries | `IndustriesGrid` | `#industries` | `profile.js` → `industries` |
| Clients | `Clients` | `#clients` | `profile.js` → `clients` |
| Partners and recognition | `Partners` | `#partners` | `profile.js` → `partners`, `recognitionMedia` |
| Commercial models | `Engage` | `#engage` | `profile.js` → `engagement` |
| Why Linkfields | `WhyChoose` | `#why-linkfields` | `profile.js` → `reasons` |
| FAQ | `Faq` | `#faq` | `faq.js` |
| Contact (form + offices) | `sections/Contact` | `#contact` | `company.js`, `profile.js` → `contactBlock` |

### Navigation

`src/data/nav.js` holds the header links: Who we are, Portfolios, Industries,
Products, Demos. **Contact** is the yellow button beside them (with an arrow),
not a sixth link. On the homepage it scrolls to `#contact`; from any other page
it goes to `/#contact`. The mobile drawer shows the same five links with the
Contact button at the bottom.

`ScrollManager` intercepts same-page `#anchor` clicks site-wide and lands each
section flush under the sticky header; on a route change it resets to the top
and refreshes ScrollTrigger.

### Fit-to-screen sections

**Products** and **Contact** are designed to fit in one screen under the
navbar on desktop. `src/components/ui/useFitScreen.js` tries a list of density
levels, roomiest first, and writes the first one that fits to the section as
`data-fit="0" | "1" | ...`. The section's CSS styles each level; heights are in
`vh` so one set of rules serves a 665px laptop and a 1080px monitor. If no
level fits (or the screen is narrower than 900px), the section gets
`data-fit="natural"` and simply takes its full height — nothing is ever
clipped.

| Section | Levels | What tightens |
| --- | --- | --- |
| Products | `0`–`3` | logo-window height, description lines (3 → 2), tech tags hidden, spacing |
| Contact | `0`–`1` | spacing and type size |

Products was checked to fit at 1280×665, 1366×657, 1440×760, 1536×730,
1920×945 and 1920×1080. When the level changes the section's height changes,
so the hook refreshes ScrollTrigger — otherwise every scroll animation below it
would fire hundreds of pixels late.

---

## Content and data

**All content lives in `src/data/`.** Components render it; they do not carry
copy of their own, so a content change is a change to one data file.

| File | Holds |
| --- | --- |
| `profile.js` | Corporate Profile 2026 content: portfolios, about, culture, stats, locations, industries, clients, partners, commercial models, reasons, hero |
| `company.js` | Verified company facts, published statements (verbatim), contact details, offices, parent-site links |
| `demos.js` | The products and the demo catalogue, with tech and industry taxonomies |
| `faq.js` | The FAQ — every answer is assembled from the files above, so it cannot drift |
| `seo.js` | Per-route title, description and indexability (see [SEO](#seo-aeo-and-geo)) |
| `nav.js` | Header navigation |
| `landMask.js` | Generated coastline raster for the globe and map — do not edit by hand |
| `services.js`, `solutions.js`, `enterprise.js` | Content for the earlier sections that are not currently rendered |

### Content accuracy

Everything factual is traceable to an official source; the files in
`src/data/` cite theirs at the top:

- the **Linkfields Corporate Profile 2026** deck (`profile.js`, in the deck's own wording)
- <https://www.linkfields.com/> and its About, Our Approach, AI & ML and Contact pages (`company.js`)
- the existing lfiai.com catalogue — product names, descriptions, demo URLs (`demos.js`)

Strings under `official` in `company.js` are quoted character for character
from the published pages. There are no invented customers, testimonials, case
studies, certifications or metrics. A product whose capabilities are not
published (SiteSense) says so rather than having a description written for it.

### The demo catalogue

`demos.js` exports `products` (the named, branded products shown on the
homepage) and `demos` (every working demonstration shown on `/demos`). Each
demo has:

| Field | Meaning |
| --- | --- |
| `href` | Live URL, or `null` if there is no public build (the UI then routes to the enquiry form) |
| `access` | `"public"` (anyone can open it) or `"internal"` (corporate network only — shown, but not linked) |
| `status` | `"live"` or `"offline"` |
| `tech`, `industries` | Filter tags; keys of `TECH` and `INDUSTRIES` in the same file |

Counts shown on the site ("Browse all 38 demonstrations", the FAQ, `llms.txt`)
are computed from these arrays, never typed into copy. Demo links were last
verified reachable on the date in `VERIFIED_ON`.

---

## Design system

### Tokens

`src/styles/tokens.css` defines the palette, type scale, spacing, radii and
motion durations as CSS custom properties (`--lfi-*`, and `--pf-*` for the
portfolio colours). Use the tokens rather than raw values.

### Brand

`public/assets/brand/` holds the official logo, extracted directly from the
supplied logo sheet — same paths, gradients and proportions. The mark is never
redrawn in markup or substituted with text.

| File | Use |
| --- | --- |
| `lfi-logo-dark.svg` | Full lockup, light text — for dark backgrounds |
| `lfi-logo-light.svg` | Full lockup, dark text — for light backgrounds |
| `lfi-mark.svg` | Icon mark only |
| `lfi-mark-flat.svg` | Flat mark, for sizes below ~48px |
| `lfi-icon.svg` | App icon (mark on the brand black square) |

Palette, per the logo sheet: `#FFD600` yellow, `#FF7800` orange, `#2D58C0`
blue, `#000000` black, `#E6ECED` light text. One documented deviation: the
sheet's grey `#737677` fails WCAG AA at small sizes, so `--lfi-text-subtle` is
a lighter step of the same hue. The lockup is ~4.8:1 — size it by **height**.

Each portfolio has its own colour (`--pf-orange`, `--pf-blue`, `--pf-purple`,
`--pf-yellow`, `--pf-teal`), used consistently in the hero chips, carousel and
footer.

### The lighting layer

`styles/atmosphere.css` + `components/layout/Ambient.js` make a long dark page
read as one lit space rather than a stack of black blocks. One fixed element
behind the whole site carries five named key lights; each section declares the
one it wants with `data-light="deep | violet | azure | amber | ember"`, and the
layer cross-fades to it as that section takes over the screen.

- **Section backgrounds must stay translucent.** `lfi-section--alt` is a
  low-alpha tint, not an opaque fill; an opaque background paints over the
  lighting and flattens the section.
- **It degrades to nothing.** If the observer never runs, the site is the flat
  dark it would otherwise be — a complete design, not a broken one.

### Accessibility

- Every interactive target is at least 24×24px (WCAG 2.5.8), including the
  carousel dots.
- Heading levels are kept in order; labels hidden on small screens are
  visually hidden, not `display: none`, so the outline stays intact.
- Split headings carry the full sentence as an `aria-label`, so screen readers
  read them as one phrase.
- Under `prefers-reduced-motion` every animation is skipped and content shows
  immediately.
- Lighthouse accessibility: 100 (mobile and desktop) at the last audit.

---

## Motion and animation

### Libraries

`src/motion/index.js` registers GSAP with ScrollTrigger and SplitText and
exports the shared easings (`EASE.out`, `EASE.emphasis`) and
`prefersReducedMotion()`. `SmoothScroll.js` runs Lenis and keeps ScrollTrigger
in sync with it.

### Heading reveal (every section heading)

`src/motion/LineReveal.js` is the site's signature entrance, used by every
section heading through `ui/SectionHeading.js`:

- the heading is split into lines and words; each line sits in a clipping mask;
- the words rise into place **left to right**, fading in and sharpening out of
  a slight blur — about **2.5 seconds** for a seven-word heading;
- it plays when the heading enters the viewport and **replays every time** it
  comes back into view (it resets while off screen, so the reset is never seen).

The motion is defined once, in `WORD_REVEAL` and `wordStagger()`:

| Setting | Value | Where |
| --- | --- | --- |
| Per-word duration | 1.3s | `WORD_REVEAL.to.duration` |
| Gap between words | 0.2s, tightened on long headings so none runs past ~3s | `wordStagger()` |
| Starting offset / blur | 45% of the word's height, `blur(4px)` | `WORD_REVEAL.from` |

`LineReveal` props: `split` (`"words"` default, or `"lines"` for the older,
quicker line-by-line reveal), `replay` (`true` default), `delay`, `start`.

The **homepage hero title** uses the same `WORD_REVEAL` settings inside its
own intro timeline (`ProfileHero.js`) and plays once on load; the chips, lede
and buttons keep their own timing rather than waiting for the title.

Three implementation details worth knowing before changing this code:

- **Set, then tween — not `gsap.from`.** The animation is a timeline that sets
  the hidden state at time 0 (`immediateRender: true`) and then tweens to rest.
  A staggered `from()` only re-applies its start values to the first target
  when ScrollTrigger refreshes, which left the other words visible and then
  jumping.
- **Gradient text.** `.lfi-accent` paints its gradient through its own text.
  Once split into separately animated words, the phrase paints nothing, so
  `paintAccentWords()` gives each word its own slice of the phrase's gradient.
- **It can never hide content.** The resting hidden state is gated on `.lfi-js`
  and cleared in a `finally`, so an animation error leaves headings visible.

### Other motion

| Effect | Where |
| --- | --- |
| Fade-and-rise on scroll for cards and paragraphs | `ui/Reveal.js` + `ui/useReveal.js`, CSS in `styles/animations.css` (`data-reveal`, `delay` for staggers) |
| Hero intro timeline, and the hero copy drifting on scroll | `profile/ProfileHero.js` |
| Count-up figures | `ui/CountUp.js` |
| Interactive glyph globe (drag to spin) | `ui/GlyphGlobe.js` |

The hero lede deliberately slides without fading: it is the Largest Contentful
Paint element, and Chrome does not count an element as painted while its
opacity is 0.

---

## SEO, AEO and GEO

The site is client-rendered, and most AI crawlers (GPTBot, ClaudeBot,
PerplexityBot) and Bing's first pass do **not** run JavaScript — they read only
the HTML the server sends. So everything a crawler needs is written into
static files at build time.

### What is in place

| Area | Implementation |
| --- | --- |
| Per-route metadata | `src/data/seo.js` → `utils/meta.js` at runtime **and** static HTML per route at build |
| Canonical host | `.htaccess` 301-redirects `http://` and `www.` to `https://lfiai.com` |
| Real 404s | Unknown URLs and missing files return HTTP 404 (not the homepage with 200) |
| Structured data | Organization (legal name, HQ address, offices, contact points, knowsAbout), WebSite, ItemList of products, FAQPage, BreadcrumbList, WebPage/CollectionPage |
| FAQ | Visible on the homepage (native `<details>`, so answers are always in the DOM) and as FAQPage data |
| No-JS text | Each route's HTML carries a text fallback inside `<noscript>` (~1,080 words on `/`, ~690 on `/demos`) |
| `llms.txt` | Plain-text company brief for language models, generated from the data files |
| `robots.txt` | All crawlers allowed; AI crawlers (GPTBot, ClaudeBot, PerplexityBot, Google-Extended, CCBot ...) listed explicitly |
| `sitemap.xml` | Indexable routes only, stamped with the build date |
| Social preview | 1200×630 `og-image.jpg` |

### The build-time pass — `scripts/seo-build.mjs`

Runs automatically after `react-scripts build`. From `src/data/` it writes:

| Output | Contents |
| --- | --- |
| `build/<route>.html` | One per route in `seo.js`: that route's title, description, canonical, robots and social tags, its structured data and its no-JS text |
| `build/404.html` | The not-found page (`noindex`) |
| `build/index.html` | Adds FAQPage + WebPage data and the FAQ to the no-JS text |
| `build/sitemap.xml` | Indexable routes with today's date |
| `build/llms.txt` | Company summary, portfolios, industries, products, FAQ, contacts |

It needs no dependencies. It fails the build loudly if a tag it expects is
missing from `index.html`, rather than shipping a page with the wrong head.

### Server rules — `public/.htaccess`

Copied into `build/` and deployed with it:

1. `www.` and `http://` → 301 to `https://lfiai.com` (respects
   `X-Forwarded-Proto` behind a proxy).
2. Real files are served as they are.
3. `/demos` → `demos.html` (and so on); a trailing slash redirects to the
   canonical form first.
4. Anything else → `ErrorDocument 404 /404.html`, which the app renders as its
   404 page.
5. Caching: hashed `/static/` files for a year (`immutable`), images for a
   week, HTML/TXT/XML always revalidated.

Only `FileInfo`-class directives are used, so a host with restricted
`AllowOverride` will not turn the site into 500 errors. **This file replaces
whatever `.htaccess` was on the server before** — if the host had rules of its
own, merge them in.

### Scores at the last audit

Lighthouse (local production build):

| | Mobile | Desktop |
| --- | --- | --- |
| SEO | 100 | 100 |
| Accessibility | 100 | 100 |
| Best practices | 100 | 100 |
| Performance | ~75 | 97–98 |

Mobile performance is held back by client-side rendering: the page cannot paint
until the JavaScript has run. Pre-rendering the routes at build time is the
next step if a higher mobile score is needed.

### After each deploy

- `curl -I http://www.lfiai.com/` → `301` to `https://lfiai.com/`
- `curl -I https://lfiai.com/does-not-exist` → `404`
- `curl -s https://lfiai.com/demos | grep "<title>"` → the demos title, not the homepage's
- Submit `https://lfiai.com/sitemap.xml` in Google Search Console and Bing
  Webmaster Tools (Bing's index also feeds ChatGPT search and Copilot).

---

## Configuration and the contact form

All environment variables are optional. Put them in `.env.local` (git-ignored)
or set them in the build environment. CRA only exposes variables prefixed
`REACT_APP_`, and they are inlined at **build** time — rebuild after changing
one.

| Variable | Default | Effect |
| --- | --- | --- |
| `REACT_APP_CONTACT_ENDPOINT` | _unset_ | URL that accepts a JSON `POST` from the contact form |

```bash
cp .env.example .env.local
```

There is **no form backend in this repository**, and the UI does not pretend
there is one:

- **Unset (default).** The form validates, then hands the message to the
  visitor's email client via `mailto:` addressed to `sales@linkfields.com`. A
  visible notice says so, and no success message is shown for something that
  was not sent.
- **Set.** The form `POST`s JSON to that URL and reports the real outcome. A
  non-2xx response is shown as a failure, with the email route offered.

Payload:

```json
{
  "name": "...", "email": "...", "company": "...", "phone": "...",
  "interest": "...", "message": "...", "source": "lfiai.com"
}
```

No secrets are read by the frontend, and none should be — anything in a
`REACT_APP_` variable ships in the JavaScript bundle and is public.

### What the endpoint has to do

The browser half of this form is a convenience, not a control. The server
behind `REACT_APP_CONTACT_ENDPOINT` must:

- re-validate every field on its own rules;
- sanitise values before they reach a mail body, template or database;
- rate-limit per IP and per sender address;
- hold the mail credentials (never in a `REACT_APP_` variable);
- return 2xx **only** once the message is genuinely accepted.

The client adds two cheap filters — a honeypot field and a three-second
minimum fill time — which are not a substitute for the list above.

**This integration is not configured.** Treat the deployment as incomplete
until an endpoint exists and has been tested end to end.

---

## Verifying the UI

```bash
npm start            # terminal 1
npm run verify       # terminal 2
```

`npm run verify` drives headless Chromium (Playwright, a devDependency) over the
running site and exits non-zero on any failure:

| Check | Why |
| --- | --- |
| Horizontal overflow at 1440 / 1280 / 1024 / 768 / 390 / 360 | Names the offending element instead of just reporting a wide page |
| Console errors, uncaught exceptions, failed requests | On `/` and `/demos` |
| Hero headline line breaks | The accent phrase must occupy exactly one line box at every width |
| Ambient lighting | The lighting layer must mount and change between sections |
| `prefers-reduced-motion` | Nothing may be left stuck at `opacity: 0` |
| Tablist keyboard operation | Arrow keys move selection; exactly one tab is in the tab order |

Screenshots per breakpoint go to `.verify/` (git-ignored). Options:

```bash
npm run verify -- --url=http://localhost:3001 --out=.tmp/shots
```

For SEO checks, run Lighthouse against a served production build (`npx serve
build`, then Chrome DevTools → Lighthouse) — the dev server is unminified and
scores lower.

---

## Build and deployment

`azure-pipelines.yml` runs on every push to `main`:

1. installs Node 20 (and dependencies only if `package.json` or the lockfile
   changed);
2. runs `CI=false npm run build` — which includes the SEO pass;
3. mirrors `build/` to the site root over FTP with `lftp` (dotfiles included,
   so `.htaccess` is deployed).

FTP credentials come from the `Website_Catalogue` variable group in Azure
DevOps; none are in the repository.

Notes:

- The build also passes with `CI=true` (warnings as errors) — keep it that way.
- Pushing to `main` deploys. Work on a branch and merge when ready.

---

## Common tasks

**Change any text, figure or image on the homepage** — edit the relevant file
in `src/data/` (usually `profile.js`). Do not put copy in components.

**Add or update a demo** — add an entry to `demos` (or `products`) in
`src/data/demos.js` with a verified `href`, and update `VERIFIED_ON`. Counts
and the FAQ update themselves.

**Add a FAQ** — add a `{ q, a }` entry to `src/data/faq.js`. Build answers from
the data files where possible, and make each answer a complete statement that
reads correctly on its own (that is what answer engines quote).

**Add a route** — add it to `App.js` **and** to `ROUTES` in `src/data/seo.js`
(title, description, and `noindex: true` if it should not be in search), then
call `setMeta(ROUTES.yourRoute)` in the page.

**Add a homepage section** — create a component in `src/components/profile/`,
give the `<section>` an `id`, `lfi-section` class and a `data-light` value, use
`<SectionHeading>` for its heading (which gives it the word reveal), and add it
to `Home.js`.

**Change heading animation speed** — `WORD_REVEAL` and `wordStagger()` in
`src/motion/LineReveal.js`. This changes every heading, including the hero.

**Regenerate the globe/map coastline** — `node scripts/generate-globe-mask.mjs`.

---

## Known limitations

- **No contact backend** — see [Configuration](#configuration-and-the-contact-form).
- **`/generate-report`** calls a free ngrok tunnel
  (`ungenuine-neville-oasitic.ngrok-free.dev`) whose hostname changes whenever
  the tunnel restarts; it needs a stable URL.
- **Demo reachability is a point-in-time check**, not a health check. If a demo
  goes down the catalogue still links to it; re-verify and update
  `VERIFIED_ON` periodically.
- **Mobile performance (~75)** is limited by client-side rendering; see
  [Scores](#scores-at-the-last-audit).
- **Unused components** in `src/components/sections/` add maintenance surface;
  see [Components that are not currently rendered](#components-that-are-not-currently-rendered).
- `caniuse-lite` is old and warns on every build; `npx
  update-browserslist-db@latest` clears it (it touches the lockfile).
