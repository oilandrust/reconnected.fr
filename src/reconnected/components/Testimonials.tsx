'use client';

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from 'react';
import type { MarkdownBlockProps } from '@lefolio/engine/template';
import { parseTestimonials } from '../lib/parse';
import { useSite } from '../lib/site';
import { InlineText, Md, SectionTitle } from './ui';

const AUTO_MS = 7000;
const FADE_MS = 320;

const LABELS = {
  fr: { prev: 'Témoignage précédent', next: 'Témoignage suivant', region: 'Témoignages' },
  en: { prev: 'Previous testimonial', next: 'Next testimonial', region: 'Testimonials' },
};

function Quote({ name, quote }: { name: string; quote: string }) {
  return (
    <figure className="rc-quote">
      <blockquote className="rc-quote__text">
        <Md content={quote} />
      </blockquote>
      <figcaption className="rc-quote__name">— {name}</figcaption>
    </figure>
  );
}

/** `### Name` + `> quote` → one quote at a time, with arrows and auto-advance. */
export default function Testimonials({ content }: MarkdownBlockProps) {
  const { lang } = useSite();
  const labels = LABELS[lang];
  const { title, intro, items } = parseTestimonials(content);
  const [index, setIndex] = useState(0);
  const [outgoing, setOutgoing] = useState<number | null>(null);
  const [stageHeight, setStageHeight] = useState<number | undefined>();
  const regionId = useId();
  const count = items.length;
  const measureRef = useRef<HTMLDivElement>(null);
  const indexRef = useRef(0);
  const pausedRef = useRef(false);
  const animatingRef = useRef(false);
  const reduceMotionRef = useRef(false);

  indexRef.current = index;

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;

    const measure = () => {
      const heights = Array.from(root.children, (child) => (child as HTMLElement).offsetHeight);
      setStageHeight(Math.max(0, ...heights));
    };

    measure();
    const observer = new ResizeObserver(measure);
    for (const child of root.children) observer.observe(child);
    return () => observer.disconnect();
  }, [items]);

  useEffect(() => {
    reduceMotionRef.current = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  }, []);

  const go = useCallback(
    (delta: number) => {
      if (count < 2 || animatingRef.current) return;
      const current = indexRef.current;
      const next = (current + delta + count) % count;
      if (next === current) return;

      if (reduceMotionRef.current) {
        setIndex(next);
        return;
      }

      animatingRef.current = true;
      setOutgoing(current);
      setIndex(next);
      window.setTimeout(() => {
        setOutgoing(null);
        animatingRef.current = false;
      }, FADE_MS);
    },
    [count],
  );

  useEffect(() => {
    if (count < 2) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const id = window.setInterval(() => {
      if (!pausedRef.current) go(1);
    }, AUTO_MS);
    return () => window.clearInterval(id);
  }, [count, go]);

  const current = items[index];
  if (!current) return null;

  const pause = () => {
    pausedRef.current = true;
  };
  const resume = () => {
    pausedRef.current = false;
  };

  return (
    <section className="rc-block rc-testimonials">
      <div className="rc-container rc-container--narrow">
        {title ? (
          <SectionTitle centered>
            <InlineText text={title} />
          </SectionTitle>
        ) : null}
        <Md content={intro} className="rc-lead rc-lead--center rc-testimonials__intro" />

        <div
          className="rc-testimonials__carousel"
          role="region"
          aria-roledescription="carousel"
          aria-label={title ?? labels.region}
          id={regionId}
          onMouseEnter={pause}
          onMouseLeave={resume}
          onFocusCapture={pause}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) resume();
          }}
        >
          {count > 1 ? (
            <button type="button" className="rc-testimonials__nav" onClick={() => go(-1)} aria-label={labels.prev}>
              <span aria-hidden="true">‹</span>
            </button>
          ) : null}

          <div
            className="rc-testimonials__stage"
            aria-live="polite"
            aria-atomic="true"
            style={stageHeight ? { height: stageHeight } : undefined}
          >
            {/* Invisible copies so the stage keeps the tallest quote's height. */}
            <div className="rc-testimonials__measure" ref={measureRef} aria-hidden="true">
              {items.map((entry) => (
                <div key={`measure-${entry.name}`} className="rc-testimonials__measure-item">
                  <Quote name={entry.name} quote={entry.quote} />
                </div>
              ))}
            </div>

            {outgoing !== null && items[outgoing] ? (
              <div className="rc-testimonials__slide is-out" aria-hidden="true">
                <Quote name={items[outgoing].name} quote={items[outgoing].quote} />
              </div>
            ) : null}

            <div className={`rc-testimonials__slide${outgoing !== null ? ' is-in' : ''}`} key={current.name}>
              <Quote name={current.name} quote={current.quote} />
            </div>
          </div>

          {count > 1 ? (
            <button type="button" className="rc-testimonials__nav" onClick={() => go(1)} aria-label={labels.next}>
              <span aria-hidden="true">›</span>
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
