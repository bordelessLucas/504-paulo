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

  const payload = normalizeCreateColaboradorInput(input);

  const { data, error } = await supabase.functions.invoke('create-colaborador', {
    body: payload,
  });

  if (error) {
    return {
      field: 'general',
      message: error.message || 'Não foi possível cadastrar o colaborador.',
    };
  }

  if (data?.error) {
    return {
      field: 'general',
      message: typeof data.error === 'string' ? data.error : 'Não foi possível cadastrar o colaborador.',
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
