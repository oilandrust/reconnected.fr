'use client';

import { useCallback, useState } from 'react';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseSection } from '../lib/parse';
import { useSite, type BookingEvent, type Lang } from '../lib/site';
import { Actions, Figure, InlineText, Md, SectionTitle } from './ui';

const EMBED_SRC = 'https://app.cal.com/embed/embed.js';

type CalApi = ((...args: unknown[]) => void) & {
  loaded?: boolean;
  ns?: Record<string, CalApi>;
  q?: unknown[];
};

declare global {
  interface Window {
    Cal?: CalApi;
  }
}

const COPY = {
  fr: {
    pending: 'La réservation en ligne arrive bientôt. En attendant, écrivez-moi ou appelez-moi.',
    openError: 'Impossible d’ouvrir l’agenda. Réessayez, ou utilisez le lien pour ouvrir Cal.com.',
  },
  en: {
    pending: 'Online booking is coming soon. In the meantime, email or call me.',
    openError: 'Could not open the calendar. Try again, or use the link to open Cal.com.',
  },
};

/** Install Cal.com's queue stub and load embed.js (idempotent). */
function ensureCal(): Promise<CalApi> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return;

    if (!window.Cal) {
      const push = (api: CalApi, args: unknown[]) => {
        (api.q ??= []).push(args);
      };
      const Cal: CalApi = function (...args: unknown[]) {
        const cal = window.Cal!;
        if (!cal.loaded) {
          cal.ns = {};
          cal.q = cal.q || [];
          const script = document.createElement('script');
          script.src = EMBED_SRC;
          script.async = true;
          script.onerror = () => reject(new Error('Cal.com embed failed to load'));
          document.head.appendChild(script);
          cal.loaded = true;
        }
        if (args[0] === 'init') {
          const namespace = args[1];
          const api = Object.assign((...inner: unknown[]) => push(api, inner), {
            q: [] as unknown[],
          }) as CalApi;
          if (typeof namespace === 'string') {
            cal.ns ??= {};
            cal.ns[namespace] = cal.ns[namespace] || api;
            push(cal.ns[namespace], args);
            push(cal, ['initNamespace', namespace]);
          } else {
            push(cal, args);
          }
          return;
        }
        push(cal, args);
      };
      window.Cal = Cal;
    }

    const done = () => resolve(window.Cal!);
    if (document.querySelector(`script[src="${EMBED_SRC}"]`)) {
      const start = Date.now();
      const tick = () => {
        if (window.Cal) return done();
        if (Date.now() - start > 8000) return reject(new Error('Cal.com embed timed out'));
        requestAnimationFrame(tick);
      };
      tick();
      return;
    }
    done();
  });
}

/** `https://cal.com/user/event` → `user/event`. */
function calLinkFromUrl(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, '') || url;
  } catch {
    return url.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/+$/, '');
  }
}

function eventCopy(event: BookingEvent, lang: Lang) {
  return event[lang] ?? event.fr;
}

/** Cal.com's modal is unreliable on touch / narrow viewports — open the page instead. */
function prefersPageBooking() {
  return window.matchMedia('(max-width: 860px), (hover: none) and (pointer: coarse)').matches;
}

/**
 * Booking chooser for Cal.com event types (`contact.events` in config.yaml).
 * Kept under the `::: calendly` block id so existing Contact pages keep working.
 */
export default function Calendly({ content }: MarkdownBlockProps) {
  const { config, lang } = useSite();
  const { title, body, image, actions } = parseSection(content);
  const events = config.contact.events ?? [];
  const labels = COPY[lang];
  const [error, setError] = useState<string | null>(null);

  const openEvent = useCallback(
    (href: string) => {
      setError(null);

      if (prefersPageBooking()) {
        window.location.assign(href);
        return;
      }

      // Defer so the opening click/touch can't hit the modal backdrop and close it.
      window.setTimeout(() => {
        void ensureCal()
          .then((Cal) => {
            Cal('init', { origin: 'https://cal.com' });
            Cal('modal', {
              calLink: calLinkFromUrl(href),
              config: { layout: 'month_view' },
            });
          })
          .catch(() => {
            setError(labels.openError);
            window.location.assign(href);
          });
      }, 50);
    },
    [labels.openError],
  );

  const booking =
    events.length > 0 ? (
      <ul className="rc-booking">
        {events.map((event) => {
          const item = eventCopy(event, lang);
          return (
            <li
              key={event.href}
              className={event.featured ? 'rc-booking__option is-featured' : 'rc-booking__option'}
            >
              <p className="rc-booking__duration">{item.duration}</p>
              <a
                href={event.href}
                className="rc-booking__title"
                rel="noopener noreferrer"
                onClick={(click) => {
                  click.preventDefault();
                  openEvent(event.href);
                }}
              >
                {item.title}
              </a>
              {item.detail ? <p className="rc-booking__detail">{item.detail}</p> : null}
            </li>
          );
        })}
      </ul>
    ) : (
      <p className="rc-calendly__pending">{labels.pending}</p>
    );

  const main = (
    <div className="rc-calendly__main">
      {title ? (
        <SectionTitle centered={!image}>
          <InlineText text={title} />
        </SectionTitle>
      ) : null}
      <Md content={body} className={image ? 'rc-lead' : 'rc-lead rc-lead--center'} />
      {booking}
    </div>
  );

  return (
    <section className={image ? 'rc-block rc-calendly rc-calendly--media' : 'rc-block rc-calendly'} id="booking">
      <div className="rc-container">
        {image ? (
          <div className="rc-calendly__layout">
            {main}
            <div className="rc-calendly__media">
              <Figure image={image} className="rc-figure--portrait" />
            </div>
          </div>
        ) : (
          main
        )}

        {error ? (
          <p className="rc-booking__error" role="alert">
            {error}
          </p>
        ) : null}

        <Actions actions={actions} />
      </div>
    </section>
  );
}
