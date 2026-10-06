/**
 * Parsers for the `::: block` grammar of the reconnected template.
 *
 * Each parser receives the inner markdown of one block (already processed by
 * `lefolio sync`: embeds are `![alt](url)`, wikilinks are `[text](url)`) and
 * returns plain data for the matching component. See README.md for the grammar.
 */
import {
  extractAllImages,
  extractLinks,
  firstHeading,
  splitByHeading,
  stripHeading,
  stripImages,
  URL_IN_PARENS,
  type MdImage,
  type MdLink,
} from '@lefolio/engine/parse';

export type { MdImage, MdLink };

const LINK_ONLY_LINE = new RegExp(String.raw`^\s*(?:\[[^\]]+\]\(${URL_IN_PARENS}\)\s*)+$`);
const LIST_ITEM = /^\s*(?:[-*+]|\d+[.)])\s+(.+)$/;
const ORDERED_ITEM = /^\s*\d+[.)]\s+(.+)$/;
const BOLD_LEAD = /^\*\*(.+?)\*\*\s*(?:[·:–—-]\s*)?(.*)$/;

export function stripComments(markdown: string): string {
  return markdown.replace(/<!--[\s\S]*?-->/g, '');
}

function tidy(markdown: string): string {
  return markdown.replace(/\n{3,}/g, '\n\n').trim();
}

/** Lines made only of links become actions (buttons); inline links stay in prose. */
export function extractActions(markdown: string): { actions: MdLink[]; rest: string } {
  const actions: MdLink[] = [];
  const kept: string[] = [];
  for (const line of markdown.split('\n')) {
    if (LINK_ONLY_LINE.test(line)) {
      actions.push(...extractLinks(line));
    } else {
      kept.push(line);
    }
  }
  return { actions, rest: tidy(kept.join('\n')) };
}

/** `![alt](src)` → image; names starting with `deco-` are decorative. */
export interface BlockImage extends MdImage {
  decorative: boolean;
  /** Basename without extension, e.g. `olivier-rouiller-portrait`. */
  name: string;
}

function toBlockImage(image: MdImage): BlockImage {
  const file = decodeURIComponent(image.src.split('/').pop() ?? '');
  const name = file.replace(/\.[a-z0-9]+$/i, '');
  return { ...image, name, decorative: name.startsWith('deco-') };
}

export function extractImage(markdown: string): BlockImage | null {
  const [first] = extractAllImages(markdown);
  return first ? toBlockImage(first) : null;
}

/** Split `before --- after` (horizontal rule) — used for footnotes. */
export function splitRule(markdown: string): { main: string; note: string } {
  const parts = markdown.split(/^\s*(?:-{3,}|\*{3,})\s*$/m);
  return { main: tidy(parts[0] ?? ''), note: tidy(parts.slice(1).join('\n')) };
}

/** List items of a markdown string (unordered or ordered). */
export function listItems(markdown: string, ordered = false): string[] {
  const re = ordered ? ORDERED_ITEM : LIST_ITEM;
  return markdown
    .split('\n')
    .map((line) => re.exec(line)?.[1]?.trim())
    .filter((item): item is string => Boolean(item));
}

/** Markdown before the first list item / after the last one. */
export function aroundList(markdown: string): { before: string; after: string } {
  const lines = markdown.split('\n');
  const first = lines.findIndex((line) => LIST_ITEM.test(line));
  if (first === -1) return { before: tidy(markdown), after: '' };
  let last = first;
  lines.forEach((line, index) => {
    if (LIST_ITEM.test(line)) last = index;
  });
  return {
    before: tidy(lines.slice(0, first).join('\n')),
    after: tidy(lines.slice(last + 1).join('\n')),
  };
}

/** `**Lead** · text`, `**Lead** : text`, `**Lead.** text` → { lead, text }. */
export interface LeadItem {
  lead: string;
  text: string;
}

export function leadItem(item: string): LeadItem {
  const match = BOLD_LEAD.exec(item.trim());
  if (!match) return { lead: '', text: item.trim() };
  return { lead: match[1].replace(/[.:]$/, '').trim(), text: match[2].trim() };
}

/* ------------------------------------------------------------------ */
/* ::: seo                                                             */
/* ------------------------------------------------------------------ */

/** `key: value` lines. */
export function parseKeyValues(markdown: string): Record<string, string> {
  const data: Record<string, string> = {};
  for (const line of stripComments(markdown).split('\n')) {
    const match = /^([\w-]+)\s*:\s*(.+)$/.exec(line.trim());
    if (match) data[match[1].toLowerCase()] = match[2].trim();
  }
  return data;
}

/* ------------------------------------------------------------------ */
/* ::: hero                                                            */
/* ------------------------------------------------------------------ */

export interface HeroData {
  eyebrow: string | null;
  title: string | null;
  subtitle: string | null;
  body: string;
  image: BlockImage | null;
  actions: MdLink[];
}

/**
 * ```
 * Eyebrow line (optional, before the #)
 * # Title
 * ## Subtitle (optional)
 * Paragraphs…
 * ![[image]] (optional)
 * [Primary action](…)
 * [Secondary action](…)
 * ```
 */
export function parseHero(markdown: string): HeroData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 1);
  const titleIndex = title ? source.search(/^#\s+/m) : -1;
  const eyebrow =
    titleIndex > 0 ? source.slice(0, titleIndex).trim().split('\n')[0]?.trim() || null : null;
  let rest = titleIndex >= 0 ? source.slice(titleIndex) : source;
  rest = stripHeading(rest, title);

  const subtitle = firstHeading(rest, 2);
  rest = stripHeading(rest, subtitle);

  const image = extractImage(rest);
  const { actions, rest: body } = extractActions(stripImages(rest));
  return { eyebrow, title, subtitle, body, image, actions };
}

