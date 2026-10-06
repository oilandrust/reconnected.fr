'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseSection } from '../lib/parse';
import { Actions, InlineText, Md } from './ui';

/** Closing call-to-action band. An optional image becomes a soft backdrop. */
export default function Cta({ content }: MarkdownBlockProps) {
  const { title, body, image, actions } = parseSection(content);

  return (
    <section
      className="rc-block rc-cta rc-surface--deep"
      style={image ? { ['--rc-cta-image' as string]: `url("${image.src}")` } : undefined}
    >
      <div className="rc-container rc-container--narrow rc-cta__inner">
        {title ? (
          <h2 className="rc-h2 rc-h2--center">
            <InlineText text={title} />
          </h2>
        ) : null}
        <Md content={body} className="rc-lead rc-lead--center" />
        <Actions actions={actions} align="center" tone="dark" />
      </div>
    </section>
  );
}
