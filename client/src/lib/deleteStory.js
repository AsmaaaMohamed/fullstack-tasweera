import api from "./api";

export const deleteStory = async (storyId) => {
  try {
    const response = await api.delete(`/artist/stories/${storyId}`);
    return response.data;
  } catch (error) {
    console.error("Error deleting story:", error);
    throw error;
  }
};
