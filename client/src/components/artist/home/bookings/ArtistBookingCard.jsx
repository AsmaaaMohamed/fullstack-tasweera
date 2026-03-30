"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import PrimaryButton from "@/components/shared/PrimaryButton";

export function ArtistBookingCard({
  booking,
  onClick,
  onAccept,
  onRefuse,
  isProcessing = false,
}) {
  const t = useTranslations("Bookings");
  const locale = useLocale();

  const statusConfig = {
    pending: {
      label: t("waiting"),
      bgColor: "bg-[#E6A5251A]",
      textColor: "text-main",
    },
    completed: {
      label: t("completed"),
      bgColor: "bg-[#28B4461A]",
      textColor: "text-[#28B446]",
    },
    cancelled: {
      label: t("cancelled"),
      bgColor: "bg-[#FF1A001A]",
      textColor: "text-[#FF1A00]",
    },
  };

  const config = statusConfig[booking.status] ?? statusConfig.pending;

  const requestLabel =
    locale === "en" ? "Request sent at:" : "تاريخ و وقت ارسال الطلب:";
  const sessionLabel =
    locale === "en" ? "Session date & time:" : "تاريخ و وقت طلب الجلسة:";

  return (
    <div
      className="bg-white dark:bg-[#343436] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      {/* Top row: status + booking code */}
      <div className="flex items-center justify-between border-b border-[#F5F5F5] dark:border-gray-500 px-4 py-3">
        <div
          className={`h-8 min-w-[110px] px-4 flex items-center justify-center rounded-full text-sm ${config.bgColor} ${config.textColor}`}
        >
          {config.label}
        </div>
        <p className="text-sm font-semibold text-black dark:text-white">
          {booking.booking_code}
        </p>
      </div>

      {/* Second row: dates on one side, customer info on the other */}
      <div className="flex justify-between gap-4 border-b border-[#F5F5F5] dark:border-slate-600 px-4 py-3">
        {/* Customer info */}
        <div className="flex items-center gap-3">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={booking.avatar || "/images/photographers/photographer.jpg"}
              alt={booking.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="text-right">
            <h3 className="font-medium text-black dark:text-white text-sm">
              {booking.name}
            </h3>
          </div>
        </div>
        {/* Dates */}
        <div className="flex flex-col gap-1 text-[12px]">
          {booking.requestDateTime && (
            <p className="text-main font-medium">
              <span className="text-descriptive dark:text-gray-400 ms-1">
                {requestLabel}
              </span>
              {booking.requestDateTime}
            </p>
          )}
          <p className="text-main font-medium">
            <span className="text-descriptive dark:text-gray-400 ms-1">
              {sessionLabel}
            </span>
            {booking.year} {booking.time} {booking.sessionDate}
          </p>
        </div>
      </div>

      {/* Session details + actions */}
      <div className="px-4 pt-3 pb-4 flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <h4 className="font-medium text-black dark:text-white">
            {t("session-details")}
          </h4>
          <p className="text-sm text-descriptive dark:text-gray-400 font-medium leading-relaxed">
            {booking.description}
          </p>
        </div>

        {booking.status === "pending" && (
          <div className="mt-1 flex items-center justify-between gap-2 w-full lg:w-1/2 mr-auto">
            <PrimaryButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isProcessing) onAccept?.();
              }}
              disabled={isProcessing}
              className="flex-1 h-9 rounded-full bg-[#28B446] text-white text-sm font-medium hover:bg-[#28B446]/90 transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isProcessing
                ? locale === "en"
                  ? "Processing..."
                  : "جاري المعالجة..."
                : locale === "en"
                ? "Accept"
                : "قبول الطلب"}
            </PrimaryButton>
            <PrimaryButton
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                if (!isProcessing) onRefuse?.();
              }}
              disabled={isProcessing}
              className="flex-1 h-9 rounded-full bg-[#FF1A00] text-white text-sm font-medium hover:bg-[#e21600] transition-colors disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {locale === "en" ? "Refuse" : "رفض الطلب"}
            </PrimaryButton>
          </div>
        )}
      </div>
    </div>
  );
}
