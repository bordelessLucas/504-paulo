import { supabase } from '@/lib/supabase';
import type { PlanId, UserSubscription } from '@/features/subscription/types';

const VALID_PLAN_IDS: readonly PlanId[] = ['essencial', 'profissional', 'corporativo'];

function toPlanId(value: string | null | undefined): PlanId | null {
  if (!value || !VALID_PLAN_IDS.includes(value as PlanId)) {
    return null;
  }
  return value as PlanId;
}

export async function fetchOrganizacaoAssinatura(
  userId: string,
): Promise<UserSubscription | null> {
  const { data, error } = await supabase.rpc('get_minha_assinatura', {
    p_user_id: userId,
  });

  if (error) {
    // Ambiente sem migration aplicada ainda — caller usa fallback local.
    if (
      error.message.includes('Could not find the function') ||
      error.message.includes('does not exist') ||
      error.code === 'PGRST202'
    ) {
      return null;
    }
    throw new Error(error.message);
  }

  const row = Array.isArray(data) ? data[0] : data;
  if (!row || typeof row !== 'object') {
    return null;
  }

  const planId = toPlanId((row as { plan_id?: string }).plan_id);
  if (!planId) {
    return null;
  }

  return {
    planId,
    activatedAt:
      (row as { activated_at?: string }).activated_at ?? new Date().toISOString(),
  };
}

export async function activateOrganizacaoAssinatura(
  ownerId: string,
  planId: PlanId,
  nome?: string | null,
): Promise<void> {
  const { error } = await supabase.rpc('activate_organizacao_assinatura', {
    p_owner_id: ownerId,
    p_plan_id: planId,
    p_nome: nome ?? null,
  });

  if (error) {
    throw new Error(error.message);
  }
}

export async function ensureOrganizacaoForOwner(
  ownerId: string,
  nome?: string | null,
): Promise<string | null> {
  const { data, error } = await supabase.rpc('ensure_organizacao_for_owner', {
    p_owner_id: ownerId,
    p_nome: nome ?? null,
  });

  if (error) {
    if (
      error.message.includes('Could not find the function') ||
      error.message.includes('does not exist') ||
      error.code === 'PGRST202'
    ) {
      return null;
    }
    throw new Error(error.message);
  }

  return typeof data === 'string' ? data : null;
}

/**
 * Se o usuário já tem plano local (legado) e é dono, sincroniza para a organização.
 */
export async function syncLocalAssinaturaToOrganizacao(
  userId: string,
  local: UserSubscription,
  nome?: string | null,
): Promise<UserSubscription> {
  const existing = await fetchOrganizacaoAssinatura(userId);
  if (existing) {
    return existing;
  }

  try {
    await activateOrganizacaoAssinatura(userId, local.planId, nome);
    return (await fetchOrganizacaoAssinatura(userId)) ?? local;
  } catch {
    return local;
  }
}
