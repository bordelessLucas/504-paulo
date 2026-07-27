import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  PDI_EIXO_LABELS,
  PDI_STATUS_LABELS,
  formatPdiDate,
  formatPrazoRelativo,
} from '@/features/pdi/labels';
import {
  atualizarProgresso,
  buscarHistoricoPDI,
  buscarPDIById,
} from '@/services/pdiService';
import { useAuth } from '@/features/auth/auth-context';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PdiDetailPage() {
  const { pdiId } = useParams<{ pdiId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [progresso, setProgresso] = useState<number | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const pdiQuery = useAsyncData(
    () => buscarPDIById(pdiId!),
    [pdiId],
    { enabled: Boolean(pdiId) },
  );

  const historicoQuery = useAsyncData(
    () => buscarHistoricoPDI(pdiId!),
    [pdiId],
    { enabled: Boolean(pdiId) },
  );

  async function handleSaveProgress() {
    if (!user || !pdiId || progresso == null) return;
    setIsSaving(true);
    setSaveError(null);
    try {
      await atualizarProgresso(pdiId, { progressoPct: progresso }, user.id);
      pdiQuery.reload();
      historicoQuery.reload();
    } catch (error) {
      setSaveError(error instanceof Error ? error.message : 'Erro ao salvar progresso.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader title="Detalhe do PDI" description="Acompanhe metas, prazo e histórico." />

      <PageContent
        isLoading={pdiQuery.isLoading}
        error={pdiQuery.error}
        data={pdiQuery.data}
        onRetry={pdiQuery.reload}
      >
        {(pdi) => (
          <>
            <Card style={{ marginBottom: '1rem' }}>
              <div className={page.listItemHeader}>
                <h2 className={page.pageTitle} style={{ fontSize: '1.25rem' }}>
                  {pdi.titulo}
                </h2>
                <Badge label={PDI_STATUS_LABELS[pdi.status]} tone="accent" />
              </div>
              <p className={page.listItemMeta}>
                {PDI_EIXO_LABELS[pdi.eixo]} · Prazo {formatPdiDate(pdi.prazo)} (
                {formatPrazoRelativo(pdi.prazo)})
              </p>
              {pdi.descricao ? <p className={page.listItemBody}>{pdi.descricao}</p> : null}
              <p className={page.listItemBody}>
                <strong>Indicador:</strong> {pdi.indicadorSucesso}
              </p>
              <p className={page.listItemMeta}>Progresso atual: {pdi.progressoPct}%</p>
            </Card>

            <Card style={{ marginBottom: '1rem' }}>
              <h3 className={page.sectionTitle} style={{ textTransform: 'none' }}>
                Atualizar progresso
              </h3>
              <div className={page.field}>
                <label className={page.label} htmlFor="progresso">
                  Progresso (%)
                </label>
                <input
                  id="progresso"
                  className={page.input}
                  type="number"
                  min={0}
                  max={100}
                  value={progresso ?? pdi.progressoPct}
                  onChange={(event) => setProgresso(Number(event.target.value))}
                />
              </div>
              {saveError ? <div className={page.error}>{saveError}</div> : null}
              <div className={page.actions}>
                <Button isLoading={isSaving} onClick={() => void handleSaveProgress()}>
                  Salvar
                </Button>
                <Button variant="secondary" onClick={() => navigate('/pdi')}>
                  Voltar
                </Button>
              </div>
            </Card>

            <section className={page.section}>
              <h2 className={page.sectionTitle}>Histórico</h2>
              <PageContent
                isLoading={historicoQuery.isLoading}
                error={historicoQuery.error}
                data={historicoQuery.data}
                onRetry={historicoQuery.reload}
                isEmpty={(items) => items.length === 0}
                emptyTitle="Sem atualizações registradas"
              >
                {(items) => (
                  <div className={page.list}>
                    {items.map((item) => (
                      <Card key={item.id} padding="compact">
                        <p className={page.listItemMeta}>
                          {new Date(item.createdAt).toLocaleString('pt-BR')}
                          {item.autorNome ? ` · ${item.autorNome}` : ''}
                        </p>
                        {item.comentario ? (
                          <p className={page.listItemBody}>{item.comentario}</p>
                        ) : null}
                        {item.progressoNovo != null ? (
                          <Badge label={`${item.progressoNovo}%`} tone="info" size="sm" />
                        ) : null}
                      </Card>
                    ))}
                  </div>
                )}
              </PageContent>
            </section>
          </>
        )}
      </PageContent>
    </div>
  );
}
