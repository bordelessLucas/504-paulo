import { SemaforoColors } from '@/constants/theme';

export type SemaforoStatus = 'verde' | 'amarelo' | 'cinza' | 'laranja' | 'vermelho';

export type SemaforoItem = {
  status: SemaforoStatus;
  label: string;
  description: string;
  color: string;
};

export const SEMAFORO_ITENS: SemaforoItem[] = [
  {
    status: 'verde',
    label: 'Verde',
    description: 'Média ≥ 2,5 (escala 0–3)',
    color: SemaforoColors.verde,
  },
  {
    status: 'amarelo',
    label: 'Amarelo',
    description: 'Média ≥ 2,0',
    color: SemaforoColors.amarelo,
  },
  {
    status: 'laranja',
    label: 'Laranja',
    description: 'Média ≥ 1,0',
    color: SemaforoColors.laranja,
  },
  {
    status: 'vermelho',
    label: 'Vermelho',
    description: 'Média < 1,0',
    color: SemaforoColors.vermelho,
  },
  {
    status: 'cinza',
    label: 'Cinza',
    description: 'Sem dados',
    color: SemaforoColors.cinza,
  },
];

export function getSemaforoPorMedia(media: number | null): SemaforoStatus {
  if (media === null) {
    return 'cinza';
  }

  if (media >= 2.5) {
    return 'verde';
  }

  if (media >= 2) {
    return 'amarelo';
  }

  if (media >= 1) {
    return 'laranja';
  }

  return 'vermelho';
}

export function getSemaforoItem(status: SemaforoStatus): SemaforoItem {
  return SEMAFORO_ITENS.find((item) => item.status === status) ?? SEMAFORO_ITENS[4];
}
