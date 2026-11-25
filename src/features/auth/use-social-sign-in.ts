import { isClerkAPIResponseError, useAuth, useSSO } from "@clerk/expo";
import { makeRedirectUri } from "expo-auth-session";

export type SignInProvider = "apple" | "google";

export function useSocialSignIn() {
  const { isLoaded, isSignedIn, signOut } = useAuth();
  const { startSSOFlow } = useSSO();

  async function signIn(provider: SignInProvider): Promise<string | undefined> {
    const name = provider === "apple" ? "Apple" : "Google";

    try {
      const result = await startSSOFlow({
        strategy: provider === "apple" ? "oauth_apple" : "oauth_google",
        redirectUrl: makeRedirectUri({ scheme: "codexgram", path: "sso-callback" }),
      });

      const browserResult = result.authSessionResult?.type;
      if (browserResult === "cancel" || browserResult === "dismiss") {
        return;
      }

      const { createdSessionId, setActive } = result;
      if (!createdSessionId || !setActive) {
        if (result.signUp?.status === "missing_requirements") {
          return "This account needs more information to finish signing up. Try another sign-in method.";
        }

        return `Sign-in with ${name} didn’t finish. Please try again.`;
      }

      let requiresVerification = false;
      await setActive({
        session: createdSessionId,
        navigate: ({ session }) => {
          requiresVerification = Boolean(session.currentTask);
        },
      });

      if (requiresVerification) {
        await signOut({ sessionId: createdSessionId });
        return "This account requires additional verification. Try another sign-in method.";
      }
    } catch (error) {
      if (isClerkAPIResponseError(error)) {
        const code = error.errors[0]?.code;
        if (code === "strategy_not_allowed" || code === "oauth_provider_not_enabled") {
          return `${name} sign-in is currently unavailable. Try another option.`;
        }
      }

      return `Couldn’t sign in with ${name}. Please try again.`;
    }
  }

  return { isLoaded, isSignedIn, signIn };
}
