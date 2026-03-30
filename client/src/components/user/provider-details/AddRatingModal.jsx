"use client";

import { useState } from "react";
import { Star } from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import PrimaryButton from "@/components/shared/PrimaryButton";
import api from "@/lib/api";
import { useLocale } from "next-intl";

export default function AddRatingModal({
  open,
  onOpenChange,
  artistId,
  onSubmitted,
}) {
  const locale = useLocale();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!artistId) {
      setError(
        locale === "ar" ? "لا يوجد معرف للفنان." : "Artist ID not found."
      );
      return;
    }
    if (rating <= 0) {
      setError(
        locale === "ar" ? "من فضلك اختر تقييماً." : "Please select a rating."
      );
      return;
    }
    try {
      setIsSubmitting(true);
      await api.post("/customer/ratings", {
        artist_id: artistId,
        rating,
        comment,
      });
      onSubmitted?.();
      onOpenChange(false);
      setRating(0);
      setComment("");
    } catch (e) {
      setError(
        e?.response?.data?.message || locale === "ar"
          ? "حدث خطأ أثناء إرسال التقييم"
          : "An error occurred while submitting the rating"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-gray-50 dark:bg-[#363636] sm:max-w-md rounded-lg p-6 px-8 dark:border-[#363636]">
        {/* Close Button */}
        <DialogClose className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-sm">
          {/* <X className="w-4 h-4 text-amber-900" /> */}
        </DialogClose>

        <div className="flex flex-col items-center gap-2">
          {/* Title */}
          <h2 className="text-xl md:text-2xl font-bold text-foreground dark:text-white text-center">
            {locale === "ar" ? "كيف رأيت الخدمة ؟" : "How was the service?"}
          </h2>

          {/* Subtitle */}
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
            {locale === "ar"
              ? "سوف تساعد ملاحظاتك على التحسن"
              : "Your feedback will help us improve"}
          </p>

          {/* Star Rating */}
          <div className="flex gap-2 justify-center mb-6">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => handleStarClick(value)}
                className="focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-400 rounded"
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    value <= rating
                      ? "fill-amber-500 text-amber-500"
                      : "text-gray-300 dark:text-gray-300"
                  }`}
                />
              </button>
            ))}
          </div>
        </div>

        {/* Comment Text Area */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder={
            locale === "ar" ? "اكتب رأيك ......" : "Write your feedback..."
          }
          className="w-full min-h-[120px] bg-gray-100 dark:bg-[#363636] dark:border dark:border-gray-500 rounded-lg p-4 text-right text-sm text-foreground dark:text-white placeholder:text-gray-400 dark:placeholder:text-gray-300  focus:outline-none focus:ring-2 focus:ring-amber-400 resize-none"
          dir="rtl"
        />

        {/* Error */}
        {error && (
          <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
        )}

        {/* Submit Button */}
        <PrimaryButton
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-1/2 mx-auto mt-6"
        >
          {isSubmitting
            ? locale === "ar"
              ? "جاري الإرسال..."
              : "Sending..."
            : locale === "ar"
            ? "ارسال"
            : "Send"}
        </PrimaryButton>
      </DialogContent>
    </Dialog>
  );
}
