'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type { ContentConfig } from '@lefolio/engine/template';
import { slugify } from '@lefolio/engine/template';
import { stripComments, type BlockImage } from './parse';

export type Lang = 'fr' | 'en';
export const LANGS: Lang[] = ['fr', 'en'];

type LabelledLinks = Array<Record<string, string>>;

export interface BookingEventCopy {
  title: string;
  detail?: string;
  duration: string;
  cta: string;
}

/** One Cal.com event type offered on the booking block. */
export interface BookingEvent {
  href: string;
  featured?: boolean;
  fr: BookingEventCopy;
  en: BookingEventCopy;
}

export interface LanguageConfig {
  label: string;
  name: string;
  locale: string;
  jobTitle: string;
  tagline: string;
  menu: LabelledLinks;
  cta: { label: string; href: string };
  switchLabel: string;
  footer: { safety: string; links: LabelledLinks };
}

/** Site-specific keys of `Content/config.yaml` (passed through by sync). */
export interface SiteConfig extends ContentConfig {
  brand: string;
  analytics?: {
    /** GoatCounter count endpoint, e.g. https://example.goatcounter.com/count */
    goatcounter?: string;
    google?: string;
  };
  contact: {
    email: string;
    phone: string;
    address?: { street: string; postalCode: string; city: string; country: string };
    /** @deprecated Prefer `events`. Kept so older configs still resolve. */
    calcom?: string;
    /** @deprecated Prefer `events`. */
    calendly?: string;
    /** Cal.com event types shown on the booking block. */
    events?: BookingEvent[];
    form?: string;
    booking: Record<Lang, string>;
    /** Free discovery-call Cal.com URL (opened by `#discovery` CTAs). */
    discovery?: Record<Lang, string> | string;
    workshops: Record<Lang, string>;
  };
  languages: Record<Lang, LanguageConfig>;
  /** FR ↔ EN pairs; a language may be omitted for monolingual pages. */
  routes: Array<Partial<Record<Lang, string>>>;
  legacyAnchors?: Record<string, string>;
}

export interface NavLink {
  label: string;
  href: string;
  external: boolean;
}

export function toLinks(entries: LabelledLinks | undefined): NavLink[] {
  return (entries ?? []).flatMap((entry) =>
    Object.entries(entry).map(([label, href]) => ({
      label,
      href,
      external: /^(https?:|mailto:|tel:)/i.test(href),
    })),
  );
}

export function normalizePath(pathname: string | null | undefined): string {
  const path = (pathname || '/').split(/[?#]/)[0];
  return path.endsWith('/') ? path : `${path}/`;
}

export function langOf(pathname: string): Lang {
  return pathname === '/en/' || pathname.startsWith('/en/') ? 'en' : 'fr';
}

/** Equivalent page in every language (from `routes`). */
export function alternatesOf(config: SiteConfig, pathname: string): Partial<Record<Lang, string>> {
  const pair = config.routes?.find((route) => LANGS.some((lang) => route[lang] === pathname));
  return pair ?? {};
}

function discoveryUrl(contact: SiteConfig['contact'], lang: Lang): string {
  const value = contact.discovery;
  if (!value) {
    const featured =
      contact.events?.find((event) => event.featured) ??
      contact.events?.[contact.events.length - 1];
    return featured?.href ?? contact.booking[lang];
  }
  return typeof value === 'string' ? value : value[lang];
}

/** `#booking`, `#discovery`, `#email`, `#phone`, `#workshops` → real URLs for the given language. */
export function resolveSpecialHrefs(markdown: string, config: SiteConfig, lang: Lang): string {
  const { contact } = config;
  const targets: Record<string, string> = {
    '#booking': contact.booking[lang],
    '#discovery': discoveryUrl(contact, lang),
    '#email': `mailto:${contact.email}`,
    '#phone': `tel:${contact.phone}`,
    '#workshops': contact.workshops[lang],
  };
  return stripComments(markdown).replace(
    /\]\((#booking|#discovery|#email|#phone|#workshops)\)/g,
    (_, key: string) => `](${targets[key]})`,
  );
}

export function resolveHref(href: string, config: SiteConfig, lang: Lang): string {
  return resolveSpecialHrefs(`](${href})`, config, lang).slice(2, -1);
}

interface SiteContextValue {
  config: SiteConfig;
  lang: Lang;
  pathname: string;
  basePath: string;
  avatar: string | null;
}

const SiteContext = createContext<SiteContextValue | null>(null);

export function SiteProvider({
  config,
  basePath,
  avatar,
  children,
}: {
  config: SiteConfig;
  basePath: string;
  avatar: string | null;
  children: ReactNode;
}) {
  const pathname = normalizePath(usePathname());
  return (
    <SiteContext.Provider value={{ config, lang: langOf(pathname), pathname, basePath, avatar }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const value = useContext(SiteContext);
  if (!value) throw new Error('useSite() must be used inside <SiteProvider>');
  const { config, lang } = value;
  const language = config.languages[lang];

  return {
    ...value,
    language,
    href: (href: string) => resolveHref(href, config, lang),
    /** Portraits named after the author get "Name, job title"; `deco-*` get "". */
    alt: (image: BlockImage) => {
      if (image.decorative) return '';
      const author = config.author?.name ?? '';
      if (author && image.name.startsWith(slugify(author))) {
        return `${author}, ${language.jobTitle.toLowerCase()}`;
      }
      return image.alt;
    },
  };
}
