/** Cores fixas da marca Vertek Avalia — não variam com light/dark. */
export const brand = {
  navy: '#012D60',
  navyDeep: '#011A38',
  navyMid: '#023A72',
  green: '#00A675',
  greenBright: '#00C48C',
  greenSoft: '#7DFFD0',
  cream: '#F0EDE4',
  white: '#FFFFFF',
} as const;

export type BrandColor = keyof typeof brand;

export function brandRgb(hex: string, alpha: number): string {
  const normalized = hex.replace('#', '');
  const r = parseInt(normalized.slice(0, 2), 16);
  const g = parseInt(normalized.slice(2, 4), 16);
  const b = parseInt(normalized.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}

/** @deprecated Use `brand` */
export const BrandColors = {
  primary: brand.navy,
  secondary: brand.green,
  background: brand.cream,
  card: brand.white,
  focus: '#6D5BFF',
  textOnPrimary: brand.white,
} as const;
