import { usePathname } from "expo-router";
import { NativeTabs } from "expo-router/native-tabs";

import { usePreviewAccount, usePreviewInbox } from "@/features/social/preview-state";
import { colors } from "@/features/social/ui";

export default function TabsLayout() {
  const pathname = usePathname();
  const { isSignedIn } = usePreviewAccount();
  const { unread } = usePreviewInbox();
  const badge = unread.length && (isSignedIn || pathname !== "/explore") ? String(unread.length) : undefined;
  return (
    <NativeTabs
      tintColor={colors.blue}
      iconColor={{ default: colors.slate, selected: colors.blue }}
      labelStyle={{ default: { color: colors.slate }, selected: { color: colors.blue } }}
      badgeBackgroundColor={colors.blue}
      backgroundColor={colors.white}
      disableTransparentOnScrollEdge
      backBehavior="history"
      minimizeBehavior="never"
    >
      <NativeTabs.Trigger name="home" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="house" md="home" />
        <NativeTabs.Trigger.Label>Home</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="messages" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="ellipsis.bubble" md="chat" />
        <NativeTabs.Trigger.Label>Messages</NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Badge hidden={!badge}>{badge}</NativeTabs.Trigger.Badge>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="explore" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="safari" md="explore" />
        <NativeTabs.Trigger.Label>Explore</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="profile" disableAutomaticContentInsets>
        <NativeTabs.Trigger.Icon sf="person" md="person" />
        <NativeTabs.Trigger.Label>Profile</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
