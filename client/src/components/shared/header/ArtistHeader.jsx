"use client";

import { useState, useEffect } from "react";
import { Link, usePathname } from "@/i18n/navigation";
import { Menu, X, Search } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import LanguageSwitcher from "@/components/shared/header/LanguageSwitcher";
import { Switch } from "@/components/ui/switch";
import { useSearch } from "@/hooks/useSearch";
import { useRouter } from "@/i18n/navigation";
import SearchResults from "@/components/shared/SearchResults";
import NotBody from "./NotBody";

import { useTheme } from "next-themes";

export default function ArtistHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();
  const locale = useLocale();
  const t = useTranslations("Header");

  useEffect(() => {
    setMounted(true);
  }, []);

  const router = useRouter();
  const {
    searchQuery,
    results: searchResults,
    isSearching,
    showResults,
    handleSearchChange,
    handleInputFocus,
    handleInputBlur,
    setShowResults,
  } = useSearch();

  const handleArtistSelect = (artist) => {
    setShowResults(false);
    router.push(`/provider-details/${artist.id}`);
  };

  // Artist-specific navigation items
  const navItems = [
    { key: "dashboard", href: "/artist-home" },
    { key: "myServices", href: "/artist-services" },
    { key: "bookings", href: "/artist-bookings" },
    { key: "profile", href: "/artist-profile" },
  ];

  const isRtl = locale === "ar";

  return (
    <header className="bg-white dark:bg-[#363636] border-b border-gray-200 dark:border-slate-600 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex justify-between items-center h-24 gap-9">
          {/* Left Side - Logo */}
          <Link
            href="/artist-home"
            className="flex-shrink-0 flex items-center gap-2"
          >
            <Image
              src="/logo.png"
              alt="Logo"
              width={130}
              height={57}
              className="w-[130px] h-auto block dark:hidden"
            />
            <Image
              src="/white-logo.svg"
              alt="Logo"
              width={130}
              height={57}
              className="w-[130px] h-auto hidden dark:block"
            />
          </Link>

          {/* Center - Navigation & Search */}
          <div className="hidden lg:flex items-center gap-8 flex-1">
            {/* Navigation Links */}
            <nav className="flex items-center gap-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`leading-9 p-[10px] font-medium transition-colors whitespace-nowrap ${
                    pathname === item.href ||
                    pathname.startsWith(item.href + "/")
                      ? "text-main border-b-2 border-main pb-1"
                      : "text-black dark:text-[#C5C5C5]  hover:text-main"
                  }`}
                >
                  {t(item.key)}
                </Link>
              ))}
            </nav>
          </div>

          {/* Right Side - Controls */}
          <div className="flex items-center gap-2 lg:gap-9">
            {/* Notification (hidden on small screens) */}
            <div className="relative hidden lg:block">
              <button
                onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                className="relative inline-flex items-center gap-2 p-[7px] rounded-full bg-[#E6A52580] hover:bg-[#E6A525] transition-colors"
                aria-label={t("notifications")}
              >
                <Image
                  src="/notification.svg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="w-6 h-6"
                />
                {/* Unread Badge */}
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                    {unreadNotificationCount > 9
                      ? "9+"
                      : unreadNotificationCount}
                  </span>
                )}
              </button>
              <NotBody
                isOpen={isNotificationOpen}
                onClose={() => setIsNotificationOpen(false)}
                onUnreadCountChange={setUnreadNotificationCount}
              />
            </div>
            {/* Dark - Light Mode */}
            <div className="flex items-center justify-center">
              {mounted && (
                <Switch
                  checked={theme === "dark"}
                  onCheckedChange={(checked) =>
                    setTheme(checked ? "dark" : "light")
                  }
                  aria-label="Toggle theme"
                />
              )}
            </div>
            {/* Language Selector (hidden on small screens) */}
            <div className="relative hidden lg:block">
              <LanguageSwitcher />
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? (
                <X size={24} className="text-gray-700 dark:text-gray-300" />
              ) : (
                <Menu size={24} className="text-gray-700 dark:text-gray-300" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation - Off-canvas sidebar */}
        {/* Backdrop */}
        <div
          className={`lg:hidden fixed inset-0 bg-black/40 transition-opacity ${
            isMenuOpen
              ? "opacity-100 pointer-events-auto"
              : "opacity-0 pointer-events-none"
          }`}
          onClick={() => setIsMenuOpen(false)}
        />
        {/* Panel */}
        <aside
          className={`lg:hidden fixed top-0 bottom-0 ${
            isRtl ? "right-0" : "left-0"
          } w-80 max-w-[85vw] bg-white dark:bg-[#363636] shadow-xl z-[60] transform transition-transform duration-300 ease-in-out ${
            isMenuOpen
              ? "translate-x-0"
              : isRtl
              ? "translate-x-full"
              : "-translate-x-full"
          }`}
          aria-hidden={!isMenuOpen}
        >
          <div className="h-24 flex items-center justify-between gap-3 px-4 border-b border-gray-200 dark:border-slate-600">
            <button
              onClick={() => setIsMenuOpen(false)}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
              aria-label="Close menu"
            >
              <X size={24} className="text-gray-700 dark:text-gray-300" />
            </button>
            <div className="flex items-center gap-3">
              <div className="relative">
                <button
                  onClick={() => setIsNotificationOpen(!isNotificationOpen)}
                  className="relative inline-flex items-center gap-2 p-[7px] rounded-full bg-[#E6A52580] hover:bg-[#E6A525] transition-colors"
                  aria-label={t("notifications")}
                >
                  <Image
                    src="/notification.svg"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="w-6 h-6"
                  />
                  {/* Unread Badge */}
                  {unreadNotificationCount > 0 && (
                    <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {unreadNotificationCount > 9
                        ? "9+"
                        : unreadNotificationCount}
                    </span>
                  )}
                </button>
                <NotBody
                  isOpen={isNotificationOpen}
                  onClose={() => setIsNotificationOpen(false)}
                  onUnreadCountChange={setUnreadNotificationCount}
                />
              </div>
              <LanguageSwitcher onSelect={() => setIsMenuOpen(false)} />
            </div>
          </div>
          <nav className="p-4 space-y-3">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-lg transition-colors ${
                  pathname === item.href
                    ? "bg-amber-500 text-white"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-slate-800"
                }`}
                onClick={() => setIsMenuOpen(false)}
              >
                {t(item.key)}
              </Link>
            ))}
          </nav>
        </aside>
      </div>
    </header>
  );
}
