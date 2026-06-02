export function isElegivelParaAutoavaliacao(
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

export function formatDataAdmissao(dataAdmissao: string): string {
  const [year, month, day] = dataAdmissao.split('-');
  return `${day}/${month}/${year}`;
}
