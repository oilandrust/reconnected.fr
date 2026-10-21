'use client';

import { useId, useState, type FormEvent } from 'react';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseList } from '../lib/parse';
import { useSite, type Lang } from '../lib/site';
import { InlineText, Md, SectionTitle, SmartLink } from './ui';

const LABELS = {
  fr: {
    formTitle: 'Écrire un message',
    name: 'Nom',
    email: 'E-mail',
    phone: 'Téléphone (facultatif)',
    message: 'Message',
    submit: 'Envoyer',
    sending: 'Envoi…',
    sent: 'Merci, votre message est bien envoyé. Je vous réponds en général sous 48 h.',
    error: "Le message n'a pas pu être envoyé. Écrivez-moi directement par e-mail.",
    privacy: 'Vos informations servent uniquement à vous répondre.',
    subject: 'Message depuis re-connected.fr',
  },
  en: {
    formTitle: 'Send a message',
    name: 'Name',
    email: 'Email',
    phone: 'Phone (optional)',
    message: 'Message',
    submit: 'Send',
    sending: 'Sending…',
    sent: 'Thank you, your message has been sent. I usually reply within 48 hours.',
    error: "Your message couldn't be sent. Please email me directly.",
    privacy: 'Your details are only used to reply to you.',
    subject: 'Message from re-connected.fr',
  },
} satisfies Record<Lang, Record<string, string>>;

type Status = 'idle' | 'sending' | 'sent' | 'error';

function ContactForm() {
  const { config, lang } = useSite();
  const labels = LABELS[lang];
  const id = useId();
  const [status, setStatus] = useState<Status>('idle');
  const endpoint = config.contact.form?.trim();

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    if (data.get('_gotcha')) return;

    if (!endpoint) {
      const body = [data.get('message'), '', data.get('name'), data.get('email'), data.get('phone')]
        .filter((line) => line !== null)
        .join('\n')
        .trim();
      const query = `subject=${encodeURIComponent(labels.subject)}&body=${encodeURIComponent(body)}`;
      window.location.href = `mailto:${config.contact.email}?${query}`;
      return;
    }

    setStatus('sending');
    data.set('_subject', labels.subject);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        body: data,
        headers: { Accept: 'application/json' },
      });
      if (!response.ok) throw new Error(String(response.status));
      form.reset();
      setStatus('sent');
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <p className="rc-form__status" role="status">
        {labels.sent}
      </p>
    );
  }

  return (
    <form className="rc-form" onSubmit={onSubmit} aria-labelledby={`${id}-title`}>
      <h3 id={`${id}-title`} className="rc-h3">
        {labels.formTitle}
      </h3>
      <div className="rc-form__row">
        <label className="rc-form__field">
          <span>{labels.name}</span>
          <input name="name" type="text" autoComplete="name" required />
        </label>
        <label className="rc-form__field">
          <span>{labels.email}</span>
          <input name="email" type="email" autoComplete="email" required />
        </label>
      </div>
      <label className="rc-form__field">
        <span>{labels.phone}</span>
        <input name="phone" type="tel" autoComplete="tel" />
      </label>
      <label className="rc-form__field">
        <span>{labels.message}</span>
        <textarea name="message" rows={6} required />
      </label>
      <input name="_gotcha" type="text" tabIndex={-1} autoComplete="off" className="rc-form__trap" aria-hidden="true" />
      <p className="rc-form__privacy">{labels.privacy}</p>
      {status === 'error' ? (
        <p className="rc-form__status rc-form__status--error" role="alert">
          {labels.error}
        </p>
      ) : null}
      <div className="rc-actions">
        <button type="submit" className="rc-button" disabled={status === 'sending'}>
          {status === 'sending' ? labels.sending : labels.submit}
        </button>
      </div>
    </form>
  );
}

const SINGLE_LINK = /^\[([^\]]+)\]\(([^)\s]+)\)$/;

/** The engine's markdown sanitizer drops `tel:` URLs, so a lone link is rendered directly. */
function ContactValue({ text }: { text: string }) {
  const link = SINGLE_LINK.exec(text.trim());
  if (!link) return <Md content={text} />;
  return (
    <p className="rc-contact__value">
      <SmartLink href={link[2]}>{link[1]}</SmartLink>
    </p>
  );
}

/** `- **Par e-mail** · [address](#email)` contact methods beside a message form. */
export default function Contact({ content }: MarkdownBlockProps) {
  const { title, intro, items, outro } = parseList(content);

  return (
    <section className="rc-block rc-contact">
      <div className="rc-container rc-contact__inner">
        <div className="rc-contact__methods">
          {title ? (
            <SectionTitle>
              <InlineText text={title} />
            </SectionTitle>
          ) : null}
          <Md content={intro} className="rc-lead" />
          <dl className="rc-contact__list">
            {items.map((item, index) => (
              <div key={index} className="rc-contact__item">
                <dt className="rc-facts__label">
                  <InlineText text={item.lead || item.text} />
                </dt>
                {item.lead && item.text ? (
                  <dd>
                    <ContactValue text={item.text} />
                  </dd>
                ) : null}
              </div>
            ))}
          </dl>
          <Md content={outro} className="rc-contact__outro" />
        </div>
        <ContactForm />
      </div>
    </section>
  );
}
