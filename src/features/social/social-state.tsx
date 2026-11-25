import type { ImageSource } from "expo-image";
import { getItemAsync, setItemAsync } from "expo-secure-store";
import { createContext, type PropsWithChildren, useContext, useEffect, useState } from "react";
import { Platform } from "react-native";

import { eli, feed, mara, postComments, type PreviewComment } from "@/features/social/preview-data";
import { usePreviewAccount } from "@/features/social/preview-state";

export type Submission = { id: string; caption: string; image?: ImageSource; videoUri?: string };
type SocialState = {
  username: string | null;
  usernameReady: boolean;
  saveUsername: (name: string) => Promise<void>;
  submissions: Submission[];
  deletedPosts: string[];
  deletePost: (id: string) => void;
  deleteComment: (post: string, comment: string) => void;
  submit: (draft: Omit<Submission, "id">) => void;
  blocked: string[];
  toggleBlock: (handle: string) => void;
  follows: string[];
  toggleFollow: (handle: string) => void;
  isLiked: (id: string) => boolean;
  toggleLike: (id: string) => void;
  commentsFor: (id: string) => PreviewComment[];
  addComment: (id: string, body: string) => void;
};

const SocialContext = createContext<SocialState | null>(null);

export function PreviewSocial({ children }: PropsWithChildren) {
  const { userId } = usePreviewAccount();
  const storageKey = userId ? `codexgram.username.${userId}` : null;
  const [identity, setIdentity] = useState<{ key: string | null; name: string | null }>({ key: null, name: null });
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [deletedPosts, setDeletedPosts] = useState<string[]>([]);
  const [deletedComments, setDeletedComments] = useState<Record<string, string[]>>({});
  const [blocked, setBlocked] = useState<string[]>([]);
  const [follows, setFollows] = useState([eli.handle]);
  const [likes, setLikes] = useState<Record<string, boolean>>({});
  const [localComments, setLocalComments] = useState<Record<string, PreviewComment[]>>({});

  useEffect(() => {
    if (!storageKey) return;
    let active = true;
    const read = async () => {
      try {
        const name = Platform.OS === "web" ? window.localStorage.getItem(storageKey) : await getItemAsync(storageKey);
        if (active) setIdentity({ key: storageKey, name });
      } catch {
        if (active) setIdentity({ key: storageKey, name: null });
      }
    };
    void read();
    return () => { active = false; };
  }, [storageKey]);

  async function saveUsername(name: string) {
    if (storageKey) {
      if (Platform.OS === "web") window.localStorage.setItem(storageKey, name);
      else await setItemAsync(storageKey, name);
    }
    setIdentity({ key: storageKey, name });
  }

  function isLiked(id: string) {
    return likes[id] ?? feed.find((post) => post.id === id)?.liked ?? false;
  }

  function toggleLike(id: string) {
    setLikes((current) => ({ ...current, [id]: !(current[id] ?? feed.find((post) => post.id === id)?.liked ?? false) }));
  }

  function toggleFollow(handle: string) {
    setFollows((state) => state.includes(handle) ? state.filter((name) => name !== handle) : [...state, handle]);
  }

  function toggleBlock(handle: string) {
    if (!blocked.includes(handle)) setFollows((state) => state.filter((name) => name !== handle));
    setBlocked((state) => state.includes(handle) ? state.filter((name) => name !== handle) : [...state, handle]);
  }

  function addComment(id: string, body: string) {
    setLocalComments((current) => {
      const existing = current[id] ?? [];
      return { ...current, [id]: [...existing, { id: "local-" + existing.length, author: { ...mara, handle: identity.key === storageKey ? identity.name ?? mara.handle : mara.handle }, body, time: "Now" }] };
    });
  }

  return (
    <SocialContext.Provider value={{
      username: identity.key === storageKey ? identity.name : null,
      usernameReady: !storageKey || identity.key === storageKey,
      saveUsername,
      submissions, deletedPosts,
      deletePost: (id) => setDeletedPosts((current) => [...current, id]),
      deleteComment: (id, comment) => setDeletedComments((current) => ({ ...current, [id]: [...(current[id] ?? []), comment] })),
      submit: (draft) => setSubmissions((current) => [...current, { ...draft, id: String(current.length) }]),
      blocked, toggleBlock, follows, toggleFollow, isLiked, toggleLike, addComment,
      commentsFor: (id) => [...(postComments[id] ?? []), ...(localComments[id] ?? [])].filter(({ id: comment }) => !deletedComments[id]?.includes(comment)),
    }}>
      {children}
    </SocialContext.Provider>
  );
}

export function usePreviewSocial() {
  const state = useContext(SocialContext);
  if (!state) throw new Error("Preview social provider is missing.");
  return state;
}
