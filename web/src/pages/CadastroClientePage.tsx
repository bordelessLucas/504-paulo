import { Building2 } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchClientesComUnidades } from '@/features/clientes/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function CadastroClientePage() {
  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchClientesComUnidades(),
    [],
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Cadastro de clientes"
        description="Clientes e unidades operacionais cadastrados na plataforma."
      />

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
                  <h3 className={page.listItemTitle}>
                    {cliente.nomeFantasia ?? cliente.razaoSocial}
                  </h3>
                  <Badge label={`${cliente.unidades.length} unidade(s)`} tone="info" size="sm" />
                </div>
                {cliente.unidades.length > 0 ? (
                  <ul className={page.staticList}>
                    {cliente.unidades.map((unidade) => (
                      <li key={unidade.id}>{unidade.nome}</li>
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
