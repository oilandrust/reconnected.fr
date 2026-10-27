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
 * schema: service | article  # optional JSON-LD
 * image: /content-assets/…   # optional og:image override
 * date: 2026-10-27           # optional for schema: article
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
  const isArticle = meta.schema === 'article';

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

  if (isArticle) {
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
      ...(meta.date ? { datePublished: meta.date, dateModified: meta.date } : {}),
      ...(image ? { image: `${siteUrl}${image}` } : {}),
    });
  }

  if (meta.schema === 'service') {
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
      <meta property="og:type" content={isArticle ? 'article' : 'website'} />
      <meta property="og:site_name" content={config.brand} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:locale" content={language.locale} />
      {otherLangs.map((code) => (
        <meta key={code} property="og:locale:alternate" content={config.languages[code].locale} />
      ))}
      {image ? <meta property="og:image" content={`${siteUrl}${image}`} /> : null}
      {isArticle && meta.date ? <meta property="article:published_time" content={meta.date} /> : null}
      {isArticle ? <meta property="article:author" content={config.author.name} /> : null}
      <meta name="twitter:card" content={image ? 'summary_large_image' : 'summary'} />
      <JsonLd data={{ '@context': 'https://schema.org', '@graph': graph }} />
    </>
  );
}
