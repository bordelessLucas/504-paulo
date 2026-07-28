import { Link } from 'react-router-dom';

import { PageContent } from '../components/PageContent';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Card } from '../components/ui/Card';
import { PageHeader } from '../components/ui/PageHeader';
import { fetchAvaliadores } from '@/features/clientes/api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { ROLE_LABELS } from '@/navigation/role-menus';
import { isAdminDashboardRole, type UserRole } from '@/types/supabase';
import { useAsyncData } from '../hooks/useAsyncData';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

function roleLabel(role: string): string {
  if (role in ROLE_LABELS) {
    return ROLE_LABELS[role as UserRole];
  }
  return role;
}

export function CadastroAvaliadoresPage() {
  const { role } = useAuthRole();
  const canCreate = isAdminDashboardRole(role);
  const { data, isLoading, error, reload } = useAsyncData(() => fetchAvaliadores(), []);

  return (
    <div className={page.page}>
      <PageHeader
        title="Cadastro de avaliadores"
        description="Gestores e supervisores habilitados para avaliar colaboradores."
        accessory={
          canCreate ? (
            <Link to="/app/admin">
              <Button size="sm">Gerar acesso</Button>
            </Link>
          ) : undefined
        }
      />

      {canCreate ? (
        <p className={admin.hint} style={{ marginBottom: '1rem' }}>
          Para criar um novo avaliador, use <strong>Gerar acesso à plataforma</strong> no Admin e
          atribua o papel adequado (supervisor, gestor, gerente, RH).
        </p>
      ) : null}

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
                  <Badge label={roleLabel(avaliador.role)} tone="accent" size="sm" />
                </div>
                <p className={page.listItemMeta}>
                  {[avaliador.funcao, avaliador.departamento].filter(Boolean).join(' · ') || '—'}
                </p>
                <p className={page.listItemMeta}>
                  {avaliador.liderNome ? `Líder: ${avaliador.liderNome}` : 'Sem líder direto'}
                  {avaliador.telefone
                    ? ` · ${avaliador.ddd ? `(${avaliador.ddd}) ` : ''}${avaliador.telefone}`
                    : ''}
                </p>
              </Card>
            ))}
          </div>
        )}
      </PageContent>
    </div>
  );
}
