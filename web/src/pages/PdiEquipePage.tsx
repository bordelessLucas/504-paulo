import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';

import { CriarPdiForm } from '../components/pdi/CriarPdiForm';
import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  PDI_EIXO_OPTIONS,
  PDI_EIXO_SHORT,
  PDI_STATUS_LABELS,
  PDI_STATUS_OPTIONS,
  formatPrazoRelativo,
} from '@/features/pdi/labels';
import type { PdiEixo, PdiStatus } from '@/features/pdi/types';
import { useAuth } from '@/features/auth/auth-context';
import { buscarPDIsDaEquipe } from '@/services/pdiService';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

export function PdiEquipePage() {
  const { user } = useAuth();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [filtroStatus, setFiltroStatus] = useState<PdiStatus | 'todos'>('todos');
  const [filtroEixo, setFiltroEixo] = useState<PdiEixo | 'todos'>('todos');
  const [criarPara, setCriarPara] = useState<{ id: string; nome: string } | null>(null);

  const { data, isLoading, error, reload } = useAsyncData(
    () => buscarPDIsDaEquipe(user!.id),
    [user?.id],
    { enabled: Boolean(user?.id) },
  );

  const resumosFiltrados = useMemo(() => {
    const resumos = data ?? [];
    return resumos
      .map((resumo) => {
        const pdis = resumo.pdis.filter((pdi) => {
          const statusOk = filtroStatus === 'todos' || pdi.status === filtroStatus;
          const eixoOk = filtroEixo === 'todos' || pdi.eixo === filtroEixo;
          return statusOk && eixoOk;
        });
        return { ...resumo, pdis };
      })
      .filter((resumo) => resumo.pdis.length > 0 || (filtroStatus === 'todos' && filtroEixo === 'todos'));
  }, [data, filtroEixo, filtroStatus]);

  return (
    <div className={page.page}>
      <PageHeader
        title="PDI da equipe"
        description="Resumo de planos de desenvolvimento por colaborador liderado."
      />

      <div className={admin.chipGroup} style={{ marginBottom: '0.75rem' }}>
        <button
          type="button"
          className={`${admin.chip} ${filtroStatus === 'todos' ? admin.chipActive : ''}`.trim()}
          onClick={() => setFiltroStatus('todos')}
        >
          Todos status
        </button>
        {PDI_STATUS_OPTIONS.map((status) => (
          <button
            key={status}
            type="button"
            className={`${admin.chip} ${filtroStatus === status ? admin.chipActive : ''}`.trim()}
            onClick={() => setFiltroStatus(status)}
          >
            {PDI_STATUS_LABELS[status]}
          </button>
        ))}
      </div>

      <div className={admin.chipGroup} style={{ marginBottom: '1rem' }}>
        <button
          type="button"
          className={`${admin.chip} ${filtroEixo === 'todos' ? admin.chipActive : ''}`.trim()}
          onClick={() => setFiltroEixo('todos')}
        >
          Todos eixos
        </button>
        {PDI_EIXO_OPTIONS.map((eixo) => (
          <button
            key={eixo}
            type="button"
            className={`${admin.chip} ${filtroEixo === eixo ? admin.chipActive : ''}`.trim()}
            onClick={() => setFiltroEixo(eixo)}
          >
            {PDI_EIXO_SHORT[eixo]}
          </button>
        ))}
      </div>

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum PDI na equipe"
      >
        {() =>
          resumosFiltrados.length === 0 ? (
            <p className={admin.hint}>Nenhum PDI corresponde aos filtros.</p>
          ) : (
            <div className={page.list}>
              {resumosFiltrados.map((resumo) => {
                const isExpanded = expandedId === resumo.colaboradorId;
                return (
                  <Card key={resumo.colaboradorId} padding="compact">
                    <div className={page.listItemHeader}>
                      <div>
                        <h3 className={page.listItemTitle}>{resumo.colaboradorNome}</h3>
                        <p className={page.listItemMeta}>{resumo.departamento ?? '—'}</p>
                      </div>
                      <Badge label={`${resumo.total} PDI(s)`} tone="neutral" size="sm" />
                    </div>

                    <div className={page.metrics} style={{ marginTop: '0.75rem' }}>
                      <div className={page.metric}>
                        <div className={page.metricLabel}>Abertos</div>
                        <div className={page.metricValue}>{resumo.abertos}</div>
                      </div>
                      <div className={page.metric}>
                        <div className={page.metricLabel}>Em andamento</div>
                        <div className={page.metricValue}>{resumo.emAndamento}</div>
                      </div>
                      <div className={page.metric}>
                        <div className={page.metricLabel}>Concluídos</div>
                        <div className={page.metricValue}>{resumo.concluidos}</div>
                      </div>
                    </div>

                    <div className={page.actions} style={{ marginTop: '0.75rem' }}>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() =>
                          setExpandedId(isExpanded ? null : resumo.colaboradorId)
                        }
                      >
                        {isExpanded ? 'Ocultar PDIs' : 'Ver PDIs'}
                      </Button>
                      {user ? (
                        <Button
                          size="sm"
                          onClick={() =>
                            setCriarPara({
                              id: resumo.colaboradorId,
                              nome: resumo.colaboradorNome,
                            })
                          }
                        >
                          Criar PDI
                        </Button>
                      ) : null}
                    </div>

                    {isExpanded ? (
                      <div className={page.list} style={{ marginTop: '0.85rem' }}>
                        {resumo.pdis.length === 0 ? (
                          <p className={admin.hint}>Nenhum PDI neste filtro.</p>
                        ) : (
                          resumo.pdis.map((pdi) => (
                            <div key={pdi.id} className={admin.sectionBlock}>
                              <div className={page.listItemHeader}>
                                <div>
                                  <p className={page.listItemTitle}>{pdi.titulo}</p>
                                  <p className={page.listItemMeta}>
                                    {PDI_EIXO_SHORT[pdi.eixo]} · {formatPrazoRelativo(pdi.prazo)} ·{' '}
                                    {pdi.progressoPct}%
                                  </p>
                                </div>
                                <Badge
                                  label={PDI_STATUS_LABELS[pdi.status]}
                                  tone="info"
                                  size="sm"
                                />
                              </div>
                              <Link to={`/app/pdi/${pdi.id}`}>Abrir detalhe</Link>
                            </div>
                          ))
                        )}
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )
        }
      </PageContent>

      {user && criarPara ? (
        <CriarPdiForm
          open
          colaboradorId={criarPara.id}
          colaboradorNome={criarPara.nome}
          criadoPorId={user.id}
          onClose={() => setCriarPara(null)}
          onCreated={() => reload()}
        />
      ) : null}
    </div>
  );
}
