import { useCallback, useMemo, useState } from 'react';
import { StyleSheet, useWindowDimensions, View } from 'react-native';

import { AdminFeatureCard } from '@/components/admin/admin-feature-card';
import { AdminFeatureModal } from '@/components/admin/admin-feature-modal';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { FormularioAcessoPlataforma } from '@/components/rh/formulario-acesso-plataforma';
import { FormularioColaborador } from '@/components/rh/formulario-colaborador';
import { RegistroIncidente } from '@/components/rh/registro-incidente';
import { UploadPlanilhaRH } from '@/components/rh/upload-planilha-rh';
import { ThemedText } from '@/components/themed-text';
import { SPLIT_LAYOUT_MIN_WIDTH } from '@/constants/layout';
import { Spacing } from '@/constants/theme';
import { canCallerCreatePlatformAccess } from '@/features/rh/access-roles';
import { useUserRole } from '@/hooks/use-user-role';
import type { TabIconName } from '@/navigation/types';
import { isAdminDashboardRole, type UserRole } from '@/types/supabase';

type AdminFeatureId = 'acesso' | 'colaborador' | 'incidente' | 'planilha';

type AdminFeatureDefinition = {
  id: AdminFeatureId;
  title: string;
  description: string;
  icon: TabIconName;
  modalDescription: string;
  isVisible: (role: UserRole | null) => boolean;
};

const ADMIN_FEATURES: AdminFeatureDefinition[] = [
  {
    id: 'acesso',
    title: 'Gerar acesso à plataforma',
    description: 'Crie logins com papel definido: RH, supervisor, admin, colaborador e outros.',
    icon: 'key-outline',
    modalDescription:
      'Informe e-mail, nome e o papel do usuário. A senha temporária é opcional — se vazia, será gerada automaticamente.',
    isVisible: (role) => canCallerCreatePlatformAccess(role),
  },
  {
    id: 'colaborador',
    title: 'Cadastrar colaborador',
    description: 'Ficha completa offshore com dados pessoais, contratuais e certificações.',
    icon: 'person-add-outline',
    modalDescription:
      'Cadastre colaboradores com ficha completa. Contas novas recebem acesso automaticamente.',
    isVisible: (role) => isAdminDashboardRole(role),
  },
  {
    id: 'incidente',
    title: 'Registrar incidente',
    description: 'Acidentes SMS, faltas ou advertências que bloqueiam autoavaliação e reajuste.',
    icon: 'warning-outline',
    modalDescription:
      'Incidentes nos últimos 6 meses bloqueiam autoavaliação e solicitações de reajuste do colaborador.',
    isVisible: (role) => isAdminDashboardRole(role),
  },
  {
    id: 'planilha',
    title: 'Importar planilha RH',
    description: 'Importe colaboradores em lote via arquivo CSV com ficha completa.',
    icon: 'cloud-upload-outline',
    modalDescription:
      'CSV com email, nome, classificacao, nivel_irata, datas, telefone, certificacoes, status e role. Contas novas recebem senha padrão 12345678.',
    isVisible: (role) => isAdminDashboardRole(role),
  },
];

function renderFeatureContent(featureId: AdminFeatureId) {
  switch (featureId) {
    case 'acesso':
      return <FormularioAcessoPlataforma />;
    case 'colaborador':
      return <FormularioColaborador embedded />;
    case 'incidente':
      return <RegistroIncidente embedded />;
    case 'planilha':
      return <UploadPlanilhaRH embedded />;
    default:
      return null;
  }
}

export function PainelAdminScreen() {
  const { width } = useWindowDimensions();
  const { role, isLoading: isRoleLoading } = useUserRole();
  const [activeFeatureId, setActiveFeatureId] = useState<AdminFeatureId | null>(null);

  const visibleFeatures = useMemo(
    () => ADMIN_FEATURES.filter((feature) => feature.isVisible(role)),
    [role],
  );

  const activeFeature = useMemo(
    () => visibleFeatures.find((feature) => feature.id === activeFeatureId) ?? null,
    [activeFeatureId, visibleFeatures],
  );

  const handleCloseModal = useCallback(() => {
    setActiveFeatureId(null);
  }, []);

  const isWideLayout = width >= SPLIT_LAYOUT_MIN_WIDTH;

  if (isRoleLoading) {
    return (
      <TabScreenContainer>
        <ThemedText themeColor="textSecondary">Carregando painel administrativo...</ThemedText>
      </TabScreenContainer>
    );
  }

  if (!isAdminDashboardRole(role)) {
    return (
      <TabScreenContainer>
        <ThemedText themeColor="textSecondary">
          Você não tem permissão para acessar o painel administrativo.
        </ThemedText>
      </TabScreenContainer>
    );
  }

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="heading">Painel administrativo</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Selecione uma funcionalidade para gerenciar acessos, colaboradores e incidentes da
          plataforma.
        </ThemedText>
      </View>

      <View style={[styles.grid, isWideLayout && styles.gridWide]}>
        {visibleFeatures.map((feature) => (
          <View
            key={feature.id}
            style={[styles.gridItem, isWideLayout && styles.gridItemWide]}>
            <AdminFeatureCard
              description={feature.description}
              icon={feature.icon}
              onPress={() => setActiveFeatureId(feature.id)}
              title={feature.title}
            />
          </View>
        ))}
      </View>

      {activeFeature ? (
        <AdminFeatureModal
          description={activeFeature.modalDescription}
          onClose={handleCloseModal}
          title={activeFeature.title}
          visible={Boolean(activeFeature)}>
          {renderFeatureContent(activeFeature.id)}
        </AdminFeatureModal>
      ) : null}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.two,
  },
  description: {
    fontSize: 15,
    lineHeight: 22,
  },
  grid: {
    gap: Spacing.three,
  },
  gridWide: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  gridItem: {
    width: '100%',
  },
  gridItemWide: {
    width: '48%',
    flexGrow: 1,
  },
});
