import { TrendingUp } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import {
  formatMoedaBrl,
  formatPercentualReajuste,
} from '@/features/reajuste/analise';
import { fetchColaboradoresReajusteResumo } from '@/features/reajuste/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import styles from './PainelReajustePage.module.css';

export function PainelReajustePage() {
  const { user } = useAuth();
  const { role } = useAuthRole();

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresReajusteResumo(user!.id, role),
    [user?.id, role],
    { enabled: Boolean(user?.id && role) },
  );

  return (
    <div className={page.page} style={{ maxWidth: 1280 }}>
      <PageHeader
        title="Análise de reajuste salarial"
        description="Acesso restrito: gerente direto, RH e CEO. IMA, classificação e recomendação estratégica."
        accessory={<Badge label="Anual" tone="accent" size="sm" />}
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(rows) =>
          rows.length === 0 ? (
            <EmptyState
              icon={TrendingUp}
              title="Nenhum colaborador no escopo"
              description="Não há colaboradores elegíveis para análise de reajuste."
            />
          ) : (
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Colaborador</th>
                    <th>Função</th>
                    <th>Especialidade</th>
                    <th>IRATA</th>
                    <th>Tempo de casa</th>
                    <th>IMA</th>
                    <th>Classificação</th>
                    <th>Salário</th>
                    <th>% sugerido</th>
                    <th>Novo salário</th>
                    <th>Recomendação</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr key={row.id}>
                      <td>
                        <div className={styles.nameCell}>
                          <strong>{row.nome}</strong>
                          <span>{row.departamento ?? '—'}</span>
                        </div>
                      </td>
                      <td>{row.funcao ?? '—'}</td>
                      <td>{row.especialidade ?? '—'}</td>
                      <td>{row.nivelIrata ?? '—'}</td>
                      <td>{row.tempoEmpresaLabel ?? '—'}</td>
                      <td>{row.media?.toFixed(1) ?? '—'}</td>
                      <td>
                        <Badge
                          label={row.analise.classificacaoLabel ?? 'Sem IMA'}
                          tone={
                            row.analise.classificacao === 'critico' ||
                            row.analise.classificacao === 'desenvolvimento'
                              ? 'danger'
                              : row.analise.classificacao === 'excepcional' ||
                                  row.analise.classificacao === 'alta_performance'
                                ? 'success'
                                : 'neutral'
                          }
                          size="sm"
                        />
                      </td>
                      <td>{formatMoedaBrl(row.salarioBase)}</td>
                      <td>{formatPercentualReajuste(row.analise.percentualSugerido)}</td>
                      <td>{formatMoedaBrl(row.analise.novoSalario)}</td>
                      <td>
                        <div className={styles.recomendacao}>
                          {row.analise.recomendacao}
                          {row.temIncidentesRecentes ? (
                            <span className={styles.alerta}>Incidentes recentes</span>
                          ) : null}
                          {!row.isElegivel ? (
                            <span className={styles.alerta}>Bloqueado para solicitação</span>
                          ) : null}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        }
      </PageContent>
    </div>
  );
}
