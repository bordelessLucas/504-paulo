import ProductCta from './ProductCta';
import RevealText from './RevealText';

export default function FinalCta() {
  return (
    <section className="final-cta">
      <div className="final-cta__watermark" aria-hidden="true">
        VERTEK
      </div>
      <div className="container final-cta__inner">
        <div>
          <p className="eyebrow motion-rise" data-reveal>
            Vertek Systems
          </p>
          <RevealText as="h2">Pronto para elevar a operação e a governança?</RevealText>
        </div>
        <div className="final-cta__actions motion-rise" data-reveal>
          <ProductCta productId="avalia" className="button button--accent">
            Entrar no Avalia
          </ProductCta>
          <ProductCta productId="ops" className="button button--light">
            Abrir Ops
          </ProductCta>
        </div>
      </div>
    </section>
  );
}
