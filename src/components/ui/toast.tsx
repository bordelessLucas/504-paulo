import Ionicons from '@expo/vector-icons/Ionicons';
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { Animated, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { getScreenTopChromeHeight } from '@/constants/screen-chrome';
import { brandRgb } from '@/constants/brand';
import { Fonts, layout, zIndex, type SemanticTone } from '@/constants/theme';
import { useIsDesktopLayout } from '@/hooks/use-is-desktop-layout';
import { useTabScreenLayout } from '@/hooks/use-tab-screen-layout';
import { useTheme } from '@/hooks/use-theme';
import { hapticLightImpact } from '@/lib/haptics';
import type { TabIconName } from '@/navigation/types';

export type ToastVariant = 'success' | 'error' | 'info';

type ToastKind = 'default' | 'notification';

type DefaultToastPayload = {
  kind: 'default';
  message: string;
  variant: ToastVariant;
};

export type NotificationToastPayload = {
  kind: 'notification';
  id: string;
  title: string;
  message: string;
  icon: TabIconName;
  variant: ToastVariant;
  onPress?: () => void;
};

type ToastPayload = DefaultToastPayload | NotificationToastPayload;

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
  showNotificationToast: (payload: Omit<NotificationToastPayload, 'kind'>) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const DEFAULT_TOAST_DURATION_MS = 3800;
const NOTIFICATION_TOAST_DURATION_MS = 5500;

function variantTone(variant: ToastVariant): SemanticTone {
  if (variant === 'success') return 'success';
  if (variant === 'error') return 'danger';
  return 'info';
}

function DefaultToastBanner({
  toast,
  onHide,
}: {
  toast: DefaultToastPayload;
  onHide: () => void;
}) {
  const theme = useTheme();
  const { toastBottomOffset } = useTabScreenLayout();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;
  const palette = theme.semantic[variantTone(toast.variant)];

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 220, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 220, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, { toValue: 0, duration: 180, useNativeDriver: true }),
        Animated.timing(translateY, { toValue: 8, duration: 180, useNativeDriver: true }),
      ]).start(({ finished }) => {
        if (finished) onHide();
      });
    }, DEFAULT_TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onHide, opacity, translateY]);

  const iconName =
    toast.variant === 'success'
      ? 'checkmark-circle'
      : toast.variant === 'error'
        ? 'alert-circle'
        : 'information-circle';

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapperBottom,
        { bottom: toastBottomOffset, opacity, transform: [{ translateY }] },
      ]}>
      <Pressable
        accessibilityRole="alert"
        onPress={onHide}
        style={[
          styles.banner,
          theme.shadow.card,
          {
            backgroundColor: theme.surfaceCard,
            borderColor: palette.border,
          },
        ]}>
        <View style={[styles.iconWrap, { backgroundColor: palette.bg }]}>
          <Ionicons color={palette.text} name={iconName} size={20} />
        </View>
        <ThemedText style={styles.message}>{toast.message}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

