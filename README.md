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

Optional: set `VITE_SITE_URL` in `.env` (see `.env.example`) if deploying to a different domain than `https://www.re-connected.fr`.

## SEO

- Prerendered HTML with full page content at build time
- Open Graph and Twitter Card meta tags
- JSON-LD structured data (Person, ProfessionalService, WebSite)
- `public/robots.txt` and `public/sitemap.xml`
- Canonical URL and meta description

Edit SEO defaults in `src/config/site.ts` and `src/components/SeoHead.tsx`.

## Deployment (GitHub Pages)

Live site: **https://oilandrust.github.io/reconnected.fr/**

Pushes to `main` trigger the GitHub Actions workflow (`.github/workflows/deploy.yml`), which builds with prerendering and deploys to GitHub Pages.

### Custom domain (later)

1. In the repo: **Settings → Pages → Custom domain** → enter your domain (e.g. `reconnected.fr`)
2. Add DNS records at your registrar (GitHub will show the required A/CNAME records)
3. Update the workflow env `VITE_SITE_URL` to your domain
4. Update `public/sitemap.xml` and `public/robots.txt` with the final URL
5. Remove `GITHUB_PAGES: 'true'` from the workflow (base path becomes `/` for a custom domain)


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
