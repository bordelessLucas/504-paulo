import { useMemo } from "react";
import { Dimensions, Platform, StyleSheet, Text, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";

import { useColorScheme } from "@/hooks/use-color-scheme";

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isBright: boolean;
  rotation: number;
  glyph: "★" | "✦" | "✧";
};

type DepthLayerConfig = {
  depth: number;
  count: number;
  parallax: number;
  spread: number;
  sizeMin: number;
  sizeMax: number;
  opacityMin: number;
  opacityMax: number;
  brightChance: number;
  zIndex: number;
};

type StarLayer = DepthLayerConfig & {
  stars: Star[];
};

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");
const CENTER_X = SCREEN_WIDTH / 2;
const CENTER_Y = SCREEN_HEIGHT / 2;

const SPRING_CONFIG = {
  damping: 22,
  stiffness: 120,
  mass: 0.4,
};

const DEPTH_LAYER_CONFIGS: DepthLayerConfig[] = [
  {
    depth: 0,
    count: 100,
    parallax: 0.004,
    spread: 1.02,
    sizeMin: 3,
    sizeMax: 5,
    opacityMin: 0.15,
    opacityMax: 0.32,
    brightChance: 0.04,
    zIndex: 1,
  },
  {
    depth: 1,
    count: 90,
    parallax: 0.01,
    spread: 1.04,
    sizeMin: 4,
    sizeMax: 6.5,
    opacityMin: 0.28,
    opacityMax: 0.48,
    brightChance: 0.08,
    zIndex: 2,
  },
  {
    depth: 2,
    count: 75,
    parallax: 0.022,
    spread: 1.06,
    sizeMin: 5,
    sizeMax: 8,
    opacityMin: 0.42,
    opacityMax: 0.65,
    brightChance: 0.12,
    zIndex: 3,
  },
  {
    depth: 3,
    count: 55,
    parallax: 0.042,
    spread: 1.08,
    sizeMin: 6.5,
    sizeMax: 10,
    opacityMin: 0.58,
    opacityMax: 0.82,
    brightChance: 0.18,
    zIndex: 4,
  },
  {
    depth: 4,
    count: 38,
    parallax: 0.075,
    spread: 1.1,
    sizeMin: 8,
    sizeMax: 13,
    opacityMin: 0.72,
    opacityMax: 1,
    brightChance: 0.28,
    zIndex: 5,
  },
];

function seededRandom(seed: number) {
  const value = Math.sin(seed * 12.9898 + seed * 78.233) * 43758.5453;
  return value - Math.floor(value);
}

function lerp(min: number, max: number, t: number) {
  return min + (max - min) * t;
}

function buildGalaxyLayers(): StarLayer[] {
  return DEPTH_LAYER_CONFIGS.map((config) => {
    const stars: Star[] = Array.from(
      { length: config.count },
      (_, starIndex) => {
        const seed = config.depth * 1000 + starIndex;
        const x =
          seededRandom(seed) * SCREEN_WIDTH * config.spread -
          SCREEN_WIDTH * 0.03;
        const y =
          seededRandom(seed + 1) * SCREEN_HEIGHT * config.spread -
          SCREEN_HEIGHT * 0.03;
        const sizeT = seededRandom(seed + 2);
        const size = lerp(config.sizeMin, config.sizeMax, sizeT);
        const opacityT = seededRandom(seed + 3);
        const opacity = lerp(config.opacityMin, config.opacityMax, opacityT);
        const isBright = seededRandom(seed + 4) < config.brightChance;
        const rotation = seededRandom(seed + 5) * 360;
        const glyphRoll = seededRandom(seed + 6);
        const glyph: Star["glyph"] = isBright
          ? "★"
          : glyphRoll > 0.5
            ? "✦"
            : "✧";

        return {
          id: starIndex,
          x,
          y,
          size,
          opacity: isBright ? Math.min(opacity + 0.1, 1) : opacity,
          isBright,
          rotation,
          glyph,
        };
      },
    );

    return { ...config, stars };
  });
}

const GALAXY_LAYERS = buildGalaxyLayers();

type DepthPalette = {
  far: string;
  mid: string;
  near: string;
  bright: string;
  vignette: string;
  vignetteNative: string;
};

function getDepthPalette(
  scheme: "light" | "dark" | null | undefined,
): DepthPalette {
  if (scheme === "dark") {
    return {
      far: "#6B7394",
      mid: "#A8AFC8",
      near: "#E4E6F2",
      bright: "#FFFFFF",
      vignette:
        "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 18%, rgba(0,0,0,0.5) 100%)",
      vignetteNative: "rgba(0,0,0,0.35)",
    };
  }

  // Blue-ish palette tuned to match the app accent in light mode
  return {
    far: "#8EBEEB",
    mid: "#2383E2",
    near: "#DFF6FF",
    bright: "#FFFFFF",
    vignette:
      "radial-gradient(ellipse 85% 75% at 50% 42%, transparent 26%, rgba(55,53,47,0.18) 100%)",
    vignetteNative: "rgba(55,53,47,0.16)",
  };
}

