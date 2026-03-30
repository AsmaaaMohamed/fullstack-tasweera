import api from "@/lib/api";

/**
 * Fetch all artist bookings from the API.
 *
 * @param {string} locale - The locale for the API request
 * @param {string} status - The status filter (e.g., "pending", "all", "completed", "cancelled")
 * @returns {Promise<Array|null>} Array of formatted bookings or null on error
 */
export async function getAllArtistBookings(locale = "en", status = "pending") {
  try {
    const response = await api.get("/bookings/artist", {
      params: { status, lang: locale },
      headers: {
        "Accept-Language": locale,
      },
    });

    const data = response?.data;

    // Handle the API response format: { message: "...", data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      return data.data;
    }

    if (process.env.NODE_ENV === "development") {
      console.warn("Unexpected artist bookings API response format:", data);
    }

    return null;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch artist bookings:", error);
    }
    return null;
  }
}

/**
 * Format a booking object from API response to component format.
 *
 * @param {Object} booking - Raw booking object from API
 * @param {string} locale - The locale for date formatting
 * @returns {Object} Formatted booking object
 */
export function formatBooking(booking, locale = "en") {
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

  return {
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
  };
}
