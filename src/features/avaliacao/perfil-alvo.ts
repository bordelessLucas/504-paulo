import type { PerfilAlvo } from '@/types/supabase';

function normalize(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolvePerfilAlvo(
  departamento?: string | null,
  funcao?: string | null,
): PerfilAlvo {
  const combined = normalize(`${departamento ?? ''} ${funcao ?? ''}`);

  if (
    combined.includes('bordo') ||
    combined.includes('operac') ||
    combined.includes('campo') ||
    combined.includes('offshore')
  ) {
    return 'bordo';
  }

  if (
    combined.includes('tecnico') ||
    combined.includes('ti') ||
    combined.includes('engenharia') ||
    combined.includes('desenvolv') ||
    combined.includes('tech')
  ) {
    return 'tecnico';
  }

  if (
    combined.includes('rh') ||
    combined.includes('recursos humanos') ||
    combined.includes('people') ||
    combined.includes('administrativo')
  ) {
    return 'rh';
  }

  return 'rh';
}

export const PERFIL_ALVO_LABELS: Record<PerfilAlvo, string> = {
  rh: 'RH',
  tecnico: 'Técnico',
  bordo: 'Bordo',
};
