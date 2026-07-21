import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { EscalaLegenda } from '@/components/avaliacao/escala-legenda';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { MetricStrip } from '@/components/premium/MetricStrip';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useToast } from '@/components/ui/toast';
import { layout } from '@/constants/theme';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import {
  emptyNotaLote,
  fetchSessaoLoteContext,
  mediaLinhaLote,
  resumirSessaoLote,
  statusLinhaLote,
  submitAvaliacoesLote,
  type ColaboradorLote,
  type NotaLoteState,
} from '@/features/avaliacao/lote-api';
import { SECAO_OFFSHORE_LABELS, type SecaoOffshore } from '@/features/avaliacao/secoes-offshore';
import { useAuth } from '@/features/auth/auth-context';
import type { ClienteComUnidades } from '@/features/clientes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTheme } from '@/hooks/use-theme';
import type { PerguntaAvaliacao, TipoAvaliacao } from '@/types/supabase';
import { confirmAction } from '@/utils/confirm-action';

const SCORE_OPTIONS = [0, 1, 2, 3] as const;

export function FormularioLoteScreen() {
  const theme = useTheme();
  const { user } = useAuth();
  const { role } = useAuthRole();
  const { showToast } = useToast();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tipo, setTipo] = useState<TipoAvaliacao>('quinzenal');
  const [perguntas, setPerguntas] = useState<PerguntaAvaliacao[]>([]);
  const [colaboradores, setColaboradores] = useState<ColaboradorLote[]>([]);
  const [clientes, setClientes] = useState<ClienteComUnidades[]>([]);
  const [filtroNome, setFiltroNome] = useState('');
  const [clienteId, setClienteId] = useState<string | null>(null);
  const [unidadeId, setUnidadeId] = useState<string | null>(null);
  const [periodoInicio, setPeriodoInicio] = useState('');
  const [periodoFim, setPeriodoFim] = useState('');
  const [quinzena, setQuinzena] = useState('');
  const [notas, setNotas] = useState<Record<string, NotaLoteState>>({});
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      setError(null);
      try {
        const ctx = await fetchSessaoLoteContext({
          role,
          departamentoAvaliador: user?.departamento,
        });
        setTipo(ctx.tipo);
        setPerguntas(ctx.perguntas);
        setColaboradores(ctx.colaboradores);
        setClientes(ctx.clientes);
        const initial: Record<string, NotaLoteState> = {};
        for (const c of ctx.colaboradores) {
          initial[c.id] = emptyNotaLote();
        }
        setNotas(initial);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar sessão.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, [role, user?.departamento]);

  const filtered = useMemo(() => {
    const q = filtroNome.trim().toLowerCase();
    if (!q) return colaboradores;
    return colaboradores.filter((c) => c.nome.toLowerCase().includes(q));
  }, [colaboradores, filtroNome]);

  const resumo = useMemo(
    () => resumirSessaoLote(notas, filtered.map((c) => c.id)),
    [filtered, notas],
  );

  const unidades = useMemo(() => {
    const cliente = clientes.find((c) => c.id === clienteId);
    return cliente?.unidades ?? [];
  }, [clienteId, clientes]);

  const updateNota = useCallback((id: string, patch: Partial<NotaLoteState>) => {
    setNotas((current) => ({
      ...current,
      [id]: { ...(current[id] ?? emptyNotaLote()), ...patch },
    }));
  }, []);

  const handleSubmit = useCallback(async () => {
    if (!user?.id || isSubmitting) return;

    const confirmed = await confirmAction(
      'Enviar avaliações em lote',
      `Serão enviadas ${resumo.completos} avaliações completas para validação do RH.`,
    );
    if (!confirmed) return;

    setIsSubmitting(true);
    try {
      const result = await submitAvaliacoesLote({
        avaliadorId: user.id,
        tipo,
        perguntas,
        notas,
        periodoInicio: periodoInicio || undefined,
        periodoFim: periodoFim || undefined,
        quinzena: quinzena || undefined,
        clienteId,
        unidadeId,
      });
      showToast(`${result.salvos} avaliação(ões) enviada(s).`, 'success');
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Erro ao enviar lote.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  }, [
    clienteId,
    isSubmitting,
    notas,
    periodoFim,
    periodoInicio,
    perguntas,
    quinzena,
    resumo.completos,
    showToast,
    tipo,
    unidadeId,
    user?.id,
  ]);

  if (isLoading) {
    return (
      <TabScreenContainer scrollable contentContainerStyle={styles.content}>
        <SkeletonLoader />
      </TabScreenContainer>
    );
  }

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Formulário de Avaliação (Lote)"
        description={`${TIPO_AVALIACAO_LABELS[tipo]} — preencha as 3 notas por colaborador.`}
      />

      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      <GlassCard>
        <ThemedText type="smallBold">Filtros e configuração</ThemedText>
        <View style={styles.form}>
          <Input
            label="Período início"
            mask="isoDate"
            value={periodoInicio}
            onChangeText={setPeriodoInicio}
            placeholder="2026-06-01"
          />
          <Input
            label="Período fim"
            mask="isoDate"
            value={periodoFim}
            onChangeText={setPeriodoFim}
            placeholder="2026-06-15"
          />
          <Input
            label="Quinzena"
            value={quinzena}
            onChangeText={setQuinzena}
            placeholder="2026_Q2"
          />
          <ThemedText type="small">Cliente</ThemedText>
          <View style={styles.chips}>
            {clientes.map((c) => (
              <Pressable
                key={c.id}
                onPress={() => {
                  setClienteId(c.id);
                  setUnidadeId(null);
                }}
                style={[
                  styles.chip,
                  {
                    borderColor: clienteId === c.id ? theme.accent : theme.border,
                    backgroundColor: clienteId === c.id ? theme.accentMuted : theme.surfaceCard,
                  },
                ]}>
                <ThemedText type="small">{c.nomeFantasia ?? c.razaoSocial}</ThemedText>
              </Pressable>
            ))}
          </View>
          {unidades.length > 0 ? (
            <>
              <ThemedText type="small">Unidade</ThemedText>
              <View style={styles.chips}>
                {unidades.map((u) => (
                  <Pressable
                    key={u.id}
                    onPress={() => setUnidadeId(u.id)}
                    style={[
                      styles.chip,
                      {
                        borderColor: unidadeId === u.id ? theme.accent : theme.border,
                        backgroundColor: unidadeId === u.id ? theme.accentMuted : theme.surfaceCard,
                      },
                    ]}>
                    <ThemedText type="small">{u.nome}</ThemedText>
                  </Pressable>
                ))}
              </View>
            </>
          ) : null}
        </View>
      </GlassCard>

      <EscalaLegenda />

      <GlassCard>
        <ThemedText type="smallBold">Critérios do avaliador</ThemedText>
        {perguntas.map((p, index) => (
          <View key={p.id} style={styles.pergunta}>
            <ThemedText type="smallBold">
              N{index + 1} · {p.codigo ?? '—'}
            </ThemedText>
            <ThemedText type="small">{p.descricao}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Seção:{' '}
              {p.secao_departamento && p.secao_departamento in SECAO_OFFSHORE_LABELS
                ? SECAO_OFFSHORE_LABELS[p.secao_departamento as SecaoOffshore]
                : p.secao_departamento}{' '}
              · Peso {p.peso}
            </ThemedText>
          </View>
        ))}
      </GlassCard>

      <MetricStrip
        metrics={[
          { label: 'Total', value: String(resumo.total), tone: 'neutral' },
          { label: 'Completos', value: String(resumo.completos), tone: 'success' },
          { label: 'Parciais', value: String(resumo.parciais), tone: 'warning' },
          { label: 'Pendentes', value: String(resumo.pendentes), tone: 'info' },
        ]}
      />

      <Input
        label="Filtro por nome"
        value={filtroNome}
        onChangeText={setFiltroNome}
        placeholder="Buscar colaborador"
      />

      {filtered.map((colab) => {
        const nota = notas[colab.id] ?? emptyNotaLote();
        const status = statusLinhaLote(nota);
        const media = mediaLinhaLote(nota);
        const expanded = expandedId === colab.id;

        return (
          <GlassCard key={colab.id} padding="compact">
            <Pressable onPress={() => setExpandedId(expanded ? null : colab.id)}>
              <View style={styles.headerRow}>
                <View style={styles.flex}>
                  <ThemedText type="smallBold">{colab.nome}</ThemedText>
                  <ThemedText themeColor="textSecondary" type="small">
                    {colab.funcao ?? '—'} · IRATA {colab.nivelIrata ?? '—'}
                  </ThemedText>
                </View>
                <StatusBadge
                  label={
                    status === 'completo'
                      ? 'Completo'
                      : status === 'parcial'
                        ? 'Parcial'
                        : 'Pendente'
                  }
                  tone={
                    status === 'completo' ? 'success' : status === 'parcial' ? 'warning' : 'neutral'
                  }
                  size="sm"
                />
              </View>
              <ThemedText type="small">
                Notas: {nota.n1 ?? '—'} / {nota.n2 ?? '—'} / {nota.n3 ?? '—'} · Média:{' '}
                {media !== null ? media.toFixed(2) : '—'}
              </ThemedText>
            </Pressable>

            {expanded ? (
              <View style={styles.expanded}>
                {(['n1', 'n2', 'n3'] as const).map((key, index) => (
                  <View key={key} style={styles.scoreBlock}>
                    <ThemedText type="smallBold">N{index + 1}</ThemedText>
                    <View style={styles.chips}>
                      {SCORE_OPTIONS.map((score) => (
                        <Pressable
                          key={score}
                          onPress={() => updateNota(colab.id, { [key]: score })}
                          style={[
                            styles.scoreChip,
                            {
                              borderColor:
                                nota[key] === score ? theme.accent : theme.border,
                              backgroundColor:
                                nota[key] === score ? theme.accentMuted : theme.background,
                            },
                          ]}>
                          <ThemedText type="smallBold">{score}</ThemedText>
                        </Pressable>
                      ))}
                    </View>
                  </View>
                ))}
                <Input
                  label="Justificativa (obrigatória se nota 0 ou 1)"
                  value={nota.justificativa}
                  onChangeText={(justificativa) => updateNota(colab.id, { justificativa })}
                />
                <Input
                  label="Evidência (obrigatória se nota 3)"
                  value={nota.evidencia}
                  onChangeText={(evidencia) => updateNota(colab.id, { evidencia })}
                />
              </View>
            ) : null}
          </GlassCard>
        );
      })}

      <Button
        label={isSubmitting ? 'Enviando…' : `Enviar ${resumo.completos} completos`}
        onPress={() => void handleSubmit()}
        disabled={isSubmitting || resumo.completos === 0}
      />
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  form: { gap: layout.space.sm, marginTop: layout.space.sm },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: layout.space.xs },
  chip: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: layout.space.sm,
    paddingVertical: 6,
  },
  pergunta: { marginTop: layout.space.sm, gap: 2 },
  headerRow: { flexDirection: 'row', gap: layout.space.sm, alignItems: 'flex-start' },
  flex: { flex: 1 },
  expanded: { marginTop: layout.space.sm, gap: layout.space.sm },
  scoreBlock: { gap: 4 },
  scoreChip: {
    width: 40,
    height: 36,
    borderWidth: 1,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