function getStarColor(depth: number, isBright: boolean, palette: DepthPalette) {
  if (isBright) {
    return palette.bright;
  }

  if (depth <= 1) {
    return palette.far;
  }

  if (depth <= 3) {
    return palette.mid;
  }

  return palette.near;
}

type GalaxyStarBackgroundProps = {
  pointerX: SharedValue<number>;
  pointerY: SharedValue<number>;
};

type StarLayerViewProps = {
  layer: StarLayer;
  pointerX: SharedValue<number>;
  pointerY: SharedValue<number>;
  palette: DepthPalette;
};

function StarLayerView({
  layer,
  pointerX,
  pointerY,
  palette,
}: StarLayerViewProps) {
  const depthNorm = layer.depth / (DEPTH_LAYER_CONFIGS.length - 1);

  const animatedStyle = useAnimatedStyle(() => {
    const offsetX = pointerX.value - CENTER_X;
    const offsetY = pointerY.value - CENTER_Y;
    const parallaxX = offsetX * layer.parallax;
    const parallaxY = offsetY * layer.parallax;
    const depthScale = interpolate(depthNorm, [0, 1], [1, 1.03]);
    const pointerScale =
      1 + (Math.abs(offsetX) / SCREEN_WIDTH) * 0.015 * depthNorm;

    return {
      transform: [
        { translateX: parallaxX },
        { translateY: parallaxY },
        { scale: depthScale * pointerScale },
      ],
    };
  });

  return (
    <Animated.View
      pointerEvents="none"
      style={[styles.layer, { zIndex: layer.zIndex }, animatedStyle]}
    >
      {layer.stars.map((star) => {
        const color = getStarColor(layer.depth, star.isBright, palette);
        const glowStrength = 4 + layer.depth * 2;

        return (
          <Text
            key={star.id}
            style={[
              styles.star,
              {
                left: star.x,
                top: star.y,
                fontSize: star.size,
                lineHeight: star.size,
                opacity: star.opacity,
                color,
                transform: [{ rotate: `${star.rotation}deg` }],
                ...(star.isBright && layer.depth >= 3
                  ? Platform.OS === "web"
                    ? ({
                        textShadow: `0 0 ${glowStrength}px rgba(255,255,255,0.95)`,
                      } as object)
                    : {
                        textShadowColor: "#FFFFFF",
                        textShadowOffset: { width: 0, height: 0 },
                        textShadowRadius: glowStrength,
                      }
                  : null),
              },
            ]}
          >
            {star.glyph}
          </Text>
        );
      })}
    </Animated.View>
  );
}

function DepthVignette({ palette }: { palette: DepthPalette }) {
  if (Platform.OS === "web") {
    return (
      <View
        pointerEvents="none"
        style={[
          styles.vignette,
          { backgroundImage: palette.vignette } as object,
        ]}
      />
    );
  }

  return (
    <>
      <View
        pointerEvents="none"
        style={[
          styles.edgeFade,
          styles.edgeTop,
          { backgroundColor: palette.vignetteNative },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.edgeFade,
          styles.edgeBottom,
          { backgroundColor: palette.vignetteNative },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.edgeFade,
          styles.edgeLeft,
          { backgroundColor: palette.vignetteNative },
        ]}
      />
      <View
        pointerEvents="none"
        style={[
          styles.edgeFade,
          styles.edgeRight,
          { backgroundColor: palette.vignetteNative },
        ]}
      />
    </>
  );
}

export function GalaxyStarBackground({
  pointerX,
  pointerY,
}: GalaxyStarBackgroundProps) {
  const scheme = useColorScheme();
  const palette = useMemo(() => getDepthPalette(scheme), [scheme]);

  return (
    <View pointerEvents="none" style={styles.container}>
      {GALAXY_LAYERS.map((layer) => (
        <StarLayerView
          key={layer.depth}
          layer={layer}
          palette={palette}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
      {/* Render vignette/edge fades only on dark scheme to keep light background plain */}
      {scheme === "dark" ? <DepthVignette palette={palette} /> : null}
    </View>
  );
}

export function updateGalaxyPointer(
  pointerX: SharedValue<number>,
  pointerY: SharedValue<number>,
  x: number,
  y: number,
) {
  pointerX.value = withSpring(x, SPRING_CONFIG);
  pointerY.value = withSpring(y, SPRING_CONFIG);
}

export {
  CENTER_X as GALAXY_CENTER_X,
  CENTER_Y as GALAXY_CENTER_Y,
  SPRING_CONFIG as GALAXY_SPRING_CONFIG,
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden",
    zIndex: 0,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  star: {
    position: "absolute",
    includeFontPadding: false,
    textAlign: "center",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
  edgeFade: {
    position: "absolute",
  },
  edgeTop: {
    top: 0,
    left: 0,
    right: 0,
    height: "28%",
    opacity: 0.55,
  },
  edgeBottom: {
    bottom: 0,
    left: 0,
    right: 0,
    height: "28%",
    opacity: 0.55,
  },
  edgeLeft: {
    top: 0,
    bottom: 0,
    left: 0,
    width: "18%",
    opacity: 0.4,
  },
  edgeRight: {
    top: 0,
    bottom: 0,
    right: 0,
    width: "18%",
    opacity: 0.4,
  },
});
