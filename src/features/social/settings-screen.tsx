import { router, useLocalSearchParams } from "expo-router";
import { type PropsWithChildren, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { BackLink, DetailFrame } from "@/features/social/detail-ui";
import { people } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";
import { usePreviewSocial } from "@/features/social/social-state";
import { colors, Icon, Sheet } from "@/features/social/ui";

export default function SettingsScreen() {
  const { sample } = useLocalSearchParams<{ sample?: string }>();
  const { isSignedIn, signOut } = usePreviewAccount();
  const { blocked, toggleBlock, submissions } = usePreviewSocial();
  const [panel, setPanel] = useState<"Blocked accounts" | "Review queue" | null>(null);
  const [signingOut, setSigningOut] = useState(false);

  async function endSession() {
    if (!signOut || signingOut) return;
    setSigningOut(true);
    try {
      await signOut();
      router.dismissTo("/profile");
    } catch {
      Alert.alert("Couldn’t sign out", "Try again.");
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <DetailFrame paper>
      <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingBottom: 24, width: "100%", maxWidth: 520, alignSelf: "center" }}>
        <View className="-ml-[4px]"><BackLink label="Profile" fallback="/profile" /></View>
        <Text accessibilityRole="header" className="mb-[15px] mt-[12px] text-[36px] font-extrabold leading-[43px] tracking-[-1.5px] text-ink">Settings</Text>
        <Group title="Account">
          <Row label="Blocked accounts" sf="nosign" md="block" onPress={() => setPanel("Blocked accounts")} />
          <Row label={signingOut ? "Signing out…" : isSignedIn || sample === "1" ? "Sign out" : "Sign in"} sf="rectangle.portrait.and.arrow.right" md="logout" divider arrow={false} onPress={() => {
            if (isSignedIn) void endSession();
            else if (sample === "1") router.dismissTo("/profile");
            else router.push({ pathname: "/sign-in", params: { from: "profile" } });
          }} />
        </Group>
        <Group title="Help and privacy">
          <Row label="Support" sf="questionmark.circle" md="help" onPress={() => Alert.alert("Support", "Support contact details haven’t been set up for this preview.")} />
          <Row label="Privacy policy" sf="lock" md="lock" divider onPress={() => Alert.alert("Privacy policy", "The privacy policy hasn’t been published for this preview.")} />
        </Group>
        <Group title="Moderation">
          <Row label="Review queue" sf="checkmark.shield" md="verified_user" onPress={() => setPanel("Review queue")} />
        </Group>
        <Group title="Delete your account" destructive>
          <Row label="Delete account" sf="trash" md="delete" destructive arrow={false} onPress={() => Alert.alert("Delete account", "Account deletion is unavailable in this preview.")} />
        </Group>
      </ScrollView>
      {panel && (
        <Sheet title={panel} onClose={() => setPanel(null)}>
          <ScrollView contentContainerStyle={{ padding: 22, gap: 12 }}>
            {panel === "Blocked accounts"
              ? blocked.length ? blocked.map((handle) => (
                <Pressable accessibilityRole="button" key={handle} onPress={() => toggleBlock(handle)}>
                  <Text className="text-[16px] text-ink">{people.find((person) => person.handle === handle)?.name ?? handle} · Unblock</Text>
                </Pressable>
              )) : <Text className="text-slate">No blocked accounts.</Text>
              : submissions.length ? submissions.map(({ id, caption }) => (
                <Text key={id} className="text-[16px] text-ink">{caption || "Untitled submission"} · Pending review</Text>
              )) : <Text className="text-slate">No pending submissions.</Text>}
          </ScrollView>
        </Sheet>
      )}
    </DetailFrame>
  );
}

function Group({ title, destructive, children }: PropsWithChildren<{ title: string; destructive?: boolean }>) {
  return (
    <View className={"mb-[21px] gap-[6px] " + (destructive ? "mt-[8px]" : "")}>
      <Text className="ml-[3px] text-[13px] font-bold text-slate">{title}</Text>
      <View className={"overflow-hidden rounded-[13px] border bg-white " + (destructive ? "border-[#EBCDD2]" : "border-[#E7E5E1]")}>{children}</View>
    </View>
  );
}

function Row({ label, sf, md, onPress, divider, arrow = true, destructive }: {
  label: string;
  sf: Parameters<typeof Icon>[0]["sf"];
  md: Parameters<typeof Icon>[0]["md"];
  onPress: () => void;
  divider?: boolean;
  arrow?: boolean;
  destructive?: boolean;
}) {
  const tint = destructive ? "#9D2938" : colors.ink;
  return (
    <Pressable accessibilityRole="button" onPress={onPress} className={"min-h-[49px] flex-row items-center gap-[10px] px-[14px] active:bg-[#F2F3F7] " + (divider ? "border-t border-[#E9E9E6]" : "")}>
      <Icon sf={sf} md={md} color={tint} size={16} />
      <Text className="flex-1 text-[15px] font-semibold" style={{ color: tint }}>{label}</Text>
      {arrow && <Icon sf="chevron.right" md="chevron_right" size={13} color={colors.slate} />}
    </Pressable>
  );
}
