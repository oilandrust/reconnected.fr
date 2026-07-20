import { getContent } from '../content'
import { MarkdownContent } from './MarkdownContent'

function splitAboutContent(body: string) {
  const parts = body.split(/^## Some of my trainings$/m)
  return {
    bio: parts[0]?.trim() ?? '',
    trainingItems: (parts[1]?.match(/^- .+$/gm) ?? []).map((line) =>
      line.replace(/^- /, ''),
    ),
  }
}

export function AboutSection() {
  const { frontmatter, body } = getContent('about')
  const { bio, trainingItems } = splitAboutContent(body)

  return (
    <section className="section section-full bg-accent-5" id="about">
      <div className="container">
        <div className="columns columns-50-50">
          <div className="column">
            <MarkdownContent content={bio} />
          </div>
          <div className="column">
            <figure>
              <img
                className="about-image"
                src={frontmatter.image}
                alt="Olivier Rouiller"
              />
            </figure>
            <h2>Some of my trainings</h2>
            <ul className="checkmark-list">
              {trainingItems.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  )
}
