"use client";

import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import PhotographersSlider from "../photographer-slider/photographer-slider";
import { PhotographerCard } from "../photographer-card/photographer-card";
import { Link } from "@/i18n/navigation";

export default function PhotographersSection({ photographers, lang = "ar" }) {
  const t = useTranslations("UserHome");
  const router = useRouter();

  const handleViewProfile = (photographerId) => {
    router.push(`/provider-details/${photographerId}`);
  };

  return (
    <section className="w-full bg-white pb-10 px-4 mb-30 dark:bg-[#363636]">
      <div className="max-w-7xl mx-auto px-4 pe-0 sm:ps-6 xl:pe-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-black dark:text-white">
            {t("best-photographers")}
          </h2>
          <Link
            href="/all-artists"
            className="text-darker hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors"
          >
            {t("show-more")}
          </Link>
        </div>

        <PhotographersSlider
          photographers={photographers}
          PhotographerCard={PhotographerCard}
          onViewProfile={handleViewProfile}
        />
      </div>
    </section>
  );
}
