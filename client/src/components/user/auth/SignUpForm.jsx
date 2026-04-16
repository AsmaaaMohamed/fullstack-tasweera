"use client";

import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { useSignUpForm } from "@/hooks/useSignUpForm";
import OtpVerificationForm from "./SignUpForm/OtpVerificationForm";
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
    showOtpInput,
    otp,
    registrationPhone,
    handleOtpChange,
    handleOtpSubmit,
    handleBackToForm,
    handleSubmit,
    formErrors,
    loading,
    error,
  } = useSignUpForm();
console.log("SignUpForm render - formData:", countries);
  return (
    <div className="w-full">
      {/* Logo */}
      <div className={`${locale === "en" ? "text-left" : "text-right"} mb-8`}>
        <div
          className={`${
            locale === "en" ? "justify-start" : "justify-end"
          } flex items-center gap-2 mb-2`}
        >
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

      {/* Title */}
      <h3 className="text-2xl font-bold text-center mb-4 dark:text-gray-300!">
        {t("title")}
      </h3>

      {/* Welcome message */}
      <p className="text-center text-gray-600 mb-8 dark:text-gray-300!">
        {locale === "ar" ? "انضم إلى" : "Join"}{" "}
        <span className="text-orange-500">
          {locale === "ar" ? "تصويرة" : "Taswera"}
        </span>{" "}
        {locale === "ar" ? "وابدأ رحلتك" : "and start your journey"}
        {locale === "ar" ? "الإبداعية معنا." : "with us."}
      </p>

      {/* Error message */}
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

      {/* Show general error if exists */}
      {formErrors._general && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          <p className="text-sm font-semibold">{formErrors._general}</p>
        </div>
      )}

      {/* OTP Verification Form or Registration Form */}
      {showOtpInput ? (
        <OtpVerificationForm
          registrationPhone={registrationPhone}
          otp={otp}
          onOtpChange={handleOtpChange}
          onSubmit={handleOtpSubmit}
          onBack={handleBackToForm}
          formErrors={formErrors}
          loading={loading}
        />
      ) : (
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
      )}

      {/* Sign in link */}
      <div className="text-center mt-6">
        <span className="text-gray-600 dark:text-gray-300!">
          {t("haveAccount")}{" "}
        </span>
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
