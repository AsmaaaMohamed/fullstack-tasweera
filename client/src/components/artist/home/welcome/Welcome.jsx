"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useArtistAuth } from "@/contexts/ArtistAuthContext";
import Summary from "./Summary";
import AddSkillsDialog from "./AddSkillsDialog";
import { Plus, ChevronDown, ClipboardList, TrendingUp, X } from "lucide-react";
import {
  getArtistAssignedSkills,
  removeArtistSkills,
} from "@/lib/artist-skills";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { getArtistStats } from "@/lib/artist-stats";
import { BookingSection } from "../bookings/BookingSection";

export default function Welcome() {
  const locale = useLocale();
  const t = useTranslations("ArtistHome");
  const { user } = useArtistAuth();
  const [isSkillsDialogOpen, setIsSkillsDialogOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("day");
  const [stats, setStats] = useState(null);
  const [isLoadingStats, setIsLoadingStats] = useState(false);
  const [statsError, setStatsError] = useState(null);

  const userName = user?.name || user?.full_name || user?.first_name || "";

  const [assignedSkills, setAssignedSkills] = useState([]);
  const [isLoadingSkills, setIsLoadingSkills] = useState(true);

  useEffect(() => {
    const fetchSkills = async () => {
      try {
        const skills = await getArtistAssignedSkills();
        setAssignedSkills(skills || []);
      } catch (error) {
        console.error("Failed to fetch skills", error);
      } finally {
        setIsLoadingSkills(false);
      }
    };
    fetchSkills();
  }, []);

  const handleRemoveSkill = async (skillToRemove) => {
    const previous = assignedSkills;
    setAssignedSkills((prev) => prev.filter((s) => s.id !== skillToRemove.id));

    try {
      await removeArtistSkills([skillToRemove.id]);
      toast.success(locale === "en" ? "Skill removed" : "تم حذف المهارة");
    } catch (error) {
      setAssignedSkills(previous);
      toast.error(
        locale === "en" ? "Failed to remove skill" : "فشل حذف المهارة"
      );
    }
  };

  const handleSkillsSave = async () => {
    const skills = await getArtistAssignedSkills();
    setAssignedSkills(skills || []);
  };

  const periodOptions = [
    { value: "day", label: locale === "en" ? "Day" : "يومي" },
    { value: "week", label: locale === "en" ? "Week" : "أسبوعي" },
    { value: "month", label: locale === "en" ? "Month" : "شهري" },
    { value: "year", label: locale === "en" ? "Year" : "سنوي" },
  ];

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoadingStats(true);
      setStatsError(null);

      try {
        const data = await getArtistStats(selectedPeriod);
        if (!data) {
          setStats(null);
          setStatsError("failed");
        } else {
          setStats(data);
        }
      } catch (error) {
        setStats(null);
        setStatsError("failed");
      } finally {
        setIsLoadingStats(false);
      }
    };

    fetchStats();
  }, [selectedPeriod]);

  return (
    <section className="px-4 sm:px-6 pt-6 sm:pt-0 bg-white dark:bg-[#363636]">
      {/* Greeting */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-black dark:text-white mb-4">
          {t("welcome-greeting", { name: userName }) ||
            (locale === "en" ? `Hello ${userName}` : `اهلا ${userName}`)}
        </h1>

        {/* Add Skills Button */}
        <button
          onClick={() => setIsSkillsDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 border border-[#D4A574] rounded-lg bg-white dark:bg-[#363636] hover:bg-gray-50 dark:hover:bg-[#363636]/80 transition-colors"
        >
          <Plus className="w-5 h-5 text-[#E6A525]" />
          <span className="text-black dark:text-white">
            {t("add-skills") ||
              (locale === "en" ? "Add your skills" : "اضافة مهاراتك")}
          </span>
        </button>

        {/* Skills List */}
        <div className="mt-4">
          {isLoadingSkills ? (
            <div className="text-sm text-gray-500">...</div>
          ) : assignedSkills.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {assignedSkills.map((skill) => (
                <div
                  key={skill.id}
                  className="relative flex items-center justify-center px-3 py-1.5 rounded-[8px] border border-[#E6A525] text-[#E6A525] text-xs sm:text-sm font-medium bg-white dark:bg-[#363636]"
                >
                  <span className="px-2">{skill.name}</span>
                  <button
                    onClick={() => handleRemoveSkill(skill)}
                    className="w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center hover:bg-red-600 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">
              {locale === "en"
                ? "No skills added yet"
                : "لم تتم إضافة مهارات بعد"}
            </p>
          )}
        </div>
      </div>

      {/* Subtitle + Period Selector */}
      <div className="mb-6 max-w-5xl mx-start flex flex-col gap-3 items-start justify-between sm:flex-row sm:items-center">
        <p className="text-gray-500 dark:text-gray-400">
          {t("check-achievements") ||
            (locale === "en"
              ? "Let's check your financial achievements"
              : "دعنا نتحقق من انجازاتك المالية")}
        </p>

        <div className="flex justify-start">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="bg-white dark:bg-[#363636] border-gray-300 dark:border-gray-600 rounded-lg"
              >
                {periodOptions.find((opt) => opt.value === selectedPeriod)
                  ?.label ||
                  t("monthly") ||
                  (locale === "en" ? "Monthly" : "شهريا")}
                <ChevronDown className="w-4 h-4 ms-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {periodOptions.map((option) => (
                <DropdownMenuItem
                  key={option.value}
                  onSelect={() => setSelectedPeriod(option.value)}
                >
                  {option.label}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Monthly Filter and Stats */}
      <div className="space-y-6 max-w-5xl mx-start">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Orders Completed Today */}
          <Summary
            image={"/artist/home/growth.svg"}
            number={
              isLoadingStats ? "..." : `${stats?.daily_bookings_count ?? 0}`
            }
            description={
              t("orders-completed-today") ||
              (locale === "en"
                ? "Orders completed today"
                : "طلبات التي تمت اليوم")
            }
            bgColor="bg-[#E6A525]"
          />

          {/* Photography Inputs */}
          <Summary
            image={"/artist/home/paper.svg"}
            number={isLoadingStats ? "..." : `${stats?.revenue?.amount ?? 0}`}
            description={
              t("photography-inputs") ||
              (locale === "en" ? "Photography inputs" : "مدخلات التصوير")
            }
            bgColor="bg-[#5C4008]"
          />
        </div>
      </div>
      {/* Booking Section */}
      <BookingSection />

      {/* Add Skills Dialog */}
      <AddSkillsDialog
        open={isSkillsDialogOpen}
        onOpenChange={setIsSkillsDialogOpen}
        onSuccess={handleSkillsSave}
      />
    </section>
  );
}
