"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import { ArtistBookingCard } from "@/components/artist/home/bookings/ArtistBookingCard";
import { BookingDetails } from "./BookingDetails";
import api from "@/lib/api";
import { useRouter } from "@/i18n/navigation";

export default function AllBookingsClient({ initialBookings = [] }) {
  const t = useTranslations("Bookings");
  const locale = useLocale();
  const router = useRouter();
  const [bookings, setBookings] = useState(initialBookings);
  const [selectedBookingId, setSelectedBookingId] = useState(null);
  const [processingBookings, setProcessingBookings] = useState(new Set());
  const [refuseModalState, setRefuseModalState] = useState({
    isOpen: false,
    bookingId: null,
    cancellationReason: "",
    requestError: null,
  });

  // Bookings are fetched on the server and passed as initialBookings
  // router.refresh() will refetch on server after accept/refuse actions

  const handleAccept = async (bookingId) => {
    if (!bookingId) return;

    try {
      setProcessingBookings((prev) => new Set(prev).add(bookingId));
      const response = await api.post(
        "/bookings/process",
        {
          booking_id: parseInt(bookingId),
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
        // Remove the booking from the list
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        // Refresh the page to get updated data from server
        router.refresh();
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      const message =
        error?.response?.data?.message ||
        (locale === "en"
          ? "Failed to accept booking. Please try again."
          : "فشل في قبول الحجز، حاول مرة أخرى.");
      toast.error(message);
    } finally {
      setProcessingBookings((prev) => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
    }
  };

  const handleOpenRefuseModal = (bookingId) => {
    if (!bookingId) return;
    setRefuseModalState({
      isOpen: true,
      bookingId,
      cancellationReason: "",
      requestError: null,
    });
  };

  const handleConfirmRefuse = async () => {
    const { bookingId, cancellationReason } = refuseModalState;
    if (!bookingId) return;
    if (!cancellationReason.trim()) {
      setRefuseModalState((prev) => ({
        ...prev,
        requestError:
          locale === "en"
            ? "Cancellation reason is required."
            : "سبب الرفض مطلوب.",
      }));
      return;
    }

    try {
      setProcessingBookings((prev) => new Set(prev).add(bookingId));
      setRefuseModalState((prev) => ({ ...prev, requestError: null }));

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
        setRefuseModalState({
          isOpen: false,
          bookingId: null,
          cancellationReason: "",
          requestError: null,
        });
        // Remove the booking from the list
        setBookings((prev) => prev.filter((b) => b.id !== bookingId));
        router.refresh();
      }
    } catch (error) {
      console.error("Error refusing booking:", error);
      const message =
        error?.response?.data?.message ||
        (locale === "en"
          ? "Failed to refuse booking. Please try again."
          : "فشل في رفض الحجز، حاول مرة أخرى.");
      setRefuseModalState((prev) => ({ ...prev, requestError: message }));
      toast.error(message);
    } finally {
      setProcessingBookings((prev) => {
        const next = new Set(prev);
        next.delete(bookingId);
        return next;
      });
    }
  };

  const handleCloseRefuseModal = () => {
    const { bookingId } = refuseModalState;
    if (bookingId && processingBookings.has(bookingId)) return;
    setRefuseModalState({
      isOpen: false,
      bookingId: null,
      cancellationReason: "",
      requestError: null,
    });
  };

  const isProcessing = (bookingId) => processingBookings.has(bookingId);

  return (
    <div className="min-h-screen bg-white dark:bg-[#363636] py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <header className="mb-6">
          <h1 className="text-2xl font-bold text-black dark:text-white">
            {locale === "en" ? "All Bookings" : "جميع الحجوزات"}
          </h1>
        </header>

        {/* Bookings Grid */}
        {bookings.length === 0 ? (
          <div className="flex items-center justify-center py-12">
            <p className="text-base sm:text-lg font-semibold text-descriptive dark:text-gray-300 text-center">
              {locale === "en"
                ? "No bookings for you yet :)"
                : "لا يوجد لديك حجوزات حالياً :)"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {bookings.map((booking) => (
              <ArtistBookingCard
                key={booking.id}
                booking={booking}
                onClick={() => setSelectedBookingId(booking.id)}
                onAccept={() => handleAccept(booking.id)}
                onRefuse={() => handleOpenRefuseModal(booking.id)}
                isProcessing={isProcessing(booking.id)}
              />
            ))}
          </div>
        )}

        {/* Booking Details Modal */}
        {selectedBookingId && (
          <BookingDetails
            bookingId={selectedBookingId}
            onClose={() => setSelectedBookingId(null)}
            onRefuseSuccess={() => {
              setBookings((prev) =>
                prev.filter((b) => b.id !== selectedBookingId)
              );
              setSelectedBookingId(null);
              router.refresh();
            }}
          />
        )}

        {/* Refuse Modal */}
        {refuseModalState.isOpen && (
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
                value={refuseModalState.cancellationReason}
                onChange={(e) =>
                  setRefuseModalState((prev) => ({
                    ...prev,
                    cancellationReason: e.target.value,
                  }))
                }
                placeholder={
                  locale === "en" ? "Enter your reason..." : "اكتب سبب الرفض..."
                }
                className="w-full p-3 border border-gray-300 dark:border-[#363636] dark:bg-[#363636] dark:text-white rounded-lg mb-4 h-32 placeholder:text-descriptive dark:placeholder:text-gray-400 placeholder:text-sm"
                disabled={isProcessing(refuseModalState.bookingId)}
              />

              {refuseModalState.requestError && (
                <p className="text-red-500 text-sm mb-4">
                  {refuseModalState.requestError}
                </p>
              )}

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  onClick={handleCloseRefuseModal}
                  disabled={isProcessing(refuseModalState.bookingId)}
                  className="px-4 py-2 bg-primary text-sm text-white rounded-lg hover:bg-primary/90 transition-colors w-full sm:w-auto"
                >
                  {locale === "en" ? "Back" : "رجوع"}
                </button>
                <button
                  onClick={handleConfirmRefuse}
                  disabled={
                    isProcessing(refuseModalState.bookingId) ||
                    !refuseModalState.cancellationReason.trim()
                  }
                  className={`px-4 py-2 rounded-lg text-sm w-full sm:w-auto ${
                    isProcessing(refuseModalState.bookingId) ||
                    !refuseModalState.cancellationReason.trim()
                      ? "bg-gray-300 cursor-not-allowed"
                      : "bg-red-500 hover:bg-red-600 text-white"
                  }`}
                >
                  {isProcessing(refuseModalState.bookingId)
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
