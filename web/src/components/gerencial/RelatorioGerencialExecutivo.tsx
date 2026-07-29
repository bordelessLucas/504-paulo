import { useMemo } from 'react';

import { Badge } from '../ui/Badge';
import { Card } from '../ui/Card';
import type { GerencialDashboardData } from '@/features/gerencial/dashboard-api';
import {
  buildAnaliseGeralEquipe,
  buildRankingComTratativa,
  buildResumoExecutivo,
  buildStatusGestores,
  faixaTone,
  gestorStatusTone,
  type FaixaEquipeKey,
} from '@/features/gerencial/relatorio-gerencial';

import styles from './gerencial.module.css';
import page from '../../styles/page.module.css';

type RelatorioGerencialExecutivoProps = {
  dashboard: GerencialDashboardData;
};

const FAIXA_COLOR: Record<FaixaEquipeKey, string> = {
  excepcional: '#047857',
  alta_performance: '#007a58',
  atende: '#1d4ed8',
  desenvolvimento: '#b45309',
  critico: '#b91c1c',
};

const FAIXA_TONE_CLASS: Record<ReturnType<typeof faixaTone>, string> = {
  success: styles.faixaTone_success,
  accent: styles.faixaTone_accent,
  info: styles.faixaTone_info,
  warning: styles.faixaTone_warning,
  danger: styles.faixaTone_danger,
};

