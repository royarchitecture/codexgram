import { Image } from "expo-image";
import { router, useLocalSearchParams } from "expo-router";
import { type ComponentRef, type ReactNode, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { initialWindowMetrics, SafeAreaProvider, useSafeAreaInsets } from "react-native-safe-area-context";

import { DetailFrame, DetailHeader, MoreButton, Popup, PopupAction, ReplyBar } from "@/features/social/detail-ui";
import { detailRain, eliPosts, explorePosts, feed, mara, profilePosts, type Post, type PreviewComment } from "@/features/social/preview-data";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors, Duration, Icon } from "@/features/social/ui";

const previewPosts = new Map([...profilePosts, ...eliPosts, ...explorePosts].map((post) => [post.id, post]));
const coffee = feed.find(({ id }) => id === "coffee");

export default function PostDetailScreen() {
  const { id, from, back, menu, comments, commentMenu } = useLocalSearchParams<{
    id: string; from?: string; back?: string; menu?: string; comments?: string; commentMenu?: string;
  }>();
  const [showMenu, setShowMenu] = useState(menu === "1");
  const [showComments, setShowComments] = useState(comments === "1");
  const { blocked, isLiked, toggleLike, commentsFor, deletedPosts, deletePost } = usePreviewSocial();
  const post = previewPosts.get(id);
  const visiblePost = !deletedPosts.includes(id) && post && !blocked.includes(post.author.handle) ? post : null;
  const liked = isLiked(id);
  const entries = commentsFor(id);
  const feedPost = feed.find((item) => item.id === id);
  const likeCount = (feedPost?.likes ?? 0) + Number(liked) - Number(feedPost?.liked ?? false);
  const time = feedPost?.time;
  const sourceTab = from === "home" ? "/home" : from === "profile" ? "/profile" : undefined;
  const backLabel = from === "home" ? "Home" : from === "profile" || back === "profile" ? "Profile" : "Explore";
  const ownPost = post?.author.handle === mara.handle;

  function goBack() {
    if (!sourceTab) return;
    if (router.canGoBack()) router.back();
    router.navigate(sourceTab);
  }

  return (
    <DetailFrame tabs>
      <View className="flex-1">
        <DetailHeader title="Post" backLabel={backLabel} fallback={sourceTab ?? "/explore"} onBack={sourceTab ? goBack : undefined}
          action={visiblePost && <MoreButton label="Post options" onPress={() => setShowMenu(!showMenu)} />}
        />
        {visiblePost ? (
          <ScrollView contentContainerStyle={{ width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 22, paddingTop: 12, paddingBottom: 16 }}>
            <View className="mb-[10px] flex-row items-center gap-[10px]">
              <Pressable accessibilityRole="button" accessibilityLabel={visiblePost.author.name + "’s profile"}
                onPress={() => {
                  if (ownPost) router.navigate("/profile");
                  else router.push({ pathname: "/explore/user/[handle]", params: { handle: visiblePost.author.handle } });
                }}>
                <Avatar person={visiblePost.author} size={42} />
              </Pressable>
              <View className="flex-1">
                <Text className="text-[16px] font-extrabold leading-[20px] text-ink">{visiblePost.author.name}</Text>
                <Text className="text-[13px] leading-[17px] text-slate">@{visiblePost.author.handle}</Text>
              </View>
              {id === "coffee" && <MoreButton label="Post options" onPress={() => setShowMenu(!showMenu)} />}
            </View>
            <View className="overflow-hidden rounded-[16px]" style={{ aspectRatio: id === "coffee" ? 358 / 350 : 358 / 304 }}>
              <Image source={id === "rain" ? detailRain : id === "coffee" ? coffee?.image : visiblePost.image}
                style={{ width: "100%", height: "100%" }} />
              {visiblePost.duration && <>
                <Pressable accessibilityRole="button" accessibilityLabel="Play video" onPress={() => Alert.alert("Video preview", "This sample contains a cover image.")}
                  className="absolute inset-0 items-center justify-center">
                  <View className="h-[56px] w-[56px] items-center justify-center rounded-full border border-white/60 bg-black/[0.42]">
                    <Icon sf="play.fill" md="play_arrow" size={20} color="white" />
                  </View>
                </Pressable>
                <Duration value={visiblePost.duration} />
              </>}
            </View>
            <View className="mt-[5px] flex-row items-center gap-[15px]">
              <Pressable accessibilityRole="togglebutton" accessibilityLabel={liked ? "Unlike post" : "Like post"}
                accessibilityState={{ checked: liked }} onPress={() => toggleLike(id)} className="min-h-[34px] flex-row items-center gap-[7px]">
                <Icon sf={liked ? "heart.fill" : "heart"} md="favorite" size={19} color={liked ? colors.blue : colors.ink} />
                <Text className="text-[15px] font-bold text-ink">{likeCount}</Text>
              </Pressable>
              <Pressable accessibilityRole="button" accessibilityLabel={entries.length + " comments"}
                onPress={() => setShowComments(true)} className="min-h-[34px] flex-row items-center gap-[6px]">
                <Icon sf="ellipsis.bubble" md="chat_bubble" size={17} />
                <Text className="text-[15px] text-ink">{entries.length}</Text>
              </Pressable>
            </View>
            <Text className="mt-[1px] text-[15px] leading-[20px] text-ink">{visiblePost.caption}</Text>
            {time && <Text className="mb-[12px] mt-[3px] text-[13px] leading-[18px] text-slate">{time}</Text>}
            <View className="border-t border-[#E9E9E6] pt-[8px]">
              <View className="mb-[7px] min-h-[30px] flex-row items-center justify-between gap-2">
                <Text accessibilityRole="header" className="text-[17px] font-extrabold text-ink">Comments</Text>
                <Pressable accessibilityRole="button" onPress={() => setShowComments(true)}>
                  <Text className="text-[15px] font-bold text-cobalt">{entries.length ? "View all " + entries.length : "Add a comment"}</Text>
                </Pressable>
              </View>
              {entries.slice(0, 2).map((entry) => <CommentRow key={entry.id} entry={entry} onOptions={() => setShowComments(true)} />)}
            </View>
          </ScrollView>
        ) : <Text className="px-[22px] py-5 text-slate">This post is unavailable.</Text>}
        {visiblePost && showMenu && (
          <Popup onClose={() => setShowMenu(false)}>
            {ownPost && <PopupAction label="Delete post" destructive onPress={() => {
              setShowMenu(false);
              Alert.alert("Delete post?", "This removes the post from your preview.", [
                { text: "Cancel", style: "cancel" },
                { text: "Delete", style: "destructive", onPress: () => deletePost(id) },
              ]);
            }} />}
            {!ownPost && <PopupAction label="Report post" onPress={() => {
              setShowMenu(false);
              Alert.alert("Report post", "Reporting is unavailable in this preview.");
            }} />}
          </Popup>
        )}
        {visiblePost && showComments && <CommentsSheet post={visiblePost} showFirstMenu={commentMenu === "1"} onClose={() => setShowComments(false)} />}
      </View>
    </DetailFrame>
  );
}

