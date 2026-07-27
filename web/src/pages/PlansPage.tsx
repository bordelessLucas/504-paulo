import { CheckCircle2 } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { useAuth } from '@/features/auth/auth-context';
import { SUBSCRIPTION_PLANS } from '@/features/subscription/plans';
import type { PlanId } from '@/features/subscription/types';

import { useSubscription } from '../contexts/subscription-context';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import page from '../styles/page.module.css';

const DEFAULT_PLAN_ID: PlanId =
  SUBSCRIPTION_PLANS.find((plan) => plan.isFeatured)?.id ?? SUBSCRIPTION_PLANS[0].id;

export function PlansPage() {
  const navigate = useNavigate();
  const { user, signOut, pendingRegistration, completeRegistration, clearPendingRegistration } =
    useAuth();
  const { subscribe } = useSubscription();
  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlanId) ?? SUBSCRIPTION_PLANS[0];
  const greetingName = user?.name ?? pendingRegistration?.name ?? null;

  async function handleSubscribe() {
    setIsProcessing(true);
    setError(null);

    try {
      let targetUserId = user?.id ?? null;

      if (!targetUserId) {
        const result = await completeRegistration();
        if (result.status === 'error') {
          setError(result.error.message);
          return;
        }
        if (result.status === 'email_confirmation') {
          setError('Confirme seu e-mail para concluir o cadastro e depois faça login.');
          clearPendingRegistration();
          navigate('/login');
          return;
        }
        if (result.status !== 'authenticated') {
          setError('Não foi possível criar a conta. Tente novamente.');
          return;
        }
        targetUserId = result.userId;
      }

      await subscribe(selectedPlanId, targetUserId);
      navigate('/', { replace: true });
    } catch (subscribeError) {
      setError(
        subscribeError instanceof Error
          ? subscribeError.message
          : 'Não foi possível concluir a assinatura. Tente novamente.',
      );
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleExit() {
    if (user) {
      await signOut();
      navigate('/login');
      return;
    }
    clearPendingRegistration();
    navigate('/login');
  }

  return (
    <div className={page.plansShell}>
      <header className={page.plansHeader}>
        <div className={page.brand} style={{ justifyContent: 'center' }}>
          <span className={page.brandVertek} style={{ color: '#ffffff' }}>
            Vertek
          </span>
          <span className={page.brandAvalia}>Avalia</span>
        </div>
        <h1 className={page.pageTitle} style={{ color: '#f0ede4' }}>
          Escolha seu plano
        </h1>
        <p className={page.pageDescription} style={{ color: 'rgba(240,237,228,0.75)' }}>
          {greetingName ? `Olá, ${greetingName.split(' ')[0]}! ` : ''}
          Para acessar o app é necessário assinar um dos planos abaixo.
        </p>
      </header>

      <div className={page.plansGrid}>
        {SUBSCRIPTION_PLANS.map((plan) => {
          const isSelected = plan.id === selectedPlanId;
          return (
            <Card
              key={plan.id}
              className={`${page.planCard} ${isSelected ? page.planCardSelected : ''}`.trim()}
              onClick={() => setSelectedPlanId(plan.id)}
              role="radio"
              aria-checked={isSelected}
              tabIndex={0}
              onKeyDown={(event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                  setSelectedPlanId(plan.id);
                }
              }}
            >
              <div className={page.listItemHeader}>
                <h2 className={page.listItemTitle}>{plan.name}</h2>
                {plan.badge ? <span className={page.chipActive}>{plan.badge}</span> : null}
              </div>
              <p className={page.listItemMeta}>{plan.tagline}</p>
              <p className={page.metricValue}>
                {plan.priceLabel}
                <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>{plan.periodLabel}</span>
              </p>
              <ul className={page.staticList}>
                {plan.features.map((feature) => (
                  <li key={feature} style={{ display: 'flex', gap: '0.5rem', listStyle: 'none' }}>
                    <CheckCircle2 size={16} color="#00A675" style={{ flexShrink: 0, marginTop: 2 }} />
                    {feature}
                  </li>
                ))}
              </ul>
            </Card>
          );
        })}
      </div>

      <div style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
        {error ? (
          <div className={page.error} style={{ marginBottom: '1rem' }}>
            {error}
          </div>
        ) : null}
        <Button
          size="lg"
          isLoading={isProcessing}
          onClick={() => void handleSubscribe()}
          style={{ width: '100%' }}
        >
          Assinar {selectedPlan.name} • {selectedPlan.priceLabel}
          {selectedPlan.periodLabel}
        </Button>
        <p style={{ color: 'rgba(240,237,228,0.6)', fontSize: '0.85rem', marginTop: '1rem' }}>
          Pagamento fictício para demonstração. Nenhuma cobrança real será feita.
        </p>
        <button
          type="button"
          onClick={() => void handleExit()}
          disabled={isProcessing}
          style={{
            marginTop: '0.5rem',
            background: 'none',
            border: 'none',
            color: 'rgba(240,237,228,0.75)',
            cursor: 'pointer',
          }}
        >
          {user ? 'Sair da conta' : 'Voltar ao login'}
        </button>
      </div>
    </div>
  );
}
