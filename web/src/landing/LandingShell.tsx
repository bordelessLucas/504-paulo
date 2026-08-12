import AtmosphereBreak from './components/AtmosphereBreak';
import Capabilities from './components/Capabilities';
import Contact from './components/Contact';
import Faq from './components/Faq';
import FinalCta from './components/FinalCta';
import Footer from './components/Footer';
import Header from './components/Header';
import Hero from './components/Hero';
import HowWeWork from './components/HowWeWork';
import Institutional from './components/Institutional';
import ScrollExperience from './components/ScrollExperience';
import Solutions from './components/Solutions';
import './styles.css';

export function LandingShell() {
  return (
    <div className="site-shell landing-official">
      <ScrollExperience />
      <Header />
      <main>
        <Hero />
        <Institutional />
        <Solutions />
        <HowWeWork />
        <AtmosphereBreak />
        <Capabilities />
        <Faq />
        <FinalCta />
        <Contact />
      </main>
      <Footer />
    </div>
  );
}
