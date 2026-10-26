'use client';

import { stripImages } from '@lefolio/engine/parse';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { extractImage, parseList } from '../lib/parse';
import { useSite } from '../lib/site';
import { Actions, Figure, InlineText, Md, SectionTitle } from './ui';

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
 * An optional `map: address` line or `![[image]]` puts media beside the facts.
 */
export default function Facts({ content }: MarkdownBlockProps) {
  const address = MAP_LINE.exec(content)?.[1].trim() ?? null;
  const image = address ? null : extractImage(content);
  const { title, intro, items, outro, actions } = parseList(
    stripImages(content.replace(MAP_LINE, '')),
  );

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
      <Actions actions={actions} primaryFirst={false} />
    </div>
  );

  const media = address ? (
    <MapEmbed address={address} />
  ) : image ? (
    <div className="rc-facts__media">
      <Figure image={image} />
    </div>
  ) : null;

  return (
    <section className={media ? 'rc-block rc-facts rc-facts--media' : 'rc-block rc-facts'}>
      <div className="rc-container rc-facts__inner">
        {facts}
        {media}
      </div>
    </section>
  );
}
