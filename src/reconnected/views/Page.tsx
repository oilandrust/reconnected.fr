'use client';

import { MarkdownBody } from '@lefolio/engine/markdown';
import type {
  TemplateContentPageProps,
  TemplateHomeProps,
  TemplateSectionIndexProps,
  TemplateStandalonePageProps,
} from '@lefolio/engine/template';
import { resolveSpecialHrefs, useSite } from '../lib/site';

/**
 * Every route renders its note body as a stack of `:::` blocks. Plain markdown
 * between blocks (e.g. the legal notice) is styled as narrow prose.
 */
function PageBody({ body }: { body: string }) {
  const { config, lang } = useSite();
  return (
    <div className="rc-page">
      <MarkdownBody content={resolveSpecialHrefs(body, config, lang)} />
    </div>
  );
}

export function HomeView({ manifest }: TemplateHomeProps) {
  return <PageBody body={manifest.home?.processedBody ?? ''} />;
}

/** `En/En.md` is the English home page at `/en/`. */
export function SectionIndexView({ section }: TemplateSectionIndexProps) {
  return <PageBody body={section.index?.processedBody ?? ''} />;
}

export function StandalonePageView({ page }: TemplateStandalonePageProps) {
  return <PageBody body={page.processedBody} />;
}

export function ContentPageView({ page }: TemplateContentPageProps) {
  return <PageBody body={page.processedBody} />;
}
