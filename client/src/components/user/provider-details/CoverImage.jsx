"use client";

import Image from "next/image";
import { useState, useRef } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import api from "@/lib/api";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function CoverImage({ coverUrl, isOwnProfile = false }) {
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(coverUrl);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const fileInputRef = useRef(null);
  const locale = useLocale();

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);

    // Upload
    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("cover_photo", file);

      // Use the artist profile upload endpoint
      const response = await api.post(
        "/artist-profile/uploadImages",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      if (response.data.status === "success") {
        toast.success("Cover photo updated successfully");
      } else {
        throw new Error(
          response.data.message || "Failed to update cover photo"
        );
      }
    } catch (error) {
      console.error("Error updating cover photo:", error);
      toast.error(
        error.response?.data?.message || "Failed to update cover photo"
      );
      // Revert preview if failed
      setPreviewUrl(coverUrl);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleImageClick = () => {
    setIsModalOpen(true);
  };

  return (
    <>
      <div className="relative w-full h-48 md:h-64 lg:h-50 bg-muted overflow-hidden group">
        <div
          onClick={handleImageClick}
          className="cursor-pointer w-full h-full"
        >
          <Image
            src={previewUrl || "/user/cover.jpg"}
            alt="Provider cover"
            fill
            className="object-cover object-center"
            priority
          />
        </div>

        {isOwnProfile && (
          <>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />
            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center z-10 pointer-events-none">
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerFileInput();
                }}
                disabled={isUploading}
                className="bg-white/20 backdrop-blur-sm p-3 rounded-full hover:bg-white/30 transition-colors pointer-events-auto"
              >
                {isUploading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <div className="flex items-center gap-2 text-white font-medium px-2">
                    <Image
                      src="/user/profile/sidebar/camera.svg"
                      alt="upload"
                      width={24}
                      height={24}
                      className="brightness-0 invert"
                    />
                    <span>
                      {locale === "ar" ? "تغيير صورة الغلاف" : "Change Cover"}
                    </span>
                  </div>
                )}
              </button>
            </div>
          </>
        )}
      </div>

      {/* Modal for viewing cover image */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-4xl w-full dark:bg-[#363636] dark:border-[#363636]">
          <div className="relative w-full">
            <Image
              src={previewUrl || "/user/cover.jpg"}
              alt="Cover image preview"
              width={1200}
              height={400}
              className="w-full h-auto rounded-lg object-cover"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
