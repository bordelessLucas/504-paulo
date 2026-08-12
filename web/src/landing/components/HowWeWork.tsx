import type { CSSProperties } from 'react';

import RevealText from './RevealText';
import SectionHeading from './SectionHeading';

const steps = [
  [
    '01',
    'Diagnóstico',
    'Mapeamos o fluxo real, os pontos de risco, responsabilidades e dados que sustentam a operação.',
  ],
  [
    '02',
    'Implantação',
    'Configuramos processos, perfis, bases e rotinas para refletir a realidade operacional da empresa.',
  ],
  [
    '03',
    'Operação contínua',
    'A plataforma acompanha o trabalho diário com rastreabilidade, histórico e evolução controlada.',
  ],
] as const;

export default function HowWeWork() {
  return (
    <section className="section how-we-work" id="como-atuamos">
      <div className="section-index" aria-hidden="true">
        03 / COMO ATUAMOS
      </div>
      <div className="container">
        <SectionHeading
          eyebrow="Como atuamos"
          title="Tecnologia entra depois de entender a operação."
          text="A Vertek parte do processo real e implanta tecnologia com critério institucional, sem forçar a empresa a caber em um template."
        />
        <div className="process-line" data-reveal>
          {steps.map(([n, title, text], index) => (
            <article
              className="process-step"
              key={n}
              style={{ '--item-index': index } as CSSProperties}
            >
              <span>{n}</span>
              <RevealText as="h3">{title}</RevealText>
              <p>{text}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
