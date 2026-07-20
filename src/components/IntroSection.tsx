import { getContent } from '../content'
import { Button, ButtonGroup } from './Button'
import { MarkdownContent } from './MarkdownContent'

export function IntroSection() {
  const { frontmatter, body } = getContent('intro')

  return (
    <section className="section section-full">
      <div className="container">
        <div className="columns columns-56-44">
          <div className="column">
            <figure>
              <img
                className="portrait-image"
                src={frontmatter.image}
                alt="Olivier Rouiller"
              />
            </figure>
          </div>
          <div className="column">
            <MarkdownContent content={body} className="text-right" />
            {frontmatter.ctaText && frontmatter.ctaLink && (
              <ButtonGroup align="right">
                <Button href={frontmatter.ctaLink}>{frontmatter.ctaText}</Button>
              </ButtonGroup>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
