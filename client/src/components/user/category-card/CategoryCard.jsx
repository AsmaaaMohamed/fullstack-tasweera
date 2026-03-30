"use client";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";

export default function CategoryCard({ title, image, href }) {
  const router = useRouter();

  return (
    <div
      onClick={() => router.push(href)}
      className="flex flex-col sm:flex-row gap-2 h-[110px] cursor-pointer overflow-hidden rounded-[12px] shadow-md border  dark:border-slate-600 transition-transform hover:scale-[1.02]"
    >
      {/* Right Side - Image */}
      <div className="flex-1 relative">
        <Image src={image} alt={title} fill className="object-cover" />
      </div>
      {/* Left Side - Text */}
      <div className="flex-1 flex items-center justify-center sm:justify-start bg-white dark:bg-[#363636] text-black dark:text-white text-sm font-medium">
        {title}
      </div>
    </div>
  );
}
