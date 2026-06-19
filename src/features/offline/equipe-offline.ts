import type { ColaboradorEquipeStatus } from '@/features/avaliacao/api';

export type ColaboradorEquipeStatusOffline = ColaboradorEquipeStatus & {
  avaliadoLocalmente?: boolean;
};

export function mergeEquipeComOffline(
  colaboradores: ColaboradorEquipeStatus[],
  offlineAvaliadoIds: Set<string>,
): ColaboradorEquipeStatusOffline[] {
  return colaboradores.map((colaborador) => {
    const avaliadoLocalmente = offlineAvaliadoIds.has(colaborador.id);

    if (!avaliadoLocalmente) {
      return colaborador;
    }

    return {
      ...colaborador,
      avaliadoNaQuinzena: true,
      avaliadoLocalmente: true,
    };
  });
}

export function splitEquipeOffline(colaboradores: ColaboradorEquipeStatusOffline[]) {
  const pendentes = colaboradores.filter((colaborador) => !colaborador.avaliadoNaQuinzena);
  const concluidas = colaboradores.filter((colaborador) => colaborador.avaliadoNaQuinzena);

  return { pendentes, concluidas };
}

export function formatCacheDate(isoDate: string): string {
  const date = new Date(isoDate);

  if (Number.isNaN(date.getTime())) {
    return '—';
  }

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
