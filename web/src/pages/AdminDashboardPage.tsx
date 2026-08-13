import { useMemo, useState } from 'react';
import { CloudUpload, KeyRound, TriangleAlert, UserPlus } from 'lucide-react';

import { FormularioAcessoForm } from '../components/rh/FormularioAcessoForm';
import { FormularioColaboradorForm } from '../components/rh/FormularioColaboradorForm';
import { RegistroIncidenteForm } from '../components/rh/RegistroIncidenteForm';
import { UploadPlanilhaForm } from '../components/rh/UploadPlanilhaForm';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { PageHeader } from '../components/ui/PageHeader';
import { canCallerCreatePlatformAccess } from '@/features/rh/access-roles';
import { useAuthRole } from '@/hooks/use-auth-role';
import { isAdminDashboardRole, type UserRole } from '@/types/supabase';
import page from '../styles/page.module.css';
import admin from '../styles/admin.module.css';

type AdminFeatureId = 'acesso' | 'colaborador' | 'incidente' | 'planilha';

type AdminFeatureDefinition = {
  id: AdminFeatureId;
  title: string;
  description: string;
  modalDescription: string;
  icon: typeof KeyRound;
  isVisible: (role: UserRole | null) => boolean;
};

const ADMIN_FEATURES: AdminFeatureDefinition[] = [
  {
    id: 'acesso',
    title: 'Gerar acesso à plataforma',
    description: 'Crie logins com papel definido.',
    modalDescription:
      'Informe e-mail, nome e o papel do usuário. A senha temporária é opcional — se vazia, será gerada automaticamente.',
    icon: KeyRound,
    isVisible: (role) => canCallerCreatePlatformAccess(role),
  },
  {
    id: 'colaborador',
    title: 'Cadastrar colaborador',
    description: 'Ficha completa com dados contratuais.',
    modalDescription:
      'Cadastre colaboradores com ficha completa. Contas novas recebem acesso automaticamente.',
    icon: UserPlus,
    isVisible: (role) => isAdminDashboardRole(role),
  },
  {
    id: 'incidente',
    title: 'Registrar incidente',
    description: 'Acidentes, faltas ou advertências.',
    modalDescription:
      'Incidentes nos últimos 6 meses bloqueiam autoavaliação e solicitações de reajuste do colaborador.',
    icon: TriangleAlert,
    isVisible: (role) => isAdminDashboardRole(role),
  },
  {
    id: 'planilha',
    title: 'Importar planilha RH',
    description: 'Importe colaboradores via CSV.',
    modalDescription:
      'CSV com email, nome, classificacao, nivel_irata, datas, telefone, certificacoes, status e role. Contas novas recebem senha temporária de primeiro acesso.',
    icon: CloudUpload,
    isVisible: (role) => isAdminDashboardRole(role),
  },
];

export function AdminDashboardPage() {
  const { role, isLoading: isRoleLoading } = useAuthRole();
  const [activeFeatureId, setActiveFeatureId] = useState<AdminFeatureId | null>(null);

  const visibleFeatures = useMemo(
    () => ADMIN_FEATURES.filter((feature) => feature.isVisible(role)),
    [role],
  );

  const activeFeature = useMemo(
    () => visibleFeatures.find((feature) => feature.id === activeFeatureId) ?? null,
    [activeFeatureId, visibleFeatures],
  );

  if (isRoleLoading) {
    return (
      <div className={page.page}>
        <p className={admin.hint}>Carregando painel administrativo...</p>
      </div>
    );
  }

  if (!isAdminDashboardRole(role)) {
    return (
      <div className={page.page}>
        <PageHeader title="Cadastros / Admin" />
        <p className={admin.hint}>Você não tem permissão para acessar o painel administrativo.</p>
      </div>
    );
  }

  return (
    <div className={page.page}>
      <PageHeader
        title="Cadastros / Admin"
        description="Gere acessos, cadastre colaboradores, registre incidentes e importe planilhas."
        accessory={<Badge label="Operacional" tone="accent" size="sm" />}
      />

      <div className={admin.featureGrid}>
        {visibleFeatures.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeatureId === feature.id;
          return (
            <button
              key={feature.id}
              type="button"
              className={`${admin.featureCard} ${isActive ? admin.featureCardActive : ''}`.trim()}
              onClick={() => setActiveFeatureId(feature.id)}
            >
              <span className={admin.featureIcon}>
                <Icon size={18} />
              </span>
              <h2 className={admin.featureTitle}>{feature.title}</h2>
              <p className={admin.featureDescription}>{feature.description}</p>
            </button>
          );
        })}
      </div>

      {activeFeature ? (
        <section className={admin.panel}>
          <div className={admin.panelHeader}>
            <div>
              <h2 className={admin.panelTitle}>{activeFeature.title}</h2>
              <p className={admin.panelSubtitle}>{activeFeature.modalDescription}</p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setActiveFeatureId(null)}>
              Fechar
            </Button>
          </div>
          {renderFeatureContent(activeFeature.id)}
        </section>
      ) : (
        <p className={admin.hint}>Selecione uma ação acima para começar.</p>
      )}
    </div>
  );
}

function renderFeatureContent(featureId: AdminFeatureId) {
  switch (featureId) {
    case 'acesso':
      return <FormularioAcessoForm />;
    case 'colaborador':
      return <FormularioColaboradorForm />;
    case 'incidente':
      return <RegistroIncidenteForm />;
    case 'planilha':
      return <UploadPlanilhaForm />;
    default:
      return null;
  }
}
