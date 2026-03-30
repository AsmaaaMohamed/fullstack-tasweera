"use client";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { usePathname, useRouter } from "@/i18n/navigation";
import { useState } from "react";

function FooterClient({ contactInfo }) {
  const t = useTranslations("Footer");
  const tHeader = useTranslations("Header");
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const isArtistRoute = pathname.startsWith("/artist");
  const [searchValue, setSearchValue] = useState("");

  const handleSearch = () => {
    if (searchValue.trim()) {
      router.push(
        `/all-artists?search=${encodeURIComponent(searchValue.trim())}`
      );
      setSearchValue("");
    } else {
      router.push("/all-artists");
    }
  };
  return (
    <>
      {!isHome && (
        <footer>
          <div className="flex flex-col text-white dark:border-t dark:border-gray-500">
            <div className="bg-main py-4 dark:bg-[#363636] border-b border-gray-500">
              <div
                className={`max-w-7xl mx-auto px-4 sm:px-6 flex flex-col items-center gap-5 ${
                  isArtistRoute
                    ? "justify-center"
                    : "md:flex-row justify-between"
                }`}
              >
                <div
                  className={`flex items-center ${
                    isArtistRoute ? "mx-auto" : ""
                  }`}
                >
                  <Image
                    src="/images/white-logo.png"
                    alt="Logo"
                    width={132}
                    height={63}
                    className="h-[63px] w-[132px]"
                  />
                </div>

                {!isArtistRoute && (
                  <div className="flex flex-col gap-2 w-full md:w-1/3 lg:w-1/3">
                    <p className="text-darker dark:text-gray-300 text-sm leading:[1.8em] text-start">
                      {t("what-looking")}
                    </p>
                    <div className="flex gap-4">
                      <div className="bg-[#FFFFFF] dark:bg-[#363636] rounded-[12px] px-4 relative border border-darker dark:border-gray-500 flex-1">
                        <input
                          type="text"
                          name="search"
                          value={searchValue}
                          onChange={(e) => setSearchValue(e.target.value)}
                          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                          placeholder={t("search")}
                          className="w-full py-3 px-6 text-gray-900 dark:text-white leading-[1.8em] placeholder-[#C5C5C5] dark:placeholder-gray-400 focus:outline-none focus:ring-0 text-sm"
                        />
                        <Search
                          size={20}
                          className="absolute top-1/2 -translate-y-1/2 h-5 w-5 text-darker dark:text-gray-300"
                        />
                      </div>
                      <button
                        onClick={handleSearch}
                        className="bg-darker dark:bg-[#1C1C1D] text-white px-4 py-3 rounded-lg hover:bg-gray-700 dark:hover:bg-[#000] transition-colors text-sm font-medium"
                      >
                        {t("search")}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
            <div className="bg-darker py-12 dark:bg-[#1C1C1D]">
              <div className="max-w-7xl mx-auto px-4 sm:px-6">
                {/* Main Content Grid */}
                <div className="flex justify-between h-auto flex-col gap-5 ps-8 lg:ps-0 lg:flex-row items-start lg:items-center">
                  {/* Right Columns - Navigation Links */}

                  <div className="flex flex-col gap-5">
                    <h4 className="text-sm font-bold border-b border-white w-fit">
                      {t("imortant")}
                    </h4>
                    <ul className="space-y-2 text-sm flex flex-col gap-2">
                      {isArtistRoute ? (
                        // Artist Links
                        <>
                          <li>
                            <a
                              href="/artist-home"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("home")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/artist-profile"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("profile")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/artist-bookings"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("bookings")}
                            </a>
                          </li>
                        </>
                      ) : (
                        // Customer Links
                        <>
                          <li>
                            <a
                              href="/"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("home")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/categories"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("categories")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/user-profile"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("profile")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/bookings"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {tHeader("bookings")}
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>
                  <div className="flex flex-col gap-5">
                    <h4 className="text-sm font-bold border-b border-white w-fit">
                      {t("customer-service")}
                    </h4>
                    <ul className="space-y-2 text-sm flex flex-col gap-2">
                      {isArtistRoute ? (
                        // Artist Links
                        <>
                          <li>
                            <a
                              href="/artist-profile/contact"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("contact")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/artist-profile/privacy"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("policy")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("terms")}
                            </a>
                          </li>
                        </>
                      ) : (
                        // Customer Links
                        <>
                          <li>
                            <a
                              href="/user-profile/complaints/add-complaint"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("submit-complaint")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/user-profile/contact"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("contact")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="/user-profile/privacy"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("policy")}
                            </a>
                          </li>
                          <li>
                            <a
                              href="#"
                              className="hover:text-amber-400 transition-colors"
                            >
                              {t("terms")}
                            </a>
                          </li>
                        </>
                      )}
                    </ul>
                  </div>

                  {/* Center - App Download */}
                  <div className="flex flex-col items-start justify-start gap-5 ">
                    <h4 className="text-sm font-bold border-b border-white w-fit">
                      {t("download-app")}
                    </h4>
                    <p className="text-sm text-white mb-1">
                      {t("app-available")}
                    </p>
                    <div className="flex flex-col sm:flex-row gap-3">
                      <a href="#" className="">
                        <Image
                          src="/images/googleplay.png"
                          alt="Google play"
                          width={150}
                          height={50}
                          className="max-h-9 w-auto"
                        />
                      </a>
                      <a
                        href="https://apps.apple.com/eg/app/taswera-%D8%AA%D8%B5%D9%88%D9%8A%D8%B1%D8%A9/id6748472078"
                        target="_blank"
                        className=""
                      >
                        <Image
                          src="/images/appstore.png"
                          alt="App Store"
                          width={150}
                          height={50}
                          className="max-h-9 w-auto"
                        />
                      </a>
                    </div>
                  </div>
                  {/* Left Column - Social Media */}
                  <div className="flex flex-col items-start md:items-center lg:items-start self-end">
                    <h3 className="text-sm leading:[1.8em] mb-6">
                      {t("contact-now")}
                    </h3>
                    <div className="flex gap-4">
                      <a
                        href={`mailto:${contactInfo.email}`}
                        target="_blank"
                        className="hover:text-amber-400 transition-colors"
                      >
                        <Image
                          src="/images/ic_outline-email.svg"
                          alt="Email"
                          width={24}
                          height={24}
                          className="h-auto w-auto"
                        />
                      </a>
                      <a
                        href={contactInfo.tiktok}
                        target="_blank"
                        className="hover:text-amber-400 transition-colors"
                      >
                        <Image
                          src="/images/ant-design_tik-tok-filled.svg"
                          alt="Tiktok"
                          width={24}
                          height={24}
                          className="h-auto w-auto"
                        />
                      </a>
                      <a
                        href={contactInfo.facebook}
                        target="_blank"
                        className="hover:text-amber-400 transition-colors"
                      >
                        <Image
                          src="/images/ri_facebook-fill.svg"
                          alt="Facebook"
                          width={24}
                          height={24}
                          className="h-auto w-auto"
                        />
                      </a>
                      <a
                        href={contactInfo.instagram}
                        target="_blank"
                        className="hover:text-amber-400 transition-colors"
                      >
                        <Image
                          src="/images/Instagram-vg.svg"
                          alt="Instagram"
                          width={24}
                          height={24}
                          className="h-auto w-auto"
                        />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </footer>
      )}
    </>
  );
}

export default FooterClient;
