import { ThemedText } from '@/components/themed-text';
import { ScreenShell } from '@/components/navigation/screen-shell';

export function AprovacoesScreen() {
  return (
    <ScreenShell
      title="Aprovações"
      description="Analise solicitações de melhoria salarial e aprove ou recuse pedidos.">
      <ThemedText themeColor="textSecondary" style={{ fontSize: 15, lineHeight: 22 }}>
        Fila de solicitações com status pendente_rh, pendente_ceo, aprovado e recusado.
      </ThemedText>
    </ScreenShell>
  );
}
