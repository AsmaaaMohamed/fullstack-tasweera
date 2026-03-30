import { getHomeDataAction } from "@/app/actions/getHomeDataAction";
import CategoriesSection from "@/components/user/home-parts/categories-section";
import HomeSlider from "@/components/user/home-parts/home-slider/HomeSlider";
import PhotographersSectionWrapper from "@/components/user/home-parts/photographers-section-wrapper";
import StoriesSection from "@/components/user/home-parts/stories-section";
import { cookies } from "next/headers";

export default async function UserHomePage({ params }) {
  const { lang } = params;
  const cookieStore = await cookies();
  const { banners } = await getHomeDataAction(lang);

  const authToken = cookieStore.get("auth_token")?.value;
  const isAuth = !!authToken;

  return (
    <main>
      <section className="bg-white dark:bg-[#363636]">
        <StoriesSection isAuth={isAuth} />
        <HomeSlider banners={banners} />
        <CategoriesSection />
        <PhotographersSectionWrapper lang={lang} />
      </section>
    </main>
  );
}
