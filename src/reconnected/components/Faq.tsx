'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseFaq, plainText } from '../lib/parse';
import { useSite } from '../lib/site';
import { JsonLd } from './JsonLd';
import { InlineText, Md, SectionTitle } from './ui';

/** `### Question` + answer → accordion, plus FAQPage structured data. */
export default function Faq({ content }: MarkdownBlockProps) {
  const { title, intro, items } = parseFaq(content);
  const { lang } = useSite();

  return (
    <section className="rc-block rc-faq">
      <div className="rc-container rc-container--narrow">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead" />
        <div className="rc-faq__list">
          {items.map((item, index) => (
            <details key={item.question} className="rc-faq__item" open={index === 0}>
              <summary className="rc-faq__question">
                <InlineText text={item.question} />
              </summary>
              <Md content={item.answer} className="rc-faq__answer" />
            </details>
          ))}
        </div>
      </div>
      <JsonLd
        data={{
          '@context': 'https://schema.org',
          '@type': 'FAQPage',
          inLanguage: lang,
          mainEntity: items.map((item) => ({
            '@type': 'Question',
            name: plainText(item.question),
            acceptedAnswer: { '@type': 'Answer', text: plainText(item.answer) },
          })),
        }}
      />
    </section>
  );
}
