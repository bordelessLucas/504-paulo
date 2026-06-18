import { isCeoApprovalRole, isRhValidationRole } from '@/features/aprovacoes/approval-roles';
import { supabase } from '@/lib/supabase';
import type { UserRole } from '@/types/supabase';

export async function fetchPendingApprovalCount(role: UserRole | null | undefined): Promise<number> {
  if (isRhValidationRole(role)) {
    const [avaliacoes, solicitacoes] = await Promise.all([
      supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente_rh'),
      supabase
        .from('melhorias_salariais')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente_rh'),
    ]);

    if (avaliacoes.error) {
      throw new Error(avaliacoes.error.message);
    }

    if (solicitacoes.error) {
      throw new Error(solicitacoes.error.message);
    }

    return (avaliacoes.count ?? 0) + (solicitacoes.count ?? 0);
  }

  if (isCeoApprovalRole(role)) {
    const [avaliacoes, solicitacoes] = await Promise.all([
      supabase
        .from('avaliacoes')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente_ceo'),
      supabase
        .from('melhorias_salariais')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pendente_ceo'),
    ]);

    if (avaliacoes.error) {
      throw new Error(avaliacoes.error.message);
    }

    if (solicitacoes.error) {
      throw new Error(solicitacoes.error.message);
    }

    return (avaliacoes.count ?? 0) + (solicitacoes.count ?? 0);
  }

  return 0;
}
