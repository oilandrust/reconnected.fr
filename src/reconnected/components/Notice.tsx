'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseSection } from '../lib/parse';
import { Actions, InlineText, Md } from './ui';

/** Framed note (limits of the work, safety information). */
export default function Notice({ content }: MarkdownBlockProps) {
  const { title, body, actions } = parseSection(content);

  return (
    <section className="rc-block rc-notice">
      <div className="rc-container rc-container--narrow">
        <div className="rc-notice__box" role="note">
          {title ? (
            <h2 className="rc-h3">
              <InlineText text={title} />
            </h2>
          ) : null}
          <Md content={body} />
          <Actions actions={actions} />
        </div>
      </div>
    </section>
  );
}
