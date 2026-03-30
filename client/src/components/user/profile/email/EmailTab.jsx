"use client";

import React from "react";
import Image from "next/image";
import { useLocale } from "next-intl";

function EmailTab({ activeTab, onTabChange, inboxCount = 0, sentCount = 0 }) {
  const locale = useLocale();
  return (
    <div className="flex flex-col sm:flex-row items-center relative max-md:mb-0 mb-6 gap-4 sm:gap-0">
      {/* Tabs - Centered */}
      <div className="flex-1 flex items-center justify-center gap-2 sm:gap-3 w-full sm:w-auto">
        {/* Inbox Tab */}
        <button
          onClick={() => onTabChange("inbox")}
          className={`px-3 py-2 sm:px-6 sm:py-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-initial ${
            activeTab === "inbox"
              ? "border-2 border-[#E6A525]"
              : "border border-gray-300 text-gray-700 dark:!border-slate-600 dark:!text-gray-300"
          }`}
        >
          <span>{locale === "ar" ? "بريد وارد" : "Inbox"}</span>
          <span className="text-[#E6A525]"> ({inboxCount})</span>
        </button>

        {/* Sent Tab */}
        <button
          onClick={() => onTabChange("sent")}
          className={`px-3 py-2 sm:px-6 sm:py-4 rounded-lg text-xs sm:text-sm font-medium transition-all flex-1 sm:flex-initial ${
            activeTab === "sent"
              ? "border-2 border-[#E6A525]"
              : "border border-gray-300 dark:!border-slate-600 text-gray-700 dark:!text-gray-300"
          }`}
        >
          <span>{locale === "ar" ? "بريد صادر" : "Sent"}</span>
          <span className="text-[#E6A525]"> ({sentCount})</span>
        </button>
      </div>
    </div>
  );
}

export default EmailTab;
