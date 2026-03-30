"use client";

import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Calendar } from "lucide-react";

export default function ServiceRequestsTab({ bookings }) {
  const t = useTranslations("MyServices");
  const tBookings = useTranslations("Bookings");
  const locale = useLocale();
  const isRTL = locale === "ar";

  const statusConfig = {
    pending: {
      label: tBookings("waiting"),
      bgColor: "bg-[#E6A5251A]",
      textColor: "text-main",
    },
    completed: {
      label: tBookings("completed"),
      bgColor: "bg-[#28B4461A]",
      textColor: "text-[#28B446]",
    },
    cancelled: {
      label: tBookings("cancelled"),
      bgColor: "bg-[#FF1A001A]",
      textColor: "text-[#FF1A00]",
    },
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatDateTime = (dateString, timeString) => {
    if (!dateString) return "";
    const formattedDate = formatDate(dateString);
    return `${formattedDate} ${timeString || ""}`;
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}${parts[1].charAt(0)}`;
    }
    return parts[0].charAt(0).toUpperCase();
  };

  if (!bookings || bookings.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t("no-bookings")}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {bookings.map((booking) => {
        const config = statusConfig[booking.status] || statusConfig.pending;
        const bookingDate = formatDateTime(
          booking.booking_date,
          booking.start_time
        );
        const requestDate = formatDate(booking.created_at);

        return (
          <div
            key={booking.booking_id}
            className="bg-white dark:bg-[#343436] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm p-4"
            dir={isRTL ? "rtl" : "ltr"}
          >
            {/* First Row: Status Badge and Customer Info */}
            <div
              className={`flex items-center justify-between mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {/* Status Badge */}
              <div
                className={`h-8 px-4 flex items-center justify-center rounded-full text-sm ${config.bgColor} ${config.textColor}`}
              >
                {config.label}
              </div>

              {/* Customer Info */}
              <div
                className={`flex items-center gap-3 ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className={isRTL ? "text-right" : "text-left"}>
                  <h3 className="font-medium text-black dark:text-white text-sm mb-1">
                    {booking.customer_name}
                  </h3>
                  <p className="text-xs text-main font-medium">
                    {booking.booking_code}
                  </p>
                </div>
                <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  {booking.customer_profile_picture ? (
                    <Image
                      src={booking.customer_profile_picture}
                      alt={booking.customer_name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full bg-main flex items-center justify-center text-white font-semibold text-lg">
                      {getInitials(booking.customer_name)}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Second Row: Dates Aligned Together */}
            <div
              className={`flex flex-wrap items-center justify-between gap-4 mb-4 ${
                isRTL ? "flex-row-reverse" : ""
              }`}
            >
              {/* Booking Date */}
              <div
                className={`flex items-center gap-2 text-xs w-full sm:w-auto ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-descriptive dark:text-gray-400 text-[10px] mb-1">
                    {t("booking-date")}
                  </p>
                  <p className="text-main font-medium">{bookingDate}</p>
                </div>
                <Calendar className="w-4 h-4 text-main flex-shrink-0" />
              </div>

              {/* Request Date */}
              <div
                className={`flex items-center gap-2 text-xs w-full sm:w-auto ${
                  isRTL ? "flex-row-reverse" : ""
                }`}
              >
                <div className={isRTL ? "text-right" : "text-left"}>
                  <p className="text-descriptive dark:text-gray-400 text-[10px] mb-1">
                    {t("request-date-time")}
                  </p>
                  <p className="text-main font-medium">{requestDate}</p>
                </div>
                <Calendar className="w-4 h-4 text-main flex-shrink-0" />
              </div>
            </div>

            {/* Third Row: Session Details */}
            {booking.session_details && (
              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <h4
                  className={`font-medium text-black dark:text-white text-sm mb-2 ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {tBookings("session-details")}:
                </h4>
                <p
                  className={`text-sm text-descriptive dark:text-gray-400 leading-relaxed ${
                    isRTL ? "text-right" : "text-left"
                  }`}
                >
                  {booking.session_details}
                </p>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
