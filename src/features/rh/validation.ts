const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

import type { UserRole } from '@/types/supabase';

export type CreateColaboradorInput = {
  email: string;
  nome: string;
  funcao?: string;
  departamento?: string;
  data_admissao?: string;
  senha_temporaria?: string;
  role?: UserRole;
  status?: string;
};

/** Senha padrão ao importar colaboradores via CSV (contas novas). */
export const CSV_IMPORT_DEFAULT_PASSWORD = '12345678';

export type ColaboradorFieldError = {
  field: keyof CreateColaboradorInput | 'general';
  message: string;
};

function parseDate(value: string | undefined): string | undefined {
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

  if (input.data_admissao?.trim()) {
    const parsedDate = parseDate(input.data_admissao);
    if (!parsedDate) {
      return {
        field: 'data_admissao',
        message: 'Data inválida. Use AAAA-MM-DD ou DD/MM/AAAA.',
      };
    }
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
    data_admissao: parseDate(input.data_admissao),
    senha_temporaria: input.senha_temporaria?.trim() || undefined,
  };
}
