import "@/global.css";

import { ClerkProvider } from "@clerk/expo";
import { tokenCache } from "@clerk/expo/token-cache";
import { isRunningInExpoGo } from "expo";
import { Stack, usePathname } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { Platform } from "react-native";

import { clerkPublishableKey } from "@/features/auth/config";
import { PreviewAccount, PreviewInbox } from "@/features/social/preview-state";
import { PreviewSocial } from "@/features/social/social-state";

export default function RootLayout() {
  const pathname = usePathname();
  const statusBarStyle = pathname === "/sign-in" ? "light" : "dark";
  const usesNativeStatusBar = Platform.OS === "ios" && !isRunningInExpoGo();
  const navigator = (
    <PreviewAccount>
      <PreviewSocial>
        <PreviewInbox>
          {!usesNativeStatusBar && <StatusBar style={statusBarStyle} />}
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#FAF9F6" } }}>
            <Stack.Screen name="(tabs)" options={usesNativeStatusBar ? { statusBarStyle: "dark" } : {}} />
            <Stack.Screen name="sign-in" options={usesNativeStatusBar ? { statusBarStyle: "light" } : {}} />
          </Stack>
        </PreviewInbox>
      </PreviewSocial>
    </PreviewAccount>
  );

  if (!clerkPublishableKey) {
    return navigator;
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={tokenCache}>
      {navigator}
    </ClerkProvider>
  );
}
