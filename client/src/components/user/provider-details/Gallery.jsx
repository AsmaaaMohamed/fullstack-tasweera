"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ZoomIn,
  ChevronLeft,
  ChevronRight,
  Trash2,
  Plus,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { toast } from "sonner";
import { useLocale } from "next-intl";

export default function Gallery({ photos = [], isOwnProfile = false }) {
  const [selectedImageIndex, setSelectedImageIndex] = useState(null);
  const [galleryPhotos, setGalleryPhotos] = useState(photos);
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [photoToDelete, setPhotoToDelete] = useState(null);
  const fileInputRef = useRef(null);
  const locale = useLocale();

  useEffect(() => {
    setGalleryPhotos(photos);
  }, [photos]);

  // Handle keyboard navigation
  useEffect(() => {
    if (selectedImageIndex === null) return;

    const handleKeyDown = (e) => {
      if (e.key === "ArrowLeft") {
        handlePrevious();
      } else if (e.key === "ArrowRight") {
        handleNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedImageIndex, galleryPhotos.length]);

  const handlePrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedImageIndex < galleryPhotos.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };

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

    setIsUploading(true);
    try {
      const formData = new FormData();
      // Using array notation as per signup flow
      formData.append("gallery_photos[]", file);

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
        toast.success("Photo added to gallery");
        // Ideally the backend returns the new photo object.
        // If not, we might need to reload or fetch the gallery.
        // For now, we'll try to use the response data if available, or just reload the page.
        // Assuming response might contain the new photos or we just refresh.
        // Since we can't easily refresh server data from here without a callback,
        // we'll optimistically add it if we had the URL, but we don't.
        // Let's reload the window for now to fetch fresh data, or if the user provided an onUpdate prop we could use it.
        // Given the constraints, a reload is safest to get the correct ID and URL.
        window.location.reload();
      } else {
        throw new Error(response.data.message || "Failed to upload photo");
      }
    } catch (error) {
      console.error("Error uploading photo:", error);
      toast.error(error.response?.data?.message || "Failed to upload photo");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeletePhoto = (e, photoId) => {
    e.stopPropagation(); // Prevent opening the lightbox
    setPhotoToDelete(photoId);
  };

  const confirmDelete = async () => {
    if (!photoToDelete) return;

    setDeletingId(photoToDelete);
    try {
      // Use DELETE method with the specific endpoint
      const response = await api.delete(
        `/artist-profile/deleteGalleryImage/${photoToDelete}`
      );

      if (response.data.status === "success") {
        toast.success("Photo deleted");
        // Remove from local state
        setGalleryPhotos((prev) => prev.filter((p) => p.id !== photoToDelete));

        // Close lightbox if the deleted image was open
        if (selectedImageIndex !== null) {
          setSelectedImageIndex(null);
        }
      } else {
        throw new Error(response.data.message || "Failed to delete photo");
      }
    } catch (error) {
      console.error("Error deleting photo:", error);
      toast.error(error.response?.data?.message || "Failed to delete photo");
    } finally {
      setDeletingId(null);
      setPhotoToDelete(null);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  if (!Array.isArray(galleryPhotos) || galleryPhotos.length === 0) {
    return (
      <div className="w-3/4 max-md:mx-auto max-md:w-full flex flex-col items-center gap-4">
        <p className="text-center text-sm text-muted-foreground dark:text-gray-400 py-8">
          {locale === "ar"
            ? "لا توجد صور في المعرض حالياً"
            : "No photos in the gallery yet"}
        </p>
        {isOwnProfile && (
          <div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
              disabled={isUploading}
            />
            <Button onClick={triggerFileInput} disabled={isUploading}>
              {isUploading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : (
                <Plus className="w-4 h-4 mr-2" />
              )}
              {locale === "ar" ? "إضافة صور" : "Add Photos"}
            </Button>
          </div>
        )}
      </div>
    );
  }

  const largeImage = galleryPhotos[0];
  const smallImages = galleryPhotos.slice(1, 9);

  return (
    <div className="w-3/4 max-md:mx-auto max-md:w-full space-y-4">
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/*"
        className="hidden"
        disabled={isUploading}
      />

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 sm:gap-3 md:gap-4">
        {/* Right: Large image spanning 2 rows */}
        <div className="col-span-2 sm:col-span-3 md:col-span-1 row-span-2">
          <div
            className="relative w-full aspect-square bg-muted dark:bg-[#363636] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow duration-300"
            onClick={() => setSelectedImageIndex(0)}
          >
            <Image
              src={largeImage?.url || "/user/cover.jpg"}
              alt={`Gallery main image`}
              fill
              className="object-contain group-hover:scale-110 transition-transform duration-300"
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
              <ZoomIn className="w-5 h-5 text-white" />
            </div>

            {isOwnProfile && (
              <button
                onClick={(e) => handleDeletePhoto(e, largeImage.id)}
                disabled={deletingId === largeImage.id}
                className="absolute top-2 right-2 p-2 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
              >
                {deletingId === largeImage.id ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            )}
          </div>
        </div>
        {/* Left grid: 4 columns × 2 rows */}
        <div className="col-span-2 sm:col-span-3 md:col-span-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3 md:gap-4">
            {smallImages.map((image, index) => (
              <div
                key={image.id}
                className="relative aspect-square bg-muted dark:bg-[#363636] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow duration-300"
                onClick={() => setSelectedImageIndex(index + 1)}
              >
                <Image
                  src={image?.url || "/user/cover.jpg"}
                  alt={`Gallery image ${image.id}`}
                  width={500}
                  height={500}
                  className="object-contain group-hover:scale-110 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <ZoomIn className="w-5 h-5 text-white" />
                </div>

                {isOwnProfile && (
                  <button
                    onClick={(e) => handleDeletePhoto(e, image.id)}
                    disabled={deletingId === image.id}
                    className="absolute top-2 right-2 p-1.5 bg-red-500/80 hover:bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-10"
                  >
                    {deletingId === image.id ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <Trash2 className="w-3 h-3" />
                    )}
                  </button>
                )}
              </div>
            ))}

            {/* Add Photo Button Frame */}
            {isOwnProfile && smallImages.length < 8 && (
              <div
                onClick={triggerFileInput}
                className="relative aspect-square bg-muted dark:bg-[#363636] overflow-hidden cursor-pointer group shadow-sm hover:shadow-md transition-shadow duration-300 border-2 border-dashed border-gray-300 dark:border-gray-600 hover:border-amber-400 dark:hover:border-amber-400 flex items-center justify-center"
              >
                {isUploading ? (
                  <Loader2 className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-spin" />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Plus className="w-8 h-8 text-gray-400 dark:text-gray-500 group-hover:text-amber-400 transition-colors" />
                    <span className="text-xs text-gray-400 dark:text-gray-500 group-hover:text-amber-400 transition-colors">
                      {locale === "ar" ? "إضافة صورة" : "Add Photo"}
                    </span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Lightbox with Navigation */}
      <Dialog
        open={selectedImageIndex !== null}
        onOpenChange={() => setSelectedImageIndex(null)}
      >
        <DialogContent className="max-w-3xl dark:bg-[#363636] dark:border-[#363636]">
          {selectedImageIndex !== null && galleryPhotos[selectedImageIndex] && (
            <div className="relative">
              <Image
                src={galleryPhotos[selectedImageIndex]?.url}
                alt="Gallery preview"
                width={800}
                height={600}
                className="w-full h-auto rounded-lg"
              />

              {/* Navigation Buttons */}
              {galleryPhotos.length > 1 && (
                <>
                  {/* Previous Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={handlePrevious}
                    disabled={selectedImageIndex === 0}
                  >
                    <ChevronLeft className="h-6 w-6" />
                  </Button>

                  {/* Next Button */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white rounded-full"
                    onClick={handleNext}
                    disabled={selectedImageIndex === galleryPhotos.length - 1}
                  >
                    <ChevronRight className="h-6 w-6" />
                  </Button>

                  {/* Image Counter */}
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                    {selectedImageIndex + 1} / {galleryPhotos.length}
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={photoToDelete !== null}
        onOpenChange={(open) => !open && setPhotoToDelete(null)}
      >
        <AlertDialogContent className="dark:bg-[#363636] dark:border-[#363636]">
          <AlertDialogHeader>
            <AlertDialogTitle>
              {locale === "ar" ? "هل أنت متأكد؟" : "Are you sure?"}
            </AlertDialogTitle>
            <AlertDialogDescription className="dark:text-gray-400">
              {locale === "ar"
                ? "هذا الإجراء لا يمكن التراجع عنه. سيتم حذف هذه الصورة نهائياً من معرض أعمالك."
                : "This action cannot be undone. This photo will be permanently deleted from your gallery."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="dark:bg-[#53535365] dark:text-gray-300 dark:hover:bg-[#43434365]">
              {locale === "ar" ? "إلغاء" : "Cancel"}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deletingId !== null}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {deletingId !== null ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : locale === "ar" ? (
                "حذف"
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
