'use client';

import { usePathname } from 'next/navigation';
import type { ContentManifest } from '@lefolio/engine/template';

type PageMeta = {
  title?: string;
  description?: string;
  date?: string;
  seo?: unknown;
};
import { LANGS, normalizePath, useSite } from '../lib/site';
import { JsonLd } from './JsonLd';

function readSeo(frontmatter: PageMeta | undefined): { title?: string; schema?: string } {
  const raw = frontmatter?.seo;
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return {};
  const seo = raw as Record<string, unknown>;
  const text = (key: string) =>
    typeof seo[key] === 'string' && seo[key].trim() ? String(seo[key]).trim() : undefined;
  return { title: text('title'), schema: text('schema') };
}

function frontmatterFor(manifest: ContentManifest, pathname: string): PageMeta | undefined {
  const path = normalizePath(pathname);
  if (path === '/') return manifest.home?.frontmatter;
  const standalone = manifest.standalonePages.find((page) => normalizePath(page.href) === path);
  if (standalone) return standalone.frontmatter;
  const page = manifest.pages.find((entry) => normalizePath(entry.href) === path);
  if (page) return page.frontmatter;
  const section = manifest.sections.find((entry) => normalizePath(`/${entry.sectionSlug}/`) === path);
  return section?.index?.frontmatter;
}

/**
 * Site-specific JSON-LD. Document title and description come from frontmatter
 * via the engine (`title` / `description`, override with `seo.title`).
 * `seo.schema: service | article` selects the extra graph node.
 */
export default function Schema({ manifest }: { manifest: ContentManifest }) {
  const pathname = normalizePath(usePathname());
  const { config, lang, language, avatar } = useSite();
  const frontmatter = frontmatterFor(manifest, pathname);
  const seo = readSeo(frontmatter);
  if (seo.schema !== 'service' && seo.schema !== 'article') return null;

  const siteUrl = (config.site.url ?? '').replace(/\/$/, '');
  const url = `${siteUrl}${pathname}`;
  const description =
    (typeof frontmatter?.description === 'string' && frontmatter.description) ||
    config.site.description ||
    '';
  const title = seo.title || frontmatter?.title || config.brand;
  const date = typeof frontmatter?.date === 'string' ? frontmatter.date : undefined;

  const graph: Record<string, unknown>[] = [
    {
      '@type': 'WebSite',
      '@id': `${siteUrl}/#website`,
      url: `${siteUrl}/`,
      name: config.brand,
      inLanguage: LANGS,
    },
    {
      '@type': 'Person',
      '@id': `${siteUrl}/#person`,
      name: config.author.name,
      jobTitle: language.jobTitle,
      url: `${siteUrl}/`,
      ...(avatar ? { image: `${siteUrl}${avatar}` } : {}),
      knowsLanguage: LANGS,
      sameAs: Object.entries(config.author.links ?? {})
        .filter(([key, value]) => key !== 'email' && /^https?:/.test(value))
        .map(([, value]) => value),
    },
  ];

  if (seo.schema === 'article') {
    graph.push({
      '@type': 'BlogPosting',
      '@id': `${url}#article`,
      headline: title,
      description,
      url,
      inLanguage: lang,
      author: { '@id': `${siteUrl}/#person` },
      publisher: { '@id': `${siteUrl}/#person` },
      mainEntityOfPage: { '@type': 'WebPage', '@id': url },
      ...(date ? { datePublished: date, dateModified: date } : {}),
      ...(avatar ? { image: `${siteUrl}${avatar}` } : {}),
    });
  }

  if (seo.schema === 'service') {
    const fr = lang === 'fr';
    const { address, phone } = config.contact;
    const session = fr ? 'Séance individuelle 50 min' : 'Individual session, 50 minutes';
    graph.push({
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#service`,
      name: `${config.brand} – ${config.author.name}`,
      url: `${siteUrl}/`,
      provider: { '@id': `${siteUrl}/#person` },
      description,
      ...(phone ? { telephone: phone } : {}),
      ...(address
        ? {
            address: {
              '@type': 'PostalAddress',
              streetAddress: address.street,
              postalCode: address.postalCode,
              addressLocality: address.city,
              addressCountry: address.country,
            },
          }
        : {}),
      areaServed: [
        { '@type': 'City', name: 'Strasbourg' },
        { '@type': 'Place', name: fr ? 'En ligne' : 'Online' },
      ],
      availableLanguage: LANGS,
      priceRange: '40–89 €',
      makesOffer: [
        { name: fr ? 'Appel découverte (20 min)' : 'Discovery call (20 min)', price: '0' },
        { name: `${session} – ${fr ? 'tarif solidaire' : 'supported rate'}`, price: '40' },
        { name: `${session} – ${fr ? 'tarif de référence' : 'standard rate'}`, price: '65' },
        { name: `${session} – ${fr ? 'tarif de soutien' : 'supporter rate'}`, price: '89' },
      ].map((offer) => ({ '@type': 'Offer', priceCurrency: 'EUR', ...offer })),
    });
  }

  return <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />;
}
