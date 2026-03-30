"use client";

import { useState, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { Upload, X } from "lucide-react";
import Image from "next/image";
import api from "@/lib/api";
import { toast } from "sonner";

export default function UploadStoryDialog({ open, onOpenChange, onSuccess }) {
  const locale = useLocale();
  const t = useTranslations("ArtistHome");
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type (images and videos)
    if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) {
      toast.error(
        locale === "en"
          ? "Please select an image or video file"
          : "يرجى اختيار ملف صورة أو فيديو"
      );
      return;
    }

    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast.error(
        locale === "en"
          ? "File size should be less than 10MB"
          : "يجب أن يكون حجم الملف أقل من 10 ميجابايت"
      );
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setPreviewUrl(e.target.result);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      toast.error(locale === "en" ? "Please select a file" : "يرجى اختيار ملف");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("media", selectedFile);

      const response = await api.post("/artist/stories", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.status ==="success") {
        toast.success(
          locale === "en"
            ? "Story uploaded successfully!"
            : "تم رفع القصة بنجاح!"
        );
        setSelectedFile(null);
        setPreviewUrl(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response.data.message || "Upload failed");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        (locale === "en"
          ? "Failed to upload story. Please try again."
          : "فشل رفع القصة. يرجى المحاولة مرة أخرى.");
      toast.error(errorMessage);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    if (!isUploading) {
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {t("upload-story") ||
              (locale === "en" ? "Upload Story" : "رفع قصة")}
          </DialogTitle>
          <DialogDescription>
            {t("upload-story-description") ||
              (locale === "en"
                ? "Select an image or video to share as a story"
                : "اختر صورة أو فيديو لمشاركته كقصة")}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* File Input */}
          <div className="space-y-2">
            <label
              htmlFor="story-file"
              className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
            >
              {previewUrl ? (
                <div className="relative w-full h-full rounded-lg overflow-hidden">
                  {selectedFile?.type.startsWith("image/") ? (
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      fill
                      className="object-contain"
                    />
                  ) : (
                    <video
                      src={previewUrl}
                      className="w-full h-full object-contain"
                      controls
                    />
                  )}
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleRemoveFile();
                    }}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
                    <span className="font-semibold">
                      {locale === "en" ? "Click to upload" : "انقر للرفع"}
                    </span>{" "}
                    {locale === "en" ? "or drag and drop" : "أو اسحب وأفلت"}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {locale === "en"
                      ? "PNG, JPG, MP4 (MAX. 10MB)"
                      : "PNG, JPG, MP4 (حد أقصى 10 ميجابايت)"}
                  </p>
                </div>
              )}
              <input
                id="story-file"
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*,video/*"
                onChange={handleFileSelect}
                disabled={isUploading}
              />
            </label>
          </div>
        </div>

        <DialogFooter>
          <button
            onClick={handleClose}
            disabled={isUploading}
            className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-[#363636] border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {locale === "en" ? "Cancel" : "إلغاء"}
          </button>
          <PrimaryButton
            onClick={handleUpload}
            disabled={!selectedFile || isUploading}
          >
            {isUploading
              ? locale === "en"
                ? "Uploading..."
                : "جاري الرفع..."
              : t("upload") || (locale === "en" ? "Upload" : "رفع")}
          </PrimaryButton>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
