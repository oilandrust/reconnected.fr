'use client';

import Link from 'next/link';
import type { ReactNode } from 'react';
import { MarkdownBody } from '@lefolio/engine/markdown';
import type { BlockImage, MdLink } from '../lib/parse';
import { useSite } from '../lib/site';

/** Render a markdown fragment (no nested `:::` processing). */
export function Md({ content, className }: { content: string; className?: string }) {
  if (!content.trim()) return null;
  return (
    <div className={className ? `rc-md ${className}` : 'rc-md'}>
      <MarkdownBody
        content={content}
        preprocessColumnBlocks={false}
        preprocessComponentBlocks={false}
      />
    </div>
  );
}

export function SmartLink({
  href,
  className,
  children,
  onClick,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  onClick?: () => void;
}) {
  const site = useSite();
  const target = site.href(href);
  if (/^(https?:|mailto:|tel:)/i.test(target) || target.startsWith('#')) {
    const external = /^https?:/i.test(target);
    return (
      <a
        href={target}
        className={className}
        onClick={onClick}
        {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
      >
        {children}
      </a>
    );
  }
  return (
    <Link href={target} className={className} onClick={onClick}>
      {children}
    </Link>
  );
}

/** First link = primary button, others = secondary (or `quiet` text links). */
export function Actions({
  actions,
  align = 'start',
  tone = 'light',
}: {
  actions: MdLink[];
  align?: 'start' | 'center';
  tone?: 'light' | 'dark';
}) {
  if (actions.length === 0) return null;
  return (
    <div className={`rc-actions rc-actions--${align} rc-actions--${tone}`}>
      {actions.map((action, index) => (
        <SmartLink
          key={`${action.href}-${action.text}`}
          href={action.href}
          className={index === 0 ? 'rc-button' : 'rc-button rc-button--ghost'}
        >
          {action.text}
        </SmartLink>
      ))}
    </div>
  );
}

export function Figure({
  image,
  className,
  priority = false,
}: {
  image: BlockImage;
  className?: string;
  priority?: boolean;
}) {
  const site = useSite();
  return (
    <figure className={className ? `rc-figure ${className}` : 'rc-figure'}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={image.src}
        alt={site.alt(image)}
        loading={priority ? 'eager' : 'lazy'}
        decoding="async"
        {...(priority ? { fetchPriority: 'high' as const } : {})}
      />
    </figure>
  );
}

export function SectionTitle({ children, centered = false }: { children: ReactNode; centered?: boolean }) {
  return <h2 className={centered ? 'rc-h2 rc-h2--center' : 'rc-h2'}>{children}</h2>;
}

/** Headings in content may contain inline markdown (`**`, `*`). */
export function InlineText({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g).filter(Boolean);
  return (
    <>
      {parts.map((part, index) => {
        if (part.startsWith('**')) return <strong key={index}>{part.slice(2, -2)}</strong>;
        if (part.startsWith('*')) return <em key={index}>{part.slice(1, -1)}</em>;
        return part;
      })}
    </>
  );
}
