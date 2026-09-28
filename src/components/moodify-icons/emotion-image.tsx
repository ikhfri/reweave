import Image from "next/image";

import { getEmotionConfig } from "@/lib/emotions";

type EmotionImageProps = {
  emotion: string;
  size?: number;
  className?: string;
};

export default function EmotionImage({
  emotion,
  size = 64,
  className = "",
}: EmotionImageProps) {
  const config = getEmotionConfig(emotion);

  if (!config) {
    return null;
  }

  return (
    <Image
      src={config.image}
      alt={config.labelEn}
      width={size}
      height={size}
      className={`object-contain ${className}`}
    />
  );
}