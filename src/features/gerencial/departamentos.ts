export const DEPARTAMENTOS_EMPRESA = [
  'Operações Bordo',
  'Operações Terra',
  'RH',
  'Financeiro',
  'Comercial',
  'TI',
  'Engenharia',
  'QHSE',
  'Logística',
  'Manutenção',
  'Projetos',
  'Jurídico',
] as const;

export type DepartamentoEmpresa = (typeof DEPARTAMENTOS_EMPRESA)[number];

function normalizeDepartamento(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

export function matchDepartamentoEmpresa(departamento: string | null | undefined): DepartamentoEmpresa | null {
  if (!departamento?.trim()) {
    return null;
  }

  const normalized = normalizeDepartamento(departamento);

  return (
    DEPARTAMENTOS_EMPRESA.find(
      (item) =>
        normalizeDepartamento(item) === normalized ||
        normalized.includes(normalizeDepartamento(item)) ||
        normalizeDepartamento(item).includes(normalized),
    ) ?? null
  );
}

export function buildRadarDepartamentos(
  mediasPorDepartamento: Map<DepartamentoEmpresa, number[]>,
): { labels: string[]; valores: number[] } {
  const labels = DEPARTAMENTOS_EMPRESA.map((departamento) =>
    departamento.length > 12 ? `${departamento.slice(0, 10)}…` : departamento,
  );

  const valores = DEPARTAMENTOS_EMPRESA.map((departamento) => {
    const notas = mediasPorDepartamento.get(departamento) ?? [];

    if (notas.length === 0) {
      return 0;
    }

    return notas.reduce((total, nota) => total + nota, 0) / notas.length;
  });

  return { labels, valores };
}
