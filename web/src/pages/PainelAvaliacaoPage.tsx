import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Users } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchColaboradoresPage } from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function PainelAvaliacaoPage() {
  const { user } = useAuth();
  const { role } = useAuthRole();
  const [pageIndex, setPageIndex] = useState(0);

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresPage(user!.id, pageIndex, role),
    [user?.id, pageIndex, role],
    { enabled: Boolean(user?.id && role) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Painel de avaliação"
        description="Colaboradores elegíveis para avaliação no ciclo atual."
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(result) =>
          result.items.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum colaborador encontrado"
              description="Ajuste filtros ou aguarde novos cadastros."
            />
          ) : (
            <>
              <div className={page.list}>
                {result.items.map((colaborador) => (
                  <Card key={colaborador.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <div>
                        <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                        <p className={page.listItemMeta}>
                          {colaborador.departamento ?? '—'} · {colaborador.funcao ?? '—'}
                        </p>
                      </div>
                      <Link to={`/avaliacao/formulario?colaboradorId=${colaborador.id}`}>
                        <Button size="sm">Avaliar</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
              <div className={page.actions}>
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={pageIndex === 0}
                  onClick={() => setPageIndex((value) => Math.max(0, value - 1))}
                >
                  Anterior
                </Button>
                <Badge
                  label={`Página ${result.page + 1} · ${result.total} total`}
                  tone="neutral"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  disabled={(result.page + 1) * result.pageSize >= result.total}
                  onClick={() => setPageIndex((value) => value + 1)}
                >
                  Próxima
                </Button>
              </div>
            </>
          )
        }
      </PageContent>
    </div>
  );
}