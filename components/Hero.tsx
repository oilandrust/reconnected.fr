'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/markdown';
import { parseHero } from '../lib/parse';
import { Actions, Figure, InlineText, Md } from './ui';

/** Page opener. With an image: two columns (home, about); without: page header. */
export default function Hero({ content }: MarkdownBlockProps) {
  const { eyebrow, title, subtitle, body, image, actions } = parseHero(content);
  const withImage = Boolean(image);

  return (
    <section className={`rc-block rc-hero${withImage ? ' rc-hero--media' : ''}`}>
      <div className="rc-container rc-hero__inner">
        <div className="rc-hero__copy">
          {eyebrow ? <h1 className="rc-eyebrow">{eyebrow}</h1> : null}
          {title ? (
            eyebrow ? (
              <p className="rc-h1">
                <InlineText text={title} />
              </p>
            ) : (
              <h1 className="rc-h1">
                <InlineText text={title} />
              </h1>
            )
          ) : null}
          {subtitle ? (
            <p className="rc-hero__subtitle">
              <InlineText text={subtitle} />
            </p>
          ) : null}
          <Md content={body} className="rc-hero__body" />
          <Actions actions={actions} />
        </div>
        {image ? (
          <div className="rc-hero__media">
            <Figure image={image} className="rc-figure--square" priority />
          </div>
        ) : null}
      </div>
    </section>
  );
}
