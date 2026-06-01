import {
  parseProfilesCsv,
  toProfileInsert,
  type CsvProfileRow,
} from "@/features/rh/parse-profiles-csv";
import { supabase } from "@/lib/supabase";
import type { Database } from "@/types/supabase";

type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

const BATCH_SIZE = 50;

async function resolveUserId(row: CsvProfileRow): Promise<string | null> {
  if (row.id) {
    return row.id;
  }

  if (!row.email) {
    return null;
  }

  const { data, error } = await supabase.rpc("get_user_id_by_email", {
    p_email: row.email,
  });

  if (error) {
    throw new Error(`Linha ${row.rowNumber}: ${error.message}`);
  }

  if (!data) {
    throw new Error(
      `Linha ${row.rowNumber}: usuário com e-mail "${row.email}" não encontrado no Auth.`,
    );
  }

  return data;
}

export type UploadProfilesResult = {
  importedCount: number;
  skippedErrors: string[];
};

export async function uploadProfilesFromCsv(
  csvContent: string,
): Promise<UploadProfilesResult> {
  const { rows, errors: parseErrors } = parseProfilesCsv(csvContent);

  if (parseErrors.length > 0) {
    return { importedCount: 0, skippedErrors: parseErrors };
  }

  const skippedErrors: string[] = [];
  const profilesToUpsert: ProfileInsert[] = [];

  for (const row of rows) {
    try {
      const userId = await resolveUserId(row);
      if (!userId) {
        skippedErrors.push(
          `Linha ${row.rowNumber}: não foi possível resolver o ID do usuário.`,
        );
        continue;
      }

      profilesToUpsert.push(toProfileInsert(row, userId));
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao processar linha.";
      skippedErrors.push(message);
    }
  }

  if (profilesToUpsert.length === 0) {
    return { importedCount: 0, skippedErrors };
  }

  for (let index = 0; index < profilesToUpsert.length; index += BATCH_SIZE) {
    const batch = profilesToUpsert.slice(index, index + BATCH_SIZE);

    const { error } = await supabase.from("profiles").upsert(batch, {
      onConflict: "id",
    });

    if (error) {
      throw new Error(
        `Falha no lote ${Math.floor(index / BATCH_SIZE) + 1}: ${error.message}`,
      );
    }
  }

  return {
    importedCount: profilesToUpsert.length,
    skippedErrors,
  };
}
