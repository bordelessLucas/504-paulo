import {
  addPontoMelhoriaAvaliacao,
  fetchEquipeStatusCiclo,
  fetchPerguntasUniversais,
  submitAvaliacao,
} from '@/features/avaliacao/api';
import {
  getAvaliacoesPendentes,
  markAsSynced,
  cacheEquipe,
  cachePerguntas,
} from '@/services/offlineStorage';
import type { SyncResult } from '@/types/offline';
import type { UserRole } from '@/types/supabase';

function isDuplicateError(message: string): boolean {
  const normalized = message.toLowerCase();

  return (
    normalized.includes('duplicate') ||
    normalized.includes('23505') ||
    normalized.includes('409') ||
    normalized.includes('already exists')
  );
}

function isNetworkError(error: unknown): boolean {
  if (!(error instanceof Error)) {
    return false;
  }

  const message = error.message.toLowerCase();

  return (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('timeout') ||
    message.includes('offline') ||
    message.includes('connection')
  );
}

export async function syncPendingAvaliacoes(): Promise<SyncResult> {
  const pendentes = await getAvaliacoesPendentes();
  const resultado: SyncResult = {
    sincronizadas: 0,
    erros: 0,
    detalhes: [],
  };

  for (const item of pendentes) {
    const { payload } = item;

    try {
      const { avaliacaoId } = await submitAvaliacao({
        avaliadorId: payload.avaliadorId,
        avaliadoId: payload.avaliadoId,
        tipo: payload.tipo,
        respostas: payload.respostas,
        melhorias: payload.melhorias,
      });

      if (payload.pontoMelhoriaAdicional?.trim()) {
        await addPontoMelhoriaAvaliacao(avaliacaoId, payload.pontoMelhoriaAdicional);
      }

      await markAsSynced(item.id_local);

      resultado.sincronizadas += 1;
      resultado.detalhes.push({
        id_local: item.id_local,
        avaliadoNome: payload.avaliadoNome,
        sucesso: true,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro desconhecido';

      if (isDuplicateError(message)) {
        await markAsSynced(item.id_local);
        resultado.sincronizadas += 1;
        resultado.detalhes.push({
          id_local: item.id_local,
          avaliadoNome: payload.avaliadoNome,
          sucesso: true,
          mensagem: 'Já existia no servidor — marcada como sincronizada.',
        });
        continue;
      }

      if (isNetworkError(error)) {
        resultado.erros += 1;
        resultado.detalhes.push({
          id_local: item.id_local,
          avaliadoNome: payload.avaliadoNome,
          sucesso: false,
          mensagem: message,
        });
        break;
      }

      resultado.erros += 1;
      resultado.detalhes.push({
        id_local: item.id_local,
        avaliadoNome: payload.avaliadoNome,
        sucesso: false,
        mensagem: message,
      });
    }
  }

  return resultado;
}

export async function downloadEquipeParaCache(
  avaliadorId: string,
  role: UserRole | null | undefined,
): Promise<void> {
  const [equipe, perguntas] = await Promise.all([
    fetchEquipeStatusCiclo(avaliadorId, role),
    fetchPerguntasUniversais(),
  ]);

  await Promise.all([
    cacheEquipe({
      avaliadorId,
      role: role ?? 'supervisor',
      data: equipe,
    }),
    cachePerguntas(perguntas),
  ]);
}
