'use client';

import { useEffect, useRef } from 'react';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseSection } from '../lib/parse';
import { useSite } from '../lib/site';
import { Actions, InlineText, Md, SectionTitle } from './ui';

const WIDGET_SRC = 'https://assets.calendly.com/assets/external/widget.js';

declare global {
  interface Window {
    Calendly?: { initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void };
  }
}

const LABELS = {
  fr: {
    open: "Ouvrir l'agenda dans un nouvel onglet",
    pending: 'La réservation en ligne arrive bientôt. En attendant, écrivez-moi ou appelez-moi.',
  },
  en: {
    open: 'Open the calendar in a new tab',
    pending: 'Online booking is coming soon. In the meantime, email or call me.',
  },
};

let widgetScript: Promise<void> | null = null;

function loadWidget(): Promise<void> {
  widgetScript ??= new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = WIDGET_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      widgetScript = null;
      reject(new Error('Calendly widget failed to load'));
    };
    document.body.appendChild(script);
  });
  return widgetScript;
}

/** Calendly scheduling page (`contact.calendly` in config.yaml) embedded inline. */
export default function Calendly({ content }: MarkdownBlockProps) {
  const { config, lang } = useSite();
  const { title, body, actions } = parseSection(content);
  const url = config.contact.calendly?.trim();
  const frame = useRef<HTMLDivElement>(null);
  const labels = LABELS[lang];

  useEffect(() => {
    const parentElement = frame.current;
    if (!url || !parentElement) return;
    let cancelled = false;
    loadWidget()
      .then(() => {
        if (cancelled || !window.Calendly) return;
        parentElement.replaceChildren();
        window.Calendly.initInlineWidget({ url, parentElement });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [url]);

  return (
    <section className="rc-block rc-calendly">
      <div className="rc-container">
        {title ? (
          <SectionTitle>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={body} className="rc-lead" />
        {url ? (
          <>
            <div ref={frame} className="rc-calendly__frame" />
            <p className="rc-calendly__fallback">
              <a href={url} target="_blank" rel="noopener noreferrer">
                {labels.open}
              </a>
            </p>
          </>
        ) : (
          <p className="rc-calendly__pending">{labels.pending}</p>
        )}
        <Actions actions={actions} />
      </div>
    </section>
  );
}
