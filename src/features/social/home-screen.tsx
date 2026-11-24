import { Image } from "expo-image";
import { router } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, Text, View } from "react-native";

import { feed, type Post } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";
import { Avatar, colors, Duration, Icon, Page, PostSheet } from "@/features/social/ui";

export default function HomeScreen() {
  const { isSignedIn } = usePreviewAccount();
  const [selected, setSelected] = useState<Post | null>(null);
  const [likes, setLikes] = useState<Record<string, boolean>>({});

  function createPost() {
    if (!isSignedIn) {
      router.push({ pathname: "/sign-in", params: { from: "home" } });
      return;
    }
    Alert.alert("Create post", "Photo and video uploads will be available when the feed is connected.");
  }

  return (
    <Page>
      <View className="min-h-[50px] flex-row items-center justify-between gap-3 border-b border-[#E9E9E6] px-[20px] pb-[6px]">
        <View className="shrink flex-row items-center gap-[9px]">
          <View className="h-[31px] w-[31px] items-center justify-center rounded-[8px] bg-[#3355DB]">
            <View className="absolute h-[6px] w-[6px] rounded-full border-[1.4px] border-white" />
            <Icon sf="viewfinder" md="center_focus_strong" size={18} color="white" />
          </View>
          <Text accessibilityRole="header" className="shrink text-[30px] font-extrabold leading-[36px] tracking-[-1.7px] text-ink">Codexgram</Text>
        </View>
        <Pressable accessibilityRole="button" onPress={createPost} className="min-h-[44px] flex-row items-center gap-[6px] rounded-full bg-[#3355DB] px-[14px] active:opacity-75">
          <Icon sf="plus" md="add" size={13} color="white" />
          <Text className="text-[15px] font-bold text-white">Create</Text>
        </Pressable>
      </View>

      {feed.map((post) => {
        const liked = likes[post.id] ?? post.liked;
        const likeCount = post.likes + Number(liked) - Number(post.liked);

        return (
          <View key={post.id} className="border-b border-[#E9E9E6] px-[20px] pb-[14px] pt-[12px]">
            <View className="mb-[10px] flex-row items-center gap-[10px]">
              <Avatar person={post.author} size={42} />
              <View className="flex-1">
                <Text className="text-[17px] font-bold leading-[21px] text-ink">{post.author.name}</Text>
                <Text className="text-[14px] leading-[18px] text-slate">@{post.author.handle}</Text>
              </View>
              <Pressable
                accessibilityRole="button"
                accessibilityLabel={"Options for " + post.caption}
                hitSlop={8}
                onPress={() => setSelected(post)}
                className="h-[36px] w-[26px] items-end justify-center"
              >
                <Icon sf="ellipsis" md="more_horiz" size={18} color={colors.slate} />
              </Pressable>
            </View>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={post.caption}
              onPress={() => setSelected(post)}
              className={post.duration ? "overflow-hidden rounded-t-[18px]" : "overflow-hidden rounded-[18px]"}
            >
              <Image source={post.image} style={{ width: "100%", aspectRatio: post.aspect }} />
              {post.duration && <Duration value={post.duration} top />}
            </Pressable>
            <View className="mt-[7px] flex-row items-center gap-[15px]">
              <Pressable
                accessibilityRole="togglebutton"
                accessibilityLabel={liked ? "Unlike post" : "Like post"}
                accessibilityState={{ checked: liked }}
                onPress={() => setLikes((current) => ({ ...current, [post.id]: !(current[post.id] ?? post.liked) }))}
                className="min-h-[34px] flex-row items-center gap-[7px] px-[2px]"
              >
                <Icon sf={liked ? "heart.fill" : "heart"} md="favorite" size={18} color={liked ? colors.blue : colors.ink} />
                <Text className="text-[15px] font-bold text-ink">{likeCount}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={post.comments + " comments"} onPress={() => setSelected(post)} className="min-h-[34px] flex-row items-center gap-[8px]">
                <Icon sf="ellipsis.bubble" md="chat_bubble" size={18} />
                <Text className="text-[15px] text-ink">{post.comments}</Text>
              </Pressable>
            </View>
            <Text className="mt-[3px] text-[16px] leading-[21px] text-ink">{post.caption}</Text>
            <Text className="mt-[3.5px] text-[13px] leading-[17px] text-slate">{post.time}</Text>
          </View>
        );
      })}
      {selected && <PostSheet post={selected} onClose={() => setSelected(null)} />}
    </Page>
  );
}
