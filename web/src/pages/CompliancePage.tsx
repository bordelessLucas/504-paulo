import { useState } from 'react';
import { Shield } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import {
  atualizarProgressoPlanoAcao,
  atualizarStatusDenuncia,
  fetchDashboardCompliance,
  registrarDenuncia,
  registrarPlanoAcaoCompliance,
  registrarRiscoNr1,
  TIPO_DENUNCIA_LABELS,
  type StatusDenuncia,
  type TipoDenuncia,
} from '@/features/compliance/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

const TIPOS = Object.keys(TIPO_DENUNCIA_LABELS) as TipoDenuncia[];
const STATUS_OPTIONS: StatusDenuncia[] = ['aberto', 'em_analise', 'concluido', 'arquivado'];

export function CompliancePage() {
  const dashboardQuery = useAsyncData(() => fetchDashboardCompliance(), []);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const [tipo, setTipo] = useState<TipoDenuncia>('outros');
  const [descricao, setDescricao] = useState('');
  const [anonimo, setAnonimo] = useState(false);

  const [areaSetor, setAreaSetor] = useState('');
  const [tipoRisco, setTipoRisco] = useState('');
  const [descricaoRisco, setDescricaoRisco] = useState('');
  const [probabilidade, setProbabilidade] = useState('3');
  const [severidade, setSeveridade] = useState('3');

  const [origemPlano, setOrigemPlano] = useState('manual');
  const [descricaoPlano, setDescricaoPlano] = useState('');
  const [prazoPlano, setPrazoPlano] = useState('');

  async function withBusy(action: () => Promise<void>, okMessage: string) {
    setBusy(true);
    setFeedback(null);
    try {
      await action();
      setFeedback(okMessage);
      dashboardQuery.reload();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Falha ao salvar.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Compliance & Denúncias"
        description="Registre denúncias, riscos NR-1 e planos de ação."
        accessory={<Badge label="NR-1" tone="accent" size="sm" />}
      />

      {dashboardQuery.isLoading ? (
        <PageContent isLoading error={null} data={null}>
          {() => null}
        </PageContent>
      ) : dashboardQuery.error ? (
        <div className={page.error}>{dashboardQuery.error}</div>
      ) : (
        <>
          {dashboardQuery.data ? (
            <div className={page.metrics}>
              <div className={page.metric}>
                <div className={page.metricLabel}>Denúncias abertas</div>
                <div className={page.metricValue}>{dashboardQuery.data.abertas}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Em análise</div>
                <div className={page.metricValue}>{dashboardQuery.data.emAnalise}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Riscos NR-1</div>
                <div className={page.metricValue}>{dashboardQuery.data.totalRiscos}</div>
              </div>
              <div className={page.metric}>
                <div className={page.metricLabel}>Planos pendentes</div>
                <div className={page.metricValue}>{dashboardQuery.data.planosPendentes}</div>
              </div>
            </div>
          ) : null}

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Nova denúncia</h2>
            <Card>
              <div className={page.formGrid}>
                <label className={page.label}>
                  Tipo
                  <select
                    className={page.input}
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value as TipoDenuncia)}
                  >
                    {TIPOS.map((item) => (
                      <option key={item} value={item}>
                        {TIPO_DENUNCIA_LABELS[item]}
                      </option>
                    ))}
                  </select>
                </label>
                <label className={page.label}>
                  Anônimo
                  <select
                    className={page.input}
                    value={anonimo ? 'sim' : 'nao'}
                    onChange={(e) => setAnonimo(e.target.value === 'sim')}
                  >
                    <option value="nao">Não</option>
                    <option value="sim">Sim</option>
                  </select>
                </label>
                <label className={page.label} style={{ gridColumn: '1 / -1' }}>
                  Descrição
                  <textarea
                    className={page.textarea}
                    rows={4}
                    value={descricao}
                    onChange={(e) => setDescricao(e.target.value)}
                    placeholder="Descreva o relato com detalhes..."
                  />
                </label>
              </div>
              <div className={page.actions} style={{ marginTop: '1rem' }}>
                <Button
                  disabled={busy}
                  leftIcon={<Shield size={16} />}
                  onClick={() =>
                    void withBusy(async () => {
                      await registrarDenuncia({ tipo, descricao, anonimo });
                      setDescricao('');
                    }, 'Denúncia registrada. SLA 72h.')
                  }
                >
                  Registrar denúncia
                </Button>
              </div>
            </Card>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Novo risco NR-1</h2>
            <Card>
              <div className={page.formGrid}>
                <label className={page.label}>
                  Área / setor
                  <input
                    className={page.input}
                    value={areaSetor}
                    onChange={(e) => setAreaSetor(e.target.value)}
                  />
                </label>
                <label className={page.label}>
                  Tipo de risco
                  <input
                    className={page.input}
                    value={tipoRisco}
                    onChange={(e) => setTipoRisco(e.target.value)}
                  />
                </label>
                <label className={page.label}>
                  Probabilidade (1-5)
                  <input
                    className={page.input}
                    value={probabilidade}
                    onChange={(e) => setProbabilidade(e.target.value)}
                  />
                </label>
                <label className={page.label}>
                  Severidade (1-5)
                  <input
                    className={page.input}
                    value={severidade}
                    onChange={(e) => setSeveridade(e.target.value)}
                  />
                </label>
                <label className={page.label} style={{ gridColumn: '1 / -1' }}>
                  Descrição
                  <textarea
                    className={page.textarea}
                    rows={3}
                    value={descricaoRisco}
                    onChange={(e) => setDescricaoRisco(e.target.value)}
                  />
                </label>
              </div>
              <div className={page.actions} style={{ marginTop: '1rem' }}>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void withBusy(async () => {
                      await registrarRiscoNr1({
                        areaSetor,
                        tipoRisco,
                        descricao: descricaoRisco,
                        probabilidade: Number(probabilidade),
                        severidade: Number(severidade),
                      });
                      setAreaSetor('');
                      setTipoRisco('');
                      setDescricaoRisco('');
                    }, 'Risco NR-1 registrado.')
                  }
                >
                  Registrar risco
                </Button>
              </div>
            </Card>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Novo plano de ação</h2>
            <Card>
              <div className={page.formGrid}>
                <label className={page.label}>
                  Origem
                  <input
                    className={page.input}
                    value={origemPlano}
                    onChange={(e) => setOrigemPlano(e.target.value)}
                  />
                </label>
                <label className={page.label}>
                  Prazo
                  <input
                    className={page.input}
                    type="date"
                    value={prazoPlano}
                    onChange={(e) => setPrazoPlano(e.target.value)}
                  />
                </label>
                <label className={page.label} style={{ gridColumn: '1 / -1' }}>
                  Ação
                  <textarea
                    className={page.textarea}
                    rows={3}
                    value={descricaoPlano}
                    onChange={(e) => setDescricaoPlano(e.target.value)}
                  />
                </label>
              </div>
              <div className={page.actions} style={{ marginTop: '1rem' }}>
                <Button
                  disabled={busy}
                  onClick={() =>
                    void withBusy(async () => {
                      await registrarPlanoAcaoCompliance({
                        origemTipo: origemPlano,
                        descricaoAcao: descricaoPlano,
                        prazo: prazoPlano || null,
                      });
                      setDescricaoPlano('');
                      setPrazoPlano('');
                    }, 'Plano de ação criado.')
                  }
                >
                  Criar plano
                </Button>
              </div>
            </Card>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Denúncias recentes</h2>
            <div className={page.list}>
              {(dashboardQuery.data?.denuncias ?? []).map((item) => (
                <Card key={item.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{item.id_relato}</span>
                    <Badge label={item.status} tone="warning" size="sm" />
                  </div>
                  <p className={page.listItemMeta}>
                    {item.tipo_denuncia
                      ? TIPO_DENUNCIA_LABELS[item.tipo_denuncia]
                      : 'Tipo não informado'}
                  </p>
                  <div className={page.actions} style={{ marginTop: '0.5rem' }}>
                    {STATUS_OPTIONS.map((status) => (
                      <Button
                        key={status}
                        size="sm"
                        variant={item.status === status ? 'primary' : 'secondary'}
                        disabled={busy}
                        onClick={() =>
                          void withBusy(
                            () => atualizarStatusDenuncia(item.id, status),
                            'Status da denúncia atualizado.',
                          )
                        }
                      >
                        {status}
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Riscos NR-1</h2>
            <div className={page.list}>
              {(dashboardQuery.data?.riscos ?? []).map((risco) => (
                <Card key={risco.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{risco.id_risco}</span>
                    <Badge label={risco.nivel_risco ?? '—'} tone="danger" size="sm" />
                  </div>
                  <p className={page.listItemBody}>{risco.descricao}</p>
                </Card>
              ))}
            </div>
          </section>

          <section className={page.section}>
            <h2 className={page.sectionTitle}>Planos de ação</h2>
            <div className={page.list}>
              {(dashboardQuery.data?.planos ?? []).map((plano) => (
                <Card key={plano.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <span className={page.listItemTitle}>{plano.id_acao}</span>
                    <Badge label={`${plano.conclusao_pct}%`} tone="info" size="sm" />
                  </div>
                  <p className={page.listItemBody}>{plano.descricao_acao}</p>
                  <div className={page.actions} style={{ marginTop: '0.5rem' }}>
                    {[25, 50, 75, 100].map((pct) => (
                      <Button
                        key={pct}
                        size="sm"
                        variant="secondary"
                        disabled={busy}
                        onClick={() =>
                          void withBusy(
                            () => atualizarProgressoPlanoAcao(plano.id, pct),
                            'Progresso atualizado.',
                          )
                        }
                      >
                        {pct}%
                      </Button>
                    ))}
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {feedback ? <p className={page.listItemMeta}>{feedback}</p> : null}
        </>
      )}
    </div>
  );
}
