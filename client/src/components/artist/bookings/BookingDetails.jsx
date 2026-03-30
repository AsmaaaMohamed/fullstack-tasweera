"use client";

import Image from "next/image";
import { useTranslations } from "next-intl";
import api from "@/lib/api";
import { useEffect, useMemo, useState } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { X } from "lucide-react";
import CashOnDelivery from "@/components/svgs/CashOnDelivery";
import BankIcon from "@/components/svgs/BankIcon";
import CreditIcon from "@/components/svgs/CreditIcon";
import ApplePayIcon from "@/components/svgs/ApplePayIcon";
import MobileIcon from "@/components/svgs/MobileIcon";

export function BookingDetails({ bookingId, onClose, onRefuseSuccess }) {

  const t = useTranslations("Bookings");
  const locale = useLocale();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRefuseModal, setShowRefuseModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isRefusing, setIsRefusing] = useState(false);
  const [refuseError, setRefuseError] = useState(null);

    const Icon = useMemo(() => {
    switch (booking?.paymentMethod) {
      case "cash_on_delivery":
        return CashOnDelivery;
      case "credit_card":
        return CreditIcon;
      case "tamara":
        return MobileIcon;
      case "apple_pay":
        return ApplePayIcon;
      case "tabby":
        return CreditIcon;
      case "stcbank":
        return BankIcon;
      default:
        return null;
    }
  }, [booking?.paymentMethod]);

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
  const config = statusConfig[booking?.status];

  useEffect(() => {
    const fetchBookingDetails = async () => {
      if (!bookingId) return;

      try {
        setIsLoading(true);
        setError(null);

        const response = await api.get(`/bookings/${bookingId}`, {
          headers: {
            "Accept-Language": locale,
          },
        });

        const bookingData = response.data.data;

        // Format the booking data for artist view (customer info instead of artist)
        const formattedBooking = {
          id: bookingData.booking_id.toString(),
          customer: {
            name: bookingData.customer?.name || bookingData.customer_name,
            avatar:
              bookingData.customer?.profile_photo_url ||
              bookingData.customer_profile_photo_url ||
              "/user/profile/default-user.jpg",
          },
          price: bookingData.total_price,
          date: new Date(bookingData.booking_date).toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-US",
            {
              weekday: "long",
              day: "numeric",
              month: "long",
            }
          ),
          time: bookingData.start_time,
          year: new Date(bookingData.booking_date).getFullYear().toString(),
          status: bookingData.status,
          description: bookingData.session_details,
          bookingDate: new Date(bookingData.booking_date).toLocaleDateString(
            locale === "ar" ? "ar-EG" : "en-US"
          ),
          bookingTime: bookingData.start_time,
          duration: bookingData.duration,
          paymentMethod: bookingData.payment_method,
          service_name: bookingData.service?.name,
          booking_code: bookingData.booking_code,
          _raw: bookingData,
        };

        setBooking(formattedBooking);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        toast.error(
          locale === "en"
            ? "Failed to load booking details. Please try again."
            : "فشل في تحميل تفاصيل الحجز. يرجى المحاولة مرة أخرى."
        );
        setError(
          locale === "en"
            ? "Failed to load booking details. Please try again."
            : "فشل في تحميل تفاصيل الحجز. يرجى المحاولة مرة أخرى."
        );
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, locale]);

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center p-4 z-50">
        <div className="bg-white dark:bg-[#343436] rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center text-black dark:text-white">
            {locale === "en"
              ? "Loading booking details..."
              : "جاري تحميل تفاصيل الحجز..."}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center p-4 z-50"
        onClick={onClose}
      >
        <div
          className="bg-white dark:bg-[#363636] rounded-3xl max-w-[700px] w-full p-8 text-center"
          onClick={(e) => e.stopPropagation()}
        >
          <p className="text-red-500 mb-4">{error}</p>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
          >
            {locale === "en" ? "Close" : "إغلاق"}
          </button>
        </div>
      </div>
    );
  }

  const handleOpenRefuseModal = () => {
    setShowRefuseModal(true);
    setCancellationReason("");
    setRefuseError(null);
  };

  const handleCloseRefuseModal = () => {
    if (isRefusing) return;
    setShowRefuseModal(false);
    setCancellationReason("");
    setRefuseError(null);
  };

  const handleConfirmRefuse = async () => {
    if (!bookingId || !cancellationReason.trim()) {
      setRefuseError(
        locale === "en"
          ? "Cancellation reason is required."
          : "سبب الرفض مطلوب."
      );
      return;
    }

    try {
      setIsRefusing(true);
      setRefuseError(null);

      const response = await api.post(
        "/bookings/process",
        {
          booking_id: parseInt(bookingId),
          action: "refuse",
          cancellation_reason: cancellationReason.trim(),
        },
        {
          headers: {
            "Accept-Language": locale,
            "Content-Type": "application/json",
          },
        }
      );

      if (response.status === 200 || response.status === 201) {
        toast.success(
          locale === "en"
            ? "Booking refused successfully."
            : "تم رفض الحجز بنجاح."
        );
        setShowRefuseModal(false);
        setCancellationReason("");
        onRefuseSuccess?.();
        onClose();
      }
    } catch (err) {
      console.error("Error refusing booking:", err);
      const message =
        err?.response?.data?.message ||
        (locale === "en"
          ? "Failed to refuse booking. Please try again."
          : "فشل في رفض الحجز، حاول مرة أخرى.");
      setRefuseError(message);
      toast.error(message);
    } finally {
      setIsRefusing(false);
    }
  };

  if (!booking) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center p-2 sm:p-4 z-50"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-[#363636] rounded-3xl max-w-[700px] w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-4">
          <h2 className="font-semibold text-main text-base sm:text-lg">
            {t("booking-details")}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-[#1C1C1D] rounded-full transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6">
          {/* Two column layout */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            {/* Right column - Booking Info */}
            <div className="space-y-4 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#1C1C1D] p-4 pb-0">
              <div className="flex justify-between items-center m-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                  {locale === "en"
                    ? "General Booking Information"
                    : "معلومات عامة عن الحجز"}
                </h3>
                {/* Status badge */}
                <div
                  className={`h-6 w-[65px] flex items-center justify-center rounded-full text-[10px] ${config.bgColor} ${config.textColor}`}
                >
                  {config.label}
                </div>
              </div>
              <div className="">
                <p className="text-[11px] text-black dark:text-white font-medium">
                  {booking.booking_code}
                </p>
                <p className="text-[12px] text-[#363636] dark:text-gray-300 mb-1 flex gap-1 items-center">
                  <span className="">{t("booking-date")} :</span>
                  {booking.bookingDate}
                </p>
                <p className="text-[12px] text-[#363636] dark:text-gray-300 mb-1 flex gap-1 items-center">
                  <span className="">{t("booking-time")} :</span>
                  <span className="text-left">{booking.bookingTime}</span>
                </p>
                <p className="text-[12px] text-[#363636] dark:text-gray-300 mb-2 flex gap-1 items-center">
                  <span className="">{t("duration")} :</span>
                  <span>{booking.duration}</span>
                </p>
              </div>
            </div>

            {/* Left column - Payment Details */}
            <div className="space-y-4 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#1C1C1D] p-4">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                {t("pay-details")}
              </h3>

              {/* Date and Time Row */}
              <div className="flex items-center gap-2 mb-3">
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
                    {booking.year} {booking.time} {booking.date}
                  </p>
                </div>
              </div>

              {/* Payment Method and Total Amount Row */}
              <div className="flex items-center justify-between gap-4">
                {/* Payment Method */}
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon className={`w-5 h-5 flex-shrink-0 `} currentColor="#E6A525" />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-black dark:text-white">
                      {t("pay-method")}
                    </span>
                    <span className="text-xs text-descriptive dark:text-gray-300">
                      {locale === "en"
                        ? `via ${booking.paymentMethod} service`
                        : `عن طريقة خدمة ${booking.paymentMethod}`}
                    </span>
                  </div>
                </div>

                {/* Total Amount */}
                <div className="flex flex-col items-end">
                  <span className="text-[12px] text-descriptive dark:text-gray-400">
                    {locale === "en" ? "Total Amount" : "المبلغ الاجمالي"}
                  </span>
                  <p className="text-lg font-semibold text-main flex items-center gap-1">
                    {booking.price}
                    <Image
                      src="/currency.svg"
                      width={12}
                      height={14}
                      alt="Reyal"
                      className="w-[12px] h-[14px] dark:brightness-0 dark:invert"
                    />
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Customer section - Simplified */}
          <div className="mb-6">
            <h3 className="text-descriptive dark:text-gray-400 text-sm mb-2">
              {locale === "en" ? "Customer Information" : "معلومات الزبون"}
            </h3>
            <div className="flex items-center gap-3 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#1C1C1D] p-3">
              <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                <Image
                  src={booking.customer.avatar || "/placeholder.svg"}
                  alt={booking.customer.name}
                  width={400}
                  height={300}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-gray-900 dark:text-white text-sm">
                  {booking.customer.name}
                </p>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          {booking.status === "pending" && (
            <div className="flex justify-center mb-6">
              <PrimaryButton
                onClick={handleOpenRefuseModal}
                className="h-[56px] w-full sm:w-[232px] text-sm rounded-full bg-[#FF1A00] text-white font-medium hover:bg-[#e21600] transition-colors"
              >
                {locale === "en" ? "Refuse" : "رفض الطلب"}
              </PrimaryButton>
            </div>
          )}
        </div>

        {/* Refuse Modal */}
        {showRefuseModal && (
          <div className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-[#363636] rounded-2xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4">
              <h3 className="text-base sm:text-lg text-red-500 font-semibold mb-4">
                {locale === "en" ? "Refuse booking" : "رفض الحجز"}
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                {locale === "en"
                  ? "Please provide a reason for refusing this booking:"
                  : "يرجى كتابة سبب رفض هذا الحجز:"}
              </p>

              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder={
                  locale === "en" ? "Enter your reason..." : "اكتب سبب الرفض..."
                }
                className="w-full p-3 border border-gray-300 dark:border-[#363636] dark:bg-[#363636] dark:text-white rounded-lg mb-4 h-32 placeholder:text-descriptive dark:placeholder:text-gray-400 placeholder:text-sm"
                disabled={isRefusing}
              />

              {refuseError && (
                <p className="text-red-500 text-sm mb-4">{refuseError}</p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCloseRefuseModal}
                  disabled={isRefusing}
                  className="px-4 py-2 bg-primary text-sm text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  {locale === "en" ? "Back" : "رجوع"}
                </button>
                <button
                  onClick={handleConfirmRefuse}
                  disabled={isRefusing || !cancellationReason.trim()}
                  className={`px-4 py-2 rounded-lg text-sm w-full sm:w-auto ${isRefusing || !cancellationReason.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                    }`}
                >
                  {isRefusing
                    ? locale === "en"
                      ? "Processing..."
                      : "جاري المعالجة..."
                    : locale === "en"
                      ? "Confirm refusal"
                      : "تأكيد الرفض"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
