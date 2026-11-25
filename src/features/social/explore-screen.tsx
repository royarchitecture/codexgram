import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Keyboard, Pressable, Text, TextInput, View } from "react-native";

import { explorePosts, people } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors, Icon, Page, PageHeading, PhotoGrid } from "@/features/social/ui";

export default function ExploreScreen() {
  const { q } = useLocalSearchParams<{ q?: string }>();
  return <ExploreContent key={q ?? ""} initialQuery={q} />;
}

function ExploreContent({ initialQuery }: { initialQuery?: string }) {
  const { isSignedIn } = usePreviewAccount();
  const { blocked, deletedPosts } = usePreviewSocial();
  const [search, setSearch] = useState(initialQuery ?? "");
  const [active, setActive] = useState(initialQuery !== undefined);
  const query = search.trim().toLowerCase().replace(/^@/, "");
  const matches = people.filter(({ name, handle }) =>
    query && !blocked.includes(handle) && (name.toLowerCase().includes(query) || handle.includes(query))
  );

  function cancelSearch() {
    Keyboard.dismiss();
    setSearch("");
    setActive(false);
  }

  return (
    <Page paper={!active} keyboard>
      <View className="px-[22px]">
        <PageHeading
          title="Explore"
          action={!active && !isSignedIn && (
            <Pressable accessibilityRole="button" onPress={() => router.push("/sign-in")} className="min-h-[44px] justify-center rounded-full bg-[#EDF0FF] px-[19px] active:opacity-70">
              <Text className="text-[15px] font-bold text-[#2846C9]">Sign in</Text>
            </Pressable>
          )}
        />
        <View className="mt-[16px] flex-row items-center gap-[13px]">
          <View className="min-h-[46px] flex-1 flex-row items-center gap-[10px] rounded-[12px] bg-[#EEEFEE] px-[14px]">
            <Icon sf="magnifyingglass" md="search" size={15} color={colors.slate} />
            <TextInput accessibilityLabel="Search usernames" placeholder="Search usernames" placeholderTextColor={colors.slate}
              autoCapitalize="none" autoCorrect={false} returnKeyType="search" onFocus={() => setActive(true)}
              className="min-h-[46px] flex-1 py-0 text-[16px] text-ink" value={search} onChangeText={setSearch}
            />
            {!!search && (
              <Pressable accessibilityRole="button" accessibilityLabel="Clear search" hitSlop={8} onPress={() => setSearch("")}>
                <Icon sf="xmark.circle" md="cancel" size={14} color={colors.slate} />
              </Pressable>
            )}
          </View>
          {active && (
            <Pressable accessibilityRole="button" onPress={cancelSearch} className="min-h-[44px] justify-center active:opacity-65">
              <Text className="text-[15px] font-bold text-cobalt">Cancel</Text>
            </Pressable>
          )}
        </View>
        <Text accessibilityRole="header" className="mt-[17px] text-[17px] font-bold leading-[23px] tracking-[-0.25px] text-ink">
          {active ? "Accounts" : "Recent posts"}
        </Text>
        <View className={active ? "" : "mt-[7.33px]"}>
          {active ? matches.length ? matches.map((person) => (
            <Pressable key={person.handle} accessibilityRole="button"
              onPress={() => router.push({ pathname: "/explore/user/[handle]", params: { handle: person.handle } })}
              className="min-h-[69px] flex-row items-center gap-[11px] border-b border-[#E9E9E6] py-[8px] pr-[3px] active:opacity-70"
            >
              <Avatar person={person} size={48} />
              <View className="flex-1 gap-[2px]">
                <Text className="text-[16px] font-bold text-ink">{person.name}</Text>
                <Text className="text-[13px] text-slate">@{person.handle}</Text>
              </View>
              <Icon sf="chevron.right" md="chevron_right" color={colors.slate} size={13} />
            </Pressable>
          )) : <Text className="py-4 text-[15px] text-slate">{query ? "No accounts found." : "Search for a username or name."}</Text> : (
            <PhotoGrid posts={explorePosts.filter(({ author, id }) => !blocked.includes(author.handle) && !deletedPosts.includes(id))} ratio={116 / 133}
              onSelect={({ id }) => router.push({ pathname: "/explore/post/[id]", params: { id } })}
            />
          )}
        </View>
      </View>
    </Page>
  );
}
