import { getContent } from '../content'
import { MarkdownContent } from './MarkdownContent'

export function TherapySection() {
  const { body } = getContent('therapy')

  return (
    <section className="section section-full bg-accent-5">
      <div className="container-narrow">
        <MarkdownContent content={body} className="text-center" />
      </div>
    </section>
  )
}
