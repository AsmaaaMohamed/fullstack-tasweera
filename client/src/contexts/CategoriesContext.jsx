"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useLocale } from "next-intl";
import { getHomeData } from "@/lib/getHomeData";

const CategoriesContext = createContext(undefined);

export const useCategories = () => {
  const context = useContext(CategoriesContext);
  if (!context) {
    throw new Error("useCategories must be used within a CategoriesProvider");
  }
  return context;
};

export const CategoriesProvider = ({ children }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isFetched, setIsFetched] = useState(false);
  const locale = useLocale();
console.log(locale)
  // Fetch categories from API
  const fetchCategories = async (force = false) => {
    // Skip if already fetched and not forcing refresh
    if (isFetched && !force) {
      return categories;
    }

    setLoading(true);
    setError(null);

    try {
      const { categoriesData } = await getHomeData(locale);
      setCategories(categoriesData);
      setIsFetched(true);

      return {
        success: true,
        data: categoriesData,
        message: "Categories fetched successfully",
      };
    } catch (error) {
      console.error("Error fetching categories:", error);
      console.error("Error response:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        error.message ||
        "Failed to fetch categories. Please try again.";

      setError(errorMessage);

      return {
        success: false,
        data: [],
        message: errorMessage,
        fullError: error.response?.data,
      };
    } finally {
      setLoading(false);
    }
  };

  // Initialize and refetch when locale changes
  useEffect(() => {
    // When locale changes, force refetch to get localized categories
    fetchCategories(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  // Get category by ID
  const getCategoryById = (categoryId) => {
    return categories.find((c) => c.id === categoryId) || null;
  };

  // Get category by name
  const getCategoryByName = (categoryName) => {
    return categories.find((c) => c.name === categoryName) || null;
  };

  // Create a mapping of category name to ID
  const getCategoryIdMap = () => {
    const map = {};
    categories.forEach((category) => {
      map[category.name] = category.id;
    });
    return map;
  };

  // Clear error
  const clearError = () => {
    setError(null);
  };

  const value = {
    categories,
    loading,
    error,
    isFetched,
    fetchCategories,
    getCategoryById,
    getCategoryByName,
    getCategoryIdMap,
    clearError,
  };

  return (
    <CategoriesContext.Provider value={value}>
      {children}
    </CategoriesContext.Provider>
  );
};

export default CategoriesContext;
