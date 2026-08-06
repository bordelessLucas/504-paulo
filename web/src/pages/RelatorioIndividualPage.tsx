import { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchColaboradoresParaRelatorio,
  fetchRelatorioIndividual,
} from '@/features/desempenho/relatorio-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function RelatorioIndividualPage() {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const colaborador = searchParams.get('colaborador');
    if (colaborador) {
      setSelectedId(colaborador);
    }
  }, [searchParams]);

  const buscaQuery = useAsyncData(
    () => fetchColaboradoresParaRelatorio(query || undefined),
    [query],
  );

  const relatorioQuery = useAsyncData(
    () => fetchRelatorioIndividual(selectedId!),
    [selectedId],
    { enabled: Boolean(selectedId) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Relatório individual"
        description="Busque um colaborador e visualize o relatório consolidado."
      />

      <div className={page.field} style={{ marginBottom: '1.5rem' }}>
        <label className={page.label} htmlFor="busca">
          Buscar colaborador
        </label>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <input
            id="busca"
            className={page.input}
            placeholder="Nome ou departamento"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <Button variant="secondary" leftIcon={<Search size={16} />} onClick={buscaQuery.reload}>
            Buscar
          </Button>
        </div>
      </div>

      <PageContent
        isLoading={buscaQuery.isLoading}
        error={buscaQuery.error}
        data={buscaQuery.data}
        onRetry={buscaQuery.reload}
      >
        {(colaboradores) => (
          <div className={page.list}>
            {colaboradores.slice(0, 12).map((colaborador) => (
              <Card key={colaborador.id} padding="compact">
                <div className={page.listItemHeader}>
                  <div>
                    <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                    <p className={page.listItemMeta}>{colaborador.departamento ?? '—'}</p>
                  </div>
                  <Button size="sm" onClick={() => setSelectedId(colaborador.id)}>
                    Ver relatório
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </PageContent>

      {selectedId ? (
        <section className={page.section} style={{ marginTop: '2rem' }}>
          <h2 className={page.sectionTitle}>Relatório</h2>
          <PageContent
            isLoading={relatorioQuery.isLoading}
            error={relatorioQuery.error}
            data={relatorioQuery.data}
            onRetry={relatorioQuery.reload}
          >
            {(relatorio) => (
              <Card>
                <div className={page.listItemHeader}>
                  <h3 className={page.listItemTitle}>{relatorio.ficha.profile.nome}</h3>
                  <Badge label={relatorio.ima?.toFixed(1) ?? '—'} tone="accent" />
                </div>
                <p className={page.listItemMeta}>
                  {relatorio.ficha.profile.funcao ?? '—'} ·{' '}
                  {relatorio.ficha.profile.departamento ?? '—'}
                </p>
                {relatorio.classificacaoLabel ? (
                  <Badge label={relatorio.classificacaoLabel} tone="info" size="sm" />
                ) : null}
                {relatorio.acaoRecomendada ? (
                  <p className={page.listItemBody} style={{ marginTop: '0.75rem' }}>
                    {relatorio.acaoRecomendada}
                  </p>
                ) : null}
                <div className={page.metrics} style={{ marginTop: '1rem' }}>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Total respostas</div>
                    <div className={page.metricValue}>{relatorio.ficha.totalRespostas}</div>
                  </div>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Avaliações</div>
                    <div className={page.metricValue}>{relatorio.ficha.avaliacoes.length}</div>
                  </div>
                </div>
              </Card>
            )}
          </PageContent>
        </section>
      ) : null}
    </div>
  );
}
