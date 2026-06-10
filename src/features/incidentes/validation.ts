import type { TipoIncidente } from '@/types/supabase';

export type CreateIncidenteInput = {
  colaboradorId: string;
  tipoIncidente: TipoIncidente;
  dataOcorrencia: string;
  descricao: string;
};

export type IncidenteValidationError = {
  field?: keyof CreateIncidenteInput | 'general';
  message: string;
};

const TIPO_INCIDENTE_VALUES: readonly TipoIncidente[] = [
  'acidente_sms',
  'no_show',
  'advertencia',
] as const;

function parseDataBrasileira(value: string): Date | null {
  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    const [year, month, day] = trimmed.split('-').map(Number);

    if (!year || !month || !day) {
      return null;
    }

    return new Date(year, month - 1, day);
  }

  const match = trimmed.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

  if (!match) {
    return null;
  }

  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);

  if (!year || !month || !day) {
    return null;
  }

  return new Date(year, month - 1, day);
}

export function normalizeDataOcorrencia(value: string): string | null {
  const parsed = parseDataBrasileira(value);

  if (!parsed || Number.isNaN(parsed.getTime())) {
    return null;
  }

  const year = parsed.getFullYear();
  const month = String(parsed.getMonth() + 1).padStart(2, '0');
  const day = String(parsed.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function validateCreateIncidente(
  input: CreateIncidenteInput,
): IncidenteValidationError | null {
  if (!input.colaboradorId.trim()) {
    return { field: 'colaboradorId', message: 'Selecione o colaborador.' };
  }

  if (!TIPO_INCIDENTE_VALUES.includes(input.tipoIncidente)) {
    return { field: 'tipoIncidente', message: 'Tipo de incidente inválido.' };
  }

  const dataNormalizada = normalizeDataOcorrencia(input.dataOcorrencia);

  if (!dataNormalizada) {
    return {
      field: 'dataOcorrencia',
      message: 'Informe a data no formato DD/MM/AAAA.',
    };
  }

  const hoje = new Date();
  hoje.setHours(23, 59, 59, 999);
  const dataOcorrencia = parseDataBrasileira(dataNormalizada);

  if (!dataOcorrencia || dataOcorrencia > hoje) {
    return {
      field: 'dataOcorrencia',
      message: 'A data da ocorrência não pode ser futura.',
    };
  }

  const descricao = input.descricao.trim();

  if (descricao.length < 5) {
    return {
      field: 'descricao',
      message: 'Descreva o incidente com pelo menos 5 caracteres.',
    };
  }

  return null;
}
