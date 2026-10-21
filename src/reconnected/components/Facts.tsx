'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { useSite } from '../lib/site';
import { Actions, InlineText, Md, SectionTitle } from './ui';

const MAP_LINE = /^\s*map\s*:\s*(.+)$/im;

const MAP_TITLE = { fr: 'Plan d’accès', en: 'Map' };

function MapEmbed({ address }: { address: string }) {
  const { lang } = useSite();
  const query = encodeURIComponent(address);
  return (
    <div className="rc-facts__map">
      <iframe
        src={`https://maps.google.com/maps?q=${query}&z=16&hl=${lang}&output=embed`}
        title={`${MAP_TITLE[lang]} : ${address}`}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
      />
    </div>
  );
}

/**
 * `- **Label** · detail` items → grid of key facts (practical details).
 * An optional `map: address` line puts a Google Maps embed beside the facts.
 */
export default function Facts({ content }: MarkdownBlockProps) {
  const address = MAP_LINE.exec(content)?.[1].trim() ?? null;
  const { title, intro, items, outro, actions } = parseList(content.replace(MAP_LINE, ''));

  const facts = (
    <div className="rc-facts__body">
      {title ? (
        <SectionTitle>
          <InlineText text={title} />
        </SectionTitle>
      ) : null}
      <Md content={intro} className="rc-lead" />
      <dl className="rc-facts__grid">
        {items.map((item, index) => (
          <div key={index} className="rc-facts__item">
            <dt className="rc-facts__label">
              <InlineText text={item.lead || item.text} />
            </dt>
            {item.lead && item.text ? (
              <dd className="rc-facts__text">
                <Md content={item.text} />
              </dd>
            ) : null}
          </div>
        ))}
      </dl>
      <Md content={outro} className="rc-lead" />
      <Actions actions={actions} />
    </div>
  );

  return (
    <section className={address ? 'rc-block rc-facts rc-facts--map' : 'rc-block rc-facts'}>
      <div className="rc-container rc-facts__inner">
        {facts}
        {address ? <MapEmbed address={address} /> : null}
      </div>
    </section>
  );
}
