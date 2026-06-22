import type { TipoAvaliacao, UserRole } from '@/types/supabase';

/** Códigos das 12 seções do IMA offshore (Excel). */
export const SECOES_OFFSHORE = [
  'GO',
  'SB',
  'LG',
  'PE',
  'PR',
  'MA',
  'TR',
  'SM',
  'RH',
  'FA',
  'PG',
  'IN',
] as const;

export type SecaoOffshore = (typeof SECOES_OFFSHORE)[number];

export const SECAO_OFFSHORE_LABELS: Record<SecaoOffshore, string> = {
  GO: 'Gerente de Operações',
  SB: 'Supervisor de Bordo',
  LG: 'Logística',
  PE: 'Planejamento / Equipe',
  PR: 'Projetos',
  MA: 'Materiais',
  TR: 'Treinamento',
  SM: 'SMS',
  RH: 'RH',
  FA: 'Facilities',
  PG: 'Produção',
  IN: 'Integridade',
};

export const SECAO_OFFSHORE_PESOS: Record<SecaoOffshore, number> = {
  GO: 3,
  SB: 3,
  LG: 1,
  PE: 1,
  PR: 1,
  MA: 1,
  TR: 1,
  SM: 1,
  RH: 1,
  FA: 1,
  PG: 1,
  IN: 1,
};

export const SECAO_OFFSHORE_RADAR = SECOES_OFFSHORE.map((codigo) => ({
  codigo,
  label: SECAO_OFFSHORE_LABELS[codigo],
}));

/** Mapeamento departamento → seção (semestral). */
const DEPARTAMENTO_SECAO_MAP: Record<string, SecaoOffshore> = {
  logistica: 'LG',
  logística: 'LG',
  equipe: 'PE',
  planejamento: 'PE',
  projetos: 'PR',
  projeto: 'PR',
  materiais: 'MA',
  almoxarifado: 'MA',
  treinamento: 'TR',
  sms: 'SM',
  seguranca: 'SM',
  segurança: 'SM',
  rh: 'RH',
  facilities: 'FA',
  producao: 'PG',
  produção: 'PG',
  integridade: 'IN',
  inspecao: 'IN',
  inspeção: 'IN',
  operacoes: 'GO',
  operações: 'GO',
};

function normalizeKey(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function resolveSecaoPorDepartamento(departamento: string | null | undefined): SecaoOffshore | null {
  if (!departamento?.trim()) {
    return null;
  }

  const key = normalizeKey(departamento);

  for (const [pattern, secao] of Object.entries(DEPARTAMENTO_SECAO_MAP)) {
    if (key.includes(pattern)) {
      return secao;
    }
  }

  return null;
}

/**
 * Modelo híbrido (Excel):
 * - Quinzenal: supervisor → SB
 * - Semestral: gerente → GO; rh → RH; gestor → seção do departamento; admin/ceo → todas áreas de suporte
 */
export function resolveSecoesParaAvaliador(
  role: UserRole | null | undefined,
  tipo: TipoAvaliacao,
  departamentoAvaliador?: string | null,
): SecaoOffshore[] {
  if (!role) {
    return [];
  }

  if (tipo === 'quinzenal') {
    if (role === 'supervisor' || role === 'admin' || role === 'ceo') {
      return ['SB'];
    }
    return [];
  }

  if (tipo === 'semestral') {
    if (role === 'gerente') {
      return ['GO'];
    }
    if (role === 'rh') {
      return ['RH'];
    }
    if (role === 'gestor') {
      const secao = resolveSecaoPorDepartamento(departamentoAvaliador);
      return secao ? [secao] : ['PE'];
    }
    if (role === 'admin' || role === 'ceo') {
      return ['GO', 'LG', 'PE', 'PR', 'MA', 'TR', 'SM', 'RH', 'FA', 'PG', 'IN'];
    }
  }

  return [];
}

export const SECAO_PERGUNTAS_UNIVERSAIS = 'UNIVERSAL';
