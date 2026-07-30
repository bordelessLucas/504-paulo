import { useState } from 'react';

import { FormularioClienteForm } from '../components/rh/FormularioClienteForm';
import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchClientesComUnidades } from '@/features/clientes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

export function CadastroClientePage() {
  const { role } = useAuthRole();
  const [showForm, setShowForm] = useState(false);
  const canWrite = isAdminDashboardRole(role);

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchClientesComUnidades(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Cadastro de clientes"
        description="Clientes e unidades operacionais cadastrados na plataforma."
        accessory={
          canWrite ? (
            <Button size="sm" onClick={() => setShowForm((value) => !value)}>
              {showForm ? 'Ocultar formulário' : 'Novo cliente'}
            </Button>
          ) : undefined
        }
      />

      {showForm && canWrite ? (
        <section className={admin.panel} style={{ marginBottom: '1.25rem' }}>
          <div className={admin.panelHeader}>
            <div>
              <h2 className={admin.panelTitle}>Novo cliente</h2>
              <p className={admin.panelSubtitle}>
                Razão social obrigatória. Unidade e contatos de base/bordo são opcionais.
              </p>
            </div>
          </div>
          <FormularioClienteForm
            onCreated={() => {
              reload();
              setShowForm(false);
            }}
          />
        </section>
      ) : null}

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum cliente cadastrado"
      >
        {(clientes) => (
          <div className={page.list}>
            {clientes.map((cliente) => (
              <Card key={cliente.id} padding="compact">
                <div className={page.listItemHeader}>
                  <div>
                    <h3 className={page.listItemTitle}>
                      {cliente.nomeFantasia ?? cliente.razaoSocial}
                    </h3>
                    <p className={page.listItemMeta}>
                      {[cliente.razaoSocial, cliente.codigo, cliente.cnpj]
                        .filter(Boolean)
                        .join(' · ')}
                    </p>
                  </div>
                  <Badge label={`${cliente.unidades.length} unidade(s)`} tone="info" size="sm" />
                </div>
                {cliente.cidade || cliente.uf ? (
                  <p className={page.listItemMeta}>
                    {[cliente.cidade, cliente.uf].filter(Boolean).join(' / ')}
                  </p>
                ) : null}
                {cliente.unidades.length > 0 ? (
                  <ul className={page.staticList}>
                    {cliente.unidades.map((unidade) => (
                      <li key={unidade.id}>
                        {unidade.nome}
                        {unidade.aeroportoEmbarque
                          ? ` · embarque: ${unidade.aeroportoEmbarque}`
                          : ''}
                        {unidade.contatoBaseNome
                          ? ` · base: ${unidade.contatoBaseNome}`
                          : ''}
                        {unidade.contatoBordoNome
                          ? ` · bordo: ${unidade.contatoBordoNome}`
                          : ''}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className={page.listItemMeta}>Sem unidades vinculadas.</p>
                )}
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
