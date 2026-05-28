import { resolvePerfilAlvo } from '@/features/avaliacao/perfil-alvo';
import { supabase } from '@/lib/supabase';
import type {
  PerguntaAvaliacao,
  PerfilAlvo,
  PontoMelhoria,
  Profile,
  TipoAvaliacao,
} from '@/types/supabase';

export const COLABORADORES_PAGE_SIZE = 10;

export type ColaboradorResumo = Pick<Profile, 'id' | 'nome' | 'departamento' | 'funcao'>;

export type ColaboradoresPage = {
  items: ColaboradorResumo[];
  total: number;
  page: number;
  pageSize: number;
};

export type RespostaFormulario = {
  perguntaId: string;
  nota: number;
  comentario?: string;
};

export type MelhoriaFormulario = {
  pontoId: string;
  melhorou: boolean;
};

export async function fetchColaboradoresPage(
  avaliadorId: string,
  page: number,
): Promise<ColaboradoresPage> {
  const from = page * COLABORADORES_PAGE_SIZE;
  const to = from + COLABORADORES_PAGE_SIZE - 1;

  const { data, error, count } = await supabase
    .from('profiles')
    .select('id, nome, departamento, funcao', { count: 'exact' })
    .eq('role', 'colaborador')
    .neq('id', avaliadorId)
    .order('nome', { ascending: true })
    .range(from, to);

  if (error) {
    throw new Error(error.message);
  }

  return {
    items: data ?? [],
    total: count ?? 0,
    page,
    pageSize: COLABORADORES_PAGE_SIZE,
  };
}

export async function fetchPerguntasPorAvaliador(
  departamento?: string | null,
  funcao?: string | null,
): Promise<{ perguntas: PerguntaAvaliacao[]; perfilAlvo: PerfilAlvo }> {
  const perfilAlvo = resolvePerfilAlvo(departamento, funcao);

  const { data, error } = await supabase
    .from('perguntas_avaliacao')
    .select('*')
    .eq('perfil_alvo', perfilAlvo)
    .order('peso', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return { perguntas: data ?? [], perfilAlvo };
}

export async function fetchPontosMelhoriaPendentes(avaliadoId: string): Promise<PontoMelhoria[]> {
  const { data, error } = await supabase
    .from('pontos_melhoria')
    .select('*')
    .eq('avaliado_id', avaliadoId)
    .eq('resolvido', false)
    .order('data_criacao', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return data ?? [];
}

export async function submitAvaliacao(params: {
  avaliadorId: string;
  avaliadoId: string;
  tipo?: TipoAvaliacao;
  respostas: RespostaFormulario[];
  melhorias: MelhoriaFormulario[];
}): Promise<void> {
  const { data: avaliacao, error: avaliacaoError } = await supabase
    .from('avaliacoes')
    .insert({
      avaliador_id: params.avaliadorId,
      avaliado_id: params.avaliadoId,
      tipo: params.tipo ?? 'quinzenal',
      data: new Date().toISOString().slice(0, 10),
    })
    .select('id')
    .single();

  if (avaliacaoError) {
    throw new Error(avaliacaoError.message);
  }

  if (params.respostas.length > 0) {
    const { error: respostasError } = await supabase.from('respostas_avaliacao').insert(
      params.respostas.map((resposta) => ({
        avaliacao_id: avaliacao.id,
        pergunta_id: resposta.perguntaId,
        nota: resposta.nota,
        comentario: resposta.comentario?.trim() || null,
      })),
    );

    if (respostasError) {
      throw new Error(respostasError.message);
    }
  }

  const pontosResolvidos = params.melhorias.filter((item) => item.melhorou);

  for (const ponto of pontosResolvidos) {
    const { error } = await supabase
      .from('pontos_melhoria')
      .update({ resolvido: true })
      .eq('id', ponto.pontoId);

    if (error) {
      throw new Error(error.message);
    }
  }
}
