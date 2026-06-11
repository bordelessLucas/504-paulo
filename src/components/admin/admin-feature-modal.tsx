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
} from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

type AdminFeatureModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: React.ReactNode;
};

export function AdminFeatureModal({
  visible,
  title,
  description,
  onClose,
  children,
}: AdminFeatureModalProps) {
  const theme = useTheme();

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  return (
    <Modal animationType="fade" transparent visible={visible} onRequestClose={handleClose}>
      <Pressable style={styles.overlay} onPress={handleClose}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}>
          <Pressable
            onPress={(event) => event.stopPropagation()}
            style={[
              styles.sheet,
              {
                backgroundColor: theme.background,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.header}>
              <View style={styles.headerText}>
                <ThemedText type="heading" style={styles.title}>
                  {title}
                </ThemedText>
                {description ? (
                  <ThemedText themeColor="textSecondary" style={styles.description}>
                    {description}
                  </ThemedText>
                ) : null}
              </View>

              <Pressable
                accessibilityLabel="Fechar"
                accessibilityRole="button"
                hitSlop={8}
                onPress={handleClose}
                style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
                <Ionicons color={theme.textSecondary} name="close" size={22} />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.scrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}>
              {children}
            </ScrollView>
          </Pressable>
        </KeyboardAvoidingView>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'center',
    padding: Spacing.four,
  },
  keyboardView: {
    width: '100%',
    maxWidth: 720,
    alignSelf: 'center',
  },
  sheet: {
    maxHeight: '90%',
    borderWidth: 1,
    borderRadius: Radius.lg,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.three,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    paddingBottom: Spacing.two,
  },
  headerText: {
    flex: 1,
    gap: Spacing.one,
  },
  title: {
    fontSize: 20,
    lineHeight: 26,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  closeButton: {
    padding: Spacing.one,
  },
  scrollContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.five,
    gap: Spacing.three,
  },
  pressed: {
    opacity: 0.7,
  },
});
