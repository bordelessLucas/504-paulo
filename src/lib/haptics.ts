import * as Haptics from "expo-haptics";
import { Platform } from "react-native";

export async function hapticSelection() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.selectionAsync();
  } catch {
    // dispositivo sem suporte
  }
}

export async function hapticLightImpact() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  } catch {
    // dispositivo sem suporte
  }
}

export async function hapticMediumImpact() {
  if (Platform.OS === "web") return;
  try {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
  } catch {
    // dispositivo sem suporte
  }
}