export function RelatorioGerencialExecutivo({ dashboard }: RelatorioGerencialExecutivoProps) {
  const resumo = useMemo(
    () =>
      buildResumoExecutivo({
        totalColaboradores: dashboard.totalColaboradores,
        rankingCompleto: dashboard.rankingCompleto,
        statusPreenchimento: dashboard.statusPreenchimento,
      }),
    [
      dashboard.totalColaboradores,
      dashboard.rankingCompleto,
      dashboard.statusPreenchimento,
    ],
  );
  const faixas = useMemo(
    () => buildAnaliseGeralEquipe(dashboard.rankingCompleto),
    [dashboard.rankingCompleto],
  );
  const gestores = useMemo(
    () => buildStatusGestores(dashboard.statusPreenchimento),
    [dashboard.statusPreenchimento],
  );
  const top10 = useMemo(
    () => buildRankingComTratativa(dashboard.top10),
    [dashboard.top10],
  );
  const bottom10 = useMemo(
    () => buildRankingComTratativa(dashboard.bottom10),
    [dashboard.bottom10],
  );

  return (
    <section className={`${page.section} ${styles.execSection}`} aria-labelledby="relatorio-gerencial-title">
      <div className={styles.execHeader}>
        <div>
          <p className={styles.execEyebrow}>Excel 2.5 · CEO</p>
          <h2 id="relatorio-gerencial-title" className={styles.execTitle}>
            Relatório Gerencial — Dashboard de Avaliações
          </h2>
          <p className={styles.cardHint}>
            Resumo executivo na escala oficial 0–3 (faixas do Excel adaptadas de ≥4,6 → ≥2,7).
          </p>
        </div>
        {dashboard.ima !== null ? (
          <Badge label={`IMA ${dashboard.ima.toFixed(1)}`} tone="accent" />
        ) : null}
      </div>

      <Card>
        <h3 className={styles.cardTitle}>Resumo executivo</h3>
        <div className={styles.execKpis}>
          <div className={styles.execKpi}>
            <span>Total de funcionários</span>
            <strong>{resumo.totalFuncionarios}</strong>
          </div>
          <div className={styles.execKpi}>
            <span>{resumo.fonte === 'ciclo' ? 'Avaliações concluídas' : 'Com IMA'}</span>
            <strong>{resumo.concluidas}</strong>
          </div>
          <div className={styles.execKpi}>
            <span>{resumo.fonte === 'ciclo' ? 'Avaliações pendentes' : 'Sem IMA'}</span>
            <strong>{resumo.pendentes}</strong>
          </div>
          <div className={styles.execKpi}>
            <span>{resumo.fonte === 'ciclo' ? '% conclusão geral' : '% com IMA'}</span>
            <strong>{resumo.percentualConclusao.toFixed(1)}%</strong>
          </div>
        </div>
        <p className={styles.kpiHint}>{resumo.fonteLabel}</p>
      </Card>

      <Card>
        <h3 className={styles.cardTitle}>Análise geral da equipe</h3>
        <p className={styles.cardHint}>Distribuição por IMA (colaboradores com notas aprovadas).</p>
        <div className={styles.faixasRow}>
          {faixas.map((faixa) => (
            <div
              key={faixa.key}
              className={`${styles.faixaCard} ${FAIXA_TONE_CLASS[faixaTone(faixa.key)]}`}
            >
              <span className={styles.faixaRange}>{faixa.rangeLabel}</span>
              <strong className={styles.faixaCount}>{faixa.count}</strong>
              <span
                className={styles.faixaLabel}
                style={{ color: FAIXA_COLOR[faixa.key] }}
              >
                {faixa.label}
              </span>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <h3 className={styles.cardTitle}>Status de avaliações por gestor</h3>
        <p className={styles.cardHint}>
          Ciclo atual (quinzena para supervisor · semestre para gestor). Status: ≥100% concluído ·
          ≥80% em andamento · &lt;80% crítico.
        </p>
        {gestores.length === 0 ? (
          <p className={page.listItemMeta}>
            Nenhum gestor/supervisor com equipe no ciclo. Os KPIs acima usam cobertura de IMA até
            haver vínculo de equipe.
          </p>
        ) : (
          <div className={styles.tableWrap}>
            <table className={styles.dataTable}>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Gestor</th>
                  <th>Total</th>
                  <th>Avaliados</th>
                  <th>Pendentes</th>
                  <th>% Conclusão</th>
                  <th>Status</th>
                  <th>Ação</th>
                </tr>
              </thead>
              <tbody>
                {gestores.map((gestor, index) => (
                  <tr key={gestor.id}>
                    <td>{index + 1}</td>
                    <td>
                      <strong>{gestor.nome}</strong>
                      <div className={styles.tableMeta}>
                        {gestor.departamento ?? '—'} · {gestor.cicloLabel}
                      </div>
                    </td>
                    <td>{gestor.total}</td>
                    <td>{gestor.avaliados}</td>
                    <td>{gestor.pendentes}</td>
                    <td>{gestor.percentual.toFixed(1)}%</td>
                    <td>
                      <Badge
                        label={gestor.statusLabel}
                        tone={gestorStatusTone(gestor.status)}
                        size="sm"
                      />
                    </td>
                    <td>{gestor.acao}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className={styles.dualRow}>
        <Card>
          <h3 className={styles.cardTitle}>
            Top {top10.length || 10} — mais bem avaliados
          </h3>
          <p className={styles.cardHint}>
            Ordenado por IMA (maior → menor). Sem overlap com o bottom.
          </p>
          <RankingTable rows={top10} empty="Sem ranking disponível." />
        </Card>
        <Card>
          <h3 className={styles.cardTitle}>
            Bottom {bottom10.length || 10} — menor desempenho
          </h3>
          <p className={styles.cardHint}>
            Ordenado por IMA (menor → maior). Pessoas do Top não entram aqui.
          </p>
          <RankingTable rows={bottom10} empty="Sem ranking disponível." />
        </Card>
      </div>
    </section>
  );
}

function RankingTable({
  rows,
  empty,
}: {
  rows: ReturnType<typeof buildRankingComTratativa>;
  empty: string;
}) {
  if (rows.length === 0) {
    return <p className={page.listItemMeta}>{empty}</p>;
  }

  return (
    <div className={styles.tableWrap}>
      <table className={`${styles.dataTable} ${styles.rankingTable}`}>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Nome</th>
            <th>IMA</th>
            <th>Classificação</th>
            <th>Tratativa</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={row.id}>
              <td>{index + 1}</td>
              <td>
                <strong>{row.nome}</strong>
                <div className={styles.tableMeta}>{row.funcao ?? row.departamento ?? '—'}</div>
              </td>
              <td>{row.media.toFixed(1)}</td>
              <td>
                <span className={styles.chipText}>{row.classificacaoLabel}</span>
              </td>
              <td>
                <span className={styles.tratativaText}>{row.tratativa}</span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
