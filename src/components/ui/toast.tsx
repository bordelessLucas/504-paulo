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
import { TAB_BAR_BASE_HEIGHT } from '@/constants/layout';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type ToastVariant = 'success' | 'error' | 'info';

type ToastPayload = {
  message: string;
  variant: ToastVariant;
};

type ToastContextValue = {
  showToast: (message: string, variant?: ToastVariant) => void;
};

const ToastContext = createContext<ToastContextValue | null>(null);

const TOAST_DURATION_MS = 3800;

function ToastBanner({
  toast,
  onHide,
}: {
  toast: ToastPayload;
  onHide: () => void;
}) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();
  const toastBottomOffset = TAB_BAR_BASE_HEIGHT + insets.bottom + Spacing.two;
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(12)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, {
        toValue: 1,
        duration: 220,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 220,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      Animated.parallel([
        Animated.timing(opacity, {
          toValue: 0,
          duration: 180,
          useNativeDriver: true,
        }),
        Animated.timing(translateY, {
          toValue: 8,
          duration: 180,
          useNativeDriver: true,
        }),
      ]).start(({ finished }) => {
        if (finished) {
          onHide();
        }
      });
    }, TOAST_DURATION_MS);

    return () => clearTimeout(timer);
  }, [onHide, opacity, translateY]);

  const iconName =
    toast.variant === 'success'
      ? 'checkmark-circle'
      : toast.variant === 'error'
        ? 'alert-circle'
        : 'information-circle';

  const accentColor =
    toast.variant === 'success'
      ? theme.accent
      : toast.variant === 'error'
        ? theme.danger
        : theme.textSecondary;

  return (
    <Animated.View
      pointerEvents="box-none"
      style={[
        styles.wrapper,
        {
          bottom: toastBottomOffset,
          opacity,
          transform: [{ translateY }],
        },
      ]}>
      <Pressable
        accessibilityRole="alert"
        onPress={onHide}
        style={[
          styles.banner,
          {
            backgroundColor: theme.background,
            borderColor: theme.border,
            shadowColor: theme.text,
          },
        ]}>
        <View style={[styles.iconWrap, { backgroundColor: theme.accentMuted }]}>
          <Ionicons color={accentColor} name={iconName} size={20} />
        </View>
        <ThemedText style={styles.message}>{toast.message}</ThemedText>
      </Pressable>
    </Animated.View>
  );
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toast, setToast] = useState<ToastPayload | null>(null);

  const showToast = useCallback((message: string, variant: ToastVariant = 'info') => {
    setToast({ message, variant });
  }, []);

  const value = useMemo(() => ({ showToast }), [showToast]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? <ToastBanner toast={toast} onHide={() => setToast(null)} /> : null}
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
  wrapper: {
    position: 'absolute',
    left: Spacing.four,
    right: Spacing.four,
    zIndex: 999,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    borderRadius: Radius.lg,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: Radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  message: {
    flex: 1,
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
});
