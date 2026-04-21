"use client";

import { useTranslations, useLocale } from "next-intl";
import Image from "next/image";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function CountryCitySelectors({
  countries,
  cities,
  selectedCountry,
  selectedCity,
  countriesLoading,
  citiesLoading,
  onCountryChange,
  onCityChange,
  formErrors,
}) {
  const t = useTranslations("Auth.Signup");
  const locale = useLocale();
// console.log("CountryCitySelectors render - countries:", countries);
  return (
    <>
      {/* Country */}
      <div>
        <div className="relative">
          <Select
            value={selectedCountry?.name || ""}
            onValueChange={onCountryChange}
            disabled={countriesLoading || countries.length === 0}
          >
            <SelectTrigger
              className={`border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-[#E6A525] bg-transparent pr-4 pl-4 py-3 w-full justify-between`}
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <SelectValue
                placeholder={
                  countriesLoading
                    ? locale === "ar"
                      ? "جاري التحميل..."
                      : "Loading..."
                    : countries.length === 0
                    ? locale === "ar"
                      ? "لا توجد دول متاحة"
                      : "No countries available"
                    : t("country")
                }
              />
            </SelectTrigger>
            <SelectContent
              align="end"
              className={locale === "ar" ? "text-right" : undefined}
            >
              {countries.map((country) => (
                <SelectItem
                  key={country.id}
                  value={country.name}
                  className={locale === "ar" ? "justify-end" : undefined}
                >
                  <div
                    className={`w-full ${
                      locale === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {country.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formErrors.country && (
          <p className="text-sm text-red-600 mt-1">{formErrors.country}</p>
        )}
      </div>

      {/* City */}
      <div>
        <div className="relative">
          <div className="absolute inset-0  pe-3 flex items-center pointer-events-none text-gray-400">
            <Image
              src="/auth/icons/state.svg"
              alt="Location"
              width={24}
              height={24}
            />
          </div>
          <Select
            value={selectedCity}
            onValueChange={onCityChange}
            disabled={
              !selectedCountry || citiesLoading || cities.length === 0
            }
          >
            <SelectTrigger
              className={`border-0 border-b border-gray-300 rounded-none focus-visible:ring-0 focus-visible:border-[#E6A525] bg-transparent ps-7 pe-4 py-3 w-full justify-between`}
              dir={locale === "ar" ? "rtl" : "ltr"}
            >
              <SelectValue
                placeholder={
                  !selectedCountry
                    ? locale === "ar"
                      ? "اختر الدولة أولاً"
                      : "Select country first"
                    : citiesLoading
                    ? locale === "ar"
                      ? "جاري التحميل..."
                      : "Loading..."
                    : cities.length === 0
                    ? locale === "ar"
                      ? "لا توجد مدن"
                      : "No cities available"
                    : t("city")
                }
              />
            </SelectTrigger>
            <SelectContent
              align="end"
              className={locale === "ar" ? "text-right" : undefined}
            >
              {cities.map((city) => (
                <SelectItem
                  key={city.id}
                  value={city.name}
                  className={locale === "ar" ? "justify-end" : undefined}
                >
                  <div
                    className={`w-full ${
                      locale === "ar" ? "text-right" : "text-left"
                    }`}
                  >
                    {city.name}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {formErrors.city && (
          <p className="text-sm text-red-600 mt-1">{formErrors.city}</p>
        )}
      </div>
    </>
  );
}

