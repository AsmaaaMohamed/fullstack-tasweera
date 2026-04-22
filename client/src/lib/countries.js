import api from "./api";

// Fetch countries from API
export const fetchCountries = async () => {
  try {
    const response = await api.get("/countries");
    // Handle both array response and object with data property
    const countries = Array.isArray(response.data)
      ? response.data
      : response.data?.data || response.data || [];
    return countries;
  } catch (error) {
    console.error("Error fetching countries:", error);
    console.error("Error response:", error.response?.data);
    return [];
  }
};

// Create a mapping of country name to ID for quick lookup
export const createCountryIdMap = (countries) => {
  const map = {};
  countries.forEach((country) => {
    map[country.name] = country.id;
  });
  return map;
};

// Get country ID from country name
export const getCountryId = (countryName, countries = []) => {
  if (!countryName || !countries.length) return null;
  const country = countries.find((c) => c.name === countryName);
  return country?.id || null;
};

// Get country by ID
export const getCountryById = (countryId, countries = []) => {
  return countries.find((c) => c.id === countryId) || null;
};
