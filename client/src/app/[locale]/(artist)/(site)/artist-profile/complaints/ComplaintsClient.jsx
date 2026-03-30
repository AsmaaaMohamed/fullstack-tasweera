"use client";

import { Card } from "@/components/ui/card";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { useRouter } from "@/i18n/navigation";
import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrimaryButton from "@/components/shared/PrimaryButton";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function ComplaintsClient({ complaints }) {
  const router = useRouter();
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const locale = useLocale();
  const handleCardClick = (complaint) => {
    setSelectedComplaint(complaint);
    setIsModalOpen(true);
  };

  const handleSendReply = async () => {
    if (!replyText.trim()) {
      toast.error("الرجاء كتابة رد قبل الإرسال");
      return;
    }

    setIsLoading(true);
    try {
      const token = Cookies.get("auth_token");
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/artist/complaints/${selectedComplaint.id}`,
        { reply_text: replyText },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("تم إرسال الرد بنجاح");
        setReplyText("");
        setIsModalOpen(false);
        router.refresh();
      } else {
        toast.error(response.data.message || "حدث خطأ أثناء إرسال الرد");
      }
    } catch (error) {
      console.error("Error sending reply:", error);
      toast.error("فشل إرسال الرد، يرجى المحاولة مرة أخرى");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white p-6 dark:bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-center mb-6 -mt">
          <h1 className="text-lg font-medium text-gray-900  dark:text-white">
            {locale === "ar" ? "الشكاوى" : "Complaints"}
          </h1>
        </div>

        {/* Complaints Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {complaints.length === 0 ? (
            <div className="col-span-full text-center py-12">
              <p className="text-gray-500 text-lg">
                {locale === "ar" ? "لا توجد شكاوى" : "No complaints"}
              </p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <div
                key={complaint.id}
                onClick={() => handleCardClick(complaint)}
                className="cursor-pointer"
              >
                <Card className="p-3 border border-[#C5C5C5] dark:border-gray-500 bg-[#F5F5F5] dark:bg-[#363636] hover:shadow-md transition-shadow rounded-[12px]">
                  <div className="flex items-start justify-between gap-4">
                    <Avatar className="w-[59px] h-[59px] flex-shrink-0 rounded-full">
                      <AvatarImage
                        src={
                          complaint.artist_photo ||
                          "/user/profile/default-user.jpg"
                        }
                        alt="user"
                        className="w-full h-full object-cover rounded-full"
                      />
                    </Avatar>
                    <div className="flex-1">
                      <p className="text-black text-base dark:text-white">
                        {complaint.title}
                      </p>
                      <p className="text-descriptive text-sm dark:text-white">
                        {complaint.complaint_code}
                      </p>
                      <div className="inline-block">
                        <span className="text-teal-600 text-xs font-semibold dark:text-white">
                          {complaint.status}
                        </span>
                      </div>
                    </div>
                  </div>
                </Card>
              </div>
            ))
          )}
        </div>

        {/* Complaint Modal */}
        <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
          <DialogContent className="sm:max-w-[500px] bg-white dark:bg-[#1E1E1E] border-none">
            <DialogHeader>
              <DialogTitle className="text-center text-xl font-bold dark:text-white">
                {locale === "ar" ? "تفاصيل الشكوى" : "Complaint Details"}
              </DialogTitle>
            </DialogHeader>
            {selectedComplaint && (
              <div className="flex flex-col gap-4 mt-4">
                {/* Complaint Info */}
                <div className="flex items-center gap-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage
                      src={
                        selectedComplaint.artist_photo ||
                        "/user/profile/default-user.jpg"
                      }
                      alt="user"
                    />
                  </Avatar>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {selectedComplaint.title}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {selectedComplaint.complaint_code}
                    </p>
                  </div>
                  <div className="mr-auto">
                    <span className="px-2 py-1 text-xs rounded-full bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-100">
                      {selectedComplaint.status}
                    </span>
                  </div>
                </div>

                {/* Description if available (assuming 'description' field exists, or using title as placeholder) */}
                <div className="bg-gray-50 dark:bg-[#2A2A2A] p-3 rounded-lg">
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {selectedComplaint.description ||
                      "لا يوجد وصف إضافي للشكوى."}
                  </p>
                </div>

                {/* Reply Section */}
                <div className="flex flex-col gap-2">
                  <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    {locale === "ar" ? "رد على الشكوى" : "Complaint Reply"}
                  </label>
                  <textarea
                    className="w-full min-h-[100px] p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#2A2A2A] text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-main resize-none"
                    placeholder={
                      locale === "ar"
                        ? "اكتب ردك الرسمي وسيتم إرساله للعميل فورًا......"
                        : "Write your official reply and it will be sent to the customer immediately..."
                    }
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    disabled={isLoading}
                  />
                </div>

                <div className="flex justify-end mt-2">
                  <PrimaryButton
                    onClick={handleSendReply}
                    className="md:w-1/2 md:mx-auto"
                    disabled={isLoading}
                  >
                    {isLoading
                      ? locale === "ar"
                        ? "جاري الإرسال..."
                        : "Sending..."
                      : locale === "ar"
                      ? "إرسال الرد"
                      : "Send Reply"}
                  </PrimaryButton>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
