// src/lib/stories.js
import api from "../lib/api";

// Fetch stories for artists
export async function fetchArtistStories({ page = 1, perPage = 10 } = {}) {
  const { data } = await api.get(`/customer/stories`, {
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

  // Group all stories by artist (in this case, all stories are from the logged-in artist)
  // Get the first story to extract artist info
  const firstStory = storiesArray[0];
  const artistName = firstStory.artist_name || "Artist";
  const artistProfile = firstStory.artist_profile || null;

  // Create a consistent artist_id from artist_name (since all stories are from the same artist)
  // Using a simple hash of the artist_name to create a consistent ID
  const artistId = `artist_${artistName.toLowerCase().replace(/\s+/g, "_")}`;

  // Transform stories to match the expected format
  const transformedStories = storiesArray.map((story) => ({
    id: story.id,
    media_url: story.media_url,
    type: story.type,
    expires_at: story.expires_at,
    created_at: story.created_at,
    views_count: story.views_count,
    is_viewed: false, // Default to false, can be updated based on views_count if needed
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
      last_page: 1, // API doesn't return pagination info, defaulting to 1
      per_page: perPage,
    },
  };
}

// Upload story for artists
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
