import type { CSSProperties } from 'react';

import { products } from '../data/products';
import ProductCta from './ProductCta';
import RevealText from './RevealText';
import SectionHeading from './SectionHeading';

export default function Solutions() {
  return (
    <section className="section solutions" id="solucoes">
      <div className="section-index" aria-hidden="true">
        02 / SOLUÇÕES
      </div>
      <div className="container">
        <SectionHeading
          eyebrow="Soluções"
          title="Dois produtos. Uma Vertek."
          text="Ops organiza a execução e a conformidade no campo. Avalia estrutura a governança de pessoas e a decisão. Juntos ou separados, operam sob a mesma disciplina institucional."
        />
        <div className="solutions__stack">
          {products.map((product, index) => (
            <article
              className={`product-block ${index % 2 ? 'product-block--reverse' : ''}`}
              id={product.id}
              key={product.id}
              data-reveal
            >
              <div className="product-block__copy">
                <p className="eyebrow motion-rise" data-reveal>
                  {product.label}
                </p>
                <RevealText as="h3">{product.tagline}</RevealText>
                <p className="product-block__description motion-rise" data-reveal>
                  {product.description}
                </p>
                <ul data-reveal className="stagger-list">
                  {product.bullets.map((item, bulletIndex) => (
                    <li
                      key={item}
                      style={{ '--item-index': bulletIndex } as CSSProperties}
                    >
                      <span aria-hidden="true"></span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="product-block__meta motion-rise" data-reveal>
                  {product.note}
                </div>
                <ProductCta
                  productId={product.id}
                  href={product.href}
                  className="button button--accent motion-rise"
                >
                  {product.cta} <span aria-hidden="true">→</span>
                </ProductCta>
              </div>
              <div className="product-block__visual" data-reveal>
                <img
                  data-parallax="0.025"
                  src={product.image}
                  alt={
                    product.id === 'ops'
                      ? 'Profissional em operação de acesso por corda em ambiente industrial'
                      : 'Profissional trabalhando com documentação e gestão em ambiente industrial'
                  }
                />
                <div className="product-block__target" aria-hidden="true">
                  <i></i>
                  <i></i>
                </div>
                <div className="product-block__frame" aria-hidden="true">
                  <span>{product.id === 'ops' ? 'FIELD / CONTROL' : 'PEOPLE / GOVERNANCE'}</span>
                  <i></i>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
