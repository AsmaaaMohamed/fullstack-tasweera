"use client";
// src/contexts/StoriesContext.jsx
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { fetchStories, fetchArtistStories } from "@/lib/stories";

const StoriesContext = createContext(null);

export function StoriesProvider({
  children,
  perPage = 10,
  initialIsAuth = false,
  useArtistEndpoint = false,
}) {
  const [orderedArtistIds, setOrderedArtistIds] = useState([]);
  const [storiesByArtistId, setStoriesByArtistId] = useState({});
  const [pagination, setPagination] = useState({
    current_page: 0,
    last_page: 1,
    per_page: perPage,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(initialIsAuth);

  const hasMore = pagination.current_page < pagination.last_page;
  const isFirstLoadRef = useRef(true);

  // Check if user is authenticated by checking for auth_token cookie
  const checkAuth = useCallback(() => {
    const cookies = document.cookie.split(";");
    const authToken = cookies.find((cookie) =>
      cookie.trim().startsWith("auth_token=")
    );
    return !!authToken;
  }, []);

  const mergeStoriesPage = useCallback((pageData) => {
    if (!pageData || !Array.isArray(pageData.stories)) return;

    setOrderedArtistIds((prevIds) => {
      const nextIds = [...prevIds];
      for (const group of pageData.stories) {
        if (!nextIds.includes(group.artist_id)) nextIds.push(group.artist_id);
      }
      return nextIds;
    });

    setStoriesByArtistId((prev) => {
      const next = { ...prev };
      for (const group of pageData.stories) {
        next[group.artist_id] = {
          artist_id: group.artist_id,
          artist_name: group.artist_name,
          artist_profile_photo_url: group.artist_profile_photo_url ?? null,
          all_stories_viewed: !!group.all_stories_viewed,
          stories: Array.isArray(group.stories) ? group.stories : [],
        };
      }
      return next;
    });

    if (pageData.pagination) {
      setPagination((prev) => ({
        current_page: pageData.pagination.current_page,
        last_page: pageData.pagination.last_page,
        per_page: pageData.pagination.per_page ?? prev.per_page,
      }));
    }
  }, []);

  const loadPage = useCallback(
    async (pageNum) => {
      // Don't load if not authenticated
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);
      try {
        const fetchFunction = useArtistEndpoint
          ? fetchArtistStories
          : fetchStories;
        const data = await fetchFunction({ page: pageNum, perPage });
        mergeStoriesPage(data);
      } catch (err) {
        setError(err?.message || "Failed to load stories");
      } finally {
        setIsLoading(false);
      }
    },
    [mergeStoriesPage, perPage, isAuthenticated, useArtistEndpoint]
  );

  const loadFirstPage = useCallback(async () => {
    // Don't load if not authenticated
    if (!isAuthenticated) return;

    // reset state and load page 1
    setOrderedArtistIds([]);
    setStoriesByArtistId({});
    setPagination({ current_page: 0, last_page: 1, per_page: perPage });
    await loadPage(1);
  }, [loadPage, perPage, isAuthenticated]);

  const loadNextPage = useCallback(async () => {
    if (isLoading) return;
    if (!hasMore) return;
    if (!isAuthenticated) return;
    await loadPage(pagination.current_page + 1);
  }, [isLoading, hasMore, loadPage, pagination.current_page, isAuthenticated]);

  const refresh = useCallback(async () => {
    if (!isAuthenticated) return;
    await loadFirstPage();
  }, [loadFirstPage, isAuthenticated]);

  const markStoryViewed = useCallback((artistId, storyId) => {
    setStoriesByArtistId((prev) => {
      const group = prev[artistId];
      if (!group) return prev;
      const updatedStories = group.stories.map((s) =>
        s.id === storyId ? { ...s, is_viewed: true } : s
      );
      const allViewed =
        updatedStories.length > 0 && updatedStories.every((s) => s.is_viewed);
      return {
        ...prev,
        [artistId]: {
          ...group,
          stories: updatedStories,
          all_stories_viewed: allViewed,
        },
      };
    });
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    const isAuth = checkAuth();
    setIsAuthenticated(isAuth);
  }, [checkAuth]);

  useEffect(() => {
    if (isFirstLoadRef.current && isAuthenticated) {
      isFirstLoadRef.current = false;
      loadFirstPage();
    }
  }, [loadFirstPage, isAuthenticated]);

  const value = useMemo(
    () => ({
      orderedArtistIds,
      storiesByArtistId,
      pagination,
      isLoading,
      error,
      hasMore,
      isAuthenticated,
      loadFirstPage,
      loadNextPage,
      refresh,
      markStoryViewed,
    }),
    [
      orderedArtistIds,
      storiesByArtistId,
      pagination,
      isLoading,
      error,
      hasMore,
      isAuthenticated,
      loadFirstPage,
      loadNextPage,
      refresh,
      markStoryViewed,
    ]
  );

  return (
    <StoriesContext.Provider value={value}>{children}</StoriesContext.Provider>
  );
}

export function useStories() {
  const ctx = useContext(StoriesContext);
  if (!ctx) throw new Error("useStories must be used within a StoriesProvider");
  return ctx;
}
