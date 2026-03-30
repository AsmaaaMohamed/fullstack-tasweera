"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import PrimaryButton from "@/components/shared/PrimaryButton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { X } from "lucide-react";
import api from "@/lib/api";

export function Step5WorkSchedule({
  data,
  onUpdate,
  onNext,
  isProfileEdit = false,
}) {
  const locale = useLocale();

  // Helper function to convert "HH:MM:SS" to "HH:MM"
  const formatTime = (timeString) => {
    if (!timeString) return "";
    return timeString.substring(0, 5); // Gets "HH:MM" from "HH:MM:SS"
  };

  // All days of the week
  const allDays = [
    { value: "Sunday", label: "الأحد" },
    { value: "Monday", label: "الإثنين" },
    { value: "Tuesday", label: "الثلاثاء" },
    { value: "Wednesday", label: "الأربعاء" },
    { value: "Thursday", label: "الخميس" },
    { value: "Friday", label: "الجمعة" },
    { value: "Saturday", label: "السبت" },
  ];

  // Initialize workSchedule from API data
  const [workSchedule, setWorkSchedule] = useState(
    data
      ? {
          from: formatTime(data.available_from) || "",
          to: formatTime(data.available_to) || "",
        }
      : { from: "", to: "" }
  );

  // Initialize working days from API data
  const [workingDays, setWorkingDays] = useState(data?.working_days || []);

  // Initialize session duration - convert minutes to hours
  const initialDuration = data?.session_duration_minutes
    ? String(data.session_duration_minutes / 60)
    : "";
  const [sessionDuration, setSessionDuration] = useState(initialDuration);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);

  const handleTimeChange = (type, value) => {
    setWorkSchedule((prev) => ({ ...prev, [type]: value }));
    if (onUpdate) {
      onUpdate({
        workSchedule: { ...workSchedule, [type]: value },
      });
    }
  };

  const handleSessionDurationChange = (value) => {
    setSessionDuration(value);
    if (onUpdate) {
      onUpdate({ sessionDuration: value });
    }
  };

  const handleAddDay = (value) => {
    if (value && !workingDays.includes(value)) {
      const newDays = [...workingDays, value];
      setWorkingDays(newDays);
      if (onUpdate) {
        onUpdate({ workingDays: newDays });
      }
    }
  };

  const handleRemoveDay = (dayToRemove) => {
    const newDays = workingDays.filter((day) => day !== dayToRemove);
    setWorkingDays(newDays);
    if (onUpdate) {
      onUpdate({ workingDays: newDays });
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      setSubmitError(null);

      // Validate required fields
      if (!workSchedule.from || !workSchedule.to) {
        setSubmitError(
          locale === "ar"
            ? "يرجى تحديد أوقات العمل"
            : "Please select working hours"
        );
        return;
      }
      if (!sessionDuration) {
        setSubmitError(
          locale === "ar"
            ? "يرجى تحديد مدة الجلسة"
            : "Please select session duration"
        );
        return;
      }
      if (workingDays.length === 0) {
        setSubmitError(
          locale === "ar"
            ? "يرجى تحديد أيام العمل"
            : "Please select working days"
        );
        return;
      }

      // Prepare the data
      const availabilityData = {
        working_days: workingDays,
        available_from: workSchedule.from,
        available_to: workSchedule.to,
        session_duration_minutes: parseInt(sessionDuration) * 60, // Convert hours to minutes
      };

      // Submit to API
      const response = await api.put(
        `/artist-profile/artist-availability?lang=${locale}`,
        availabilityData
      );

      // Check if successful
      if (response.data.status === "success") {
        // Update parent component only if callback exists (signup flow)
        if (onUpdate) {
          onUpdate({ workSchedule, sessionDuration, workingDays });
        }

        // Show success message in profile edit mode
        if (isProfileEdit) {
          const { toast } = await import("sonner");
          toast.success(
            locale === "ar"
              ? "تم تحديث مواعيد العمل بنجاح"
              : "Availability updated successfully"
          );
        }

        // Move to next step only if callback exists (signup flow)
        if (onNext) {
          onNext();
        }
      } else {
        setSubmitError(
          locale === "ar"
            ? "فشل في حفظ مواعيد العمل. يرجى المحاولة مرة أخرى."
            : "Failed to save availability. Please try again."
        );
      }
    } catch (error) {
      console.error("Error submitting availability:", error);
      setSubmitError(
        error.response?.data?.message || locale === "ar"
          ? "حدث خطأ أثناء حفظ مواعيد العمل. يرجى المحاولة مرة أخرى."
          : "An error occurred while saving availability. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Get available days (not yet selected)
  const availableDays = allDays.filter(
    (day) => !workingDays.includes(day.value)
  );

  return (
    <div className="space-y-8 max-w-2xl mx-auto my-20">
      <h2 className="text-sm font-medium mb-4">
        {locale === "ar" ? "اضافة مواعيد العمل" : "Add Availability"}
      </h2>

      <div className="space-y-6">
        {/* Time Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="from"
              className="text-sm text-descriptive dark:text-gray-300 block py-[10px] m-0"
            >
              {locale === "ar" ? "متاح من" : "Available from"}
            </label>
            <div className="relative">
              <input
                type="time"
                id="from"
                value={workSchedule.from}
                onChange={(e) => handleTimeChange("from", e.target.value)}
                className="w-full bg-[#F5F5F5] dark:bg-[#53535365] border-0 rounded-xl h-[55px] px-4 text-right"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label
              htmlFor="to"
              className="text-sm text-descriptive dark:text-gray-300 block py-[10px] m-0"
            >
              {locale === "ar" ? "متاح الي" : "Available to"}
            </label>
            <div className="relative">
              <input
                type="time"
                id="to"
                value={workSchedule.to}
                onChange={(e) => handleTimeChange("to", e.target.value)}
                className="w-full bg-[#F5F5F5] dark:bg-[#53535365] border-0 rounded-xl px-4 h-[55px] text-right"
              />
            </div>
          </div>
        </div>

        {/* Session Duration & Days */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label
              htmlFor="sessionDuration"
              className="text-sm text-descriptive dark:text-gray-300 block py-[10px] m-0"
            >
              {locale === "ar"
                ? "تحديد مدة الجلسة الواحدة"
                : "Select session duration"}
            </label>
            <Select
              value={sessionDuration}
              onValueChange={handleSessionDurationChange}
            >
              <SelectTrigger
                id="sessionDuration"
                className="w-full bg-[#F5F5F5] dark:hover:bg-[#53535365] dark:bg-[#53535365] border-0 text-descriptive dark:text-gray-300 rounded-xl !h-[55px] text-right flex-row-reverse"
              >
                <SelectValue
                  placeholder={
                    locale === "ar"
                      ? "قم بتحديد عدد ساعات الجلسة الواحدة"
                      : "Select session duration"
                  }
                />
              </SelectTrigger>
              <SelectContent align="end">
                <SelectItem value="1">1 hour</SelectItem>
                <SelectItem value="2">2 hours</SelectItem>
                <SelectItem value="3">3 hours</SelectItem>
                <SelectItem value="4">4 hours</SelectItem>
                <SelectItem value="5">5 hours</SelectItem>
                <SelectItem value="6">6 hours</SelectItem>
                <SelectItem value="7">7 hours</SelectItem>
                <SelectItem value="8">8 hours</SelectItem>
                <SelectItem value="9">9 hours</SelectItem>
                <SelectItem value="10">10 hours</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <label className="text-sm text-descriptive dark:text-gray-300 block py-[10px] m-0">
              {locale === "ar" ? "تحديد ايام العمل" : "Select working days"}
            </label>
            <Select onValueChange={handleAddDay} value="">
              <SelectTrigger className="w-full bg-[#F5F5F5] dark:hover:bg-[#53535365] dark:bg-[#53535365] border-0 text-descriptive dark:text-gray-300 rounded-xl !h-[55px] text-right flex-row-reverse">
                <SelectValue
                  placeholder={
                    locale === "ar"
                      ? "قم بإضافة يوم عمل"
                      : "Select working days"
                  }
                />
              </SelectTrigger>
              <SelectContent align="end">
                {availableDays.length > 0 ? (
                  availableDays.map((day) => (
                    <SelectItem key={day.value} value={day.value}>
                      {day.label}
                    </SelectItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {locale === "ar"
                      ? "تم تحديد جميع الأيام"
                      : "All days selected"}
                  </div>
                )}
              </SelectContent>
            </Select>

            {/* Selected Working Days */}
            {workingDays.length > 0 && (
              <div className="pt-2">
                <div className="flex flex-wrap gap-2">
                  {workingDays.map((day) => {
                    const dayLabel =
                      allDays.find((d) => d.value === day)?.label || day;
                    return (
                      <div
                        key={day}
                        className="flex items-center gap-2 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-900 dark:text-amber-200 rounded-lg text-xs font-medium"
                      >
                        <span>{dayLabel}</span>
                        <button
                          onClick={() => handleRemoveDay(day)}
                          className="hover:bg-amber-200 dark:hover:bg-amber-800/30 rounded-full p-0.5 transition-colors"
                          type="button"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center gap-4">
        {submitError && (
          <div className="w-full md:w-1/2 text-center text-red-500 text-sm bg-red-50 dark:bg-red-900/20 p-3 rounded-lg">
            {submitError}
          </div>
        )}
        <PrimaryButton
          onClick={handleSubmit}
          className="w-full md:w-1/2 mx-auto py-6 rounded-xl mt-8 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isSubmitting}
        >
          {isSubmitting ? "جاري الحفظ..." : isProfileEdit ? "حفظ" : "المتابعة"}
        </PrimaryButton>
      </div>
    </div>
  );
}
