"use client";

import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import { Button } from "@/components/ui/button";

export default function ServiceCard({
  title,
  price,
  image,
  requests,
  onView,
  onDelete,
  isDeleting = false,
}) {
  const t = useTranslations("MyServices");
  const locale = useLocale();
  const isRTL = locale === "ar";

  return (
    <div className="bg-white dark:bg-[#363636] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow">
      <div className="p-4">
        {/* Main Content: Image/Title/Price on one side, Request badge on other side */}
        <div
          className={`flex items-start justify-between gap-4 mb-4 ${
            isRTL ? "flex-row-reverse" : ""
          }`}
        >
          {/* Right Side: Request Badge - Aligned alone */}
          {requests !== undefined && requests !== null && (
            <div className="bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 px-3 py-1 rounded-full text-xs font-medium flex-shrink-0">
              {requests} {t("request")}
            </div>
          )}
          {/* Left Side: Title, Price, and Image */}
          <div
            className={`flex items-end gap-4 ${
              isRTL ? "flex-row-reverse" : ""
            }`}
          >
            {/* Title and Price Section */}
            <div
              className={`flex-1 ${isRTL ? "text-right" : "text-left"}`}
              dir={isRTL ? "rtl" : "ltr"}
            >
              <h3 className="text-base font-medium text-gray-900 dark:text-white mb-2">
                {title}
              </h3>
              <div className="flex items-center gap-1">
                <span className="text-lg font-semibold text-main">{price}</span>
                <Image
                  src="/currency.svg"
                  alt="Currency"
                  width={20}
                  height={20}
                />
              </div>
            </div>

            {/* Service Image - Circular */}
            <div className="relative w-20 h-20 flex-shrink-0">
              <Image
                src={image || "/placeholder.svg"}
                alt={title}
                fill
                className="rounded-full object-cover"
              />
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-gray-200 dark:border-gray-600 mb-4"></div>

        {/* Action Buttons */}
        <div
          className={`flex gap-2 ${isRTL ? "flex-row-reverse" : ""}`}
          dir={isRTL ? "rtl" : "ltr"}
        >
          <Button
            onClick={onView}
            className="flex-1 bg-main hover:bg-main/90 text-white rounded-lg py-2 text-sm font-medium transition-colors"
          >
            {t("view-service")}
          </Button>
          <Button
            onClick={onDelete}
            disabled={isDeleting}
            className="flex-1 bg-[#FF1A00] hover:bg-[#FF1A00]/90 text-white rounded-lg py-2 text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeleting
              ? locale === "en"
                ? "Deleting..."
                : "جاري الحذف..."
              : t("delete-service")}
          </Button>
        </div>
      </div>
    </div>
  );
}
