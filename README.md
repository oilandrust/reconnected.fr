# (Re)Connected

A React + Vite port of [re-connected.fr](https://www.re-connected.fr/) — somatic therapy and Hakomi practice website for Olivier Rouiller.

## Stack

- **React 19** + **TypeScript** + **Vite**
- Content in Markdown (`Content/`) with YAML frontmatter
- **Manrope** and **Fira Code** fonts (from WordPress Twenty Twenty-Five theme)
- Original color palette and layout preserved

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Build

```bash
npm run build
npm run preview
```

The build uses **vite-react-ssg** to prerender the full page into static HTML. Crawlers and social previews receive all content and meta tags without running JavaScript.

Optional: set `VITE_SITE_URL` in `.env` (see `.env.example`) if deploying elsewhere than `https://www.re-connected.fr`.

## SEO

- Prerendered HTML with full page content at build time
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (Person, ProfessionalService, WebSite)
- `public/robots.txt` and `public/sitemap.xml`
- Canonical URL and meta description

Edit SEO defaults in `src/config/site.ts` and `src/components/SeoHead.tsx`.

## Deployment (GitHub Pages)

Live site: **https://www.re-connected.fr/** (GitHub Pages via [reconnected.fr](https://github.com/oilandrust/reconnected.fr))

Pushes to `main` trigger the GitHub Actions workflow, which builds with prerendering and deploys to GitHub Pages.

### DNS (required at your domain registrar)

GitHub expects **`www`** as a CNAME, not an A record.

| Host | Type | Value |
|------|------|-------|
| `www` | **CNAME** | `oilandrust.github.io` |
| `@` (apex) | **A** | `185.199.108.153` |
| `@` | **A** | `185.199.109.153` |
| `@` | **A** | `185.199.110.153` |
| `@` | **A** | `185.199.111.153` |

**Important:** Remove any existing **A record** on `www` (currently pointing to `3.67.107.69`, your old WordPress host). You cannot have both an A record and a CNAME on the same name.

After DNS changes propagate (minutes to 48h), verify in the repo under **Settings → Pages → Custom domain**. Enable **Enforce HTTPS** once the certificate is issued.



## Project structure

```
Content/           Markdown content files (editable copy)
public/
  fonts/           Manrope & Fira Code variable fonts
  images/          Site images downloaded from WordPress
src/
  components/      React section components
  content/         Markdown loader (gray-matter)
  styles/          CSS variables, fonts, global styles
```

## Content

Edit any file in `Content/` to update site copy. Each file uses frontmatter for metadata (images, CTAs, etc.) and Markdown for body text.

## Contact

The WordPress contact form has been replaced with a mailto button: **o.rouiller@gmail.com**
