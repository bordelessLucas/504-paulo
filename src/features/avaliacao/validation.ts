export const ALLOWED_SCORES = [0, 1, 2, 3] as const;

export type AllowedScore = (typeof ALLOWED_SCORES)[number];

export type RespostaFormState = {
  nota: number | null;
  justificativa: string;
  evidencia: string;
};

/** Notas 0 ou 1 exigem justificativa (governança). */
export function requiresJustificativa(nota: number | null): boolean {
  return nota !== null && nota <= 1;
}

/** Nota 3 exige evidência (governança). */
export function requiresEvidencia(nota: number | null): boolean {
  return nota !== null && nota >= 3;
}

export function isRespostaCompleta(resposta: RespostaFormState): boolean {
  if (resposta.nota === null) {
    return false;
  }

  if (requiresJustificativa(resposta.nota) && !resposta.justificativa.trim()) {
    return false;
  }

  if (requiresEvidencia(resposta.nota) && !resposta.evidencia.trim()) {
    return false;
  }

  return true;
}

export function getRespostaValidationMessage(resposta: RespostaFormState): string | null {
  if (resposta.nota === null) {
    return 'Selecione uma nota.';
  }

  if (requiresJustificativa(resposta.nota) && !resposta.justificativa.trim()) {
    return 'Informe a justificativa para notas 0 ou 1.';
  }

  if (requiresEvidencia(resposta.nota) && !resposta.evidencia.trim()) {
    return 'Anexe uma evidência para nota 3.';
  }

  return null;
}
