import { Header } from './components/Header'
import { Footer } from './components/Footer'
import { SeoHead } from './components/SeoHead'
import { HeroSection } from './components/HeroSection'
import { IntroSection } from './components/IntroSection'
import { TherapySection } from './components/TherapySection'
import { HakomiSection } from './components/HakomiSection'
import { TestimonialsSection } from './components/TestimonialsSection'
import { AboutSection } from './components/AboutSection'
import { CtaSection } from './components/CtaSection'
import { ContactSection } from './components/ContactSection'

function App() {
  return (
    <>
      <SeoHead />
      <Header />
      <main>
        <HeroSection />
        <IntroSection />
        <TherapySection />
        <HakomiSection />
        <TestimonialsSection />
        <AboutSection />
        <CtaSection />
        <ContactSection />
      </main>
      <Footer />
    </>
  )
}

export default App
