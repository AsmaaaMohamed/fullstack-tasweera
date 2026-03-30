import { cookies } from "next/headers";
import BookingsClient from "./BookingsClient";

export default async function BookingsPage({ searchParams }) {
  const locale = searchParams.locale;
const cookieStore = await cookies();
  const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/bookings/customer?lang=${locale}`, {
    headers: {
      Authorization: `Bearer ${cookieStore.get("auth_token")?.value}`
    },
    cache: "no-store"
  });

  const data = await response.json();
  return <BookingsClient initialBookings={data.data} />;
}