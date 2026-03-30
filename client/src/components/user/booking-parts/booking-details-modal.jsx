"use client";

import Image from "next/image";
import { Star, X } from "lucide-react";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import api from "@/lib/api";
import { useEffect, useState, useMemo } from "react";
import { useLocale } from "next-intl";
import { toast } from "sonner";
import Cookies from "js-cookie";
import CashOnDelivery from "@/components/svgs/CashOnDelivery";
import BankIcon from "@/components/svgs/BankIcon";
import CreditIcon from "@/components/svgs/CreditIcon";
import ApplePayIcon from "@/components/svgs/ApplePayIcon";
import MobileIcon from "@/components/svgs/MobileIcon";

export function BookingDetailsModal({ bookingId, onClose, onCancelConfirm }) {
  const t = useTranslations("Bookings");
  const tUser = useTranslations("UserHome");
  const router = useRouter();
  const locale = useLocale();

  const [booking, setBooking] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isProfileLoading, setIsProfileLoading] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [isCancelling, setIsCancelling] = useState(false);

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

  const handleCancelBooking = async () => {
    if (!booking?.id || !cancellationReason.trim()) {
      setError("Please provide a cancellation reason");
      return;
    }

    try {
      setIsCancelling(true);
      const response = await api.post(
        "/bookings/process",
        {
          booking_id: parseInt(booking.id),
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
        onClose();
        onCancelConfirm();
        toast.success("Booking cancelled successfully.");
        setShowCancelModal(false);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      toast.error(
        error.response?.data?.message ||
          "Failed to cancel booking. Please try again."
      );
      setError(
        error.response?.data?.message ||
          "Failed to cancel booking. Please try again."
      );
    } finally {
      setIsCancelling(false);
    }
  };

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

        // Format the booking data to match the expected structure
        const formattedBooking = {
          id: bookingData.booking_id.toString(),
          name: bookingData.artist.name,
          phone: bookingData.artist.phone,
          avatar: bookingData.artist.profile_photo_url,
          price: bookingData.total_price,
          date: new Date(bookingData.booking_date).toLocaleDateString("en-US", {
            weekday: "long",
            day: "numeric",
            month: "long",
          }),
          time: bookingData.start_time,
          year: new Date(bookingData.booking_date).getFullYear().toString(),
          status: bookingData.status,
          description: bookingData.session_details,
          bookingDate: new Date(bookingData.booking_date).toLocaleDateString(),
          bookingTime: bookingData.start_time,
          duration: bookingData.duration,
          artist: {
            id: bookingData.artist.id.toString(),
            name: bookingData.artist.name,
            avatar: bookingData.artist.profile_photo_url,
            rating: bookingData.artist.artist_average_rating || 0,
            experience:
              bookingData.artist.artist_years_of_experience?.toString() || "0",
          },
          paymentMethod: bookingData.payment_method,
          service_name: bookingData.service?.name,
          booking_code: bookingData.booking_code,
          _raw: bookingData,
        };

        setBooking(formattedBooking);
      } catch (err) {
        console.error("Error fetching booking details:", err);
        toast.error("Failed to load booking details. Please try again.");
        setError("Failed to load booking details. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchBookingDetails();
  }, [bookingId, locale]);

  if (isLoading || isCancelling) {
    return (
      <div className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center p-4 z-50 dark:bg-[#343436]!">
        <div className="bg-white dark:bg-[#343436] rounded-3xl p-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-center">
            {isCancelling
              ? "Cancelling booking..."
              : "Loading booking details..."}
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
            Close
          </button>
        </div>
      </div>
    );
  }

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
                  {t("booking-info")}
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
                  <span>{booking.duration} minutes</span>
                </p>
              </div>
            </div>

            {/* Left column - Payment Details */}
            <div className="space-y-4 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#1C1C1D] p-4 pb-0">
              <h3 className="font-semibold text-gray-900 dark:text-white text-sm mb-2">
                {t("pay-details")}
              </h3>
              <div className="flex items-center gap-2 mb-1">
                <Image
                  src="/images/bookings/calendar.png"
                  width={38.5}
                  height={38.5}
                  alt="Calendar"
                  className=""
                />
                <div className="flex flex-col">
                  <span className="text-[12px] text-descriptive dark:text-gray-400 ">
                    {t("date-time")}
                  </span>
                  <p className="text-[12px] font-medium text-main">
                    {booking.year} PM {booking.time} {booking.date}
                  </p>
                </div>
              </div>

              <div className="">
                <div className="flex items-center gap-2">
                  {Icon && (
                    <Icon
                      className={`w-5 h-5 flex-shrink-0`}
                      currentColor="#E6A525"
                    />
                  )}
                  <div className="flex flex-col">
                    <span className="text-xs text-black dark:text-white">
                      {t("pay-method")}
                    </span>
                    <span className="text-xs text-descriptive dark:text-gray-300">
                      {booking.paymentMethod}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Photographer section */}
          <div className="mb-6">
            <h3 className="text-descriptive dark:text-gray-400 text-sm mb-2">
              {t("photographer-info")}
            </h3>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#1C1C1D] p-3 sm:p-2">
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <div className="w-14 h-14 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                  <Image
                    src={
                      booking.artist.avatar ||
                      "//images/photographers/photographer.jpg"
                    }
                    alt={booking.artist.name}
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">
                    {booking.artist.name}
                  </p>
                  <p className="text-xs text-descriptive dark:text-gray-400 flex gap-1">
                    <span> {tUser("years-experience")} : </span>
                    {booking.artist.experience}
                  </p>
                  <div className="flex items-center gap-1 mt-1">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${
                          i < Math.floor(booking.artist.rating)
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                    <span className="text-xs text-gray-700 font-semibold dark:text-gray-300">
                      {booking.artist.rating}
                    </span>
                  </div>
                </div>
              </div>
              <PrimaryButton
                className="text-[8px] sm:text-[10px] rounded-lg border border-darker flex items-center justify-center gap-1 w-full sm:w-auto sm:min-w-[100px] flex-shrink-0"
                onClick={async (e) => {
                  e.stopPropagation();
                  const artistId = booking.artist?.id;
                  if (!artistId) return;

                  try {
                    setIsProfileLoading(true);
                    // Navigate directly to the profile page
                    // The profile page will handle its own data fetching
                    router.push(`/provider-details/${artistId}`);
                  } catch (err) {
                    console.error("Error navigating to profile:", err);
                  } finally {
                    setIsProfileLoading(false);
                  }
                }}
                disabled={isProfileLoading}
              >
                {isProfileLoading ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-1 h-3 w-3 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    {tUser("loading")}
                  </>
                ) : (
                  tUser("show-profile")
                )}
              </PrimaryButton>
            </div>
          </div>

          {/* Action buttons */}
          {booking.status === "pending" && (
            <div className="flex justify-center mb-6">
              <PrimaryButton
                onClick={() => setShowCancelModal(true)}
                className="h-[56px] bg-[#FF1A00] hover:bg-[#e21600] w-full sm:w-[232px] text-sm"
              >
                {t("cancel-booking")}
              </PrimaryButton>
            </div>
          )}
        </div>
        {showCancelModal && (
          <div className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center z-[60] p-4">
            <div className="bg-white dark:bg-[#363636] rounded-2xl p-4 sm:p-6 w-full max-w-md mx-2 sm:mx-4">
              <h3 className="text-base sm:text-lg text-red-500 font-semibold mb-4">
                Cancel Booking
              </h3>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">
                Please provide a reason for cancellation:
              </p>

              <textarea
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Enter your reason for cancellation..."
                className="w-full p-3 border border-gray-300 dark:border-[#363636] dark:bg-[#363636] dark:text-white rounded-lg mb-4 h-32 placeholder:text-descriptive dark:placeholder:text-gray-400 placeholder:text-sm"
                disabled={isCancelling}
              />

              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={() => {
                    setShowCancelModal(false);
                    setCancellationReason("");
                    setError(null);
                  }}
                  disabled={isCancelling}
                  className="px-4 py-2 bg-primary text-sm text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  Back
                </button>
                <button
                  onClick={handleCancelBooking}
                  disabled={isCancelling || !cancellationReason.trim()}
                  className={`px-4 py-2 rounded-lg text-sm w-full sm:w-auto ${
                    isCancelling || !cancellationReason.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isCancelling ? "Cancelling..." : "Confirm Cancellation"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
