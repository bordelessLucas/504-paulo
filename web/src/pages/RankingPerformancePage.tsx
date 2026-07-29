import { useState } from 'react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchColaboradorFicha,
  fetchGerencialDashboard,
  type ColaboradorRanking,
} from '@/features/gerencial/dashboard-api';
import { exportColaboradorFichaPdf } from '@/features/gerencial/export-ficha-pdf';
import { getSemaforoPorMedia } from '@/features/gerencial/semaforo';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type RankingView = 'top' | 'bottom' | 'completo';

function faixaTone(media: number): 'success' | 'warning' | 'danger' | 'info' {
  const status = getSemaforoPorMedia(media);
  if (status === 'verde') return 'success';
  if (status === 'amarelo' || status === 'laranja') return 'warning';
  if (status === 'vermelho') return 'danger';
  return 'info';
}

export function RankingPerformancePage() {
  const [rankingView, setRankingView] = useState<RankingView>('top');
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const { data, isLoading, error, reload } = useAsyncData(() => fetchGerencialDashboard(), []);

  const items =
    rankingView === 'top'
      ? data?.top5 ?? []
      : rankingView === 'bottom'
        ? data?.bottom5 ?? []
        : data?.rankingCompleto ?? [];

  async function handleExport(item: ColaboradorRanking) {
    setExportingId(item.id);
    try {
      const ficha = await fetchColaboradorFicha(item.id);
      await exportColaboradorFichaPdf(ficha);
      setMessage(`Ficha de ${item.nome} pronta para impressão/PDF.`);
    } catch (exportError) {
      setMessage(
        exportError instanceof Error ? exportError.message : 'Falha ao exportar ficha.',
      );
    } finally {
      setExportingId(null);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Ranking de performance"
        description="Top, bottom e ranking completo com exportação de ficha."
      />

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

      {message ? <p className={page.listItemMeta}>{message}</p> : null}

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {() => (
          <div className={page.list}>
            {items.map((item, index) => (
              <Card key={item.id} padding="compact">
                <div className={page.listItemHeader}>
                  <span className={page.listItemTitle}>
                    #{index + 1} {item.nome}
                  </span>
                  <Badge label={item.media.toFixed(1)} tone={faixaTone(item.media)} size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {[item.departamento, item.funcao].filter(Boolean).join(' · ') || '—'}
                </p>
                <div className={page.actions}>
                  <Button
                    size="sm"
                    variant="ghost"
                    isLoading={exportingId === item.id}
                    disabled={Boolean(exportingId)}
                    onClick={() => void handleExport(item)}
                  >
                    Exportar PDF
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
