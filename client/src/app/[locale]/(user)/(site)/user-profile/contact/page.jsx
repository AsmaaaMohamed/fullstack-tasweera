"use client";

import PrimaryButton from "@/components/shared/PrimaryButton";
import PrimaryInput from "@/components/shared/PrimaryInput";
import api from "@/lib/api";
import { useLocale } from "next-intl";
import Image from "next/image";
import { useState } from "react";

export default function ContactPage() {
  const locale = useLocale();
  const [formData, setFormData] = useState({
    name: "",
    subject: "",
    phone: "",
    message: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      !formData.name ||
      !formData.phone ||
      !formData.subject ||
      !formData.message
    ) {
      setError("Please fill in all fields");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await api.post(`/contact?lang=${locale}`, {
        name: formData.name,
        phone: formData.phone,
        subject: formData.subject,
        message: formData.message,
      });

      if (response.data.status === "success") {
        setSubmitted(true);
        setFormData({ name: "", phone: "", subject: "", message: "" });
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError(response.data.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Error sending message:", error);
      setError(
        error.response?.data?.message ||
          "An error occurred while sending your message"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white rounded-2xl p-6 dark:bg-transparent">
        {/* Header */}
        <h1 className="text-center text-lg font-medium text-gray-800 mb-3 dark:text-white">
          {locale === "ar" ? "تواصل معنا" : "Contact Us"}
        </h1>
        {submitted && (
          <div className="mb-6 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
            {locale === "ar"
              ? "تم إرسال رسالتك بنجاح. سنتواصل معك قريباً."
              : "Your message has been sent successfully. We'll contact you soon."}
          </div>
        )}
        {error && (
          <div className="mb-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
            {error}
          </div>
        )}
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name Field */}
          <div className="space-y-2">
            <label className="block text-black font-medium text-sm dark:text-white">
              {locale === "ar" ? "الاسم" : "Name"}
            </label>
            <PrimaryInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="ادخل اسمك هنا"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:outline-none focus:border-transparent placeholder:text-descriptive"
              icon={
                <Image
                  src="/auth/icons/user.svg"
                  alt="User"
                  width={18}
                  height={18}
                />
              }
              required
              iconContainerClasses="start-2"
            />
          </div>

          {/* Subject Field */}
          <div className="space-y-2">
            <label className="block text-black font-medium text-sm dark:text-white">
              {locale === "ar" ? "عنوان الموضوع" : "Subject"}
            </label>
            <PrimaryInput
              type="text"
              name="subject"
              value={formData.subject}
              onChange={handleChange}
              placeholder={
                locale === "ar" ? "ادخل عنوان الموضوع" : "Enter subject"
              }
              className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:outline-none focus:border-transparent placeholder:text-descriptive"
              required
            />
          </div>

          {/* Phone Field */}
          <div className="space-y-2">
            <label className="block text-black font-medium text-sm dark:text-white">
              {locale === "ar" ? "رقم الهاتف" : "Phone Number"}
            </label>

            <PrimaryInput
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg  focus:outline-none focus:border-transparent placeholder:text-descriptive"
              required
              icon={
                <Image
                  src="/auth/icons/phone.svg"
                  alt="Phone"
                  width={18}
                  height={18}
                />
              }
              isPhone
              dir={locale === "ar" ? "rtl" : "ltr"}
              iconContainerClasses="start-1"
            />
          </div>

          {/* Message Field */}
          <div className="space-y-2">
            <label className="block text-black font-medium text-sm dark:text-white">
              {locale === "ar" ? "الرسالة" : "Message"}
            </label>
            <textarea
              name="message"
              value={formData.message}
              onChange={handleChange}
              placeholder={
                locale === "ar"
                  ? "اكتب رسالتك هنا..."
                  : "Write your message here..."
              }
              required
              rows={4}
              className="w-full px-4 py-3 border border-gray-500 dark:border-gray-500 rounded-lg dark:bg-[#363636] dark:text-white  focus:outline-none focus:ring-2 focus:main focus:border-transparent placeholder:text-descriptive dark:placeholder:text-gray-400 placeholder:text-sm resize-none"
            />
          </div>

          {/* Success Message */}
          {/* {submitted && (
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg text-center text-green-700 font-semibold">
              {locale === "ar" ? "تم إرسال رسالتك بنجاح! شكراً لتواصلك معنا." : "Your message has been sent successfully. Thank you for your message."}
            </div>
          )} */}

          {/* Submit Button */}
          <PrimaryButton
            type="submit"
            disabled={isSubmitting}
            className="w-[232px] h-[56px] py-3 px-6 text-white font-semibold rounded-lg transition duration-200 mx-auto flex"
          >
            {isSubmitting ? "جاري الإرسال..." : "ارسال"}
          </PrimaryButton>
        </form>
      </div>
    </div>
  );
}
