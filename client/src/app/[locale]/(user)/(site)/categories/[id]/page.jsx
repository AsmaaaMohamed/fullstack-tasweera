"use client";
import { useState, useEffect } from "react";
import { PhotographerCard } from "@/components/user/photographer-card/photographer-card";
import { ArrowLeft } from "lucide-react";
import { useLocale } from "next-intl";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";


export default function CategoryPage() {
  const locale = useLocale();
  const params = useParams();
  const router = useRouter();
  const id = params?.id; // string
  const [categoryName, setCategoryName] = useState(null);
  const [artists, setArtists] = useState([]);
  const [loadingArtists, setLoadingArtists] = useState(false);
  const [artistsError, setArtistsError] = useState(null);
  const handleViewProfile = (photographerId) => {
    router.push(`/provider-details/${photographerId}`);
  };

  // NOTE: Category name will be taken from the artists endpoint response below
  const cards = artists?.map((artist) => (
    <div
      key={artist.id}
      className={` flex-none rounded-t-lg !bg-transparent min-w-[230px]`}
    >
      <PhotographerCard
        id={artist.id}
        name={artist.name}
        image={artist.profile_photo_url || "/images/photographers/photographer.jpg"}
        experience={artist.years_of_experience}
        rating={parseFloat(artist.average_rating) || 0}
        onViewProfile={handleViewProfile}
      />
    </div>
  ));

  // Fetch artists for the section
  useEffect(() => {
    if (!id) return;
    let mounted = true;
    const fetchArtists = async () => {
      setLoadingArtists(true);
      setArtistsError(null);
      try {
        const lang = locale || "ar";
        const res = await api.get(`/sections/${id}/artists?lang=${lang}`);
        const payload = res.data?.data || res.data || {};
        const list = payload?.artists || [];
        if (mounted) {
          setArtists(list);
          // If the artists endpoint includes section metadata, use it for the title
          if (payload.section_name) {
            setCategoryName( payload.section_name);
          }
        }
      } catch (err) {
        console.error("Error fetching artists:", err);
        if (mounted)
          setArtistsError(err.response?.data?.message || err.message || "Failed to load artists");
      } finally {
        if (mounted) setLoadingArtists(false);
      }
    };

    fetchArtists();
    return () => {
      mounted = false;
    };
  }, [id, locale]);
  return (
    <main>
      <section className="max-w-7xl mx-auto px-4 pe-0 sm:ps-6 xl:pe-6 py-20">
        <div className="flex items-center mb-4 gap-2">
          <div className="flex">
            <a
              href="/categories"
              className="text-darker hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-black dark:text-gray-300 dark:hover:text-white" />
            </a>
          </div>
          <h2 className="font-semibold text-black dark:text-gray-300">
            {loadingArtists
              ? locale === "en"
                ? "Loading..."
                : "جارٍ التحميل..."
              : categoryName
             
              }
          </h2>
        </div>
        <div className="flex flex-wrap gap-1 justify-center sm:justify-start sm:gap-5">
          {cards}
        </div>
      </section>
    </main>
  );
}
