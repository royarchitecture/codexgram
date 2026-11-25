import { useState } from "react";
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { conversations } from "@/features/social/preview-data";
import { usePreviewInbox } from "@/features/social/preview-state";
import { Avatar, colors, Icon, Page, PageHeading, Sheet } from "@/features/social/ui";

type Conversation = (typeof conversations)[number];

export default function MessagesScreen() {
  const { unread, markRead, sent, send } = usePreviewInbox();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [composing, setComposing] = useState(false);
  const [draft, setDraft] = useState("");

  function open(item: Conversation) {
    markRead(item.person.handle);
    setComposing(false);
    setDraft("");
    setConversation(item);
  }

  function sendDraft() {
    const message = draft.trim();
    if (!conversation || !message) return;
    send(conversation.person.handle, message);
    setDraft("");
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
          {conversations.map((item) => {
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
      {composing && (
        <Sheet title="New message" onClose={() => setComposing(false)}>
          {conversations.map((item) => (
            <Pressable key={item.person.handle} accessibilityRole="button" className="flex-row items-center gap-3 px-[22px] py-[12px] active:opacity-70" onPress={() => open(item)}>
              <Avatar person={item.person} size={38} />
              <Text className="text-[16px] font-semibold text-ink">{item.person.name}</Text>
            </Pressable>
          ))}
        </Sheet>
      )}
      {conversation && (
        <Sheet title={conversation.person.name} onClose={() => setConversation(null)}>
          <KeyboardAvoidingView className="flex-1" behavior={Platform.OS === "ios" ? "padding" : undefined}>
            <ScrollView contentContainerStyle={{ padding: 22, gap: 10 }} keyboardShouldPersistTaps="handled">
              <Text className="max-w-[85%] self-start rounded-2xl bg-[#EEEFEE] p-3 text-[16px] text-ink">{conversation.body}</Text>
              {sent[conversation.person.handle]?.map((message, index) => (
                <Text key={index} className="max-w-[85%] self-end rounded-2xl bg-[#3355DB] p-3 text-[16px] text-white">{message}</Text>
              ))}
            </ScrollView>
            <View className="flex-row items-center gap-3 px-[22px] py-2">
              <TextInput
                accessibilityLabel="Message"
                placeholder="Message"
                placeholderTextColor={colors.slate}
                value={draft}
                onChangeText={setDraft}
                returnKeyType="send"
                onSubmitEditing={sendDraft}
                className="min-h-[44px] flex-1 rounded-full bg-[#EEEFEE] px-4 text-[16px] text-ink"
              />
              <Pressable accessibilityRole="button" disabled={!draft.trim()} onPress={sendDraft} className="min-h-[44px] justify-center px-2 disabled:opacity-40">
                <Text className="font-bold text-cobalt">Send</Text>
              </Pressable>
            </View>
          </KeyboardAvoidingView>
        </Sheet>
      )}
    </Page>
  );
}
