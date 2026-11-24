import { Image } from "expo-image";
import { type AndroidSymbol, type SFSymbol, SymbolView } from "expo-symbols";
import type { PropsWithChildren, ReactNode } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView as ScreenSafeAreaView } from "react-native-screens/experimental";

import type { Person, Post } from "@/features/social/preview-data";

export const colors = {
  ink: "#191B22",
  slate: "#5E6472",
  cobalt: "#2846C9",
  blue: "#3355DB",
  paper: "#FAF9F6",
  white: "#FFFFFF",
};

export function Icon({ sf, md, size = 19, color = colors.ink }: {
  sf: SFSymbol;
  md: AndroidSymbol;
  size?: number;
  color?: string;
}) {
  return <SymbolView name={{ ios: sf, android: md, web: md }} size={size} tintColor={color} weight="medium" />;
}

export function Page({ children, paper = false, keyboard = false }: PropsWithChildren<{ paper?: boolean; keyboard?: boolean }>) {
  const { top } = useSafeAreaInsets();
  return (
    <ScreenSafeAreaView
      edges={{ bottom: true, left: true, right: true }}
      style={{ flex: 1, paddingTop: Math.floor(top), backgroundColor: paper ? colors.paper : colors.white }}
    >
      <ScrollView
        contentInsetAdjustmentBehavior="never"
        contentContainerStyle={styles.pageContent}
        keyboardShouldPersistTaps={keyboard ? "handled" : "never"}
        showsVerticalScrollIndicator={false}
      >
        {children}
      </ScrollView>
    </ScreenSafeAreaView>
  );
}

export function PageHeading({ title, action }: { title: string; action?: ReactNode }) {
  return (
    <View className="min-h-[44px] flex-row items-center justify-between gap-3">
      <Text accessibilityRole="header" className="shrink text-[36px] font-extrabold leading-[44px] tracking-[-1.8px] text-ink">
        {title}
      </Text>
      {action}
    </View>
  );
}

export function Avatar({ person, size }: { person: Person; size: number }) {
  return <Image source={person.avatar} style={{ width: size, height: size, borderRadius: size / 2 }} contentFit="cover" />;
}

export function Duration({ value, top = false }: { value: string; top?: boolean }) {
  return (
    <View
      pointerEvents="none"
      className="absolute right-[8px] flex-row items-center gap-[4px] rounded-[5px] bg-[#151A22]/90 px-[7px] py-[3px]"
      style={top ? { top: 9 } : { bottom: 5, right: 4 }}
    >
      <Icon sf="play.fill" md="play_arrow" size={8} color="white" />
      <Text className="text-[11px] font-bold leading-[14px] text-white">{value}</Text>
    </View>
  );
}

export function PhotoGrid({ posts, ratio, onSelect }: {
  posts: Post[];
  ratio: number;
  onSelect: (post: Post) => void;
}) {
  const rows = Array.from({ length: Math.ceil(posts.length / 3) }, (_, i) => posts.slice(i * 3, i * 3 + 3));
  return (
    <View className="gap-[5px]">
      {rows.map((row) => (
        <View key={row[0].id} className="flex-row gap-[5px]">
          {row.map((post) => (
            <Pressable
              key={post.id}
              accessibilityRole="button"
              accessibilityLabel={post.duration ? post.caption + " Video, " + post.duration : post.caption}
              className="flex-1 overflow-hidden rounded-[8px] bg-[#EEEFEE] active:opacity-75"
              style={{ aspectRatio: ratio }}
              onPress={() => onSelect(post)}
            >
              <Image source={post.image} style={StyleSheet.absoluteFill} />
              {post.duration && <Duration value={post.duration} />}
            </Pressable>
          ))}
          {Array.from({ length: 3 - row.length }, (_, i) => <View key={i} className="flex-1" />)}
        </View>
      ))}
    </View>
  );
}

export function Sheet({ title, onClose, children }: PropsWithChildren<{ title: string; onClose: () => void }>) {
  return (
    <Modal animationType="slide" presentationStyle="pageSheet" onRequestClose={onClose}>
      <SafeAreaView className="flex-1 bg-paper">
        <View className="flex-row items-center justify-between gap-4 border-b border-[#E1E1DB] px-[22px] py-2">
          <Text accessibilityRole="header" className="shrink text-xl font-extrabold text-ink">{title}</Text>
          <Pressable accessibilityRole="button" onPress={onClose} className="min-h-[44px] justify-center px-2">
            <Text className="font-bold text-cobalt">Done</Text>
          </Pressable>
        </View>
        {children}
      </SafeAreaView>
    </Modal>
  );
}

export function PostSheet({ post, onClose }: { post: Post; onClose: () => void }) {
  return (
    <Sheet title={post.author.name} onClose={onClose}>
      <ScrollView contentContainerStyle={styles.sheetContent}>
        <Image source={post.image} style={{ width: "100%", aspectRatio: 1, borderRadius: 14 }} />
        <Text className="font-semibold text-slate">@{post.author.handle}</Text>
        <Text className="text-[17px] text-ink">{post.caption}</Text>
        {post.duration && <Text className="text-sm text-slate">Video preview · {post.duration}</Text>}
      </ScrollView>
    </Sheet>
  );
}

const styles = StyleSheet.create({
  pageContent: { paddingBottom: 24, width: "100%", maxWidth: 560, alignSelf: "center" },
  sheetContent: { padding: 22, gap: 10 },
});
