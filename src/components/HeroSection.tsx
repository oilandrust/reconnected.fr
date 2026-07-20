import { getContent } from '../content'
import { MarkdownContent } from './MarkdownContent'

export function HeroSection() {
  const { frontmatter, body } = getContent('hero')

  return (
    <section className="cover section-full">
      <img
        className="cover__image"
        src={frontmatter.image}
        alt=""
        style={{ objectPosition: frontmatter.imagePosition ?? 'center' }}
      />
      <span className="cover__background" aria-hidden="true" />
      <div className="cover__content">
        <MarkdownContent content={body} />
      </div>
    </section>
  )
}
