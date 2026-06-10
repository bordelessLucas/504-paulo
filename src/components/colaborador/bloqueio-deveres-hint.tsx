import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Fonts, Radius, Spacing } from '@/constants/theme';
import { MENSAGEM_BLOQUEIO_DEVERES } from '@/features/colaborador/eligibility';

type BloqueioDeveresHintProps = {
  visible: boolean;
};

export function BloqueioDeveresHint({ visible }: BloqueioDeveresHintProps) {
  if (!visible) {
    return null;
  }

  return (
    <View style={styles.container}>
      <ThemedText style={styles.text}>{MENSAGEM_BLOQUEIO_DEVERES}</ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    borderColor: '#F5C6CB',
    backgroundColor: '#FDEBEC',
    borderRadius: Radius.sm,
    padding: Spacing.three,
  },
  text: {
    fontFamily: Fonts.sansMedium,
    fontSize: 13,
    lineHeight: 18,
    color: '#C0392B',
  },
});
