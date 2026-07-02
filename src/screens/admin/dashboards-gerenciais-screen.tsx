import Ionicons from '@expo/vector-icons/Ionicons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useMemo, useState } from 'react';
import {
  RefreshControl,
  StyleSheet,
  View,
} from 'react-native';

import { ColaboradorRankingList } from '@/components/gerencial/colaborador-ranking-list';
import { ExportacaoFichaPanel } from '@/components/gerencial/exportacao-ficha-panel';
import { ImaGaugeChart } from '@/components/gerencial/ima-gauge-chart';
import { RadarDesempenhoChart } from '@/components/gerencial/radar-desempenho-chart';
import { StatusPreenchimentoList } from '@/components/gerencial/status-preenchimento-list';
import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { PdiExecutivoCard } from '@/components/pdi/PdiExecutivoCard';
import { CollapsibleSection } from '@/components/premium/CollapsibleSection';
import { GlassCard } from '@/components/premium/GlassCard';
import { MetricStrip } from '@/components/premium/MetricStrip';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Button } from '@/components/ui/button';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { useToast } from '@/components/ui/toast';
import { brandRgb } from '@/constants/brand';
import { Fonts, layout, type SemanticTone } from '@/constants/theme';
import {
  fetchColaboradorFicha,
  fetchGerencialDashboard,
  type ColaboradorRanking,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';
import { getSemaforoItem } from '@/features/gerencial/semaforo';
import { exportColaboradorFichaPdf } from '@/features/gerencial/export-ficha-pdf';
import type { PdiEstatisticas } from '@/features/pdi/types';
import { buscarEstatisticasPDI } from '@/services/pdiService';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';

type RadarView = 'offshore' | 'legado';
type RankingView = 'top' | 'bottom' | 'completo';

function semaforoTone(status: GerencialDashboardData['semaforoStatus']): SemanticTone {
  switch (status) {
    case 'verde':
      return 'success';
    case 'amarelo':
    case 'laranja':
      return 'warning';
    case 'vermelho':
      return 'danger';
    default:
      return 'neutral';
  }
}

export function DashboardsGerenciaisScreen() {
  const { showToast } = useToast();
  const theme = useTheme();
  const isDesktopLayout = useIsDesktopLayout();
  const [data, setData] = useState<GerencialDashboardData | null>(null);
  const [pdiStats, setPdiStats] = useState<PdiEstatisticas | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [radarView, setRadarView] = useState<RadarView>('offshore');
  const [rankingView, setRankingView] = useState<RankingView>('top');

  const loadDashboard = useCallback(async (options?: { refreshing?: boolean }) => {
    if (options?.refreshing) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    setError(null);

    try {
      const [dashboard, stats] = await Promise.all([
        fetchGerencialDashboard(),
        buscarEstatisticasPDI().catch(() => null),
      ]);
      setData(dashboard);
      setPdiStats(stats);
    } catch (loadError) {
      setError(
        loadError instanceof Error ? loadError.message : 'Erro ao carregar dashboards gerenciais.',
      );
    } finally {
      if (options?.refreshing) {
        setIsRefreshing(false);
      } else {
        setIsLoading(false);
      }
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      void loadDashboard();
    }, [loadDashboard]),
  );

  const handleExportFicha = useCallback(
    async (colaborador: ColaboradorRanking) => {
      setExportingId(colaborador.id);

      try {
        const ficha = await fetchColaboradorFicha(colaborador.id);
        await exportColaboradorFichaPdf(ficha);
        showToast(`Ficha de ${colaborador.nome} exportada.`, 'success');
      } catch (exportError) {
        showToast(
          exportError instanceof Error
            ? exportError.message
            : 'Não foi possível exportar a ficha em PDF.',
          'error',
        );
      } finally {
        setExportingId(null);
      }
    },
    [showToast],
  );

  const totalPendentes = useMemo(
    () => (data?.statusPreenchimento ?? []).reduce((sum, item) => sum + item.pendentes, 0),
    [data?.statusPreenchimento],
  );

  const gestoresComPendencia = useMemo(
    () => (data?.statusPreenchimento ?? []).filter((item) => item.pendentes > 0).length,
    [data?.statusPreenchimento],
  );

  const semaforo = useMemo(
    () => getSemaforoItem(data?.semaforoStatus ?? 'cinza'),
    [data?.semaforoStatus],
  );

  const overviewMetrics = useMemo(() => {
    if (!data) return [];

    return [
      {
        label: 'IMA consolidado',
        value: data.ima !== null ? data.ima.toFixed(1) : '—',
        hint: semaforo.label,
        tone: semaforoTone(data.semaforoStatus),
      },
      {
        label: 'Colaboradores',
        value: String(data.rankingCompleto.length),
        hint: 'Com notas registradas',
        tone: 'info' as const,
      },
      {
        label: 'Pendências',
        value: String(totalPendentes),
        hint:
          gestoresComPendencia > 0
            ? `${gestoresComPendencia} gestor(es) com atraso`
            : 'Ciclo em dia',
        tone: totalPendentes > 0 ? ('warning' as const) : ('success' as const),
      },
      {
        label: 'PDIs ativos',
        value: pdiStats ? String(pdiStats.totalAtivos) : '—',
        hint: pdiStats ? `${pdiStats.taxaConclusao}% concluídos` : 'Carregando',
        tone: 'accent' as const,
      },
    ];
  }, [data, gestoresComPendencia, pdiStats, semaforo.label, totalPendentes]);

  const rankingItems = useMemo(() => {
    if (!data) return [];
    if (rankingView === 'top') return data.top5;
    if (rankingView === 'bottom') return data.bottom5;
    return data.rankingCompleto;
  }, [data, rankingView]);

  const rankingTitle = useMemo(() => {
    if (rankingView === 'top') return 'Mais bem avaliados';
    if (rankingView === 'bottom') return 'Menor desempenho';
    return 'Ranking geral';
  }, [rankingView]);

  const radarData = useMemo(() => {
    if (!data) return { labels: [], valores: [] };
    return radarView === 'offshore' ? data.radarOffshore : data.radarUniversal;
  }, [data, radarView]);

  if (isLoading) {
    return (
      <TabScreenContainer scrollable contentContainerStyle={styles.content}>
        <SkeletonLoader variant="title" />
        <View style={styles.skeletonMetrics}>
          <SkeletonLoader variant="card" count={2} />
          <SkeletonLoader variant="card" count={2} />
        </View>
        <SkeletonLoader variant="chart" height={220} />
        <SkeletonLoader variant="list-item" count={4} />
      </TabScreenContainer>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <View style={[styles.errorIcon, { backgroundColor: theme.dangerMuted }]}>
          <Ionicons color={theme.danger} name="alert-circle-outline" size={32} />
        </View>
        <ThemedText type="subtitle">Não foi possível carregar</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.errorText}>
          {error}
        </ThemedText>
        <Button label="Tentar novamente" variant="secondary" onPress={() => void loadDashboard()} />
      </ThemedView>
    );
  }

  return (
    <TabScreenContainer
      scrollable
      contentContainerStyle={[styles.content, isDesktopLayout && styles.contentDesktop]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => void loadDashboard({ refreshing: true })}
        />
      }>
      <ScreenHeader
        variant="default"
        title="Dashboard executivo"
        description="Visão consolidada de desempenho offshore, saúde dos PDIs e ranking de colaboradores."
        accessory={
          <StatusBadge
            label={semaforo.label}
            tone={semaforoTone(data?.semaforoStatus ?? 'cinza')}
            size="sm"
          />
        }
      />

      {overviewMetrics.length > 0 ? <MetricStrip metrics={overviewMetrics} /> : null}

      {totalPendentes > 0 ? (
        <PendenciasBanner
          totalPendentes={totalPendentes}
          gestoresComPendencia={gestoresComPendencia}
        />
      ) : null}

      <View style={[styles.heroRow, isDesktopLayout && styles.heroRowDesktop]}>
        <GlassCard glow style={isDesktopLayout ? styles.heroGauge : undefined}>
          <View style={styles.sectionHeader}>
            <Ionicons color={theme.accent} name="speedometer-outline" size={18} />
            <ThemedText type="subtitle">Índice IMA</ThemedText>
          </View>
          <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
            Média ponderada das 12 seções offshore · escala 0 a 3
          </ThemedText>
          <ImaGaugeChart ima={data?.ima ?? null} size={isDesktopLayout ? 300 : 260} />
        </GlassCard>

        <View style={[styles.heroSide, isDesktopLayout && styles.heroSideDesktop]}>
          <InsightCard
            icon="trophy-outline"
            title="Top performer"
            value={data?.top5[0]?.media.toFixed(1) ?? '—'}
            hint={data?.top5[0]?.nome ?? 'Sem dados'}
            tone="success"
          />
          <InsightCard
            icon="trending-down-outline"
            title="Atenção imediata"
            value={data?.bottom5[0]?.media.toFixed(1) ?? '—'}
            hint={data?.bottom5[0]?.nome ?? 'Sem dados'}
            tone="danger"
          />
          <InsightCard
            icon="people-outline"
            title="Gestores no ciclo"
            value={String(data?.statusPreenchimento.length ?? 0)}
            hint={
              gestoresComPendencia > 0
                ? `${gestoresComPendencia} com pendências`
                : 'Todos em dia'
            }
            tone={gestoresComPendencia > 0 ? 'warning' : 'success'}
          />
        </View>
      </View>

      <GlassCard>
        <View style={styles.sectionHeader}>
          <Ionicons color={theme.accent} name="radio-outline" size={18} />
          <ThemedText type="subtitle">Radar de desempenho</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
          Compare a média por eixo — alterne entre modelo offshore (12) e legado (3).
        </ThemedText>
        <SegmentedControl
          options={[
            { value: 'offshore', label: 'Offshore (12)' },
            { value: 'legado', label: 'Legado (3)' },
          ]}
          value={radarView}
          onChange={setRadarView}
        />
        <View style={styles.chartCenter}>
          <RadarDesempenhoChart
            labels={radarData.labels}
            valores={radarData.valores}
            size={isDesktopLayout ? 320 : 280}
          />
        </View>
      </GlassCard>

      <View style={[styles.dualRow, isDesktopLayout && styles.dualRowDesktop]}>
        <View style={isDesktopLayout ? styles.dualSlot : undefined}>
          {pdiStats ? (
            <GlassCard padding="compact">
              <View style={styles.sectionHeader}>
                <Ionicons color={theme.accent} name="fitness-outline" size={18} />
                <ThemedText type="subtitle">Saúde dos PDIs</ThemedText>
              </View>
              <PdiExecutivoCard stats={pdiStats} embedded />
            </GlassCard>
          ) : (
            <GlassCard padding="compact">
              <ThemedText type="subtitle">Saúde dos PDIs</ThemedText>
              <ThemedText themeColor="textSecondary" type="small">
                Dados de PDI indisponíveis no momento.
              </ThemedText>
            </GlassCard>
          )}
        </View>

        <GlassCard padding="compact" style={isDesktopLayout ? styles.dualSlot : undefined}>
          <View style={styles.sectionHeader}>
            <Ionicons color={theme.accent} name="clipboard-outline" size={18} />
            <ThemedText type="subtitle">Preenchimento do ciclo</ThemedText>
            {totalPendentes > 0 ? (
              <StatusBadge label={`${totalPendentes} pendente(s)`} tone="warning" size="sm" />
            ) : (
              <StatusBadge label="Em dia" tone="success" size="sm" />
            )}
          </View>
          <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
            Supervisores e gestores com avaliações ainda não concluídas.
          </ThemedText>
          <StatusPreenchimentoList items={data?.statusPreenchimento ?? []} />
        </GlassCard>
      </View>

      <GlassCard glow>
        <View style={styles.sectionHeader}>
          <Ionicons color={theme.accent} name="podium-outline" size={18} />
          <ThemedText type="subtitle">Ranking de colaboradores</ThemedText>
        </View>
        <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
          Exporte fichas individuais em PDF diretamente da lista.
        </ThemedText>
        <SegmentedControl
          options={[
            { value: 'top', label: 'Top 5' },
            { value: 'bottom', label: 'Bottom 5' },
            { value: 'completo', label: 'Completo' },
          ]}
          value={rankingView}
          onChange={setRankingView}
        />
        <ColaboradorRankingList
          exportingId={exportingId}
          items={rankingItems}
          title={rankingTitle}
          onExport={(colaborador) => void handleExportFicha(colaborador)}
        />
      </GlassCard>

      <CollapsibleSection title="Exportar fichas PDF" count={data?.rankingCompleto.length}>
        <ThemedText themeColor="textSecondary" type="small" style={styles.sectionHint}>
          Busque colaboradores, filtre por departamento e exporte individualmente ou em lote.
        </ThemedText>
        <ExportacaoFichaPanel
          exportingId={exportingId}
          onExportingChange={setExportingId}
          onExported={(message) => showToast(message, 'success')}
          onError={(message) => showToast(message, 'error')}
        />
      </CollapsibleSection>
    </TabScreenContainer>
  );
}

