#!/usr/bin/env node
/**
 * Post-process the static export in out/ (runs after `lefolio build`):
 *
 * - one <title> per page (warns otherwise)
 * - favicon.ico for browsers that request it directly
 * - redirect stubs for old WordPress URLs (`redirects` in config.yaml)
 * - sitemap.xml with hreflang alternates (`routes` in config.yaml), robots.txt, CNAME
 */
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'out');
const config = yaml.load(fs.readFileSync(path.join(ROOT, 'Content/config.yaml'), 'utf8'));
const siteUrl = String(config.site.url).replace(/\/$/, '');
const LANGS = ['fr', 'en'];

const warn = (message) => console.warn(`postbuild: ${message}`);
const fileFor = (route) => path.join(OUT, route, 'index.html');
const exists = (route) => fs.existsSync(fileFor(route));
const escapeXml = (value) =>
  String(value).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');

if (!fs.existsSync(OUT)) {
  console.error('postbuild: out/ not found — run `lefolio build` first.');
  process.exit(1);
}

/* <title> check ---------------------------------------------------------- */

function htmlFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) return entry.name === '_next' ? [] : htmlFiles(full);
    return entry.name.endsWith('.html') ? [full] : [];
  });
}

let pages = 0;
for (const file of htmlFiles(OUT)) {
  const route = `/${path.relative(OUT, path.dirname(file)).split(path.sep).join('/')}/`.replace(/^\/\.\/$|^\/\/$/, '/');
  const html = fs.readFileSync(file, 'utf8');
  pages += 1;

  const titles = html.match(/<title>/g)?.length ?? 0;
  const isPage = path.basename(file) === 'index.html' && !/\/(404|_not-found)\/$/.test(route);
  if (titles !== 1 && isPage) {
    warn(`${route} has ${titles} <title> tags (missing \`::: seo\` block?)`);
  }
}

/* Icons ----------------------------------------------------------------- */

const icon = path.join(ROOT, 'Content/Assets/favicon-32.png');
if (fs.existsSync(icon)) {
  fs.copyFileSync(icon, path.join(OUT, 'favicon.ico'));
}

/* Redirect stubs ---------------------------------------------------------- */

function stub(target) {
  const url = `${siteUrl}${target}`;
  return `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<title>Redirection…</title>
<meta name="robots" content="noindex">
<link rel="canonical" href="${url}">
<meta http-equiv="refresh" content="0; url=${target}">
<script>location.replace(${JSON.stringify(target)} + location.hash)</script>
</head>
<body>
<p>Cette page a déménagé : <a href="${target}">${url}</a></p>
</body>
</html>
`;
}

let redirects = 0;
for (const [from, value] of Object.entries(config.redirects ?? {})) {
  const { to, fallback } = typeof value === 'string' ? { to: value } : value;
  const target = exists(to) ? to : fallback;
  if (!target || !exists(target)) {
    warn(`redirect ${from} → ${to}: target not built, skipped`);
    continue;
  }
  if (exists(from)) {
    warn(`redirect ${from} would overwrite a real page, skipped`);
    continue;
  }
  fs.mkdirSync(path.join(OUT, from), { recursive: true });
  fs.writeFileSync(fileFor(from), stub(target));
  redirects += 1;
}

/* sitemap.xml --------------------------------------------------------------- */

const urls = [];
for (const pair of config.routes ?? []) {
  const built = LANGS.filter((lang) => pair[lang] && exists(pair[lang]));
  for (const lang of built) {
    const links = built
      .map((alt) => `    <xhtml:link rel="alternate" hreflang="${alt}" href="${escapeXml(siteUrl + pair[alt])}"/>`)
      .concat(
        built.includes('fr')
          ? [`    <xhtml:link rel="alternate" hreflang="x-default" href="${escapeXml(siteUrl + pair.fr)}"/>`]
          : [],
      );
    urls.push(`  <url>\n    <loc>${escapeXml(siteUrl + pair[lang])}</loc>\n${links.join('\n')}\n  </url>`);
  }
}

fs.writeFileSync(
  path.join(OUT, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`,
);

fs.writeFileSync(path.join(OUT, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${siteUrl}/sitemap.xml\n`);
fs.writeFileSync(path.join(OUT, 'CNAME'), `${new URL(siteUrl).host}\n`);
fs.writeFileSync(path.join(OUT, '.nojekyll'), '');

console.log(
  `postbuild: ${pages} pages, ${redirects} redirect stubs, ${urls.length} sitemap URLs`,
);
