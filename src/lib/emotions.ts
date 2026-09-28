export type EmotionConfig = {
  slug: string;
  labelId: string;
  labelEn: string;
  image: string;
};

export const EMOTIONS: Record<string, EmotionConfig> = {
  happy: {
    slug: "happy",
    labelId: "Senang",
    labelEn: "Happy",
    image: "/emotions-emoji/happy.png",
  },

  sad: {
    slug: "sad",
    labelId: "Sedih",
    labelEn: "Sad",
    image: "/emotions-emoji/sad.png",
  },

  angry: {
    slug: "angry",
    labelId: "Marah",
    labelEn: "Angry",
    image: "/emotions-emoji/angry.png",
  },

  anxious: {
    slug: "anxious",
    labelId: "Cemas",
    labelEn: "Anxious",
    image: "/emotions-emoji/anxious.png",
  },

  stressed: {
    slug: "stressed",
    labelId: "Stres",
    labelEn: "Stressed",
    image: "/emotions-emoji/stressed.png",
  },

  calm: {
    slug: "calm",
    labelId: "Tenang",
    labelEn: "Calm",
    image: "/emotions-emoji/calm.png",
  },

  tired: {
    slug: "tired",
    labelId: "Lelah",
    labelEn: "Tired",
    image: "/emotions-emoji/tired.png",
  },

  excited: {
    slug: "excited",
    labelId: "Antusias",
    labelEn: "Excited",
    image: "/emotions-emoji/excited.png",
  },

  lonely: {
    slug: "lonely",
    labelId: "Kesepian",
    labelEn: "Lonely",
    image: "/emotions-emoji/lonely.png",
  },

  grateful: {
    slug: "grateful",
    labelId: "Bersyukur",
    labelEn: "Grateful",
    image: "/emotions-emoji/grateful.png",
  },

  frustrated: {
    slug: "frustrated",
    labelId: "Frustrasi",
    labelEn: "Frustrated",
    image: "/emotions-emoji/frustrated.png",
  },

  overwhelmed: {
    slug: "overwhelmed",
    labelId: "Kewalahan",
    labelEn: "Overwhelmed",
    image: "/emotions-emoji/overwhelmed.png",
  },
};

export function getEmotionConfig(emotion: string) {
  return EMOTIONS[emotion.toLowerCase()] ?? null;
}