'use client';

import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { firstHeading, stripHeading } from '@lefolio/engine/parse';
import { parseKeyValues, stripComments } from '../lib/parse';
import { InlineText, Md } from './ui';

/**
 * Long-form article body.
 *
 * ```
 * ::: article
 * # Title
 * date: 27 octobre 2026          # optional meta lines before the first ##
 * kicker: Thérapie somatique
 *
 * ## Section…
 * :::
 * ```
 */
export default function Article({ content }: MarkdownBlockProps) {
  const source = stripComments(content);
  const title = firstHeading(source, 1);
  let rest = stripHeading(source, title);

  const metaLines: string[] = [];
  const bodyLines: string[] = [];
  let inMeta = true;
  for (const line of rest.split('\n')) {
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
  const body = bodyLines.join('\n').trim();
  const date = meta.date ?? null;
  const kicker = meta.kicker ?? null;

  return (
    <article className="rc-block rc-article">
      <div className="rc-container rc-container--narrow">
        <header className="rc-article__header">
          {kicker ? <p className="rc-article__kicker">{kicker}</p> : null}
          {title ? (
            <h1 className="rc-article__title">
              <InlineText text={title} />
            </h1>
          ) : null}
          {date ? (
            <p className="rc-article__byline">
              <time dateTime={meta.datetime || undefined}>{date}</time>
            </p>
          ) : null}
        </header>
        <Md content={body} className="rc-article__body" />
      </div>
    </article>
  );
}
