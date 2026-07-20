import { getContent } from '../content'
import { Button, ButtonGroup } from './Button'
import { MarkdownContent } from './MarkdownContent'

const EMAIL = 'o.rouiller@gmail.com'

export function ContactSection() {
  const { body } = getContent('contact')

  return (
    <section className="contact-section section-full" id="contact">
      <div className="contact-card">
        <MarkdownContent content={body} />
        <ButtonGroup align="center">
          <Button href={`mailto:${EMAIL}?subject=Free%20Introduction%20Call`}>
            Email me at {EMAIL}
          </Button>
        </ButtonGroup>
      </div>
    </section>
  )
}
