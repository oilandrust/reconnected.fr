'use client';

import Script from 'next/script';
import { useSite } from '../lib/site';

/** Privacy-friendly, cookieless pageviews (`analytics.goatcounter` in config.yaml). */
export default function GoatCounter() {
  const { config } = useSite();
  const endpoint = config.analytics?.goatcounter?.trim();
  if (!endpoint) return null;

  return (
    <Script
      src="https://gc.zgo.at/count.js"
      data-goatcounter={endpoint}
      strategy="afterInteractive"
      async
    />
  );
}
