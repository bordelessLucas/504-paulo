import Ionicons from '@expo/vector-icons/Ionicons';
import { type Href, router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { GlassCard } from '@/components/premium/GlassCard';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/toast';
import { brand, brandRgb } from '@/constants/brand';
import { Fonts, layout, MaxContentWidth } from '@/constants/theme';
import { useAuth } from '@/features/auth/auth-context';
import { SUBSCRIPTION_PLANS } from '@/features/subscription/plans';
import { useSubscription } from '@/features/subscription/subscription-context';
import type { PlanId } from '@/features/subscription/types';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTheme } from '@/hooks/use-theme';

const DESKTOP_PLANS_MAX_WIDTH = 1080;

const DEFAULT_PLAN_ID: PlanId =
  SUBSCRIPTION_PLANS.find((plan) => plan.isFeatured)?.id ?? SUBSCRIPTION_PLANS[0].id;

export default function PlanosScreen() {
  const theme = useTheme();
  const isDesktop = useIsDesktopLayout();
  const { showToast } = useToast();
  const { subscribe } = useSubscription();
  const { user, signOut, pendingRegistration, completeRegistration, clearPendingRegistration } =
    useAuth();

  const [selectedPlanId, setSelectedPlanId] = useState<PlanId>(DEFAULT_PLAN_ID);
  const [isProcessing, setIsProcessing] = useState(false);

  const selectedPlan =
    SUBSCRIPTION_PLANS.find((plan) => plan.id === selectedPlanId) ?? SUBSCRIPTION_PLANS[0];

  const greetingName = user?.name ?? pendingRegistration?.name ?? null;

  async function handleSubscribe() {
    setIsProcessing(true);

    try {
      // Pagamento fictício: simula o processamento de um gateway antes de ativar.
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let targetUserId = user?.id ?? null;

      // Fluxo de novo cadastro: a conta só é criada agora, após o pagamento.
      if (!targetUserId) {
        const result = await completeRegistration();

        if (result.status === 'error') {
          showToast(result.error.message, 'error');

          if (result.error.field && result.error.field !== 'general') {
            router.replace('/(auth)/register' as Href);
          }
          return;
        }

        if (result.status !== 'authenticated') {
          showToast('Confirme seu e-mail para concluir o cadastro.', 'info');
          router.replace('/(auth)/login' as Href);
          return;
        }

        targetUserId = result.userId;
      }

      await subscribe(selectedPlanId, targetUserId);

      showToast(`Plano ${selectedPlan.name} ativado com sucesso!`, 'success');
      router.replace('/(main)/' as Href);
    } catch {
      showToast('Não foi possível concluir a assinatura. Tente novamente.', 'error');
    } finally {
      setIsProcessing(false);
    }
  }

  function handleExit() {
    if (user) {
      void signOut();
      return;
    }

    clearPendingRegistration();
    router.replace('/(auth)/login' as Href);
  }

  return (
    <View style={[styles.container, { backgroundColor: brand.navyDeep }]}>
      <SafeAreaView style={styles.safeArea} edges={['top', 'bottom']}>
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            isDesktop && styles.scrollContentDesktop,
          ]}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.header, isDesktop && styles.headerDesktop]}>
            <View style={styles.brandRow}>
              <ThemedText style={[styles.brandVertek, { color: brand.white }]}>Vertek</ThemedText>
              <ThemedText style={[styles.brandAvalia, { color: brand.greenSoft }]}>
                Avalia
              </ThemedText>
            </View>
            <ThemedText type="heading" style={{ color: brand.white }}>
              Escolha seu plano
            </ThemedText>
            <ThemedText style={[styles.subtitle, { color: brandRgb(brand.cream, 0.75) }]}>
              {greetingName ? `Olá, ${greetingName.split(' ')[0]}! ` : ''}
              Para acessar o app é necessário assinar um dos planos abaixo.
            </ThemedText>
          </View>

          <View style={[styles.plansList, isDesktop && styles.plansListDesktop]}>
            {SUBSCRIPTION_PLANS.map((plan) => {
              const isSelected = plan.id === selectedPlanId;
              const borderColor = isSelected ? brand.greenBright : brandRgb(brand.cream, 0.14);

              return (
                <Pressable
                  key={plan.id}
                  accessibilityRole="radio"
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => setSelectedPlanId(plan.id)}
                  style={({ pressed }) => [
                    isDesktop && styles.planPressableDesktop,
                    pressed && styles.cardPressed,
                  ]}>
                  <GlassCard
                    style={[
                      styles.planCard,
                      { borderColor, borderWidth: isSelected ? 2 : 1 },
                    ]}>
                    <View style={styles.planHeaderRow}>
                      <View style={styles.planTitleGroup}>
                        <ThemedText type="sectionTitle">{plan.name}</ThemedText>
                        {plan.badge ? (
                          <View style={[styles.badge, { backgroundColor: theme.accentMuted }]}>
                            <ThemedText style={[styles.badgeText, { color: theme.accent }]}>
                              {plan.badge}
                            </ThemedText>
                          </View>
                        ) : null}
                      </View>

                      <View
                        style={[
                          styles.radioOuter,
                          { borderColor: isSelected ? theme.accent : theme.border },
                        ]}>
                        {isSelected ? (
                          <View style={[styles.radioInner, { backgroundColor: theme.accent }]} />
                        ) : null}
                      </View>
                    </View>

                    <ThemedText type="small" themeColor="textSecondary">
                      {plan.tagline}
                    </ThemedText>

                    <View style={styles.priceRow}>
                      <ThemedText style={styles.price}>{plan.priceLabel}</ThemedText>
                      <ThemedText type="small" themeColor="textMuted" style={styles.pricePeriod}>
                        {plan.periodLabel}
                      </ThemedText>
                    </View>

                    <View style={styles.featureList}>
                      {plan.features.map((feature) => (
                        <View key={feature} style={styles.featureRow}>
                          <Ionicons
                            name="checkmark-circle"
                            size={18}
                            color={theme.accent}
                            style={styles.featureIcon}
                          />
                          <ThemedText type="small" style={styles.featureText}>
                            {feature}
                          </ThemedText>
                        </View>
                      ))}
                    </View>
                  </GlassCard>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.footer}>
            <Button
              label={`Assinar ${selectedPlan.name} • ${selectedPlan.priceLabel}${selectedPlan.periodLabel}`}
              size="lg"
              isLoading={isProcessing}
              onPress={() => void handleSubscribe()}
            />

            <ThemedText type="small" style={[styles.disclaimer, { color: brandRgb(brand.cream, 0.6) }]}>
              Pagamento fictício para demonstração. Nenhuma cobrança real será feita.
            </ThemedText>

            <Pressable disabled={isProcessing} onPress={handleExit} style={styles.signOutButton}>
              <ThemedText type="link" style={{ color: brandRgb(brand.cream, 0.75) }}>
                {user ? 'Sair da conta' : 'Voltar ao login'}
              </ThemedText>
            </Pressable>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.space.lg,
    paddingTop: layout.space.xl,
    paddingBottom: layout.space.xxl,
    maxWidth: MaxContentWidth,
    width: '100%',
    alignSelf: 'center',
    gap: layout.space.xl,
  },
  scrollContentDesktop: {
    maxWidth: DESKTOP_PLANS_MAX_WIDTH,
    paddingHorizontal: layout.space.xl,
  },
  header: {
    gap: layout.space.sm,
  },
  headerDesktop: {
    alignItems: 'center',
    maxWidth: 640,
    alignSelf: 'center',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: layout.space.sm,
    marginBottom: layout.space.sm,
  },
  brandVertek: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
    letterSpacing: 1,
  },
  brandAvalia: {
    fontFamily: Fonts.sansMedium,
    fontSize: 22,
    lineHeight: 28,
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  plansList: {
    gap: layout.space.md,
  },
  plansListDesktop: {
    flexDirection: 'row',
    alignItems: 'stretch',
    gap: layout.space.lg,
  },
  planPressableDesktop: {
    flex: 1,
    minWidth: 0,
    alignSelf: 'stretch',
  },
  cardPressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
  planCard: {
    gap: layout.space.sm,
  },
  planHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: layout.space.sm,
  },
  planTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    flexShrink: 1,
  },
  badge: {
    paddingHorizontal: layout.space.sm,
    paddingVertical: 2,
    borderRadius: layout.radius.pill,
  },
  badgeText: {
    fontFamily: Fonts.sansMedium,
    fontSize: 11,
    lineHeight: 16,
  },
  radioOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: layout.space.xs,
    marginTop: layout.space.xs,
  },
  price: {
    fontFamily: Fonts.display,
    fontSize: 30,
    lineHeight: 36,
  },
  pricePeriod: {
    marginBottom: 2,
  },
  featureList: {
    gap: layout.space.xs,
    marginTop: layout.space.sm,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: layout.space.sm,
  },
  featureIcon: {
    marginTop: 1,
  },
  featureText: {
    flex: 1,
  },
  footer: {
    gap: layout.space.md,
    alignItems: 'center',
  },
  disclaimer: {
    textAlign: 'center',
  },
  signOutButton: {
    paddingVertical: layout.space.sm,
  },
});
