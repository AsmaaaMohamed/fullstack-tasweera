"use client";

import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import RegistrationFormFields from "./SignUpForm/RegistrationFormFields";
import { useArtistSignUpForm } from "@/hooks/useArtistSignUpForm";

export default function SignUpForm() {
  const t = useTranslations("Auth.Signup");

  const {
    formData,
    handleInputChange,
    countries,
    cities,
    selectedCountry,
    selectedCity,
    countriesLoading,
    citiesLoading,
    handleCountrySelection,
    handleCityChange,
    handleSubmit,
    formErrors,
    loading,
    error,
  } = useArtistSignUpForm();

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    await handleSubmit(e);
  };

  return (
    <div className="w-full max-w-md mx-auto">
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
        onCountryChange={handleCountrySelection}
        onCityChange={handleCityChange}
        formErrors={formErrors}
        onSubmit={handleStep1Submit}
        loading={loading}
      />

      <div className="text-center mt-6">
        <span className="text-gray-600 dark:text-gray-300!">{t("haveAccount")} </span>
        <Link
          href="/artist/signin"
          className="text-orange-500 hover:text-orange-600 font-medium dark:text-orange-500 dark:hover:text-orange-600"
        >
          {t("signin")}
        </Link>
      </div>
    </div>
  );
}
