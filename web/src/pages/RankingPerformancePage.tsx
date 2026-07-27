import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function RankingPerformancePage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchGerencialDashboard(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Ranking de performance"
        description="Top e bottom performers com base no IMA consolidado."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(dashboard) => (
          <>
            <RankingSection title="Top 5" items={dashboard.top5} tone="success" />
            <RankingSection title="Bottom 5" items={dashboard.bottom5} tone="danger" />
            <RankingSection title="Ranking completo" items={dashboard.rankingCompleto} tone="neutral" />
          </>
        )}
      </PageContent>
    </div>
  );
}

function RankingSection({
  title,
  items,
  tone,
}: {
  title: string;
  items: Array<{ id: string; nome: string; departamento: string | null; media: number }>;
  tone: 'success' | 'danger' | 'neutral';
}) {
  return (
    <section className={page.section}>
      <h2 className={page.sectionTitle}>{title}</h2>
      <div className={page.list}>
        {items.map((item, index) => (
          <Card key={item.id} padding="compact">
            <div className={page.listItemHeader}>
              <span className={page.listItemTitle}>
                {index + 1}. {item.nome}
              </span>
              <Badge label={item.media.toFixed(1)} tone={tone} size="sm" />
            </div>
            <p className={page.listItemMeta}>{item.departamento ?? '—'}</p>
          </Card>
        ))}
      </div>
    </section>
  );
}
