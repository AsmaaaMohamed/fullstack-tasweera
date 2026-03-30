"use client";

import { useLocale, useTranslations } from "next-intl";
import Story from "@/components/user/story/Story";
import { useStories } from "@/contexts/StoriesContext";

export default function StoriesPage() {
  const t = useTranslations("UserHome");
  const locale = useLocale();
  const {
    orderedArtistIds,
    storiesByArtistId,
    isLoading,
    error,
    hasMore,
    loadNextPage,
  } = useStories();

  const uiStories = orderedArtistIds
    .map((artistId) => {
      const group = storiesByArtistId[artistId];
      const firstStory = group?.stories?.[0];
      if (!firstStory) return null;
      return {
        id: firstStory.id,
        backgroundImage: firstStory?.media_url || "/stories/story-1.png",
        profileImage:
          group?.artist_profile_photo_url ||
          "/images/photographers/photographer.jpg",
        userName: group?.artist_name || "",
        userId: group?.artist_id,
      };
    })
    .filter(Boolean);

  const noStories = !isLoading && uiStories.length === 0;

  return (
    <main className="min-h-screen bg-white dark:bg-[#363636] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white">
            {t("all-stories")}
          </h1>
        </div>

        {error && (
          <div className="text-sm text-red-600 dark:text-red-400 mb-4">
            {error}
          </div>
        )}

        {/* Stories Grid */}
        {uiStories.length > 0 ? (
          <div className="grid grid-cols-4 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {uiStories.map((story) => (
              <Story key={story.id} story={story} />
            ))}
          </div>
        ) : noStories ? (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400">
              {locale === "en" ? "No stories available" : "لا توجد قصص متاحة"}
            </p>
          </div>
        ) : null}

        {/* Load more */}
        {hasMore && (
          <div className="flex justify-center mt-6">
            <button
              disabled={isLoading}
              onClick={loadNextPage}
              className="px-4 py-2 rounded bg-gray-100 dark:bg-[#363636] text-gray-800 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-[#363636] disabled:opacity-60"
            >
              {isLoading
                ? locale === "en"
                  ? "Loading..."
                  : "جاري التحميل..."
                : locale === "en"
                ? "Load more"
                : "تحميل المزيد"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
