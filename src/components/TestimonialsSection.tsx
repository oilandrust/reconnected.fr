import { getContent } from '../content'
import { MarkdownContent } from './MarkdownContent'

interface Testimonial {
  name: string
  quote: string
}

function parseTestimonials(body: string): Testimonial[] {
  const sections = body.split(/^### /m).slice(1)
  return sections.map((section) => {
    const [nameLine, ...quoteLines] = section.trim().split('\n')
    const name = nameLine.trim()
    const quote = quoteLines.join('\n').trim()
    return { name, quote }
  })
}

export function TestimonialsSection() {
  const { body } = getContent('testimonials')
  const titleMatch = body.match(/^## .+$/m)
  const title = titleMatch ? titleMatch[0].replace(/^## /, '') : ''
  const testimonialsBody = body.replace(/^## .+\n*/m, '')
  const testimonials = parseTestimonials(testimonialsBody)

  return (
    <section className="section-full">
      <div className="section">
        <div className="container">
          <h2 className="text-center">{title}</h2>
        </div>
      </div>

      {testimonials.map((testimonial, index) => (
        <div
          key={testimonial.name}
          className={`testimonial section-full ${index % 2 === 0 ? 'testimonial--alt' : 'bg-base'}`}
        >
          <div className="testimonial__quote">
            <MarkdownContent content={testimonial.quote} />
          </div>
          <p className="testimonial__author">
            <strong>{testimonial.name}</strong>
          </p>
        </div>
      ))}
    </section>
  )
}
