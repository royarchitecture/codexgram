import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { mara, profilePosts } from "@/features/social/preview-data";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors, Icon, Page, PageHeading, PhotoGrid, Sheet } from "@/features/social/ui";

const initialProfile = { name: mara.name, bio: "Coastlines, quiet mornings, photographs." };

export default function ProfileScreen() {
  const { username, submissions, deletedPosts } = usePreviewSocial();
  const params = useLocalSearchParams<{ section?: string }>();
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [selectedSection, setSection] = useState<"Posts" | "Submissions">("Posts");
  const section = params.section === "submissions" ? "Submissions" : selectedSection;
  const [editing, setEditing] = useState(false);
  const posts = profilePosts.filter(({ id }) => !deletedPosts.includes(id));
  const stats = [
    { label: "Posts", count: posts.length },
    { label: "Followers", count: 86 },
    { label: "Following", count: 41 },
  ];

  function saveProfile() {
    const name = draft.name.trim();
    if (!name) return;
    setProfile({ name, bio: draft.bio.trim() });
    setEditing(false);
  }

  return (
    <Page paper>
      <View className="px-[22px]">
        <PageHeading title="My profile" />
        <View className="mt-[18px] flex-row items-center gap-[15px]">
          <Avatar person={mara} size={77} />
          <View className="shrink">
            <Text className="text-[27px] font-extrabold leading-[33px] tracking-[-0.75px] text-ink">{profile.name}</Text>
            <Text className="mt-[2px] text-[15px] leading-[20px] text-slate">@{username ?? mara.handle}</Text>
          </View>
        </View>
        <Text className="mt-[14px] text-[16px] leading-[22px] text-ink">{profile.bio}</Text>
        <View className="mt-[12px] min-h-[66px] flex-row items-center border-y border-[#E1E1DB] py-[10px]">
          {stats.map(({ label, count }, index) => (
            <View key={label} className={"flex-1 items-center px-1 " + (index > 0 ? "border-l border-[#E1E1DB]" : "")}>
              <Text className="text-[21px] font-extrabold leading-[26px] text-ink">{count}</Text>
              <Text className="mt-[2px] text-center text-[13px] font-semibold leading-[16px] text-slate">{label}</Text>
            </View>
          ))}
        </View>
        <View className="mt-[13px] flex-row gap-[8px]">
          <Pressable
            accessibilityRole="button"
            onPress={() => { setDraft(profile); setEditing(true); }}
            className="min-h-[44px] flex-1 flex-row items-center justify-center gap-[8px] rounded-full bg-[#EDF0FF] px-2 active:opacity-70"
          >
            <Icon sf="pencil" md="edit" size={15} color={colors.cobalt} />
            <Text className="shrink text-[15px] font-bold text-[#2846C9]">Edit profile</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => router.push("/settings")} className="min-h-[44px] flex-1 flex-row items-center justify-center gap-[8px] rounded-full border border-[#E1E1DB] bg-white px-2 active:opacity-70">
            <Icon sf="gearshape" md="settings" size={16} />
            <Text className="shrink text-[15px] font-bold text-ink">Settings</Text>
          </Pressable>
        </View>
        <View className="mt-[16px] min-h-[42px] flex-row rounded-[11px] bg-[#EEEFEE] p-[3px]">
          {(["Posts", "Submissions"] as const).map((label) => {
            const active = section === label;
            return (
              <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => { setSection(label); router.setParams({ section: undefined }); }}
                className={"min-h-[36px] flex-1 items-center justify-center rounded-[8px] px-2 " + (active ? "border border-[#E1E1DB] bg-white" : "")}
              >
                <Text className={"text-[14px] font-bold " + (active ? "text-ink" : "text-[#515A6B]")}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-[10.5px]">
          {section === "Posts" ? (
            <PhotoGrid posts={posts} ratio={116 / 138} onSelect={({ id }) => {
              router.push({ pathname: "/explore/post/[id]", params: { id, from: "profile" } });
            }} />
          ) : submissions.length ? submissions.map(({ id, caption, image }) => (
            <View key={id} className="flex-row items-center gap-3 border-b border-[#E9E9E6] py-3">
              {image ? <Image source={image} style={{ width: 48, height: 48, borderRadius: 8 }} /> : (
                <Icon sf="film" md="movie" size={28} color={colors.slate} />
              )}
              <View className="flex-1">
                <Text className="text-[15px] font-bold text-ink">{caption || "Untitled submission"}</Text>
                <Text className="text-[13px] text-slate">Pending review</Text>
              </View>
            </View>
          )) : <Text className="py-4 text-center text-[15px] text-slate">No submissions yet.</Text>}
        </View>
      </View>
      {editing && (
        <Sheet title="Edit profile" onClose={() => setEditing(false)}>
          <ScrollView
            className="flex-1"
            contentContainerStyle={{ gap: 10, paddingHorizontal: 22, paddingTop: 14, paddingBottom: 16 }}
            automaticallyAdjustKeyboardInsets
            keyboardShouldPersistTaps="handled"
          >
            <Text className="font-semibold text-ink">Display name</Text>
            <TextInput accessibilityLabel="Display name" maxLength={40} value={draft.name}
              onChangeText={(name) => setDraft((current) => ({ ...current, name }))}
              className="min-h-[44px] rounded-xl bg-[#EEEFEE] px-3 text-[16px] text-ink"
            />
            <Text className="font-semibold text-ink">Bio</Text>
            <TextInput accessibilityLabel="Bio" maxLength={160} multiline value={draft.bio}
              onChangeText={(bio) => setDraft((current) => ({ ...current, bio }))}
              className="min-h-[78px] rounded-xl bg-[#EEEFEE] p-3 text-[16px] text-ink"
            />
            <Pressable accessibilityRole="button" disabled={!draft.name.trim()} onPress={saveProfile} className="min-h-[44px] justify-center self-start px-2 disabled:opacity-40">
              <Text className="font-bold text-cobalt">Save changes</Text>
            </Pressable>
          </ScrollView>
        </Sheet>
      )}
    </Page>
  );
}
