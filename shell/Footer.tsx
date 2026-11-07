'use client';

import { toLinks, useSite, type Lang } from '../lib/site';
import { SmartLink } from '../components/ui';
import BrandName from './BrandName';
import { LanguageSwitch } from './Header';

/** `+33662913203` → `06 62 91 32 03` (fr) or `+33 6 62 91 32 03` (en). */
function formatPhone(phone: string, lang: Lang): string {
  const french = /^\+33(\d)(\d{8})$/.exec(phone.replace(/\s/g, ''));
  if (!french) return phone;
  const pairs = french[2].match(/\d{2}/g)!.join(' ');
  return lang === 'fr' ? `0${french[1]} ${pairs}` : `+33 ${french[1]} ${pairs}`;
}

export default function Footer() {
  const { config, language, lang } = useSite();
  const { email, phone } = config.contact;

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
            {phone ? (
              <>
                <br />
                <a href={`tel:${phone}`}>{formatPhone(phone, lang)}</a>
              </>
            ) : null}
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
