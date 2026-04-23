import api from "./api";

export async function getHomeData(locale) {
  try {
    const res = await api.get(`/customer/home?lang=${locale}`);

    return {
      categoriesData: res.data.data?.categories || [],
      photographers:
        res.data.data?.top_photographers?.map((photographer) => ({
          id: photographer.id,
          name: photographer.name,
          image:
            photographer.profile_picture_url ||
            "/images/photographers/photographer.jpg",
          experience: photographer.years_of_experience?.toString() || "0",
          rating: parseFloat(photographer.average_rating) || 0,
          hasActiveStory: photographer.has_active_story || false
        })) || [],
      banners: res.data.data?.banners || []
    };
  } catch (error) {
    console.error("Error fetching photographers:", error);
    return { photographers: [], banners: [] };
  }
}