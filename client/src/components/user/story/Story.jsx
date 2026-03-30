"use client";

import { useState } from "react";
import Image from "next/image";
import { Link, usePathname } from "@/i18n/navigation";
import { useLocale } from "next-intl";

const PLACEHOLDER_BACKGROUND = "/stories/story-1.png";
const PLACEHOLDER_PROFILE = "/images/photographers/photographer.jpg";

export default function Story({ story, isArtistStory = false }) {
  const locale = useLocale();
  const pathname = usePathname();
  const { id, backgroundImage, profileImage, userName, userId } = story;
  const [backgroundError, setBackgroundError] = useState(false);
  const [profileError, setProfileError] = useState(false);

  // Detect if we're in artist context by checking pathname or prop
  const isArtistContext = isArtistStory || pathname?.includes("/artist") || pathname?.includes("artist-home");
  
  // Use artist route if in artist context, otherwise use user route
  const storyRoute = isArtistContext ? `/artist/stories/${id}` : `/stories/${id}`;

  const displayBackground = backgroundError ? PLACEHOLDER_BACKGROUND : (backgroundImage || PLACEHOLDER_BACKGROUND);
  const displayProfile = profileError ? PLACEHOLDER_PROFILE : (profileImage || PLACEHOLDER_PROFILE);

  return (
    <Link href={storyRoute} className="block flex-shrink-0">
      <div className="relative w-[85px] sm:w-[160px] cursor-pointer group">
        {/* Story Card Container */}
        <div className="relative h-[130px] sm:h-[214px] rounded-[8px] sm:rounded-[10px] overflow-visible">
          {/* Background Image with Overlay */}
          <div className="absolute inset-0 rounded-[8px] sm:rounded-[10px] overflow-hidden">
            <Image
              src={displayBackground}
              alt={userName}
              fill
              className="object-cover"
              onError={() => setBackgroundError(true)}
            />
            {/* Grey Overlay - more visible like in the image */}
            <div className="absolute inset-0 bg-black/40 group-hover:bg-black/30 transition-colors" />
          </div>

          {/* Profile Picture - overlapping bottom edge */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 z-10 mb-2">
            <div className="relative w-[56px] h-[56px] sm:w-[64px] sm:h-[64px]">
              {/* Golden border - more prominent like in the image */}
              <div className="absolute inset-0 rounded-full border-[3px] sm:border-[3.5px] border-[#E6A525] p-0.5">
                <div className="w-full h-full rounded-full overflow-hidden bg-white">
                  <Image
                    src={displayProfile}
                    alt={userName}
                    fill
                    className="object-cover rounded-full"
                    onError={() => setProfileError(true)}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* User Name */}
        <div className="mt-7 sm:mt-8 text-center">
          <p className="text-xs text-black dark:text-white font-medium truncate px-0.5 leading-tight">
            {userName}
          </p>
        </div>
      </div>
    </Link>
  );
}
