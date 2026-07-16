import type { PlanId, SubscriptionPlan } from '@/features/subscription/types';

export const SUBSCRIPTION_PLANS: readonly SubscriptionPlan[] = [
  {
    id: 'essencial',
    name: 'Essencial',
    tagline: 'Para times pequenos começando a estruturar avaliações.',
    monthlyPrice: 49,
    priceLabel: 'R$ 49',
    periodLabel: '/mês',
    features: [
      'Até 15 colaboradores',
      'Ciclos de avaliação trimestrais',
      'Relatórios básicos de desempenho',
      'Suporte por e-mail',
    ],
  },
  {
    id: 'profissional',
    name: 'Profissional',
    tagline: 'Recursos completos para gestão contínua de desempenho.',
    monthlyPrice: 99,
    priceLabel: 'R$ 99',
    periodLabel: '/mês',
    isFeatured: true,
    badge: 'Mais popular',
    features: [
      'Até 100 colaboradores',
      'Ciclos e PDIs ilimitados',
      'Dashboards gerenciais avançados',
      'Aprovações e workflow salarial',
      'Suporte prioritário',
    ],
  },
  {
    id: 'corporativo',
    name: 'Corporativo',
    tagline: 'Escala, compliance e governança para grandes operações.',
    monthlyPrice: 199,
    priceLabel: 'R$ 199',
    periodLabel: '/mês',
    features: [
      'Colaboradores ilimitados',
      'Painel anual estratégico',
      'Módulo de compliance e NR-1',
      'Auditoria e trilha de acessos',
      'Gerente de conta dedicado',
    ],
  },
] as const;

export function getPlanById(planId: PlanId): SubscriptionPlan | null {
  return SUBSCRIPTION_PLANS.find((plan) => plan.id === planId) ?? null;
}
