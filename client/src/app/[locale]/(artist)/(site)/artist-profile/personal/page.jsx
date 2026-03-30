import { cookies } from "next/headers";
import ArtistProfileClient from "./ArtistProfileClient";
import { middleEastCountries } from "@/lib/middleEastCountries";

export default async function ArtistProfileGeneralPage() {
   const cookieStore = await cookies();
  function splitPhoneNumber(phone) {
    // Loop through countries to find a dial code match
    for (let country of middleEastCountries) {
      if (phone.startsWith(country.dial)) {
        return {
          country:country,
          countryCode: country.dial,
          localNumber: phone.slice(country.dial.length), // remove country code
          
        };
      }
    }
    return null; // no match found
  }
  const response = await fetch(process.env.NEXT_PUBLIC_API_BASE_URL + `/profile/Info`, {
    headers: {
      Authorization: `Bearer ${cookieStore.get("auth_token")?.value}`
    },
    cache: "no-store"
  });

  const data = await response.json();
  const phoneAndCode = splitPhoneNumber(data.data.phone);
  const initialUserData = {...data.data, ...phoneAndCode}
  return (
    <ArtistProfileClient initialUserData={initialUserData} />
  );
}
