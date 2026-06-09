import { StyleSheet, View } from 'react-native';

import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { FormularioColaborador } from '@/components/rh/formulario-colaborador';
import { UploadPlanilhaRH } from '@/components/rh/upload-planilha-rh';
import { ThemedText } from '@/components/themed-text';
import { Spacing } from '@/constants/theme';

export function PainelAdminScreen() {
  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <ThemedText type="heading">Painel administrativo</ThemedText>
        <ThemedText themeColor="textSecondary" style={styles.description}>
          Cadastre colaboradores manualmente ou importe planilhas de RH. Os colaboradores ativos
          aparecem automaticamente no painel de avaliação dos gerentes.
        </ThemedText>
      </View>

      <FormularioColaborador />
      <UploadPlanilhaRH />
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
});
