export type InputMask =
  | 'date'
  | 'isoDate'
  | 'time'
  | 'ddd'
  | 'phone'
  | 'phoneFull'
  | 'cnpj'
  | 'uf'
  | 'currency'
  | 'year';

export function onlyDigits(value: string): string {
  return value.replace(/\D/g, '');
}

export function maskDate(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 4) {
    return `${digits.slice(0, 2)}/${digits.slice(2)}`;
  }

  return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`;
}

export function maskIsoDate(value: string): string {
  const digits = onlyDigits(value).slice(0, 8);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 6) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 4)}-${digits.slice(4, 6)}-${digits.slice(6)}`;
}

export function maskTime(value: string): string {
  const digits = onlyDigits(value).slice(0, 4);

  if (digits.length <= 2) {
    return digits;
  }

  return `${digits.slice(0, 2)}:${digits.slice(2)}`;
}

export function maskDdd(value: string): string {
  return onlyDigits(value).slice(0, 2);
}

export function maskPhone(value: string): string {
  const digits = onlyDigits(value).slice(0, 9);

  if (digits.length <= 4) {
    return digits;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 4)}-${digits.slice(4)}`;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

export function maskPhoneFull(value: string): string {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length === 0) {
    return '';
  }

  if (digits.length <= 2) {
    return `(${digits}`;
  }

  const ddd = digits.slice(0, 2);
  const rest = digits.slice(2);

  if (rest.length === 0) {
    return `(${ddd})`;
  }

  if (rest.length <= 4) {
    return `(${ddd}) ${rest}`;
  }

  if (rest.length <= 8) {
    return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
  }

  return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

export function maskCnpj(value: string): string {
  const digits = onlyDigits(value).slice(0, 14);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

export function maskUf(value: string): string {
  return value
    .replace(/[^a-zA-Z]/g, '')
    .slice(0, 2)
    .toUpperCase();
}

export function maskYear(value: string): string {
  return onlyDigits(value).slice(0, 4);
}

export function maskCurrency(value: string): string {
  const digits = onlyDigits(value);

  if (!digits) {
    return '';
  }

  const amount = Number(digits) / 100;

  return amount.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function parseCurrency(value: string): number | null {
  const digits = onlyDigits(value);

  if (!digits) {
    return null;
  }

  const amount = Number(digits) / 100;
  return Number.isFinite(amount) ? amount : null;
}

const MASK_APPLIERS: Record<InputMask, (value: string) => string> = {
  date: maskDate,
  isoDate: maskIsoDate,
  time: maskTime,
  ddd: maskDdd,
  phone: maskPhone,
  phoneFull: maskPhoneFull,
  cnpj: maskCnpj,
  uf: maskUf,
  currency: maskCurrency,
  year: maskYear,
};

export function applyMask(mask: InputMask, value: string): string {
  return MASK_APPLIERS[mask](value);
}

export const MASK_MAX_LENGTH: Partial<Record<InputMask, number>> = {
  date: 10,
  isoDate: 10,
  time: 5,
  ddd: 2,
  phone: 10,
  phoneFull: 15,
  cnpj: 18,
  uf: 2,
  year: 4,
};
