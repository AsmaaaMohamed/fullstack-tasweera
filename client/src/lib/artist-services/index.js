import api from "@/lib/api";

/**
 * Add a new service for the authenticated artist.
 *
 * @param {Object} serviceData - Service data object
 * @param {string} serviceData.name - Service name
 * @param {number|string} serviceData.price - Service price
 * @param {string} serviceData.notes - Service notes/description
 * @param {File} serviceData.photo - Service photo file
 * @returns {Promise<any>} - Raw API response data
 */
export async function addArtistService(serviceData) {
  try {
    const formData = new FormData();
    formData.append("name", serviceData.name);
    formData.append("price", serviceData.price);
    formData.append("notes", serviceData.notes || "");

    if (serviceData.photo) {
      formData.append("photo", serviceData.photo);
    }

    const response = await api.post("/artist/services", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to add artist service:", error);
    }
    throw error;
  }
}

/**
 * Delete a service for the authenticated artist.
 *
 * @param {number} serviceId - Service ID to delete
 * @returns {Promise<any>} - Raw API response data
 */
export async function deleteArtistService(serviceId) {
  try {
    const response = await api.delete(`/artist/services/${serviceId}`);

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to delete artist service:", error);
    }
    throw error;
  }
}

/**
 * Get service details by ID for the authenticated artist.
 *
 * @param {number} serviceId - Service ID to fetch
 * @returns {Promise<any>} - Raw API response data
 */
export async function getArtistServiceById(serviceId) {
  try {
    const response = await api.get(`/artist/service/${serviceId}`);

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist service:", error);
    }
    throw error;
  }
}

/**
 * Update a service for the authenticated artist.
 *
 * @param {number} serviceId - Service ID to update
 * @param {Object} serviceData - Service data object
 * @param {string} serviceData.name - Service name
 * @param {number|string} serviceData.price - Service price
 * @param {string} serviceData.notes - Service notes/description
 * @param {File} serviceData.photo - Service photo file (optional)
 * @returns {Promise<any>} - Raw API response data
 */
export async function updateArtistService(serviceId, serviceData) {
  try {
    const formData = new FormData();
    formData.append("name", serviceData.name);
    formData.append("price", serviceData.price);
    formData.append("notes", serviceData.notes || "");

    if (serviceData.photo) {
      formData.append("photo", serviceData.photo);
    }

    const response = await api.put(`/artist/services/${serviceId}`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    return response?.data;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to update artist service:", error);
    }
    throw error;
  }
}
