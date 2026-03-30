"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function ActionButton({
  variant = "primary",
  children,
  onClick,
  className,
}) {
  return (
    <Button
      onClick={onClick}
      className={cn(
        "px-5 py-[10px] rounded-[12px] font-medium transition-all text-base/9 flex box-content",
        variant === "primary"
          ? "bg-main hover:main/90 text-white"
          : "bg-black hover:bg-gray-900 text-white dark:bg-[#363636] dark:hover:bg-[#363636]",
        className
      )}
    >
      {children}
    </Button>
  );
}
