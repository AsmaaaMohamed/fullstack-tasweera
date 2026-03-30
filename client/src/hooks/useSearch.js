import { useState, useCallback } from 'react';
import { debounce } from 'lodash';
import api from '@/lib/api';

export function useSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showResults, setShowResults] = useState(false);

  // Debounced search function
  const search = useCallback(
    debounce(async (query) => {
      if (!query.trim()) {
        setResults([]);
        setShowResults(false);
        return;
      }
      
      setIsSearching(true);
      if (!query?.trim()) return [];
  
      try {
        const response = await api.get(`/customer/Search?query=${encodeURIComponent(query)}`);
        if( response.data.status === "success"){
            setResults(Array.isArray(response.data.data.artists) ? response.data.data.artists : []);
            setShowResults(true);
        }
      } catch (error) {
        console.error('Search error:', error);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300),
    []
  );

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (query.trim()) {
    search(query);
  } else {
    setResults([]);
    setShowResults(false);
  }
  };

  const clearSearch = () => {
    setSearchQuery("");
    setResults([]);
    setShowResults(false);
  };
  // Handle input blur
  const handleInputBlur = () => {
    // Delay hiding results to allow click on result
    setTimeout(() => {
      setShowResults(false)
    }, 200)
  }
  
  // Handle input focus
  const handleInputFocus = () => {
    if (searchQuery.trim() && results && results.length > 0) {
      setShowResults(true)
    }
  }
  return {
    searchQuery,
    setSearchQuery,
    results,
    isSearching,
    showResults,
    setShowResults,
    handleSearchChange,
    clearSearch,
    handleInputBlur,
    handleInputFocus
  };
}