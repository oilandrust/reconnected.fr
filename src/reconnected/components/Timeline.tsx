'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { InlineText, Md, SectionTitle } from './ui';

/** `- **2024–2025** : text` → dated list (trainings). */
export default function Timeline({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro } = parseList(content);

  return (
    <section className="rc-block rc-timeline">
      <div className="rc-container rc-container--narrow">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead" />
        <ol className="rc-timeline__list">
          {items.map((item, index) => (
            <li key={index} className="rc-timeline__item">
              <span className="rc-timeline__date">{item.lead}</span>
              <Md content={item.text} className="rc-timeline__text" />
            </li>
          ))}
        </ol>
        <Md content={outro} className="rc-lead" />
      </div>
    </section>
  );
}
