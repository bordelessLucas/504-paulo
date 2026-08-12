import RevealText from './RevealText';
import SectionHeading from './SectionHeading';

export default function Institutional() {
  return (
    <section className="section institutional" id="institucional">
      <div className="section-index" aria-hidden="true">
        01 / INSTITUCIONAL
      </div>
      <div className="container">
        <SectionHeading
          eyebrow="Institucional"
          title="A Vertek existe onde operação encontra decisão."
          text="Em ambientes críticos, informação dispersa vira risco. A Vertek cria disciplina operacional para que campo, gestão e diretoria trabalhem com a mesma referência."
        />
        <div className="editorial-pillars">
          <article className="pillar pillar--primary motion-rise" data-reveal>
            <span className="pillar__index">01</span>
            <div>
              <RevealText as="h3">Operação crítica</RevealText>
              <p>
                Planejamento, bordo, equipamentos e documentação com controle de ponta a ponta.
              </p>
            </div>
          </article>
          <article className="pillar pillar--offset motion-rise" data-reveal>
            <span className="pillar__index">02</span>
            <div>
              <RevealText as="h3">Pessoas e decisão</RevealText>
              <p>
                Avaliações, aprovações e históricos organizados para decisões consistentes e
                auditáveis.
              </p>
            </div>
          </article>
          <article className="pillar pillar--line motion-rise" data-reveal>
            <span className="pillar__index">03</span>
            <div>
              <RevealText as="h3">Uma identidade</RevealText>
              <p>
                Do técnico em campo ao C-level, todos operam sob a mesma linguagem institucional.
              </p>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}
