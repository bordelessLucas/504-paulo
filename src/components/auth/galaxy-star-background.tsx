import { Dimensions, Platform, StyleSheet, View } from "react-native";
import Animated, {
  interpolate,
  SharedValue,
  useAnimatedStyle,
  withSpring,
} from "react-native-reanimated";
import Svg, { Polygon } from "react-native-svg";

import { BrandColors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

type StarVariant = "five" | "four" | "sparkle";

type Star = {
  id: number;
  x: number;
  y: number;
  size: number;
  opacity: number;
  isBright: boolean;
  colorVariant: number;
  variant: StarVariant;
  rotation: number;
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

const STAR_PARTICLE_COLORS = [
  "#FFFFFF",
  BrandColors.background,
  BrandColors.secondary,
] as const;

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
    count: 80,
    parallax: 0.004,
    spread: 1.02,
    sizeMin: 3,
    sizeMax: 5,
    opacityMin: 0.2,
    opacityMax: 0.4,
    brightChance: 0.05,
    zIndex: 1,
  },
  {
    depth: 1,
    count: 70,
    parallax: 0.01,
    spread: 1.04,
    sizeMin: 4,
    sizeMax: 6.5,
    opacityMin: 0.28,
    opacityMax: 0.5,
    brightChance: 0.08,
    zIndex: 2,
  },
  {
    depth: 2,
    count: 55,
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
    count: 40,
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
    count: 28,
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

function buildStarPolygonPoints(
  size: number,
  points: number,
  innerRatio: number,
  rotationDeg: number,
): string {
  const cx = size / 2;
  const cy = size / 2;
  const outerRadius = size / 2;
  const innerRadius = outerRadius * innerRatio;
  const rotation = (rotationDeg * Math.PI) / 180;
  const vertices: string[] = [];

  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outerRadius : innerRadius;
    const angle = rotation + (i * Math.PI) / points - Math.PI / 2;
    vertices.push(`${cx + radius * Math.cos(angle)},${cy + radius * Math.sin(angle)}`);
  }

  return vertices.join(" ");
}

function getStarPolygon(variant: StarVariant, size: number, rotation: number): string {
  if (variant === "five") {
    return buildStarPolygonPoints(size, 5, 0.42, rotation);
  }

  if (variant === "four") {
    return buildStarPolygonPoints(size, 4, 0.38, rotation);
  }

  return buildStarPolygonPoints(size, 4, 0.22, rotation);
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
        const variant: StarVariant = isBright
          ? "five"
          : glyphRoll > 0.5
            ? "four"
            : "sparkle";
        const colorVariant = Math.floor(
          seededRandom(seed + 7) * STAR_PARTICLE_COLORS.length,
        );

        return {
          id: starIndex,
          x,
          y,
          size,
          opacity: isBright ? Math.min(opacity + 0.1, 1) : opacity,
          isBright,
          colorVariant,
          variant,
          rotation,
        };
      },
    );

    return { ...config, stars };
  });
}

const GALAXY_LAYERS = buildGalaxyLayers();

function getStarColor(star: Star) {
  if (star.isBright) {
    return "#FFFFFF";
  }

  return STAR_PARTICLE_COLORS[star.colorVariant];
}

type StarParticleProps = {
  star: Star;
  color: string;
  glowStrength: number;
};

function StarParticle({ star, color, glowStrength }: StarParticleProps) {
  const displaySize = star.isBright ? star.size * 1.2 : star.size;
  const polygonPoints = getStarPolygon(star.variant, displaySize, star.rotation);

  return (
    <View
      style={[
        styles.particle,
        {
          left: star.x,
          top: star.y,
          width: displaySize,
          height: displaySize,
          opacity: star.opacity,
          ...(star.isBright
            ? Platform.OS === "web"
              ? ({
                  filter: `drop-shadow(0 0 ${glowStrength}px rgba(255,255,255,0.9))`,
                } as object)
              : {
                  shadowColor: "#FFFFFF",
                  shadowOffset: { width: 0, height: 0 },
                  shadowOpacity: 0.95,
                  shadowRadius: glowStrength,
                  elevation: 2,
                }
            : null),
        },
      ]}
    >
      <Svg width={displaySize} height={displaySize}>
        <Polygon points={polygonPoints} fill={color} />
      </Svg>
    </View>
  );
}

type GalaxyStarBackgroundProps = {
  pointerX: SharedValue<number>;
  pointerY: SharedValue<number>;
};

type StarLayerViewProps = {
  layer: StarLayer;
  pointerX: SharedValue<number>;
  pointerY: SharedValue<number>;
};

function StarLayerView({ layer, pointerX, pointerY }: StarLayerViewProps) {
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
      {layer.stars.map((star) => (
        <StarParticle
          key={star.id}
          color={getStarColor(star)}
          glowStrength={4 + layer.depth * 2}
          star={star}
        />
      ))}
    </Animated.View>
  );
}

function SubtleVignette() {
  const scheme = useColorScheme();

  if (Platform.OS === "web") {
    const vignette =
      scheme === "dark"
        ? "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 40%, rgba(0,0,0,0.35) 100%)"
        : "radial-gradient(ellipse 90% 80% at 50% 45%, transparent 50%, rgba(0,15,40,0.18) 100%)";

    return (
      <View
        pointerEvents="none"
        style={[styles.vignette, { backgroundImage: vignette } as object]}
      />
    );
  }

  return (
    <View
      pointerEvents="none"
      style={[
        styles.vignette,
        {
          backgroundColor:
            scheme === "dark" ? "rgba(0,0,0,0.12)" : "rgba(0,15,40,0.08)",
        },
      ]}
    />
  );
}

export function GalaxyStarBackground({
  pointerX,
  pointerY,
}: GalaxyStarBackgroundProps) {
  return (
    <View pointerEvents="none" style={styles.container}>
      {GALAXY_LAYERS.map((layer) => (
        <StarLayerView
          key={layer.depth}
          layer={layer}
          pointerX={pointerX}
          pointerY={pointerY}
        />
      ))}
      <SubtleVignette />
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
    backgroundColor: BrandColors.primary,
  },
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  particle: {
    position: "absolute",
  },
  vignette: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 10,
  },
});
