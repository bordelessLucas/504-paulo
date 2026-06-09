export const ALLOWED_SCORES = [0, 1, 2, 3] as const;

export type AllowedScore = (typeof ALLOWED_SCORES)[number];

export type RespostaFormState = {
  nota: number | null;
  justificativa: string;
  evidencia: string;
};

export function requiresJustificativa(nota: number | null): boolean {
  return nota !== null;
}

export function isRespostaCompleta(resposta: RespostaFormState): boolean {
  if (resposta.nota === null) {
    return false;
  }

  return resposta.justificativa.trim().length > 0;
}

export function getRespostaValidationMessage(resposta: RespostaFormState): string | null {
  if (resposta.nota === null) {
    return 'Selecione uma nota.';
  }

  if (!resposta.justificativa.trim()) {
    return 'Informe a justificativa da nota atribuída.';
  }

  return null;
}
