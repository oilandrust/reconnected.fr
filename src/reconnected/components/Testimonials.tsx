'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseTestimonials } from '../lib/parse';
import { InlineText, Md, SectionTitle } from './ui';

/** `### Name` + `> quote` → quote cards on a deep background. */
export default function Testimonials({ content }: MarkdownBlockProps) {
  const { title, intro, items } = parseTestimonials(content);

  return (
    <section className="rc-block rc-testimonials rc-surface--deep">
      <div className="rc-container">
        {title ? (
          <SectionTitle centered>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead rc-lead--center rc-testimonials__intro" />
        <ul className="rc-testimonials__grid">
          {items.map((item) => (
            <li key={item.name} className="rc-quote">
              <span className="rc-quote__mark" aria-hidden="true">
                “
              </span>
              <blockquote className="rc-quote__text">
                <Md content={item.quote} />
              </blockquote>
              <p className="rc-quote__name">— {item.name}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
