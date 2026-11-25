import { useLocalSearchParams } from "expo-router";
import { type ComponentRef, useEffect, useRef, useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { BackLink, DetailFrame, MoreButton, Popup, PopupAction, ReplyBar } from "@/features/social/detail-ui";
import { conversations, eli, people } from "@/features/social/preview-data";
import { usePreviewInbox } from "@/features/social/preview-state";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors } from "@/features/social/ui";

const previewMessages = [
  { body: "That fog was unreal. Were you out before sunrise?", mine: false },
  { body: "Just after. The headland was quiet for an hour.", mine: true },
  { body: "Was that near the old lookout?", mine: false },
  { body: "Yes, the north trail above the cove.", mine: true },
];

export default function DirectMessageScreen() {
  const { bottom } = useSafeAreaInsets();
  const { handle, from, menu } = useLocalSearchParams<{ handle?: string; from?: string; menu?: string }>();
  const person = people.find((item) => item.handle === handle);
  const { sent, send, markRead } = usePreviewInbox();
  const { blocked } = usePreviewSocial();
  const [draft, setDraft] = useState("");
  const [showMenu, setShowMenu] = useState(menu === "1" ? 2 : -1);
  const [showOptions, setShowOptions] = useState(false);
  const list = useRef<ComponentRef<typeof ScrollView>>(null);
  const pendingScrollCount = useRef<number | null>(null);
  const localMessages = handle ? sent[handle] ?? [] : [];
  const existing = conversations.find((item) => item.person.handle === handle);
  const messages = [
    ...(handle === eli.handle ? previewMessages : existing ? [{ body: existing.body, mine: false }] : []),
    ...localMessages.map((body) => ({ body, mine: true })),
  ];
  const canSend = person && !blocked.includes(person.handle);

  useEffect(() => {
    if (handle) markRead(handle);
  }, [handle, markRead]);

  function sendDraft() {
    const message = draft.trim();
    if (!canSend || !message) return;
    pendingScrollCount.current = localMessages.length + 1;
    send(person.handle, message);
    setDraft("");
  }

  function scrollAfterLocalSend() {
    if (pendingScrollCount.current === null || localMessages.length < pendingScrollCount.current) return;
    pendingScrollCount.current = null;
    list.current?.scrollToEnd({ animated: true });
  }

  function report() {
    setShowMenu(-1);
    setShowOptions(false);
    Alert.alert("Report message", "Reporting is unavailable in this preview.");
  }

  return (
    <DetailFrame insetBottom={false}>
      <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
        <View className="h-[52px] flex-row items-center gap-[4px] border-b border-[#E9E9E6] px-[13px]">
          <BackLink label="" fallback={from === "explore" ? "/explore" : "/messages"} />
          {person && <Avatar person={person} size={42} />}
          <View className="ml-[5px] flex-1">
            <Text accessibilityRole="header" className="text-[16px] font-extrabold leading-[20px] text-ink">{person?.name ?? "Messages"}</Text>
            {person && <Text className="text-[13px] leading-[17px] text-slate">@{person.handle}</Text>}
          </View>
          {person && <MoreButton label="Conversation options" onPress={() => setShowOptions(!showOptions)} />}
        </View>
        <ScrollView ref={list} onContentSizeChange={scrollAfterLocalSend} keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 21, paddingTop: 19, paddingBottom: 16, gap: 11 }}
        >
          {handle === eli.handle && <Text className="mb-[3px] text-center text-[13px] text-slate">Today, 9:18 AM</Text>}
          {!person && <Text className="text-slate">This conversation could not be found.</Text>}
          {person && !canSend && <Text className="text-slate">You blocked this account.</Text>}
          {canSend && messages.map(({ body, mine }, index) => (
            <View key={index} className={"max-w-[81%] " + (mine ? "self-end items-end" : "self-start items-start")}>
              <Pressable accessibilityRole={mine ? undefined : "button"} accessibilityHint={mine ? undefined : "Shows message options"}
                onPress={mine ? undefined : () => setShowMenu((open) => open === index ? -1 : index)}
                className={"rounded-[18px] px-[13px] py-[11px] " + (mine ? "rounded-br-[5px] bg-[#3355DB]" : "rounded-bl-[5px] bg-[#EEEFEE]")}
              >
                <Text className={"text-[15px] leading-[20px] " + (mine ? "text-white" : "text-ink")}>{body}</Text>
              </Pressable>
              {!mine && showMenu === index && (
                <View className="ml-[15px] mt-[6px] rounded-[10px] border border-[#E4E5E9] bg-white"
                  style={{ shadowColor: colors.ink, shadowOpacity: 0.08, shadowRadius: 4, shadowOffset: { width: 0, height: 2 }, elevation: 3 }}>
                  <PopupAction label="Report message" compact onPress={report} />
                </View>
              )}
              {index === messages.length - 1 && mine && <Text className="mt-[10px] text-[12px] text-slate">Delivered</Text>}
            </View>
          ))}
        </ScrollView>
        {canSend && (
          <View style={{ paddingBottom: Platform.OS === "ios" ? Math.max(bottom - 20, 0) : bottom }}>
            <ReplyBar placeholder="Message" value={draft} onChange={setDraft} onSend={sendDraft} />
          </View>
        )}
        {showOptions && <Popup onClose={() => setShowOptions(false)}><PopupAction label="Report message" onPress={report} /></Popup>}
      </KeyboardAvoidingView>
    </DetailFrame>
  );
}
