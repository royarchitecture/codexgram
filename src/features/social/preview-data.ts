import type { ImageSource } from "expo-image";

export type Person = { name: string; handle: string; avatar: ImageSource };
export type Post = {
  id: string;
  image: ImageSource;
  author: Person;
  caption: string;
  duration?: string;
};

export const mara = { name: "Mara Chen", handle: "marachen", avatar: require("@/assets/images/preview/mara.jpg") };
export const eli = { name: "Eli Park", handle: "elipark", avatar: require("@/assets/images/preview/eli.jpg") };
export const jules = { name: "Jules Rivera", handle: "julesrivera", avatar: require("@/assets/images/preview/jules.jpg") };
export const noa = { name: "Noa Bell", handle: "noabell", avatar: require("@/assets/images/preview/noa.jpg") };

const fog = { id: "fog", image: require("@/assets/images/preview/fog-coast.jpg"), author: mara, caption: "Coast before the fog lifted." };
const coffee = { id: "coffee", image: require("@/assets/images/preview/coffee.jpg"), author: eli, caption: "The quiet table by the window." };
const rain = { id: "rain", image: require("@/assets/images/preview/rain.jpg"), author: noa, caption: "Last train, first rain.", duration: "0:18" };
const golden = { id: "golden", image: require("@/assets/images/preview/golden-coast.jpg"), author: mara, caption: "The coast in afternoon light." };
const hiker = { id: "hiker", image: require("@/assets/images/preview/hiker.jpg"), author: mara, caption: "Up before the fog broke." };
const waves = { id: "waves", image: require("@/assets/images/preview/waves.jpg"), author: mara, caption: "Winter waves on the headland." };
const moon = { id: "moon", image: require("@/assets/images/preview/moon.jpg"), author: mara, caption: "The coast after dark." };

export const explorePosts: Post[] = [
  fog, coffee,
  { id: "portrait", image: require("@/assets/images/preview/portrait.jpg"), author: eli, caption: "A moment between takes." },
  rain, golden,
  { id: "flowers", image: require("@/assets/images/preview/flowers.jpg"), author: jules, caption: "Flowers in the window." },
  { id: "court", image: require("@/assets/images/preview/court.jpg"), author: noa, caption: "Late afternoon at the court." },
  hiker,
  { id: "chair", image: require("@/assets/images/preview/chair.jpg"), author: jules, caption: "One red chair." },
  { id: "cafe", image: require("@/assets/images/preview/cafe.jpg"), author: eli, caption: "A rainy stop for coffee." },
  waves, moon,
];

export const profilePosts: Post[] = [
  { ...fog, image: require("@/assets/images/preview/profile-fog.jpg") },
  { ...golden, image: require("@/assets/images/preview/profile-golden.jpg") },
  { ...waves, image: require("@/assets/images/preview/profile-waves.jpg") },
  { id: "marsh", image: require("@/assets/images/preview/marsh.jpg"), author: mara, caption: "Quiet morning on the marsh." },
  { ...moon, image: require("@/assets/images/preview/profile-moon.jpg") },
  { ...hiker, image: require("@/assets/images/preview/profile-hiker.jpg") },
];

export const feed: (Post & {
  aspect: number;
  likes: number;
  liked: boolean;
  time: string;
})[] = [
  { ...coffee, image: require("@/assets/images/preview/feed-coffee.jpg"), aspect: 362 / 352, likes: 17, liked: true, time: "Today at 8:12 AM" },
  { ...rain, image: require("@/assets/images/preview/feed-rain.jpg"), aspect: 362 / 105, likes: 31, liked: false, time: "Yesterday at 9:16 PM" },
];

export const conversations = [
  { person: eli, body: "Was that near the old lookout?", time: "5m", unread: true },
  { person: jules, body: "That fog was worth the early start.", time: "1h", unread: true },
  { person: noa, body: "Thanks for watching the clip.", time: "Yesterday", unread: false },
];

export const elise = { name: "Elise Morgan", handle: "elisefilm", avatar: require("@/assets/images/preview/elise.jpg") };
export const people = [mara, eli, elise, jules, noa];

export const eliPosts: Post[] = [
  { ...coffee, image: require("@/assets/images/preview/public-coffee.jpg") },
  { id: "eli-flowers", author: eli, image: require("@/assets/images/preview/public-flowers.jpg"), caption: "Flowers in the window." },
  { id: "eli-chair", author: eli, image: require("@/assets/images/preview/public-chair.jpg"), caption: "One red chair." },
  { id: "eli-cafe", author: eli, image: require("@/assets/images/preview/public-cafe.jpg"), caption: "A rainy stop for coffee." },
  { id: "eli-book", author: eli, image: require("@/assets/images/preview/public-book.jpg"), caption: "One more chapter." },
  { id: "eli-machine", author: eli, image: require("@/assets/images/preview/public-machine.jpg"), caption: "First coffee." },
];

export type PreviewComment = { id: string; author: Person; body: string; time: string };
export const postComments: Record<string, PreviewComment[]> = {
  coffee: [
    { id: "coffee-1", author: jules, body: "Love the afternoon light.", time: "1h" },
    { id: "coffee-2", author: mara, body: "I always take that table too.", time: "42m" },
    { id: "coffee-3", author: noa, body: "I can almost smell the coffee.", time: "21m" },
  ],
  rain: [
    { id: "rain-1", author: jules, body: "Those reflections are unreal.", time: "2h" },
    { id: "rain-2", author: mara, body: "This feels like a film still.", time: "1h" },
    { id: "rain-3", author: eli, body: "Love the colors.", time: "45m" },
    { id: "rain-4", author: elise, body: "The rain makes this.", time: "32m" },
    { id: "rain-5", author: jules, body: "That light at the end of the street.", time: "10m" },
  ],
};

export const detailRain = require("@/assets/images/preview/detail-rain.jpg");
export const pears = require("@/assets/images/preview/pears.jpg");
