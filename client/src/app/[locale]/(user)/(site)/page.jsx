"use client";
import { useRouter } from "@/i18n/navigation";
import { ActionButton } from "@/components/shared/ActionButton";
import { useTranslations } from "next-intl";
import Image from "next/image";

export default function HomePage() {
  const t = useTranslations("HomePage");
  const router = useRouter();
  return (
    <main>
      <section className="h-[calc(100vh-97px)] bg-white dark:bg-[#363636] flex overflow-hidden  lg:ps-20">
        {/* Overlay covering 2/3 of the section */}
        <div className="absolute inset-y-0 start-0 -top-20 w-full lg:w-2/3 bg-[linear-gradient(to_right,rgba(255,255,255,0.9),#ffffffE5),url('/images/home/front-view-male-photographer.png')] dark:bg-[linear-gradient(to_right,rgba(54,54,54,0.95),rgba(54,54,54,0.95)),url('/images/home/front-view-male-photographer.png')]  bg-cover object-bottom-left"></div>
        {/* Main content container */}
        <div className="flex-1 flex items-center justify-center px-4 py-8 lg:px-0 relative">
          <div className="w-full max-w-6xl flex items-center justify-between lg:pe-12">
            <div className="flex flex-col justify-center w-full lg:w-2/3 lg:me-auto bg-right]">
              <Image
                src="/icon.svg"
                alt="logo"
                width={27}
                height={27}
                className="ms-2 mb-0"
              />
              <div className="py-[10px] px-6">
                <h1 className="!text-2xl/9 dark:text-white lg:text-4xl font-bold text-gray-900 text-balance mb-4">
                  <span className="text-main block">Taswera</span>
                  {t("heroHeading")}
                </h1>
                <p className="text-base/9 text-[#9B9B9B] dark:text-gray-100 font-medium text-pretty">
                  {t("heroParagraph")}
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 justify-start px-6 py-[10px]">
                <ActionButton
                  variant="secondary"
                  onClick={() => router.push("/signin")}
                >
                  {t("clientCta")}
                </ActionButton>
                <ActionButton
                  variant="primary"
                  onClick={() => router.push("/artist/signin")}
                >
                  {t("providerCta")}
                </ActionButton>
              </div>
            </div>
            <div className="hidden lg:block absolute bottom-0 -end-36 z-10">
              <Image
                src="/images/home/hand-holding-photo-camera-Photoroom.png"
                alt="hand-holding-photo-camera-Photoroom"
                width={432}
                height={474}
                className=" object-contain"
                priority
              />
            </div>
          </div>
        </div>

        <div className="hidden lg:flex w-[14%] bg-main flex-col items-center justify-center relative">
          {/* Vertical "photography" text */}
          <div className="absolute inset-0 flex items-center justify-center z-11">
            <p
              className="text-[#F1F1F1] text-[96px] font-londrina tracking-[0.16em] whitespace-nowrap"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
              }}
            >
              photography
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
