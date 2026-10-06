'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { Actions, InlineText, Md, SectionTitle } from './ui';

/** `1. **Step.** text` ordered list → numbered path. */
export default function Steps({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro, actions } = parseList(content, true);

  return (
    <section className="rc-block rc-steps rc-surface--soft">
      <div className="rc-container">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead" />
        <ol className="rc-steps__list">
          {items.map((item, index) => (
            <li key={index} className="rc-step">
              <span className="rc-step__number" aria-hidden="true">
                {index + 1}
              </span>
              <div>
                {item.lead ? (
                  <h3 className="rc-h3">
                    <InlineText text={item.lead} />
                  </h3>
                ) : null}
                <Md content={item.text} />
              </div>
            </li>
          ))}
        </ol>
        <Md content={outro} className="rc-prose rc-steps__outro" />
        <Actions actions={actions} />
      </div>
    </section>
  );
}
