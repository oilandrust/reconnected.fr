import { getContent } from '../content'
import { Button, ButtonGroup } from './Button'
import { MarkdownContent } from './MarkdownContent'

export function CtaSection() {
  const { frontmatter, body } = getContent('cta')

  return (
    <section className="cta-section section-full bg-accent-5">
      <div className="container">
        <div className="columns columns-50-50">
          <div className="column">
            <MarkdownContent content={body} />
            {frontmatter.ctaText && frontmatter.ctaLink && (
              <ButtonGroup align="center">
                <Button href={frontmatter.ctaLink}>{frontmatter.ctaText}</Button>
              </ButtonGroup>
            )}
          </div>
          <div className="column">
            <figure>
              <img
                className="cta-image"
                src={frontmatter.image}
                alt=""
              />
            </figure>
          </div>
        </div>
      </div>
    </section>
  )
}
