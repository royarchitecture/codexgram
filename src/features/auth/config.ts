import { isRunningInExpoGo } from "expo";

export const clerkPublishableKey = isRunningInExpoGo()
  ? undefined
  : process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
