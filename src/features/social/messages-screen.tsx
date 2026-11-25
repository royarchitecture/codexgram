import { router } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

import { conversations, people } from "@/features/social/preview-data";
import { usePreviewInbox } from "@/features/social/preview-state";
import { usePreviewSocial } from "@/features/social/social-state";
import { Avatar, colors, Icon, Page, PageHeading, Sheet } from "@/features/social/ui";

type Conversation = (typeof conversations)[number];

export default function MessagesScreen() {
  const { unread, markRead, sent } = usePreviewInbox();
  const { blocked } = usePreviewSocial();
  const inbox = [
    ...conversations,
    ...people.filter(({ handle }) => sent[handle]?.length && !conversations.some(({ person }) => person.handle === handle))
      .map((person) => ({ person, body: "", time: "", unread: false })),
  ].filter(({ person }) => !blocked.includes(person.handle));

  const [composing, setComposing] = useState(false);
  const [pendingConversation, setPendingConversation] = useState<Conversation | null>(null);

  function open(item: Conversation) {
    markRead(item.person.handle);
    router.push({ pathname: "/direct-message", params: { handle: item.person.handle } });
  }

  function openAfterComposeDismisses() {
    if (!pendingConversation) return;
    open(pendingConversation);
    setPendingConversation(null);
  }

  return (
    <Page>
      <View className="px-[22px]">
        <PageHeading
          title="Messages"
          action={
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="New message"
              onPress={() => setComposing(true)}
              className="h-[44px] w-[44px] items-center justify-center rounded-[15px] bg-[#EDF1FF] active:opacity-70"
            >
              <Icon sf="square.and.pencil" md="edit_square" size={20} color={colors.blue} />
            </Pressable>
          }
        />
        <View className="mt-[18.5px] gap-[6px]">
          {inbox.map((item) => {
            const { person, body, time } = item;
            const isUnread = unread.includes(person.handle);
            const latest = sent[person.handle]?.at(-1);

            return (
              <Pressable
                key={person.handle}
                accessibilityRole="button"
                accessibilityLabel={person.name + (isUnread ? ", unread" : "") + ", " + (latest ?? body)}
                onPress={() => open(item)}
                className={
                  "min-h-[84px] flex-row items-center gap-[11px] pr-[11px] py-[12px] active:opacity-70 " +
                  (isUnread ? "rounded-[14px] border border-[#E7ECFF] bg-[#F0F3FF] pl-[10px]" : "border-b border-[#E9E9E6] pl-[11px]")
                }
              >
                <Avatar person={person} size={52} />
                <View className="flex-1 gap-[3px]">
                  <Text className="text-[17px] font-bold leading-[20px] text-ink">{person.name}</Text>
                  <Text numberOfLines={1} className={"text-[14px] leading-[19px] " + (isUnread ? "text-[#353D53]" : "text-slate")}>
                    {latest ? "You: " + latest : body}
                  </Text>
                </View>
                <View className="items-end gap-[7px]">
                  <Text className="text-[12px] leading-[15px] text-slate">{latest ? "Now" : time}</Text>
                  {isUnread && <View className="h-[8px] w-[8px] rounded-full bg-[#3355DB]" />}
                </View>
              </Pressable>
            );
          })}
        </View>
      </View>
      {(composing || pendingConversation) && (
        <Sheet
          title="New message"
          visible={composing}
          onClose={() => setComposing(false)}
          onDismiss={openAfterComposeDismisses}
        >
          {inbox.map((item) => (
            <Pressable
              key={item.person.handle}
              accessibilityRole="button"
              className="flex-row items-center gap-3 px-[22px] py-[12px] active:opacity-70"
              onPress={() => {
                setPendingConversation((pending) => pending ?? item);
                setComposing(false);
              }}
            >
              <Avatar person={item.person} size={38} />
              <Text className="text-[16px] font-semibold text-ink">{item.person.name}</Text>
            </Pressable>
          ))}
        </Sheet>
      )}
    </Page>
  );
}
