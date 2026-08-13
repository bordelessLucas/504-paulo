import { OPS_SITE_URL } from '../links';

export type ProductId = 'ops' | 'avalia';

export type Product = {
  id: ProductId;
  label: string;
  tagline: string;
  description: string;
  bullets: string[];
  note: string;
  cta: string;
  href: string;
  image: string;
};

export const products: Product[] = [
  {
    id: 'ops',
    label: 'VERTEK OPS',
    tagline: 'Campo, EPI e bordo sob o mesmo controle.',
    description:
      'Para empresas de acesso por corda, alpinismo industrial e trabalho em altura que precisam transformar execução de campo em operação rastreável.',
    bullets: [
      'Gestão de operação, escopo e planejamento',
      'Embarque, POB, escala e logística de bordo',
      'EPIs, inspeções, validade e quarentena',
      'Documentação técnica, checklists e databook',
    ],
    note: 'Web + mobile · offline-first no campo',
    cta: 'Conhecer Vertek Ops',
    href: OPS_SITE_URL,
    image: '/images/ops-field.jpg',
  },
  {
    id: 'avalia',
    label: 'VERTEK AVALIA',
    tagline: 'Desempenho com trilha de decisão do bordo à diretoria.',
    description:
      'Para RH, supervisão, gestão e C-level conduzirem ciclos de avaliação e decisões de pessoas com contexto, histórico e responsabilidade clara.',
    bullets: [
      'Avaliações quinzenais, semestrais e anuais',
      'Papéis claros entre colaborador, gestão, RH e CEO',
      'Aprovações, status e trilha de solicitações',
      'Rankings, reajustes, painéis e PDFs exportáveis',
    ],
    note: 'Governança de pessoas · histórico consolidado',
    cta: 'Conhecer Vertek Avalia',
    href: '/#avalia',
    image: '/images/avalia-governance.jpg',
  },
];
