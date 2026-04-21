"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import RegistrationFormFields from "./SignUpForm/RegistrationFormFields";

export default function SignUpForm() {
  const t = useTranslations("Auth.Signup");
  const locale = useLocale();

  const {
    formData,
    handleInputChange,
    countries,
    cities,
    selectedCountry,
    selectedCity,
    countriesLoading,
    citiesLoading,
    handleCountryChange,
    handleCityChange,
    handleSubmit,
    formErrors,
    loading,
    error,
  } = useSignUpForm();

  return (
    <div className="w-full">
      <div className={`${locale === "en" ? "text-left" : "text-right"} mb-8`}>
        <div className={`${locale === "en" ? "justify-start" : "justify-end"} flex items-center gap-2 mb-2`}>
          <Image src="/logo.svg" alt="Logo" width={120} height={60} className="dark:hidden" />
          <Image
            src="/white-logo.svg"
            alt="Logo"
            width={130}
            height={57}
            className="w-[130px] h-auto hidden dark:block"
          />
        </div>
      </div>

      <h3 className="text-2xl font-bold text-center mb-4 dark:text-gray-300!">{t("title")}</h3>

      <p className="text-center text-gray-600 mb-8 dark:text-gray-300!">
        Join <span className="text-orange-500">Taswera</span> and start your journey with us.
      </p>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm font-semibold mb-1">{error}</p>
          {Object.keys(formErrors).length > 0 && (
            <ul className="text-xs list-disc list-inside mt-2">
              {Object.entries(formErrors)
                .filter(([field]) => field !== "_general")
                .map(([field, message]) => (
                  <li key={field}>{message}</li>
                ))}
            </ul>
          )}
        </div>
      )}

      {formErrors._general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm font-semibold">{formErrors._general}</p>
        </div>
      )}

      <RegistrationFormFields
        formData={formData}
        onInputChange={handleInputChange}
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        countriesLoading={countriesLoading}
        citiesLoading={citiesLoading}
        onCountryChange={handleCountryChange}
        onCityChange={handleCityChange}
        formErrors={formErrors}
        onSubmit={handleSubmit}
        loading={loading}
      />

      <div className="text-center mt-6">
        <span className="text-gray-600 dark:text-gray-300!">{t("haveAccount")} </span>
        <Link
          href="/signin"
          className="text-orange-500 hover:text-orange-600 font-medium dark:text-orange-500 dark:hover:text-orange-600"
        >
          {t("signin")}
        </Link>
      </div>
    </div>
  );
}
