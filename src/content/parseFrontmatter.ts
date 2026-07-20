export function parseFrontmatter(raw: string): {
  data: Record<string, string>
  content: string
} {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    return { data: {}, content: raw.trim() }
  }

  const [, yaml, body] = match
  const data: Record<string, string> = {}

  for (const line of yaml.split('\n')) {
    const field = line.match(/^([\w-]+):\s*(.*)$/)
    if (!field) continue
    const [, key, rawValue] = field
    data[key] = rawValue.replace(/^["']|["']$/g, '')
  }

  return { data, content: body.trim() }
}
