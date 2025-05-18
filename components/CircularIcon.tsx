"use client";
import Image from "next/image";
import { useState } from "react";

interface CircularIconProps {
  imageUrl: string;
  alt: string;
  size?: number;
  onClick?: () => void;
}

export default function CircularIcon({
  imageUrl,
  alt,
  size = 40,
  onClick,
}: CircularIconProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className="absolute top-4 right-4 z-50 shadow-lg transition-transform duration-200 ease-in-out"
      style={{
        transform: isHovered ? "scale(1.1)" : "scale(1)",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
    >
      <div
        className="rounded-full overflow-hidden border-2 border-white cursor-pointer"
        style={{ width: size, height: size }}
      >
        <Image
          src={imageUrl || "/placeholder.svg"}
          alt={alt}
          width={size}
          height={size}
          className="object-cover"
          priority
        />
      </div>
    </div>
  );
}
