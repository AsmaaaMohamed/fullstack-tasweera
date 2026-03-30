import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";

export function SignupHeader() {
  const locale = useLocale();
  const t = useTranslations("Auth.Signup");
  return (
    <div>
        {/* Logo */}
        <div className={`${locale === "en" ? "text-left" : "text-right"} mb-8`}>
          <div
            className={`absolute top-8 start-6  mb-2`}
          >
            <Image src="/logo.svg" alt="Logo" width={120} height={60} className="dark:hidden" />
            <Image
              src="/white-logo.svg"
              alt="Logo"
              width={130}
              height={57}
              className="w-[130px] h-auto hidden dark:block"
            />
          </div>
        </div>
  
        {/* Title */}
        <h3 className="text-2xl font-bold text-center mb-4 dark:text-gray-300!">
          {t("title")}
        </h3>
  
        {/* Welcome message */}
        <p className="text-center text-gray-600 mb-8 dark:text-gray-300!">
          {locale === "ar" ? "انضم إلى" : "Join"}{" "}
          <span className="text-orange-500">
            {locale === "ar" ? "تصويرة" : "Taswera"}
          </span>{" "}
          {locale === "ar" ? "وابدأ رحلتك" : "and start your journey"}
          {locale === "ar" ? "الإبداعية معنا." : "with us."}
        </p>
    </div>
  )
}