"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

export default function Summary({
  icon,
  image,
  number,
  description,
  bgColor,
  className,
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-6 text-white relative overflow-hidden",
        bgColor || "bg-gray-500",
        className
      )}
    >
      {/* Icon in top-right corner */}
      {(icon || image) && (
        <div className="absolute top-2 start-4 mb-4">
          {icon ? (
            <div className="text-white">{icon}</div>
          ) : (
            <Image
              src={image}
              alt="stats icon"
              width={48}
              height={48}
              className="w-12 h-12 object-contain"
            />
          )}
        </div>
      )}

      {/* Number */}
      <div className="text-4xl font-bold mb-2 mt-8">{number}</div>

      {/* Description */}
      <div className="text-white/90 text-sm">{description}</div>
    </div>
  );
}
