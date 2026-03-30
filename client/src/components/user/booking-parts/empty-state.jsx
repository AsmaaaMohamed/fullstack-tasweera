import PrimaryButton from "@/components/shared/PrimaryButton";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useRouter } from "@/i18n/navigation";

export function EmptyState({ activeTab }) {
  const t = useTranslations("Bookings");
  const router = useRouter();
  return (
    <div className="flex flex-col items-center justify-center py-24" dir="rtl">
      {/* Calendar Icon with prohibition symbol */}
      <div className="relative mb-8">
        <Image
          src="/images/bookings/nobooking.png"
          alt="Empty State"
          width={157}
          height={157}
        />
      </div>

      {/* Main heading */}
      <h2 className="text-xl font-semibold text-black dark:text-white mb-3">
        {t("no-orders")}
      </h2>
      {activeTab === "all" && (
        <>
          {/* Subtitle */}
          <p className="text-descriptive dark:text-gray-400 text-center mb-4 max-w-md leading-relaxed">
            {t("back-description")}
          </p>

          {/* Call to action button */}
          <PrimaryButton
            className="h-[56px] rounded-[12px]"
            onClick={() => router.push("/home")}
          >
            {t("go-home")}
          </PrimaryButton>
        </>
      )}
    </div>
  );
}
