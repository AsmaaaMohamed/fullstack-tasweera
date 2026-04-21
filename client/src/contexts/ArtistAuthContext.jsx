"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import api, { COOKIE_OPTIONS } from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";

const ArtistAuthContext = createContext(undefined);

export const useArtistAuth = () => {
    const context = useContext(ArtistAuthContext);
    if (!context) {
        throw new Error("useArtistAuth must be used within an ArtistAuthProvider");
    }
    return context;
};

export const ArtistAuthProvider = ({ children }) => {
    const locale = useLocale();
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    // Helper to set auth cookie server-side
    const setAuthCookie = async (authToken, userType = null) => {
        try {
            const res = await fetch("/api/auth/set-cookie", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: authToken, user_type: userType }),
            });
            if (!res.ok) {
                console.warn("Failed to set auth cookie:", res.statusText);
            }
        } catch (err) {
            console.warn("Failed to set auth cookie:", err);
        }
    };

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
                } catch (error) {
                    console.error("Error parsing stored artist data:", error);
                    // Clear invalid data
                    Cookies.remove("auth_token");
                    Cookies.remove("auth_user");
                    Cookies.remove("user_type");
                    delete api.defaults.headers.common["Authorization"];
                }
            }
        }
    }, []);

    // Register artist
    const register = async (artistData) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.post("/auth/artist/register", artistData);

            if (response.data.success) {
                toast.success("Registration successful!");
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
                        // Set default authorization header
                        api.defaults.headers.common["Authorization"] = `Bearer ${authToken}`;
                        await setAuthCookie(authToken, userType);
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
            console.error("Artist Registration API error:", error);
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
                fullError: error.response?.data,
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
            const response = await api.post(`/auth/artist/login?lang=${locale}`, {
                email,
                password,
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
                                path: "/"
                                // No 'expires' property = session cookie (deleted when browser closes)
                            };

                        Cookies.set("auth_token", authToken, cookieOptions);
                        Cookies.set("auth_user", JSON.stringify(user), cookieOptions);
                        if (userType) {
                            Cookies.set("user_type", userType, cookieOptions);
                        }
                        await setAuthCookie(authToken, userType);
                    }
                }

                return {
                    success: true,
                    message: response.data.message,
                    user: user,
                    token: authToken,
                };
            } else {
                throw new Error(response.data.message || "Login failed");
            }
        } catch (error) {
            console.error("Artist Login API error:", error);
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
    // Logout function
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
            // Redirect to artist signin
            window.location.assign("/");
        }
    };

    // Clear error
    const clearError = () => {
        setError(null);
    };

    // Update artist role and sections
    const updateArtistRoleAndSections = async (role, sectionIds) => {
        setLoading(true);
        setError(null);

        try {
            const response = await api.put(`/artist-profile/artist-role-section?lang=${locale}`, {
                role,
                section_ids: sectionIds,
            });

            if (response.data.status === "success") {
                toast.success(response.data.message || "Profile updated successfully!");
                return {
                    success: true,
                    message: response.data.message,
                };
            } else {
                toast.error(response.data.message || "Failed to update profile");
                throw new Error(response.data.message || "Failed to update profile");
            }
        } catch (error) {
            console.error("Update artist role and sections error:", error);
            const errorMessage =
                error.response?.data?.message ||
                error.response?.data?.error ||
                error.message ||
                "Failed to update artist profile. Please try again.";
            toast.error(errorMessage);
            setError(errorMessage);
            return {
                success: false,
                message: errorMessage,
                errors: error.response?.data?.errors,
            };
        } finally {
            setLoading(false);
        }
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
        updateArtistRoleAndSections,
    };

    return <ArtistAuthContext.Provider value={value}>{children}</ArtistAuthContext.Provider>;
};

export default ArtistAuthContext;
