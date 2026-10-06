'use client';

import { toLinks, useSite } from '../lib/site';
import { SmartLink } from '../components/ui';
import BrandName from './BrandName';
import { LanguageSwitch } from './Header';

export default function Footer() {
  const { config, language, lang } = useSite();
  const email = config.contact.email;

  return (
    <footer className="rc-footer">
      <div className="rc-container rc-footer__inner">
        <div className="rc-footer__identity">
          <p className="rc-footer__brand">
            <BrandName name={config.brand} />
          </p>
          <p>{language.tagline}</p>
          <p>
            <a href={`mailto:${email}`}>{email}</a>
          </p>
        </div>

        <nav className="rc-footer__nav" aria-label={lang === 'fr' ? 'Pied de page' : 'Footer'}>
          <ul>
            {toLinks(language.menu).map((item) => (
              <li key={item.href}>
                <SmartLink href={item.href}>{item.label}</SmartLink>
              </li>
            ))}
            {toLinks(language.footer.links).map((item) => (
              <li key={item.href}>
                <SmartLink href={item.href}>{item.label}</SmartLink>
              </li>
            ))}
          </ul>
          <LanguageSwitch />
        </nav>

        <div className="rc-footer__bottom">
          <p className="rc-footer__safety" role="note">
            {language.footer.safety}
          </p>
        </div>
      </div>
    </footer>
  );
}
