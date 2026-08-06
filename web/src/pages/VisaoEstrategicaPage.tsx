import { Fragment, useMemo } from 'react';

import { PotencialSucessaoForms } from '../components/estrategico/PotencialSucessaoForms';
import { PageContent } from '../components/PageContent';
import { ImaGaugeChart } from '../components/charts/ImaGaugeChart';
import { RadarDesempenhoChart } from '../components/charts/RadarDesempenhoChart';
import gerencial from '../components/gerencial/gerencial.module.css';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  NINE_BOX_ACOES,
  NINE_BOX_LABELS,
  fetchColaboradoresAtivosOpcoes,
  fetchDashboardExecutivo,
  type ColaboradorExecutivo,
  type NineBoxQuadrante,
} from '@/features/executivo/api';
import { fetchGerencialDashboard } from '@/features/gerencial/dashboard-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

/** Matriz: linhas = potencial (alto→baixo), colunas = performance (baixa→alta). */
const NINE_BOX_MATRIX: NineBoxQuadrante[][] = [
  ['enigma', 'alto_potencial', 'estrela'],
  ['desenvolvimento', 'solido', 'futuro_lider'],
  ['critico', 'questionavel', 'confiavel'],
];

const POTENCIAL_LABELS = ['Alto potencial', 'Médio potencial', 'Baixo potencial'];
const PERF_LABELS = ['Baixa perf.', 'Média perf.', 'Alta perf.'];

async function loadEstrategicoBundle() {
  const [gerencialData, executivo, opcoes] = await Promise.all([
    fetchGerencialDashboard(),
    fetchDashboardExecutivo(),
    fetchColaboradoresAtivosOpcoes(),
  ]);
  return { gerencial: gerencialData, executivo, opcoes };
}

