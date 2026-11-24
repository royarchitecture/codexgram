import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { mara, profilePosts, type Post } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";
import { Avatar, colors, Icon, Page, PageHeading, PhotoGrid, PostSheet, Sheet } from "@/features/social/ui";

const initialProfile = { name: mara.name, bio: "Coastlines, quiet mornings, photographs." };
const stats = [
  { label: "Posts", count: profilePosts.length },
  { label: "Followers", count: 86 },
  { label: "Following", count: 41 },
];

export default function ProfileScreen() {
  const { isSignedIn, signOut } = usePreviewAccount();
  const [profile, setProfile] = useState(initialProfile);
  const [draft, setDraft] = useState(initialProfile);
  const [section, setSection] = useState<"Posts" | "Submissions">("Posts");
  const [sheet, setSheet] = useState<"edit" | "settings" | null>(null);
  const [post, setPost] = useState<Post | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [signOutError, setSignOutError] = useState(false);

  function saveProfile() {
    const name = draft.name.trim();
    if (!name) return;
    setProfile({ name, bio: draft.bio.trim() });
    setSheet(null);
  }

  async function handleSignOut() {
    if (!signOut || signingOut) return;
    setSigningOut(true);
    setSignOutError(false);
    try {
      await signOut();
      setSheet(null);
    } catch {
      setSignOutError(true);
    } finally {
      setSigningOut(false);
    }
  }

  return (
    <Page paper>
      <View className="px-[22px]">
        <PageHeading title="My profile" />
        <View className="mt-[18px] flex-row items-center gap-[15px]">
          <Avatar person={mara} size={77} />
          <View className="shrink">
            <Text className="text-[27px] font-extrabold leading-[33px] tracking-[-0.75px] text-ink">{profile.name}</Text>
            <Text className="mt-[2px] text-[15px] leading-[20px] text-slate">@{mara.handle}</Text>
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
            onPress={() => { setDraft(profile); setSheet("edit"); }}
            className="min-h-[44px] flex-1 flex-row items-center justify-center gap-[8px] rounded-full bg-[#EDF0FF] px-2 active:opacity-70"
          >
            <Icon sf="pencil" md="edit" size={15} color={colors.cobalt} />
            <Text className="shrink text-[15px] font-bold text-[#2846C9]">Edit profile</Text>
          </Pressable>
          <Pressable accessibilityRole="button" onPress={() => setSheet("settings")} className="min-h-[44px] flex-1 flex-row items-center justify-center gap-[8px] rounded-full border border-[#E1E1DB] bg-white px-2 active:opacity-70">
            <Icon sf="gearshape" md="settings" size={16} />
            <Text className="shrink text-[15px] font-bold text-ink">Settings</Text>
          </Pressable>
        </View>
        <View className="mt-[16px] min-h-[42px] flex-row rounded-[11px] bg-[#EEEFEE] p-[3px]">
          {(["Posts", "Submissions"] as const).map((label) => {
            const active = section === label;
            return (
              <Pressable key={label} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => setSection(label)}
                className={"min-h-[36px] flex-1 items-center justify-center rounded-[8px] px-2 " + (active ? "border border-[#E1E1DB] bg-white" : "")}
              >
                <Text className={"text-[14px] font-bold " + (active ? "text-ink" : "text-[#515A6B]")}>{label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-[10.5px]">
          {section === "Posts" ? <PhotoGrid posts={profilePosts} ratio={116 / 138} onSelect={setPost} /> : (
            <Text className="py-4 text-center text-[15px] text-slate">No submissions yet.</Text>
          )}
        </View>
      </View>
      {post && <PostSheet post={post} onClose={() => setPost(null)} />}
      {sheet === "edit" && (
        <Sheet title="Edit profile" onClose={() => setSheet(null)}>
          <View className="gap-[10px] px-[22px] pt-[14px]">
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
          </View>
        </Sheet>
      )}
      {sheet === "settings" && (
        <Sheet title="Settings" onClose={() => setSheet(null)}>
          <View className="gap-2 px-[22px] py-[14px]">
            <Pressable accessibilityRole="button" disabled={signingOut} className="min-h-[44px] justify-center self-start px-2"
              onPress={() => {
                if (isSignedIn) void handleSignOut();
                else {
                  setSheet(null);
                  router.push({ pathname: "/sign-in", params: { from: "profile" } });
                }
              }}
            >
              <Text className="font-bold text-cobalt">{signingOut ? "Signing out…" : isSignedIn ? "Sign out" : "Sign in"}</Text>
            </Pressable>
            {signOutError && <Text accessibilityRole="alert" className="text-[#9D2938]">Couldn’t sign out. Try again.</Text>}
          </View>
        </Sheet>
      )}
    </Page>
  );
}
