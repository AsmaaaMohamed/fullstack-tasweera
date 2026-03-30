"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import PrimaryButton from "@/components/shared/PrimaryButton";
import PrimaryInput from "@/components/shared/PrimaryInput";
import CountryCitySelectors from "./CountryCitySelectors";
import { Gem } from "lucide-react";

export default function RegistrationFormFields({
  formData,
  onInputChange,
  countries,
  cities,
  selectedCountry,
  selectedCity,
  countriesLoading,
  citiesLoading,
  onCountryChange,
  onCityChange,
  formErrors,
  onSubmit,
  loading,
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const t = useTranslations("Auth.Signup");
  const locale = useLocale();

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {/* Full name */}
      <div>
        <PrimaryInput
          type="text"
          name="name"
          placeholder={t("name")}
          value={formData.name}
          onChange={onInputChange}
          icon={
            <Image
              src="/auth/icons/user.svg"
              alt="User"
              width={24}
              height={24}
            />
          }
          required
        />
        {formErrors.name && (
          <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>
        )}
      </div>

      {/* Email */}
      <div>
        <PrimaryInput
          type="email"
          name="email"
          placeholder={t("email")}
          value={formData.email}
          onChange={onInputChange}
          icon={
            <Image
              src="/auth/icons/email.svg"
              alt="Email"
              width={24}
              height={24}
            />
          }
          required
        />
        {formErrors.email && (
          <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>
        )}
      </div>

      {/* Phone */}
      <div>
        <PrimaryInput
          type="tel"
          dir={locale === "ar" ? "rtl" : "ltr"}
          name="phone"
          placeholder={t("phone")}
          value={formData.phone}
          onChange={(e) => {
            onInputChange(e);
          }}
          onCountryChange={(country) => {
            // This is handled by the form's country selector
            // The phone input's country selector can be used for manual override
            // but we prefer to sync with the form's country selection
          }}
          isPhone
          icon={
            <Image
              src="/auth/icons/phone.svg"
              alt="Phone"
              width={24}
              height={24}
            />
          }
          required
        />
        {formErrors.phone && (
          <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>
        )}
      </div>

      {/* Country and City */}
      <CountryCitySelectors
        countries={countries}
        cities={cities}
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        countriesLoading={countriesLoading}
        citiesLoading={citiesLoading}
        onCountryChange={onCountryChange}
        onCityChange={onCityChange}
        formErrors={formErrors}
      />
      <div>
        <PrimaryInput
          type="number"
          name="exp"
          placeholder={t("experience")}
          value={formData.exp}
          onChange={onInputChange}
          min={0}
          onKeyDown={(e) => {
            if (e.key === "-" || e.key === "e") {
              e.preventDefault();
            }
          }}
          icon={<Gem className="size-6 text-descriptive" />}
          required
        />
        {formErrors.exp && (
          <p className="text-sm text-red-600 mt-1">{formErrors.exp}</p>
        )}
      </div>
      {/* Password */}
      <div>
        <PrimaryInput
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder={t("password")}
          value={formData.password}
          onChange={onInputChange}
          icon={
            <Image
              src="/auth/icons/lock.svg"
              alt="Lock"
              width={24}
              height={24}
            />
          }
          leftContent={
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              <Image
                src="/auth/icons/eye.svg"
                alt="Eye"
                width={24}
                height={24}
              />
            </button>
          }
          required
        />
        {formErrors.password && (
          <p className="text-sm text-red-600 mt-1">{formErrors.password}</p>
        )}
      </div>

      {/* Confirm Password */}
      <div>
        <PrimaryInput
          type={showConfirmPassword ? "text" : "password"}
          name="confirmPassword"
          placeholder={
            locale === "ar" ? "تأكيد كلمة المرور" : "Confirm Password"
          }
          value={formData.confirmPassword}
          onChange={onInputChange}
          icon={
            <Image
              src="/auth/icons/lock.svg"
              alt="Lock"
              width={24}
              height={24}
            />
          }
          leftContent={
            <button
              type="button"
              className="text-gray-400 hover:text-gray-600"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              <Image
                src="/auth/icons/eye.svg"
                alt="Eye"
                width={24}
                height={24}
              />
            </button>
          }
          required
        />
        {formErrors.confirmPassword && (
          <p className="text-sm text-red-600 mt-1">
            {formErrors.confirmPassword}
          </p>
        )}
      </div>

      {/* Terms and conditions */}
      <div className="text-sm text-gray-600 text-center dark:text-gray-300!">
        <span>
          {locale === "ar"
            ? "بإنشاء حساب، فإنك توافق على "
            : "By creating an account, you agree to the "}
        </span>
        <Link href="/terms" className="text-orange-500 hover:text-orange-600">
          {locale === "ar" ? "شروط الاستخدام" : "Terms of Service"}
        </Link>
        <span> {locale === "ar" ? "و" : "and"} </span>
        <Link href="/privacy" className="text-orange-500 hover:text-orange-600">
          {locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"}
        </Link>
      </div>

      {/* Sign up button */}
      <PrimaryButton
        type="submit"
        className="text-md py-6"
        fullWidth
        disabled={loading}
      >
        {loading
          ? locale === "ar"
            ? "جاري التسجيل..."
            : "Registering..."
          : t("submit")}
      </PrimaryButton>
    </form>
  );
}
