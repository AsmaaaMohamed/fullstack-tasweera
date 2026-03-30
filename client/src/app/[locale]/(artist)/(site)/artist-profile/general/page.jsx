import ProviderInfo from "@/components/user/provider-details/ProviderInfo";
import CoverImage from "@/components/user/provider-details/CoverImage";
import { cookies } from "next/headers";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function ArtistGeneralPage({ params }) {
    const { locale } = await params;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    const authUser = cookieStore.get("auth_user")?.value;

    if (!authToken || !authUser) {
        throw new Error("Authentication required to view artist profile");
    }

    const user = JSON.parse(authUser);
    const artistId = user.id;

    // Fetch the artist's profile using the ID from the cookie
    const res = await fetch(`${BASE_URL}/artists/${artistId}/profile?lang=${locale}`, {
        cache: "no-store",
    });

    if (!res.ok) {
        throw new Error("Failed to load artist profile");
    }

    const { data } = await res.json();

    return (
        <div className="">
            <CoverImage coverUrl={data?.cover_photo_url} isOwnProfile={true}/>
            <ProviderInfo data={data} isOwnProfile={true} />
        </div>
    );
}
