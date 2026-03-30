"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLocale } from "next-intl";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "@/i18n/navigation";

const sidebarItems = [
  {
    href: "/user-profile/general",
    label: "معلوماتي الشخصية",
    labelEn: "My Personal Information",
    icon: "/user/profile/sidebar/person.svg",
  },
  {
    href: "/user-profile/email",
    label: "البريد",
    labelEn: "Email",
    icon: "/user/profile/sidebar/mail.svg",
  },
  {
    href: "/user-profile/chats",
    label: "المحادثات",
    labelEn: "Chats",
    icon: "/user/profile/sidebar/chat.svg",
  },
  {
    type: "header",
    label: "الدعم",
    labelEn: "Support",
  },
  {
    href: "/user-profile/complaints",
    label: "شكاوى واقتراحات",
    labelEn: "Complaints and Suggestions",
    icon: "/user/profile/sidebar/complains.svg",
  },
  {
    href: "/user-profile/about",
    label: "عن التطبيق",
    labelEn: "About the App",
    icon: "/user/profile/sidebar/about.svg",
  },
  {
    href: "/user-profile/privacy",
    label: "سياسة الخصوصية",
    labelEn: "Privacy Policy",
    icon: "/user/profile/sidebar/policy.svg",
  },
  {
    href: "/user-profile/contact",
    label: "تواصل معنا",
    labelEn: "Contact Us",
    icon: "/user/profile/sidebar/contact.svg",
  },
  {
    action: "deleteAccount",
    label: "حذف الحساب",
    labelEn: "Delete Account",
    icon: "/user/profile/sidebar/trash.svg",
    danger: true,
  },
  {
    action: "logout",
    label: "تسجيل الخروج",
    labelEn: "Logout",
    icon: "/user/profile/sidebar/door.svg",
  },
];

export default function UserProfileLayout({ children }) {
  const pathname = usePathname();
  const locale = useLocale();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    closeMobileMenu();
    router.push("/");
  };

  return (
    <div className="w-full bg-background dark:bg-[#363636]">
      <div className="max-w-7xl py-8 px-4 mx-auto sm:px-6">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Mobile menu button */}
          <button
            onClick={toggleMobileMenu}
            className="lg:hidden flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#363636] hover:bg-gray-200 dark:hover:bg-[#363636] transition-colors mb-4"
            aria-label="Toggle menu"
          >
            <svg
              className="w-6 h-6 text-gray-700 dark:text-gray-300"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMobileMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>

          {/* Mobile overlay */}
          <div
            className={`lg:hidden fixed inset-0 bg-black z-40 transition-opacity duration-300 ease-in-out ${
              isMobileMenuOpen
                ? "opacity-60 backdrop-blur-sm pointer-events-auto"
                : "opacity-0 pointer-events-none"
            }`}
            onClick={closeMobileMenu}
          />

          {/* Shared sidebar */}
          <aside
            className={`order-1 w-[320px] h-[650px] transition-transform duration-300 ease-in-out ${
              isMobileMenuOpen
                ? "fixed left-0 top-0 z-50 h-full translate-x-0 lg:relative lg:z-auto lg:translate-x-0 lg:h-[650px]"
                : "fixed left-0 top-0 z-50 h-full -translate-x-full lg:relative lg:translate-x-0 lg:z-auto lg:h-[650px]"
            }`}
          >
            <div className="rounded-xl lg:rounded-xl shadow-md bg-gray-100 dark:bg-[#323232] p-0 overflow-hidden pb-8 h-full lg:h-[650px]">
              <div className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm border-b dark:border-slate-600 flex items-center justify-between">
                <span>{locale === "ar" ? "عام" : "General"}</span>
                <button
                  onClick={closeMobileMenu}
                  className="lg:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
                  aria-label="Close menu"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <nav className="flex flex-col">
                {sidebarItems.map((item, index) => {
                  // Handle header items
                  if (item.type === "header") {
                    return (
                      <div
                        key={`header-${index}`}
                        className="px-4 py-3 text-gray-500 dark:text-gray-400 text-sm font-semibold border-t dark:border-gray-500 mt-2"
                      >
                        {locale === "ar" ? item.label : item.labelEn}
                      </div>
                    );
                  }

                  // Handle logout action
                  if (item.action === "logout") {
                    return (
                      <button
                        key="logout"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-4 text-sm font-semibold text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C1C1D] w-full text-left"
                      >
                        {item.icon ? (
                          <Image
                            src={item.icon}
                            alt=""
                            width={18}
                            height={18}
                            className={
                              "dark:brightness-0 dark:invert dark:opacity-90"
                            }
                          />
                        ) : null}
                        <span className="flex-1 text-start">
                          {locale === "ar" ? item.label : item.labelEn}
                        </span>
                      </button>
                    );
                  }

                  // Handle delete account action
                  if (item.action === "deleteAccount") {
                    return (
                      <button
                        key="deleteAccount"
                        onClick={handleLogout}
                        className="flex items-center gap-3 px-4 py-4 text-sm font-semibold text-red-600 hover:bg-gray-50 dark:hover:bg-[#1C1C1D] w-full text-left"
                      >
                        {item.icon ? (
                          <Image
                            src={item.icon}
                            alt=""
                            width={18}
                            height={18}
                          />
                        ) : null}
                        <span className="flex-1 text-start">
                          {locale === "ar" ? item.label : item.labelEn}
                        </span>
                      </button>
                    );
                  }

                  // Check if pathname matches the href (accounting for locale prefix)
                  const pathnameWithoutLocale =
                    pathname?.split("/").slice(2).join("/") || "";
                  const hrefWithoutLeadingSlash = item.href.replace(/^\//, "");
                  const active =
                    pathnameWithoutLocale === hrefWithoutLeadingSlash ||
                    pathnameWithoutLocale.startsWith(
                      hrefWithoutLeadingSlash + "/"
                    );
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex items-center gap-3 px-4 py-4 text-sm font-semibold ${
                        active
                          ? "bg-[#E6A525] text-white"
                          : item.danger
                          ? "text-red-600"
                          : "text-gray-400 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#1C1C1D]"
                      }`}
                    >
                      {item.icon ? (
                        <Image
                          src={item.icon}
                          alt=""
                          width={18}
                          height={18}
                          className={
                            active ? "brightness-0 invert opacity-90" : ""
                          }
                        />
                      ) : null}
                      <span className="flex-1">
                        {locale === "ar" ? item.label : item.labelEn}
                      </span>
                    </Link>
                  );
                })}
              </nav>
            </div>
          </aside>
          {/* Main content slot */}
          <main className="flex-1 order-2 min-w-0 shadow-[0_0_4px_0_#C5C5C5] dark:shadow-[#363636] dark:bg-[#323232] rounded-[24px] overflow-hidden">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
