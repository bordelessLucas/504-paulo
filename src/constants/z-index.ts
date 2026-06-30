/** Escala semântica de z-index — evitar valores arbitrários (999, 9999). */
export const zIndex = {
  base: 0,
  sticky: 10,
  header: 20,
  modal: 30,
  toast: 40,
} as const;

export type ZIndexLayer = keyof typeof zIndex;
