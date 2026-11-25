import { useAuth } from "@clerk/expo";
import { type PropsWithChildren, createContext, useCallback, useContext, useState } from "react";

import { clerkPublishableKey } from "@/features/auth/config";
import { conversations } from "@/features/social/preview-data";

const AccountContext = createContext<{
  isSignedIn: boolean;
  userId?: string | null;
  signOut?: () => Promise<void>;
}>({ isSignedIn: false });

function ClerkAccount({ children }: PropsWithChildren) {
  const { isSignedIn, userId, signOut } = useAuth();
  return (
    <AccountContext.Provider value={{ isSignedIn: isSignedIn === true, userId, signOut: () => signOut() }}>
      {children}
    </AccountContext.Provider>
  );
}

export function PreviewAccount({ children }: PropsWithChildren) {
  return clerkPublishableKey ? <ClerkAccount>{children}</ClerkAccount> : children;
}

export function usePreviewAccount() {
  return useContext(AccountContext);
}

const InboxContext = createContext<{
  unread: string[];
  markRead: (handle: string) => void;
  sent: Record<string, string[]>;
  send: (handle: string, message: string) => void;
} | null>(null);

export function PreviewInbox({ children }: PropsWithChildren) {
  const [unread, setUnread] = useState(() =>
    conversations.filter((conversation) => conversation.unread).map(({ person }) => person.handle)
  );
  const [sent, setSent] = useState<Record<string, string[]>>({});

  const markRead = useCallback((handle: string) => {
    setUnread((current) => current.includes(handle) ? current.filter((unreadHandle) => unreadHandle !== handle) : current);
  }, []);

  function send(handle: string, message: string) {
    setSent((current) => ({ ...current, [handle]: [...(current[handle] ?? []), message] }));
  }

  return <InboxContext.Provider value={{ unread, markRead, sent, send }}>{children}</InboxContext.Provider>;
}

export function usePreviewInbox() {
  const inbox = useContext(InboxContext);
  if (!inbox) throw new Error("Preview inbox provider is missing.");
  return inbox;
}
