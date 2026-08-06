import { useMemo, useState } from 'react';

import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import {
  deletePlanoSucessao,
  upsertColaboradorPotencial,
  upsertPlanoSucessao,
  type ColaboradorExecutivo,
  type ColaboradorOpcao,
  type PlanoSucessaoRow,
  type PotencialNivel,
} from '@/features/executivo/api';
import { useAuth } from '@/features/auth/auth-context';
import page from '../styles/page.module.css';

const POTENCIAIS: PotencialNivel[] = ['baixo', 'medio', 'alto'];

type Props = {
  colaboradores: ColaboradorExecutivo[];
  opcoes: ColaboradorOpcao[];
  sucessao: PlanoSucessaoRow[];
  onChanged: () => void;
};

export function PotencialSucessaoForms({ colaboradores, opcoes, sucessao, onChanged }: Props) {
  const { user } = useAuth();
  const [feedback, setFeedback] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [colaboradorId, setColaboradorId] = useState(colaboradores[0]?.id ?? '');
  const [potencial, setPotencial] = useState<PotencialNivel>('medio');
  const [observacao, setObservacao] = useState('');

  const [posicaoChave, setPosicaoChave] = useState('');
  const [titularId, setTitularId] = useState('');
  const [sucessor1Id, setSucessor1Id] = useState('');
  const [prontidaoS1, setProntidaoS1] = useState('pronto_agora');
  const [sucessor2Id, setSucessor2Id] = useState('');
  const [prontidaoS2, setProntidaoS2] = useState('1_2_anos');
  const [gap, setGap] = useState('');
  const [acao, setAcao] = useState('');
  const [editId, setEditId] = useState<string | null>(null);

  const selected = useMemo(
    () => colaboradores.find((item) => item.id === colaboradorId),
    [colaboradorId, colaboradores],
  );

  async function savePotencial() {
    if (!colaboradorId) {
      setFeedback('Selecione um colaborador.');
      return;
    }
    setBusy(true);
    setFeedback(null);
    try {
      await upsertColaboradorPotencial({
        colaboradorId,
        potencial,
        observacao,
        avaliadoPorId: user?.id ?? null,
      });
      setFeedback('Potencial salvo. O nine-box será recalculado.');
      onChanged();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar potencial.');
    } finally {
      setBusy(false);
    }
  }

  async function saveSucessao() {
    setBusy(true);
    setFeedback(null);
    try {
      await upsertPlanoSucessao({
        id: editId ?? undefined,
        posicaoChave,
        titularId: titularId || null,
        sucessor1Id: sucessor1Id || null,
        prontidaoS1,
        sucessor2Id: sucessor2Id || null,
        prontidaoS2,
        gapIdentificado: gap,
        acaoDesenvolvimento: acao,
      });
      setEditId(null);
      setPosicaoChave('');
      setTitularId('');
      setSucessor1Id('');
      setSucessor2Id('');
      setGap('');
      setAcao('');
      setFeedback(editId ? 'Plano de sucessão atualizado.' : 'Plano de sucessão criado.');
      onChanged();
    } catch (err) {
      setFeedback(err instanceof Error ? err.message : 'Erro ao salvar sucessão.');
    } finally {
      setBusy(false);
    }
  }

  function startEdit(item: PlanoSucessaoRow) {
    setEditId(item.id);
    setPosicaoChave(item.posicaoChave);
    setTitularId(item.titularId ?? '');
    setSucessor1Id(item.sucessor1Id ?? '');
    setProntidaoS1(item.prontidaoS1 ?? 'pronto_agora');
    setSucessor2Id(item.sucessor2Id ?? '');
    setProntidaoS2(item.prontidaoS2 ?? '1_2_anos');
    setGap(item.gapIdentificado ?? '');
    setAcao(item.acaoDesenvolvimento ?? '');
  }

  return (
    <>
      <section className={page.section}>
        <h2 className={page.sectionTitle}>Cadastrar potencial (Nine-box)</h2>
        <Card>
          <div className={page.formGrid}>
            <label className={page.label}>
              Colaborador
              <select
                className={page.input}
                value={colaboradorId}
                onChange={(e) => {
                  setColaboradorId(e.target.value);
                  const current = colaboradores.find((c) => c.id === e.target.value);
                  if (current) setPotencial(current.potencial);
                }}
              >
                {colaboradores.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                    {!item.potencialCadastrado ? ' (sem cadastro)' : ''}
                  </option>
                ))}
              </select>
            </label>
            <label className={page.label}>
              Potencial
              <select
                className={page.input}
                value={potencial}
                onChange={(e) => setPotencial(e.target.value as PotencialNivel)}
              >
                {POTENCIAIS.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>
            <label className={page.label} style={{ gridColumn: '1 / -1' }}>
              Observação
              <input
                className={page.input}
                value={observacao}
                onChange={(e) => setObservacao(e.target.value)}
                placeholder="Opcional"
              />
            </label>
          </div>
          {selected ? (
            <p className={page.listItemMeta} style={{ marginTop: '0.75rem' }}>
              Atual: IMA {selected.ima?.toFixed(1) ?? '—'} · potencial{' '}
              {selected.potencialCadastrado ? selected.potencial : 'não cadastrado'}
            </p>
          ) : null}
          <div className={page.actions} style={{ marginTop: '1rem' }}>
            <Button disabled={busy} onClick={() => void savePotencial()}>
              Salvar potencial
            </Button>
          </div>
        </Card>
      </section>

      <section className={page.section}>
        <h2 className={page.sectionTitle}>
          {editId ? 'Editar plano de sucessão' : 'Novo plano de sucessão'}
        </h2>
        <Card>
          <div className={page.formGrid}>
            <label className={page.label} style={{ gridColumn: '1 / -1' }}>
              Posição-chave
              <input
                className={page.input}
                value={posicaoChave}
                onChange={(e) => setPosicaoChave(e.target.value)}
                placeholder="Ex.: Coordenador de Operações"
              />
            </label>
            <label className={page.label}>
              Titular
              <select className={page.input} value={titularId} onChange={(e) => setTitularId(e.target.value)}>
                <option value="">—</option>
                {opcoes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className={page.label}>
              Sucessor 1
              <select
                className={page.input}
                value={sucessor1Id}
                onChange={(e) => setSucessor1Id(e.target.value)}
              >
                <option value="">—</option>
                {opcoes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className={page.label}>
              Prontidão S1
              <input
                className={page.input}
                value={prontidaoS1}
                onChange={(e) => setProntidaoS1(e.target.value)}
              />
            </label>
            <label className={page.label}>
              Sucessor 2
              <select
                className={page.input}
                value={sucessor2Id}
                onChange={(e) => setSucessor2Id(e.target.value)}
              >
                <option value="">—</option>
                {opcoes.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nome}
                  </option>
                ))}
              </select>
            </label>
            <label className={page.label}>
              Prontidão S2
              <input
                className={page.input}
                value={prontidaoS2}
                onChange={(e) => setProntidaoS2(e.target.value)}
              />
            </label>
            <label className={page.label} style={{ gridColumn: '1 / -1' }}>
              Gap identificado
              <input className={page.input} value={gap} onChange={(e) => setGap(e.target.value)} />
            </label>
            <label className={page.label} style={{ gridColumn: '1 / -1' }}>
              Ação de desenvolvimento
              <input className={page.input} value={acao} onChange={(e) => setAcao(e.target.value)} />
            </label>
          </div>
          <div className={page.actions} style={{ marginTop: '1rem' }}>
            <Button disabled={busy} onClick={() => void saveSucessao()}>
              {editId ? 'Atualizar plano' : 'Criar plano'}
            </Button>
            {editId ? (
              <Button
                variant="secondary"
                disabled={busy}
                onClick={() => {
                  setEditId(null);
                  setPosicaoChave('');
                }}
              >
                Cancelar edição
              </Button>
            ) : null}
          </div>
        </Card>

        <div className={page.list} style={{ marginTop: '1rem' }}>
          {sucessao.map((item) => (
            <Card key={item.id} padding="compact">
              <div className={page.listItemHeader}>
                <h3 className={page.listItemTitle}>{item.posicaoChave}</h3>
                <div className={page.actions}>
                  <Button size="sm" variant="secondary" onClick={() => startEdit(item)}>
                    Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    disabled={busy}
                    onClick={() => {
                      void deletePlanoSucessao(item.id)
                        .then(() => {
                          setFeedback('Plano removido.');
                          onChanged();
                        })
                        .catch((err: unknown) =>
                          setFeedback(err instanceof Error ? err.message : 'Erro ao remover.'),
                        );
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
              <p className={page.listItemMeta}>
                Titular: {item.titularNome ?? '—'} · S1: {item.sucessor1Nome ?? '—'} · S2:{' '}
                {item.sucessor2Nome ?? '—'}
              </p>
            </Card>
          ))}
        </div>
      </section>

      {feedback ? <p className={page.listItemMeta}>{feedback}</p> : null}
    </>
  );
}
