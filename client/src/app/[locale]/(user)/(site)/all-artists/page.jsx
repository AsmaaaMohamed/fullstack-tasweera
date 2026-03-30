"use client";
import api from "@/lib/api";

import { useEffect, useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { useSearchParams } from "next/navigation";
import { useLocale } from "next-intl";
import { PhotographerCard } from "@/components/user/photographer-card/photographer-card";
import { Skeleton } from "@/components/ui/skeleton";

export default function AllArtistsPage() {
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get("search") || "";
  const [artists, setArtists] = useState([]);
  const [filteredArtists, setFilteredArtists] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchArtists = async () => {
      try {
        const { data } = await api.get("/customer/Search");
        if (data.status === "success") {
          setArtists(data.data.artists);
        } else {
          throw new Error(data.message || "Failed to fetch artists");
        }
      } catch (err) {
        console.error("Error fetching artists:", err);
        setError(
          err.response?.data?.message ||
            err.message ||
            "An error occurred while fetching artists"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchArtists();
  }, []);

  // Filter artists based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredArtists(artists);
    } else {
      const filtered = artists.filter((artist) =>
        artist.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredArtists(filtered);
    }
  }, [artists, searchQuery]);

  const handleViewProfile = (photographerId) => {
    router.push(`/provider-details/${photographerId}`);
  };

  // Skeleton loader
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6 dark:text-white">
          {locale === "ar" ? "الفنانين" : "Artists"}
        </h1>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {[...Array(10)].map((_, i) => (
            <div
              key={i}
              className="flex flex-col items-center gap-4 p-4 border rounded-lg dark:border-gray-700"
            >
              <Skeleton className="h-20 w-20 md:h-24 md:w-24 rounded-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-8 w-20 md:w-24 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-2xl font-bold mb-4 dark:text-white">
          {locale === "ar" ? "الفنانين" : "Artists"}
        </h1>
        <p className="text-red-500">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-primary/90 transition-colors"
        >
          {locale === "ar" ? "إعادة المحاولة" : "Retry"}
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6 dark:text-white">
        {locale === "ar" ? "الفنانين" : "Artists"}
        {searchQuery && (
          <span className="text-lg font-normal text-gray-600 dark:text-gray-400 ml-2">
            - {locale === "ar" ? "نتائج البحث عن" : "Search results for"} "
            {searchQuery}"
          </span>
        )}
      </h1>

      {filteredArtists.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400 text-lg">
            {searchQuery
              ? locale === "ar"
                ? "لا توجد نتائج للبحث"
                : "No results found for your search"
              : locale === "ar"
              ? "لا يوجد فنانين"
              : "No artists found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {filteredArtists.map((artist) => (
            <PhotographerCard
              key={artist.id}
              id={artist.id}
              image={artist.profile_picture_url || "/images/photographers/photographer.jpg"}
              name={artist.name}
              experience={artist.years_of_experience || 0}
              rating={parseFloat(artist.average_rating) || 0}
              onViewProfile={handleViewProfile}
              cardWidth="w-full"
            />
          ))}
        </div>
      )}
    </div>
  );
}
