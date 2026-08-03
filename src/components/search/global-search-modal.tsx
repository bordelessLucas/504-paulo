import Ionicons from '@expo/vector-icons/Ionicons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, Keyboard, Modal, Pressable, StyleSheet, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { layout } from '@/constants/theme';
import { searchPeople, type GlobalPersonResult } from '@/features/search/global-search-api';
import { useAuthRole } from '@/hooks/use-auth-role';
import { useTheme } from '@/hooks/use-theme';
import { useAppNavigation } from '@/navigation/app-navigation-context';
import { canAccessTab, getTabsForRole, type TabMenuItem } from '@/navigation/role-menus';

type SearchResult =
  | { key: string; kind: 'page'; page: TabMenuItem }
  | { key: string; kind: 'person'; person: GlobalPersonResult };

function normalize(value: string): string {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('pt-BR');
}

export function GlobalSearchModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const { role } = useAuthRole();
  const { navigateToTab } = useAppNavigation();
  const inputRef = useRef<TextInput>(null);
  const requestIdRef = useRef(0);
  const [query, setQuery] = useState('');
  const [people, setPeople] = useState<GlobalPersonResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canSearchPeople = role ? canAccessTab(role, 'RelatorioIndividual') : false;

  const pages = useMemo(() => {
    if (!role) return [];
    const term = normalize(query.trim());
    const available = getTabsForRole(role);
    return term ? available.filter((page) => normalize(page.label).includes(term)) : available.slice(0, 6);
  }, [query, role]);

  const results = useMemo<SearchResult[]>(() => [
    ...pages.map((page) => ({ key: `page-${page.name}`, kind: 'page' as const, page })),
    ...people.map((person) => ({ key: `person-${person.id}`, kind: 'person' as const, person })),
  ], [pages, people]);

  useEffect(() => {
    if (!visible) {
      setQuery('');
      setPeople([]);
      setError(null);
      return;
    }
    const timer = setTimeout(() => inputRef.current?.focus(), 180);
    return () => clearTimeout(timer);
  }, [visible]);

  useEffect(() => {
    const term = query.trim();
    const requestId = ++requestIdRef.current;
    if (!visible || !canSearchPeople || term.length < 2) {
      setPeople([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    const timer = setTimeout(() => {
      void searchPeople(term)
        .then((data) => { if (requestId === requestIdRef.current) setPeople(data); })
        .catch((reason: unknown) => {
          if (requestId === requestIdRef.current) {
            setPeople([]);
            setError(reason instanceof Error ? reason.message : 'Falha ao pesquisar.');
          }
        })
        .finally(() => { if (requestId === requestIdRef.current) setIsLoading(false); });
    }, 350);
    return () => clearTimeout(timer);
  }, [canSearchPeople, query, visible]);

  const close = () => {
    Keyboard.dismiss();
    onClose();
  };

  const selectResult = (result: SearchResult) => {
    close();
    if (result.kind === 'page') {
      navigateToTab(result.page.name);
    } else {
      navigateToTab('RelatorioIndividual', { colaboradorId: result.person.id, nome: result.person.nome });
    }
  };

  return (
    <Modal animationType="fade" onRequestClose={close} transparent visible={visible}>
      <View style={[styles.overlay, { backgroundColor: theme.overlay, paddingTop: insets.top + layout.space.lg }]}>
        <Pressable accessibilityLabel="Fechar pesquisa" onPress={close} style={StyleSheet.absoluteFill} />
        <View style={[styles.sheet, theme.shadow.fab, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
          <View style={[styles.searchBox, { backgroundColor: theme.inputBackground, borderColor: theme.accent }]}>
            <Ionicons color={theme.accent} name="search" size={22} />
            <TextInput
              ref={inputRef}
              accessibilityLabel="Pesquisar páginas ou colaboradores"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={setQuery}
              placeholder="Nome, cargo, setor ou página..."
              placeholderTextColor={theme.placeholder}
              returnKeyType="search"
              style={[styles.input, { color: theme.text }]}
              value={query}
            />
            {isLoading ? <ActivityIndicator color={theme.accent} size="small" /> : null}
            {query ? <Pressable accessibilityLabel="Limpar pesquisa" hitSlop={10} onPress={() => setQuery('')}><Ionicons color={theme.textMuted} name="close-circle" size={21} /></Pressable> : null}
          </View>

          <ThemedText style={styles.hint} themeColor="textSecondary" type="small">
            {query.length < 2 ? 'Digite ao menos 2 letras para buscar pessoas' : `${results.length} resultado(s)`}
          </ThemedText>
          {error ? <ThemedText style={styles.hint} themeColor="danger" type="small">{error}</ThemedText> : null}

          <FlatList
            contentContainerStyle={styles.list}
            data={results}
            keyboardShouldPersistTaps="handled"
            keyExtractor={(item) => item.key}
            ListEmptyComponent={query.length >= 2 && !isLoading ? <View style={styles.empty}><Ionicons color={theme.textMuted} name="search-outline" size={32} /><ThemedText themeColor="textSecondary" type="small">Nenhum resultado encontrado.</ThemedText></View> : null}
            renderItem={({ item }) => {
              const isPage = item.kind === 'page';
              const title = isPage ? item.page.label : item.person.nome;
              const subtitle = isPage ? 'Página do sistema' : [item.person.funcao, item.person.departamento, item.person.codigoInterno].filter(Boolean).join(' · ') || 'Colaborador';
              const icon = isPage ? item.page.icon : 'person-outline';
              return (
                <Pressable accessibilityRole="button" onPress={() => selectResult(item)} style={({ pressed }) => [styles.result, { borderBottomColor: theme.border, backgroundColor: pressed ? theme.backgroundSelected : 'transparent' }]}>
                  <View style={[styles.resultIcon, { backgroundColor: theme.accentMuted }]}><Ionicons color={theme.accent} name={icon} size={21} /></View>
                  <View style={styles.resultCopy}><ThemedText numberOfLines={1} type="smallBold">{title}</ThemedText><ThemedText numberOfLines={1} themeColor="textSecondary" type="small">{subtitle}</ThemedText></View>
                  <Ionicons color={theme.textMuted} name="chevron-forward" size={21} />
                </Pressable>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, paddingHorizontal: layout.space.lg },
  sheet: { width: '100%', maxWidth: 680, maxHeight: '78%', alignSelf: 'center', borderRadius: layout.radius.xl, borderWidth: 1, overflow: 'hidden' },
  searchBox: { minHeight: layout.touchMin, margin: layout.space.md, paddingHorizontal: layout.space.md, borderRadius: layout.radius.md, borderWidth: 1.5, flexDirection: 'row', alignItems: 'center', gap: layout.space.sm },
  input: { flex: 1, minHeight: layout.touchMin, fontFamily: 'Biko_Regular', fontSize: 16, paddingVertical: 0 },
  hint: { paddingHorizontal: layout.space.lg, paddingBottom: layout.space.sm },
  list: { paddingHorizontal: layout.space.sm, paddingBottom: layout.space.md },
  result: { minHeight: 64, borderBottomWidth: StyleSheet.hairlineWidth, borderRadius: layout.radius.sm, paddingHorizontal: layout.space.sm, flexDirection: 'row', alignItems: 'center', gap: layout.space.md },
  resultIcon: { width: 38, height: 38, borderRadius: 19, alignItems: 'center', justifyContent: 'center' },
  resultCopy: { flex: 1, gap: 2 },
  empty: { alignItems: 'center', gap: layout.space.sm, paddingVertical: layout.space.xxl },
});
