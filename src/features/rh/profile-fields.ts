export const PROFILE_STATUS_VALUES = ['ativo', 'inativo', 'ferias', 'afastado'] as const;

export type ProfileStatusValue = (typeof PROFILE_STATUS_VALUES)[number];

export const NIVEL_IRATA_VALUES = ['N1', 'N2', 'N3', 'N/A'] as const;

export type NivelIrataValue = (typeof NIVEL_IRATA_VALUES)[number];

export const PROFILE_STATUS_LABELS: Record<ProfileStatusValue, string> = {
  ativo: 'Ativo',
  inativo: 'Inativo',
  ferias: 'Férias',
  afastado: 'Afastado',
};

export function normalizeProfileStatus(value?: string | null): ProfileStatusValue | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');

  if (normalized === 'ferias' || normalized === 'férias') {
    return 'ferias';
  }

  if (PROFILE_STATUS_VALUES.includes(normalized as ProfileStatusValue)) {
    return normalized as ProfileStatusValue;
  }

  return undefined;
}

export function normalizeNivelIrata(value?: string | null): NivelIrataValue | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const upper = value.trim().toUpperCase();

  if (upper === 'NA' || upper === 'N-A') {
    return 'N/A';
  }

  if (NIVEL_IRATA_VALUES.includes(upper as NivelIrataValue)) {
    return upper as NivelIrataValue;
  }

  return undefined;
}

export function parseCertificacaoEdn(value?: string | null): boolean | undefined {
  if (value === undefined || value === null || !String(value).trim()) {
    return undefined;
  }

  const normalized = String(value).trim().toLowerCase();

  if (['sim', 's', 'true', '1', 'yes', 'y'].includes(normalized)) {
    return true;
  }

  if (['nao', 'não', 'n', 'false', '0', 'no'].includes(normalized)) {
    return false;
  }

  return undefined;
}

export function sanitizeTelefoneDigits(value?: string | null): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const digits = value.replace(/\D/g, '');
  return digits || undefined;
}

export function validateTelefonePair(
  ddd?: string | null,
  telefone?: string | null,
): string | null {
  const dddDigits = sanitizeTelefoneDigits(ddd);
  const telefoneDigits = sanitizeTelefoneDigits(telefone);

  if (!dddDigits && !telefoneDigits) {
    return null;
  }

  if (!dddDigits || dddDigits.length !== 2) {
    return 'DDD inválido (informe 2 dígitos).';
  }

  if (!telefoneDigits || telefoneDigits.length < 8 || telefoneDigits.length > 9) {
    return 'Telefone inválido (informe 8 ou 9 dígitos).';
  }

  return null;
}