function CommentRow({ entry, onOptions, menu }: { entry: PreviewComment; onOptions: () => void; menu?: ReactNode }) {
  return (
    <View className="mb-[12px] flex-row items-start gap-[10px]">
      <Avatar person={entry.author} size={34} />
      <View className="min-w-0 flex-1">
        <View className="flex-row flex-wrap items-baseline gap-x-[8px]">
          <Text className="text-[14px] font-extrabold leading-[19px] text-ink">@{entry.author.handle}</Text>
          <Text className="text-[12px] leading-[17px] text-slate">{entry.time}</Text>
        </View>
        <Text className="mt-[2px] text-[14px] leading-[19px] text-ink">{entry.body}</Text>
        {menu}
      </View>
      <Pressable accessibilityRole="button" accessibilityLabel={"Options for comment by " + entry.author.name}
        hitSlop={8} onPress={onOptions} className="min-h-[24px] justify-center">
        <Icon sf="ellipsis" md="more_horiz" size={15} color={colors.slate} />
      </Pressable>
    </View>
  );
}

function CommentsSheet({ post, showFirstMenu, onClose }: { post: Post; showFirstMenu: boolean; onClose: () => void }) {
  return (
    <Modal transparent animationType="fade" onRequestClose={onClose} statusBarTranslucent navigationBarTranslucent>
      <SafeAreaProvider initialMetrics={initialWindowMetrics}>
        <CommentsPanel post={post} showFirstMenu={showFirstMenu} onClose={onClose} />
      </SafeAreaProvider>
    </Modal>
  );
}

