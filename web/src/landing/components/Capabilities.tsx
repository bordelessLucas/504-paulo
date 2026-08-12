import type { CSSProperties } from 'react';

import RevealText from './RevealText';
import SectionHeading from './SectionHeading';

const capabilities = [
  ['01', 'Gestão de operação', 'Escopo, planejamento, execução e histórico operacional.'],
  ['02', 'EPIs & equipamentos', 'Cadastro, inspeção, validade, rastreio e quarentena.'],
  ['03', 'Logística de bordo', 'Embarque, POB, escalas e visibilidade de equipe.'],
  ['04', 'Ciclos de avaliação', 'Rotinas quinzenais, semestrais e anuais.'],
  ['05', 'Aprovações e reajuste', 'Fluxos claros, trilha decisória e governança.'],
  ['06', 'Painéis gerenciais', 'Histórico, rankings e leitura executiva dos dados.'],
] as const;

export default function Capabilities() {
  return (
    <section className="section capabilities" id="capacidades">
      <div className="section-index" aria-hidden="true">
        04 / CAPACIDADES
      </div>
      <div className="container">
        <SectionHeading
          eyebrow="Capacidades"
          title="Controle operacional sem perder contexto executivo."
          text="Capacidades desenhadas para conectar o detalhe do campo à leitura gerencial, sem fragmentar responsabilidade ou histórico."
        />
        <div className="capability-grid" data-reveal>
          {capabilities.map(([n, title, text], index) => (
            <article
              className="capability"
              key={n}
              style={{ '--item-index': index } as CSSProperties}
            >
              <span>{n}</span>
              <div>
                <RevealText as="h3">{title}</RevealText>
                <p>{text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
