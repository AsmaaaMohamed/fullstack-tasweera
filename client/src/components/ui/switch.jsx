"use client"

import * as React from "react"
import * as SwitchPrimitive from "@radix-ui/react-switch"

import { cn } from "@/lib/utils"
import Image from "next/image";

function Switch({
  className,
  ...props
}) {
  return (
    <SwitchPrimitive.Root
      data-slot="switch"
      className={cn(
        "peer data-[state=checked]:bg-gradient-to-r from-[#E6A525] from-[26.88%] to-[rgba(234,235,235,0.5)] to-[113.75%] data-[state=unchecked]:bg-gradient-to-r  dark:data-[state=unchecked]:bg-input/80 inline-flex  w-[70px] h-[27px] shrink-0 items-center rounded-full border border-main shadow-xs transition-all outline-none  disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}>
      <SwitchPrimitive.Thumb
        data-slot="switch-thumb"
        className={cn(
          "bg-background flex items-center justify-center border border-main dark:data-[state=unchecked]:bg-foreground dark:data-[state=checked]:bg-primary-foreground w-[29px] h-[29px] pointer-events-none rounded-full ring-0 transform transition-transform duration-300 ease-in-out ltr:data-[state=checked]:-translate-x-0.5 ltr:data-[state=unchecked]:translate-x-11 rtl:data-[state=unchecked]:-translate-x-11 rtl:data-[state=checked]:translate-x-0.5"
        )} >
          <Image src="/cloudy.png" alt="cloudy" width={19} height={19} className=""/>
        </SwitchPrimitive.Thumb>
    </SwitchPrimitive.Root>
    
  );
}

export { Switch }