function CommentsPanel({ post, showFirstMenu, onClose }: { post: Post; showFirstMenu: boolean; onClose: () => void }) {
  const { height } = useWindowDimensions();
  const { bottom } = useSafeAreaInsets();
  const bottomPadding = Platform.OS === "ios" ? Math.max(bottom - 13, 0) : bottom;
  const { commentsFor, addComment, deleteComment } = usePreviewSocial();
  const comments = commentsFor(post.id);
  const [activeMenu, setActiveMenu] = useState(showFirstMenu ? comments[0]?.id : undefined);
  const [draft, setDraft] = useState("");
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const scrollAfterAdding = useRef(false);

  function submit() {
    const body = draft.trim();
    if (!body) return;
    scrollAfterAdding.current = true;
    addComment(post.id, body);
    setActiveMenu(undefined);
    setDraft("");
  }

  return (
    <KeyboardAvoidingView className="flex-1 justify-end bg-black/35" behavior={Platform.OS === "ios" ? "padding" : undefined}>
      <Pressable accessibilityLabel="Dismiss comments" accessibilityRole="button" onPress={onClose} className="flex-1" />
      <View className="overflow-hidden rounded-t-[23px] bg-white" style={{ height: Math.min(height * 0.488, 510), paddingBottom: bottomPadding }}>
        <View className="mb-[2px] mt-[7px] h-[4px] w-[37px] self-center rounded-full bg-[#D4D6D8]" />
        <View className="h-[49px] flex-row items-center justify-between px-[21px]">
          <Text accessibilityRole="header" className="text-[28px] font-extrabold tracking-[-0.7px] text-ink">Comments</Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Close comments" hitSlop={12} onPress={onClose} className="px-[7px]">
            <Icon sf="xmark" md="close" size={17} />
          </Pressable>
        </View>
        <ScrollView ref={list} keyboardShouldPersistTaps="handled"
          onContentSizeChange={() => {
            if (!scrollAfterAdding.current) return;
            scrollAfterAdding.current = false;
            list.current?.scrollToEnd({ animated: true });
          }}
          contentContainerStyle={{ paddingHorizontal: 21 }}
        >
          <View className="mb-[15px] flex-row items-center gap-[10px] rounded-[12px] bg-[#F2F3F7] p-[8px]">
            <Image source={post.image} style={{ width: 47, height: 47, borderRadius: 7 }} />
            <View className="min-w-0 flex-1">
              <Text className="text-[14px] font-extrabold text-ink">@{post.author.handle}</Text>
              <Text className="text-[14px] text-slate">{post.caption}</Text>
            </View>
          </View>
          {comments.map((entry) => {
            const own = entry.id.startsWith("local-") || entry.author.handle === mara.handle;
            return (
              <CommentRow key={entry.id} entry={entry} onOptions={() => setActiveMenu((open) => open === entry.id ? undefined : entry.id)}
                menu={activeMenu === entry.id && (
                  <View className="mt-[6px] self-start rounded-[9px] border border-[#E4E5E9] bg-white">
                    <PopupAction compact label={own ? "Delete comment" : "Report comment"} destructive={own} onPress={() => {
                      setActiveMenu(undefined);
                      if (own) deleteComment(post.id, entry.id);
                      else Alert.alert("Report comment", "Reporting is unavailable in this preview.");
                    }} />
                  </View>
                )}
              />
            );
          })}
        </ScrollView>
        <ReplyBar placeholder="Add a comment" value={draft} onChange={setDraft} onSend={submit} />
      </View>
    </KeyboardAvoidingView>
  );
}
