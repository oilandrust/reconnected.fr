'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { Actions, InlineText, Md, SectionTitle } from './ui';

/** `## Title` + bullet list → a quiet list with a gold rule. */
export default function Checklist({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro, actions } = parseList(content);

  return (
    <section className="rc-block rc-checklist">
      <div className="rc-container">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead" />
        <ul className="rc-checklist__grid">
          {items.map((item, index) => (
            <li key={index} className="rc-checklist__item">
              <Md content={item.lead ? `**${item.lead}** ${item.text}` : item.text} />
            </li>
          ))}
        </ul>
        <Md content={outro} className="rc-lead rc-lead--center" />
        <Actions actions={actions} align="center" />
      </div>
    </section>
  );
}
