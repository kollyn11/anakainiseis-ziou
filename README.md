# ΖΙΟΥ Ανακαινίσεις — website

Landing page for **ΖΙΟΥ Ανακαινίσεις** (Ziou Renovations), a renovation business in Attica, Greece.
Static [Astro](https://astro.build) site, hosted on Netlify, all copy in Greek.

- **Live:** https://anakainiseis-ziou.netlify.app
- **Project admin (CMS):** `/admin`
- **Adding projects (Greek guide for the owner):** [ADDING-PROJECTS.md](ADDING-PROJECTS.md)

## Run locally

Requires Node.js 22+.

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve dist/ locally
npm run check     # type-check (astro check)
npm run logo      # rebuild the vector logo (src/assets/brand/logo-*.svg) from scripts/build-logo.mjs
npm run icons     # regenerate favicon / app icons / og-image.png from the vector logo
```

## Where things live

| What | Where |
|---|---|
| **All business data** (name, phone, email, Instagram, areas, canonical URL, owner TODOs) | `src/config/site.ts` — the only place to edit it |
| Services (names + descriptions) | `src/data/services.ts` |
| FAQ (also emitted as FAQPage JSON-LD) | `src/data/faq.ts` |
| Brand colours (navy / orange / sand), type, buttons | `src/styles/global.css` |
| Logo (vector redraw of the client logo; original JPG in `src/assets/brand/source/`) | geometry `src/assets/brand/runner-parts.mjs`; static `logo-runner.svg`, `logo-full.svg`; components `Logo`, `Lockup`, `RunnerAnimated` |
| Smooth scroll (Lenis) + scroll-driven header runner | `src/scripts/motion.ts`, `src/scripts/runner.ts` |
| Projects (content collection) | `src/content/projects/<folder>/index.md` + photos; schema in `src/content.config.ts` |
| CMS config (generated from `site.ts`) | `src/pages/admin/config.yml.ts`, UI at `public/admin/index.html` |
| JSON-LD builders | `src/lib/schema.ts` |
| Netlify build + headers | `netlify.toml` |

Search the code for `TODO(owner)` to find every claim or value the owner still has to confirm.

## Deploy

The site deploys from GitHub: every push to `main` triggers a Netlify build (`npm run build`, publish `dist/`).

Manual deploy from a local machine, if ever needed:

```bash
npx netlify-cli deploy --build --prod
```

### Contact form

The quote form (`prosfora`) uses **Netlify Forms**: the form is detected in the built HTML at deploy time, has a honeypot field
(`bot-field`), and redirects to `/efxaristoume/`.

- Email notification: Netlify → *Project configuration → Notifications → Emails and webhooks → Form submission notifications* → email to the owner.
- The notification subject comes from the hidden `subject` field, filled in by the page as
  `Νέο αίτημα προσφοράς – {name} – {service}`; Netlify sets **Reply-To** to the visitor's `email` field when provided.

### Custom domain

1. Netlify → *Domain management → Add a domain* (e.g. `anakainiseis-ziou.gr`) and follow the DNS instructions.
2. Change `url` in `src/config/site.ts` to the new domain and push. Canonical URLs, sitemap, robots.txt, Open Graph tags, JSON-LD and
   the CMS config all follow automatically.

### CMS login (Sveltia CMS, GitHub backend)

Either:

- **Token:** on `/admin` choose *Sign In with Token* and paste a fine-grained GitHub token limited to this repository with
  *Contents: read/write* and *Pull requests: read/write*; or
- **OAuth:** create a GitHub OAuth App (callback URL `https://api.netlify.com/auth/done`) and add its client ID/secret in Netlify →
  *Project configuration → Access & security → OAuth → Install provider → GitHub*. Then *Sign In with GitHub* works on `/admin`.
