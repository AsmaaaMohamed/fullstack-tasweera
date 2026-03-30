import { cookies } from "next/headers";
import { Step5WorkSchedule } from "@/components/artist/auth/SignUpForm/Step5WorkSchedule";
import { Step7BankInfo } from "@/components/artist/auth/SignUpForm/Step7BankInfo";

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export default async function BankInfoPage({ params }) {
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
    const response = await fetch(`${BASE_URL}/get-payment-info`, {
        headers: {
            Authorization: `Bearer ${authToken}`
        },
        cache: "no-store",
    });

    let bankInfo = null;
    if (response.ok) {
        const bankData = await response.json();
        bankInfo = bankData?.data;
    }

    return (
        <div className="">
            <Step7BankInfo data={bankInfo} isProfileEdit={true}/>
        </div>
    );
}
