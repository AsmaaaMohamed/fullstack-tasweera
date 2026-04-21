// src/lib/stories.js
import api from "../lib/api";

// Fetch stories for customers (all artists' active stories)
export async function fetchStories({ page = 1, perPage = 10 } = {}) {
  const { data } = await api.get(`/customer/stories`, {
    params: { page, per_page: perPage },
  });

  return data?.data || {
    stories: [],
    pagination: {
      current_page: page,
      last_page: 1,
      per_page: perPage,
    },
  };
}

// Fetch stories for the logged-in artist (their own stories)
export async function fetchArtistStories({ page = 1, perPage = 10 } = {}) {
  const { data } = await api.get(`/artist/stories`, {
    params: { page, per_page: perPage },
  });

  // Transform the flat array response into the grouped format expected by StoriesContext
  const storiesArray = data?.data || [];

  if (storiesArray.length === 0) {
    return {
      stories: [],
      pagination: {
        current_page: page,
        last_page: 1,
        per_page: perPage,
      },
    };
  }

  // Get artist info from first story
  const firstStory = storiesArray[0];
  const artistName = firstStory.artist_name || "Artist";
  const artistProfile = firstStory.artist_profile || null;
  const artistId = firstStory.artist_id || `artist_${artistName.toLowerCase().replace(/\s+/g, "_")}`;

  // Transform stories to match the expected format
  const transformedStories = storiesArray.map((story) => ({
    id: story.id,
    media_url: story.media_url,
    type: story.type,
    expires_at: story.expires_at,
    created_at: story.created_at,
    views_count: story.views_count,
    is_viewed: false,
  }));

  return {
    stories: [
      {
        artist_id: artistId,
        artist_name: artistName,
        artist_profile_photo_url: artistProfile,
        all_stories_viewed: false,
        stories: transformedStories,
      },
    ],
    pagination: {
      current_page: page,
      last_page: 1,
      per_page: perPage,
    },
  };
}

// Upload story for artists (only artists can upload)
export async function uploadArtistStory(file) {
  const formData = new FormData();
  formData.append("media", file);

  const { data } = await api.post("/artist/stories", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
}
