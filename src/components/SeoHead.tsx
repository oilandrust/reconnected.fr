import { Head } from 'vite-react-ssg'
import {
  OG_IMAGE,
  SITE_DESCRIPTION,
  SITE_EMAIL,
  SITE_KEYWORDS,
  SITE_NAME,
  SITE_URL,
} from '../config/site'

const structuredData = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      description: SITE_DESCRIPTION,
      inLanguage: 'en',
    },
    {
      '@type': 'Person',
      '@id': `${SITE_URL}/#person`,
      name: 'Olivier Rouiller',
      url: SITE_URL,
      email: SITE_EMAIL,
      jobTitle: 'Somatic Therapist',
      description: SITE_DESCRIPTION,
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Strasbourg',
        addressCountry: 'FR',
      },
      knowsAbout: [
        'Hakomi Somatic Mindful Therapy',
        'Somatic Therapy',
        'Attachment Therapy',
        'Trauma-informed therapy',
      ],
    },
    {
      '@type': 'ProfessionalService',
      '@id': `${SITE_URL}/#service`,
      name: SITE_NAME,
      url: SITE_URL,
      description: SITE_DESCRIPTION,
      provider: { '@id': `${SITE_URL}/#person` },
      areaServed: {
        '@type': 'Place',
        name: 'Strasbourg, France (online sessions available)',
      },
      serviceType: 'Somatic Therapy and Hakomi',
    },
  ],
}

export function SeoHead() {
  return (
    <Head>
      <html lang="en" />
      <title>{SITE_NAME}</title>
      <meta name="description" content={SITE_DESCRIPTION} />
      <meta name="keywords" content={SITE_KEYWORDS} />
      <meta name="author" content="Olivier Rouiller" />
      <link rel="canonical" href={SITE_URL} />

      <meta property="og:type" content="website" />
      <meta property="og:url" content={SITE_URL} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={SITE_NAME} />
      <meta property="og:description" content={SITE_DESCRIPTION} />
      <meta property="og:image" content={OG_IMAGE} />
      <meta property="og:image:alt" content="Olivier Rouiller — somatic therapist" />
      <meta property="og:locale" content="en_US" />

      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SITE_NAME} />
      <meta name="twitter:description" content={SITE_DESCRIPTION} />
      <meta name="twitter:image" content={OG_IMAGE} />
      <meta name="twitter:image:alt" content="Olivier Rouiller — somatic therapist" />

      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
    </Head>
  )
}
