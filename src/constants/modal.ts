import { StyleSheet } from 'react-native';

import { Radius, Spacing } from '@/constants/theme';

export const MODAL_BACKDROP = 'rgba(0, 0, 0, 0.65)';
export const MODAL_SURFACE_LIGHT = '#FFFFFF';
export const MODAL_SURFACE_DARK = '#1E1E1E';
export const MODAL_SHEET_RADIUS = 16;

/** @deprecated Use BaseModal — mantido para NotificationsPanel até migração completa */
export function getModalOverlayStyle() {
  return { backgroundColor: MODAL_BACKDROP };
}

export const modalSheetStyles = StyleSheet.create({
  keyboard: {
    width: '100%',
  },
  sheet: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
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
