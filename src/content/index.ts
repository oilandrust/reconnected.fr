import { parseFrontmatter } from './parseFrontmatter'

export interface ContentFrontmatter {
  title?: string
  image?: string
  imagePosition?: string
  ctaText?: string
  ctaLink?: string
  email?: string
}

export interface ContentBlock {
  id: string
  frontmatter: ContentFrontmatter
  body: string
}

const modules = import.meta.glob('../../Content/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

function parseContent(path: string, raw: string): ContentBlock {
  const { data, content } = parseFrontmatter(raw)
  const id = path.replace(/^.*\//, '').replace(/\.md$/, '')
  return {
    id,
    frontmatter: data as ContentFrontmatter,
    body: content,
  }
}

const contentMap = Object.fromEntries(
  Object.entries(modules).map(([path, raw]) => {
    const block = parseContent(path, raw)
    return [block.id, block]
  }),
) as Record<string, ContentBlock>

export function getContent(id: string): ContentBlock {
  const block = contentMap[id]
  if (!block) {
    throw new Error(`Content not found: ${id}`)
  }
  return block
}

export const content = contentMap
