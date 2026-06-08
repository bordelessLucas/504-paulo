const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

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
  classificacao?: string;
  nivel_irata?: NivelIrataValue;
  data_nascimento?: string;
  data_admissao?: string;
  ddd?: string;
  telefone?: string;
  expertise?: string;
  formacao_tecnica?: string;
  certificacao_edn?: boolean;
  senha_temporaria?: string;
  role?: UserRole;
  status?: ProfileStatusValue;
};

/** Senha padrão ao importar colaboradores via CSV (contas novas). */
export const CSV_IMPORT_DEFAULT_PASSWORD = '12345678';

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

  if (input.senha_temporaria?.trim() && input.senha_temporaria.trim().length < 6) {
    return {
      field: 'senha_temporaria',
      message: 'A senha temporária deve ter pelo menos 6 caracteres.',
    };
  }

  return null;
}

export function normalizeCreateColaboradorInput(input: CreateColaboradorInput): CreateColaboradorInput {
  return {
    email: input.email.trim().toLowerCase(),
    nome: input.nome.trim(),
    funcao: input.funcao?.trim() || undefined,
    departamento: input.departamento?.trim() || undefined,
    classificacao: input.classificacao?.trim() || undefined,
    nivel_irata: normalizeNivelIrata(input.nivel_irata),
    data_nascimento: parseDateField(input.data_nascimento),
    data_admissao: parseDateField(input.data_admissao),
    ddd: sanitizeTelefoneDigits(input.ddd),
    telefone: sanitizeTelefoneDigits(input.telefone),
    expertise: input.expertise?.trim() || undefined,
    formacao_tecnica: input.formacao_tecnica?.trim() || undefined,
    certificacao_edn: input.certificacao_edn ?? false,
    senha_temporaria: input.senha_temporaria?.trim() || undefined,
    role: input.role,
    status: normalizeProfileStatus(input.status) ?? 'ativo',
  };
}
