export const ALLOWED_SCORES = [0, 1, 2, 3] as const;

export type AllowedScore = (typeof ALLOWED_SCORES)[number];

export type RespostaFormState = {
  nota: number | null;
  justificativa: string;
  evidencia: string;
};

export function requiresJustificativa(nota: number | null): boolean {
  return nota === 2 || nota === 3;
}

export function isRespostaCompleta(resposta: RespostaFormState): boolean {
  if (resposta.nota === null) {
    return false;
  }

  if (requiresJustificativa(resposta.nota)) {
    return resposta.justificativa.trim().length > 0;
  }

  return true;
}

export function getRespostaValidationMessage(resposta: RespostaFormState): string | null {
  if (resposta.nota === null) {
    return 'Selecione uma nota.';
  }

  if (requiresJustificativa(resposta.nota) && !resposta.justificativa.trim()) {
    return 'Informe a justificativa para notas 2 ou 3.';
  }

  return null;
}
