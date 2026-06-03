import { createColaborador } from '@/features/rh/create-colaborador';
import {
  parseProfilesCsv,
  toProfileInsert,
  type CsvProfileRow,
} from '@/features/rh/parse-profiles-csv';
import { CSV_IMPORT_DEFAULT_PASSWORD } from '@/features/rh/validation';
import { supabase } from '@/lib/supabase';
import type { Database } from '@/types/supabase';

type ProfileInsert = Database['public']['Tables']['profiles']['Insert'];

const BATCH_SIZE = 50;

async function findUserIdByEmail(email: string): Promise<string | null> {
  const { data, error } = await supabase.rpc('get_user_id_by_email', {
    p_email: email.trim().toLowerCase(),
  });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? null;
}

async function resolveOrCreateUserId(
  row: CsvProfileRow,
): Promise<{ userId: string; authCreated: boolean }> {
  if (row.id) {
    return { userId: row.id, authCreated: false };
  }

  if (!row.email) {
    throw new Error(`Linha ${row.rowNumber}: informe "email" para criar o acesso.`);
  }

  const email = row.email.trim().toLowerCase();
  const existingId = await findUserIdByEmail(email);

  if (existingId) {
    return { userId: existingId, authCreated: false };
  }

  const result = await createColaborador({
    email,
    nome: row.nome,
    funcao: row.funcao,
    departamento: row.departamento,
    data_admissao: row.data_admissao,
    senha_temporaria: CSV_IMPORT_DEFAULT_PASSWORD,
    role: row.role ?? 'colaborador',
    status: row.status ?? 'ativo',
  });

  if ('field' in result) {
    throw new Error(`Linha ${row.rowNumber}: ${result.message}`);
  }

  return { userId: result.id, authCreated: result.authCreated };
}

export type UploadProfilesResult = {
  importedCount: number;
  createdAuthCount: number;
  skippedErrors: string[];
};

export async function uploadProfilesFromCsv(
  csvContent: string,
): Promise<UploadProfilesResult> {
  const { rows, errors: parseErrors } = parseProfilesCsv(csvContent);

  if (parseErrors.length > 0) {
    return { importedCount: 0, createdAuthCount: 0, skippedErrors: parseErrors };
  }

  const skippedErrors: string[] = [];
  const profilesToUpsert: ProfileInsert[] = [];
  let createdAuthCount = 0;

  for (const row of rows) {
    try {
      const { userId, authCreated } = await resolveOrCreateUserId(row);

      if (authCreated) {
        createdAuthCount += 1;
      }

      profilesToUpsert.push(toProfileInsert(row, userId));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Erro desconhecido ao processar linha.';
      skippedErrors.push(message);
    }
  }

  if (profilesToUpsert.length === 0) {
    return { importedCount: 0, createdAuthCount: 0, skippedErrors };
  }

  for (let index = 0; index < profilesToUpsert.length; index += BATCH_SIZE) {
    const batch = profilesToUpsert.slice(index, index + BATCH_SIZE);

    const { error } = await supabase.from('profiles').upsert(batch, {
      onConflict: 'id',
    });

    if (error) {
      throw new Error(
        `Falha no lote ${Math.floor(index / BATCH_SIZE) + 1}: ${error.message}`,
      );
    }
  }

  return {
    importedCount: profilesToUpsert.length,
    createdAuthCount,
    skippedErrors,
  };
}
