import { cookies } from "next/headers";
import ComplaintsClient from "./ComplaintsClient"

export default async function ComplaintsPage() {
  const cookieStore = await cookies();
const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/artist/complaints`, {
    headers: {
      Authorization: `Bearer ${cookieStore.get("auth_token")?.value}`
    },
    cache: "no-store"
  });

  const data = await response.json();
  const complaints = data.data;
  return (
    <ComplaintsClient complaints={complaints} />
  );
}
