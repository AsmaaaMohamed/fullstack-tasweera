"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import ServiceCard from "./ServiceCard";
import AddService from "./AddService";
import ServiceDetailsModal from "./ServiceDetailsModal";
import { deleteArtistService } from "@/lib/artist-services";

export default function MyServicesClient({ services }) {
  const t = useTranslations("MyServices");
  const locale = useLocale();
  const router = useRouter();
  const [isAddServiceOpen, setIsAddServiceOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedServiceId, setSelectedServiceId] = useState(null);
  const [deletingServiceId, setDeletingServiceId] = useState(null);

  const handleViewService = (id) => {
    setSelectedServiceId(id);
    setIsDetailsModalOpen(true);
  };

  const handleDeleteService = async (id) => {
    // Confirm deletion
    const confirmMessage =
      locale === "en"
        ? "Are you sure you want to delete this service?"
        : "هل أنت متأكد من حذف هذه الخدمة؟";

    if (!window.confirm(confirmMessage)) {
      return;
    }

    setDeletingServiceId(id);
    try {
      const response = await deleteArtistService(id);

      if (response?.status === "success") {
        toast.success(
          locale === "en"
            ? "Service deleted successfully!"
            : "تم حذف الخدمة بنجاح!"
        );
        // Refresh the page to update the services list
        router.refresh();
      } else {
        throw new Error(response?.message || "Failed to delete service");
      }
    } catch (error) {
      console.error("Error deleting service:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (locale === "en"
          ? "Failed to delete service. Please try again."
          : "فشل حذف الخدمة. يرجى المحاولة مرة أخرى.");
      toast.error(errorMessage);
    } finally {
      setDeletingServiceId(null);
    }
  };

  const handleAddService = () => {
    setIsAddServiceOpen(true);
  };

  const handleServiceAdded = (serviceData) => {
    // Refresh the page to show the new service
    router.refresh();
  };

  const handleServiceUpdated = () => {
    // Refresh the page after service update
    router.refresh();
  };

  return (
    <>
      {/* Header Section */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
          {t("all-services")}
        </h1>
        <Button
          onClick={handleAddService}
          variant="outline"
          className="border-main dark:border-main border-2 text-main hover:bg-main/10 rounded-lg px-4 py-2 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          {t("add-another-service")}
        </Button>
      </div>

      {/* Services Grid or Empty State */}
      {services.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              title={service.title}
              price={service.price}
              image={service.image}
              requests={service.requests}
              onView={() => handleViewService(service.id)}
              onDelete={() => handleDeleteService(service.id)}
              isDeleting={deletingServiceId === service.id}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="text-center max-w-md mx-auto">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200 mb-4">
              {locale === "en" ? "No Services" : "لا يوجد خدمات"}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              {locale === "en" ? "No services found" : "لا يوجد خدمات"}
            </p>
            <Button
              onClick={handleAddService}
              className="bg-main hover:bg-main/90 text-white font-medium py-2 px-6 rounded-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              {locale === "en" ? "Add Service" : "إضافة خدمة"}
            </Button>
          </div>
        </div>
      )}

      {/* Add Service Modal */}
      <AddService
        open={isAddServiceOpen}
        onOpenChange={setIsAddServiceOpen}
        onSuccess={handleServiceAdded}
      />

      {/* Service Details Modal */}
      <ServiceDetailsModal
        open={isDetailsModalOpen}
        onOpenChange={setIsDetailsModalOpen}
        serviceId={selectedServiceId}
        onSuccess={handleServiceUpdated}
      />
    </>
  );
}
