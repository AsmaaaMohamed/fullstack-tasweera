import axios from "axios";
import Cookies from "js-cookie";

// Create axios instance with base URL from environment variable
// Reads from .env file: NEXT_PUBLIC_API_BASE_URL
const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Cookie configuration
const COOKIE_OPTIONS = {
  expires: 7, // 7 days
  secure: process.env.NODE_ENV === "production", // Only secure in production
  sameSite: "lax", // Changed from "strict" to "lax" for better compatibility
  path: "/", // Available across entire site
};

// Request interceptor to add token to requests
api.interceptors.request.use(
  (config) => {
    // Get token from cookies - always try to get it
    const token = Cookies.get("auth_token");

    // If token exists, always set it in the request
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      // If no token in cookie, try to get from default headers as fallback
      const defaultToken = api.defaults.headers.common["Authorization"];
      if (defaultToken) {
        config.headers.Authorization = defaultToken;
      } else {
        // Log warning if no token found (only in development)
        if (process.env.NODE_ENV === "development") {
          console.warn("No auth token found for request:", config.url);
        }
      }
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 unauthorized errors
    if (error.response?.status === 401) {
      // Clear cookies
      if (typeof window !== "undefined") {
        Cookies.remove("auth_token");
        Cookies.remove("auth_user");
        Cookies.remove("user_type");
        // Clear default authorization header
        delete api.defaults.headers.common["Authorization"];
      }
    }
    return Promise.reject(error);
  }
);

// Helper function to sync token from cookie to default headers
export const syncAuthToken = () => {
  if (typeof window !== "undefined") {
    const token = Cookies.get("auth_token");
    if (token) {
      api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      return token;
    } else {
      delete api.defaults.headers.common["Authorization"];
      return null;
    }
  }
  return null;
};

// Set default authorization header if token exists on initialization
if (typeof window !== "undefined") {
  syncAuthToken();
}

export { COOKIE_OPTIONS };
export default api;
