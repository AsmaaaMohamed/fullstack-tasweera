"use client";

import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import Story from "@/components/user/story/Story";
import { Camera, ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect, useCallback } from "react";
import { useStories } from "@/contexts/StoriesContext";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { useRouter } from "@/i18n/navigation";
import AddStoryCard from "./add-story-card";
import UploadStoryDialog from "./upload-story-dialog";

export default function ArtistStoriesSection({ isAuth }) {
  const t = useTranslations("ArtistHome");
  const locale = useLocale();
  const isRtl = locale === "ar";
  const scrollContainerRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const sentinelRef = useRef(null);
  const router = useRouter();
  const [isUploadDialogOpen, setIsUploadDialogOpen] = useState(false);
  const {
    orderedArtistIds,
    storiesByArtistId,
    isLoading,
    error,
    hasMore,
    loadNextPage,
    refresh,
  } = useStories();

  // For artist's own stories, show all individual story cards
  // For other artists' stories (if any), show one card per artist
  const uiStories = orderedArtistIds
    .flatMap((artistId) => {
      const group = storiesByArtistId[artistId];
      if (!group || !group.stories || group.stories.length === 0) return [];

      // For artist's own stories (when using artist endpoint), show all stories as individual cards
      // Otherwise, show only the first story as a representative card
      const storiesToShow = group.stories.length > 0 ? group.stories : [];

      return storiesToShow.map((story) => ({
        id: story.id,
        backgroundImage: story?.media_url || "/stories/story-1.png",
        profileImage:
          group?.artist_profile_photo_url ||
          "/images/photographers/photographer.jpg",
        userName: group?.artist_name || "",
        userId: group?.artist_id,
      }));
    })
    .filter(Boolean);

  const noStories = !isLoading && uiStories.length === 0;

  // Check scroll position to enable/disable navigation buttons
  const checkScrollPosition = useCallback(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const { scrollLeft, scrollWidth, clientWidth } = container;
    const maxScrollLeft = scrollWidth - clientWidth;

    // For RTL, scrollLeft can be negative, so we need to check differently
    if (isRtl) {
      const isAtStart = scrollLeft >= 0 || Math.abs(scrollLeft) < 5;
      const isAtEnd = Math.abs(scrollLeft) >= maxScrollLeft - 5;

      setCanScrollLeft(!isAtStart);
      setCanScrollRight(!isAtEnd);
    } else {
      setCanScrollLeft(scrollLeft > 5);
      setCanScrollRight(scrollLeft < maxScrollLeft - 5);
    }
  }, [isRtl]);

  // Check scroll position on mount and resize
  useEffect(() => {
    const timeoutId = setTimeout(checkScrollPosition, 100);
    const container = scrollContainerRef.current;

    if (container) {
      container.addEventListener("scroll", checkScrollPosition);
      window.addEventListener("resize", checkScrollPosition);
    }

    return () => {
      clearTimeout(timeoutId);
      if (container) {
        container.removeEventListener("scroll", checkScrollPosition);
        window.removeEventListener("resize", checkScrollPosition);
      }
    };
  }, [checkScrollPosition]);

  // Infinite scroll sentinel using IntersectionObserver
  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry.isIntersecting && hasMore && !isLoading) {
          loadNextPage();
        }
      },
      { root: null, rootMargin: "200px", threshold: 0 }
    );

    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [hasMore, isLoading, loadNextPage]);

  // Scroll functions
  const scrollLeft = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    if (isRtl) {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const scrollAmount = container.clientWidth * 0.8;
    if (isRtl) {
      container.scrollBy({ left: -scrollAmount, behavior: "smooth" });
    } else {
      container.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleUploadSuccess = () => {
    // Refresh stories after successful upload
    if (refresh) {
      refresh();
    }
  };

  return (
    <section className="px-4 sm:px-6 pt-6 sm:pt-10 bg-white dark:bg-[#363636]">
      {/* Header */}
      <div className="flex justify-between items-center mb-4 sm:mb-5 px-4">
        {/* Show More Link - Left in RTL, Right in LTR */}
        <Link
          href="/stories"
          className={`text-[#E6A525] hover:text-[#D4941F] transition-colors text-sm sm:text-base font-normal ${
            isRtl ? "order-1" : "order-2"
          }`}
        >
          {t("show-more") || (locale === "en" ? "Show more" : "عرض المزيد")}
        </Link>
        {/* Story Title - Right in RTL, Left in LTR */}
        <h2
          className={`font-semibold text-base sm:text-lg text-black dark:text-white ${
            isRtl ? "order-2" : "order-1"
          }`}
        >
          {t("story") || (locale === "en" ? "Story" : "ستوري")}
        </h2>
      </div>

      {/* Error and loading indicators */}
      {error && (
        <div className="px-4 text-sm text-red-600 dark:text-red-400 mb-2">
          {error}
        </div>
      )}

      {!isAuth && (
        <Empty className="bg-white dark:bg-[#363636] border-slate-200 dark:border-slate-800 !p-0 flex justify-center items-center">
          <EmptyMedia
            variant="icon"
            className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 text-amber-600 dark:text-amber-400"
          >
            <Camera className="size-6" />
          </EmptyMedia>
          <EmptyHeader>
            <EmptyTitle className="text-slate-900 dark:text-slate-50">
              {locale === "en"
                ? "Sign in to view stories"
                : "سجل الدخول لعرض القصص"}
            </EmptyTitle>
            <EmptyDescription className="text-slate-600 dark:text-slate-400 mt-1">
              <PrimaryButton onClick={() => router.push("/artist/signin")}>
                {locale === "en" ? "Sign in" : "سجل الدخول"}
              </PrimaryButton>
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {/* Horizontal Scrollable Stories */}
      {isAuth && (
        <div className="relative">
          {/* Left Navigation Button - Only on large screens */}
          {canScrollLeft && (
            <button
              onClick={scrollLeft}
              className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#363636] shadow-lg border border-gray-200 dark:border-[#363636] hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors"
              aria-label={
                isRtl ? t("next") || "Next" : t("previous") || "Previous"
              }
            >
              <ChevronLeft
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </button>
          )}

          {/* Right Navigation Button - Only on large screens */}
          {canScrollRight && (
            <button
              onClick={scrollRight}
              className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden lg:flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-[#363636] shadow-lg border border-gray-200 dark:border-[#363636] hover:bg-gray-50 dark:hover:bg-[#363636] transition-colors"
              aria-label={
                isRtl ? t("previous") || "Previous" : t("next") || "Next"
              }
            >
              <ChevronRight
                size={20}
                className="text-gray-700 dark:text-gray-300"
              />
            </button>
          )}

          <div
            ref={scrollContainerRef}
            className="overflow-x-auto pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6 scrollbar-hide"
          >
            <div className="flex items-center gap-3 sm:gap-4">
              {/* Add Story Card - First item */}
              <AddStoryCard onClick={() => setIsUploadDialogOpen(true)} />

              {noStories && (
                <Empty className="bg-white dark:bg-[#363636] border-slate-200 dark:border-slate-800 !p-0 flex justify-center items-center min-w-[200px]">
                  <EmptyMedia
                    variant="icon"
                    className="bg-gradient-to-br from-amber-100 to-orange-100 dark:from-amber-950 dark:to-orange-950 text-amber-600 dark:text-amber-400"
                  >
                    <Camera className="size-6" />
                  </EmptyMedia>
                  <EmptyHeader>
                    <EmptyTitle className="text-slate-900 dark:text-slate-50">
                      {locale === "en"
                        ? "No stories available"
                        : "لا توجد قصص متاحة"}
                    </EmptyTitle>
                    <EmptyDescription className="text-slate-600 dark:text-slate-400 mt-1">
                      {locale === "en"
                        ? "Share your moments with the community"
                        : "شارك لحظاتك مع المجتمع"}
                    </EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}

              {/* Existing Stories */}
              {uiStories.map((story) => (
                <Story key={story.id} story={story} isArtistStory={true} />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Infinite scroll sentinel */}
      {isAuth && <div ref={sentinelRef} className="h-4 w-full" />}

      {/* Loading indicator under the list */}
      {isAuth && isLoading && (
        <div className="px-4 text-sm text-gray-500 dark:text-gray-400">
          {t("loading") || "Loading..."}
        </div>
      )}

      {/* Upload Story Dialog */}
      <UploadStoryDialog
        open={isUploadDialogOpen}
        onOpenChange={setIsUploadDialogOpen}
        onSuccess={handleUploadSuccess}
      />
    </section>
  );
}
