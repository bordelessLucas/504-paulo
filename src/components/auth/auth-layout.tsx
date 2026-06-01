import { useCallback, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
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
import { ThemedText } from "@/components/themed-text";
import { ThemedView } from "@/components/themed-view";
import { MaxContentWidth, Radius, Spacing } from "@/constants/theme";
import { useGalaxyDeviceTilt } from "@/hooks/use-galaxy-device-tilt";
import { useTheme } from "@/hooks/use-theme";

type AuthLayoutProps = {
  title: string;
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
    <ThemedView
      onPointerLeave={isWeb ? handlePointerLeave : undefined}
      onPointerMove={
        isWeb && showStarBackground ? handleWebPointerMove : undefined
      }
      style={styles.container}
    >
      {showStarBackground ? (
        <GalaxyStarBackground pointerX={pointerX} pointerY={pointerY} />
      ) : null}
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            <View
              style={[
                styles.card,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.header}>
                <View style={styles.badge}>
                  <ThemedText type="badge">Avalia</ThemedText>
                </View>
                <ThemedText type="heading">{title}</ThemedText>
                <ThemedText themeColor="textSecondary" style={styles.subtitle}>
                  {subtitle}
                </ThemedText>
              </View>

              <View style={styles.form}>{children}</View>

              {footer ? <View style={styles.footer}>{footer}</View> : null}
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ThemedView>
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
    justifyContent: "center",
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.five,
    maxWidth: MaxContentWidth,
    width: "100%",
    alignSelf: "center",
    gap: Spacing.five,
  },
  header: {
    gap: Spacing.two,
  },
  badge: {
    alignSelf: "flex-start",
    marginBottom: Spacing.one,
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 22,
  },
  form: {
    gap: Spacing.three,
  },
  footer: {
    alignItems: "center",
  },
  card: {
    width: "100%",
    borderRadius: Radius.xl,
    padding: Spacing.four,
    borderWidth: 1,
    gap: Spacing.four,
    // subtle shadow for native platforms
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.06,
        shadowRadius: 12,
      },
      android: {
        elevation: 6,
      },
      web: {
        boxShadow: "0 6px 20px rgba(0,0,0,0.06)",
      },
    }),
  },
});
