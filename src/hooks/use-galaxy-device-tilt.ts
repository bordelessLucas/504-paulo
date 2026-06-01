import { Accelerometer } from 'expo-sensors';
import { useEffect, useRef } from 'react';
import { Dimensions, Platform } from 'react-native';
import { type SharedValue, withSpring } from 'react-native-reanimated';

import { GALAXY_CENTER_X, GALAXY_CENTER_Y, updateGalaxyPointer } from '@/components/auth/galaxy-star-background';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const TILT_AMPLIFIER = 2.2;
const TILT_STRENGTH_X = SCREEN_WIDTH * 0.95;
const TILT_STRENGTH_Y = SCREEN_HEIGHT * 0.88;
const BASELINE_SAMPLES = 8;

const MOBILE_TILT_SPRING = {
  damping: 16,
  stiffness: 160,
  mass: 0.3,
};

function isNativeMobile() {
  return Platform.OS === 'ios' || Platform.OS === 'android';
}

export function useGalaxyDeviceTilt(
  enabled: boolean,
  pointerX: SharedValue<number>,
  pointerY: SharedValue<number>,
) {
  const baselineRef = useRef<{ x: number; y: number } | null>(null);
  const baselineSamplesRef = useRef<{ x: number; y: number }[]>([]);

  useEffect(() => {
    if (!enabled || !isNativeMobile()) {
      return;
    }

    let isMounted = true;
    let subscription: { remove: () => void } | null = null;

    async function startSensor() {
      const isAvailable = await Accelerometer.isAvailableAsync();
      if (!isAvailable || !isMounted) {
        return;
      }

      const permission = await Accelerometer.requestPermissionsAsync();
      if (!permission.granted || !isMounted) {
        return;
      }

      baselineRef.current = null;
      baselineSamplesRef.current = [];
      Accelerometer.setUpdateInterval(32);

      subscription = Accelerometer.addListener(({ x, y }) => {
        if (!baselineRef.current) {
          baselineSamplesRef.current.push({ x, y });

          if (baselineSamplesRef.current.length < BASELINE_SAMPLES) {
            return;
          }

          const total = baselineSamplesRef.current.reduce(
            (accumulator, sample) => ({
              x: accumulator.x + sample.x,
              y: accumulator.y + sample.y,
            }),
            { x: 0, y: 0 },
          );

          baselineRef.current = {
            x: total.x / BASELINE_SAMPLES,
            y: total.y / BASELINE_SAMPLES,
          };
        }

        const baseline = baselineRef.current;
        const tiltX = (x - baseline.x) * TILT_AMPLIFIER;
        const tiltY = (y - baseline.y) * TILT_AMPLIFIER;
        const targetX = GALAXY_CENTER_X + tiltX * TILT_STRENGTH_X;
        const targetY = GALAXY_CENTER_Y - tiltY * TILT_STRENGTH_Y;

        pointerX.value = withSpring(targetX, MOBILE_TILT_SPRING);
        pointerY.value = withSpring(targetY, MOBILE_TILT_SPRING);
      });
    }

    void startSensor();

    return () => {
      isMounted = false;
      subscription?.remove();
      updateGalaxyPointer(pointerX, pointerY, GALAXY_CENTER_X, GALAXY_CENTER_Y);
    };
  }, [enabled, pointerX, pointerY]);
}
