"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../ui/button";
import Image from "next/image";
import { useLocale } from "next-intl";
import { middleEastCountries } from "@/lib/middleEastCountries";

const countries = middleEastCountries;

export default function PrimaryInput({
  className,
  icon, // right-side icon (RTL)
  leftContent, // left-side content (e.g., eye button)
  isPhone = false,
  onCountryChange,
  countryCode = "+966",
  iconContainerClasses,
  ...props
}) {
  const locale = useLocale();
  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    onCountryChange?.(country);
  };
  // Find the selected country from the country code
  const findCountryByDialCode = (dialCode) => {
    if (!dialCode) return countryCode; // Return first country if no code provided

    // Find country by dial code
    const country = middleEastCountries.find(
      (country) =>
        country.dial === dialCode ||
        (dialCode.startsWith("+")
          ? country.dial === dialCode
          : `+${dialCode}` === country.dial)
    );
    return country || middleEastCountries[1]; // Fallback to first country if not found
  };
  // State to track the selected country
  const [selectedCountry, setSelectedCountry] = useState(() =>
    findCountryByDialCode(countryCode)
  ); // Default to Saudi Arabia
  // Update selected country when countryCode prop changes
  useEffect(() => {
    const country = findCountryByDialCode(countryCode);
    if (country) {
      setSelectedCountry(country);
    }
  }, [countryCode]);
  return (
    <div className="relative">
      {/* Right icon */}
      {icon ? (
        <div
          className={`absolute inset-0 flex items-center pointer-events-none text-gray-400 ${iconContainerClasses}`}
        >
          {icon}
        </div>
      ) : null}

      {/* Left content or country code dropdown */}
      <div className="absolute inset-y-0 end-1 pl-3 flex items-center">
        {isPhone ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-auto px-2 py-1 text-sm font-medium text-foreground hover:bg-muted gap-1"
              >
                <span className="text-foreground">{selectedCountry.dial}</span>
                <Image
                  src={selectedCountry.flag || "/placeholder.svg"}
                  alt={selectedCountry.code}
                  width={24}
                  height={16}
                  className="rounded-sm object-cover"
                />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-64 overflow-hidden"
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <DropdownMenuLabel>Select Country</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-80 overflow-y-auto">
                {countries.map((country) => (
                  <DropdownMenuItem
                    key={country.code}
                    onClick={() => handleCountrySelect(country)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Image
                      src={country.flag || "/placeholder.svg"}
                      alt={country.code}
                      width={24}
                      height={16}
                      className="rounded-sm object-cover"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium">{country.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {country.dial}
                      </div>
                    </div>
                  </DropdownMenuItem>
                ))}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          leftContent || null
        )}
      </div>

      <Input
        data-slot="primary-input"
        className={cn(
          // underline-only style
          "border-0 border-b border-gray-300 dark:border-gray-500 rounded-none focus-visible:ring-0 focus-visible:border-[#E6A525]",
          // dark mode support
          "dark:bg-[#363636]! dark:text-white! dark:placeholder:text-gray-100!",
          // paddings to respect adornments
          icon ? "ps-7" : "ps-3",
          isPhone ? "pe-7" : leftContent ? "pe-7" : "pe-4",
          "py-3 h-auto",
          className
        )}
        {...props}
      />
    </div>
  );
}
