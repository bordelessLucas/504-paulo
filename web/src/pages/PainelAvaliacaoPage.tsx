import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Users } from 'lucide-react';

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
import admin from '../styles/admin.module.css';

export function PainelAvaliacaoPage() {
  const { user } = useAuth();
  const { role } = useAuthRole();
  const [pageIndex, setPageIndex] = useState(0);
  const [search, setSearch] = useState('');

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchColaboradoresPage(user!.id, pageIndex, role),
    [user?.id, pageIndex, role],
    { enabled: Boolean(user?.id && role) },
  );

  const filteredItems = useMemo(() => {
    const items = data?.items ?? [];
    const query = search.trim().toLowerCase();
    if (!query) return items;
    return items.filter((colaborador) =>
      [colaborador.nome, colaborador.departamento, colaborador.funcao]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(query)),
    );
  }, [data?.items, search]);

  return (
    <div className={page.page}>
      <PageHeader
        title="Painel de avaliação"
        description="Avalie em lote ou individualmente. Filtre a equipe do ciclo atual."
        accessory={
          <Link to="/app/avaliacao-lote">
            <Button size="sm" leftIcon={<ClipboardList size={16} />}>
              Formulário em lote
            </Button>
          </Link>
        }
      />

      <div className={admin.searchField}>
        <input
          className={page.input}
          placeholder="Buscar colaborador por nome, departamento ou função"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
        />
      </div>

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(result) =>
          filteredItems.length === 0 ? (
            <EmptyState
              icon={Users}
              title="Nenhum colaborador encontrado"
              description="Ajuste a busca ou aguarde novos cadastros."
            />
          ) : (
            <>
              <div className={page.list}>
                {filteredItems.map((colaborador) => (
                  <Card key={colaborador.id} padding="compact">
                    <div className={page.listItemHeader}>
                      <div>
                        <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                        <p className={page.listItemMeta}>
                          {colaborador.departamento ?? '—'} · {colaborador.funcao ?? '—'}
                        </p>
                      </div>
                      <div className={page.actions}>
                        <Link
                          to={`/app/avaliacao/${colaborador.id}?nome=${encodeURIComponent(colaborador.nome)}`}
                        >
                          <Button size="sm">Avaliar</Button>
                        </Link>
                        <Link to={`/app/avaliacao/${colaborador.id}/historico`}>
                          <Button size="sm" variant="secondary">
                            Histórico
                          </Button>
                        </Link>
                      </div>
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
