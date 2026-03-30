"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArtistBookingCard } from "./ArtistBookingCard";
import { getArtistStats } from "@/lib/artist-stats";
import api from "@/lib/api";

export function BookingSection() {
  const t = useTranslations("Bookings");
  const locale = useLocale();
  const [latestBooking, setLatestBooking] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRefuseModalOpen, setIsRefuseModalOpen] = useState(false);
  const [cancellationReason, setCancellationReason] = useState("");
  const [requestError, setRequestError] = useState(null);

  const fetchLatestBooking = async () => {
    const data = await getArtistStats("day");
    if (data?.latest_pending_booking) {
      const booking = data.latest_pending_booking;
      const bookingDate = new Date(booking.booking_date);
      const createdAt = booking.created_at
        ? new Date(booking.created_at.replace(" ", "T"))
        : null;

      const formattedDate = bookingDate.toLocaleDateString(
        locale === "ar" ? "ar-EG" : "en-US",
        {
          weekday: "long",
          day: "numeric",
          month: "long",
        }
      );

      const formattedYear = bookingDate.getFullYear().toString();

      const formattedCreatedAt = createdAt
        ? createdAt.toLocaleString(locale === "ar" ? "ar-EG" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })
        : null;

      setLatestBooking({
        id: booking.booking_id.toString(),
        status: booking.status,
        name: booking.customer_name,
        avatar: booking.customer_profile_picture
          ? booking.customer_profile_picture
          : "/user/profile/default-user.jpg",
        booking_code: booking.booking_code,
        requestDateTime: formattedCreatedAt,
        sessionDate: formattedDate,
        time: booking.start_time,
        year: formattedYear,
        description:
          booking.session_details ??
          (locale === "en"
            ? "The customer booked a new photography session."
            : "قام الزبون بحجز جلسة تصوير جديدة."),
      });
    } else {
      setLatestBooking(null);
    }
  };

  useEffect(() => {
    fetchLatestBooking();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [locale]);

  const handleAccept = async () => {
    if (!latestBooking?.id) return;

    try {
      setIsProcessing(true);
      setRequestError(null);

      const response = await api.post(
        "/bookings/process",
        {
          booking_id: parseInt(latestBooking.id),
          action: "accept",
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
            ? "Booking accepted successfully."
            : "تم قبول الحجز بنجاح."
        );
        await fetchLatestBooking();
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      const message =
        error?.response?.data?.message ||
        (locale === "en"
          ? "Failed to accept booking. Please try again."
          : "فشل في قبول الحجز، حاول مرة أخرى.");
      setRequestError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOpenRefuseModal = () => {
    if (!latestBooking?.id) return;
    setRequestError(null);
    setCancellationReason("");
    setIsRefuseModalOpen(true);
  };

  const handleConfirmRefuse = async () => {
    if (!latestBooking?.id) return;
    if (!cancellationReason.trim()) {
      setRequestError(
        locale === "en"
          ? "Cancellation reason is required."
          : "سبب الرفض مطلوب."
      );
      return;
    }

    try {
      setIsProcessing(true);
      setRequestError(null);

      const response = await api.post(
        "/bookings/process",
        {
          booking_id: parseInt(latestBooking.id),
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
        setIsRefuseModalOpen(false);
        setCancellationReason("");
        await fetchLatestBooking();
      }
    } catch (error) {
      console.error("Error refusing booking:", error);
      const message =
        error?.response?.data?.message ||
        (locale === "en"
          ? "Failed to refuse booking. Please try again."
          : "فشل في رفض الحجز، حاول مرة أخرى.");
      setRequestError(message);
      toast.error(message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCloseRefuseModal = () => {
    if (isProcessing) return;
    setIsRefuseModalOpen(false);
    setCancellationReason("");
    setRequestError(null);
  };

  return (
    <section className="space-y-4 mt-6">
      <header className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-black dark:text-white">
          {locale === "en" ? "Latest Pending Booking" : "أحدث حجز قيد الانتظار"}
        </h2>
      </header>

      {latestBooking ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ArtistBookingCard
            booking={latestBooking}
            onAccept={handleAccept}
            onRefuse={handleOpenRefuseModal}
            isProcessing={isProcessing}
          />
        </div>
      ) : (
        <p className="mt-6 text-base sm:text-lg font-semibold text-descriptive dark:text-gray-300 text-center">
          {locale === "en"
            ? "No bookings for you yet :)"
            : "لا يوجد لديك حجوزات حالياً :)"}{" "}
        </p>
      )}

      {isRefuseModalOpen && (
        <div className="fixed inset-0 bg-[#0000006b] bg-opacity-50 flex items-center justify-center z-50 p-4">
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
              disabled={isProcessing}
            />

            {requestError && (
              <p className="text-red-500 text-sm mb-4">{requestError}</p>
            )}

            <div className="flex flex-col sm:flex-row justify-end gap-3">
              <button
                onClick={handleCloseRefuseModal}
                disabled={isProcessing}
                className="px-4 py-2 bg-primary text-sm text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
              >
                {locale === "en" ? "Back" : "رجوع"}
              </button>
              <button
                onClick={handleConfirmRefuse}
                disabled={isProcessing || !cancellationReason.trim()}
                className={`px-4 py-2 rounded-lg text-sm w-full sm:w-auto ${
                  isProcessing || !cancellationReason.trim()
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-red-500 hover:bg-red-600 text-white"
                }`}
              >
                {isProcessing
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
    </section>
  );
}
