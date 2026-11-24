import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { type SignInProvider, useSocialSignIn } from "@/features/auth/use-social-sign-in";
import { demoPost } from "@/features/posts/demo-post";

type SignInScreenProps = {
  returnTo: "/home" | "/explore" | "/profile";
  onSignIn?: (provider: SignInProvider) => Promise<string | undefined>;
  isReady?: boolean;
};

export function ClerkSignInScreen({ returnTo }: Pick<SignInScreenProps, "returnTo">) {
  const { isLoaded, isSignedIn, signIn } = useSocialSignIn();

  useEffect(() => {
    if (isSignedIn) {
      router.dismissTo(returnTo);
    }
  }, [isSignedIn, returnTo]);

  return <SignInScreen returnTo={returnTo} isReady={isLoaded && !isSignedIn} onSignIn={signIn} />;
}

export function SignInScreen({ returnTo, onSignIn, isReady = true }: SignInScreenProps) {
  const insets = useSafeAreaInsets();
  const { width, height } = useWindowDimensions();
  const [pending, setPending] = useState<SignInProvider | null>(null);
  const [error, setError] = useState<string | null>(null);
  const signingIn = useRef(false);
  const heroHeight = Math.min(height * 0.5744, width * 1.25);
  const wordmarkSize = Math.min(width * 0.135, 60);

  const continueAsGuest = () => {
    router.dismissTo(returnTo);
  };

  const handleSignIn = async (provider: SignInProvider) => {
    if (signingIn.current) return;

    if (!onSignIn) {
      setError("Sign-in is unavailable in this build. You can continue as a guest.");
      return;
    }

    signingIn.current = true;
    setError(null);
    setPending(provider);

    try {
      setError((await onSignIn(provider)) ?? null);
    } finally {
      signingIn.current = false;
      setPending(null);
    }
  };

  return (
    <View className="flex-1 bg-paper">
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: Math.max(insets.bottom, 16) }}
        contentInsetAdjustmentBehavior="never"
        showsVerticalScrollIndicator={false}
      >
        <View
          className="justify-end bg-ink"
          style={{ minHeight: heroHeight, paddingTop: insets.top + 64 }}
        >
          <Image source={demoPost.image} contentFit="cover" style={StyleSheet.absoluteFill} />
          <LinearGradient
            colors={[
              "rgba(20, 33, 44, 0.64)",
              "rgba(20, 33, 44, 0.55)",
              "rgba(20, 33, 44, 0.33)",
              "rgba(20, 33, 44, 0.165)",
              "transparent",
              "transparent",
              "rgba(8, 20, 35, 0.34)",
            ]}
            locations={[0, 0.03, 0.083, 0.163, 0.32, 0.65, 1]}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Back"
            className="absolute left-[23px] h-[44px] w-[44px] items-center justify-center rounded-full border border-white/40 bg-black/30 active:opacity-70"
            style={{ top: insets.top + 2 }}
            disabled={pending !== null}
            onPress={continueAsGuest}
          >
            <View style={styles.chevron} />
          </Pressable>
          <View className="px-[26px] pb-[16px]">
            <View className="mb-[5px] h-[51px] w-[51px] items-center justify-center rounded-[14px] border-t border-white/45 bg-brand-blue">
              <View className="h-[24px] w-[24px] items-center justify-center">
                {cornerStyles.map((cornerStyle, index) => (
                  <View key={index} style={[styles.viewfinderCorner, cornerStyle]} />
                ))}
                <View className="h-[11px] w-[11px] rounded-full border-[2.4px] border-white" />
              </View>
            </View>
            <Text
              className="font-extrabold text-paper"
              style={{ fontSize: wordmarkSize, lineHeight: wordmarkSize * 1.18, letterSpacing: -3.4 }}
              maxFontSizeMultiplier={1.25}
            >
              Codexgram
            </Text>
            <Text className="mt-[6px] text-[12px] font-semibold leading-[16px] text-paper">
              Photo by {demoPost.handle}
            </Text>
          </View>
        </View>

        <View className="w-full max-w-[520px] self-center px-[25px] pt-[24px]">
          <Text
            accessibilityRole="header"
            className="text-[31px] font-extrabold leading-[38px] tracking-[-1.55px] text-ink"
          >
            Sign in to like this post
          </Text>
          <Text className="mt-[4px] max-w-[318px] text-[16px] leading-[23px] text-slate">
            After setting up your profile, you’ll come back to this post.
          </Text>
          <View className="mt-[21px] gap-[10px]">
            <ProviderButton
              provider="apple"
              isBusy={pending === "apple"}
              disabled={!isReady || pending !== null}
              onPress={() => void handleSignIn("apple")}
            />
            <ProviderButton
              provider="google"
              isBusy={pending === "google"}
              disabled={!isReady || pending !== null}
              onPress={() => void handleSignIn("google")}
            />
          </View>
          {error && (
            <Text accessibilityRole="alert" className="mt-3 text-center text-sm leading-5 text-[#9D2938]">
              {error}
            </Text>
          )}
          <Pressable
            accessibilityRole="button"
            className="mt-[11px] min-h-[44px] items-center justify-center self-center px-3 active:opacity-60"
            disabled={pending !== null}
            onPress={continueAsGuest}
          >
            <Text className="text-[15px] font-bold leading-5 text-cobalt">Continue as guest</Text>
          </Pressable>
        </View>
      </ScrollView>
    </View>
  );
}

function ProviderButton({
  provider,
  isBusy,
  disabled,
  onPress,
}: {
  provider: SignInProvider;
  isBusy: boolean;
  disabled: boolean;
  onPress: () => void;
}) {
  const isApple = provider === "apple";
  const label = isApple ? "Sign in with Apple" : "Continue with Google";
  const iconColor = isApple ? "#FFFFFF" : "#191B22";

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ busy: isBusy, disabled }}
      className={
        "min-h-[52px] flex-row items-center justify-center gap-[11px] rounded-full px-4 py-2 active:opacity-75 " +
        (isApple ? "bg-apple-button" : "border border-sign-in-border bg-white")
      }
      disabled={disabled}
      onPress={onPress}
    >
      {isBusy ? (
        <ActivityIndicator size="small" color={iconColor} />
      ) : isApple ? (
        <SymbolView name="apple.logo" size={17} tintColor={iconColor} />
      ) : (
        <Image source={require("@/assets/images/google-sign-in.png")} style={styles.googleIcon} />
      )}
      <Text
        className={
          "shrink text-center text-[16px] font-bold leading-[21px] " +
          (isApple ? "text-white" : "text-ink")
        }
      >
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chevron: {
    width: 10,
    height: 10,
    borderColor: "#FFFFFF",
    borderRadius: 1,
    borderLeftWidth: 2,
    borderBottomWidth: 2,
    transform: [{ rotate: "45deg" }],
    marginLeft: 4,
  },
  viewfinderCorner: {
    position: "absolute",
    width: 9,
    height: 9,
    borderColor: "#FFFFFF",
  },
  googleIcon: { width: 16, height: 16 },
});

const cornerStyles = [
  { top: 0, left: 0, borderTopWidth: 2.3, borderLeftWidth: 2.3, borderTopLeftRadius: 4 },
  { top: 0, right: 0, borderTopWidth: 2.3, borderRightWidth: 2.3, borderTopRightRadius: 4 },
  { bottom: 0, left: 0, borderBottomWidth: 2.3, borderLeftWidth: 2.3, borderBottomLeftRadius: 4 },
  { bottom: 0, right: 0, borderBottomWidth: 2.3, borderRightWidth: 2.3, borderBottomRightRadius: 4 },
];
