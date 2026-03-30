"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function PrimaryButton({
  className,
  children,
  fullWidth,
  ...props
}) {
  return (
    <Button
      className={cn(
        "bg-[#E6A525] text-white hover:bg-[#E6A525]/50 hover:text-white font-medium rounded-lg",
        fullWidth ? "w-full" : undefined,
        // default comfortable vertical padding; caller can override with className
        "py-3",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  );
}
