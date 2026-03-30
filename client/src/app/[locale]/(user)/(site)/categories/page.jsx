import CategoriesSection from "@/components/user/home-parts/categories-section";
import  PhotographersSection  from "@/components/user/home-parts/photographers-section";
import PhotographersSectionWrapper from "@/components/user/home-parts/photographers-section-wrapper";

export default async function CategoriesPage({ params }) {
  const resolvedParams =  params;
  return (
    <main>
      <section className="">
        <CategoriesSection />
        <PhotographersSectionWrapper lang={resolvedParams.lang} />
      </section>
    </main>
  );
}
