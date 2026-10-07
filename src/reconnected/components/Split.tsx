'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseSection } from '../lib/parse';
import { Actions, Figure, InlineText, Md, SectionTitle } from './ui';

/**
 * Text section with an optional image. The image side follows the source:
 * image before `## Title` → image on the left; after → on the right.
 */
export default function Split({ content }: MarkdownBlockProps) {
  const { title, body, image, imageFirst, actions } = parseSection(content);
  const layout = image ? (imageFirst ? 'rc-split--media-start' : 'rc-split--media-end') : 'rc-split--text';

  return (
    <section className={`rc-block rc-split ${layout}`}>
      <div className="rc-container rc-split__inner">
        <div className="rc-split__copy">
          {title ? (
            <SectionTitle>
              <InlineText text={title} />
            </SectionTitle>
          ) : null}
          <Md content={body} className="rc-prose" />
          <Actions actions={actions} />
        </div>
        {image ? (
          <div className="rc-split__media">
            <Figure image={image} className="rc-figure--square" />
          </div>
        ) : null}
      </div>
    </section>
  );
}
