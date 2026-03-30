"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Link from "next/link";
import Image from "next/image";
import PrimaryButton from "@/components/shared/PrimaryButton";
import api from "@/lib/api";
import PrimaryInput from "@/components/shared/PrimaryInput";
import { toast } from "sonner";
import { useSearch } from "@/hooks/useSearch";
import SearchResults from "@/components/shared/SearchResults";

export default function AddComplaintPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    artistId: "",
    title: "",
    description: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.artistId || !formData.title) {
      alert("الرجاء ملء جميع الحقول المطلوبة");
      return;
    }
    setIsSubmitting(true);
    try {
      const response = await api.post("/customer/complaints", {
        artist_id: Number(formData.artistId),
        title: formData.title,
        description: formData.description,
      });

      if (response.data.status === "success") {
        setFormData({
          artistId: "",
          title: "",
          description: "",
        });
        setSearchQuery("");
        setShowResults(false);
        router.push("/user-profile/complaints");
        toast.success("Complaint submitted successfully");
      } else {
        toast.error(response.data.message || "Failed to submit complaint");
      }
    } catch (error) {
      toast.error(
        error.response?.data?.message ||
          "An error occurred while submitting the complaint"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const {
    searchQuery,
    results: searchResults,
    isSearching,
    showResults,
    handleSearchChange,
    setShowResults,
    setSearchQuery,
    handleInputBlur,
    handleInputFocus,
  } = useSearch();

  // Handle artist selection
  const handleArtistSelect = (artist) => {
    setFormData((prev) => ({
      ...prev,
      artistId: artist.id.toString(),
    }));
    setSearchQuery(artist.name);
    setShowResults(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  return (
    <div className="bg-background p-6">
      <div className="mx-auto">
        {/* Header */}
        <div className="flex items-center gap-2 mb-8">
          <Link href="/user-profile/complaints">
            <Image
              src="/user/profile/lets-icons_back.svg"
              alt="Back"
              width={24}
              height={24}
              className="transform scale-x-[-1]"
            />
          </Link>
          <h1 className="text-lg font-medium text-foreground dark:text-white!">
            اضافة شكوى
          </h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6 max-w-sm mx-auto">
          {/* Complaint About */}
          <div className="relative">
            <label className="block text-black font-medium text-sm mb-1 dark:text-white">
              اسم المشكوى عليه
            </label>
            <div className="relative">
              <PrimaryInput
                type="text"
                placeholder="ابحث عن اسم المصور..."
                value={searchQuery}
                onChange={handleSearchChange}
                onBlur={handleInputBlur}
                onFocus={handleInputFocus}
                icon={
                  <Image
                    src="/auth/icons/user.svg"
                    alt="user"
                    width={20}
                    height={20}
                  />
                }
                iconContainerClasses="start-2"
                className="w-full border-2 border-border rounded-lg py-3 placeholder-descriptive placeholder:text-sm focus:outline-none"
              />
              {isSearching && (
                <div className="absolute inset-y-0 end-2 flex items-center pl-3">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                </div>
              )}
            </div>

            <SearchResults
              results={searchResults}
              onSelect={handleArtistSelect}
              searchQuery={searchQuery}
              isSearching={isSearching}
              showResults={showResults}
              noResultsText="لا يوجد نتائج لـ"
              className="w-full" // Add any additional classes you need
            />
          </div>

          {/* Complaint Title */}
          <div>
            <label className="block dark:text-white text-black font-medium text-sm mb-1">
              عنوان الشكوى
            </label>
            <PrimaryInput
              name="title"
              type="text"
              placeholder="اكتب عنوان الشكوى"
              value={formData.title}
              onChange={handleInputChange}
              className="w-full border-2 border-border dark:border-gray-500 dark:bg-[#363636] dark:text-white rounded-lg p-3 placeholder-descriptive dark:placeholder-gray-400 placeholder:text-sm focus:outline-none"
            />
          </div>

          {/* Notes */}
          <div>
            <label className="block dark:text-white text-black font-medium text-sm mb-1">
              ملاحظات
            </label>
            <textarea
              name="description"
              placeholder="اكتب ملاحظاتك هنا ....."
              value={formData.description}
              onChange={handleInputChange}
              rows={6}
              className="w-full border-2 border-border dark:border-gray-500 dark:bg-[#363636] dark:text-white rounded-lg p-3 placeholder-descriptive dark:placeholder-gray-400 placeholder:text-sm focus:outline-none focus:border-primary resize-none"
            />
          </div>

          {/* Submit Button */}
          <div className="flex justify-center mt-4">
            <PrimaryButton
              type="submit"
              disabled={isSubmitting}
              className="w-[232px] h-14 font-semibold"
            >
              {isSubmitting ? "جاري الإرسال..." : "ارسال الشكوى"}
            </PrimaryButton>
          </div>
        </form>
      </div>
    </div>
  );
}
