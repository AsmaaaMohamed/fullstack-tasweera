import ArtistStoriesSection from "@/components/artist/home/stories-section";
import Welcome from "@/components/artist/home/welcome/Welcome";
import { cookies } from "next/headers";

export default async function ArtistHomePage() {
  const cookieStore = await cookies();

  const authToken = cookieStore.get("auth_token")?.value;
  const isAuth = !!authToken;

  return (
    <main>
      <section className="bg-white dark:bg-[#363636]">
        <ArtistStoriesSection isAuth={isAuth} />
      </section>
      <section className="bg-white dark:bg-[#363636] py-6">
        <Welcome />
      </section>
    </main>
  );
}
