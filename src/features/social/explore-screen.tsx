import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

import { explorePosts, type Post } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";
import { Avatar, colors, Icon, Page, PageHeading, PhotoGrid, PostSheet } from "@/features/social/ui";

const people = [...new Map(explorePosts.map(({ author }) => [author.handle, author])).values()];

export default function ExploreScreen() {
  const { isSignedIn } = usePreviewAccount();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Post | null>(null);
  const query = search.trim().toLowerCase().replace(/^@/, "");
  const matches = query
    ? people.filter(({ name, handle }) => name.toLowerCase().includes(query) || handle.includes(query))
    : [];

  return (
    <Page paper keyboard>
      <View className="px-[22px]">
        <PageHeading
          title="Explore"
          action={!isSignedIn && (
            <Pressable accessibilityRole="button" onPress={() => router.push("/sign-in")} className="min-h-[44px] justify-center rounded-full bg-[#EDF0FF] px-[19px] active:opacity-70">
              <Text className="text-[15px] font-bold text-[#2846C9]">Sign in</Text>
            </Pressable>
          )}
        />
        <View className="mt-[16px] min-h-[46px] flex-row items-center gap-[10px] rounded-[12px] bg-[#EEEFEE] px-[14px]">
          <Icon sf="magnifyingglass" md="search" size={15} color={colors.slate} />
          <TextInput
            accessibilityLabel="Search usernames"
            placeholder="Search usernames"
            placeholderTextColor={colors.slate}
            autoCapitalize="none"
            autoCorrect={false}
            returnKeyType="search"
            clearButtonMode="while-editing"
            className="min-h-[46px] flex-1 py-0 text-[16px] text-ink"
            value={search}
            onChangeText={setSearch}
          />
        </View>
        <Text accessibilityRole="header" className="mt-[17px] text-[17px] font-bold leading-[23px] tracking-[-0.25px] text-ink">
          {query ? "Accounts" : "Recent posts"}
        </Text>
        <View className="mt-[7.33px]">
          {query ? matches.length ? matches.map((person) => (
            <Pressable
              key={person.handle}
              accessibilityRole="button"
              onPress={() => setSelected(explorePosts.find(({ author }) => author.handle === person.handle) ?? null)}
              className="min-h-[58px] flex-row items-center gap-[10px] border-b border-[#E1E1DB] py-[8px]"
            >
              <Avatar person={person} size={38} />
              <View className="flex-1">
                <Text className="font-bold text-ink">{person.name}</Text>
                <Text className="text-slate">@{person.handle}</Text>
              </View>
              <Icon sf="chevron.right" md="chevron_right" color={colors.slate} size={15} />
            </Pressable>
          )) : <Text className="py-4 text-[15px] text-slate">No accounts found.</Text> : (
            <PhotoGrid posts={explorePosts} ratio={116 / 133} onSelect={setSelected} />
          )}
        </View>
      </View>
      {selected && <PostSheet post={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}
