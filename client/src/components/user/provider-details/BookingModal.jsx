"use client";
import { useRouter, Link } from "@/i18n/navigation";
import { useState, useMemo } from "react";
import {
  X,
  ArrowRight,
} from "lucide-react";
import { Dialog, DialogContent, DialogClose } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import PrimaryButton from "@/components/shared/PrimaryButton";
import PrimaryInput from "@/components/shared/PrimaryInput";
import Image from "next/image";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { useLocale } from "next-intl";
import CashOnDelivery from "@/components/svgs/CashOnDelivery";
import BankIcon from "@/components/svgs/BankIcon";
import CreditIcon from "@/components/svgs/CreditIcon";
import ApplePayIcon from "@/components/svgs/ApplePayIcon";
import MobileIcon from "@/components/svgs/MobileIcon";

const PAYMENT_METHODS = [
  {
    id: "cash_on_delivery",
    name: "الدفع عند الاستلام",
    icon: CashOnDelivery,
  },
  {
    id: "credit_card",
    name: "بطاقة إئتمانية",
    icon: CreditIcon,
  },
  {
    id: "tamara",
    name: "تمارا",
    icon: MobileIcon,
  },
  {
    id: "apple_pay",
    name: "Apple Pay",
    icon: ApplePayIcon,
  },
  {
    id: "tabby",
    name: "تابي",
    icon: CreditIcon,
  },
  {
    id: "stcbank",
    name: "تحويل بنكي STC",
    icon: BankIcon,
  },
];

function addOneHourToTimeString(hhmm) {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map((v) => parseInt(v, 10));
  const date = new Date(2000, 0, 1, h, m || 0, 0);
  date.setHours(date.getHours() + 1);
  const hh = `${date.getHours()}`.padStart(2, "0");
  const mm = `${date.getMinutes()}`.padStart(2, "0");
  return `${hh}:${mm}`;
}

