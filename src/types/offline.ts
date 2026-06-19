import type {
  MelhoriaFormulario,
  RespostaFormulario,
} from '@/features/avaliacao/api';
import type { EquipeQuinzenaData } from '@/features/avaliacao/api';
import type { PerguntaAvaliacao, TipoAvaliacao, UserRole } from '@/types/supabase';

export type AvaliacaoOfflineStatus = 'aguardando_sync';

export type AvaliacaoOfflinePayload = {
  id_local: string;
  avaliadorId: string;
  avaliadoId: string;
  avaliadoNome: string;
  tipo: TipoAvaliacao;
  respostas: RespostaFormulario[];
  melhorias: MelhoriaFormulario[];
  pontoMelhoriaAdicional?: string;
  created_at: string;
  status: AvaliacaoOfflineStatus;
};

export type OfflineAvaliacaoRecord = {
  id_local: string;
  payload: AvaliacaoOfflinePayload;
  created_at: string;
  sincronizado: boolean;
};

export type CachedEquipeData = {
  avaliadorId: string;
  role: UserRole;
  data: EquipeQuinzenaData;
};

export type CachedPerguntasData = {
  perguntas: PerguntaAvaliacao[];
};

export type SyncResult = {
  sincronizadas: number;
  erros: number;
  detalhes: Array<{
    id_local: string;
    avaliadoNome: string;
    sucesso: boolean;
    mensagem?: string;
  }>;
};
