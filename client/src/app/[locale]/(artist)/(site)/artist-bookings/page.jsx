import { cookies } from "next/headers";
import AllBookingsClient from "@/components/artist/bookings/AllBookingsClient";
import { formatBooking } from "@/lib/artist-bookings";

export default async function ArtistBookingsPage({ params }) {
  const { locale } = await params;
  const cookieStore = await cookies();

  // Fetch bookings from API
  let initialBookings = [];
  try {
    const response = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/bookings/artist?status=all&lang=${locale}`,
      {
        headers: {
          Authorization: `Bearer ${cookieStore.get("auth_token")?.value}`,
        },
        cache: "no-store",
      }
    );

    if (!response.ok) {
      throw new Error(`Failed to fetch bookings: ${response.status}`);
    }

    const data = await response.json();

    // Handle the API response format: { message: "...", data: [...] }
    if (data?.data && Array.isArray(data.data)) {
      initialBookings = data.data.map((booking) =>
        formatBooking(booking, locale)
      );
    }
  } catch (error) {
    console.error("Error fetching bookings in server component:", error);
    // Continue with empty array if fetch fails
  }

  return (
    <main className="bg-white dark:bg-[#363636] min-h-screen">
      <AllBookingsClient initialBookings={initialBookings} />
    </main>
  );
}
