import { supabase } from '@/lib/supabase';

import {
  normalizeCreateColaboradorInput,
  validateCreateColaborador,
  type ColaboradorFieldError,
  type CreateColaboradorInput,
} from '@/features/rh/validation';

export type CreateColaboradorResult = {
  id: string;
  authCreated: boolean;
};

export async function createColaborador(
  input: CreateColaboradorInput,
): Promise<CreateColaboradorResult | ColaboradorFieldError> {
  const validationError = validateCreateColaborador(input);
  if (validationError) {
    return validationError;
  }

  const normalized = normalizeCreateColaboradorInput(input);

  const { data, error } = await supabase.functions.invoke('create-colaborador', {
    body: {
      ...normalized,
      role: input.role ?? 'colaborador',
      status: input.status?.trim() || 'ativo',
    },
  });

  const responseError =
    typeof data?.error === 'string'
      ? data.error
      : data?.error && typeof data.error === 'object' && 'message' in data.error
        ? String((data.error as { message: unknown }).message)
        : null;

  if (error || responseError) {
    return {
      field: 'general',
      message:
        responseError ||
        error?.message ||
        'Não foi possível cadastrar o colaborador.',
    };
  }

  if (!data?.id) {
    return {
      field: 'general',
      message: 'Resposta inválida ao cadastrar colaborador.',
    };
  }

  return {
    id: data.id as string,
    authCreated: Boolean(data.authCreated),
  };
}
