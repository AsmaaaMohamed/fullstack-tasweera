"use client";

import { useLocale } from "next-intl";
import Image from "next/image";
import PrimaryButton from "@/components/shared/PrimaryButton";
import PrimaryInput from "@/components/shared/PrimaryInput";

export default function OtpVerificationForm({
    registrationPhone,
    otp,
    onOtpChange,
    onSubmit,
    onBack,
    formErrors,
    loading,
}) {
    const locale = useLocale();

    return (
        <div className="space-y-4">
            <div className="text-center mb-4">
                <h4 className="text-xl font-semibold mb-2 dark:text-gray-300!">
                    {locale === "ar" ? "تحقق من رقم الهاتف" : "Verify Your Phone"}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300!">
                    {locale === "ar"
                        ? `تم إرسال رمز التحقق إلى ${registrationPhone}`
                        : `Verification code sent to ${registrationPhone}`}
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <PrimaryInput
                    type="text"
                    name="otp"
                    placeholder={
                        locale === "ar" ? "أدخل رمز التحقق" : "Enter verification code"
                    }
                    value={otp}
                    onChange={onOtpChange}
                    icon={
                        <Image
                            src="/auth/icons/lock.svg"
                            alt="OTP"
                            width={24}
                            height={24}
                        />
                    }
                    required
                />
                {formErrors.otp && (
                    <p className="text-sm text-red-600 dark:text-red-500!">
                        {formErrors.otp}
                    </p>
                )}

                <PrimaryButton
                    type="submit"
                    className="text-md py-6"
                    fullWidth
                    disabled={loading}
                >
                    {loading
                        ? locale === "ar"
                            ? "جاري التحقق..."
                            : "Verifying..."
                        : locale === "ar"
                            ? "تحقق"
                            : "Verify"}
                </PrimaryButton>
            </form>

            <button
                type="button"
                onClick={onBack}
                className="text-center w-full text-sm text-orange-500 hover:text-orange-600 dark:text-orange-500 dark:hover:text-orange-600"
            >
                {locale === "ar" ? "تغيير رقم الهاتف" : "Change phone number"}
            </button>
        </div>
    );
}
