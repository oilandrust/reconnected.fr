'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { alternatesOf, LANGS, toLinks, useSite } from '../lib/site';
import { SmartLink } from '../components/ui';
import BrandName from './BrandName';

function isActive(pathname: string, href: string) {
  if (href === '/' || href === '/en/') return pathname === href;
  return pathname.startsWith(href);
}

export function LanguageSwitch({ onNavigate }: { onNavigate?: () => void }) {
  const { config, lang, pathname, language } = useSite();
  const alternates = alternatesOf(config, pathname);
  const other = LANGS.find((code) => code !== lang)!;
  const target = alternates[other] ?? (other === 'en' ? '/en/' : '/');

  return (
    <Link
      href={target}
      hrefLang={other}
      lang={other}
      className="rc-lang"
      title={language.switchLabel}
      aria-label={language.switchLabel}
      onClick={onNavigate}
    >
      {config.languages[other].label}
    </Link>
  );
}

const SKIP_LABEL = { fr: 'Aller au contenu', en: 'Skip to content' };
const MENU_LABEL = { fr: ['Ouvrir le menu', 'Fermer le menu'], en: ['Open menu', 'Close menu'] };

export default function Header() {
  const { config, lang, pathname, language } = useSite();
  const menuId = useId();
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);
  const home = lang === 'en' ? '/en/' : '/';

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <header className={`rc-header${open ? ' is-open' : ''}`}>
      <a className="rc-skip" href="#contenu">
        {SKIP_LABEL[lang]}
      </a>
      <div className="rc-container rc-header__inner">
        <Link href={home} className="rc-brand" onClick={close}>
          <BrandName name={config.brand} />
          <span className="rc-brand__sub">{config.author.name}</span>
        </Link>

        <button
          type="button"
          className="rc-menu-toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={MENU_LABEL[lang][open ? 1 : 0]}
          onClick={() => setOpen((value) => !value)}
        >
          <span />
          <span />
        </button>

        <nav id={menuId} className="rc-nav" aria-label={lang === 'fr' ? 'Navigation principale' : 'Main'}>
          <ul className="rc-nav__links">
            {toLinks(language.menu).map((item) => (
              <li key={item.href}>
                <SmartLink
                  href={item.href}
                  className={isActive(pathname, item.href) ? 'rc-nav__link is-active' : 'rc-nav__link'}
                  onClick={close}
                >
                  {item.label}
                  {item.external ? <span aria-hidden="true"> ↗</span> : null}
                </SmartLink>
              </li>
            ))}
          </ul>
          <div className="rc-nav__end">
            <SmartLink href={language.cta.href} className="rc-button rc-button--small" onClick={close}>
              {language.cta.label}
            </SmartLink>
            <LanguageSwitch onNavigate={close} />
          </div>
        </nav>
      </div>
    </header>
  );
}
