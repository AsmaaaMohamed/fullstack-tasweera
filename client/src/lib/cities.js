import api from "./api";

// Fetch cities from API by country ID
export const fetchCities = async (countryId) => {
  if (!countryId) return [];

  try {
    const response = await api.get(`/cities?country_id=${countryId}`);
    return response.data || [];
  } catch (error) {
    console.error("Error fetching cities:", error);
    return [];
  }
};

// Get city ID from city name
export const getCityId = (cityName, cities = []) => {
  if (!cityName || !cities.length) return null;
  const city = cities.find((c) => c.name === cityName);
  return city?.id || null;
};

// Get city by ID
export const getCityById = (cityId, cities = []) => {
  return cities.find((c) => c.id === cityId) || null;
};
