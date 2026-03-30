"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import PrimaryButton from "@/components/shared/PrimaryButton";
import PrimaryInput from "@/components/shared/PrimaryInput";
import Image from "next/image";
import { useArtistSignInForm } from "@/hooks/useArtistSignInForm";
import { useSearchParams } from "next/navigation";
import { useRouter } from "@/i18n/navigation";

export default function SignInForm() {
  const [showPassword, setShowPassword] = useState(false);
  const t = useTranslations("Auth.Signin");
  const locale = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();

  const {
    formData,
    handleInputChange,
    handleSubmit,
    formErrors,
    loading,
    error,
  } = useArtistSignInForm({
    onSuccess: () => {
      // After successful login, redirect to returnUrl if present
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.replace(returnUrl);
      } else {
        router.replace("/artist-home");
      }
    },
  });

  return (
    <div className="w-full max-w-md mx-auto">
      {/* Logo */}
      <div className={`${locale === "en" ? "text-left" : "text-right"} mb-8`}>
        <div
          className={`${locale === "ar" ? "justify-start" : "justify-end"
            } flex items-center gap-2 mb-2 lg:-translate-y-12 lg:translate-x-12`}
        >
          <Image
            src="/logo.svg"
            alt="Logo"
            width={130}
            height={57}
            className="dark:hidden"
          />
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
      <h3 className="text-2xl font-bold text-center mb-4">{t("title")}</h3>

      {/* Welcome message */}
      <p className="text-center text-gray-600 dark:text-gray-300 mb-8">
        {t("welcome")}
      </p>

      {/* Success message for password reset */}
      {searchParams.get("reset") === "success" && (
        <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded">
          <p className="text-sm font-semibold">
            {locale === "ar"
              ? "تم إعادة تعيين كلمة المرور بنجاح! يمكنك الآن تسجيل الدخول."
              : "Password reset successfully! You can now sign in."}
          </p>
        </div>
      )}

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

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <PrimaryInput
          type="email"
          name="email"
          placeholder={t("email")}
          value={formData.email}
          onChange={handleInputChange}
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
          <p className="text-sm text-red-600">{formErrors.email}</p>
        )}

        <PrimaryInput
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder={t("password")}
          value={formData.password}
          onChange={handleInputChange}
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
          <p className="text-sm text-red-600">{formErrors.password}</p>
        )}

        {/* Remember me checkbox */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            name="remember"
            id="remember"
            checked={formData.remember}
            onChange={handleInputChange}
            className="w-4 h-4 text-orange-500 border-gray-300 rounded focus:ring-orange-500"
          />
          <label
            htmlFor="remember"
            className="text-sm text-gray-600 dark:text-gray-300 cursor-pointer"
          >
            {locale === "ar" ? "تذكرني" : "Remember me"}
          </label>
        </div>

        {/* Forgot password */}
        <div className="text-right">
          <Link
            href="/forgot-password"
            className="text-orange-500 hover:text-orange-600 text-sm"
          >
            {t("forgot")}
          </Link>
        </div>

        {/* Sign in button */}
        <PrimaryButton
          className="text-md py-6"
          type="submit"
          fullWidth
          disabled={loading}
        >
          {loading
            ? locale === "ar"
              ? "جاري تسجيل الدخول..."
              : "Signing in..."
            : t("submit")}
        </PrimaryButton>
      </form>

      {/* Sign up link */}
      <div className="text-center mt-6">
        <span className="text-gray-300">{t("noAccount")} </span>
        <Link
          href="/artist/signup"
          className="text-gray-800 hover:text-gray-300 dark:text-gray-100 font-medium"
        >
          {t("signup")}
        </Link>
      </div>
    </div>
  );
}
