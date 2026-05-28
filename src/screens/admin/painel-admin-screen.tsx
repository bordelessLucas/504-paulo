import { ScreenShell } from '@/components/navigation/screen-shell';
import { UploadPlanilhaRH } from '@/components/rh/upload-planilha-rh';
import { ThemedText } from '@/components/themed-text';

export function PainelAdminScreen() {
  return (
    <ScreenShell
      title="Painel administrativo"
      description="Visão executiva das avaliações e indicadores da organização.">
      <ThemedText themeColor="textSecondary" style={{ fontSize: 15, lineHeight: 22 }}>
        CEO e administradores acompanham métricas globais, departamentos e ciclos em andamento.
      </ThemedText>
      <UploadPlanilhaRH />
    </ScreenShell>
  );
}
