import { useLocalSearchParams } from "expo-router";

import { clerkPublishableKey } from "@/features/auth/config";
import { ClerkSignInScreen, SignInScreen } from "@/features/auth/sign-in-screen";

export default function SignIn() {
  const { from } = useLocalSearchParams<{ from?: string }>();
  const returnTo = from === "home" ? "/home" : from === "profile" ? "/profile" : "/explore";

  return clerkPublishableKey
    ? <ClerkSignInScreen returnTo={returnTo} />
    : <SignInScreen returnTo={returnTo} />;
}
