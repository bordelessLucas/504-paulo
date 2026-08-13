const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import { getPasswordStrengthError } from '@/features/auth/validation';
import {
  normalizeNivelIrata,
  normalizeProfileStatus,
  sanitizeTelefoneDigits,
  validateTelefonePair,
  type NivelIrataValue,
  type ProfileStatusValue,
} from '@/features/rh/profile-fields';
import type { UserRole } from '@/types/supabase';

export type CreateColaboradorInput = {
  email: string;
  nome: string;
  funcao?: string;
  departamento?: string;
  lider_id?: string;
  classificacao?: string;
  nivel_irata?: NivelIrataValue;
  data_nascimento?: string;
  data_admissao?: string;
  ddd?: string;
  telefone?: string;
  expertise?: string;
  formacao_tecnica?: string;
  codigo_interno?: string;
  plataforma?: string;
  formacao_academica?: string;
  certificacoes?: string;
  certificacao_edn?: boolean;
  senha_temporaria?: string;
  role?: UserRole;
  status?: ProfileStatusValue;
  telefone_2?: string;
  endereco?: string;
  cidade_uf?: string;
  telefone_emergencia?: string;
  tipo_contrato?: string;
  especialidade?: string;
  aceita_dobra?: boolean;
  perfil_risco?: string;
  observacoes?: string;
  total_no_show?: number;
  total_bafometro_positivo?: number;
  total_toxicologico_positivo?: number;
  trocas_plataforma_avaliacao_baixa?: number;
};

/** Senha padrão ao importar colaboradores via CSV (contas novas). */
export const CSV_IMPORT_DEFAULT_PASSWORD = 'senha123';

/** Senha padrão ao gerar acesso (CEO/RH). O usuário troca no primeiro login. */
export const DEFAULT_ACCESS_PASSWORD = 'senha123';

export type ColaboradorFieldError = {
  field: keyof CreateColaboradorInput | 'general';
  message: string;
};

export function parseDateField(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return undefined;
}

export function validateCreateColaborador(
  input: CreateColaboradorInput,
): ColaboradorFieldError | null {
  const email = input.email.trim().toLowerCase();
  const nome = input.nome.trim();

  if (!nome) {
    return { field: 'nome', message: 'Informe o nome do colaborador.' };
  }

  if (nome.length < 3) {
    return { field: 'nome', message: 'O nome deve ter pelo menos 3 caracteres.' };
  }

  if (!email) {
    return { field: 'email', message: 'Informe o e-mail corporativo.' };
  }

  if (!EMAIL_REGEX.test(email)) {
    return { field: 'email', message: 'Informe um e-mail válido.' };
  }

  if (input.data_nascimento?.trim()) {
    const parsedDate = parseDateField(input.data_nascimento);
    if (!parsedDate) {
      return {
        field: 'data_nascimento',
        message: 'Data de nascimento inválida. Use AAAA-MM-DD ou DD/MM/AAAA.',
      };
    }
  }

  if (input.data_admissao?.trim()) {
    const parsedDate = parseDateField(input.data_admissao);
    if (!parsedDate) {
      return {
        field: 'data_admissao',
        message: 'Data de admissão inválida. Use AAAA-MM-DD ou DD/MM/AAAA.',
      };
    }
  }

  const telefoneError = validateTelefonePair(input.ddd, input.telefone);
  if (telefoneError) {
    return { field: 'telefone', message: telefoneError };
  }

  if (input.nivel_irata && !normalizeNivelIrata(input.nivel_irata)) {
    return { field: 'nivel_irata', message: 'Nível IRATA inválido. Use N1, N2, N3 ou N/A.' };
  }

  if (input.status && !normalizeProfileStatus(input.status)) {
    return {
      field: 'status',
      message: 'Status inválido. Use ativo, inativo, ferias ou afastado.',
    };
  }

  if (input.senha_temporaria?.trim()) {
    const passwordError = getPasswordStrengthError(input.senha_temporaria.trim());
    if (passwordError) {
      return { field: 'senha_temporaria', message: passwordError };
    }
  }

  const counterError = validateNonNegativeCounter(
    input.total_no_show,
    'total_no_show',
    'Total de no-show',
  );
  if (counterError) return counterError;

  const bafometroError = validateNonNegativeCounter(
    input.total_bafometro_positivo,
    'total_bafometro_positivo',
    'Total bafômetro positivo',
  );
  if (bafometroError) return bafometroError;

  const toxicologicoError = validateNonNegativeCounter(
    input.total_toxicologico_positivo,
    'total_toxicologico_positivo',
    'Total toxicológico positivo',
  );
  if (toxicologicoError) return toxicologicoError;

  const trocasError = validateNonNegativeCounter(
    input.trocas_plataforma_avaliacao_baixa,
    'trocas_plataforma_avaliacao_baixa',
    'Trocas de plataforma por avaliação baixa',
  );
  if (trocasError) return trocasError;

  return null;
}

