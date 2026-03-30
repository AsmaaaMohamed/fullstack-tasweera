"use client";

import Image from "next/image";
import { Calendar, DollarSign } from "lucide-react";
import { useTranslations } from "next-intl";

export function BookingCard({ booking, onClick }) {
  const t = useTranslations("Bookings");
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

  const config = statusConfig[booking.status];

  return (
    <div
      className="bg-white dark:bg-[#343436] rounded-lg border border-gray-200 dark:border-slate-600 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
    >
      <div className="flex items-center justify-between mb-4 border-b border-[#F5F5F5] dark:border-gray-500 p-2">
        {/* Customer info */}

        <div className="flex items-center gap-3 ">
          <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
            <Image
              src={booking.avatar || "/images/photographers/photographer.jpg"}
              alt={booking.name}
              width={300}
              height={300}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="">
            <h3 className="font-medium text-black dark:text-white text-sm">
              {booking.name}
            </h3>
            <p className="text-xs text-[#C5C5C5] dark:text-gray-400">
              {booking.phone}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <div className="">
          <div
            className={`h-8 w-[90px] flex items-center justify-center rounded-full text-sm ${config.bgColor} ${config.textColor}`}
          >
            {config.label}
          </div>
        </div>
      </div>
      {/* Details grid */}
      <div className="flex justify-between gap-4 border-b border-[#F5F5F5] dark:border-slate-600 p-2">
        {/* Date and time */}
        <div className=" rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <Image
              src="/images/bookings/calendar.png"
              width={38.5}
              height={38.5}
              alt="Calendar"
              className=""
            />
            <div className="flex flex-col">
              <span className="text-[12px] text-descriptive dark:text-gray-400">
                {t("date-time")}
              </span>
              <p className="text-[12px] font-medium text-main">
                {booking.year} PM {booking.time} {booking.date}
              </p>
            </div>
          </div>
        </div>
        {/* Price */}
        <div className=" rounded-lg">
          <div className="flex items-center gap-2 ">
            <Image
              src="/images/bookings/dollar.png"
              width={38.5}
              height={38.5}
              alt="dollar"
              className=""
            />
            <div className="flex flex-col">
              <span className="text-xs text-descriptive dark:text-gray-400">
                {t("price")}
              </span>
              <div className="flex flex-nowrap gap-1">
                <span className="text-xs text-main font-medium">
                  {booking.price}
                </span>
                <Image
                  src="/images/bookings/reyal.png"
                  width={200}
                  height={240}
                  alt="dollar"
                  className="w-[12px] h-[14px]"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="px-4 py-2 flex flex-col gap-1 mb-11">
        {/* Session details header */}
        <h4 className="font-medium text-black dark:text-white ">
          {t("session-details")}
        </h4>

        {/* Description */}
        <p className="text-sm text-descriptive dark:text-gray-400 font-medium leading-relaxed">
          {booking.description}
        </p>
      </div>
    </div>
  );
}
