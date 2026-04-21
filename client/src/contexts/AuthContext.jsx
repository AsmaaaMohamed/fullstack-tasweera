"use client";

import { createContext, useContext, useState, useEffect } from "react";
import api, { COOKIE_OPTIONS, syncAuthToken } from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state from cookies on mount
  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedToken = Cookies.get("auth_token");
      const storedUser = Cookies.get("auth_user");
      const storedUserType = Cookies.get("user_type");

      if (storedToken && storedUser) {
        try {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          setIsAuthenticated(true);
          // Sync token to default headers
          syncAuthToken();
        } catch (error) {
          console.error("Error parsing stored user data:", error);
          // Clear invalid data
          Cookies.remove("auth_token");
          Cookies.remove("auth_user");
          Cookies.remove("user_type");
          delete api.defaults.headers.common["Authorization"];
        }
      }
    }
  }, []);

  // Register customer
  const register = async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/customer/register", userData);

      if (response.data.success) {
        toast.success("Registration successful!");
        // Store user data and token (token might be null initially)
        const user = response.data.user;
        const authToken = response.data.token;
        const userType = response.data.user_type;

        setUser(user);
        if (authToken && authToken !== "null") {
          setToken(authToken);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            Cookies.set("auth_token", authToken, COOKIE_OPTIONS);
            Cookies.set("auth_user", JSON.stringify(user), COOKIE_OPTIONS);
            if (userType) {
              Cookies.set("user_type", userType, COOKIE_OPTIONS);
            }
            // Sync token to default headers
            syncAuthToken();
          }
        }

        return {
          success: true,
          message: response.data.message,
          user: user,
          token: authToken,
        };
      } else {
        toast.error(response.data.message || "Unknown error");
        throw new Error(response.data.message || "Registration failed");
      }
    } catch (error) {
      // Log full error for debugging
      console.error("Registration API error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Registration failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors,
        fullError: error.response?.data, // Include full error for debugging
      };
    } finally {
      setLoading(false);
    }
  };

  // Login with email
  const loginWithEmail = async (email, password, remember = false) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post("/auth/customer/login-with-email", {
        email,
        password,
        remember,
      });

      if (response.data.success) {
        const user = response.data.user;
        const authToken = response.data.token;
        const userType = response.data.user_type;

        toast.success("Login successful!");

        setUser(user);
        if (authToken && authToken !== "null") {
          setToken(authToken);
          setIsAuthenticated(true);
          if (typeof window !== "undefined") {
            // Set cookie options based on remember flag
            const cookieOptions = remember
              ? COOKIE_OPTIONS // Persistent cookie (7 days)
              : {
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
                path: "/",
                // No 'expires' property = session cookie (deleted when browser closes)
              };

            Cookies.set("auth_token", authToken, cookieOptions);
            Cookies.set("auth_user", JSON.stringify(user), cookieOptions);
            if (userType) {
              Cookies.set("user_type", userType, cookieOptions);
            }
            // Sync token to default headers
            syncAuthToken();
          }
        }

        return {
          success: true,
          message: response.data.message,
          user: user,
          token: authToken,
        };
      } else {
        toast.error(response.data.message || "Login failed");
        throw new Error(response.data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login API error:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Login failed. Please try again.";
      toast.error(errorMessage);
      setError(errorMessage);
      return {
        success: false,
        message: errorMessage,
        errors: error.response?.data?.errors,
        fullError: error.response?.data,
      };
    } finally {
      setLoading(false);
    }
  };

  // Logout function (for future use)
  const logout = async () => {
    setUser(null);
    setToken(null);
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      Cookies.remove("auth_token");
      Cookies.remove("auth_user");
      Cookies.remove("user_type");
      // Clear default authorization header
      delete api.defaults.headers.common["Authorization"];
      // Force full reload so middleware runs and protects routes
      window.location.assign("/");
    }
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    token,
    loading,
    error,
    isAuthenticated,
    register,
    loginWithEmail,
    logout,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthContext;

