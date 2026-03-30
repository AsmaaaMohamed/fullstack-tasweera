"use client";

import { useState, useRef } from "react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";
import PrimaryButton from "@/components/shared/PrimaryButton";
import Image from "next/image";
import PrimaryInput from "@/components/shared/PrimaryInput";
import api from "@/lib/api";
import { toast } from "sonner";

export function Step7BankInfo({
  data,
  onUpdate = () => {},
  isProfileEdit = false,
}) {
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const fileInputRef = useRef(null);
  const router = useRouter();
  const locale = useLocale();

  // Local state for form fields
  const [formData, setFormData] = useState({
    full_name: data?.full_name || "",
    bank_account_number: data?.bank_account_number || "",
    bank_name: data?.bank_name || "",
    license_document: data?.license_document || null,
  });

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (onUpdate) {
      onUpdate({ [field]: value });
    }
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setFormData((prev) => ({ ...prev, license_document: file }));
      if (onUpdate) {
        onUpdate({ license_document: file });
      }
      if (errors.license_document) {
        setErrors((prev) => ({ ...prev, license_document: "" }));
      }
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.full_name?.trim()) newErrors.full_name = "الاسم الكامل مطلوب";
    if (!formData.bank_account_number?.trim())
      newErrors.bank_account_number = "رقم الايبان مطلوب";
    if (!formData.bank_name?.trim()) newErrors.bank_name = "اسم البنك مطلوب";
    // File is optional in profile edit mode if already exists
    if (!isProfileEdit && !formData.license_document)
      newErrors.license_document = "يجب ارفاق الملف";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Create FormData for multipart upload
      const apiFormData = new FormData();
      apiFormData.append("full_name", formData.full_name || "");
      apiFormData.append(
        "bank_account_number",
        formData.bank_account_number || ""
      );
      apiFormData.append("bank_name", formData.bank_name || "");

      // Get file from input ref to ensure it's a valid File object
      if (fileInputRef.current?.files?.[0]) {
        const file = fileInputRef.current.files[0];
        apiFormData.append("license_document", file, file.name);
      }

      // Submit to API using POST method
      const response = await api.post(
        `/update-payment-info?lang=${locale}`,
        apiFormData,
        {
          headers: {
            "Content-Type": undefined, // Let axios set multipart/form-data with boundary
          },
        }
      );

      // Check if successful
      if (response.data.status === "success") {
        // Update parent component only if callback exists
        if (onUpdate) {
          onUpdate(formData);
        }

        // Show appropriate success message
        if (isProfileEdit) {
          toast.success("تم تحديث المعلومات البنكية بنجاح");
        } else {
          toast.success("تم إكمال جميع خطوات التسجيل بنجاح");
          // Redirect to artist home only in signup mode
          router.push(`/${locale}/artist-home`);
        }
      } else {
        setSubmitError("فشل في حفظ معلومات الدفع. يرجى المحاولة مرة أخرى.");
      }
    } catch (error) {
      console.error("Error submitting payment info:", error);
      setSubmitError(
        error.response?.data?.message ||
          "حدث خطأ أثناء حفظ معلومات الدفع. يرجى المحاولة مرة أخرى."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8 max-w-md mx-auto my-10">
      <h2 className="text-center text-xl font-bold">
        {locale === "ar" ? "المعلومات البنكية" : "Bank Information"}{" "}
      </h2>

      <div className="space-y-6">
        {/* Name */}
        <div className="space-y-2">
          <PrimaryInput
            type="text"
            name="name"
            placeholder="Name"
            value={formData.full_name}
            onChange={(e) => handleChange("full_name", e.target.value)}
            icon={
              <Image
                src="/auth/icons/user.svg"
                alt="User"
                width={18}
                height={18}
              />
            }
            required
          />
          {errors.full_name && (
            <p className="text-xs text-red-500">{errors.full_name}</p>
          )}
        </div>

        {/* IBAN */}
        <div className="space-y-2">
          <PrimaryInput
            type="text"
            name="bank_account_number"
            placeholder="Ipan number"
            value={formData.bank_account_number}
            onChange={(e) =>
              handleChange("bank_account_number", e.target.value)
            }
            icon={
              <Image
                src="/auth/icons/mdi_hashtag.svg"
                alt="User"
                width={18}
                height={18}
              />
            }
            required
          />
          {errors.bank_account_number && (
            <p className="text-xs text-red-500">{errors.bank_account_number}</p>
          )}
        </div>

        {/* Bank Name */}
        <div className="space-y-2">
          <PrimaryInput
            type="text"
            name="bank_name"
            placeholder="Bank name"
            value={formData.bank_name}
            onChange={(e) => handleChange("bank_name", e.target.value)}
            icon={
              <Image
                src="/auth/icons/mdi_bank.svg"
                alt="User"
                width={18}
                height={18}
              />
            }
            required
          />
          {errors.bank_name && (
            <p className="text-xs text-red-500">{errors.bank_name}</p>
          )}
        </div>

        {/* Document Upload */}
        <div className="space-y-2">
          <label className=" text-descriptive dark:text-gray-300 text-right block">
            نفاذ
          </label>
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-main bg-[#F5F5F5] dark:bg-[#53535365] rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-100 transition-colors"
          >
            <div className="rounded-full p-2 mb-3">
              <Image
                src="/auth/icons/ep_upload-filled.svg"
                alt="Upload"
                width={32}
                height={32}
              />
            </div>
            <p className="text-descriptive dark:text-gray-300 text-sm">
              {locale === "ar" ? "قم بارفاق الملف" : "Upload File"}
            </p>
            {formData.license_document && (
              <p className="mt-2 text-xs font-medium text-main">
                {formData.license_document.name || formData.license_document}
              </p>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            className="hidden"
            onChange={handleFileChange}
            accept=".pdf,.jpg,.png"
          />
          {errors.license_document && (
            <p className="text-xs text-red-500">{errors.license_document}</p>
          )}
          <p className="text-xs text-main text-center">
            {locale === "ar"
              ? "لن يتم قبول طلبك الا بعد ارفاق البيانات المطلوبة"
              : "You will not be accepted until you attach the required data"}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {submitError && (
          <div className="text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {submitError}
          </div>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          className="w-full py-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting
            ? "جاري الحفظ..."
            : isProfileEdit
            ? "حفظ"
            : "حفظ و متابعة"}
        </PrimaryButton>
      </div>
    </div>
  );
}
