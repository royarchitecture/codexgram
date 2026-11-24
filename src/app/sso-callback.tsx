import { router } from "expo-router";
import { maybeCompleteAuthSession } from "expo-web-browser";
import { useEffect } from "react";

export default function SsoCallback() {
  useEffect(() => {
    if (maybeCompleteAuthSession().type !== "success") {
      router.replace("/");
    }
  }, []);

  return null;
}
