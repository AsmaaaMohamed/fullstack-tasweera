"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import Image from "next/image";
import { Plus, Star } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import AddRatingModal from "./AddRatingModal";
import { useLocale } from "next-intl";
import api from "@/lib/api";
import { toast } from "sonner";
import { Pencil } from "lucide-react";

export default function About({
  bio,
  services,
  avgRating,
  ratings = [],
  artistId,
  isOwnProfile = false,
  yearsOfExperience,
}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [bioText, setBioText] = useState(bio || "");
  const [isSaving, setIsSaving] = useState(false);
  const [isEditingYears, setIsEditingYears] = useState(false);
  const [yearsValue, setYearsValue] = useState(yearsOfExperience || "");
  const [isSavingYears, setIsSavingYears] = useState(false);
  const router = useRouter();
  const hasServices = Array.isArray(services) && services.length > 0;
  const reviews = Array.isArray(ratings) ? ratings : [];
  const locale = useLocale();

  return (
    <div className="w-full px-4">
      <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
        {/* Right Column - Artist Info and Services */}
        <div className="flex-1 space-y-6">
          {/* About the Artist */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white">
                {isOwnProfile
                  ? locale === "ar"
                    ? "نبذة عني"
                    : "About Me"
                  : locale === "ar"
                  ? "نبذة عن الفنان"
                  : "About the Artist"}
              </h3>
              {isOwnProfile && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                >
                  <Pencil className="w-4 h-4 text-gray-500" />
                </button>
              )}
            </div>

            {isEditing ? (
              <div className="space-y-3">
                <textarea
                  value={bioText}
                  onChange={(e) => setBioText(e.target.value)}
                  className="w-full min-h-[150px] p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1C1C1D] text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
                  placeholder={
                    locale === "ar"
                      ? "اكتب نبذة عنك..."
                      : "Write about yourself..."
                  }
                />
                <div className="flex gap-2 justify-end">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsEditing(false);
                      setBioText(bio || "");
                    }}
                    disabled={isSaving}
                    className="h-8"
                  >
                    {locale === "ar" ? "إلغاء" : "Cancel"}
                  </Button>
                  <Button
                    onClick={async () => {
                      if (bioText === (bio || "")) {
                        setIsEditing(false);
                        return;
                      }

                      setIsSaving(true);
                      try {
                        const formData = new FormData();
                        // We need to send at least one field. Assuming the API accepts partial updates or we just send artist_info.
                        // Based on previous experience, we might need to send other fields if the API is strict,
                        // but let's try sending just artist_info first.
                        // Wait, the API endpoint is profile/update-info. It expects form data.
                        // If it fails, we might need to fetch current user data first.
                        // But let's try appending just artist_info.
                        formData.append("artist_info", bioText);

                        const response = await api.post(
                          "/artist-profile/UpdateProfile",
                          formData,
                          {
                            headers: { "Content-Type": "multipart/form-data" },
                          }
                        );
                        if (response.data.status === "success") {
                          toast.success(
                            locale === "ar"
                              ? "تم تحديث النبذة بنجاح"
                              : "Bio updated successfully"
                          );
                          setIsEditing(false);
                          router.refresh();
                        }
                      } catch (error) {
                        console.error("Error updating bio:", error);
                        toast.error(
                          locale === "ar"
                            ? "فشل تحديث النبذة"
                            : "Failed to update bio"
                        );
                      } finally {
                        setIsSaving(false);
                      }
                    }}
                    disabled={isSaving}
                    className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                  >
                    {isSaving
                      ? locale === "ar"
                        ? "جاري الحفظ..."
                        : "Saving..."
                      : locale === "ar"
                      ? "حفظ"
                      : "Save"}
                  </Button>
                </div>
              </div>
            ) : bio ? (
              <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400 leading-relaxed whitespace-pre-wrap">
                {bio}
              </p>
            ) : (
              <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400 leading-relaxed">
                {locale === "ar"
                  ? "لا توجد نبذة متاحة حالياً"
                  : "No bio available currently"}
              </p>
            )}
          </div>

          {/* Years of Experience Section */}
          {isOwnProfile && (
            <div className="mt-6">
              <div className="flex items-center gap-2 mb-3">
                <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white">
                  {locale === "ar" ? "سنوات الخبرة" : "Years of Experience"}
                </h3>
                {!isEditingYears && (
                  <button
                    onClick={() => setIsEditingYears(true)}
                    className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
                  >
                    <Pencil className="w-4 h-4 text-gray-500" />
                  </button>
                )}
              </div>

              {isEditingYears ? (
                <div className="space-y-3">
                  <input
                    type="number"
                    min="0"
                    max="99"
                    value={yearsValue}
                    onChange={(e) => setYearsValue(e.target.value)}
                    className="w-full md:w-1/2 p-3 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-[#1C1C1D] text-foreground dark:text-white focus:outline-none focus:ring-2 focus:ring-amber-400"
                    placeholder={
                      locale === "ar"
                        ? "أدخل سنوات الخبرة"
                        : "Enter years of experience"
                    }
                  />
                  <div className="flex gap-2 justify-end">
                    <Button
                      variant="outline"
                      onClick={() => {
                        setIsEditingYears(false);
                        setYearsValue(yearsOfExperience || "");
                      }}
                      disabled={isSavingYears}
                      className="h-8"
                    >
                      {locale === "ar" ? "إلغاء" : "Cancel"}
                    </Button>
                    <Button
                      onClick={async () => {
                        if (yearsValue === (yearsOfExperience || "")) {
                          setIsEditingYears(false);
                          return;
                        }

                        // Validate input
                        const years = parseInt(yearsValue);
                        if (
                          yearsValue &&
                          (isNaN(years) || years < 0 || years > 99)
                        ) {
                          toast.error(
                            locale === "ar"
                              ? "يرجى إدخال رقم صحيح بين 0 و 99"
                              : "Please enter a valid number between 0 and 99"
                          );
                          return;
                        }

                        setIsSavingYears(true);
                        try {
                          const formData = new FormData();
                          formData.append(
                            "years_of_experience",
                            yearsValue || "0"
                          );

                          const response = await api.post(
                            "/artist-profile/UpdateProfile",
                            formData,
                            {
                              headers: {
                                "Content-Type": "multipart/form-data",
                              },
                            }
                          );
                          if (response.data.status === "success") {
                            toast.success(
                              locale === "ar"
                                ? "تم تحديث سنوات الخبرة بنجاح"
                                : "Years of experience updated successfully"
                            );
                            setIsEditingYears(false);
                            router.refresh();
                          }
                        } catch (error) {
                          console.error(
                            "Error updating years of experience:",
                            error
                          );
                          toast.error(
                            locale === "ar"
                              ? "فشل تحديث سنوات الخبرة"
                              : "Failed to update years of experience"
                          );
                        } finally {
                          setIsSavingYears(false);
                        }
                      }}
                      disabled={isSavingYears}
                      className="h-8 bg-amber-500 hover:bg-amber-600 text-white"
                    >
                      {isSavingYears
                        ? locale === "ar"
                          ? "جاري الحفظ..."
                          : "Saving..."
                        : locale === "ar"
                        ? "حفظ"
                        : "Save"}
                    </Button>
                  </div>
                </div>
              ) : yearsOfExperience != null ? (
                <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400 leading-relaxed">
                  {yearsOfExperience} {locale === "ar" ? "سنة" : "years"}
                </p>
              ) : (
                <p className="text-sm md:text-base text-muted-foreground dark:text-gray-400 leading-relaxed">
                  {locale === "ar"
                    ? "لم يتم تحديد سنوات الخبرة"
                    : "Years of experience not set"}
                </p>
              )}
            </div>
          )}

          {/* Offered Services */}
          {!isOwnProfile && (
            <div>
              <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white mb-3">
                {locale === "ar" ? "الخدمات المقدمة" : "Offered Services"}
              </h3>
              <Select>
                <SelectTrigger
                  className="w-1/2 bg-muted dark:bg-[#1C1C1D] border-border dark:border-[#1C1C1D] text-foreground dark:text-white"
                  dir={locale === "ar" ? "rtl" : "ltr"}
                >
                  <SelectValue
                    placeholder={
                      locale === "ar" ? "الخدمات المقدمة" : "Offered Services"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {hasServices ? (
                    services.map((svc) => (
                      <SelectItem key={svc.id} value={`${svc.id}`}>
                        {svc.name}
                        {svc.price ? ` - ${svc.price}` : ""}
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem disabled value="none">
                      {locale === "ar"
                        ? "لا توجد خدمات متاحة"
                        : "No services available"}
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
        {/* Left Column - Customer Reviews */}
        <div className="lg:w-[400px] xl:w-[450px] space-y-4">
          {/* Add Rating Button */}
          <div className="flex flex-col-reverse sm:flex-row sm:justify-between sm:items-center gap-3 sm:gap-0">
            {!isOwnProfile && (
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(true)}
                className="border-gray-600 bg-white dark:bg-[#363636] dark:border-gray-500 hover:bg-gray-600/10 dark:hover:bg-[#363636] text-foreground dark:text-white flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                <Plus className="w-4 h-4" />
                <span>{locale === "ar" ? "اضافة تقييم" : "Add Review"}</span>
              </Button>
            )}
            {/* Customer Reviews Title */}
            <h3 className="text-lg md:text-xl font-bold text-foreground dark:text-white text-right sm:text-right w-full sm:w-auto">
              {locale === "ar" ? "اراء العملاء" : "Customer Reviews"}
            </h3>
          </div>

          {/* Reviews List (from API ratings) */}
          <div className="space-y-4 bg-gray-100 dark:bg-[#1C1C1D] p-4 rounded-lg">
            {reviews.length === 0 && (
              <p className="text-sm text-muted-foreground dark:text-gray-400 text-center py-4">
                {locale === "ar" ? "لا توجد تقييمات بعد" : "No reviews yet"}
              </p>
            )}
            {reviews.map((review) => (
              <div
                key={review.id}
                className="bg-white dark:bg-[#363636] border border-gray-200 dark:border-gray-500 rounded-lg p-4 shadow-sm w-full"
              >
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-1 sm:gap-0">
                  {/* Reviewer Info */}
                  <div className="flex items-start gap-3 mb-3">
                    {/* Avatar */}
                    <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-pink-200 flex-shrink-0">
                      <Image
                        src={
                          review.customer_profile_picture_url ||
                          "/user/profile.jpg"
                        }
                        alt={review.customer_name}
                        fill
                        className="object-cover"
                      />
                    </div>

                    {/* Name and Rating */}
                    <div className="flex-1">
                      <p className="font-medium text-foreground dark:text-white mb-1">
                        {review.customer_name}
                      </p>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < (review.rating || 0)
                                ? "fill-amber-400 text-amber-400"
                                : "text-gray-300 dark:text-gray-600"
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  {/* Date */}
                  <p className="text-xs text-muted-foreground dark:text-gray-400 mb-2 sm:mb-3 self-end sm:self-auto">
                    {review.created_at}
                  </p>
                </div>

                {/* Review Text */}
                <p className="text-sm text-muted-foreground dark:text-gray-300 leading-relaxed">
                  {review.comment}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Rating Modal */}
      <AddRatingModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        artistId={artistId}
        onSubmitted={() => router.refresh()}
      />
    </div>
  );
}
