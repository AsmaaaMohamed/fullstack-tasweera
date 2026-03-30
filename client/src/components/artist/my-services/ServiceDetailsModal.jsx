"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { getArtistServiceById } from "@/lib/artist-services";
import { cn } from "@/lib/utils";
import ServiceDetailsTab from "./ServiceDetailsTab";
import ServiceRequestsTab from "./ServiceRequestsTab";
import ServiceChatsTab from "./ServiceChatsTab";

export default function ServiceDetailsModal({
  open,
  onOpenChange,
  serviceId,
  onSuccess,
}) {
  const locale = useLocale();
  const t = useTranslations("MyServices");
  const isRTL = locale === "ar";
  const [activeTab, setActiveTab] = useState("details");
  const [serviceData, setServiceData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (open && serviceId) {
      fetchServiceData();
    }
  }, [open, serviceId]);

  const fetchServiceData = async () => {
    if (!serviceId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await getArtistServiceById(serviceId);
      if (response?.status === "success" && response?.data) {
        setServiceData(response.data);
      } else {
        setError("Failed to load service data");
      }
    } catch (err) {
      console.error("Error fetching service:", err);
      setError("Failed to load service data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    setServiceData(null);
    setError(null);
    setActiveTab("details");
    onOpenChange(false);
  };

  const handleUpdateSuccess = () => {
    fetchServiceData(); // Refresh data after update
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto p-4 sm:p-6">
        <DialogHeader>
          <DialogTitle className="text-xl sm:text-2xl text-main text-center font-semibold">
            {t("service-details")}
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-gray-500 dark:text-gray-400">
              {locale === "en" ? "Loading..." : "جاري التحميل..."}
            </p>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center py-8">
            <p className="text-red-500">{error}</p>
          </div>
        ) : serviceData ? (
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
            dir={isRTL ? "rtl" : "ltr"}
          >
            <TabsList
              className={cn(
                "w-full grid grid-cols-3 h-auto items-center justify-center rounded-lg p-1 mb-4 gap-1 sm:gap-2 bg-muted",
                isRTL ? "mr-0 ml-auto" : "ml-0 mr-auto"
              )}
            >
              <TabsTrigger
                value="details"
                className="text-xs sm:text-sm w-full py-1.5 h-8 sm:h-9"
              >
                {t("service-details")}
              </TabsTrigger>
              <TabsTrigger
                value="requests"
                className="text-xs sm:text-sm w-full py-1.5 h-8 sm:h-9"
              >
                {t("service-requests")}
              </TabsTrigger>
              <TabsTrigger
                value="chats"
                className="text-xs sm:text-sm w-full py-1.5 h-8 sm:h-9"
              >
                {t("service-chats")}
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details" className="mt-0">
              <ServiceDetailsTab
                serviceData={serviceData}
                onUpdateSuccess={handleUpdateSuccess}
              />
            </TabsContent>

            <TabsContent value="requests" className="mt-0">
              <ServiceRequestsTab bookings={serviceData.bookings || []} />
            </TabsContent>

            <TabsContent value="chats" className="mt-0">
              <ServiceChatsTab serviceId={serviceId} />
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
