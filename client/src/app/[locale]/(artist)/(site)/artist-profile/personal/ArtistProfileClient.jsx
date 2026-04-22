"use client";
import { useLocale } from "next-intl";
import Image from "next/image";
import PrimaryInput from "@/components/shared/PrimaryInput";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { useRef, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
  
  // OTP Verification State
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [verificationToken, setVerificationToken] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [pendingChanges, setPendingChanges] = useState({
    email: null,
    phone: null,
    country: null,
    profile_picture: null
  });
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
  // Check if sensitive data (email/phone) is being changed
  const isSensitiveChange = (currentData, newData) => {
    return (
      currentData.email !== newData.email ||
      `${currentData.country?.dial}${currentData.localNumber}` !== `${newData.country?.dial}${newData.phoneNumber}`
    );
  };

  // Handle OTP input change
  const handleOtpChange = (element, index) => {
    if (isNaN(element.value)) return false;
    
    const newOtp = [...otp];
    newOtp[index] = element.value;
    setOtp(newOtp);
    
    // Focus next input
    if (element.nextSibling && element.value !== '') {
      element.nextSibling.focus();
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async () => {
    try {
      setIsVerifying(true);
      const otpCode = otp.join('');
      
      const response = await api.post("profile/confirm-info-update", {
        verify_token: verificationToken,
        otp: otpCode
      });

      if (response.data.success) {
        toast.success("Profile updated successfully");
        setShowOtpModal(false);
        setOtp(["", "", "", "", "", ""]);
        setVerificationToken("");
        // Optionally refresh user data
        // await fetchUserData();
      }
    } catch (error) {
      console.error("Error verifying OTP:", error);
      toast.error(error.response?.data?.message || "Failed to verify OTP");
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const formData = new FormData();
      const newPhoneNumber = `${country.dial}${phoneNumber}`;
      const isEmailChanged = userData.email !== initialUserData.email;
      const isPhoneChanged = newPhoneNumber !== `${initialUserData.country?.dial}${initialUserData.localNumber}`;
      
      // Prepare form data
      formData.append("name", userData.name);
      
      if (isEmailChanged) formData.append("email", userData.email);
      if (isPhoneChanged) formData.append("phone", newPhoneNumber);
      
      // Handle profile picture
      const fileInput = fileInputRef.current;
      if (fileInput.files && fileInput.files[0]) {
        const file = fileInput.files[0];
        if (!file.type.startsWith("image/")) {
          throw new Error("Please select a valid image file (JPEG, PNG, etc.)");
        }
        formData.append("profile_picture", file, file.name);
      }

      // If sensitive data is being changed, request OTP
      if (isEmailChanged || isPhoneChanged) {
        const response = await api.post("profile/update-info", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success && response.data.reset_token) {
          setVerificationToken(response.data.reset_token);
          setShowOtpModal(true);
          toast.success(response.data.message || "Verification code sent");
        }
      } else {
        // For non-sensitive changes, update directly
        const response = await api.post("profile/update-info", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        if (response.data.success) {
          toast.success("Profile updated successfully");
          // Optionally refresh user data
          // await fetchUserData();
        }
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
      {/* OTP Verification Modal */}
      <Dialog open={showOtpModal} onOpenChange={setShowOtpModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Verify Your Identity</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
              We've sent a verification code to your {userData.email ? 'email' : 'phone'}. Please enter it below.
            </p>
            <div className="flex justify-center space-x-2 mb-6">
              {otp.map((data, index) => (
                <input
                  key={index}
                  type="text"
                  maxLength={1}
                  value={data}
                  onChange={e => handleOtpChange(e.target, index)}
                  onFocus={e => e.target.select()}
                  className="w-12 h-12 text-center border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              ))}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={handleVerifyOtp}
                disabled={isVerifying || otp.some(digit => !digit)}
                className="w-full"
              >
                {isVerifying ? 'Verifying...' : 'Verify'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
