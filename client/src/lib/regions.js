import api from "./api";

// Fetch regions from API by city ID
export const fetchRegions = async (cityId) => {
    if (!cityId) return [];

    try {
        const response = await api.get(`/location/regions?city_id=${cityId}`);
        return response.data?.data || [];
    } catch (error) {
        console.error("Error fetching regions:", error);
        return [];
    }
};

// Get region ID from region name
export const getRegionId = (regionName, regions = []) => {
    if (!regionName || !regions.length) return null;
    const region = regions.find((r) => r.name === regionName);
    return region?.id || null;
};

// Get region by ID
export const getRegionById = (regionId, regions = []) => {
    return regions.find((r) => r.id === regionId) || null;
};
