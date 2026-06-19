import * as SQLite from 'expo-sqlite';

import type {
  AvaliacaoOfflinePayload,
  CachedEquipeData,
  CachedPerguntasData,
  OfflineAvaliacaoRecord,
} from '@/types/offline';
import type { PerguntaAvaliacao } from '@/types/supabase';

const DB_NAME = 'avalia_offline.db';
const EQUIPE_CACHE_KEY = 'default';
const PERGUNTAS_CACHE_KEY = 'universal';

const EQUIPE_TTL_MS = 24 * 60 * 60 * 1000;
const PERGUNTAS_TTL_MS = 7 * 24 * 60 * 60 * 1000;

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

async function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME);
  }

  return dbPromise;
}

export function generateLocalId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }

  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export async function initOfflineDB(): Promise<void> {
  const timeoutMs = 8_000;

  await Promise.race([
    (async () => {
      const db = await getDb();

      await db.execAsync(`
    PRAGMA journal_mode = WAL;

    CREATE TABLE IF NOT EXISTS offline_avaliacoes (
      id_local TEXT PRIMARY KEY NOT NULL,
      payload TEXT NOT NULL,
      created_at TEXT NOT NULL,
      sincronizado INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS offline_equipe (
      cache_key TEXT PRIMARY KEY NOT NULL,
      dados TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS offline_perguntas (
      cache_key TEXT PRIMARY KEY NOT NULL,
      dados TEXT NOT NULL,
      atualizado_em TEXT NOT NULL
    );
  `);
    })(),
    new Promise<void>((_, reject) => {
      setTimeout(() => reject(new Error('Timeout ao inicializar SQLite offline.')), timeoutMs);
    }),
  ]);
}

function parsePayload(raw: string): AvaliacaoOfflinePayload {
  return JSON.parse(raw) as AvaliacaoOfflinePayload;
}

function isCacheValid(atualizadoEm: string, ttlMs: number): boolean {
  const timestamp = new Date(atualizadoEm).getTime();

  if (Number.isNaN(timestamp)) {
    return false;
  }

  return Date.now() - timestamp < ttlMs;
}

export async function saveAvaliacaoOffline(
  payload: Omit<AvaliacaoOfflinePayload, 'id_local' | 'created_at' | 'status'> & {
    id_local?: string;
    created_at?: string;
  },
): Promise<string> {
  const db = await getDb();
  const id_local = payload.id_local ?? generateLocalId();
  const created_at = payload.created_at ?? new Date().toISOString();

  const record: AvaliacaoOfflinePayload = {
    ...payload,
    id_local,
    created_at,
    status: 'aguardando_sync',
  };

  await db.runAsync(
    `INSERT INTO offline_avaliacoes (id_local, payload, created_at, sincronizado)
     VALUES (?, ?, ?, 0)`,
    id_local,
    JSON.stringify(record),
    created_at,
  );

  return id_local;
}

export async function getAvaliacoesPendentes(): Promise<OfflineAvaliacaoRecord[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id_local: string;
    payload: string;
    created_at: string;
    sincronizado: number;
  }>(
    `SELECT id_local, payload, created_at, sincronizado
     FROM offline_avaliacoes
     WHERE sincronizado = 0
     ORDER BY created_at ASC`,
  );

  return rows.map((row) => ({
    id_local: row.id_local,
    payload: parsePayload(row.payload),
    created_at: row.created_at,
    sincronizado: row.sincronizado === 1,
  }));
}

export async function getAllAvaliacoesOffline(): Promise<OfflineAvaliacaoRecord[]> {
  const db = await getDb();

  const rows = await db.getAllAsync<{
    id_local: string;
    payload: string;
    created_at: string;
    sincronizado: number;
  }>(
    `SELECT id_local, payload, created_at, sincronizado
     FROM offline_avaliacoes
     ORDER BY created_at ASC`,
  );

  return rows.map((row) => ({
    id_local: row.id_local,
    payload: parsePayload(row.payload),
    created_at: row.created_at,
    sincronizado: row.sincronizado === 1,
  }));
}

export async function markAsSynced(id_local: string): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `UPDATE offline_avaliacoes SET sincronizado = 1 WHERE id_local = ?`,
    id_local,
  );
}

export async function removeAvaliacaoOffline(id_local: string): Promise<void> {
  const db = await getDb();

  await db.runAsync(`DELETE FROM offline_avaliacoes WHERE id_local = ?`, id_local);
}

export async function getPendingCount(): Promise<number> {
  const db = await getDb();

  const row = await db.getFirstAsync<{ total: number }>(
    `SELECT COUNT(*) as total FROM offline_avaliacoes WHERE sincronizado = 0`,
  );

  return row?.total ?? 0;
}

export async function getOfflineAvaliadoIdsForAvaliador(
  avaliadorId: string,
): Promise<Set<string>> {
  const pendentes = await getAvaliacoesPendentes();
  const ids = new Set<string>();

  for (const item of pendentes) {
    if (item.payload.avaliadorId === avaliadorId) {
      ids.add(item.payload.avaliadoId);
    }
  }

  return ids;
}

export async function cacheEquipe(dados: CachedEquipeData): Promise<void> {
  const db = await getDb();

  await db.runAsync(
    `INSERT OR REPLACE INTO offline_equipe (cache_key, dados, atualizado_em)
     VALUES (?, ?, ?)`,
    EQUIPE_CACHE_KEY,
    JSON.stringify(dados),
    new Date().toISOString(),
  );
}

export async function getCachedEquipe(
  avaliadorId: string,
): Promise<{ data: CachedEquipeData; atualizadoEm: string } | null> {
  const db = await getDb();

  const row = await db.getFirstAsync<{ dados: string; atualizado_em: string }>(
    `SELECT dados, atualizado_em FROM offline_equipe WHERE cache_key = ?`,
    EQUIPE_CACHE_KEY,
  );

  if (!row || !isCacheValid(row.atualizado_em, EQUIPE_TTL_MS)) {
    return null;
  }

  const parsed = JSON.parse(row.dados) as CachedEquipeData;

  if (parsed.avaliadorId !== avaliadorId) {
    return null;
  }

  return { data: parsed, atualizadoEm: row.atualizado_em };
}

export async function cachePerguntas(perguntas: PerguntaAvaliacao[]): Promise<void> {
  const db = await getDb();
  const dados: CachedPerguntasData = { perguntas };

  await db.runAsync(
    `INSERT OR REPLACE INTO offline_perguntas (cache_key, dados, atualizado_em)
     VALUES (?, ?, ?)`,
    PERGUNTAS_CACHE_KEY,
    JSON.stringify(dados),
    new Date().toISOString(),
  );
}

export async function getCachedPerguntas(): Promise<{
  perguntas: PerguntaAvaliacao[];
  atualizadoEm: string;
} | null> {
  const db = await getDb();

  const row = await db.getFirstAsync<{ dados: string; atualizado_em: string }>(
    `SELECT dados, atualizado_em FROM offline_perguntas WHERE cache_key = ?`,
    PERGUNTAS_CACHE_KEY,
  );

  if (!row || !isCacheValid(row.atualizado_em, PERGUNTAS_TTL_MS)) {
    return null;
  }

  const parsed = JSON.parse(row.dados) as CachedPerguntasData;

  return {
    perguntas: parsed.perguntas,
    atualizadoEm: row.atualizado_em,
  };
}
