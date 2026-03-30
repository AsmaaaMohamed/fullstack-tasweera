import api from "@/lib/api";

/**
 * Fetch all artist skills.
 *
 * @param {string} lang - Language code, e.g. "ar" or "en".
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function getArtistSkills(lang = "ar") {
  try {
    const response = await api.get("/skills", {
      params: { lang },
    });

    const data = response?.data;

    if (data?.status === "success" && Array.isArray(data.data)) {
      return data.data;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected skills API response format:", data);
    }

    return [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist skills:", error);
    }
    return [];
  }
}

/**
 * Fetch skills currently assigned to the authenticated artist.
 *
 * @returns {Promise<Array<{id: number, name: string}>>}
 */
export async function getArtistAssignedSkills() {
  try {
    const response = await api.get("/artist/skills");
    const data = response?.data;

    if (data?.status === "success" && Array.isArray(data.data)) {
      return data.data;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected artist skills response format:", data);
    }

    return [];
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist assigned skills:", error);
    }
    return [];
  }
}

/**
 * Add selected artist skills.
 *
 * @param {number[]} skillIds - Array of skill IDs to add.
 * @returns {Promise<any>} - Raw API response data.
 */
export async function addArtistSkills(skillIds) {
  try {
    const response = await api.post("/artist/skills/add", {
      skill_ids: skillIds,
    });

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to add artist skills:", error);
    }
    throw error;
  }
}

/**
 * Remove selected artist skills.
 *
 * @param {number[]} skillIds - Array of skill IDs to remove.
 * @returns {Promise<any>} - Raw API response data.
 */
export async function removeArtistSkills(skillIds) {
  try {
    const response = await api.delete("/artist/skills/remove", {
      data: {
        skill_ids: skillIds,
      },
    });

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to remove artist skills:", error);
    }
    throw error;
  }
}
