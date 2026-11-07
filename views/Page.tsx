'use client';

import type { ContentManifest, ManifestPage, NavSection, StandalonePage } from '@lefolio/engine/content';
import { MarkdownBody } from '@lefolio/engine/markdown';
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

export function HomeView({ manifest }: { manifest: ContentManifest }) {
  return <PageBody body={manifest.home?.processedBody ?? ''} />;
}

/** `En/En.md` is the English home page at `/en/`. */
export function SectionIndexView({ section }: { section: NavSection }) {
  return <PageBody body={section.index?.processedBody ?? ''} />;
}

export function StandalonePageView({ page }: { page: StandalonePage }) {
  return <PageBody body={page.processedBody} />;
}

export function ContentPageView({ page }: { page: ManifestPage }) {
  return <PageBody body={page.processedBody} />;
}
