# re-connected.fr

Bilingual (FR at `/`, EN at `/en/`) static site for Olivier Rouiller, psychopraticien. Built with `@lefolio/engine`: the copy lives in Markdown in `Content/`, the look lives in a site-local template in `src/reconnected/`.

## Commands

```bash
npm install
npm run dev       # live preview (lefolio dev)
npm run build     # static export to out/ + postbuild (lang, redirects, sitemap, robots, CNAME)
npm run preview   # serve out/
npm run images    # re-encode source photos from ../re-connected/public/images into Content/Assets/*.webp
```

Pushing to `main` deploys `out/` to GitHub Pages (`.github/workflows/deploy.yml`).

## Content

```
Content/
  config.yaml            site settings, menus, contact/booking links, FR↔EN routes, redirects
  Accueil.md             FR home (/)
  Approche.md …          FR pages → /approche/, /seances-et-tarifs/, …
  En/En.md               EN home (/en/)
  En/Approach.md …       EN pages → /en/approach/, …
  Assets/                images and favicon
```

- The URL is the slugified file name. To hide a page, add `published: false` to its frontmatter (Workshops/Ateliers are hidden this way; also uncomment their menu entry in `config.yaml` when publishing).
- When adding a page, add its FR↔EN pair under `routes` in `config.yaml` so the language switch and hreflang tags point to the right page.
- Special link targets resolved from `config.yaml`: `#booking` (discovery call, per language), `#email`, `#workshops`.
- `<!-- TODO: … -->` comments are never rendered; they mark information still to confirm.
- Images: files starting with `deco-` are decorative (empty alt). Other images get the alt text "Olivier Rouiller, {jobTitle}".

## Blocks

Write `::: name` … `:::` in a page. Inside a block, `## Heading` is the section title, a line made only of links becomes buttons (first is primary), and an image embed `![[file.webp]]` is the section image.

| Block | Content |
| --- | --- |
| `seo` | `title:`, `description:`, optional `schema: service`. Sets title, canonical, hreflang, Open Graph, JSON-LD. One per page. |
| `hero` | Optional eyebrow line, `# H1`, optional `## subtitle`, text, optional image, buttons. |
| `split` | Text beside an image. Put the image before the heading to place it on the left. |
| `checklist` | Title, intro, `- item` list (leaf cards). |
| `facts` | `- **Label** · value` list. |
| `cards` | `### Card` sections, or `- **Lead** · text` items. |
| `steps` | Numbered `1.` list. |
| `pricing` | `### Tier`, a `**40 €** / séance` line, description. Text after `---` is a note under the tiers. |
| `timeline` | `- **Date** · entry` list. |
| `faq` | `### Question` followed by the answer. Also emits FAQPage JSON-LD. |
| `testimonials` | `### Name` followed by a `> quote`. |
| `notice` | Highlighted note. |
| `cta` | Dark closing band with a title, text and buttons. |

Each block has a parser in `src/reconnected/lib/parse.ts` and a component in `src/reconnected/components/`. Register new ones in `src/reconnected/index.ts`.
