'use client';

import { useCallback } from 'react';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { openCalBooking } from '../lib/calcom';
import { parseSection } from '../lib/parse';
import { useSite, type BookingEvent, type Lang } from '../lib/site';
import { Actions, Figure, InlineText, Md, SectionTitle } from './ui';

const PENDING = {
  fr: 'La réservation en ligne arrive bientôt. En attendant, écrivez-moi ou appelez-moi.',
  en: 'Online booking is coming soon. In the meantime, email or call me.',
};

function eventCopy(event: BookingEvent, lang: Lang) {
  return event[lang] ?? event.fr;
}

/**
 * Booking chooser for Cal.com event types (`contact.events` in config.yaml).
 * Kept under the `::: calendly` block id so existing Contact pages keep working.
 */
export default function Calendly({ content }: MarkdownBlockProps) {
  const { config, lang } = useSite();
  const { title, body, image, actions } = parseSection(content);
  const events = config.contact.events ?? [];

  const openEvent = useCallback((href: string) => {
    openCalBooking(href);
  }, []);

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
      <p className="rc-calendly__pending">{PENDING[lang]}</p>
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

        <Actions actions={actions} />
      </div>
    </section>
  );
}
