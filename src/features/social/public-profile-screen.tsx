import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

import { DetailFrame, DetailHeader, MoreButton, Popup, PopupAction } from "@/features/social/detail-ui";
import { eli, eliPosts, explorePosts, people } from "@/features/social/preview-data";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors, Icon, PhotoGrid } from "@/features/social/ui";

export default function PublicProfileScreen() {
  const { handle, menu } = useLocalSearchParams<{ handle: string; menu?: string }>();
  const [showMenu, setShowMenu] = useState(menu === "1");
  const { blocked, follows, toggleBlock, toggleFollow, deletedPosts } = usePreviewSocial();
  const person = people.find((account) => account.handle === handle);
  const following = follows.includes(handle);
  const isBlocked = blocked.includes(handle);
  const isEli = handle === eli.handle;
  const posts = (isEli ? eliPosts : explorePosts.filter(({ author }) => author.handle === handle)).filter(({ id }) => !deletedPosts.includes(id));

  return (
    <DetailFrame tabs>
      <View className="flex-1">
        <DetailHeader title={person ? "@" + person.handle : "Profile"} backLabel="Explore"
          action={person && <MoreButton label="Profile options" onPress={() => setShowMenu(!showMenu)} />}
        />
        {person ? (
          <ScrollView contentContainerStyle={{ paddingHorizontal: 22, paddingTop: 15, paddingBottom: 20, width: "100%", maxWidth: 520, alignSelf: "center" }}>
            <View className="flex-row items-center gap-[14px]">
              <Avatar person={person} size={77} />
              <View className="flex-1">
                <Text className="text-[27px] font-extrabold leading-[33px] tracking-[-0.75px] text-ink">{person.name}</Text>
                <Text className="mt-[2px] text-[15px] leading-[20px] text-slate">@{person.handle}</Text>
              </View>
            </View>
            {isEli && <Text className="mt-[13px] text-[16px] leading-[22px] text-ink">Coffee, good light, and the long way home.</Text>}
            {isBlocked ? <Text className="mt-5 text-slate">You blocked this account.</Text> : (
              <>
                <View className="mt-[12px] min-h-[67px] flex-row items-center border-y border-[#E9E9E6]">
                  {[
                    { label: "Posts", count: posts.length },
                    { label: "Followers", count: (isEli ? 127 : 0) + Number(following) },
                    { label: "Following", count: isEli ? 74 : 0 },
                  ].map(({ label, count }, index) => (
                    <View key={label} className={"flex-1 items-center " + (index ? "border-l border-[#E9E9E6]" : "")}>
                      <Text className="text-[21px] font-extrabold leading-[26px] text-ink">{count}</Text>
                      <Text className="text-[13px] font-semibold leading-[17px] text-slate">{label}</Text>
                    </View>
                  ))}
                </View>
                <View className="mb-[17px] mt-[13px] flex-row gap-[8px]">
                  <Pressable accessibilityRole="togglebutton" accessibilityState={{ checked: following }} onPress={() => toggleFollow(handle)}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-full border border-[#E1E1DB] px-2 active:opacity-70">
                    {following && <Icon sf="checkmark" md="check" size={14} />}
                    <Text className="text-[15px] font-bold text-ink">{following ? "Following" : "Follow"}</Text>
                  </Pressable>
                  <Pressable accessibilityRole="button" onPress={() => router.push({ pathname: "/direct-message", params: { handle, from: "explore" } })}
                    className="min-h-[44px] flex-1 flex-row items-center justify-center gap-2 rounded-full bg-[#EDF0FF] px-2 active:opacity-70">
                    <Icon sf="ellipsis.bubble" md="chat_bubble" size={15} color={colors.cobalt} />
                    <Text className="text-[15px] font-bold text-cobalt">Message</Text>
                  </Pressable>
                </View>
                {posts.length ? <PhotoGrid posts={posts} ratio={116 / 138} onSelect={({ id }) => {
                  router.push({ pathname: "/explore/post/[id]", params: { id, back: "profile" } });
                }} /> : <Text className="py-4 text-center text-slate">No posts yet.</Text>}
              </>
            )}
          </ScrollView>
        ) : <Text className="px-[22px] py-5 text-slate">This profile could not be found.</Text>}
        {person && showMenu && (
          <Popup onClose={() => setShowMenu(false)}>
            <PopupAction label="Report" onPress={() => { setShowMenu(false); Alert.alert("Report profile", "Reporting is unavailable in this preview."); }} />
            <View className="border-t border-[#E9E9E6]">
              <PopupAction label={isBlocked ? "Unblock" : "Block"} destructive onPress={() => { toggleBlock(handle); setShowMenu(false); }} />
            </View>
          </Popup>
        )}
      </View>
    </DetailFrame>
  );
}
