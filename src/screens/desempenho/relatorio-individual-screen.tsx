import { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import { SECAO_OFFSHORE_LABELS, SECOES_OFFSHORE } from '@/features/avaliacao/secoes-offshore';
import {
  fetchColaboradoresParaRelatorio,
  fetchRelatorioIndividual,
  type ColaboradorBusca,
  type RelatorioIndividual,
} from '@/features/desempenho/relatorio-api';
import { useTheme } from '@/hooks/use-theme';

export function RelatorioIndividualScreen() {
  const theme = useTheme();
  const [colaboradores, setColaboradores] = useState<ColaboradorBusca[]>([]);
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [relatorio, setRelatorio] = useState<RelatorioIndividual | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingRelatorio, setIsLoadingRelatorio] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      setIsLoading(true);
      try {
        setColaboradores(await fetchColaboradoresParaRelatorio());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar colaboradores.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const termo = query.trim().toLowerCase();
    if (!termo) return colaboradores.slice(0, 30);
    return colaboradores.filter((c) => c.nome.toLowerCase().includes(termo)).slice(0, 30);
  }, [colaboradores, query]);

  const loadRelatorio = useCallback(async (id: string) => {
    setSelectedId(id);
    setIsLoadingRelatorio(true);
    setError(null);
    try {
      setRelatorio(await fetchRelatorioIndividual(id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao carregar relatório.');
      setRelatorio(null);
    } finally {
      setIsLoadingRelatorio(false);
    }
  }, []);

  const ficha = relatorio?.ficha ?? null;
  const radarLabels = ficha?.radarOffshore.labels ?? SECOES_OFFSHORE.map((s) => SECAO_OFFSHORE_LABELS[s]);
  const radarValores = ficha?.radarOffshore.valores ?? SECOES_OFFSHORE.map(() => 0);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Relatório de Desempenho Individual"
        description="Notas por área avaliadora, IMA, classificação e visão 360°."
      />

      <Input
        label="Selecionar funcionário"
        onChangeText={setQuery}
        placeholder="Buscar por nome"
        value={query}
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      <View style={styles.list}>
        {filtered.map((c) => (
          <Pressable
            key={c.id}
            onPress={() => void loadRelatorio(c.id)}
            style={[
              styles.item,
              {
                borderColor: selectedId === c.id ? theme.accent : theme.border,
                backgroundColor: theme.surfaceCard,
              },
            ]}>
            <ThemedText type="smallBold">{c.nome}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {[c.funcao, c.departamento].filter(Boolean).join(' · ') || '—'}
            </ThemedText>
          </Pressable>
        ))}
      </View>

      {isLoadingRelatorio ? <SkeletonLoader /> : null}

      {ficha && relatorio ? (
        <>
          <GlassCard>
            <ThemedText type="sectionTitle">{ficha.profile.nome}</ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              {ficha.profile.funcao ?? '—'} · IRATA {ficha.profile.nivelIrata ?? '—'}
            </ThemedText>
            <ThemedText themeColor="textSecondary" type="small">
              Admissão: {ficha.profile.dataAdmissao ?? '—'} · Depto:{' '}
              {ficha.profile.departamento ?? '—'}
            </ThemedText>
          </GlassCard>

          <GlassCard>
            <ThemedText type="smallBold">Resultado final (IMA)</ThemedText>
            <View style={styles.imaRow}>
              <ThemedText type="title">{relatorio.ima !== null ? relatorio.ima.toFixed(2) : '—'}</ThemedText>
              {relatorio.classificacaoLabel ? (
                <StatusBadge
                  label={relatorio.classificacaoLabel}
                  tone={relatorio.classificacao === 'critico' ? 'danger' : 'accent'}
                  size="sm"
                />
              ) : null}
            </View>
            {relatorio.acaoRecomendada ? (
              <ThemedText themeColor="textSecondary" type="small" style={styles.mt}>
                Ação recomendada: {relatorio.acaoRecomendada}
              </ThemedText>
            ) : null}
          </GlassCard>

          <GlassCard>
            <ThemedText type="smallBold">Notas por área (GO–IN)</ThemedText>
            {radarLabels.map((label, index) => (
              <View key={`${label}-${index}`} style={styles.secaoRow}>
                <ThemedText type="small" style={styles.flex}>
                  {label}
                </ThemedText>
                <ThemedText type="smallBold">
                  {radarValores[index] > 0 ? radarValores[index].toFixed(2) : '—'}
                </ThemedText>
              </View>
            ))}
          </GlassCard>

          <GlassCard>
            <ThemedText type="smallBold">Gráfico radar — visão 360°</ThemedText>
            <RadarDesempenhoChart labels={radarLabels} valores={radarValores} />
          </GlassCard>
        </>
      ) : null}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.xl,
    paddingBottom: layout.space.xxxl,
  },
  list: { gap: layout.space.xs },
  item: {
    borderWidth: 1,
    borderRadius: layout.radius.sm,
    padding: layout.space.sm,
  },
  imaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    marginTop: layout.space.xs,
  },
  secaoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  flex: { flex: 1 },
  mt: { marginTop: layout.space.sm },
});
