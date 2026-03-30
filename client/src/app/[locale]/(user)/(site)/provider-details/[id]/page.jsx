import ProviderInfo from "@/components/user/provider-details/ProviderInfo";
import CoverImage from "@/components/user/provider-details/CoverImage";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function ProviderDetailsPage({ params }) {
  const { id, locale } = await params;
  const cookieStore = await cookies()
  const res = await fetch(`${BASE_URL}/artists/${id}/profile?lang=${locale}`, {
    cache: "no-store",
  });
  if (!res.ok) {
    throw new Error("Failed to load provider profile");
  }
  const { data } = await res.json();

  // Fetch available hours for the artist
  const response = await fetch(`${BASE_URL}/profile/${id}/AvailableHours?lang=${locale}`, {
    headers: {
      Authorization: `Bearer ${cookieStore.get("auth_token")?.value}`
    },
    cache: "no-store",
  });

  let availableHours = null;
  if (response.ok) {
    const hoursData = await response.json();
    availableHours = hoursData?.data;
  }
  return (
    <div className="min-h-screen bg-background">
      <CoverImage coverUrl={data?.cover_photo_url} />
      <ProviderInfo data={data} availableHours={availableHours} />
    </div>
  );
}
