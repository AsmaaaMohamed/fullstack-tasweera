import api from "./api";

// Fetch cities from API by country ID
export const fetchCities = async (countryCode) => {
  if (!countryCode) return [];

  try {
    const queryKey = Number.isNaN(Number(countryCode)) ? "country_code" : "country_id";
    const response = await api.get(`/location/cities?${queryKey}=${countryCode}`);
    return response.data.data || [];
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
