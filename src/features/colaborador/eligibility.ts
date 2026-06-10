export const MESES_JANELA_INCIDENTES = 6;

export const MENSAGEM_BLOQUEIO_DEVERES =
  'Ação bloqueada. Colaborador possui registro de quebra de deveres (SMS/Falta).';

export const MENSAGEM_BLOQUEIO_TEMPO_CASA =
  'Você poderá solicitar uma nova autoavaliação quando completar 6 meses de casa.';

export type AutoavaliacaoBloqueioMotivo = 'tempo_casa' | 'deveres' | null;

export function getDataLimiteIncidentes(referenceDate = new Date()): string {
  const limite = new Date(referenceDate);
  limite.setMonth(limite.getMonth() - MESES_JANELA_INCIDENTES);

  const year = limite.getFullYear();
  const month = String(limite.getMonth() + 1).padStart(2, '0');
  const day = String(limite.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function isBloqueadoPorDeveres(temIncidentesRecentes: boolean): boolean {
  return temIncidentesRecentes;
}

export function isElegivelPorTempoDeCasa(
  dataAdmissao: string | null | undefined,
  referenceDate = new Date(),
): boolean {
  if (!dataAdmissao?.trim()) {
    return false;
  }

  const [year, month, day] = dataAdmissao.split('-').map(Number);

  if (!year || !month || !day) {
    return false;
  }

  const admissionDate = new Date(year, month - 1, day);
  const sixMonthsAgo = new Date(referenceDate);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  return admissionDate <= sixMonthsAgo;
}

export function isElegivelParaAutoavaliacao(
  dataAdmissao: string | null | undefined,
  temIncidentesRecentes = false,
  referenceDate = new Date(),
): boolean {
  return (
    isElegivelPorTempoDeCasa(dataAdmissao, referenceDate) &&
    !isBloqueadoPorDeveres(temIncidentesRecentes)
  );
}

export function resolveMotivoBloqueioAutoavaliacao(
  dataAdmissao: string | null | undefined,
  temIncidentesRecentes: boolean,
  referenceDate = new Date(),
): AutoavaliacaoBloqueioMotivo {
  if (isBloqueadoPorDeveres(temIncidentesRecentes)) {
    return 'deveres';
  }

  if (!isElegivelPorTempoDeCasa(dataAdmissao, referenceDate)) {
    return 'tempo_casa';
  }

  return null;
}

export function formatDataAdmissao(dataAdmissao: string): string {
  const [year, month, day] = dataAdmissao.split('-');
  return `${day}/${month}/${year}`;
}
