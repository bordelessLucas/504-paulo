import Papa from 'papaparse';

import type { Database, UserRole } from '@/types/supabase';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];
type ProfileStatus = string;

export type CsvProfileRow = {
  rowNumber: number;
  id?: string;
  email?: string;
  nome: string;
  funcao?: string;
  departamento?: string;
  data_admissao?: string;
  status?: ProfileStatus;
  role?: UserRole;
};

export type ParseProfilesResult = {
  rows: CsvProfileRow[];
  errors: string[];
};

const USER_ROLES = new Set<string>([
  'colaborador',
  'supervisor',
  'gestor',
  'gerente',
  'rh',
  'ceo',
  'admin',
]);

const HEADER_ALIASES: Record<string, keyof Omit<CsvProfileRow, 'rowNumber'>> = {
  id: 'id',
  email: 'email',
  e_mail: 'email',
  'e-mail': 'email',
  nome: 'nome',
  name: 'nome',
  funcao: 'funcao',
  departamento: 'departamento',
  data_admissao: 'data_admissao',
  dataadmissao: 'data_admissao',
  'data admissao': 'data_admissao',
  status: 'status',
  role: 'role',
  perfil: 'role',
  papel: 'role',
};

function normalizeHeader(header: string): string {
  return header
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

function parseDate(value: string | undefined): string | undefined {
  if (!value?.trim()) {
    return undefined;
  }

  const trimmed = value.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
    return trimmed;
  }

  const brMatch = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (brMatch) {
    const [, day, month, year] = brMatch;
    return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
  }

  return undefined;
}

function mapRawRow(
  raw: Record<string, string | undefined>,
  rowNumber: number,
): { row?: CsvProfileRow; error?: string } {
  const mapped: Partial<CsvProfileRow> = { rowNumber };

  for (const [header, value] of Object.entries(raw)) {
    const field = HEADER_ALIASES[normalizeHeader(header)];
    if (!field || value === undefined) {
      continue;
    }

    const trimmed = value.trim();
    if (!trimmed) {
      continue;
    }

    if (field === 'status') {
      mapped.status = trimmed as ProfileStatus;
      continue;
    }

    if (field === 'role') {
      if (!USER_ROLES.has(trimmed)) {
        return {
          error: `Linha ${rowNumber}: role "${trimmed}" inválido.`,
        };
      }
      mapped.role = trimmed as UserRole;
      continue;
    }

    if (field === 'data_admissao') {
      const parsedDate = parseDate(trimmed);
      if (!parsedDate) {
        return {
          error: `Linha ${rowNumber}: data_admissao "${trimmed}" inválida (use AAAA-MM-DD ou DD/MM/AAAA).`,
        };
      }
      mapped.data_admissao = parsedDate;
      continue;
    }

    mapped[field] = trimmed as never;
  }

  if (!mapped.nome) {
    return { error: `Linha ${rowNumber}: campo "nome" é obrigatório.` };
  }

  if (!mapped.id && !mapped.email) {
    return {
      error: `Linha ${rowNumber}: informe "id" ou "email" para vincular ao usuário.`,
    };
  }

  return {
    row: {
      rowNumber,
      id: mapped.id,
      email: mapped.email,
      nome: mapped.nome,
      funcao: mapped.funcao,
      departamento: mapped.departamento,
      data_admissao: mapped.data_admissao,
      status: mapped.status,
      role: mapped.role,
    },
  };
}

export function parseProfilesCsv(csvContent: string): ParseProfilesResult {
  const parsed = Papa.parse<Record<string, string>>(csvContent, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (header) => normalizeHeader(header),
  });

  if (parsed.errors.length > 0) {
    return {
      rows: [],
      errors: parsed.errors.map((error) => `CSV: ${error.message}`),
    };
  }

  const rows: CsvProfileRow[] = [];
  const errors: string[] = [];

  parsed.data.forEach((raw, index) => {
    const rowNumber = index + 2;
    const result = mapRawRow(raw, rowNumber);

    if (result.error) {
      errors.push(result.error);
      return;
    }

    if (result.row) {
      rows.push(result.row);
    }
  });

  if (rows.length === 0 && errors.length === 0) {
    errors.push('A planilha não contém linhas válidas para importar.');
  }

  return { rows, errors };
}

export function toProfileInsert(row: CsvProfileRow, resolvedId: string): ProfileInsert {
  return {
    id: resolvedId,
    nome: row.nome,
    funcao: row.funcao ?? null,
    departamento: row.departamento ?? null,
    data_admissao: row.data_admissao ?? null,
    status: row.status ?? 'ativo',
    role: row.role ?? 'colaborador',
  };
}
