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

export function isCalComUrl(url: string) {
  try {
    const host = new URL(url, typeof window === 'undefined' ? 'https://cal.com' : window.location.origin)
      .hostname;
    return host === 'cal.com' || host.endsWith('.cal.com');
  } catch {
    return false;
  }
}

/** `https://cal.com/user/event` → `user/event`. */
export function calLinkFromUrl(url: string): string {
  try {
    return new URL(url).pathname.replace(/^\/+|\/+$/g, '') || url;
  } catch {
    return url.replace(/^https?:\/\/[^/]+\/?/, '').replace(/\/+$/, '');
  }
}

/** Cal.com's modal is unreliable on touch / narrow viewports — open the page instead. */
export function prefersPageBooking() {
  return window.matchMedia('(max-width: 860px), (hover: none) and (pointer: coarse)').matches;
}

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

/** Open a Cal.com event: modal on desktop, full page on mobile / on failure. */
export function openCalBooking(href: string): void {
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
        window.location.assign(href);
      });
  }, 50);
}