export default function BookingModal({
  open,
  onOpenChange,
  services = [],
  provider,
  availableHours,
}) {
  const [step, setStep] = useState(1);
  const [bookingId, setBookingId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [apiError, setApiError] = useState("");
  const locale = useLocale();
  const [fieldErrors, setFieldErrors] = useState({
    date: "",
    time: "",
    serviceId: "",
  });
  const [selectedDayOfWeek, setSelectedDayOfWeek] = useState("");
  const [bookingData, setBookingData] = useState({
    time: "",
    date: "",
    inquiry: "",
    serviceId: services?.[0]?.id ? String(services[0].id) : "",
    paymentMethod: "credit_card",
  });

  const handleInputChange = (field, value) => {
    setBookingData({ ...bookingData, [field]: value });
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setApiError("");
  };

  const handleDayOfWeekChange = (dayName) => {
    setSelectedDayOfWeek(dayName);

    // Convert day name to date
    const daysMap = {
      Sunday: 0,
      Monday: 1,
      Tuesday: 2,
      Wednesday: 3,
      Thursday: 4,
      Friday: 5,
      Saturday: 6,
    };

    const targetDay = daysMap[dayName];
    const today = new Date();
    const currentDay = today.getDay();

    // Calculate days until target day
    let daysUntilTarget = targetDay - currentDay;
    if (daysUntilTarget <= 0) {
      daysUntilTarget += 7; // Move to next week if day has passed
    }

    // Get the target date
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysUntilTarget);

    // Format as YYYY-MM-DD
    const formattedDate = targetDate.toISOString().split("T")[0];

    setBookingData({ ...bookingData, date: formattedDate });
    setFieldErrors((prev) => ({ ...prev, date: "" }));
    setApiError("");
  };

  // Generate time slots based on available hours and session duration
  const generateTimeSlots = () => {
    // First check if availableHours exists
    if (!availableHours) {
      return [];
    }

    if (
      !availableHours?.available_from ||
      !availableHours?.available_to ||
      !availableHours?.session_duration_minutes
    ) {
      return [];
    }

    try {
      const slots = [];
      const [startHour, startMinute] = availableHours.available_from
        .split(":")
        .map(Number);
      const [endHour, endMinute] = availableHours.available_to
        .split(":")
        .map(Number);

      // Validate parsed values
      if (
        isNaN(startHour) ||
        isNaN(startMinute) ||
        isNaN(endHour) ||
        isNaN(endMinute)
      ) {
        return [];
      }

      // Convert to minutes from midnight
      const startMinutes = startHour * 60 + startMinute;
      const endMinutes = endHour * 60 + endMinute;
      const duration = availableHours.session_duration_minutes;

      if (duration <= 0 || startMinutes >= endMinutes) {
        return [];
      }

      let currentMinutes = startMinutes;

      while (currentMinutes + duration <= endMinutes) {
        const startHours = Math.floor(currentMinutes / 60);
        const startMins = currentMinutes % 60;
        const startTime = `${String(startHours).padStart(2, "0")}:${String(
          startMins
        ).padStart(2, "0")}`;

        const endSlotMinutes = currentMinutes + duration;
        const endHours = Math.floor(endSlotMinutes / 60);
        const endMins = endSlotMinutes % 60;
        const endTime = `${String(endHours).padStart(2, "0")}:${String(
          endMins
        ).padStart(2, "0")}`;

        if (startTime && startTime.length > 0) {
          slots.push({
            start_time: startTime,
            end_time: endTime,
            display: `${startTime} - ${endTime}`
          });
        }
        currentMinutes += duration;
      }

      return slots.filter((slot) => slot && slot.start_time && slot.start_time.trim().length > 0);
    } catch (error) {
      console.error("Error generating time slots:", error);
      return [];
    }
  };

  const timeSlots = useMemo(() => {
    return generateTimeSlots();
  }, [availableHours]);

  const currentService = services.find(
    (s) => String(s.id) === String(bookingData.serviceId)
  );
  const currentServicePriceNumber =
    currentService?.price != null ? Number(currentService.price) : undefined;

  const handleNext = () => {
    if (step === 1) {
      const hasServices = Array.isArray(services) && services.length > 0;
      const errors = { date: "", time: "", serviceId: "" };
      if (!bookingData.date) errors.date = "الرجاء اختيار تاريخ الحجز";
      if (!bookingData.time) errors.time = "الرجاء اختيار وقت الحجز";
      if (!hasServices) {
        errors.serviceId = "لا توجد خدمات متاحة حالياً";
      } else if (!bookingData.serviceId) {
        errors.serviceId = "الرجاء اختيار الخدمة";
      }
      setFieldErrors(errors);
      if (!errors.date && !errors.time && !errors.serviceId) setStep(2);
    }
  };

  const handleBack = () => {
    if (step === 2) {
      setStep(1);
    }
  };

  const handleClose = () => {
    setStep(1);
    setSelectedDayOfWeek("");
    setBookingData({
      time: "",
      date: "",
      inquiry: "",
      serviceId: services?.[0]?.id ? String(services[0].id) : "",
      paymentMethod: "credit_card",
    });
    setSuccessMessage("");
    setBookingId("");
    setApiError("");
    setFieldErrors({ date: "", time: "", serviceId: "" });
    onOpenChange(false);
  };

  const handleSubmit = async () => {
    const hasServices = Array.isArray(services) && services.length > 0;
    const errors = { date: "", time: "", serviceId: "" };
    if (!bookingData.date) errors.date = "الرجاء اختيار تاريخ الحجز";
    if (!bookingData.time) errors.time = "الرجاء اختيار وقت الحجز";
    if (!hasServices) {
      errors.serviceId = "لا توجد خدمات متاحة حالياً";
    } else if (!bookingData.serviceId) {
      errors.serviceId = "الرجاء اختيار الخدمة";
    }
    setFieldErrors(errors);
    if (
      !bookingData.date ||
      !bookingData.time ||
      !bookingData.serviceId ||
      !hasServices
    ) {
      return;
    }
    const body = {
      service_id: Number(bookingData.serviceId),
      booking_date: bookingData.date, // yyyy-mm-dd from <input type="date">
      start_time: bookingData.time, // HH:mm
      end_time: addOneHourToTimeString(bookingData.time),
      notes: bookingData.inquiry || "",
      payment_method: bookingData.paymentMethod, // cash_on_delivery, tamara, tabby, stcbank, apple_pay, credit_card
    };
    try {
      setIsSubmitting(true);
      setApiError("");
      const { data } = await api.post(`/CreateBookings?lang=en`, body);
      // Expected success shape:
      // { "message": "Booking details saved successfully. Booking is pending approval.", "booking_id": 36 }
      if (data?.booking_id) {
        setBookingId(String(data.booking_id));
      }
      if (data?.message) {
        setSuccessMessage(data.message);
      }
      setStep(3);
    } catch (e) {
      // Minimal UX: keep on step 2; real app could show toast
      console.error(e);
      const resp = e?.response?.data;
      if (resp?.errors && typeof resp.errors === "object") {
        // Prefer server validation message for booking_date/past date
        const serverDateErr =
          resp.errors.booking_date?.[0] || resp.errors.date?.[0];
        if (serverDateErr) {
          setApiError(String(serverDateErr));
          setFieldErrors((prev) => ({ ...prev, date: String(serverDateErr) }));
        } else {
          const firstKey = Object.keys(resp.errors)[0];
          const firstMsg =
            Array.isArray(resp.errors[firstKey]) && resp.errors[firstKey][0]
              ? String(resp.errors[firstKey][0])
              : "حدث خطأ أثناء إرسال الطلب";
          setApiError(firstMsg);
        }
      } else if (resp?.message) {
        setApiError(String(resp.message));
      } else {
        setApiError("حدث خطأ أثناء إرسال الطلب، الرجاء المحاولة لاحقاً");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const router = useRouter();

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className={cn(
          "bg-background dark:bg-[#363636] rounded-lg p-6 sm:p-8",
          "max-w-[90vw] sm:max-w-md lg:max-w-lg xl:max-w-[60vw]",
          "max-h-[90vh] overflow-y-auto"
        )}
        showCloseButton={false}
      >
        {/* Close Button */}
        <DialogClose
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
        >
          <X className="w-5 h-5 text-gray-600" />
        </DialogClose>

        {step === 1 ? (
          // Step 1: Book Now
          <div className="space-y-6">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center text-[#E6A525]">
              احجز الآن
            </h2>

            {/* Date and Time - Flex Layout */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Booking Day */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  يوم الحجز
                </label>
                <Select
                  value={selectedDayOfWeek}
                  onValueChange={handleDayOfWeekChange}
                  disabled={
                    !availableHours?.working_days ||
                    !Array.isArray(availableHours.working_days) ||
                    availableHours.working_days.length === 0
                  }
                >
                  <SelectTrigger
                    className={cn(
                      "w-full group relative border-1 border-[#C5C5C5] data-[state=open]:border-[#E6A525] focus:border-[#E6A525] bg-none dark:border-gray-500 dark:bg-[#363636] dark:text-white text-right ps-6 pr-4 px-4 !py-3 !h-auto rounded-lg ",
                      "data-[state=open]:!bg-[#E6A525]/10 focus:bg-[#E6A525]/10 dark:data-[state=open]:!bg-[#363636] dark:focus:bg-[#363636]/10"
                    )}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute size-[18px] start-1 text-[#C5C5C5] group-focus:text-main group-active:text-main group-data-[state=open]:text-main">
                      <path d="M10.5 16.5H7.5C4.67175 16.5 3.25725 16.5 2.379 15.621C1.50075 14.742 1.5 13.3282 1.5 10.5V9C1.5 6.17175 1.5 4.75725 2.379 3.879C3.258 3.00075 4.67175 3 7.5 3H10.5C13.3282 3 14.7427 3 15.621 3.879C16.4992 4.758 16.5 6.17175 16.5 9V10.5C16.5 13.3282 16.5 14.7427 15.621 15.621C15.1312 16.1115 14.475 16.3283 13.5 16.4235M5.25 3V1.875M12.75 3V1.875M16.125 6.75H8.0625M1.5 6.75H4.40625" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>
                      <path d="M13.5 12.75C13.5 12.9489 13.421 13.1397 13.2803 13.2803C13.1397 13.421 12.9489 13.5 12.75 13.5C12.5511 13.5 12.3603 13.421 12.2197 13.2803C12.079 13.1397 12 12.9489 12 12.75C12 12.5511 12.079 12.3603 12.2197 12.2197C12.3603 12.079 12.5511 12 12.75 12C12.9489 12 13.1397 12.079 13.2803 12.2197C13.421 12.3603 13.5 12.5511 13.5 12.75ZM13.5 9.75C13.5 9.94891 13.421 10.1397 13.2803 10.2803C13.1397 10.421 12.9489 10.5 12.75 10.5C12.5511 10.5 12.3603 10.421 12.2197 10.2803C12.079 10.1397 12 9.94891 12 9.75C12 9.55109 12.079 9.36032 12.2197 9.21967C12.3603 9.07902 12.5511 9 12.75 9C12.9489 9 13.1397 9.07902 13.2803 9.21967C13.421 9.36032 13.5 9.55109 13.5 9.75ZM9.75 12.75C9.75 12.9489 9.67098 13.1397 9.53033 13.2803C9.38968 13.421 9.19891 13.5 9 13.5C8.80109 13.5 8.61032 13.421 8.46967 13.2803C8.32902 13.1397 8.25 12.9489 8.25 12.75C8.25 12.5511 8.32902 12.3603 8.46967 12.2197C8.61032 12.079 8.80109 12 9 12C9.19891 12 9.38968 12.079 9.53033 12.2197C9.67098 12.3603 9.75 12.5511 9.75 12.75ZM9.75 9.75C9.75 9.94891 9.67098 10.1397 9.53033 10.2803C9.38968 10.421 9.19891 10.5 9 10.5C8.80109 10.5 8.61032 10.421 8.46967 10.2803C8.32902 10.1397 8.25 9.94891 8.25 9.75C8.25 9.55109 8.32902 9.36032 8.46967 9.21967C8.61032 9.07902 8.80109 9 9 9C9.19891 9 9.38968 9.07902 9.53033 9.21967C9.67098 9.36032 9.75 9.55109 9.75 9.75ZM6 12.75C6 12.9489 5.92098 13.1397 5.78033 13.2803C5.63968 13.421 5.44891 13.5 5.25 13.5C5.05109 13.5 4.86032 13.421 4.71967 13.2803C4.57902 13.1397 4.5 12.9489 4.5 12.75C4.5 12.5511 4.57902 12.3603 4.71967 12.2197C4.86032 12.079 5.05109 12 5.25 12C5.44891 12 5.63968 12.079 5.78033 12.2197C5.92098 12.3603 6 12.5511 6 12.75ZM6 9.75C6 9.94891 5.92098 10.1397 5.78033 10.2803C5.63968 10.421 5.44891 10.5 5.25 10.5C5.05109 10.5 4.86032 10.421 4.71967 10.2803C4.57902 10.1397 4.5 9.94891 4.5 9.75C4.5 9.55109 4.57902 9.36032 4.71967 9.21967C4.86032 9.07902 5.05109 9 5.25 9C5.44891 9 5.63968 9.07902 5.78033 9.21967C5.92098 9.36032 6 9.55109 6 9.75Z" fill="currentColor"/>
                    </svg>
                    <SelectValue placeholder="اختر يوم الحجز"/>
                  </SelectTrigger>
                  <SelectContent>
                    {[
                      { en: "Saturday", ar: "السبت" },
                      { en: "Sunday", ar: "الأحد" },
                      { en: "Monday", ar: "الاثنين" },
                      { en: "Tuesday", ar: "الثلاثاء" },
                      { en: "Wednesday", ar: "الأربعاء" },
                      { en: "Thursday", ar: "الخميس" },
                      { en: "Friday", ar: "الجمعة" },
                    ].map((day) => {
                      const isWorkingDay =
                        availableHours?.working_days?.includes(day.en);
                      return (
                        <SelectItem
                          key={day.en}
                          value={day.en}
                          disabled={!isWorkingDay}
                          className={cn(
                            !isWorkingDay && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {locale === "ar" ? day.ar : day.en}
                          {!isWorkingDay && " (غير متاح)"}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
                {bookingData.date &&
                  availableHours?.working_days?.length > 0 && (
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      التاريخ المحدد: {bookingData.date}
                    </p>
                  )}
                {fieldErrors.date ? (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.date}
                  </p>
                ) : null}
              </div>

              {/* Booking Time */}
              <div className="flex-1 space-y-2">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  وقت الحجز
                </label>
                <Select
                  value={bookingData.time}
                  onValueChange={(value) => handleInputChange("time", value)}
                  disabled={!Array.isArray(timeSlots) || timeSlots.length === 0}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full relative group border-1 border-[#C5C5C5] data-[state=open]:border-[#E6A525] focus:border-[#E6A525] dark:border-gray-500 dark:bg-[#363636] dark:text-white text-right ps-6 pr-4 px-4 !py-3 !h-auto rounded-lg",
                      "data-[state=open]:!bg-[#E6A525]/10 focus:bg-[#E6A525]/10 dark:data-[state=open]:!bg-[#363636] dark:focus:bg-[#363636]/10"
                    )}
                    dir={locale === "ar" ? "rtl" : "ltr"}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg" className="absolute size-[18px] start-1 text-[#C5C5C5] group-focus:text-main group-active:text-main group-data-[state=open]:text-main">
                      <path d="M9 1.5C13.1423 1.5 16.5 4.85775 16.5 9C16.5 13.1423 13.1423 16.5 9 16.5C4.85775 16.5 1.5 13.1423 1.5 9C1.5 4.85775 4.85775 1.5 9 1.5ZM9 4.5C8.80109 4.5 8.61032 4.57902 8.46967 4.71967C8.32902 4.86032 8.25 5.05109 8.25 5.25V9C8.25004 9.1989 8.32909 9.38963 8.46975 9.53025L10.7198 11.7802C10.8612 11.9169 11.0507 11.9925 11.2473 11.9908C11.4439 11.989 11.6321 11.9102 11.7711 11.7711C11.9102 11.6321 11.989 11.4439 11.9908 11.2473C11.9925 11.0507 11.9169 10.8612 11.7802 10.7198L9.75 8.6895V5.25C9.75 5.05109 9.67098 4.86032 9.53033 4.71967C9.38968 4.57902 9.19891 4.5 9 4.5Z" fill="currentColor"/>
                    </svg>
                    <SelectValue placeholder="اختر الوقت" />
                  </SelectTrigger>
                  <SelectContent>
                    {timeSlots.map((slot) => (
                      <SelectItem key={slot.start_time} value={slot.start_time}>
                        {slot.display}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {fieldErrors.time ? (
                  <p className="text-xs text-red-600 mt-1">
                    {fieldErrors.time}
                  </p>
                ) : null}
              </div>
            </div>

            <div className="space-y-2 lg:w-1/2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                اضافة استفسار
              </label>
              <PrimaryInput
                value={bookingData.inquiry}
                onChange={(e) => handleInputChange("inquiry", e.target.value)}
                placeholder="أضف استفساراً (اختياري)"
                className={cn(
                  "border-1 border-[#C5C5C5] dark:border-gray-500  !rounded-lg",
                  "focus-visible:border-1 ofcus-visible:ring-1 focus-visible:ring-[#000]/20"
                )}
              />
            </div>

            <div className="space-y-3">
              <h3 className="text-base font-semibold text-gray-800 dark:text-white">
                معلومات الخدمة
              </h3>

              {/* Service Dropdown and Price */}
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Service Dropdown */}
                <div className="flex-1 space-y-2 lg:w-1/2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    اسم الخدمة
                  </label>
                  <Select
                    value={bookingData.serviceId}
                    onValueChange={(value) =>
                      handleInputChange("serviceId", value)
                    }
                  >
                    <SelectTrigger
                      className="w-full group border-1 border-[#E6A525] dark:border-gray-500 dark:bg-[#363636] dark:text-white text-right pr-4 px-4 !py-3 !h-auto rounded-lg"
                      dir={locale === "ar" ? "rtl" : "ltr"}
                    >
                      <SelectValue
                        placeholder={
                          Array.isArray(services) && services.length > 0
                            ? "اختر الخدمة"
                            : "لا توجد خدمات متاحة حالياً"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.isArray(services) && services.length > 0 ? (
                        services.map((service) => (
                          <SelectItem
                            key={service.id}
                            value={String(service.id)}
                          >
                            {service.name || service.title}
                          </SelectItem>
                        ))
                      ) : (
                        <SelectItem disabled value="not">
                          لا توجد خدمات متاحة
                        </SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                  {fieldErrors.serviceId ? (
                    <p className="text-xs text-red-600 mt-1">
                      {fieldErrors.serviceId}
                    </p>
                  ) : null}
                </div>

                {/* Service Price - Auto-updates based on selection */}
                <div className="flex-1 space-y-2 lg:w-1/2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    سعر الخدمة
                  </label>
                  <div className="w-full rounded-lg px-4 py-3 text-sm text-right text-foreground dark:text-white flex items-center justify-start gap-2 border-1 border-[#E6A525] dark:border-gray-500 dark:bg-[#363636]">
                    {currentServicePriceNumber != null
                      ? currentServicePriceNumber
                      : "-"}
                    <Image
                      src="/currency.svg"
                      alt="Saudi Riyal"
                      width={16}
                      height={16}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Note/Alert */}
            <div className="border border-dashed border-[#E6A525] rounded-lg p-4 bg-[#E6A525]/5 flex items-start gap-3 lg:w-1/2">
              <svg width="18" height="21" viewBox="0 0 18 21" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12.1082 13.7327C11.1295 14.7114 11.252 16.6856 11.252 16.6856H6.28989C6.28989 16.6856 6.39492 14.7114 5.43369 13.7327C4.66384 13.0547 4.11878 12.1583 3.87107 11.1628C3.62337 10.1673 3.68479 9.11997 4.04714 8.16026C4.4095 7.20055 5.05559 6.37399 5.89941 5.79062C6.74323 5.20726 7.74473 4.89478 8.77057 4.89478C9.79641 4.89478 10.7979 5.20726 11.6417 5.79062C12.4855 6.37399 13.1316 7.20055 13.494 8.16026C13.8564 9.11997 13.9178 10.1673 13.6701 11.1628C13.4224 12.1583 12.8781 13.0547 12.1082 13.7327Z" fill="#FFD517"/>
                <path d="M11.3918 18.2397C11.3921 18.3018 11.3801 18.3633 11.3565 18.4207C11.3328 18.478 11.2981 18.5302 11.2542 18.574C11.2103 18.6179 11.1582 18.6527 11.1008 18.6763C11.0434 18.6999 10.982 18.7119 10.9199 18.7116H6.60468C6.47953 18.7116 6.35951 18.6619 6.27102 18.5734C6.18253 18.4849 6.13281 18.3649 6.13281 18.2397C6.13281 18.1146 6.18253 17.9946 6.27102 17.9061C6.35951 17.8176 6.47953 17.7678 6.60468 17.7678H10.9024C11.0295 17.7666 11.1521 17.8154 11.2436 17.9036C11.3352 17.9919 11.3884 18.1126 11.3918 18.2397ZM10.7456 20.1964C10.7459 20.2585 10.7339 20.3199 10.7103 20.3773C10.6867 20.4347 10.652 20.4869 10.6081 20.5307C10.5642 20.5746 10.5121 20.6093 10.4547 20.633C10.3973 20.6566 10.3358 20.6686 10.2738 20.6683H7.25158C7.12643 20.6683 7.00642 20.6186 6.91793 20.5301C6.82943 20.4416 6.77972 20.3215 6.77972 20.1964C6.77972 20.0713 6.82943 19.9512 6.91793 19.8627C7.00642 19.7743 7.12643 19.7245 7.25158 19.7245H10.2738C10.3357 19.7243 10.3972 19.7364 10.4545 19.7601C10.5118 19.7837 10.5638 19.8185 10.6076 19.8623C10.6514 19.9062 10.6861 19.9583 10.7096 20.0157C10.7332 20.073 10.7452 20.1344 10.7448 20.1964H10.7456Z" fill="#E5E5E5"/>
                <path d="M12.3694 13.9068C13.1802 13.1732 13.749 12.2106 14.0003 11.1465C14.2517 10.0824 14.1738 8.96706 13.777 7.94822C13.3802 6.92937 12.6832 6.05514 11.7784 5.44133C10.8735 4.82753 9.80357 4.50313 8.71021 4.51113C7.61685 4.51913 6.55173 4.85914 5.65596 5.48611C4.76019 6.11308 4.07606 6.99742 3.69421 8.02196C3.31235 9.0465 3.25081 10.1629 3.51771 11.2232C3.78462 12.2835 4.36739 13.2377 5.1888 13.9593C6.045 14.8155 5.95748 16.6322 5.95748 16.6497C5.95993 16.7383 5.99059 16.8239 6.045 16.894C6.07674 16.9268 6.11468 16.953 6.15662 16.971C6.19855 16.989 6.24365 16.9985 6.2893 16.999H11.2362C11.2818 16.9985 11.3269 16.989 11.3689 16.971C11.4108 16.953 11.4488 16.9268 11.4805 16.894C11.511 16.8614 11.5345 16.8229 11.5495 16.7809C11.5646 16.7389 11.5709 16.6942 11.568 16.6497C11.568 16.6322 11.4805 14.8155 12.3367 13.9593C12.3519 13.9449 12.3694 13.9243 12.3694 13.9068ZM11.8801 13.47C11.8477 13.4906 11.8231 13.5214 11.81 13.5575C11.2009 14.3603 10.8807 15.3453 10.9013 16.3529H6.61808C6.63972 15.3131 6.29457 14.2989 5.64316 13.4882C5.04623 12.9675 4.58952 12.3054 4.3149 11.5624C4.04027 10.8194 3.95651 10.0194 4.07128 9.23563C4.18606 8.45187 4.4957 7.70946 4.97183 7.07642C5.44797 6.44339 6.07536 5.93997 6.79653 5.61231C7.51769 5.28465 8.30955 5.14322 9.09955 5.20099C9.88956 5.25876 10.6524 5.51387 11.3183 5.94295C11.9841 6.37204 12.5316 6.96137 12.9106 7.65694C13.2895 8.3525 13.4879 9.13206 13.4874 9.92417C13.4886 10.5957 13.3458 11.2596 13.0687 11.8713C12.7915 12.483 12.3857 13.0281 11.8801 13.47Z" fill="#210B20"/>
                <path d="M8.75426 5.90508C8.66625 5.90508 8.58185 5.94004 8.51962 6.00227C8.4574 6.0645 8.42244 6.1489 8.42244 6.23691C8.42244 6.32491 8.4574 6.40931 8.51962 6.47154C8.58185 6.53377 8.66625 6.56873 8.75426 6.56873C9.69468 6.56933 10.5964 6.94318 11.2614 7.60816C11.9264 8.27314 12.3002 9.17486 12.3008 10.1153C12.3008 10.2033 12.3358 10.2877 12.398 10.3499C12.4602 10.4121 12.5446 10.4471 12.6326 10.4471C12.7206 10.4471 12.805 10.4121 12.8673 10.3499C12.9295 10.2877 12.9645 10.2033 12.9645 10.1153C12.9639 8.99885 12.5201 7.92832 11.7306 7.13889C10.9412 6.34946 9.87069 5.90569 8.75426 5.90508ZM11.7224 18.2396C11.7227 18.134 11.7021 18.0294 11.6618 17.9317C11.6216 17.8341 11.5624 17.7453 11.4877 17.6707C11.413 17.596 11.3243 17.5368 11.2266 17.4965C11.129 17.4562 11.0243 17.4356 10.9187 17.4359H6.6035C6.49796 17.4359 6.39345 17.4567 6.29594 17.4971C6.19843 17.5375 6.10984 17.5967 6.03521 17.6713C5.96058 17.746 5.90138 17.8346 5.86099 17.9321C5.8206 18.0296 5.79982 18.1341 5.79982 18.2396C5.79982 18.3452 5.8206 18.4497 5.86099 18.5472C5.90138 18.6447 5.96058 18.7333 6.03521 18.8079C6.10984 18.8825 6.19843 18.9417 6.29594 18.9821C6.39345 19.0225 6.49796 19.0433 6.6035 19.0433H10.9012C11.0083 19.0456 11.1148 19.0266 11.2144 18.9872C11.314 18.9479 11.4048 18.8891 11.4814 18.8143C11.558 18.7394 11.6189 18.6501 11.6606 18.5514C11.7022 18.4527 11.7237 18.3467 11.7239 18.2396H11.7224ZM10.9012 18.3797H6.60502C6.56976 18.3771 6.53679 18.3612 6.51273 18.3353C6.48867 18.3094 6.4753 18.2754 6.4753 18.24C6.4753 18.2046 6.48867 18.1706 6.51273 18.1447C6.53679 18.1188 6.56976 18.103 6.60502 18.1003H10.9027C10.9212 18.1 10.9396 18.1035 10.9567 18.1104C10.9738 18.1173 10.9894 18.1276 11.0024 18.1407C11.0155 18.1537 11.0258 18.1693 11.0327 18.1864C11.0397 18.2036 11.0431 18.2219 11.0428 18.2404C11.0603 18.3271 10.9903 18.3797 10.9027 18.3797H10.9012ZM10.2726 19.3926H7.25116C7.03801 19.3926 6.83359 19.4773 6.68287 19.628C6.53215 19.7787 6.44748 19.9832 6.44748 20.1963C6.44748 20.4095 6.53215 20.6139 6.68287 20.7646C6.83359 20.9153 7.03801 21 7.25116 21H10.2733C10.379 21.0003 10.4836 20.9797 10.5813 20.9394C10.6789 20.8992 10.7676 20.84 10.8423 20.7653C10.917 20.6906 10.9762 20.6019 11.0165 20.5042C11.0567 20.4066 11.0773 20.3019 11.077 20.1963C11.0747 19.984 10.9893 19.7811 10.8393 19.6309C10.6892 19.4807 10.4864 19.3952 10.2741 19.3926H10.2726ZM10.2726 20.3363H7.25116C7.2159 20.3337 7.18294 20.3179 7.15887 20.292C7.13481 20.2661 7.12144 20.232 7.12144 20.1967C7.12144 20.1613 7.13481 20.1273 7.15887 20.1014C7.18294 20.0755 7.2159 20.0596 7.25116 20.057H10.2733C10.2918 20.0567 10.3102 20.0601 10.3273 20.0671C10.3444 20.074 10.36 20.0843 10.373 20.0974C10.3861 20.1104 10.3964 20.126 10.4033 20.1431C10.4103 20.1603 10.4137 20.1786 10.4134 20.1971C10.415 20.2158 10.4125 20.2346 10.4061 20.2522C10.3997 20.2699 10.3895 20.2859 10.3762 20.2992C10.3629 20.3124 10.3469 20.3226 10.3293 20.3291C10.3116 20.3355 10.2928 20.338 10.2741 20.3363H10.2726ZM9.08608 2.56859V0.331823C9.08608 0.243818 9.05112 0.159418 8.98889 0.0971888C8.92666 0.0349598 8.84227 0 8.75426 0C8.66625 0 8.58185 0.0349598 8.51962 0.0971888C8.4574 0.159418 8.42244 0.243818 8.42244 0.331823V2.58761C8.42244 2.67562 8.4574 2.76002 8.51962 2.82225C8.58185 2.88448 8.66625 2.91944 8.75426 2.91944C8.84403 2.9155 8.92878 2.87689 8.99067 2.81174C9.05256 2.74658 9.08676 2.65997 9.08608 2.57011V2.56859ZM14.2575 1.65988C14.1851 1.61173 14.0967 1.59392 14.0113 1.61029C13.9259 1.62666 13.8503 1.67589 13.8009 1.7474L12.5603 3.61657C12.5122 3.68897 12.4944 3.77738 12.5107 3.86278C12.5271 3.94818 12.5763 4.02374 12.6479 4.07321C12.7003 4.10649 12.7608 4.12466 12.8229 4.12572C12.8769 4.12454 12.93 4.11136 12.9783 4.08714C13.0266 4.06292 13.0689 4.02827 13.1022 3.98568L14.3427 2.11651C14.3901 2.04388 14.4075 1.9557 14.3911 1.87053C14.3748 1.78536 14.3261 1.70985 14.2552 1.65988H14.2575ZM4.80587 4.05342C4.86461 4.05249 4.92205 4.03605 4.97239 4.00577C5.02274 3.97549 5.06418 3.93245 5.09254 3.881C5.12089 3.82955 5.13514 3.77152 5.13384 3.71278C5.13255 3.65405 5.11577 3.59671 5.08518 3.54655L3.87965 1.65988C3.85672 1.62315 3.82677 1.5913 3.79152 1.56614C3.75628 1.54098 3.71642 1.52302 3.67423 1.51326C3.63204 1.50351 3.58834 1.50216 3.54563 1.5093C3.50292 1.51644 3.46203 1.53191 3.4253 1.55485C3.38857 1.57779 3.35672 1.60773 3.33156 1.64298C3.30641 1.67823 3.28844 1.71809 3.27869 1.76028C3.26893 1.80247 3.26759 1.84617 3.27472 1.88888C3.28186 1.93159 3.29734 1.97248 3.32027 2.0092L4.5258 3.89588C4.55551 3.94336 4.59663 3.98265 4.64542 4.01016C4.6942 4.03768 4.74986 4.05255 4.80587 4.05342ZM0.175564 5.62577L2.14976 6.69126C2.19722 6.71938 2.2524 6.73164 2.3073 6.72627C2.36746 6.72424 2.42616 6.70715 2.47801 6.67657C2.52986 6.64599 2.57322 6.60289 2.60411 6.55123C2.62615 6.51233 2.64002 6.46935 2.64488 6.42491C2.64974 6.38047 2.64549 6.33551 2.63238 6.29277C2.61928 6.25003 2.59759 6.21041 2.56865 6.17633C2.53971 6.14226 2.50413 6.11444 2.46408 6.09459L0.489881 5.0291C0.450985 5.00706 0.408004 4.99319 0.363565 4.98833C0.319125 4.98347 0.274162 4.98772 0.231422 5.00083C0.188682 5.01394 0.149062 5.03562 0.114988 5.06456C0.0809134 5.0935 0.0530999 5.12908 0.0332447 5.16914C-0.00410589 5.24931 -0.0102197 5.34053 0.0160983 5.42498C0.0424163 5.50942 0.0992752 5.58102 0.175564 5.62577ZM15.2005 6.74377C15.2545 6.74054 15.3077 6.72872 15.358 6.70877L17.3322 5.64328C17.4078 5.59988 17.4637 5.5288 17.4879 5.44503C17.5122 5.36125 17.5029 5.27134 17.4622 5.19424C17.4214 5.11715 17.3523 5.0589 17.2694 5.03178C17.1865 5.00466 17.0963 5.0108 17.0179 5.04889L15.0437 6.11438C14.9774 6.14908 14.9247 6.20506 14.8941 6.27332C14.8635 6.34158 14.8568 6.41815 14.875 6.49071C14.8932 6.56327 14.9352 6.62761 14.9944 6.67337C15.0536 6.71913 15.1264 6.74366 15.2012 6.74301L15.2005 6.74377Z" fill="#210B20"/>
              </svg>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                ملاحظة: يجب على المودل الالتزام بالبدلة السمراء
              </p>
            </div>

            {/* Book Now Button */}
            <div className="flex justify-end">
              <PrimaryButton
                onClick={handleNext}
                disabled={
                  !bookingData.date ||
                  !bookingData.time ||
                  !bookingData.serviceId ||
                  !(Array.isArray(services) && services.length > 0)
                }
                className="w-1/3 py-4"
              >
                احجز الآن
              </PrimaryButton>
            </div>
          </div>
        ) : step === 2 ? (
          // Step 2: Complete Payment
          <div className="space-y-6">
            {/* Title */}
            <h2 className="text-xl sm:text-2xl font-bold text-center text-[#E6A525]">
              إتمام الدفع
            </h2>
            {apiError ? (
              <div className="border border-red-300 bg-red-50 dark:bg-red-900/30 dark:border-red-700 text-red-700 dark:text-red-300 text-sm rounded-lg p-3">
                {apiError}
              </div>
            ) : null}

            {/* Booking Info and Photographer Info - Side by Side */}
            <div className="flex flex-col gap-4 md:flex-row">
              {/* General Booking Information */}
              <div className="flex-1 space-y-3 min-w-0">
                <div className="rounded-lg p-4 space-y-3 shadow-md border border-gray-200 dark:border-[#1C1C1D] dark:bg-[#1C1C1D]">
                  {/* Header with Status - First Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <h3 className="text-sm sm:text-base font-semibold text-gray-800 dark:text-white">
                      معلومات عامة عن الحجز
                    </h3>
                    <span className="text-xs sm:text-sm text-[#E6A525] font-medium bg-[#E6A525]/10 px-2 sm:px-3 py-1 rounded-lg whitespace-nowrap">
                      قيد الانتظار
                    </span>
                  </div>

                  {/* Appointment Number - Second Row */}
                  <div className="text-xs sm:text-sm text-gray-700 dark:text-gray-300 break-all">
                    {bookingId || "—"}
                  </div>

                  {/* Date, Time, Duration and Price - Side by Side */}
                  <div className="flex flex-col sm:flex-row gap-4 items-start">
                    {/* Date, Time, Duration - Right Section */}
                    <div className="space-y-2 text-xs sm:text-sm flex-1 min-w-0">
                      <p className="text-gray-700 dark:text-gray-300 break-words">
                        تاريخ الحجز : {bookingData.date}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300 break-words">
                        وقت الحجز : {bookingData.time || "--:--"}
                      </p>
                      <p className="text-gray-700 dark:text-gray-300">
                        المدة: 60 دقيقة
                      </p>
                    </div>

                    {/* Total Price - Left Section (RTL: Right) */}
                    <div className="flex flex-col items-start sm:items-start md:translate-y-0 lg:translate-y-7">
                      <p className="text-xs text-gray-600 mb-1 dark:text-gray-100">
                        المبلغ الاجمالي
                      </p>
                      <p className="text-lg sm:text-xl font-bold text-[#E6A525]">
                        {currentServicePriceNumber != null
                          ? currentServicePriceNumber
                          : "-"}{" "}
                        <span className="text-gray-700 text-base sm:text-lg">
                          ر.س
                        </span>
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Photographer Information */}
              <div className="flex-1 space-y-3 min-w-0">
                <h3 className="text-sm sm:text-base font-semibold text-descriptive dark:text-white">
                  معلومات المصور
                </h3>
                <div className="rounded-lg p-3 sm:p-4 flex flex-col sm:flex-row items-center gap-3 sm:gap-4 w-full border-2 border-gray-200 dark:border-[#1C1C1D] dark:bg-[#1C1C1D]">
                  <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden border-4 border-background shadow-lg flex-shrink-0">
                    <Image
                      src={provider?.profile_picture_url || "/user/profile.jpg"}
                      alt={provider?.name || "profile"}
                      width={64}
                      height={64}
                      className="object-cover w-full h-full"
                    />
                  </div>
                  <div className="flex-1 space-y-1 min-w-0">
                    <p className="text-sm sm:text-base md:text-lg font-bold text-foreground dark:text-white text-center sm:text-right">
                      {provider?.name || ""}
                    </p>
                    <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 text-center sm:text-right">
                      {provider?.years_of_experience != null
                        ? `عدد سنوات الخبرة: ${provider.years_of_experience} سنوات`
                        : ""}
                    </p>
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-amber-700">
                        {provider?.average_rating ?? "0.0"}
                      </span>
                      <div className="flex gap-0.5">
                        {[...Array(5)].map((_, i) => (
                          <span
                            key={i}
                            className={`text-xs sm:text-sm ${i <
                              Math.round(Number(provider?.average_rating || 0))
                              ? "text-amber-400"
                              : "text-gray-300 dark:text-gray-600"
                              }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                  <PrimaryButton
                    onClick={() =>
                      router.push(`/provider-details/${provider?.id}`)
                    }
                    className="text-xs px-2 sm:px-3 py-2 sm:py-3 h-auto flex-shrink-0 rounded-lg w-full sm:w-auto"
                  >
                    عرض الملف الشخصي
                  </PrimaryButton>
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-semibold text-descriptive dark:text-white">
                اختر طريقة الدفع
              </h3>

              {/* Payment Methods Grid - 2 Columns */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = bookingData.paymentMethod === method.id;

                  return (
                    <label
                      key={method.id}
                      className={cn(
                        "flex items-center gap-3 p-4 rounded-lg cursor-pointer transition-colors",
                        isSelected
                          ? "bg-[#E6A525]/10 border-2 border-[#E6A525] "
                          : "bg-gray-100 dark:bg-[#1C1C1D] border-2 border-transparent hover:border-gray-300 dark:hover:border-[#363636]"
                      )}
                    >
                      {Icon && (
                        <Icon className={`w-5 h-5 flex-shrink-0 `} currentColor={isSelected ? "#E6A525" : "#9b9b9b"} />
                      )}

                      <span
                        className={cn(
                          "text-sm font-medium dark:text-white flex-1"
                        )}
                      >
                        {method.name}
                      </span>
                      <div className="relative h-5 flex-shrink-0">
                        <input
                          type="radio"
                          name="paymentMethod"
                          value={method.id}
                          checked={isSelected}
                          onChange={(e) =>
                            handleInputChange("paymentMethod", e.target.value)
                          }
                          className={cn(
                            "appearance-none w-5 h-5 rounded-full border-2 transition-all cursor-pointer",
                            isSelected
                              ? "bg-[#E6A525] border-[#E6A525]"
                              : "bg-white dark:bg-[#1C1C1D] border-gray-300 dark:border-gray-500"
                          )}
                        />
                        {isSelected && (
                          <div className="absolute top-1/2 left-0 -translate-y-1/2 w-5 h-5 bg-[#E6A525] rounded-full flex items-center justify-center pointer-events-none">
                            <svg
                              className="w-3 h-3 text-white"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={3}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          </div>
                        )}
                      </div>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Payment Button */}
            <div className="flex justify-between gap-3">
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-3 text-sm sm:text-base rounded-lg border border-gray-300 dark:border-[#363636] dark:bg-[#363636] dark:text-white hover:bg-gray-50 dark:hover:bg-[#363636]"
              >
                رجوع
              </button>
              <PrimaryButton
                onClick={handleSubmit}
                disabled={
                  isSubmitting ||
                  !bookingData.date ||
                  !bookingData.time ||
                  !bookingData.serviceId ||
                  !(Array.isArray(services) && services.length > 0)
                }
                className="w-full sm:w-1/2 md:w-1/3 py-3 sm:py-4 text-sm sm:text-base"
              >
                <span>
                  {isSubmitting
                    ? "جاري المعالجة..."
                    : `ادفع ${currentServicePriceNumber != null
                      ? currentServicePriceNumber
                      : "-"
                    } ر.س`}
                </span>
                <ArrowRight className="w-4 h-4" />
              </PrimaryButton>
            </div>
          </div>
        ) : (
          // Step 3: Success
          <div className="space-y-6">
            <h2 className="text-xl sm:text-2xl font-bold text-center text-[#E6A525]">
              تم الحجز بنجاح
            </h2>
            <div className="rounded-lg p-4 shadow-md border border-gray-200 dark:border-[#363636] dark:bg-[#363636] space-y-3">
              <p className="text-sm text-gray-800 dark:text-gray-300">
                {successMessage ||
                  "Booking details saved successfully. Booking is pending approval."}
              </p>
              <p className="text-sm text-gray-700 dark:text-gray-300">
                رقم الحجز:{" "}
                <span className="font-semibold">{bookingId || "—"}</span>
              </p>
            </div>
            <div className="flex justify-end">
              <PrimaryButton onClick={handleClose} className="w-1/3 py-3">
                إغلاق
              </PrimaryButton>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
