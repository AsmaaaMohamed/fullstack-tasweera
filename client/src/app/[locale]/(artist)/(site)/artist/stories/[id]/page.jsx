"use client";

import { useRouter } from "@/i18n/navigation";
import StoryViewer from "@/components/user/story/StoryViewer";
import { useMemo, use } from "react";
import { useStories } from "@/contexts/StoriesContext";

export default function ArtistStoryDetailPage({ params }) {
  const router = useRouter();
  const { id } = use(params); // params is an object, extract id directly

  const numericId = Number(id);
  const { storiesByArtistId, orderedArtistIds, isLoading, refresh } =
    useStories();

  const { uiStories, currentStoryId } = useMemo(() => {
    // Create a flat list of ALL stories from the artist in order
    const allStories = orderedArtistIds
      .map((artistId) => storiesByArtistId[artistId])
      .filter(Boolean)
      .flatMap((group) => {
        if (!Array.isArray(group.stories)) return [];

        return group.stories.map((s) => ({
          id: s.id,
          backgroundImage: s.media_url,
          profileImage:
            group.artist_profile_photo_url ||
            "/images/photographers/photographer.jpg",
          userName: group.artist_name,
          userId: group.artist_id,
          viewsCount: s.views_count || 0,
        }));
      });

    return { uiStories: allStories, currentStoryId: numericId };
  }, [orderedArtistIds, storiesByArtistId, numericId]);

  const handleClose = () => {
    router.back();
  };

  if (isLoading && uiStories.length === 0) {
    return null;
  }

  return (
    <StoryViewer
      stories={uiStories}
      currentStoryId={currentStoryId}
      onClose={handleClose}
      canDelete={true}
      onStoryDelete={() => {
        refresh();
        router.push("/artist-home");
      }}
    />
  );
}
