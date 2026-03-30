"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage } from "@/components/ui/avatar";
import { SquarePlus } from "lucide-react";
import { useRouter } from "@/i18n/navigation";
import { useLocale } from "next-intl";

export default function ComplaintsClient({ complaints }) {
  const router = useRouter();
  const locale = useLocale();
  return (
    <div className="bg-white p-6 dark:bg-transparent">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <Button
          variant="outline"
          className="flex items-center gap-2 border border-darker bg-white text-darker text-xs hover:bg-gray-50 hover:text-darker rounded-sm !px-5 py-2 font-medium dark:text-white"
          onClick={() => {
            router.push("/user-profile/complaints/add-complaint");
          }}
        >
          <span>{locale === "ar" ? "اضافة شكوى" : "Add Complaint"}</span>
          <SquarePlus className="w-4 h-4" />
        </Button>
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
                {locale === "ar" ? "لا توجد شكاوى" : "No Complaints"}
              </p>
            </div>
          ) : (
            complaints.map((complaint) => (
              <Card
                key={complaint.id}
                className="p-3 border border-[#C5C5C5] dark:border-gray-500 bg-[#F5F5F5] dark:bg-[#363636] hover:shadow-md transition-shadow rounded-[12px]"
              >
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
            ))
          )}
        </div>
      </div>
    </div>
  );
}
