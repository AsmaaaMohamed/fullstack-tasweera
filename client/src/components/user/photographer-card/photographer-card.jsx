"use client";

import Image from "next/image";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { useTranslations } from "next-intl";

export function PhotographerCard({
  id,
  image,
  name,
  experience,
  rating,
  onViewProfile,
  cardWidth,
}) {
  const t = useTranslations("UserHome");
  const handleViewProfile = () => {
    onViewProfile(id);
  };
  return (
    <div
      className={`flex flex-col items-center gap-2 p-6 border border-gray-200 dark:border-gray-500  rounded-lg bg-white dark:bg-[#363636] hover:shadow-md transition-shadow ${cardWidth} `}
    >
      {/* Circular Profile Image */}
      <div className="relative w-24 h-24">
        <Image
          width={96}
          height={96}
          src={image || "/images/photographers/photographer.jpg"}
          alt={name}
          className="w-24 h-24 rounded-full object-cover border-2 border-gray-100"
        />
      </div>

      {/* Name */}
      <h3 className="text-sm font-semibold text-center text-gray-900  dark:text-white">
        {name}
      </h3>

      {/* Rating */}
      <div className="flex flex-col gap-0.5 items-center mb-1">
        {/* Experience */}
        <p className="text-xs text-descriptive dark:text-gray-400">
          {t("years-experience")}: {experience}
        </p>
        <div className="flex items-center gap-1">
          <div className="flex gap-0.5">
            {[...Array(5)].map((_, i) => (
              <svg
                key={i}
                className={`h-3 w-3 ${
                  i < Math.floor(rating)
                    ? "fill-yellow-400 text-yellow-400"
                    : "fill-muted text-muted"
                }`}
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ))}
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300 ml-1">
            {rating}
          </span>
        </div>
      </div>

      {/* View Profile Button */}
      <PrimaryButton
        className="border-darker border text-[10px]/9"
        onClick={handleViewProfile}
      >
        {t("show-more")}
      </PrimaryButton>
    </div>
  );
}
