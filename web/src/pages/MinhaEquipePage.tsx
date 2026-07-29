import { Link } from 'react-router-dom';
import { UsersRound } from 'lucide-react';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { EmptyState } from '../components/ui/EmptyState';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchEquipeStatusCiclo } from '@/features/avaliacao/api';
import { useAuth } from '@/features/auth/auth-context';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';

export function MinhaEquipePage() {
  const { user } = useAuth();
  const { role } = useAuthRole();

  const { data, isLoading, error, reload } = useAsyncData(
    () => fetchEquipeStatusCiclo(user!.id, role),
    [user?.id, role],
    { enabled: Boolean(user?.id && role) },
  );

  return (
    <div className={page.page}>
      <PageHeader
        title="Minha equipe"
        description="Status de preenchimento da quinzena atual por colaborador."
        accessory={
          <Link to="/app/pdi-equipe">
            <Button size="sm" variant="secondary">
              PDI da equipe
            </Button>
          </Link>
        }
      />

      <PageContent isLoading={isLoading} error={error} data={data} onRetry={reload}>
        {(equipe) =>
          equipe.colaboradores.length === 0 ? (
            <EmptyState
              icon={UsersRound}
              title="Equipe vazia"
              description="Nenhum colaborador vinculado ao seu escopo."
            />
          ) : (
            <div className={page.list}>
              {equipe.colaboradores.map((colaborador) => (
                <Card key={colaborador.id} padding="compact">
                  <div className={page.listItemHeader}>
                    <div>
                      <h3 className={page.listItemTitle}>{colaborador.nome}</h3>
                      <p className={page.listItemMeta}>
                        {colaborador.departamento ?? '—'} · {colaborador.funcao ?? '—'}
                      </p>
                    </div>
                    <Badge
                      label={colaborador.avaliadoNaQuinzena ? 'Avaliado' : 'Pendente'}
                      tone={colaborador.avaliadoNaQuinzena ? 'success' : 'warning'}
                      size="sm"
                    />
                  </div>
                  {colaborador.ultimaAvaliacaoData ? (
                    <p className={page.listItemMeta}>
                      Última:{' '}
                      {new Date(colaborador.ultimaAvaliacaoData).toLocaleDateString('pt-BR')}
                    </p>
                  ) : null}
                  <div className={page.actions}>
                    <Link
                      to={`/app/avaliacao/${colaborador.id}?nome=${encodeURIComponent(colaborador.nome)}`}
                    >
                      <Button size="sm" variant="secondary">
                        Abrir formulário
                      </Button>
                    </Link>
                    <Link to={`/app/avaliacao/${colaborador.id}/historico`}>
                      <Button size="sm" variant="ghost">
                        Histórico
                      </Button>
                    </Link>
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
