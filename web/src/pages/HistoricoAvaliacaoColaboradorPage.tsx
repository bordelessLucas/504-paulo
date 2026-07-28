import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  fetchHistoricoAvaliacoesCompleto,
  fetchHistoricoAvaliacoesMasked,
  type AvaliacaoHistoricoItem,
} from '@/features/avaliacao/historico-api';
import { TIPO_AVALIACAO_LABELS } from '@/features/avaliacao/ciclos';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole, type TipoAvaliacao } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

type FiltroTipo = 'todas' | TipoAvaliacao;

export function HistoricoAvaliacaoColaboradorPage() {
  const { avaliadoId } = useParams();
  const { role } = useAuthRole();
  const [filtroTipo, setFiltroTipo] = useState<FiltroTipo>('todas');
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const revealAvaliador =
    role === 'gerente' || role === 'gestor' || role === 'supervisor' || isAdminDashboardRole(role);

  const { data, isLoading, error, reload } = useAsyncData(
    async () => {
      if (!avaliadoId) return [] as AvaliacaoHistoricoItem[];
      return revealAvaliador
        ? fetchHistoricoAvaliacoesCompleto(avaliadoId)
        : fetchHistoricoAvaliacoesMasked(avaliadoId);
    },
    [avaliadoId, revealAvaliador],
    { enabled: Boolean(avaliadoId) },
  );

  const itemsFiltrados = useMemo(() => {
    const items = data ?? [];
    if (filtroTipo === 'todas') return items;
    return items.filter((item) => item.tipo === filtroTipo);
  }, [data, filtroTipo]);

  if (!avaliadoId) {
    return (
      <div className={page.page}>
        <div className={page.error}>Colaborador não informado.</div>
      </div>
    );
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Histórico de avaliações"
        description="Ciclos anteriores do colaborador, com notas e justificativas."
        accessory={
          <Link to={`/app/avaliacao/${avaliadoId}`}>
            <Button size="sm">Nova avaliação</Button>
          </Link>
        }
      />

      <div className={admin.chipGroup} style={{ marginBottom: '1rem' }}>
        {(['todas', 'quinzenal', 'semestral', 'anual'] as const).map((option) => (
          <button
            key={option}
            type="button"
            className={`${admin.chip} ${filtroTipo === option ? admin.chipActive : ''}`.trim()}
            onClick={() => setFiltroTipo(option)}
          >
            {option === 'todas' ? 'Todas' : TIPO_AVALIACAO_LABELS[option]}
          </button>
        ))}
      </div>

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {() =>
          itemsFiltrados.length === 0 ? (
            <p className={admin.hint}>Nenhuma avaliação encontrada para este filtro.</p>
          ) : (
            <div className={page.list}>
              {itemsFiltrados.map((item) => {
                const isExpanded = expandedId === item.id;
                return (
                  <Card key={item.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <div>
                        <h3 className={page.listItemTitle}>
                          {TIPO_AVALIACAO_LABELS[item.tipo]} ·{' '}
                          {formatDataBr(item.dataReferencia)}
                        </h3>
                        <p className={page.listItemMeta}>
                          {revealAvaliador && item.avaliadorNome
                            ? `Avaliador: ${item.avaliadorNome}`
                            : 'Avaliador oculto'}
                          {item.status ? ` · ${item.status}` : ''}
                        </p>
                      </div>
                      <div className={page.actions}>
                        <Badge
                          label={item.media != null ? item.media.toFixed(1) : '—'}
                          tone="info"
                          size="sm"
                        />
                        <Button
                          size="sm"
                          variant="secondary"
                          onClick={() => setExpandedId(isExpanded ? null : item.id)}
                        >
                          {isExpanded ? 'Ocultar' : 'Detalhes'}
                        </Button>
                      </div>
                    </div>

                    {isExpanded ? (
                      <div className={page.list} style={{ marginTop: '0.75rem' }}>
                        {item.respostas.map((resposta, index) => (
                          <div key={`${item.id}-${index}`}>
                            <p className={page.listItemTitle}>
                              {resposta.perguntaCodigo
                                ? `${resposta.perguntaCodigo} · `
                                : ''}
                              {resposta.perguntaDescricao}
                            </p>
                            <p className={page.listItemMeta}>
                              Nota {resposta.nota ?? '—'}
                              {resposta.justificativa
                                ? ` · ${resposta.justificativa}`
                                : ''}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : null}
                  </Card>
                );
              })}
            </div>
          )
        }
      </PageContent>

      <div className={page.actions} style={{ marginTop: '1rem' }}>
        <Link to="/app/painel-avaliacao">
          <Button variant="secondary">Voltar ao painel</Button>
        </Link>
      </div>
    </div>
  );
}

function formatDataBr(isoDate: string) {
  const [year, month, day] = isoDate.split('T')[0].split('-');
  if (!year || !month || !day) return isoDate;
  return `${day}/${month}/${year}`;
}
