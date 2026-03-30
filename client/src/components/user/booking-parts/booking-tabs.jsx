"use client";

import { useTranslations } from "next-intl";

export function BookingTabs({ activeTab, onTabChange }) {
  const t = useTranslations("Bookings");
  const tabs = [
    { id: "all", label: t("orders") },
    { id: "pending", label: t("waiting") },
    { id: "completed", label: t("completed") },
    { id: "cancelled", label: t("cancelled") },
  ];

  return (
    <div className="flex gap-3 items-center">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={`px-6 py-2 rounded-full text-xs sm:text-base font-medium transition-all ${
            activeTab === tab.id
              ? "bg-main text-white shadow-md"
              : "bg-white dark:bg-[#363636] text-descriptive dark:text-gray-200 border border-gray-200 dark:border-[#363636] hover:bg-gray-50 dark:hover:bg-[#363636]"
          }`}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
