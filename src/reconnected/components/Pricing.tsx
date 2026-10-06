'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parsePricing } from '../lib/parse';
import { InlineText, Md, SectionTitle } from './ui';

/**
 * `### Tier` + `**price** unit` + description → tier cards.
 * With an odd number of tiers, the middle one is highlighted as the reference.
 */
export default function Pricing({ content }: MarkdownBlockProps) {
  const { title, intro, tiers, note } = parsePricing(content);
  const featured = tiers.length % 2 === 1 ? Math.floor(tiers.length / 2) : -1;

  return (
    <section className="rc-block rc-pricing rc-surface--soft">
      <div className="rc-container">
        {title ? (
          <SectionTitle centered>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead rc-lead--center" />
        <ul className="rc-pricing__grid">
          {tiers.map((tier, index) => (
            <li
              key={tier.name}
              className={index === featured ? 'rc-tier rc-tier--featured' : 'rc-tier'}
            >
              <h3 className="rc-tier__name">{tier.name}</h3>
              <p className="rc-tier__price">
                <span className="rc-tier__amount">{tier.price}</span>
                {tier.unit ? <span className="rc-tier__unit"> {tier.unit}</span> : null}
              </p>
              <Md content={tier.body} className="rc-tier__body" />
            </li>
          ))}
        </ul>
        <Md content={note} className="rc-lead rc-lead--center rc-pricing__note" />
      </div>
    </section>
  );
}
