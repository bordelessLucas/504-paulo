import { ScrollView, StyleSheet, View } from "react-native";

import { layout } from "@/constants/theme";
import { StatCard } from "@/components/premium/StatCard";
import type { SemanticTone } from "@/constants/theme";

export type MetricItem = {
  label: string;
  value: string;
  hint?: string;
  tone?: SemanticTone;
};

type MetricStripProps = {
  metrics: MetricItem[];
};

export function MetricStrip({ metrics }: MetricStripProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.strip}>
      {metrics.map((metric) => (
        <StatCard
          key={metric.label}
          label={metric.label}
          value={metric.value}
          hint={metric.hint}
          tone={metric.tone}
        />
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  strip: {
    flexDirection: "row",
    gap: layout.space.sm,
    paddingVertical: layout.space.xs,
    paddingRight: layout.space.sm,
  },
});
