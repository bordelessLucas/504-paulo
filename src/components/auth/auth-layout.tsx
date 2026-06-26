import { useCallback, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useSharedValue } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
  GALAXY_CENTER_X,
  GALAXY_CENTER_Y,
  GalaxyStarBackground,
  updateGalaxyPointer,
} from "@/components/auth/galaxy-star-background";
import { GlassCard } from "@/components/premium/GlassCard";
import { ThemedText } from "@/components/themed-text";
import { brand, brandRgb } from "@/constants/brand";
import { Fonts, MaxContentWidth, layout } from "@/constants/theme";
import { useGalaxyDeviceTilt } from "@/hooks/use-galaxy-device-tilt";
import { useTheme } from "@/hooks/use-theme";

type AuthLayoutProps = {
  title?: string;
  subtitle: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  showStarBackground?: boolean;
};

function getPointerPositionFromPointer(event: {
  nativeEvent: {
    pageX?: number;
    pageY?: number;
    clientX?: number;
    clientY?: number;
  };
}) {
  const { pageX, pageY, clientX, clientY } = event.nativeEvent;

  return {
    x: pageX ?? clientX ?? GALAXY_CENTER_X,
    y: pageY ?? clientY ?? GALAXY_CENTER_Y,
  };
}

function BrandLogo({ onDarkBackground = false }: { onDarkBackground?: boolean }) {
  const theme = useTheme();
  const primaryColor = onDarkBackground ? brand.white : theme.accent;
  const secondaryColor = onDarkBackground ? brand.cream : theme.text;

  return (
    <View
      style={[
        styles.emblemBox,
        onDarkBackground && {
          borderColor: brandRgb(brand.greenSoft, 0.35),
          backgroundColor: brandRgb(brand.navy, 0.35),
        },
      ]}
      accessibilityRole="header">
      <Text style={[styles.brandVertek, { color: primaryColor, fontFamily: Fonts.display }]}>
        Vertek
      </Text>
      <Text style={[styles.brandAvalia, { color: secondaryColor, fontFamily: Fonts.sansMedium }]}>
        Avalia
      </Text>
    </View>
  );
}

export function AuthLayout({
  title,
  subtitle,
  children,
  footer,
  showStarBackground = false,
}: AuthLayoutProps) {
  const pointerX = useSharedValue(GALAXY_CENTER_X);
  const pointerY = useSharedValue(GALAXY_CENTER_Y);
  const isPointerActiveRef = useRef(false);
  const isWeb = Platform.OS === "web";

  const theme = useTheme();

  useGalaxyDeviceTilt(showStarBackground && !isWeb, pointerX, pointerY);

  const moveGalaxyPointer = useCallback(
    (x: number, y: number) => {
      updateGalaxyPointer(pointerX, pointerY, x, y);
      isPointerActiveRef.current = true;
    },
    [pointerX, pointerY],
  );

  const handleWebPointerMove = useCallback(
    (event: {
      nativeEvent: {
        pageX?: number;
        pageY?: number;
        clientX?: number;
        clientY?: number;
      };
    }) => {
      if (!showStarBackground) {
        return;
      }

      const { x, y } = getPointerPositionFromPointer(event);
      moveGalaxyPointer(x, y);
    },
    [moveGalaxyPointer, showStarBackground],
  );

  const handlePointerLeave = useCallback(() => {
    if (!showStarBackground || !isPointerActiveRef.current) {
      return;
    }

    updateGalaxyPointer(pointerX, pointerY, GALAXY_CENTER_X, GALAXY_CENTER_Y);
    isPointerActiveRef.current = false;
  }, [pointerX, pointerY, showStarBackground]);

  return (
    <View
      onPointerLeave={isWeb ? handlePointerLeave : undefined}
      onPointerMove={isWeb && showStarBackground ? handleWebPointerMove : undefined}
      style={[
        styles.container,
        showStarBackground
          ? { backgroundColor: brand.navyDeep }
          : { backgroundColor: theme.background },
      ]}>
      {showStarBackground ? <GalaxyStarBackground pointerX={pointerX} pointerY={pointerY} /> : null}
      <SafeAreaView style={styles.safeArea} edges={["top", "bottom"]}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
          style={styles.keyboardView}>
          <ScrollView
            contentContainerStyle={[
              styles.scrollContent,
              showStarBackground ? styles.scrollContentAuth : styles.scrollContentCentered,
            ]}
            keyboardShouldPersistTaps="handled"
            showsHorizontalScrollIndicator={false}
            showsVerticalScrollIndicator={false}
            bounces={false}
            overScrollMode="never">
            {showStarBackground ? <BrandLogo onDarkBackground /> : null}

            <GlassCard glow={showStarBackground} style={styles.cardSurface}>
              <View style={styles.header}>
                {!showStarBackground ? <BrandLogo /> : null}
                {title ? <ThemedText type="heading">{title}</ThemedText> : null}
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              </View>

              <View style={styles.form}>{children}</View>

              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </GlassCard>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: "hidden",
  },
  safeArea: {
    flex: 1,
    zIndex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: layout.space.lg,
    paddingTop: layout.space.lg,
    paddingBottom: layout.space.xxl,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
    gap: layout.space.lg,
  },
  scrollContentCentered: {
    justifyContent: "center",
    paddingVertical: layout.space.xl,
  },
  scrollContentAuth: {
    justifyContent: "center",
    flexGrow: 1,
    paddingVertical: layout.space.xl,
  },
  emblemBox: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: layout.space.sm,
    alignSelf: "center",
    paddingHorizontal: layout.space.md,
    paddingVertical: layout.space.sm,
    borderRadius: layout.radius.lg,
    borderWidth: 1,
    borderColor: "transparent",
  },
  brandVertek: {
    fontSize: 36,
    lineHeight: 42,
    letterSpacing: 1,
  },
  brandAvalia: {
    fontSize: 28,
    lineHeight: 34,
    letterSpacing: 2,
    textTransform: "uppercase",
  },
  header: {
    gap: layout.space.sm,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: layout.space.md,
  },
  footer: {
    alignItems: "center",
  },
  cardSurface: {
    width: "100%",
  },
});
