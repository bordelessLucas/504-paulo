export function calcularTempoEmpresa(
  dataAdmissao: string | null | undefined,
  referenceDate = new Date(),
): { anos: number; meses: number; label: string } | null {
  if (!dataAdmissao?.trim()) {
    return null;
  }

  const [year, month, day] = dataAdmissao.split('-').map(Number);

  if (!year || !month || !day) {
    return null;
  }

  const admission = new Date(year, month - 1, day);
  const ref = new Date(referenceDate);

  let anos = ref.getFullYear() - admission.getFullYear();
  let meses = ref.getMonth() - admission.getMonth();

  if (ref.getDate() < admission.getDate()) {
    meses -= 1;
  }

  if (meses < 0) {
    anos -= 1;
    meses += 12;
  }

  if (anos < 0) {
    return null;
  }

  const partes: string[] = [];

  if (anos > 0) {
    partes.push(`${anos} ${anos === 1 ? 'ano' : 'anos'}`);
  }

  if (meses > 0 || anos === 0) {
    partes.push(`${meses} ${meses === 1 ? 'mês' : 'meses'}`);
  }

  return {
    anos,
    meses,
    label: partes.join(' e '),
  };
}
