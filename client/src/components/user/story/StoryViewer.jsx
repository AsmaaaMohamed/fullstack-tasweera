"use client";
import { useRouter } from "@/i18n/navigation";
import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { deleteStory } from "@/lib/deleteStory";

const STORY_DURATION = 5000; // 5 seconds per story
const PLACEHOLDER_BACKGROUND = "/stories/story-1.png";
const PLACEHOLDER_PROFILE = "/images/photographers/photographer.jpg";

export default function StoryViewer({
  stories,
  currentStoryId,
  onClose,
  canDelete = false,
  onStoryDelete,
}) {
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [backgroundError, setBackgroundError] = useState(false);
  const [profileError, setProfileError] = useState(false);
  const progressIntervalRef = useRef(null);
  const videoRef = useRef(null);
  const locale = useLocale();
  const t = useTranslations("Stories");
  const isRtl = locale === "ar";

  // Helper function to detect if media is video
  const getMediaType = (url) => {
    if (!url) return "image";
    const videoExtensions = [".mp4", ".webm", ".ogg", ".mov", ".avi"];
    const lowerUrl = url.toLowerCase();
    return videoExtensions.some((ext) => lowerUrl.includes(ext))
      ? "video"
      : "image";
  };

  const currentStory = stories[currentIndex];
  const isVideo = currentStory
    ? getMediaType(currentStory.backgroundImage) === "video"
    : false;

  const handleNext = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex < stories.length - 1) {
        setProgress(0);
        return prevIndex + 1;
      } else {
        // No-op at the end on manual next
        return prevIndex;
      }
    });
  }, [stories.length]);

  const handlePrevious = useCallback(() => {
    setCurrentIndex((prevIndex) => {
      if (prevIndex > 0) {
        setProgress(0);
        return prevIndex - 1;
      }
      return prevIndex;
    });
  }, []);

  const handleDelete = async (e) => {
    e.stopPropagation();
    if (
      !confirm(
        t("confirm_delete") || "Are you sure you want to delete this story?"
      )
    )
      return;

    try {
      setIsPaused(true);
      await deleteStory(currentStory.id);
      if (onStoryDelete) {
        onStoryDelete(currentStory.id);
      } else {
        // Fallback if no callback provided: close or reload
        window.location.reload();
      }
    } catch (err) {
      console.error("Failed to delete story", err);
      setIsPaused(false);
      alert(t("delete_failed") || "Failed to delete story");
    }
  };

  // Find initial index
  useEffect(() => {
    const index = stories.findIndex((s) => s.id === currentStoryId);
    if (index !== -1) {
      setCurrentIndex(index);
    }
  }, [currentStoryId, stories]);

  // Handle progress and auto-advance
  useEffect(() => {
    if (isPaused) return;

    // For videos, progress is synced via onTimeUpdate, not setInterval
    if (isVideo) return;

    // For images: use interval-based progress
    progressIntervalRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          if (currentIndex < stories.length - 1) {
            handleNext();
            return 0;
          }
          // Stop at last story
          return 100;
        }
        return prev + 2; // Update every 100ms (100 updates for 5 seconds)
      });
    }, 100);

    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
      }
    };
  }, [isPaused, handleNext, currentIndex, stories.length, isVideo]);

  // Reset progress when story changes
  useEffect(() => {
    setProgress(0);
    // Reset error states when story changes
    setBackgroundError(false);
    setProfileError(false);

    // Reset and play video when switching to a video story
    if (isVideo && videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play().catch(() => {
        // Auto-play may be blocked, user interaction required
      });
    }
  }, [currentIndex, isVideo]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      } else if (e.key === "Escape") {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyPress);
    return () => window.removeEventListener("keydown", handleKeyPress);
  }, [handleNext, handlePrevious, onClose]);

  // Touch handlers for swipe
  const minSwipeDistance = 50;

  const onTouchStart = (e) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);

    // Pause video when touching
    if (isVideo && videoRef.current) {
      videoRef.current.pause();
    }
  };

  const onTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsPaused(false);

      // Resume video if just a tap (no swipe)
      if (isVideo && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
      return;
    }

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      if (isRtl) {
        handlePrevious();
      } else {
        handleNext();
      }
    }
    if (isRightSwipe) {
      if (isRtl) {
        handleNext();
      } else {
        handlePrevious();
      }
    }

    setIsPaused(false);

    // Resume video after swipe
    if (isVideo && videoRef.current) {
      videoRef.current.play().catch(() => {});
    }
  };

  // Click handlers for desktop with event suppression
  const handleLeftClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRtl) {
      handleNext();
    } else {
      handlePrevious();
    }
  };

  const handleRightClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (isRtl) {
      handlePrevious();
    } else {
      handleNext();
    }
  };

  const handleCenterClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    // Toggle pause/play
    if (isPaused) {
      setIsPaused(false);
      if (isVideo && videoRef.current) {
        videoRef.current.play().catch(() => {});
      }
    } else {
      setIsPaused(true);
      if (isVideo && videoRef.current) {
        videoRef.current.pause();
      }
    }
  };

  if (!currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center">
      {/* Progress Bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gray-700 z-50">
        <div
          className="h-full bg-white transition-all duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Close Button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors"
        aria-label={t("close")}
      >
        <X size={24} />
      </button>

      {/* User Info */}
      <div className="absolute top-4 left-4 z-50 flex items-center gap-3">
        <div
          className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-[#E6A525]"
          onClick={() =>
            router.push(`/provider-details/${currentStory.userId}`)
          }
        >
          <Image
            src={
              profileError
                ? PLACEHOLDER_PROFILE
                : currentStory.profileImage || PLACEHOLDER_PROFILE
            }
            alt={currentStory.userName}
            fill
            className="object-cover"
            onError={() => setProfileError(true)}
          />
        </div>
        <span className="text-white font-medium">{currentStory.userName}</span>
      </div>

      {/* Story Media (Image or Video) */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {isVideo ? (
          <video
            ref={videoRef}
            src={currentStory.backgroundImage}
            className="w-full h-full object-contain"
            autoPlay
            // muted
            playsInline
            onLoadedMetadata={(e) => {
              // Video duration loaded
              const video = e.target;
              if (video.duration) {
                // We'll sync progress in onTimeUpdate
              }
            }}
            onTimeUpdate={(e) => {
              const video = e.target;
              if (video.duration) {
                const progressPercent =
                  (video.currentTime / video.duration) * 100;
                setProgress(progressPercent);
              }
            }}
            onEnded={() => {
              if (currentIndex < stories.length - 1) {
                handleNext();
              }
            }}
            onPause={() => setIsPaused(true)}
            onPlay={() => setIsPaused(false)}
          />
        ) : (
          <Image
            src={
              backgroundError
                ? PLACEHOLDER_BACKGROUND
                : currentStory.backgroundImage || PLACEHOLDER_BACKGROUND
            }
            alt={currentStory.userName}
            fill
            className="object-contain"
            priority
            onError={() => setBackgroundError(true)}
          />
        )}

        {/* Left Click Area (Previous) */}
        <div
          className="absolute left-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
          onClick={handleLeftClick}
          aria-label={t("previous-story")}
        />

        {/* Center Click Area (Pause/Play) */}
        <div
          className="absolute left-1/3 top-0 bottom-0 w-1/3 cursor-pointer z-10"
          onClick={handleCenterClick}
          aria-label={isPaused ? t("play") : t("pause")}
        />

        {/* Right Click Area (Next) */}
        <div
          className="absolute right-0 top-0 bottom-0 w-1/3 cursor-pointer z-10"
          onClick={handleRightClick}
          aria-label={t("next-story")}
        />
      </div>

      {/* Navigation Arrows (Desktop) */}
      {currentIndex > 0 && (
        <button
          onClick={handlePrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors hidden md:block"
          aria-label={t("previous-story")}
        >
          <ChevronLeft size={24} />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          onClick={handleNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 z-10 p-2 rounded-full bg-black/50 hover:bg-black/70 text-white transition-colors hidden md:block"
          aria-label={t("next-story")}
        >
          <ChevronRight size={24} />
        </button>
      )}

      {/* View Counter */}
      {currentStory.viewsCount !== undefined && (
        <div className="absolute bottom-4 left-4 z-50 flex items-center gap-2 bg-black/50 px-3 py-1.5 rounded-full">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="text-white"
          >
            <path
              d="M12 5C7.03 5 2.73 8.11 1 12.5C2.73 16.89 7.03 20 12 20C16.97 20 21.27 16.89 23 12.5C21.27 8.11 16.97 5 12 5ZM12 17C9.24 17 7 14.76 7 12C7 9.24 9.24 7 12 7C14.76 7 17 9.24 17 12C17 14.76 14.76 17 12 17ZM12 9C10.34 9 9 10.34 9 12C9 13.66 10.34 15 12 15C13.66 15 15 13.66 15 12C15 10.34 13.66 9 12 9Z"
              fill="currentColor"
            />
          </svg>
          <span className="text-white text-sm font-medium">
            {currentStory.viewsCount} {locale === "ar" ? "مشاهدات" : "views"}
          </span>
        </div>
      )}

      {/* Delete Button */}
      {canDelete && (
        <button
          onClick={handleDelete}
          className="absolute bottom-4 right-4 z-50 p-2 rounded-full bg-black/50 hover:bg-red-600/80 text-white transition-colors"
          aria-label={t("delete") || "Delete"}
        >
          <Trash2 size={20} />
        </button>
      )}
    </div>
  );
}
