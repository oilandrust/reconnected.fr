'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { Actions, InlineText, Md, SectionTitle } from './ui';

/** `- **Label** · detail` items → grid of key facts (practical details). */
export default function Facts({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro, actions } = parseList(content);

  return (
    <section className="rc-block rc-facts">
      <div className="rc-container">
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
    </section>
  );
}
