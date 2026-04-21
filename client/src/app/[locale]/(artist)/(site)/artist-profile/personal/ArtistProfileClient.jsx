"use client";
import { useLocale } from "next-intl";
import Image from "next/image";
import PrimaryInput from "@/components/shared/PrimaryInput";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { useRef, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";

export default function ArtistProfileClient({ initialUserData }) {
  const locale = useLocale();
  const fileInputRef = useRef(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userData, setUserData] = useState(initialUserData);
  const [previewUrl, setPreviewUrl] = useState(
    initialUserData.profile_picture || "/images/photographers/photographer.jpg"
  );
  const [country, setCountry] = useState(initialUserData.country);
  const [phoneNumber, setPhoneNumber] = useState(initialUserData.localNumber);

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      console.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      console.error("Image size should be less than 2MB");
      return;
    }
    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload the file
  };
  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };
  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const newPhoneNumber = `${country.dial}${phoneNumber}`;

      // Prepare form data
      formData.append("name", userData.name);
      formData.append("email", userData.email);
      formData.append("phone", newPhoneNumber);
      
      // Handle profile picture
      const fileInput = fileInputRef.current;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select a valid image file (JPEG, PNG, etc.)");
        }
        formData.append("profile_picture", file, file.name);
      }

      const response = await api.post("profile/update-info", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response.data.success) {
        toast.success(response.data.message || "Profile updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setIsSubmitting(false);
    }
  };
  return (
    <div className="w-full bg-background dark:bg-transparent">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col gap-6">
          {/* Main form */}
          <div className="flex-1">
            {/* Avatar */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-24 h-24">
                <Image
                  src={previewUrl || "/images/photographers/photographer.jpg"}
                  alt="avatar"
                  className="object-cover rounded-full max-h-full max-w-full"
                  width={500}
                  height={500}
                />
                {/* Hidden file input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  className="hidden"
                  disabled={isUploading}
                />
                {/* Upload overlay icon */}
                <button
                  type="button"
                  onClick={triggerFileInput}
                  disabled={isUploading}
                  aria-label="Upload new avatar"
                  className="absolute -bottom-1 left-0 w-7 h-7 rounded-full bg-[#fff] text-white flex items-center justify-center shadow-md border border-white"
                >
                  {isUploading ? (
                    <div className="w-4 h-4 border-2 border-t-primary border-gray-200 rounded-full animate-spin" />
                  ) : (
                    <Image
                      src="/user/profile/sidebar/camera.svg"
                      alt="upload"
                      width={14}
                      height={14}
                    />
                  )}
                </button>
              </div>
              <span className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                {isUploading ? "Uploading..." : " "}
              </span>
            </div>

            {/* General form section */}
            <div className="mx-auto w-full max-w-xl space-y-4">
              <div>
                <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                  {locale === "ar" ? "الاسم بالكامل" : "Full Name"}
                </label>
                <PrimaryInput
                  value={userData.name}
                  name="name"
                  onChange={handleInputChange}
                  icon={
                    <Image
                      src="/auth/icons/user.svg"
                      alt="user"
                      width={20}
                      height={20}
                    />
                  }
                  iconContainerClasses="start-2"
                  className="!border !border-gray-200 dark:!border-gray-500 !rounded-xl !bg-gray-100 dark:!bg-[#363636] dark:!text-white !shadow-none py-3"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                  {locale === "ar" ? "البريد الإلكتروني" : "Email"}
                </label>
                <PrimaryInput
                  type="email"
                  onChange={handleInputChange}
                  value={userData.email}
                  name="email"
                  icon={
                    <Image
                      src="/auth/icons/email.svg"
                      alt="email"
                      width={20}
                      height={20}
                    />
                  }
                  iconContainerClasses="start-2"
                  className="!border !border-gray-200 dark:!border-gray-500 !rounded-xl !bg-gray-100 dark:!bg-[#363636] dark:!text-white !shadow-none py-3"
                />
              </div>
              <div>
                <label className="block mb-1 text-xs text-gray-500 dark:text-gray-400">
                  {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
                </label>
                <PrimaryInput
                  type="tel"
                  isPhone
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  value={phoneNumber || ""}
                  countryCode={country.dial}
                  onCountryChange={(newCountry) => {
                    setCountry(newCountry);
                  }}
                  icon={
                    <Image
                      src="/auth/icons/phone.svg"
                      alt="phone"
                      width={20}
                      height={20}
                    />
                  }
                  iconContainerClasses="start-2"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                  className="!border !border-gray-200 dark:!border-gray-500 !rounded-xl !bg-gray-100 dark:!bg-[#363636] dark:!text-white !shadow-none py-3"
                />
              </div>

              <div className="pt-2 flex justify-center">
                <PrimaryButton
                  className="px-8 min-w-[200px]"
                  onClick={handleSubmit}
                >
                  {locale === "ar" ? "حفظ التعديلات" : "Save Changes"}
                </PrimaryButton>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