/* ------------------------------------------------------------------ */
/* ::: split, ::: cta, ::: notice — heading + prose (+ image, actions)  */
/* ------------------------------------------------------------------ */

export interface SectionData {
  title: string | null;
  body: string;
  image: BlockImage | null;
  /** True when the image comes before the heading in the source. */
  imageFirst: boolean;
  actions: MdLink[];
}

export function parseSection(markdown: string, level = 2): SectionData {
  const source = stripComments(markdown);
  const title = firstHeading(source, level);
  const image = extractImage(source);
  const imageAt = source.indexOf('![');
  const titleAt = title ? source.search(new RegExp(`^#{${level}}\\s+`, 'm')) : -1;
  const imageFirst =
    Boolean(image) && (titleAt === -1 ? source.trimStart().startsWith('![') : imageAt < titleAt);
  const { actions, rest } = extractActions(stripImages(stripHeading(source, title)));
  return { title, body: rest, image, imageFirst, actions };
}

/* ------------------------------------------------------------------ */
/* ::: checklist, ::: facts, ::: timeline — heading + list             */
/* ------------------------------------------------------------------ */

export interface ListData {
  title: string | null;
  intro: string;
  items: LeadItem[];
  outro: string;
  actions: MdLink[];
}

export function parseList(markdown: string, ordered = false): ListData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 2);
  const { actions, rest } = extractActions(stripHeading(source, title));
  const { before, after } = aroundList(rest);
  return {
    title,
    intro: before,
    items: listItems(rest, ordered).map(leadItem),
    outro: after,
    actions,
  };
}

/* ------------------------------------------------------------------ */
/* ::: cards — `### Card` sections or `- **Lead**: text` list items     */
/* ------------------------------------------------------------------ */

export interface CardData {
  title: string;
  body: string;
  actions: MdLink[];
}

export interface CardsData {
  title: string | null;
  intro: string;
  cards: CardData[];
  outro: string;
}

export function parseCards(markdown: string): CardsData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 2);
  const rest = stripHeading(source, title);
  const { intro, sections } = splitByHeading(rest, 3);

  if (sections.length > 0) {
    return {
      title,
      intro,
      cards: sections.map((section) => {
        const { actions, rest: body } = extractActions(section.body);
        return { title: section.title, body, actions };
      }),
      outro: '',
    };
  }

  const { before, after } = aroundList(rest);
  return {
    title,
    intro: before,
    cards: listItems(rest).map((item) => {
      const { lead, text } = leadItem(item);
      return { title: lead, body: text, actions: [] };
    }),
    outro: after,
  };
}

/* ------------------------------------------------------------------ */
/* ::: pricing — `### Tier` + `**price** unit` + description, `---` note */
/* ------------------------------------------------------------------ */

export interface TierData {
  name: string;
  price: string;
  unit: string;
  body: string;
}

export interface PricingData {
  title: string | null;
  intro: string;
  tiers: TierData[];
  note: string;
}

export function parsePricing(markdown: string): PricingData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 2);
  const { main, note } = splitRule(stripHeading(source, title));
  const { intro, sections } = splitByHeading(main, 3);

  const tiers = sections.map((section) => {
    const [first = '', ...others] = section.body.split(/\n{2,}/);
    const price = /^\*\*(.+?)\*\*\s*(.*)$/.exec(first.trim());
    return price
      ? { name: section.title, price: price[1], unit: price[2], body: tidy(others.join('\n\n')) }
      : { name: section.title, price: '', unit: '', body: section.body };
  });

  return { title, intro, tiers, note };
}

/* ------------------------------------------------------------------ */
/* ::: faq — `### Question` + answer                                    */
/* ------------------------------------------------------------------ */

export interface QuestionData {
  question: string;
  answer: string;
}

export interface FaqData {
  title: string | null;
  intro: string;
  items: QuestionData[];
}

export function parseFaq(markdown: string): FaqData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 2);
  const { intro, sections } = splitByHeading(stripHeading(source, title), 3);
  return {
    title,
    intro,
    items: sections.map((section) => ({ question: section.title, answer: section.body })),
  };
}

/* ------------------------------------------------------------------ */
/* ::: testimonials — `### Name` + `> quote`                            */
/* ------------------------------------------------------------------ */

export interface TestimonialData {
  name: string;
  quote: string;
}

export interface TestimonialsData {
  title: string | null;
  intro: string;
  items: TestimonialData[];
}

export function parseTestimonials(markdown: string): TestimonialsData {
  const source = stripComments(markdown);
  const title = firstHeading(source, 2);
  const { intro, sections } = splitByHeading(stripHeading(source, title), 3);
  return {
    title,
    intro,
    items: sections.map((section) => ({
      name: section.title,
      quote: tidy(section.body.replace(/^\s*>\s?/gm, '')),
    })),
  };
}

/* ------------------------------------------------------------------ */
/* Helpers for structured data                                          */
/* ------------------------------------------------------------------ */

/** Rough markdown → plain text (JSON-LD, meta). */
export function plainText(markdown: string): string {
  return markdown
    .replace(/<[^>]+>/g, '')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, '')
    .replace(/\[([^\]]+)\]\([^)]*\)/g, '$1')
    .replace(/[*_`>#]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
