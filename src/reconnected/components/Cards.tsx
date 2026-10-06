'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseCards } from '../lib/parse';
import { Actions, InlineText, Md, SectionTitle } from './ui';

/** `### Card` sections, or `- **Title**: text` items → card grid. */
export default function Cards({ content }: MarkdownBlockProps) {
  const { title, intro, cards, outro } = parseCards(content);

  return (
    <section className="rc-block rc-cards">
      <div className="rc-container">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead" />
        <ul className={`rc-cards__grid rc-cards__grid--${Math.min(cards.length, 4)}`}>
          {cards.map((card, index) => (
            <li key={index} className="rc-card">
              {card.title ? (
                <h3 className="rc-h3">
                  <InlineText text={card.title} />
                </h3>
              ) : null}
              <Md content={card.body} />
              <Actions actions={card.actions} />
            </li>
          ))}
        </ul>
        <Md content={outro} className="rc-prose rc-cards__outro" />
      </div>
    </section>
  );
}
