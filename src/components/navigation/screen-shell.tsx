import { StyleSheet, View } from "react-native";

import { ScreenHeader } from "@/components/navigation/screen-header";
import { TabScreenContainer } from "@/components/navigation/tab-screen-container";
import { Card } from "@/components/ui/card";
import { Spacing } from "@/constants/theme";

type ScreenShellProps = {
  title: string;
  description: string;
  children?: React.ReactNode;
};

export function ScreenShell({ title, description, children }: ScreenShellProps) {
  return (
    <TabScreenContainer>
      <View style={styles.content}>
        <ScreenHeader title={title} description={description} />
        {children ? <Card>{children}</Card> : null}
      </View>
    </TabScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    flex: 1,
    gap: Spacing.four,
  },
});
