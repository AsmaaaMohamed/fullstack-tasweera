import api from "./api";

/**
 * Fetches sections (categories) from the API
 * @returns {Promise<Array>} Array of sections
 */
export async function fetchSections() {
    try {
        const response = await api.get("/sections/names");
        if (response.data && Array.isArray(response.data.data)) {
            return response.data.data;
        } else if (response.data && Array.isArray(response.data)) {
            return response.data;
        } else {
            console.warn("Unexpected sections API response format:", response.data);
            return [];
        }
    } catch (error) {
        console.error("Error fetching sections:", error);
        return [];
    }
}
