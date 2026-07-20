import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { ScreenHeader } from '@/components/navigation/screen-header';
import { TabScreenContainer } from '@/components/navigation/tab-screen-container';
import { GlassCard } from '@/components/premium/GlassCard';
import { StatusBadge } from '@/components/premium/StatusBadge';
import { ThemedText } from '@/components/themed-text';
import { SkeletonLoader } from '@/components/ui/skeleton-loader';
import { layout } from '@/constants/theme';
import { fetchAvaliadores } from '@/features/clientes/api';
import { ROLE_LABELS } from '@/navigation/role-menus';
import type { UserRole } from '@/types/supabase';

export function CadastroAvaliadoresScreen() {
  const [rows, setRows] = useState<
    Array<{
      id: string;
      nome: string;
      funcao: string | null;
      departamento: string | null;
      role: string;
      telefone: string | null;
      ddd: string | null;
      liderNome: string | null;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void (async () => {
      try {
        setRows(await fetchAvaliadores());
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erro ao carregar avaliadores.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  return (
    <TabScreenContainer scrollable contentContainerStyle={styles.content}>
      <ScreenHeader
        title="Cadastro de Avaliadores"
        description="Gestores e supervisores com departamento e gestor direto."
      />

      {isLoading ? <SkeletonLoader /> : null}
      {error ? (
        <ThemedText themeColor="danger" type="small">
          {error}
        </ThemedText>
      ) : null}

      {rows.map((row) => (
        <GlassCard key={row.id} padding="compact">
          <View style={styles.headerRow}>
            <ThemedText type="smallBold" style={styles.flex}>
              {row.nome}
            </ThemedText>
            <StatusBadge
              label={ROLE_LABELS[row.role as UserRole] ?? row.role}
              tone="accent"
              size="sm"
            />
          </View>
          <ThemedText themeColor="textSecondary" type="small">
            {row.funcao ?? '—'} · {row.departamento ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Gestor direto: {row.liderNome ?? '—'}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small">
            Tel: {row.ddd ? `(${row.ddd}) ` : ''}
            {row.telefone ?? '—'}
          </ThemedText>
        </GlassCard>
      ))}
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    gap: layout.space.md,
    paddingBottom: layout.space.xxl,
  },
  headerRow: { flexDirection: 'row', alignItems: 'center', gap: layout.space.sm },
  flex: { flex: 1 },
});
