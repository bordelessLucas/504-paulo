import { useState } from 'react';
import { CalendarRange } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchColaboradorAnualDetalhe,
  fetchColaboradoresConsolidados,
} from '@/features/estrategico/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PainelAnualEstrategicoPage() {
  const anoAtual = new Date().getFullYear();
  const [anoReferencia, setAnoReferencia] = useState(anoAtual);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const colaboradoresQuery = useAsyncData(() => fetchColaboradoresConsolidados(), []);
  const detalheQuery = useAsyncData(
    () => fetchColaboradorAnualDetalhe(selectedId!, anoReferencia),
    [selectedId, anoReferencia],
    { enabled: Boolean(selectedId) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Painel anual estratégico"
        description="Consolidação anual por colaborador para decisões de benefícios."
      />

      <div className={page.field} style={{ maxWidth: 200, marginBottom: '1rem' }}>
        <label className={page.label} htmlFor="ano">
          Ano de referência
        </label>
        <input
          id="ano"
          className={page.input}
          type="number"
          value={anoReferencia}
          onChange={(event) => setAnoReferencia(Number(event.target.value))}
        />
      </div>

      <PageContent
        isLoading={colaboradoresQuery.isLoading}
        error={colaboradoresQuery.error}
        data={colaboradoresQuery.data}
        onRetry={colaboradoresQuery.reload}
      >
        {(colaboradores) => (
          <div className={page.grid2}>
            {colaboradores.map((colaborador) => (
              <Card
                key={colaborador.id}
                padding="compact"
                className={selectedId === colaborador.id ? page.planCardSelected : ''}
                onClick={() => setSelectedId(colaborador.id)}
                style={{ cursor: 'pointer' }}
              >
                <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                <p className={page.listItemMeta}>
                  {colaborador.departamento ?? '—'} · {colaborador.funcao ?? '—'}
                </p>
              </Card>
            ))}
          </div>
        )}
      </PageContent>

      {selectedId ? (
        <section className={page.section} style={{ marginTop: '2rem' }}>
          <h2 className={page.sectionTitle}>Detalhe anual</h2>
          <PageContent
            isLoading={detalheQuery.isLoading}
            error={detalheQuery.error}
            data={detalheQuery.data}
            onRetry={detalheQuery.reload}
          >
            {(detalhe) => (
              <>
                <div className={page.metrics}>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Média quinzenal</div>
                    <div className={page.metricValue}>
                      {detalhe.medias.mediaQuinzenal?.toFixed(1) ?? '—'}
                    </div>
                  </div>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Média semestral</div>
                    <div className={page.metricValue}>
                      {detalhe.medias.mediaSemestral?.toFixed(1) ?? '—'}
                    </div>
                  </div>
                  <div className={page.metric}>
                    <div className={page.metricLabel}>Avaliações</div>
                    <div className={page.metricValue}>
                      {detalhe.medias.totalAvaliacoesQuinzenal +
                        detalhe.medias.totalAvaliacoesSemestral}
                    </div>
                  </div>
                </div>

                {detalhe.decisaoExistente ? (
                  <Card>
                    <Badge label={detalhe.decisaoExistente.tipoBeneficio} tone="success" />
                    <p className={page.listItemBody} style={{ marginTop: '0.75rem' }}>
                      {detalhe.decisaoExistente.justificativaFinanceira}
                    </p>
                  </Card>
                ) : (
                  <Card padding="compact">
                    <CalendarRange size={18} color="#718096" />
                    <p className={page.listItemMeta}>Nenhuma decisão anual registrada.</p>
                  </Card>
                )}
              </>
            )}
          </PageContent>
        </section>
      ) : null}
    </div>
  );
}
