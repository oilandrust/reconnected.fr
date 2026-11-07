import type { Metadata } from 'next';
import { loadManifest } from '@lefolio/engine/content';
import { metadataForHref } from '@lefolio/engine/seo';
import { HomeView } from '@/views/Page';

export function generateMetadata(): Metadata {
  return metadataForHref(loadManifest(), '/');
}

export default function HomePage() {
  return <HomeView manifest={loadManifest()} />;
}
