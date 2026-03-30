"use client";

import { Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

export default function Loading() {
  const locale = useLocale();

  return (
    <div className="flex min-h-[60vh] w-full items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          {locale === "ar" ? "جاري التحميل..." : "Loading..."}
        </p>
      </div>
    </div>
  );
}
