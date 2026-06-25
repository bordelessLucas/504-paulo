import type { PdiEixo, PdiStatus } from '@/features/pdi/types';
import { SemanticColors } from '@/constants/theme';

const semantic = SemanticColors.light;

export const PDI_EIXO_LABELS: Record<PdiEixo, string> = {
  P1: 'P1 — Técnica / Prazos',
  P2: 'P2 — Segurança / SMS',
  P3: 'P3 — Postura',
  geral: 'Geral',
};

export const PDI_EIXO_SHORT: Record<PdiEixo, string> = {
  P1: 'P1',
  P2: 'P2',
  P3: 'P3',
  geral: 'Geral',
};

export const PDI_STATUS_LABELS: Record<PdiStatus, string> = {
  aberto: 'Aberto',
  em_andamento: 'Em andamento',
  concluido: 'Concluído',
  vencido: 'Vencido',
  cancelado: 'Cancelado',
};

export const PDI_STATUS_COLORS: Record<PdiStatus, { bg: string; text: string }> = {
  aberto: semantic.info,
  em_andamento: semantic.warning,
  concluido: semantic.success,
  vencido: semantic.danger,
  cancelado: semantic.neutral,
};

export const PDI_EIXO_COLORS: Record<PdiEixo, { bg: string; text: string }> = {
  P1: { bg: '#E8EAF6', text: '#283593' },
  P2: { bg: '#FFF3E0', text: '#C2410C' },
  P3: { bg: '#F3E5F5', text: '#6A1B9A' },
  geral: semantic.neutral,
};

export const PDI_EIXO_OPTIONS: PdiEixo[] = ['P1', 'P2', 'P3', 'geral'];

export const PDI_STATUS_OPTIONS: PdiStatus[] = [
  'aberto',
  'em_andamento',
  'concluido',
  'vencido',
  'cancelado',
];

export const PDI_EVOLUCAO_LABELS = {
  sim: 'Sim — demonstrou evolução',
  parcial: 'Parcial — evolução limitada',
  nao: 'Não — sem evolução perceptível',
} as const;

export function formatPdiDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('T')[0].split('-');
  return `${day}/${month}/${year}`;
}

export function calcularDiasRestantes(prazo: string): number {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const limite = new Date(prazo.split('T')[0]);
  limite.setHours(0, 0, 0, 0);
  return Math.round((limite.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
}

export function formatPrazoRelativo(prazo: string): string {
  const dias = calcularDiasRestantes(prazo);

  if (dias < 0) {
    const vencidos = Math.abs(dias);
    return `Vencido há ${vencidos} dia${vencidos === 1 ? '' : 's'}`;
  }

  if (dias === 0) {
    return 'Vence hoje';
  }

  return `${dias} dia${dias === 1 ? '' : 's'} restante${dias === 1 ? '' : 's'}`;
}

export function resolveEixoMaisBaixo(
  respostas: Array<{ perguntaCodigo: string | null; nota: number | null }>,
): PdiEixo {
  const codigos: PdiEixo[] = ['P1', 'P2', 'P3'];
  let menorNota = Number.POSITIVE_INFINITY;
  let eixo: PdiEixo = 'geral';

  for (const codigo of codigos) {
    const resposta = respostas.find((item) => item.perguntaCodigo === codigo);

    if (resposta?.nota != null && resposta.nota < menorNota) {
      menorNota = resposta.nota;
      eixo = codigo;
    }
  }

  return eixo;
}

export function temNotaBaixa(
  respostas: Array<{ nota: number | null }>,
  limite = 1,
): boolean {
  return respostas.some((resposta) => resposta.nota != null && resposta.nota <= limite);
}
