'use client';

import { useEffect, type ReactNode } from 'react';
import type { ContentManifest } from '@lefolio/engine/template';
import { SiteProvider, useSite, type SiteConfig } from '../lib/site';
import Header from './Header';
import Footer from './Footer';

/** Old one-page site anchors (`/#hakomi`) → their new pages. */
function LegacyAnchorRedirect() {
  const { pathname, config } = useSite();

  useEffect(() => {
    if (pathname !== '/') return;
    const target = config.legacyAnchors?.[window.location.hash];
    if (target) window.location.replace(target);
  }, [pathname, config.legacyAnchors]);

  return null;
}

export default function SiteShell({
  manifest,
  children,
}: {
  manifest: ContentManifest;
  children: ReactNode;
}) {
  return (
    <SiteProvider
      config={manifest.config as SiteConfig}
      basePath={manifest.basePath}
      avatar={manifest.authorAvatar}
    >
      <LegacyAnchorRedirect />
      <div className="rc-shell">
        <Header />
        <main id="contenu" className="rc-main">
          {children}
        </main>
        <Footer />
      </div>
    </SiteProvider>
  );
}
