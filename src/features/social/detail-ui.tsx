import { router, type Href } from "expo-router";
import type { PropsWithChildren, ReactNode } from "react";
import { Pressable, Text, TextInput, View } from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { SafeAreaView as ScreenSafeAreaView } from "react-native-screens/experimental";

import { colors, Icon } from "@/features/social/ui";

export function DetailFrame({ children, paper = false, tabs = false, insetBottom = true }: PropsWithChildren<{ paper?: boolean; tabs?: boolean; insetBottom?: boolean }>) {
  const { top } = useSafeAreaInsets();
  const style = { flex: 1, paddingTop: Math.floor(top), backgroundColor: paper ? colors.paper : colors.white };
  return tabs ? (
    <ScreenSafeAreaView edges={{ left: true, right: true, bottom: true }} style={style}>
      {children}
    </ScreenSafeAreaView>
  ) : (
    <SafeAreaView edges={insetBottom ? ["left", "right", "bottom"] : ["left", "right"]} style={style}>
      {children}
    </SafeAreaView>
  );
}

export function BackLink({ label = "Back", fallback = "/explore", onPress }: {
  label?: string;
  fallback?: Href;
  onPress?: () => void;
}) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label || "Back"}
      className="min-h-[42px] flex-row items-center gap-[7px] self-start px-[5px] active:opacity-65"
      onPress={onPress ?? (() => router.canGoBack() ? router.back() : router.replace(fallback))}
    >
      {label !== "Cancel" && <Icon sf="chevron.left" md="chevron_left" color={colors.cobalt} size={15} />}
      {label !== "" && <Text className="text-[15px] font-bold text-cobalt">{label}</Text>}
    </Pressable>
  );
}

export function DetailHeader({ title, backLabel, fallback, onBack, action }: {
  title: string;
  backLabel: string;
  fallback?: Href;
  action?: ReactNode;
  onBack?: () => void;
}) {
  return (
    <View className="h-[42px] flex-row items-center justify-between border-b border-[#E9E9E6] px-[13px]">
      <View className="z-10"><BackLink label={backLabel} fallback={fallback} onPress={onBack} /></View>
      <View pointerEvents="none" className="absolute inset-0 items-center justify-center">
        <Text accessibilityRole="header" className="text-[17px] font-extrabold text-ink">{title}</Text>
      </View>
      {action}
    </View>
  );
}

export function MoreButton({ onPress, label = "More options" }: { onPress: () => void; label?: string }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={onPress}
      className="min-h-[38px] min-w-[42px] items-center justify-center active:opacity-65"
    >
      <Icon sf="ellipsis" md="more_horiz" size={18} />
    </Pressable>
  );
}

export function Popup({ children, onClose }: PropsWithChildren<{ onClose: () => void }>) {
  return (
    <View pointerEvents="box-none" className="absolute inset-0 z-20">
      <Pressable accessible={false} onPress={onClose} className="absolute inset-0" />
      <View className="absolute right-[18px] top-[35px] w-[142px] rounded-[13px] border border-[#E4E5E9] bg-white"
        style={{ shadowColor: "#101522", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 6 }}
      >
        <View className="overflow-hidden rounded-[12px]">{children}</View>
      </View>
    </View>
  );
}

export function PopupAction({ label, onPress, destructive = false, compact = false }: {
  label: string;
  onPress: () => void;
  destructive?: boolean;
  compact?: boolean;
}) {
  const tint = destructive ? "#9D2938" : colors.ink;
  return (
    <Pressable accessibilityRole="button" onPress={onPress}
      className={"flex-row items-center justify-between gap-[8px] px-[12px] active:bg-[#F2F3F7] " + (compact ? "min-h-[32px]" : "min-h-[40px]")}
    >
      <Text style={{ color: tint, fontSize: compact ? 13 : 14, fontWeight: compact ? "700" : "400" }}>{label}</Text>
      <Icon sf={destructive ? "nosign" : "flag"} md={destructive ? "block" : "flag"} size={14} color={tint} />
    </Pressable>
  );
}

export function ReplyBar({ placeholder, value, onChange, onSend }: {
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
}) {
  return (
    <View className="flex-row items-center gap-[9px] border-t border-[#E9E9E6] bg-white px-[21px] pb-[6px] pt-[9px]">
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.slate}
        value={value}
        onChangeText={onChange}
        returnKeyType="send"
        onSubmitEditing={onSend}
        className="min-h-[46px] flex-1 rounded-full border border-[#DFE2E7] px-[14px] text-[16px] text-ink"
      />
      <Pressable accessibilityRole="button" accessibilityLabel="Send" disabled={!value.trim()} onPress={onSend}
        className="h-[42px] w-[42px] items-center justify-center rounded-full bg-[#3355DB] active:opacity-70"
      >
        <Icon sf="arrow.up" md="arrow_upward" color="white" size={18} />
      </Pressable>
    </View>
  );
}

export function BlueButton({ label, onPress, disabled }: { label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable accessibilityRole="button" disabled={disabled} onPress={onPress}
      className="min-h-[48px] items-center justify-center rounded-full bg-[#3355DB] px-3 active:opacity-75 disabled:opacity-50"
    >
      <Text className="text-center text-[15px] font-bold text-white">{label}</Text>
    </Pressable>
  );
}
