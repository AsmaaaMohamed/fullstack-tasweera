"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { X, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
  addArtistSkills,
  getArtistAssignedSkills,
  getArtistSkills,
  removeArtistSkills,
} from "@/lib/artist-skills";

export default function AddSkillsDialog({ open, onOpenChange, onSuccess }) {
  const locale = useLocale();
  const t = useTranslations("ArtistHome");
  const [selectedSkills, setSelectedSkills] = useState([]);
  const [allSkills, setAllSkills] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSkills = async () => {
      setIsLoading(true);
      setHasError(false);
      const skills = await getArtistSkills(locale ?? "ar");
      if (!skills || skills.length === 0) {
        setHasError(true);
      }
      setAllSkills(skills || []);
      setIsLoading(false);
    };

    fetchSkills();
  }, [locale]);

  // Load skills already assigned to the artist when the dialog opens
  useEffect(() => {
    if (!open) return;

    const fetchAssignedSkills = async () => {
      try {
        const assigned = await getArtistAssignedSkills();
        setSelectedSkills(assigned || []);
      } catch (error) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to fetch artist assigned skills:", error);
        }
      }
    };

    fetchAssignedSkills();
  }, [open]);

  const handleSkillSelect = (skill) => {
    if (!selectedSkills.some((s) => s.id === skill.id)) {
      setSelectedSkills([...selectedSkills, skill]);
    }
    setIsOpen(false);
  };

  const handleRemoveSkill = async (skillToRemove) => {
    // Optimistically update UI
    const previous = selectedSkills;
    setSelectedSkills((prev) =>
      prev.filter((skill) => skill.id !== skillToRemove.id)
    );

    try {
      // Call API to remove this skill for the artist
      await removeArtistSkills([skillToRemove.id]);
      toast.success(
        locale === "en" ? "Skill removed successfully" : "تم حذف المهارة بنجاح"
      );
    } catch (error) {
      // Revert on failure
      setSelectedSkills(previous);
      toast.error(
        locale === "en"
          ? "Failed to remove skill"
          : "فشل في حذف المهارة، يرجى المحاولة مرة أخرى"
      );
      if (process.env.NODE_ENV === "development") {
        console.error("Error removing artist skill:", error);
      }
    }
  };

  const handleSave = async () => {
    if (!selectedSkills.length || isSaving) return;

    try {
      setIsSaving(true);
      const skillIds = selectedSkills.map((skill) => skill.id);
      const result = await addArtistSkills(skillIds);

      if (onSuccess) {
        onSuccess(result ?? selectedSkills);
      }

      toast.success(
        locale === "en" ? "Skills saved successfully" : "تم حفظ المهارات بنجاح"
      );

      onOpenChange(false);
      // Optionally clear selected skills after save
      // setSelectedSkills([]);
    } catch (error) {
      toast.error(
        locale === "en"
          ? "Failed to save skills"
          : "فشل في حفظ المهارات، يرجى المحاولة مرة أخرى"
      );
      if (process.env.NODE_ENV === "development") {
        console.error("Error saving artist skills:", error);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onOpenChange(false);
  };

  const availableSkills = allSkills.filter(
    (skill) => !selectedSkills.some((s) => s.id === skill.id)
  );

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-full sm:max-w-xl lg:max-w-3xl">
        <DialogHeader>
          <DialogTitle className="text-2xl text-[#E6A525] text-center">
            {t("add-skills") ||
              (locale === "en" ? "Add your skills" : "اضافة مهاراتك")}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Skills Input with Dropdown */}
          <div className="space-y-2">
            <label className="text-sm text-gray-500 dark:text-gray-400">
              {t("add-skills") ||
                (locale === "en" ? "Add your skills" : "اضافة مهاراتك")}
            </label>
            <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={cn(
                    "w-full h-12 rounded-lg border border-gray-300 dark:border-gray-600 bg-gray-100 dark:bg-[#363636]/30 px-4 text-start flex items-center justify-between",
                    "focus:outline-none focus:ring-2 focus:ring-[#E6A525] focus:ring-offset-2"
                  )}
                >
                  <span className="text-gray-500 dark:text-gray-400">
                    {isLoading
                      ? locale === "en"
                        ? "Loading skills..."
                        : "جاري تحميل المهارات..."
                      : t("select-skills") ||
                        (locale === "en"
                          ? "Select your skills"
                          : "قم باختيار مهاراتك")}
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-full max-h-60 overflow-y-auto">
                {hasError ? (
                  <div className="px-2 py-1.5 text-sm text-red-500">
                    {locale === "en"
                      ? "Failed to load skills"
                      : "حدث خطأ أثناء تحميل المهارات"}
                  </div>
                ) : isLoading ? (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {locale === "en"
                      ? "Loading skills..."
                      : "جاري تحميل المهارات..."}
                  </div>
                ) : availableSkills.length > 0 ? (
                  availableSkills.map((skill) => (
                    <DropdownMenuItem
                      key={skill.id}
                      onSelect={() => handleSkillSelect(skill)}
                      className="cursor-pointer"
                    >
                      {skill.name}
                    </DropdownMenuItem>
                  ))
                ) : (
                  <div className="px-2 py-1.5 text-sm text-gray-500">
                    {locale === "en"
                      ? "No more skills available"
                      : "لا توجد مهارات متاحة"}
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Selected Skills Tags / Existing skills */}
          {selectedSkills.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
              {selectedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="relative flex items-center justify-center px-2 py-2 rounded-[8px] border border-[#E6A525] text-[#E6A525] text-xs sm:text-sm font-medium bg-white min-h-[40px]"
                >
                  <span className="text-center w-full px-4 truncate">
                    {skill.name}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(skill)}
                    className="absolute left-1.5 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[#F44336] text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                    aria-label={
                      locale === "en" ? "Remove skill" : "إزالة المهارة"
                    }
                  >
                    <X className="w-2.5 h-2.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="mt-2 text-sm text-gray-500 text-center">
              {locale === "en"
                ? "No skills added yet"
                : "لم تتم إضافة مهارات بعد"}
            </div>
          )}
        </div>

        <div className="flex justify-center mt-4 mb-2">
          <PrimaryButton
            onClick={handleSave}
            disabled={selectedSkills.length === 0 || isSaving}
            className="w-full sm:w-2/3 h-12 text-lg rounded-[12px]"
          >
            {isSaving
              ? locale === "en"
                ? "Saving..."
                : "جاري الحفظ..."
              : t("save") || (locale === "en" ? "Save" : "حفظ")}
          </PrimaryButton>
        </div>
      </DialogContent>
    </Dialog>
  );
}
