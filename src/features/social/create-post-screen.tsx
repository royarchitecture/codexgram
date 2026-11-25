import { Image, type ImageSource } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { router, useLocalSearchParams } from "expo-router";
import { VideoView, useVideoPlayer } from "expo-video";
import { useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

import { BlueButton, DetailFrame, DetailHeader } from "@/features/social/detail-ui";
import { pears } from "@/features/social/preview-data";
import { usePreviewSocial } from "@/features/social/social-state";
import { colors, Icon } from "@/features/social/ui";

type Media = { image: ImageSource; videoUri?: never } | { image?: never; videoUri: string };

function VideoPreview({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri);
  return <VideoView player={player} style={{ width: "100%", height: "100%" }} contentFit="cover" />;
}

export default function CreatePostScreen() {
  const { sample } = useLocalSearchParams<{ sample?: string }>();
  const { submit } = usePreviewSocial();
  const [caption, setCaption] = useState(sample === "1" ? "Pears in afternoon light." : "");
  const [media, setMedia] = useState<Media | null>(sample === "1" ? { image: pears } : null);
  const [error, setError] = useState("");
  const [picking, setPicking] = useState(false);

  async function chooseMedia() {
    if (picking) return;
    setPicking(true);
    setError("");
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images", "videos"], videoMaxDuration: 30 });
      if (result.canceled) return;
      const item = result.assets[0];
      const isVideo = item.type === "video";
      if ((item.fileSize ?? 0) > (isVideo ? 25 : 10) * 1_000_000 || (isVideo && (item.duration ?? 0) > 30_000)) {
        setError("Choose a photo up to 10 MB, or a video up to 30 seconds and 25 MB.");
        return;
      }
      setMedia(isVideo ? { videoUri: item.uri } : { image: { uri: item.uri } });
    } catch {
      setError("Couldn’t open the photo library. Try again.");
    } finally {
      setPicking(false);
    }
  }

  function submitPost() {
    if (!media) return;
    submit({ ...media, caption: caption.trim() });
    router.dismissTo({ pathname: "/profile", params: { section: "submissions" } });
  }

  return (
    <DetailFrame>
      <DetailHeader title="Create a post" backLabel="Cancel" fallback="/home" />
      <ScrollView keyboardShouldPersistTaps="handled" automaticallyAdjustKeyboardInsets
        contentContainerStyle={{ width: "100%", maxWidth: 520, alignSelf: "center", paddingHorizontal: 22, paddingTop: 16, paddingBottom: 20 }}
      >
        <Pressable accessibilityRole="button" disabled={picking} onPress={() => void chooseMedia()}
          className="min-h-[48px] flex-row items-center justify-center gap-[10px] rounded-full bg-[#EDF0FF] px-3 active:opacity-70"
        >
          <Icon sf="photo.on.rectangle" md="image" size={17} color={colors.cobalt} />
          <Text className="text-[15px] font-bold text-cobalt">Choose from Photo Library</Text>
        </Pressable>
        <Text className="mb-[12px] mt-[10px] text-[13px] leading-[19px] text-slate">
          1 photo up to 10 MB, or 1 video up to 30 seconds and 25 MB.
        </Text>
        {error !== "" && <Text accessibilityRole="alert" className="mb-3 text-[#9D2938]">{error}</Text>}
        {media && (
          <View className="mb-[12px] overflow-hidden rounded-[16px]" style={{ width: "100%", aspectRatio: 358 / 334 }}>
            {media.videoUri ? <VideoPreview uri={media.videoUri} /> : (
              <Image source={media.image} style={{ width: "100%", height: "100%" }} />
            )}
          </View>
        )}
        <Text className="mb-[5px] text-[15px] font-bold text-ink">
          Caption <Text className="text-[13px] font-medium text-slate">(optional)</Text>
        </Text>
        <TextInput accessibilityLabel="Caption" value={caption} onChangeText={setCaption} multiline
          textAlignVertical="top" className="mb-[13px] min-h-[80px] rounded-[12px] border border-[#DFE2E7] p-[13px] text-[16px] text-ink"
        />
        <BlueButton label="Submit for review" disabled={!media || picking} onPress={submitPost} />
        <Text className="mt-[12px] text-center text-[13px] text-slate">Your post appears after it’s approved.</Text>
      </ScrollView>
    </DetailFrame>
  );
}
