import { useState, type CSSProperties } from 'react';

import SectionHeading from './SectionHeading';

const items = [
  [
    'Produtos',
    'Qual é a diferença entre Vertek Ops e Vertek Avalia?',
    'O Ops concentra execução, conformidade e controle operacional de campo. O Avalia organiza desempenho, aprovações e decisões de pessoas. Eles podem funcionar juntos ou de forma independente.',
  ],
  [
    'Produtos',
    'O Vertek Ops funciona sem internet?',
    'Sim. A proposta do produto considera operação offline-first para rotinas de campo, com sincronização quando a conectividade estiver disponível.',
  ],
  [
    'Produtos',
    'Como funcionam os papéis no Vertek Avalia?',
    'Os fluxos respeitam níveis claros de responsabilidade, do colaborador à supervisão, gestão, RH e CEO/admin, com visibilidade e ações compatíveis com cada papel.',
  ],
  [
    'Implantação',
    'É possível migrar dados de outro sistema?',
    'Sim. A migração é avaliada durante o diagnóstico, considerando estrutura, qualidade, histórico e regras dos dados existentes antes da importação.',
  ],
  [
    'Implantação',
    'A implantação exige mudar toda a operação?',
    'Não. O objetivo é modelar a tecnologia ao processo real e ajustar apenas os pontos necessários para ganhar rastreabilidade, clareza e controle.',
  ],
  [
    'Comercial',
    'Posso solicitar uma demonstração?',
    'Sim. O contato comercial pode ser feito pelo formulário desta página indicando interesse em Ops, Avalia ou ambos.',
  ],
] as const;

export default function Faq() {
  const [open, setOpen] = useState(0);
  return (
    <section className="section faq" id="faq">
      <div className="section-index" aria-hidden="true">
        05 / FAQ
      </div>
      <div className="container faq__layout">
        <SectionHeading
          eyebrow="FAQ"
          title="Questões que precisam estar claras antes da implantação."
          text="Produto, operação, migração e modelo de uso tratados de forma objetiva."
        />
        <div className="faq__items" data-reveal>
          {items.map(([cat, q, a], index) => (
            <article
              className={`faq-item ${open === index ? 'is-open' : ''}`}
              key={q}
              style={{ '--item-index': index } as CSSProperties}
            >
              <button
                type="button"
                onClick={() => setOpen(open === index ? -1 : index)}
                aria-expanded={open === index}
              >
                <span className="faq-item__category">{cat}</span>
                <strong>{q}</strong>
                <i aria-hidden="true"></i>
              </button>
              <div className="faq-item__answer">
                <p>{a}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
