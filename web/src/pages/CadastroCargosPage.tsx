import { useState } from 'react';
import { Briefcase } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import {
  createCargo,
  fetchCargos,
  setCargoAtivo,
  updateCargo,
  type CargoRow,
} from '@/features/rh/cargos-api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

type FormState = {
  nome: string;
  codigoCbo: string;
  departamento: string;
  descricao: string;
};

const EMPTY_FORM: FormState = {
  nome: '',
  codigoCbo: '',
  departamento: '',
  descricao: '',
};

export function CadastroCargosPage() {
  const { data, isLoading, error, reload } = useAsyncData(() => fetchCargos(), []);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  function startEdit(cargo: CargoRow) {
    setEditingId(cargo.id);
    setForm({
      nome: cargo.nome,
      codigoCbo: cargo.codigoCbo ?? '',
      departamento: cargo.departamento ?? '',
      descricao: cargo.descricao ?? '',
    });
    setFormError(null);
  }

  function resetForm() {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError(null);
  }

  async function handleSubmit() {
    setIsSaving(true);
    setFormError(null);
    try {
      if (editingId) {
        await updateCargo(editingId, form);
      } else {
        await createCargo(form);
      }
      resetForm();
      reload();
    } catch (saveError) {
      setFormError(saveError instanceof Error ? saveError.message : 'Erro ao salvar cargo.');
    } finally {
      setIsSaving(false);
    }
  }

  async function handleToggleAtivo(cargo: CargoRow) {
    try {
      await setCargoAtivo(cargo.id, !cargo.ativo);
      reload();
    } catch (toggleError) {
      setFormError(
        toggleError instanceof Error ? toggleError.message : 'Erro ao atualizar status.',
      );
    }
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Cargos / Funções + CBO"
        description="Cadastro de cargos e códigos CBO para padronizar funções na organização (Excel 1.10)."
      />

      <section className={page.section}>
        <Card>
          <h2 className={page.sectionTitle}>{editingId ? 'Editar cargo' : 'Novo cargo'}</h2>
          <div className={page.form}>
            <label className={page.field}>
              <span className={page.label}>Nome do cargo/função *</span>
              <input
                className={page.input}
                value={form.nome}
                onChange={(event) => setForm((prev) => ({ ...prev, nome: event.target.value }))}
                placeholder="Ex.: Técnico de Acesso por Corda"
              />
            </label>
            <label className={page.field}>
              <span className={page.label}>Código CBO</span>
              <input
                className={page.input}
                value={form.codigoCbo}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, codigoCbo: event.target.value }))
                }
                placeholder="Ex.: 7233-05"
              />
            </label>
            <label className={page.field}>
              <span className={page.label}>Departamento</span>
              <input
                className={page.input}
                value={form.departamento}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, departamento: event.target.value }))
                }
                placeholder="Ex.: Operações"
              />
            </label>
            <label className={page.field}>
              <span className={page.label}>Descrição</span>
              <textarea
                className={page.textarea}
                rows={3}
                value={form.descricao}
                onChange={(event) =>
                  setForm((prev) => ({ ...prev, descricao: event.target.value }))
                }
              />
            </label>
            {formError ? <p className={page.fieldError}>{formError}</p> : null}
            <div className={page.actions}>
              <Button isLoading={isSaving} onClick={() => void handleSubmit()}>
                {editingId ? 'Salvar alterações' : 'Cadastrar cargo'}
              </Button>
              {editingId ? (
                <Button variant="ghost" onClick={resetForm}>
                  Cancelar
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </section>

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(cargos) => cargos.length === 0}
        emptyTitle="Nenhum cargo cadastrado"
        emptyDescription="Cadastre o primeiro cargo/função com código CBO."
      >
        {(cargos) =>
          cargos.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title="Nenhum cargo cadastrado"
              description="Cadastre o primeiro cargo/função com código CBO."
            />
          ) : (
            <div className={page.list}>
              {cargos.map((cargo) => (
                <Card key={cargo.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <div>
                      <h3 className={page.listItemTitle}>{cargo.nome}</h3>
                      <p className={page.listItemMeta}>
                        CBO {cargo.codigoCbo ?? '—'}
                        {cargo.departamento ? ` · ${cargo.departamento}` : ''}
                      </p>
                    </div>
                    <Badge
                      label={cargo.ativo ? 'Ativo' : 'Inativo'}
                      tone={cargo.ativo ? 'success' : 'neutral'}
                      size="sm"
                    />
                  </div>
                  {cargo.descricao ? <p className={page.listItemBody}>{cargo.descricao}</p> : null}
                  <div className={page.actions}>
                    <Button size="sm" variant="secondary" onClick={() => startEdit(cargo)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => void handleToggleAtivo(cargo)}
                    >
                      {cargo.ativo ? 'Desativar' : 'Reativar'}
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )
        }
      </PageContent>
    </div>
  );
}
