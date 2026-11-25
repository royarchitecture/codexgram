import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { ScrollView, Text, TextInput, View } from "react-native";

import { BackLink, BlueButton, DetailFrame } from "@/features/social/detail-ui";
import { people } from "@/features/social/preview-data";
import { usePreviewSocial } from "@/features/social/social-state";
import { Icon } from "@/features/social/ui";

export default function ChooseUsernameScreen() {
  const { sample, from } = useLocalSearchParams<{ sample?: string; from?: string }>();
  const returnTo = from === "home" ? "/home" : from === "profile" ? "/profile" : "/explore";
  const { username, saveUsername } = usePreviewSocial();
  const [draft, setDraft] = useState(username ?? (sample === "1" ? "marachen" : ""));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(false);
  const handle = draft.trim().toLowerCase();
  const valid = /^[a-z0-9_]{3,24}$/.test(handle);
  const taken = people.some((person) => person.handle !== "marachen" && person.handle === handle);
  const available = valid && !taken;

  async function continueWithUsername() {
    if (!available || saving) return;
    setSaving(true);
    setError(false);
    try {
      await saveUsername(handle);
      router.dismissTo(returnTo);
    } catch {
      setError(true);
    } finally {
      setSaving(false);
    }
  }

  return (
    <DetailFrame>
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 22, paddingBottom: 24 }}
      >
        <View className="-ml-[4px]"><BackLink fallback={returnTo} /></View>
        <View className="mt-[40px] h-[56px] w-[56px] items-center justify-center rounded-[14px] bg-[#3455DB]">
          <Icon sf="viewfinder" md="center_focus_strong" size={30} color="white" />
          <View className="absolute h-[11px] w-[11px] rounded-full border-[2px] border-white" />
        </View>
        <Text accessibilityRole="header" className="mt-[20px] text-[45px] font-extrabold leading-[46px] tracking-[-2px] text-ink">
          {"Choose your\nusername"}
        </Text>
        <Text className="mb-[5px] mt-[25px] text-[15px] font-bold text-ink">Username</Text>
        <View className="min-h-[54px] flex-row items-center gap-[8px] rounded-[12px] border border-[#8294FF] px-[13px]">
          <Text className="text-[16px] text-slate">@</Text>
          <TextInput accessibilityLabel="Username" value={draft} onChangeText={setDraft} autoCorrect={false}
            autoCapitalize="none" maxLength={24} returnKeyType="go" onSubmitEditing={() => void continueWithUsername()}
            className="min-h-[50px] flex-1 text-[16px] text-ink"
          />
        </View>
        {handle !== "" && (
          <View className="mt-[10px] flex-row items-center gap-[7px]">
            {available && <Icon sf="checkmark" md="check" size={16} color="#176347" />}
            <Text accessibilityLiveRegion="polite" className={"text-[14px] font-bold " + (available ? "text-[#176347]" : "text-[#9D2938]")}>
              {available ? "@" + handle + " is available" : taken ? "That username is taken." : "Use 3–24 letters, numbers, or underscores."}
            </Text>
          </View>
        )}
        <Text className="mb-[21px] mt-[15px] text-[14px] leading-[20px] text-slate">
          Your username is permanent. Uppercase and lowercase letters count as the same username.
        </Text>
        <BlueButton label={saving ? "Saving…" : "Continue"} disabled={!available || saving} onPress={() => void continueWithUsername()} />
        {error && <Text accessibilityRole="alert" className="mt-2 text-[#9D2938]">Couldn’t save your username. Try again.</Text>}
      </ScrollView>
    </DetailFrame>
  );
}
