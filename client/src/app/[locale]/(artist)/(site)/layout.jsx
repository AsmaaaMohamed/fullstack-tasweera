import ArtistHeader from "@/components/shared/header/ArtistHeader";
import Footer from "@/components/shared/footer/Footer";
import { StoriesProvider } from "@/contexts/StoriesContext";
import { cookies } from "next/headers";

export default async function ArtistLayout({ children }) {
    const cookieStore = await cookies();
    const authToken = cookieStore.get("auth_token")?.value;
    const isAuth = !!authToken;

    return (
        <StoriesProvider initialIsAuth={isAuth} useArtistEndpoint={true}>
            <ArtistHeader />
            <main>{children}</main>
            <Footer />
        </StoriesProvider>
    );
}
