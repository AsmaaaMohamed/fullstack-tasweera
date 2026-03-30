"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { useArtistAuth } from "@/contexts/ArtistAuthContext";

export default function AddStoryCard({ onClick }) {
  const locale = useLocale();
  const t = useTranslations("ArtistHome");
  const { user } = useArtistAuth();
  // Get profile picture from user object or use default
  const profileImage =
    user?.profile_picture_url ||
    "/images/photographers/photographer.jpg";

  return (
    <button
      onClick={onClick}
      className="block flex-shrink-0 focus:outline-none"
      aria-label={locale === "en" ? "Add Story" : "إضافة قصة"}
    >
      <div className="relative w-[85px] sm:w-[160px] cursor-pointer group">
        {/* Story Card Container */}
        <div className="relative h-[130px] sm:h-[214px] rounded-[8px] sm:rounded-[10px] overflow-visible bg-gray-100 dark:bg-gray-800">
          {/* Plus Icon in Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <Plus
              size={40}
              className="text-[#E6A525] sm:w-12 sm:h-12"
              strokeWidth={2.5}
            />
          </div>

          {/* Profile Picture - overlapping bottom edge */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 mb-2">
            <div className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]">
              {/* Golden border */}
              <div className="absolute inset-0 rounded-full border-[3px] sm:border-[3.5px] border-[#E6A525] p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <Image
                    src={profileImage}
                    alt={locale === "en" ? "You" : "أنت"}
                    fill
                    className="object-cover rounded-full"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Name / "You" Text */}
        <div className="mt-7 sm:mt-8 text-center">
          <p className="text-xs text-black dark:text-white font-medium truncate px-0.5 leading-tight">
            {t("you") || (locale === "en" ? "You" : "أنت")}
          </p>
        </div>
      </div>
    </button>
  );
}

