import ProductCta from './ProductCta';
import RevealText from './RevealText';

export default function Hero() {
  return (
    <section className="hero" id="top" aria-labelledby="hero-title">
      <div className="hero__media" data-parallax="0.035" aria-hidden="true"></div>
      <div className="hero__overlay" aria-hidden="true"></div>
      <div className="hero__grid" aria-hidden="true"></div>
      <div className="hero__scan" aria-hidden="true"></div>
      <div className="hero__edge-copy" aria-hidden="true">
        FIELD / PEOPLE / DECISION
      </div>
      <div className="container hero__content">
        <div className="hero__brand hero-brand-reveal" data-reveal>
          VERTEK
        </div>
        <div className="hero__copy">
          <p className="eyebrow motion-rise" data-reveal>
            Tecnologia institucional para ambientes críticos
          </p>
          <RevealText as="h1" id="hero-title" baseDelay={80}>
            Operação e desempenho sob a mesma disciplina.
          </RevealText>
          <p className="hero__lead motion-rise" data-reveal>
            Campo, pessoas e decisão conectados por rastreabilidade, conformidade e clareza
            corporativa.
          </p>
          <div className="hero__actions motion-rise" data-reveal>
            <a className="button button--accent" href="#solucoes">
              Conhecer as soluções
            </a>
            <ProductCta productId="avalia" href="/login" className="button button--ghost">
              Entrar no Avalia <span aria-hidden="true">→</span>
            </ProductCta>
          </div>
        </div>
        <div className="hero__signal motion-line" data-reveal aria-hidden="true">
          <span>01</span>
          <i></i>
          <span>VERTEK SYSTEMS</span>
        </div>
      </div>
    </section>
  );
}
