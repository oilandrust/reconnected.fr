import type { TemplateModule } from '@lefolio/engine/template';
import SiteShell from './shell/SiteShell';
import { ContentPageView, HomeView, SectionIndexView, StandalonePageView } from './views/Page';
import Seo from './components/Seo';
import Hero from './components/Hero';
import Checklist from './components/Checklist';
import Split from './components/Split';
import Facts from './components/Facts';
import Cards from './components/Cards';
import Steps from './components/Steps';
import Pricing from './components/Pricing';
import Timeline from './components/Timeline';
import Faq from './components/Faq';
import Testimonials from './components/Testimonials';
import Notice from './components/Notice';
import Cta from './components/Cta';

export const reconnectedTemplate: TemplateModule = {
  id: 'reconnected',
  routing: 'multipage',
  Shell: SiteShell,
  loadStyles: () => import('./styles.css'),
  Home: HomeView,
  SectionIndex: SectionIndexView,
  StandalonePage: StandalonePageView,
  ContentPage: ContentPageView,
  markdownComponents: {
    seo: Seo,
    hero: Hero,
    checklist: Checklist,
    split: Split,
    facts: Facts,
    cards: Cards,
    steps: Steps,
    pricing: Pricing,
    timeline: Timeline,
    faq: Faq,
    testimonials: Testimonials,
    notice: Notice,
    cta: Cta,
  },
};
