"use client";

import { BookingCard } from "@/components/user/booking-parts/booking-card";
import { BookingDetailsModal } from "@/components/user/booking-parts/booking-details-modal";
import { BookingTabs } from "@/components/user/booking-parts/booking-tabs";
import { EmptyState } from "@/components/user/booking-parts/empty-state";
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";

export default function BookingsClient({ initialBookings }) {
  const [activeTab, setActiveTab] = useState("all");
  const [selectedBooking, setSelectedBooking] = useState(null);
  const router = useRouter();

  const formattedBookings = initialBookings.map((booking) => ({
    id: booking.booking_id.toString(),
    name: booking.artist_name,
    booking_code: booking.booking_code, // Not available in the list response
    avatar: booking.artist_profile_photo_url,
    price: booking.total_price,
    date: new Date(booking.booking_date).toLocaleDateString("en-US", {
      weekday: "long",
      day: "numeric",
      month: "long",
    }),
    time: booking.start_time,
    year: new Date(booking.booking_date).getFullYear().toString(),
    status: booking.status,
    description: booking.session_details,
    bookingDate: new Date(booking.booking_date).toLocaleDateString(),
    bookingTime: booking.start_time,
    duration: booking.duration,
    artist: {
      id: booking.booking_id.toString(), // Using booking_id as a fallback
      name: booking.artist_name,
      avatar: booking.artist_profile_photo_url,
      rating: 0, // Not available in the list response
      experience: "", // Not available in the list response
    },
    paymentMethod: booking.payment_method,
    service_name: booking.service_name,
    booking_code: booking.booking_code,
    // Keep original data for reference
    _raw: booking,
  }));

  const filteredBookings =
    activeTab === "all"
      ? formattedBookings
      : formattedBookings.filter((booking) => booking.status === activeTab);

  return (
    <main className="min-h-screen bg-white dark:bg-[#363636]">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header with tabs */}
        <div className="mb-8 px-6 bg-[#F5F5F5] dark:bg-[#363636] rounded-[25px] py-2">
          <BookingTabs activeTab={activeTab} onTabChange={setActiveTab} />
        </div>

        {filteredBookings.length === 0 ? (
          <EmptyState activeTab={activeTab} />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredBookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                onClick={() => setSelectedBooking(booking)}
              />
            ))}
          </div>
        )}
      </div>
      {selectedBooking && (
        <BookingDetailsModal
          bookingId={selectedBooking.id}
          onClose={() => setSelectedBooking(null)}
          onCancelConfirm={() => router.refresh()}
        />
      )}
    </main>
  );
}
