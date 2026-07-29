import { useMemo, useState } from 'react';

import { PageContent } from '../components/PageContent';
import { ImaGaugeChart } from '../components/charts/ImaGaugeChart';
import { RadarDesempenhoChart } from '../components/charts/RadarDesempenhoChart';
import { ExportacaoFichaPanel } from '../components/gerencial/ExportacaoFichaPanel';
import { PdiSaudeCard } from '../components/gerencial/PdiSaudeCard';
import { RelatorioGerencialExecutivo } from '../components/gerencial/RelatorioGerencialExecutivo';
import gerencial from '../components/gerencial/gerencial.module.css';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchColaboradorFicha,
  fetchGerencialDashboard,
  type ColaboradorRanking,
  type GerencialDashboardData,
} from '@/features/gerencial/dashboard-api';
import { exportColaboradorFichaPdf } from '@/features/gerencial/export-ficha-pdf';
import { getSemaforoItem, getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import type { PdiEstatisticas } from '@/features/pdi/types';
import { buscarEstatisticasPDI } from '@/services/pdiService';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type RadarView = 'offshore' | 'legado';
type RankingView = 'top' | 'bottom' | 'completo';

function semaforoTone(
  status: GerencialDashboardData['semaforoStatus'],
): 'success' | 'warning' | 'danger' | 'neutral' {
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

function faixaTone(media: number): 'success' | 'warning' | 'danger' | 'info' {
  const status = getSemaforoPorMedia(media);
  if (status === 'verde') return 'success';
  if (status === 'amarelo' || status === 'laranja') return 'warning';
  if (status === 'vermelho') return 'danger';
  return 'info';
}

async function loadGerencialBundle() {
  const [dashboard, pdiStats] = await Promise.all([
    fetchGerencialDashboard(),
    buscarEstatisticasPDI().catch(() => null),
  ]);
  return { dashboard, pdiStats };
}

export function DashboardsGerenciaisPage() {
  const [radarView, setRadarView] = useState<RadarView>('offshore');
  const [rankingView, setRankingView] = useState<RankingView>('top');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ tone: 'success' | 'error'; message: string } | null>(
    null,
  );

  const { data, isLoading, error, reload } = useAsyncData(() => loadGerencialBundle(), []);

  const dashboard = data?.dashboard ?? null;
  const pdiStats = data?.pdiStats as PdiEstatisticas | null;

  const totalPendentes = useMemo(
    () => (dashboard?.statusPreenchimento ?? []).reduce((sum, item) => sum + item.pendentes, 0),
    [dashboard?.statusPreenchimento],
  );

  const gestoresComPendencia = useMemo(
    () => (dashboard?.statusPreenchimento ?? []).filter((item) => item.pendentes > 0).length,
    [dashboard?.statusPreenchimento],
  );

  const semaforo = getSemaforoItem(dashboard?.semaforoStatus ?? 'cinza');

  const rankingItems = useMemo(() => {
    if (!dashboard) return [];
    if (rankingView === 'top') return dashboard.top5;
    if (rankingView === 'bottom') return dashboard.bottom5;
    return dashboard.rankingCompleto;
  }, [dashboard, rankingView]);

  const rankingTitle =
    rankingView === 'top'
      ? 'Mais bem avaliados'
      : rankingView === 'bottom'
        ? 'Menor desempenho'
        : 'Ranking geral';

  const radarData =
    radarView === 'offshore'
      ? dashboard?.radarOffshore
      : dashboard?.radarUniversal;

  async function handleExportRanking(colaborador: ColaboradorRanking) {
    setExportingId(colaborador.id);
    try {
      const ficha = await fetchColaboradorFicha(colaborador.id);
      await exportColaboradorFichaPdf(ficha);
      setToast({
        tone: 'success',
        message: `Ficha de ${colaborador.nome} pronta para impressão/PDF.`,
      });
    } catch (exportError) {
      setToast({
        tone: 'error',
        message:
          exportError instanceof Error
            ? exportError.message
            : 'Não foi possível exportar a ficha.',
      });
    } finally {
      setExportingId(null);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Relatório Gerencial"
        description="Resumo executivo CEO (Excel 2.5): KPIs, faixas 0–3, status por gestor, top/bottom 10, radar e exportação."
        accessory={
          <Badge label={semaforo.label} tone={semaforoTone(dashboard?.semaforoStatus ?? 'cinza')} />
        }
      />

      {toast ? (
        <div
          className={`${gerencial.toast} ${toast.tone === 'success' ? gerencial.toastSuccess : gerencial.toastError}`}
        >
          {toast.message}
          <Button size="sm" variant="ghost" onClick={() => setToast(null)}>
            Fechar
          </Button>
        </div>
      ) : null}

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {() =>
          dashboard ? (
            <>
              <RelatorioGerencialExecutivo dashboard={dashboard} />

              {totalPendentes > 0 ? (
                <div className={gerencial.banner}>
                  {totalPendentes} avaliação(ões) pendente(s) em {gestoresComPendencia} gestor(es)
                  / supervisor(es) no ciclo atual.
                </div>
              ) : null}

              <div className={page.metrics}>
                <div className={page.metric}>
                  <div className={page.metricLabel}>IMA consolidado</div>
                  <div className={page.metricValue}>
                    {dashboard.ima !== null ? dashboard.ima.toFixed(1) : '—'}
                  </div>
                  <p className={gerencial.metricHint}>{semaforo.label}</p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>Colaboradores</div>
                  <div className={page.metricValue}>{dashboard.totalColaboradores}</div>
                  <p className={gerencial.metricHint}>Ativos na base</p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>Com notas</div>
                  <div className={page.metricValue}>{dashboard.rankingCompleto.length}</div>
                  <p className={gerencial.metricHint}>No ranking IMA</p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>PDIs ativos</div>
                  <div className={page.metricValue}>
                    {pdiStats ? pdiStats.totalAtivos : '—'}
                  </div>
                  <p className={gerencial.metricHint}>
                    {pdiStats ? `${pdiStats.taxaConclusao}% concluídos` : 'Sem dados'}
                  </p>
                </div>
              </div>

              <div className={gerencial.heroRow}>
                <Card>
                  <h2 className={gerencial.cardTitle}>Índice IMA</h2>
                  <p className={gerencial.cardHint}>
                    Média ponderada das 12 seções offshore · escala 0 a 3
                  </p>
                  <ImaGaugeChart ima={dashboard.ima} size={300} />
                </Card>

                <div className={gerencial.insightStack}>
                  <div className={gerencial.insightCard}>
                    <p className={gerencial.insightLabel}>Top performer</p>
                    <p className={gerencial.insightValue}>
                      {dashboard.top5[0]?.media.toFixed(1) ?? '—'}
                    </p>
                    <p className={gerencial.insightHint}>{dashboard.top5[0]?.nome ?? 'Sem dados'}</p>
                  </div>
                  <div className={gerencial.insightCard}>
                    <p className={gerencial.insightLabel}>Atenção imediata</p>
                    <p className={gerencial.insightValue}>
                      {dashboard.bottom5[0]?.media.toFixed(1) ?? '—'}
                    </p>
                    <p className={gerencial.insightHint}>
                      {dashboard.bottom5[0]?.nome ?? 'Sem dados'}
                    </p>
                  </div>
                  <div className={gerencial.insightCard}>
                    <p className={gerencial.insightLabel}>Gestores no ciclo</p>
                    <p className={gerencial.insightValue}>
                      {dashboard.statusPreenchimento.length}
                    </p>
                    <p className={gerencial.insightHint}>
                      {gestoresComPendencia > 0
                        ? `${gestoresComPendencia} com pendências`
                        : 'Todos em dia'}
                    </p>
                  </div>
                </div>
              </div>

              <section className={page.section}>
                <Card>
                  <h2 className={gerencial.cardTitle}>Radar de desempenho</h2>
                  <p className={gerencial.cardHint}>
                    Compare a média por eixo — alterne entre modelo offshore (12) e legado (3).
                  </p>
                  <div className={page.chips}>
                    <button
                      type="button"
                      className={`${page.chip} ${radarView === 'offshore' ? page.chipActive : ''}`.trim()}
                      onClick={() => setRadarView('offshore')}
                    >
                      Offshore (12)
                    </button>
                    <button
                      type="button"
                      className={`${page.chip} ${radarView === 'legado' ? page.chipActive : ''}`.trim()}
                      onClick={() => setRadarView('legado')}
                    >
                      Legado (3)
                    </button>
                  </div>
                  <RadarDesempenhoChart
                    labels={radarData?.labels ?? []}
                    valores={radarData?.valores ?? []}
                    size={320}
                    hint={
                      radarView === 'offshore'
                        ? 'Escala 0–3 · 12 seções offshore'
                        : 'Escala 0–3 · 3 eixos universais'
                    }
                  />
                </Card>
              </section>

              <div className={gerencial.dualRow}>
                {pdiStats ? <PdiSaudeCard stats={pdiStats} /> : null}

                <Card>
                  <h2 className={gerencial.cardTitle}>Preenchimento por gestor</h2>
                  <p className={gerencial.cardHint}>
                    Status do ciclo (quinzena/semestre) por gestor e supervisor.
                  </p>
                  <div className={page.list}>
                    {dashboard.statusPreenchimento.length === 0 ? (
                      <p className={page.listItemMeta}>Nenhum gestor no ciclo.</p>
                    ) : (
                      dashboard.statusPreenchimento.map((gestor) => {
                        const concluidos = Math.max(gestor.total - gestor.pendentes, 0);
                        const pct =
                          gestor.total > 0 ? Math.round((concluidos / gestor.total) * 100) : 0;
                        return (
                          <div key={gestor.id} className={page.listItem}>
                            <div className={page.listItemHeader}>
                              <span className={page.listItemTitle}>{gestor.nome}</span>
                              <Badge
                                label={`${pct}%`}
                                tone={pct >= 80 ? 'success' : pct >= 50 ? 'warning' : 'danger'}
                                size="sm"
                              />
                            </div>
                            <p className={page.listItemMeta}>
                              {gestor.departamento ?? gestor.role} · {concluidos}/{gestor.total} ·{' '}
                              {gestor.cicloLabel} · {gestor.pendentes} pendente(s)
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>
                </Card>
              </div>

              <section className={page.section}>
                <Card>
                  <h2 className={gerencial.cardTitle}>Ranking rápido</h2>
                  <div className={page.chips}>
                    {(
                      [
                        ['top', 'Top 5'],
                        ['bottom', 'Bottom 5'],
                        ['completo', 'Completo'],
                      ] as const
                    ).map(([value, label]) => (
                      <button
                        key={value}
                        type="button"
                        className={`${page.chip} ${rankingView === value ? page.chipActive : ''}`.trim()}
                        onClick={() => setRankingView(value)}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  <p className={gerencial.cardHint}>
                    {rankingTitle} · Top/Bottom 10 completos estão no relatório executivo acima.
                  </p>
                  <div className={page.list}>
                    {rankingItems.map((item, index) => (
                      <div key={item.id} className={page.listItem}>
                        <div className={page.listItemHeader}>
                          <span className={page.listItemTitle}>
                            #{index + 1} {item.nome}
                          </span>
                          <Badge
                            label={item.media.toFixed(1)}
                            tone={faixaTone(item.media)}
                            size="sm"
                          />
                        </div>
                        <p className={page.listItemMeta}>
                          {[item.departamento, item.funcao].filter(Boolean).join(' · ') || '—'} ·{' '}
                          {item.totalRespostas} resp.
                        </p>
                        <div className={page.actions}>
                          <Button
                            size="sm"
                            variant="ghost"
                            isLoading={exportingId === item.id}
                            disabled={Boolean(exportingId)}
                            onClick={() => void handleExportRanking(item)}
                          >
                            Exportar PDF
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              </section>

              <section className={page.section}>
                <ExportacaoFichaPanel
                  exportingId={exportingId}
                  onExportingChange={setExportingId}
                  onExported={(message) => setToast({ tone: 'success', message })}
                  onError={(message) => setToast({ tone: 'error', message })}
                />
              </section>
            </>
          ) : null
        }
      </PageContent>
    </div>
  );
}
