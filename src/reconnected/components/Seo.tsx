'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseKeyValues } from '../lib/parse';
import { alternatesOf, LANGS, useSite } from '../lib/site';
import { JsonLd } from './JsonLd';

/**
 * ```
 * ::: seo
 * title: Page title (≤ 60 chars)
 * description: Meta description (≤ 155 chars)
 * schema: service            # optional: adds ProfessionalService JSON-LD
 * image: /content-assets/…   # optional og:image override
 * :::
 * ```
 * Renders nothing visible; React hoists the tags into <head>.
 */
export default function Seo({ content }: MarkdownBlockProps) {
  const { config, lang, language, pathname, avatar } = useSite();
  const meta = parseKeyValues(content);
  const siteUrl = (config.site.url ?? '').replace(/\/$/, '');
  const url = `${siteUrl}${pathname}`;
  const alternates = alternatesOf(config, pathname);
  const otherLangs = LANGS.filter((code) => code !== lang && alternates[code]);
  const image = meta.image ?? avatar;
  const title = meta.title ?? config.brand;
  const description = meta.description ?? '';

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

  if (meta.schema === 'service') {
    const fr = lang === 'fr';
    const session = fr ? 'Séance individuelle 1 h' : 'Individual session, 1 hour';
    graph.push({
      '@type': 'ProfessionalService',
      '@id': `${siteUrl}/#service`,
      name: `${config.brand} – ${config.author.name}`,
      url: `${siteUrl}/`,
      provider: { '@id': `${siteUrl}/#person` },
      description,
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

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      {LANGS.filter((code) => alternates[code]).map((code) => (
        <link key={code} rel="alternate" hrefLang={code} href={`${siteUrl}${alternates[code]}`} />
      ))}
      {alternates.fr ? (
        <link rel="alternate" hrefLang="x-default" href={`${siteUrl}${alternates.fr}`} />
      ) : null}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content={config.brand} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={language.locale} />
      {otherLangs.map((code) => (
        <meta key={code} property="og:locale:alternate" content={config.languages[code].locale} />
      ))}
      {image ? <meta property="og:image" content={`${siteUrl}${image}`} /> : null}
      <meta name="twitter:card" content="summary" />
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
    </>
  );
}
