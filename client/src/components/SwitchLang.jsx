"use client";

import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

import { usePathname } from "@/i18n/navigation";

import Link from "next/link";

function SwitchLang({ className, onClick, isHidden }) {
  const locale = useLocale();
  const pathname = usePathname();

  return (
    <Link
      href={`/${locale === "ar" ? "en" : "ar"}/${pathname
        .split("/")
        .slice(1)
        .join("/")}`}
      title={locale === "en" ? "Switch to Arabic" : "التغيير إلى الإنجليزية"}
      style={{ top: isHidden ? "-100px" : "0" }}
    >
      {locale === "ar" ? "En" : "Ar"}
    </Link>
  );
}

export default SwitchLang;
