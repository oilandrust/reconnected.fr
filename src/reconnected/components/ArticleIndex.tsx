'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { splitByHeading } from '@lefolio/engine/parse';
import { parseKeyValues, stripComments } from '../lib/parse';
import { InlineText, Md } from './ui';

interface ArticleEntry {
  title: string;
  date: string | null;
  datetime: string | null;
  href: string | null;
  excerpt: string;
}

function parseEntries(content: string): { intro: string; entries: ArticleEntry[] } {
  const source = stripComments(content);
  const { intro, sections } = splitByHeading(source, 2);
  const entries = sections.map((section) => {
    const metaLines: string[] = [];
    const bodyLines: string[] = [];
    let inMeta = true;
    for (const line of section.body.split('\n')) {
      if (inMeta && /^\s*[\w-]+\s*:/.test(line)) {
        metaLines.push(line);
        continue;
      }
      if (inMeta && !line.trim()) {
        if (metaLines.length) continue;
        inMeta = false;
        continue;
      }
      inMeta = false;
      bodyLines.push(line);
    }
    const meta = parseKeyValues(metaLines.join('\n'));
    return {
      title: section.title,
      date: meta.date ?? null,
      datetime: meta.datetime ?? null,
      href: meta.href ?? null,
      excerpt: bodyLines.join('\n').trim(),
    };
  });
  return { intro: intro.trim(), entries };
}

/** Listing of article cards. Each `##` is one article, with date/href meta lines. */
export default function ArticleIndex({ content }: MarkdownBlockProps) {
  const { intro, entries } = parseEntries(content);
  const heading = intro.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? null;
  const lead = intro.replace(/^#\s+.+\n*/, '').trim();

  return (
    <section className="rc-block rc-article-index">
      <div className="rc-container rc-container--narrow">
        {heading ? (
          <h1 className="rc-article__title">
            <InlineText text={heading} />
          </h1>
        ) : null}
        {lead ? <Md content={lead} className="rc-lead" /> : null}
        <ul className="rc-article-index__list">
          {entries.map((entry) => {
            const inner = (
              <>
                {entry.date ? (
                  <time className="rc-article-index__date" dateTime={entry.datetime || undefined}>
                    {entry.date}
                  </time>
                ) : null}
                <h2 className="rc-article-index__title">
                  <InlineText text={entry.title} />
                </h2>
                {entry.excerpt ? <Md content={entry.excerpt} className="rc-article-index__excerpt" /> : null}
              </>
            );
            return (
              <li key={entry.href || entry.title}>
                {entry.href ? (
                  <a className="rc-article-index__item" href={entry.href}>
                    {inner}
                  </a>
                ) : (
                  <div className="rc-article-index__item">{inner}</div>
                )}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
