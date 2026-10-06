'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { Actions, InlineText, Md, SectionTitle } from './ui';

function Leaf() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 19c0-8 5-13 14-14-1 9-6 14-14 14Zm0 0 7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** `## Title` + bullet list → soft cards ("you might recognise yourself"). */
export default function Checklist({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro, actions } = parseList(content);

  return (
    <section className="rc-block rc-checklist rc-surface--soft">
      <div className="rc-container">
        {title ? (
          <SectionTitle centered>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead rc-lead--center" />
        <ul className="rc-checklist__grid">
          {items.map((item, index) => (
            <li key={index} className="rc-checklist__item">
              <span className="rc-checklist__icon">
                <Leaf />
              </span>
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
