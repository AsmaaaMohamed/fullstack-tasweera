import { cookies } from "next/headers";
import { Step5WorkSchedule } from "@/components/artist/auth/SignUpForm/Step5WorkSchedule";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function WorkingHoursPage({ params }) {
    const { locale } = await params;
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    const authUser = cookieStore.get("auth_user")?.value;

    if (!authToken || !authUser) {
        throw new Error("Authentication required to view artist profile");
    }

    const user = JSON.parse(authUser);
    const artistId = user.id;

    // Fetch available hours for the artist
    const response = await fetch(`${BASE_URL}/profile/${artistId}/AvailableHours?lang=${locale}`, {
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        cache: "no-store",
    });

    let availableHours = null;
    if (response.ok) {
        const hoursData = await response.json();
        availableHours = hoursData?.data;
    }

    return (
        <div className="">
            <Step5WorkSchedule data={availableHours} isProfileEdit={true} />
        </div>
    );
}
