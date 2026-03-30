"use client";

import { useState, useRef, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Input } from "@/components/ui/input";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { updateArtistService } from "@/lib/artist-services";
import { toast } from "sonner";

export default function ServiceDetailsTab({ serviceData, onUpdateSuccess }) {
  const locale = useLocale();
  const t = useTranslations("MyServices");
  const isRTL = locale === "ar";
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    name: "",
    price: "",
    notes: "",
    image: null,
  });
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Initialize form data when serviceData changes
  useEffect(() => {
    if (serviceData) {
      setFormData({
        name: serviceData.name || "",
        price: serviceData.price?.toString() || "",
        notes: serviceData.Service_notes || "",
        image: null,
      });
      setPreviewUrl(serviceData.photo_url || null);
    }
  }, [serviceData]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type (images only)
    if (!file.type.startsWith("image/")) {
      toast.error(
        locale === "en" ? "Please select an image file" : "يرجى اختيار ملف صورة"
      );
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error(
        locale === "en"
          ? "File size should be less than 5MB"
          : "يجب أن يكون حجم الملف أقل من 5 ميجابايت"
      );
      return;
    }

    setFormData((prev) => ({ ...prev, image: file }));

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setFormData((prev) => ({ ...prev, image: null }));
    // Reset to original image if exists
    setPreviewUrl(serviceData?.photo_url || null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSave = async () => {
    if (!formData.name || !formData.price) {
      toast.error(
        locale === "en"
          ? "Please fill in all required fields"
          : "يرجى ملء جميع الحقول المطلوبة"
      );
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateArtistService(serviceData.id, {
        name: formData.name,
        price: formData.price,
        notes: formData.notes,
        photo: formData.image,
      });

      if (response?.status === "success") {
        toast.success(
          locale === "en"
            ? "Service updated successfully!"
            : "تم تحديث الخدمة بنجاح!"
        );
        if (onUpdateSuccess) {
          onUpdateSuccess();
        }
      } else {
        throw new Error(response?.message || "Failed to update service");
      }
    } catch (error) {
      console.error("Error updating service:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (locale === "en"
          ? "Failed to update service. Please try again."
          : "فشل تحديث الخدمة. يرجى المحاولة مرة أخرى.");
      toast.error(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6 py-4">
      {/* Two Column Grid */}
      <div
        className={cn(
          "grid grid-cols-1 md:grid-cols-2 gap-4",
          isRTL && "md:grid-cols-2"
        )}
        dir={isRTL ? "rtl" : "ltr"}
      >
        {/* Right Column (RTL) / Left Column (LTR): Service Name and Notes */}
        <div className="space-y-4">
          {/* Service Name */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("service-name")}
            </label>
            <Input
              type="text"
              placeholder={t("service-name-placeholder")}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="w-full rounded-lg bg-gray-100 dark:bg-[#363636]/30 border-gray-300 dark:border-gray-600"
              disabled={isSaving}
            />
          </div>

          {/* Service Notes */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("service-notes")}
            </label>
            <textarea
              placeholder={t("service-notes-placeholder")}
              value={formData.notes}
              onChange={(e) => handleInputChange("notes", e.target.value)}
              className="w-full h-32 rounded-lg bg-gray-100 dark:bg-[#363636]/30 border border-gray-300 dark:border-gray-600 px-3 py-2 text-sm resize-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:border-main"
              disabled={isSaving}
            />
          </div>
        </div>

        {/* Left Column (RTL) / Right Column (LTR): Service Price and Image */}
        <div className="space-y-4">
          {/* Service Price */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("service-price")}
            </label>
            <Input
              type="number"
              placeholder={t("service-price-placeholder")}
              value={formData.price}
              onChange={(e) => handleInputChange("price", e.target.value)}
              className="w-full rounded-lg bg-gray-100 dark:bg-[#363636]/30 border-gray-300 dark:border-gray-600"
              disabled={isSaving}
            />
          </div>

          {/* Service Image Upload */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">
              {t("add-service-image")}
            </label>
            <label
              htmlFor="service-image-edit"
              className={cn(
                "flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors",
                previewUrl
                  ? "border-main bg-main/5"
                  : "border-main bg-gray-50 dark:bg-[#363636]/20 hover:bg-gray-100 dark:hover:bg-[#363636]/30"
              )}
            >
              {previewUrl ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  <Image
                    src={previewUrl}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label="Remove image"
                    type="button"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">
                    {t("attach-file")}
                  </p>
                </div>
              )}
              <input
                id="service-image-edit"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={isSaving}
              />
            </label>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-center mt-6">
        <PrimaryButton
          onClick={handleSave}
          disabled={!formData.name || !formData.price || isSaving}
          className="w-full sm:w-2/3 h-12 text-lg rounded-lg"
        >
          {isSaving
            ? locale === "en"
              ? "Updating..."
              : "جاري التحديث..."
            : t("update")}
        </PrimaryButton>
      </div>
    </div>
  );
}
