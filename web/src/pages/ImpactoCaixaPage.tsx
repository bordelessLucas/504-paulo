import { useMemo, useState } from 'react';

import { PageContent } from '../components/PageContent';
import gerencial from '../components/gerencial/gerencial.module.css';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchImpactoCaixaMetrics } from '@/features/ceo/impacto-caixa-api';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type Modo = 'mensal' | 'anual';

function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

function yearKey(iso: string): string {
  return iso.slice(0, 4);
}

function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });
}

async function loadImpactoBundle() {
  const [impacto, gerencialData] = await Promise.all([
    fetchImpactoCaixaMetrics(),
    fetchGerencialDashboard().catch(() => null),
  ]);
  return { impacto, gerencial: gerencialData };
}

export function ImpactoCaixaPage() {
  const [modo, setModo] = useState<Modo>('mensal');
  const { data, isLoading, error, reload } = useAsyncData(() => loadImpactoBundle(), []);

  const buckets = useMemo(() => {
    const map = new Map<string, number>();
    for (const item of data?.impacto.aprovados ?? []) {
      const key = modo === 'mensal' ? monthKey(item.data) : yearKey(item.data);
      map.set(key, (map.get(key) ?? 0) + item.valor);
    }
    return [...map.entries()].sort((a, b) => b[0].localeCompare(a[0]));
  }, [data?.impacto.aprovados, modo]);

  return (
    <div className={page.page}>
      <PageHeader
        title="Impacto no caixa"
        description="Folha salarial, impacto de reajustes aprovados (R$ e %) e status de preenchimento por gestor."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(bundle) => {
          const { impacto, gerencial: dashboard } = bundle;
          const pctFolha =
            impacto.folhaSalarial > 0
              ? (impacto.impactoTotal / impacto.folhaSalarial) * 100
              : null;

          return (
            <>
              <div className={page.metrics}>
                <div className={page.metric}>
                  <div className={page.metricLabel}>Folha salarial</div>
                  <div className={page.metricValue} style={{ fontSize: '1.15rem' }}>
                    {formatMoney(impacto.folhaSalarial)}
                  </div>
                  <p className={gerencial.metricHint}>
                    {impacto.colaboradoresComSalario}/{impacto.totalColaboradoresAtivos} com
                    salário base
                  </p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>Impacto aprovado</div>
                  <div className={page.metricValue} style={{ fontSize: '1.15rem' }}>
                    {formatMoney(impacto.impactoTotal)}
                  </div>
                  <p className={gerencial.metricHint}>
                    {impacto.aprovados.length} solicitação(ões)
                  </p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>% da folha</div>
                  <div className={page.metricValue}>
                    {pctFolha !== null ? `${pctFolha.toFixed(1)}%` : '—'}
                  </div>
                  <p className={gerencial.metricHint}>Impacto / folha</p>
                </div>
                <div className={page.metric}>
                  <div className={page.metricLabel}>% médio reajuste</div>
                  <div className={page.metricValue}>
                    {impacto.percentualMedioReajuste !== null
                      ? `${impacto.percentualMedioReajuste.toFixed(1)}%`
                      : '—'}
                  </div>
                  <p className={gerencial.metricHint}>Nas aprovações com %</p>
                </div>
              </div>

              <div className={page.chips}>
                {(['mensal', 'anual'] as Modo[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    className={`${page.chip} ${modo === option ? page.chipActive : ''}`.trim()}
                    onClick={() => setModo(option)}
                  >
                    {option === 'mensal' ? 'Mensal' : 'Anual'}
                  </button>
                ))}
              </div>

              <section className={page.section}>
                <h2 className={page.sectionTitle}>
                  Impacto {modo === 'mensal' ? 'mensal' : 'anual'}
                </h2>
                {buckets.length === 0 ? (
                  <p className={page.listItemMeta}>Nenhum reajuste aprovado no período.</p>
                ) : (
                  <div className={page.list}>
                    {buckets.map(([periodo, valor]) => (
                      <Card key={periodo} padding="compact">
                        <div className={page.listItemHeader}>
                          <span className={page.listItemTitle}>{periodo}</span>
                          <strong>{formatMoney(valor)}</strong>
                        </div>
                        {impacto.folhaSalarial > 0 ? (
                          <p className={page.listItemMeta}>
                            {((valor / impacto.folhaSalarial) * 100).toFixed(2)}% da folha
                          </p>
                        ) : null}
                      </Card>
                    ))}
                  </div>
                )}
              </section>

              <section className={page.section}>
                <h2 className={page.sectionTitle}>Últimas aprovações</h2>
                <div className={page.list}>
                  {impacto.aprovados.slice(0, 15).map((item, index) => (
                    <Card key={`${item.nome}-${item.data}-${index}`} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>{item.nome}</span>
                        <strong>{formatMoney(item.valor)}</strong>
                      </div>
                      <p className={page.listItemMeta}>
                        {new Date(item.data).toLocaleDateString('pt-BR')}
                        {item.percentual != null ? ` · ${item.percentual.toFixed(1)}%` : ''}
                      </p>
                    </Card>
                  ))}
                </div>
              </section>

              {dashboard ? (
                <section className={page.section}>
                  <h2 className={page.sectionTitle}>Status por gestor (ciclo atual)</h2>
                  <div className={page.list}>
                    {dashboard.statusPreenchimento.map((gestor) => {
                      const concluidos = Math.max(gestor.total - gestor.pendentes, 0);
                      return (
                        <Card key={gestor.id} padding="compact">
                          <div className={page.listItemHeader}>
                            <span className={page.listItemTitle}>{gestor.nome}</span>
                            <span className={page.listItemMeta}>
                              {concluidos}/{gestor.total}
                            </span>
                          </div>
                          <p className={page.listItemMeta}>
                            {gestor.departamento ?? gestor.role} · {gestor.cicloLabel} ·{' '}
                            {gestor.pendentes} pendente(s)
                          </p>
                        </Card>
                      );
                    })}
                  </div>
                </section>
              ) : null}
            </>
          );
        }}
      </PageContent>
    </div>
  );
}
