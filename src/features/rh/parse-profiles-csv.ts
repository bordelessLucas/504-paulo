import Papa from 'papaparse';

import {
  normalizeNivelIrata,
  normalizeProfileStatus,
  parseCertificacaoEdn,
  sanitizeTelefoneDigits,
  validateTelefonePair,
  type NivelIrataValue,
  type ProfileStatusValue,
} from '@/features/rh/profile-fields';
import { parseDateField } from '@/features/rh/validation';
import type { Database, UserRole } from '@/types/supabase';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

export type CsvProfileRow = {
  rowNumber: number;
  id?: string;
  email?: string;
  nome: string;
  funcao?: string;
  departamento?: string;
  classificacao?: string;
  nivel_irata?: NivelIrataValue;
  data_nascimento?: string;
  data_admissao?: string;
  ddd?: string;
  telefone?: string;
  expertise?: string;
  formacao_tecnica?: string;
  certificacao_edn?: boolean;
  status?: ProfileStatusValue;
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
  classificacao: 'classificacao',
  nivel_irata: 'nivel_irata',
  nivelirata: 'nivel_irata',
  'nivel irata': 'nivel_irata',
  data_nascimento: 'data_nascimento',
  datanascimento: 'data_nascimento',
  'data nascimento': 'data_nascimento',
  data_admissao: 'data_admissao',
  dataadmissao: 'data_admissao',
  'data admissao': 'data_admissao',
  ddd: 'ddd',
  telefone: 'telefone',
  celular: 'telefone',
  expertise: 'expertise',
  especialidade: 'expertise',
  formacao_tecnica: 'formacao_tecnica',
  formacaotecnica: 'formacao_tecnica',
  'formacao tecnica': 'formacao_tecnica',
  certificacao_edn: 'certificacao_edn',
  certificacaoedn: 'certificacao_edn',
  'certificacao edn': 'certificacao_edn',
  edn: 'certificacao_edn',
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
      const status = normalizeProfileStatus(trimmed);
      if (!status) {
        return {
          error: `Erro na linha ${rowNumber}: Status "${trimmed}" inválido (use ativo, inativo, ferias, afastado).`,
        };
      }
      mapped.status = status;
      continue;
    }

    if (field === 'role') {
      if (!USER_ROLES.has(trimmed)) {
        return {
          error: `Erro na linha ${rowNumber}: role "${trimmed}" inválido.`,
        };
      }
      mapped.role = trimmed as UserRole;
      continue;
    }

    if (field === 'nivel_irata') {
      const nivel = normalizeNivelIrata(trimmed);
      if (!nivel) {
        return {
          error: `Erro na linha ${rowNumber}: nivel_irata "${trimmed}" inválido (use N1, N2, N3 ou N/A).`,
        };
      }
      mapped.nivel_irata = nivel;
      continue;
    }

    if (field === 'certificacao_edn') {
      const cert = parseCertificacaoEdn(trimmed);
      if (cert === undefined) {
        return {
          error: `Erro na linha ${rowNumber}: certificacao_edn "${trimmed}" inválido (use sim ou nao).`,
        };
      }
      mapped.certificacao_edn = cert;
      continue;
    }

    if (field === 'data_admissao' || field === 'data_nascimento') {
      const parsedDate = parseDateField(trimmed);
      if (!parsedDate) {
        const label = field === 'data_admissao' ? 'data_admissao' : 'data_nascimento';
        return {
          error: `Erro na linha ${rowNumber}: ${label} "${trimmed}" inválida (use AAAA-MM-DD ou DD/MM/AAAA).`,
        };
      }
      mapped[field] = parsedDate;
      continue;
    }

    if (field === 'ddd' || field === 'telefone') {
      mapped[field] = sanitizeTelefoneDigits(trimmed);
      continue;
    }

    mapped[field] = trimmed as never;
  }

  if (!mapped.nome) {
    return { error: `Erro na linha ${rowNumber}: campo "nome" é obrigatório.` };
  }

  if (!mapped.id && !mapped.email) {
    return {
      error: `Erro na linha ${rowNumber}: informe "id" ou "email" para vincular ao usuário.`,
    };
  }

  const telefoneError = validateTelefonePair(mapped.ddd, mapped.telefone);
  if (telefoneError) {
    return { error: `Erro na linha ${rowNumber}: ${telefoneError}` };
  }

  return {
    row: {
      rowNumber,
      id: mapped.id,
      email: mapped.email,
      nome: mapped.nome,
      funcao: mapped.funcao,
      departamento: mapped.departamento,
      classificacao: mapped.classificacao,
      nivel_irata: mapped.nivel_irata,
      data_nascimento: mapped.data_nascimento,
      data_admissao: mapped.data_admissao,
      ddd: mapped.ddd,
      telefone: mapped.telefone,
      expertise: mapped.expertise,
      formacao_tecnica: mapped.formacao_tecnica,
      certificacao_edn: mapped.certificacao_edn,
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

export function csvRowToCreateInput(row: CsvProfileRow) {
  return {
    email: row.email ?? '',
    nome: row.nome,
    funcao: row.funcao,
    departamento: row.departamento,
    classificacao: row.classificacao,
    nivel_irata: row.nivel_irata,
    data_nascimento: row.data_nascimento,
    data_admissao: row.data_admissao,
    ddd: row.ddd,
    telefone: row.telefone,
    expertise: row.expertise,
    formacao_tecnica: row.formacao_tecnica,
    certificacao_edn: row.certificacao_edn ?? false,
    role: row.role ?? 'colaborador',
    status: row.status ?? 'ativo',
  };
}

export function toProfileInsert(row: CsvProfileRow, resolvedId: string): ProfileInsert {
  return {
    id: resolvedId,
    nome: row.nome,
    funcao: row.funcao ?? null,
    departamento: row.departamento ?? null,
    classificacao: row.classificacao ?? null,
    nivel_irata: row.nivel_irata ?? null,
    data_nascimento: row.data_nascimento ?? null,
    data_admissao: row.data_admissao ?? null,
    ddd: row.ddd ?? null,
    telefone: row.telefone ?? null,
    expertise: row.expertise ?? null,
    formacao_tecnica: row.formacao_tecnica ?? null,
    certificacao_edn: row.certificacao_edn ?? false,
    status: row.status ?? 'ativo',
    role: row.role ?? 'colaborador',
  };
}
