# Codexgram v1 implementation plan

## Product and scope

Build a free, mobile-first photo and video sharing app for an external iOS TestFlight beta of up to 50 invited adults. Anyone with the beta installed can browse approved posts and public profiles. Google or Apple sign-in through Clerk and a unique username are required for social actions. Use Convex for the backend, Expo Router native tabs, and NativeWind for a clean, minimal interface with its own visual identity.

| Tab | Beta experience |
|---|---|
| **Home** | Show approved posts from followed accounts, newest first. Direct users with an empty feed to Explore. Put a create button in the header. |
| **Messages** | Show live one-to-one text chats and an unread conversation count. Start chats from eligible profiles. |
| **Explore** | Start guests here. Show a grid of recent approved posts and search usernames. Open post details, comments, and public profiles. |
| **Profile** | Show the user’s posts and private submission status. Allow editing display name, bio, and avatar. Put blocked accounts, sign-out, support, and account deletion in Settings. |

Android, public web access, a public store launch, camera capture, carousels, push notifications, group chats, chat attachments, and monetization are outside the beta scope.

## Implementation sequence

### 1. Verify the stack and build the shell

- Preserve the workspace’s locked Expo `58.0.25`, Expo Router `58.0.31`, and React Native `0.88.1`. Try stable NativeWind `4.2.7` on a physical iPhone. Verify Metro bundling, styles in development and release builds, and all four native tabs. If stable NativeWind fails on SDK 58, pause and bring the dependency decision back to the owner. [Expo SDK 58](https://docs.expo.dev/versions/v58.0.0/) · [Expo Router native tabs](https://docs.expo.dev/versions/v58.0.0/sdk/router/native-tabs/) · [NativeWind installation](https://www.nativewind.dev/docs/getting-started/installation)
- Set up separate Clerk and Convex environments for development and the beta. Configure the iOS bundle ID and provider credentials. Keep secrets server-side, install Expo dependencies with `npx expo install`, and use EAS development builds for device checks.
- Connect Clerk to Convex. Verify first-time and returning Google and Apple sign-in, session restoration, cancellation, and sign-out. Send first-time users through username selection. Return guests to the post or profile that prompted sign-in after onboarding. Verify the Apple token revocation path during this phase, before it becomes a release blocker. [Clerk Expo quickstart](https://clerk.com/docs/expo/getting-started/quickstart) · [Convex and Clerk integration](https://docs.convex.dev/auth/clerk) · [Apple account deletion guidance](https://developer.apple.com/go/?id=ar-ad-support)

### 2. Build profiles, discovery, and the social feed

- Add Convex records for profiles, posts, follows, likes, comments, conversations, participant read state, messages, blocks, reports, and media submissions. Key profiles to the authenticated Clerk subject. Index normalized usernames, relationship pairs, post publication order, conversation membership, and message order.
- Add paginated queries for Explore, Home, post details, comments, profiles, the inbox, and chat history. Guests can read approved public content. Convex checks authentication, ownership, block status, chat membership, and moderator role on every operation that needs them. Public profiles expose only public fields.
- Add follow and unfollow, like and unlike, comments, and deletion of the user’s own posts and comments. Use transactional mutations and unique relationship pairs so retries and duplicate taps do not create duplicate follows or likes. Hiding a deleted post also hides its comments and media.

### 3. Add posting and moderation

- Add a foreground composer using the device’s photo library. Let users preview one photo or video and add an optional caption. Limit photos to **10 MB** and videos to **30 seconds and 25 MB**. Use Expo ImagePicker and Expo Video. Show upload progress, a clear validation or failure state, and a retry that retains the selection and caption. Use video thumbnails in grids and tap-to-play in post detail. [Expo ImagePicker](https://docs.expo.dev/versions/v58.0.0/sdk/imagepicker/) · [Expo Video](https://docs.expo.dev/versions/v58.0.0/sdk/video/)
- Store media in Convex and associate it with a submission owned by the uploader. Check size and media type on the server. Check video duration in the composer and again before approval. Reuse a submission ID on retry and clean up abandoned uploads. Keep pending and rejected media accessible only to the author and moderators through access-checked media endpoints. Verify thumbnail retrieval and video seeking on a physical iPhone. [Convex uploads](https://docs.convex.dev/file-storage/upload-files) · [Convex file access controls](https://docs.convex.dev/file-storage/serve-files)
- Add a private in-app review queue. Moderators can preview submissions, approve or reject posts and avatars, review reports, and remove published content. Authors can see submission status. Keep the previous approved avatar visible while a replacement is pending. Apply a basic server-side filter to public comments and profile text. Support reports on posts, comments, profiles, and individual DMs, and publish a support contact. [Apple App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/)

### 4. Add messaging, blocking, and account deletion

- Use one conversation per user pair. Check mutual following when the first message creates a conversation. An unfollow leaves existing chats active. Send plain text in real time, update read state when the recipient views the conversation, and show unread counts on the Messages tab. Use a client-generated message ID to deduplicate retries. Limit access to participants, with moderators able to review a specifically reported message.
- Blocking removes follows in both directions, hides each account and its content from the other while signed in, and prevents new messages. Show the user’s blocks in Settings and support unblocking without restoring follows. Approved public content remains visible in guest mode.
- Expose account deletion in Settings. After confirmation, immediately hide the account and stop new writes. Run cleanup as a retryable background job that removes the profile, public content, media, relationships, and the user’s sent messages. Preserve messages sent by the other participant and close the conversation to new sends. Revoke Apple tokens when applicable and delete the Clerk account. Surface persistent cleanup failures to the beta operator. [Apple account deletion guidance](https://developer.apple.com/go/?id=ar-ad-support)

### 5. Verify and release the beta

- Run `npx expo lint` and `npx tsc --noEmit`. On two physical iPhones with separate accounts, verify both sign-in providers, username collisions, guest access, follow and feed behavior, likes and comments, photo and video posting, approval and rejection, live chat and unread state, blocking, and account deletion.
- Exercise slow connections, interrupted uploads, repeated submits, media at the limits, attempt to access another user’s pending media or chat, and access moderator functions as an ordinary user. Check VoiceOver labels, Dynamic Type, loading and empty states, and navigation after signing out or switching accounts.
- Before inviting testers, name the moderator, publish the support contact and privacy policy, confirm Apple provider credentials and revocation, and submit the EAS build for external TestFlight review. During beta, watch the moderation backlog, auth and upload failures, account cleanup failures, and Convex storage and bandwidth. Keep tokens and private message text out of diagnostics. [TestFlight overview](https://developer.apple.com/help/app-store-connect/test-a-beta-version/testflight-overview/)

## Assumptions and open risks

- **Assumptions.** The beta is English-only. Usernames are case-insensitively unique and fixed once chosen. Writes require connectivity and expose explicit retries. Video uses the original supported library file, with no dedicated transcoding service in the beta.
- **Early technical gates.** Stable NativeWind on SDK 58, Apple token revocation with the selected Clerk sign-in flow, and end-to-end upload and playback of real iPhone media need physical-device verification.
- **Open operating decisions.** The owner still needs to set a launch date, name the moderator, agree on a report response target, and decide on a recurring spend cap before widening access.
