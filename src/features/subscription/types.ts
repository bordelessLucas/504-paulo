export type PlanId = 'essencial' | 'profissional' | 'corporativo';

export interface SubscriptionPlan {
  id: PlanId;
  name: string;
  tagline: string;
  monthlyPrice: number;
  priceLabel: string;
  periodLabel: string;
  features: string[];
  isFeatured?: boolean;
  badge?: string;
}

export interface UserSubscription {
  planId: PlanId;
  activatedAt: string;
}
