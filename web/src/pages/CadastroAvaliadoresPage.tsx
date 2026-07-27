import { UserCog } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchAvaliadores } from '@/features/clientes/api';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function CadastroAvaliadoresPage() {
  const { data, isLoading, error, reload } = useAsyncData(() => fetchAvaliadores(), []);

  return (
    <div className={page.page}>
      <PageHeader
        title="Cadastro de avaliadores"
        description="Gestores e supervisores habilitados para avaliar colaboradores."
      />

      <PageContent
        isLoading={isLoading}
        error={error}
        data={data}
        onRetry={reload}
        isEmpty={(items) => items.length === 0}
        emptyTitle="Nenhum avaliador cadastrado"
      >
        {(avaliadores) => (
          <div className={page.list}>
            {avaliadores.map((avaliador) => (
              <Card key={avaliador.id} padding="compact">
                <div className={page.listItemHeader}>
                  <h3 className={page.listItemTitle}>{avaliador.nome}</h3>
                  <Badge label={avaliador.role} tone="accent" size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {avaliador.departamento ?? '—'}
                  {avaliador.telefone ? ` · ${avaliador.ddd ?? ''}${avaliador.telefone}` : ''}
                </p>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
