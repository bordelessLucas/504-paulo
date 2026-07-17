import Ionicons from '@expo/vector-icons/Ionicons';
import { useCallback } from 'react';
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
  useWindowDimensions,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { brand, brandRgb } from '@/constants/brand';
import { MODAL_SHEET_RADIUS } from '@/constants/modal';
import { Fonts, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

const SHEET_RADIUS = MODAL_SHEET_RADIUS;
const SHEET_HEIGHT_RATIO = 0.92;
const CENTERED_HEIGHT_RATIO = 0.86;

export type BaseModalVariant = 'sheet' | 'centered';

type ThemeColors = {
  text: string;
  textSecondary: string;
  border: string;
  backgroundElement: string;
  placeholder: string;
};

type BaseModalProps = {
  visible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  variant?: BaseModalVariant;
  title?: string;
  description?: string;
  showHandle?: boolean;
  showCloseButton?: boolean;
  dismissOnBackdropPress?: boolean;
  footer?: React.ReactNode;
  maxWidth?: number;
  contentContainerStyle?: StyleProp<ViewStyle>;
};

export function getModalTextAreaStyle(theme: ThemeColors): TextStyle {
  return {
    minHeight: 100,
    borderWidth: 0,
    borderRadius: 6,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
    color: theme.text,
    backgroundColor: theme.backgroundElement,
  };
}

export function BaseModalActions({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
}) {
  return <View style={[styles.actions, style]}>{children}</View>;
}

export function BaseModal({
  visible,
  onClose,
  children,
  variant = 'sheet',
  title,
  description,
  showHandle,
  showCloseButton,
  dismissOnBackdropPress = true,
  footer,
  maxWidth,
  contentContainerStyle,
}: BaseModalProps) {
  const insets = useSafeAreaInsets();
  const { height: windowHeight } = useWindowDimensions();
  const theme = useTheme();
  const isDark = theme.isDark;
  const surfaceColor = theme.surfaceElevated;
  const borderColor = theme.border;

  const isSheet = variant === 'sheet';
  const resolvedMaxWidth = maxWidth ?? (isSheet ? undefined : MaxContentWidth);
  const shouldShowHandle = showHandle ?? isSheet;
  const shouldShowCloseButton = showCloseButton ?? Boolean(title);

  const handleBackdropPress = useCallback(() => {
    if (dismissOnBackdropPress) {
      onClose();
    }
  }, [dismissOnBackdropPress, onClose]);

  const verticalChrome = isSheet ? insets.bottom + Spacing.two : insets.top + insets.bottom + Spacing.six;
  const maxScrollHeight = Math.round(windowHeight * (isSheet ? SHEET_HEIGHT_RATIO : CENTERED_HEIGHT_RATIO) - verticalChrome);
  const scrollPaddingBottom = insets.bottom + Spacing.five;

  return (
    <Modal
      animationType={isSheet ? 'slide' : 'fade'}
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[
          styles.keyboardRoot,
          isSheet ? styles.keyboardSheet : styles.keyboardCentered,
        ]}>
        <Pressable
          accessibilityRole="button"
          style={[styles.backdrop, { backgroundColor: theme.overlay }]}
          onPress={handleBackdropPress}
        />

        <View
          style={[
            isSheet ? styles.sheet : styles.dialog,
            {
              backgroundColor: surfaceColor,
              borderColor,
              maxWidth: resolvedMaxWidth,
              maxHeight: maxScrollHeight,
              ...Platform.select({
                ios: {
                  shadowColor: brand.navyDeep,
                  shadowOffset: { width: 0, height: isSheet ? -4 : 8 },
                  shadowOpacity: isDark ? 0.45 : 0.18,
                  shadowRadius: isSheet ? 16 : 24,
                },
                android: {
                  elevation: 16,
                },
                web: {
                  boxShadow: `0 16px 48px ${brandRgb(brand.navyDeep, isDark ? 0.55 : 0.16)}`,
                },
              }),
            },
          ]}>
          <ScrollView
            bounces
            alwaysBounceVertical={false}
            keyboardShouldPersistTaps="handled"
            nestedScrollEnabled
            showsVerticalScrollIndicator={Platform.OS !== 'web'}
            style={[styles.scroll, { maxHeight: maxScrollHeight }]}
            contentContainerStyle={[
              styles.scrollContent,
              { paddingBottom: scrollPaddingBottom },
              contentContainerStyle,
            ]}>
            {shouldShowHandle ? (
              <View style={[styles.handle, { backgroundColor: theme.border }]} />
            ) : null}

            {title ? (
              <View style={styles.header}>
                <View style={styles.headerText}>
                  <ThemedText
                    type={isSheet ? 'heading' : 'subtitle'}
                    style={isSheet ? styles.sheetTitle : styles.dialogTitle}>
                    {title}
                  </ThemedText>
                  {description ? (
                    <ThemedText themeColor="textSecondary" style={styles.description}>
                      {description}
                    </ThemedText>
                  ) : null}
                </View>

                {shouldShowCloseButton ? (
                  <Pressable
                    accessibilityLabel="Fechar"
                    accessibilityRole="button"
                    hitSlop={12}
                    onPress={onClose}
                    style={({ pressed }) => [
                      styles.closeButton,
                      { backgroundColor: theme.backgroundSelected },
                      pressed && styles.pressed,
                    ]}>
                    <Ionicons color={theme.textSecondary} name="close" size={20} />
                  </Pressable>
                ) : null}
              </View>
            ) : null}

            {children}
            {footer}
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  keyboardRoot: {
    flex: 1,
  },
  keyboardSheet: {
    justifyContent: 'flex-end',
  },
  keyboardCentered: {
    justifyContent: 'center',
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.three,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  sheet: {
    width: '100%',
    borderTopLeftRadius: SHEET_RADIUS,
    borderTopRightRadius: SHEET_RADIUS,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: 'hidden',
  },
  dialog: {
    width: '100%',
    alignSelf: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: SHEET_RADIUS,
    overflow: 'hidden',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.two,
    marginBottom: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingBottom: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  sheetTitle: {
    fontSize: 20,
    lineHeight: 26,
  },
  dialogTitle: {
    fontSize: 18,
    lineHeight: 24,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scroll: {
    width: '100%',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    gap: Spacing.three,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: Spacing.two,
    paddingTop: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