function validateNonNegativeCounter(
  value: number | undefined,
  field: keyof CreateColaboradorInput,
  label: string,
): ColaboradorFieldError | null {
  if (value === undefined || value === null) {
    return null;
  }
  if (!Number.isInteger(value) || value < 0) {
    return { field, message: `${label} deve ser um número inteiro ≥ 0.` };
  }
  return null;
}

export function normalizeCreateColaboradorInput(input: CreateColaboradorInput): CreateColaboradorInput {
  return {
    email: input.email.trim().toLowerCase(),
    nome: input.nome.trim(),
    funcao: input.funcao?.trim() || undefined,
    departamento: input.departamento?.trim() || undefined,
    lider_id: input.lider_id?.trim() || undefined,
    classificacao: input.classificacao?.trim() || undefined,
    nivel_irata: normalizeNivelIrata(input.nivel_irata),
    data_nascimento: parseDateField(input.data_nascimento),
    data_admissao: parseDateField(input.data_admissao),
    ddd: sanitizeTelefoneDigits(input.ddd),
    telefone: sanitizeTelefoneDigits(input.telefone),
    expertise: input.expertise?.trim() || undefined,
    formacao_tecnica: input.formacao_tecnica?.trim() || undefined,
    codigo_interno: input.codigo_interno?.trim() || undefined,
    plataforma: input.plataforma?.trim() || undefined,
    formacao_academica: input.formacao_academica?.trim() || undefined,
    certificacoes: input.certificacoes?.trim() || undefined,
    certificacao_edn: input.certificacao_edn ?? false,
    senha_temporaria: input.senha_temporaria?.trim() || undefined,
    role: input.role,
    status: normalizeProfileStatus(input.status) ?? 'ativo',
    telefone_2: sanitizeTelefoneDigits(input.telefone_2),
    endereco: input.endereco?.trim() || undefined,
    cidade_uf: input.cidade_uf?.trim() || undefined,
    telefone_emergencia: input.telefone_emergencia?.trim() || undefined,
    tipo_contrato: input.tipo_contrato?.trim() || undefined,
    especialidade: input.especialidade?.trim() || undefined,
    aceita_dobra: input.aceita_dobra ?? false,
    perfil_risco: input.perfil_risco?.trim() || undefined,
    observacoes: input.observacoes?.trim() || undefined,
    total_no_show: normalizeCounter(input.total_no_show),
    total_bafometro_positivo: normalizeCounter(input.total_bafometro_positivo),
    total_toxicologico_positivo: normalizeCounter(input.total_toxicologico_positivo),
    trocas_plataforma_avaliacao_baixa: normalizeCounter(
      input.trocas_plataforma_avaliacao_baixa,
    ),
  };
}

function normalizeCounter(value: number | undefined): number | undefined {
  if (value === undefined || value === null || Number.isNaN(value)) {
    return undefined;
  }
  return Math.max(0, Math.floor(value));
}
