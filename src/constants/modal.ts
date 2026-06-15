import { StyleSheet } from 'react-native';

import { Colors, Radius, Spacing } from '@/constants/theme';

type Theme = (typeof Colors)['light'] | (typeof Colors)['dark'];

export function getModalOverlayStyle(theme: Theme) {
  return { backgroundColor: theme.overlay };
}

export const modalSheetStyles = StyleSheet.create({
  keyboard: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: Radius.lg,
    borderTopRightRadius: Radius.lg,
    borderWidth: 1,
    maxHeight: '92%',
    overflow: 'hidden',
  },
  scrollContent: {
    padding: Spacing.four,
    paddingBottom: Spacing.six,
  },
  handle: {
    alignSelf: 'center',
    width: 36,
    height: 4,
    borderRadius: 2,
    marginTop: Spacing.two,
    marginBottom: Spacing.one,
  },
});

export const modalCenteredStyles = StyleSheet.create({
  keyboard: {
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  dialog: {
    borderWidth: 1,
    borderRadius: Radius.lg,
    maxHeight: '90%',
    overflow: 'hidden',
  },
});