export function VisaoEstrategicaPage() {
  const { data, isLoading, error, reload } = useAsyncData(() => loadEstrategicoBundle(), []);

  const nineBoxByQuadrante = useMemo(() => {
    const map = new Map<NineBoxQuadrante, ColaboradorExecutivo[]>();
    for (const colaborador of data?.executivo.nineBox ?? []) {
      const list = map.get(colaborador.quadrante) ?? [];
      list.push(colaborador);
      map.set(colaborador.quadrante, list);
    }
    return map;
  }, [data?.executivo.nineBox]);

  return (
    <div className={page.page}>
      <PageHeader
        title="Visão estratégica"
        description="Radar offshore, IMA, rankings, nine-box, riscos de turnover e plano de sucessão."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(bundle) => (
          <>
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Colaboradores</div>
                <div className={page.metricValue}>{bundle.executivo.totalColaboradores}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>IMA médio</div>
                <div className={page.metricValue}>
                  {bundle.executivo.imaMedio?.toFixed(1) ?? '—'}
                </div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Alta performance</div>
                <div className={page.metricValue}>{bundle.executivo.pctAltaPerformance}%</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Críticos</div>
                <div className={page.metricValue}>{bundle.executivo.pctCritico}%</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Riscos turnover</div>
                <div className={page.metricValue}>{bundle.executivo.riscos.length}</div>
              </div>
            </div>

            <PotencialSucessaoForms
              colaboradores={bundle.executivo.nineBox}
              opcoes={bundle.opcoes}
              sucessao={bundle.executivo.sucessao}
              onChanged={reload}
            />

            <div className={gerencial.heroRow}>
              <Card>
                <h2 className={gerencial.cardTitle}>Radar offshore (12 eixos)</h2>
                <p className={gerencial.cardHint}>Comparativo consolidado das seções GO–IN.</p>
                <RadarDesempenhoChart
                  labels={bundle.gerencial.radarOffshore.labels}
                  valores={bundle.gerencial.radarOffshore.valores}
                  size={320}
                  hint="Escala 0–3 · 12 seções offshore"
                />
              </Card>
              <Card>
                <h2 className={gerencial.cardTitle}>IMA consolidado</h2>
                <p className={gerencial.cardHint}>Índice médio ponderado da organização.</p>
                <ImaGaugeChart ima={bundle.gerencial.ima} size={300} />
              </Card>
            </div>

            <div className={gerencial.dualRow}>
              <Card>
                <h2 className={gerencial.cardTitle}>Top 5</h2>
                <div className={page.list}>
                  {bundle.gerencial.top5.map((item, index) => (
                    <div key={item.id} className={page.listItem}>
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>
                          #{index + 1} {item.nome}
                        </span>
                        <Badge label={item.media.toFixed(1)} tone="success" size="sm" />
                      </div>
                      <p className={page.listItemMeta}>{item.departamento ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </Card>
              <Card>
                <h2 className={gerencial.cardTitle}>Bottom 5</h2>
                <div className={page.list}>
                  {bundle.gerencial.bottom5.map((item, index) => (
                    <div key={item.id} className={page.listItem}>
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>
                          #{index + 1} {item.nome}
                        </span>
                        <Badge label={item.media.toFixed(1)} tone="danger" size="sm" />
                      </div>
                      <p className={page.listItemMeta}>{item.departamento ?? '—'}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Nine-box</h2>
              <div className={gerencial.nineBox}>
                <div />
                {PERF_LABELS.map((label) => (
                  <div key={label} className={gerencial.nineBoxAxis}>
                    {label}
                  </div>
                ))}
                {NINE_BOX_MATRIX.map((row, rowIndex) => (
                  <Fragment key={`row-${rowIndex}`}>
                    <div className={gerencial.nineBoxAxis}>{POTENCIAL_LABELS[rowIndex]}</div>
                    {row.map((quadrante) => {
                      const people = nineBoxByQuadrante.get(quadrante) ?? [];
                      return (
                        <div key={quadrante} className={gerencial.nineBoxCell}>
                          <span className={gerencial.nineBoxCellHeader}>
                            {NINE_BOX_LABELS[quadrante]}
                          </span>
                          <span className={gerencial.nineBoxCount}>{people.length}</span>
                          <ul className={gerencial.nineBoxNames}>
                            {people.slice(0, 3).map((person) => (
                              <li key={person.id}>{person.nome}</li>
                            ))}
                            {people.length > 3 ? <li>+{people.length - 3}</li> : null}
                          </ul>
                        </div>
                      );
                    })}
                  </Fragment>
                ))}
              </div>
              <div className={page.list}>
                {(bundle.executivo.nineBox ?? []).map((colaborador) => (
                  <Card key={colaborador.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                      <Badge
                        label={NINE_BOX_LABELS[colaborador.quadrante]}
                        tone="info"
                        size="sm"
                      />
                    </div>
                    <p className={page.listItemMeta}>
                      IMA {colaborador.ima?.toFixed(1) ?? '—'} · Potencial{' '}
                      {colaborador.potencialCadastrado
                        ? colaborador.potencial
                        : 'não cadastrado (padrão médio)'}{' '}
                      · {NINE_BOX_ACOES[colaborador.quadrante]}
                    </p>
                  </Card>
                ))}
              </div>
            </section>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Riscos de turnover</h2>
              {bundle.executivo.riscos.length === 0 ? (
                <p className={page.listItemMeta}>Nenhum risco identificado.</p>
              ) : (
                <div className={page.list}>
                  {bundle.executivo.riscos.map((risco) => (
                    <Card key={risco.id} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>{risco.nome}</span>
                        <Badge
                          label={risco.risco}
                          tone={
                            risco.risco === 'perda' || risco.risco === 'turnover'
                              ? 'danger'
                              : risco.risco === 'atencao'
                                ? 'warning'
                                : 'success'
                          }
                          size="sm"
                        />
                      </div>
                      <p className={page.listItemMeta}>
                        IMA {risco.imaAtual?.toFixed(1) ?? '—'} →{' '}
                        {risco.imaAnterior?.toFixed(1) ?? '—'} · Tendência {risco.tendencia} ·{' '}
                        {risco.tempoEmpresaAnos != null
                          ? `${risco.tempoEmpresaAnos.toFixed(1)} anos`
                          : '—'}
                      </p>
                    </Card>
                  ))}
                </div>
              )}
            </section>

            {bundle.executivo.porDepartamento.length > 0 ? (
              <section className={page.section}>
                <h2 className={page.sectionTitle}>IMA por departamento</h2>
                <div className={page.list}>
                  {bundle.executivo.porDepartamento.map((dept) => (
                    <Card key={dept.departamento} padding="compact">
                      <div className={page.listItemHeader}>
                        <span className={page.listItemTitle}>{dept.departamento}</span>
                        <Badge
                          label={dept.imaMedio?.toFixed(1) ?? '—'}
                          tone="accent"
                          size="sm"
                        />
                      </div>
                      <p className={page.listItemMeta}>{dept.total} colaborador(es)</p>
                    </Card>
                  ))}
                </div>
              </section>
            ) : null}
          </>
        )}
      </PageContent>
    </div>
  );
}