function NotificationToastBanner({
  toast,
  onHide,
}: {
  toast: NotificationToastPayload;
  onHide: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const isDesktopLayout = useIsDesktopLayout();
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(-16)).current;
  const palette = theme.semantic[variantTone(toast.variant)];

  const topOffset = isDesktopLayout
    ? insets.top + layout.space.md
    : getScreenTopChromeHeight(insets.top) + layout.space.sm;

  const dismiss = useCallback(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 0, duration: 200, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: -10, duration: 200, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onHide();
    });
  }, [onHide, opacity, translateY]);

  useEffect(() => {
    void hapticLightImpact();

    Animated.parallel([
      Animated.spring(translateY, { toValue: 0, useNativeDriver: true, speed: 18, bounciness: 6 }),
      Animated.timing(opacity, { toValue: 1, duration: 240, useNativeDriver: true }),
    ]).start();

    const timer = setTimeout(() => {
      dismiss();
    }, NOTIFICATION_TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [dismiss, opacity, translateY]);

  const handlePress = () => {
    void hapticLightImpact();
    toast.onPress?.();
    dismiss();
  };

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapperTop,
        { top: topOffset, opacity, transform: [{ translateY }] },
      ]}>
      <Pressable
        accessibilityRole="button"
        accessibilityHint="Abre os detalhes do alerta"
        onPress={handlePress}
        style={[
          styles.notificationBanner,
          theme.shadow.glow,
          {
            backgroundColor: theme.surfaceCard,
            borderColor: palette.border,
          },
        ]}>
        <View style={[styles.notificationAccent, { backgroundColor: palette.text }]} />

        <View style={[styles.notificationIconWrap, { backgroundColor: palette.bg }]}>
          <Ionicons color={palette.text} name={toast.icon} size={20} />
        </View>

        <View style={styles.notificationContent}>
          <View style={styles.notificationHeader}>
            <ThemedText style={[styles.notificationEyebrow, { color: theme.textMuted }]}>
            Novo alerta
          </ThemedText>
            <View style={[styles.liveDot, { backgroundColor: palette.text }]} />
          </View>
          <ThemedText type="smallBold" numberOfLines={1}>
            {toast.title}
          </ThemedText>
          <ThemedText themeColor="textSecondary" type="small" numberOfLines={2} style={styles.notificationMessage}>
            {toast.message}
          </ThemedText>
        </View>

        <View style={[styles.notificationAction, { backgroundColor: brandRgb(theme.accent, 0.12) }]}>
          <ThemedText style={[styles.notificationActionLabel, { color: theme.accent }]}>Ver</ThemedText>
          <Ionicons color={theme.accent} name="chevron-forward" size={16} />
        </View>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [activeToast, setActiveToast] = useState<ToastPayload | null>(null);
  const queueRef = useRef<ToastPayload[]>([]);
  const isShowingRef = useRef(false);

  const showNext = useCallback(() => {
    const next = queueRef.current.shift() ?? null;
    isShowingRef.current = next !== null;
    setActiveToast(next);
  }, []);

  const enqueueToast = useCallback(
    (payload: ToastPayload) => {
      if (isShowingRef.current) {
        queueRef.current.push(payload);
        return;
      }

      isShowingRef.current = true;
      setActiveToast(payload);
    },
    [],
  );

  const handleHide = useCallback(() => {
    isShowingRef.current = false;
    setActiveToast(null);

    if (queueRef.current.length > 0) {
      setTimeout(showNext, 180);
    }
  }, [showNext]);

  const showToast = useCallback(
    (message: string, variant: ToastVariant = 'info') => {
      enqueueToast({ kind: 'default', message, variant });
    },
    [enqueueToast],
  );

  const showNotificationToast = useCallback(
    (payload: Omit<NotificationToastPayload, 'kind'>) => {
      enqueueToast({ kind: 'notification', ...payload });
    },
    [enqueueToast],
  );

  const value = useMemo(
    () => ({ showToast, showNotificationToast }),
    [showNotificationToast, showToast],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {activeToast?.kind === 'notification' ? (
        <NotificationToastBanner toast={activeToast} onHide={handleHide} />
      ) : null}
      {activeToast?.kind === 'default' ? (
        <DefaultToastBanner toast={activeToast} onHide={handleHide} />
      ) : null}
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error('useToast deve ser usado dentro de ToastProvider.');
  }

  return context;
}

const styles = StyleSheet.create({
  wrapperBottom: {
    position: 'absolute',
    left: layout.space.lg,
    right: layout.space.lg,
    zIndex: zIndex.toast,
  },
  wrapperTop: {
    position: 'absolute',
    left: layout.space.lg,
    right: layout.space.lg,
    zIndex: zIndex.toast,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.md,
    paddingHorizontal: layout.space.md,
    paddingVertical: layout.space.md,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  notificationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.sm,
    paddingVertical: layout.space.md,
    paddingRight: layout.space.md,
    paddingLeft: layout.space.sm,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  notificationAccent: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
  },
  notificationIconWrap: {
    width: 40,
    height: 40,
    borderRadius: layout.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: layout.space.xs,
  },
  notificationContent: {
    flex: 1,
    gap: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: layout.space.xs,
  },
  notificationEyebrow: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  notificationMessage: {
    lineHeight: 18,
  },
  notificationAction: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: layout.space.sm,
    paddingVertical: layout.space.xs,
    borderRadius: layout.radius.pill,
  },
  notificationActionLabel: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 12,
    lineHeight: 16,
  },
});