function PendenciasBanner({
  totalPendentes,
  gestoresComPendencia,
}: {
  totalPendentes: number;
  gestoresComPendencia: number;
}) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.alertBanner,
        {
          backgroundColor: theme.warningMuted,
          borderColor: brandRgb(theme.warning, 0.35),
        },
      ]}>
      <Ionicons color={theme.warning} name="time-outline" size={20} />
      <View style={styles.alertText}>
        <ThemedText type="smallBold" style={{ color: theme.warning }}>
          {totalPendentes} avaliação(ões) pendente(s)
        </ThemedText>
        <ThemedText type="small" style={{ color: theme.warning }}>
          {gestoresComPendencia} gestor(es) ainda não concluíram o ciclo atual.
        </ThemedText>
      </View>
    </View>
  );
}

function InsightCard({
  icon,
  title,
  value,
  hint,
  tone,
}: {
  icon: keyof typeof Ionicons.glyphMap;
  title: string;
  value: string;
  hint: string;
  tone: SemanticTone;
}) {
  const theme = useTheme();
  const palette = theme.semantic[tone];

  return (
    <View
      style={[
        styles.insightCard,
        theme.shadow.card,
        {
          backgroundColor: palette.bg,
          borderColor: palette.border,
        },
      ]}>
      <View style={styles.insightHeader}>
        <View style={[styles.insightIcon, { backgroundColor: brandRgb(palette.text, 0.12) }]}>
          <Ionicons color={palette.text} name={icon} size={16} />
        </View>
        <ThemedText type="small" style={{ color: palette.text, fontFamily: Fonts.sansMedium }}>
          {title}
        </ThemedText>
      </View>
      <ThemedText style={[styles.insightValue, { color: theme.text, fontFamily: Fonts.sansBold }]}>
        {value}
      </ThemedText>
      <ThemedText type="small" numberOfLines={1} themeColor="textSecondary">
        {hint}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.xl,
    width: '100%',
    paddingBottom: layout.space.xxxl,
  },
  contentDesktop: {
    alignSelf: 'stretch',
  },
  skeletonMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: layout.space.sm,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: layout.space.xl,
    gap: layout.space.md,
  },
  errorIcon: {
    width: 64,
    height: 64,
    borderRadius: layout.radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorText: {
    textAlign: 'center',
    lineHeight: 20,
    maxWidth: 320,
  },
  alertBanner: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.space.md,
    padding: layout.space.lg,
    borderRadius: layout.radius.md,
    borderWidth: 1,
  },
  alertText: {
    flex: 1,
    gap: 2,
  },
  heroRow: {
    gap: layout.space.lg,
  },
  heroRowDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
  },
  heroGauge: {
    flex: 1.2,
  },
  heroSide: {
    gap: layout.space.sm,
  },
  heroSideDesktop: {
    flex: 1,
    justifyContent: 'center',
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    flexWrap: 'wrap',
  },
  sectionHint: {
    lineHeight: 20,
    marginBottom: layout.space.xs,
  },
  chartCenter: {
    alignItems: 'center',
    marginTop: layout.space.sm,
  },
  dualRow: {
    gap: layout.space.lg,
  },
  dualRowDesktop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  dualSlot: {
    flex: 1,
    minWidth: 320,
  },
  insightCard: {
    gap: layout.space.xs,
    padding: layout.space.lg,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
  },
  insightHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
  },
  insightIcon: {
    width: 28,
    height: 28,
    borderRadius: layout.radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  insightValue: {
    fontSize: 24,
    lineHeight: 28,
    letterSpacing: -0.3,
  },
});
