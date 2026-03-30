"use client";

import { useCategories } from "@/contexts/CategoriesContext";
import { useTranslations } from "next-intl";
import CategoryCard from "../category-card/CategoryCard";

export default function CategoriesSection() {
  const t = useTranslations("UserHome");
  const { categories, loading, error } = useCategories();

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 pt-10">
      <div className="mb-4">
        <h2 className="font-semibold text-black dark:text-white">{t("categories")}</h2>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 pb-10">
        {categories.map((cat) => (
          <CategoryCard
            key={cat.id}
            title={cat.name}
            image={cat.image_url}
            href={`/categories/${cat.id}`}
          />
        ))}
      </div>
    </section>
  );
}
