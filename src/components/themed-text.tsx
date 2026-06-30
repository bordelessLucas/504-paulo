import { Platform, StyleSheet, Text, type TextProps } from 'react-native';

import { Fonts, Radius, ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type ThemedTextProps = TextProps & {
  type?:
    | 'default'
    | 'heading'
    | 'title'
    | 'cardTitle'
    | 'description'
    | 'small'
    | 'smallBold'
    | 'subtitle'
    | 'sectionTitle'
    | 'link'
    | 'badge';
  themeColor?: ThemeColor;
};

export function ThemedText({ style, type = 'default', themeColor, ...rest }: ThemedTextProps) {
  const theme = useTheme();

  return (
    <Text
      style={[
        { color: theme[themeColor ?? 'text'] },
        type === 'default' && styles.default,
        type === 'heading' && styles.heading,
        type === 'title' && styles.title,
        type === 'cardTitle' && styles.cardTitle,
        type === 'description' && styles.description,
        type === 'small' && styles.small,
        type === 'smallBold' && styles.smallBold,
        type === 'subtitle' && styles.subtitle,
        type === 'sectionTitle' && styles.sectionTitle,
        type === 'link' && styles.link,
        type === 'badge' && [
          styles.badge,
          {
            color: theme.text,
            backgroundColor: theme.backgroundElement,
            borderColor: theme.border,
          },
        ],
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontFamily: Fonts.sans,
    fontSize: 16,
    lineHeight: 24,
  },
  heading: {
    fontFamily: Fonts.display,
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  title: {
    fontFamily: Fonts.display,
    fontSize: 24,
    lineHeight: 30,
  },
  cardTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 16,
    lineHeight: 22,
  },
  description: {
    fontFamily: Fonts.sans,
    fontSize: 15,
    lineHeight: 22,
  },
  subtitle: {
    fontFamily: Fonts.display,
    fontSize: 18,
    lineHeight: 26,
  },
  sectionTitle: {
    fontFamily: Fonts.sansSemiBold,
    fontSize: 17,
    lineHeight: 24,
    letterSpacing: -0.2,
  },
  small: {
    fontFamily: Fonts.sans,
    fontSize: 14,
    lineHeight: 20,
  },
  smallBold: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
  },
  link: {
    fontFamily: Fonts.sansMedium,
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: 'underline',
  },
  badge: {
    fontFamily: Fonts.sansMedium,
    fontSize: 12,
    lineHeight: 16,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: Radius.sm,
    borderWidth: 1,
    overflow: 'hidden',
  },
});
