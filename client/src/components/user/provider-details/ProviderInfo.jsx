"use client";

import { useEffect, useState } from "react";
import { useLocale } from "next-intl";
import Image from "next/image";
import { ThumbsUp } from "lucide-react";
import PrimaryButton from "@/components/shared/PrimaryButton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import Gallery from "./Gallery";
import About from "./About";
import OtherInfo from "./OtherInfo";
import BookingModal from "./BookingModal";
import { getLikeStatus, toggleArtistLike } from "@/lib/artistLikes";
import api from "@/lib/api";
import { toast } from "sonner";
import { useRef } from "react";
import { useChat } from "@/contexts/ChatContext";
import { useRouter } from "@/i18n/navigation";
import { Send, Loader2 } from "lucide-react";

export default function ProviderInfo({
  data,
  availableHours,
  isOwnProfile = false,
}) {
  const [isLiked, setIsLiked] = useState(data?.is_liked ?? false);
  const [likes, setLikes] = useState(data?.likes_count ?? 0);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(data?.profile_picture_url);
  const fileInputRef = useRef(null);
  const locale = useLocale();

  // Chat functionality
  const { getChatDetails, sendMessage, unreadCount, getUnreadCount } =
    useChat();
  const router = useRouter();
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [messageInput, setMessageInput] = useState("");
  const [isStartingChat, setIsStartingChat] = useState(false);
  const [isSendingMessage, setIsSendingMessage] = useState(false);

  const handleChatClick = async () => {
    const targetUserId = data?.user_id || data?.id;

    if (!targetUserId) return;
    setIsStartingChat(true);
    try {
      // Try to get existing chat
      const response = await getChatDetails(null, targetUserId);
      if (response.success && response.chatId) {
        router.push(`/user-profile/chats/${response.chatId}`);
      } else {
        // If no chat exists, open modal to send first message
        setIsChatModalOpen(true);
      }
    } catch (error) {
      console.error("Error checking chat:", error);
      setIsChatModalOpen(true); // Fallback to creating new chat
    } finally {
      setIsStartingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!messageInput.trim() || isSendingMessage) return;
    const targetUserId = data?.user_id || data?.id;

    setIsSendingMessage(true);

    try {
      const response = await sendMessage({
        userId: targetUserId,
        message: messageInput,
        type: "text",
      });

      if (response.success) {
        setIsChatModalOpen(false);
        setMessageInput("");

        toast.success(
          locale === "ar"
            ? "تم إرسال الرسالة بنجاح"
            : "Message sent successfully"
        );

        // Redirect to the new chat
        if (response.data?.chat_id) {
          router.push(`/user-profile/chats/${response.data.chat_id}`);
        } else {
          // Fallback: try to fetch chat details again to get ID
          const chatDetails = await getChatDetails(null, targetUserId);
          if (chatDetails.success && chatDetails.chatId) {
            router.push(`/user-profile/chats/${chatDetails.chatId}`);
          }
        }
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setIsSendingMessage(false);
    }
  };
  useEffect(() => {
    if (isOwnProfile) {
      getUnreadCount();
    }
  }, [isOwnProfile]);

  useEffect(() => {
    let mounted = true;
    if (data?.id) {
      getLikeStatus(data.id)
        .then((res) => {
          if (mounted && typeof res?.liked === "boolean") {
            setIsLiked(res.liked);
          }
        })
        .catch(() => {
          // ignore like-status errors silently
        });
    }
    return () => {
      mounted = false;
    };
  }, [data?.id]);

  const handleLike = async () => {
    if (!data?.id) return;
    // Optimistic update
    const prevLiked = isLiked;
    const prevLikes = likes;
    const nextLiked = !prevLiked;
    setIsLiked(nextLiked);
    setLikes((v) => v + (nextLiked ? 1 : -1));
    try {
      await toggleArtistLike(data.id);
    } catch {
      // revert on failure
      setIsLiked(prevLiked);
      setLikes(prevLikes);
    }
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Check file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image size should be less than 2MB");
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
      formData.append("name", data.name || "");
      formData.append("email", data.email || "");
      formData.append("phone", data.phone || "");
      formData.append("profile_picture", file);

      const response = await api.post("profile/update-info", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data.success) {
        toast.success("Profile picture updated successfully");
      }
    } catch (error) {
      console.error("Error updating profile picture:", error);
      toast.error("Failed to update profile picture");
      // Revert preview if failed
      setPreviewUrl(data?.profile_picture_url);
    } finally {
      setIsUploading(false);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handleProfileImageClick = () => {
    setIsProfileModalOpen(true);
  };

  // Check onboarding status
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(true);
  const [isLoadingStatus, setIsLoadingStatus] = useState(false);

  useEffect(() => {
    if (isOwnProfile) {
      const checkStatus = async () => {
        setIsLoadingStatus(true);
        try {
          const response = await api.get("/onboarding-status");
          const { is_onboarding_complete } = response.data.data;
          setIsOnboardingComplete(is_onboarding_complete);
        } catch (error) {
          console.error("Error checking onboarding status:", error);
        } finally {
          setIsLoadingStatus(false);
        }
      };
      checkStatus();
    }
  }, [isOwnProfile]);

  const averageRatingNumber = Number(data?.average_rating || 0);
  const roundedRating = Math.round(averageRatingNumber);

  return (
    <div className="w-full bg-background dark:bg-transparent max-w-7xl mx-auto px-4 sm:px-6">
      {/* Provider Header Section */}
      <div className="relative -mt-12 max-sm:pb-0 max-sm:mb-0 sm:-mt-16  pb-6 sm:pb-8 mb-8">
        <div className="">
          {/* Mobile-First Layout: Stack on mobile, horizontal on desktop */}
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 sm:gap-6 lg:gap-8 lg:translate-y-[30px]">
            {/* Profile Section - Centered on mobile, left-aligned on desktop */}
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-6 w-full lg:w-auto">
              {/* Profile Image */}
              <div className="relative w-28 h-28 sm:w-28 sm:h-28 md:w-28 md:h-28 lg:w-36 lg:h-36 xl:w-40 xl:h-40 rounded-full overflow-hidden border-4 border-background dark:border-slate-700 shadow-lg flex-shrink-0 group">
                <div
                  onClick={handleProfileImageClick}
                  className="w-full h-full cursor-pointer"
                >
                  <Image
                    src={previewUrl || "/images/photographers/photographer.jpg"}
                    alt={data?.name || "profile"}
                    width={160}
                    height={160}
                    className="object-cover w-full h-full"
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
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        triggerFileInput();
                      }}
                      disabled={isUploading}
                      className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 cursor-pointer pointer-events-none"
                    >
                      {isUploading ? (
                        <div className="w-6 h-6 border-2 border-t-white border-white/30 rounded-full animate-spin" />
                      ) : (
                        <div className="bg-white/20 p-2 rounded-full backdrop-blur-sm pointer-events-auto">
                          <Image
                            src="/user/profile/sidebar/camera.svg"
                            alt="upload"
                            width={24}
                            height={24}
                            className="brightness-0 invert"
                          />
                        </div>
                      )}
                    </button>
                  </>
                )}
              </div>

              {/* Info Section */}
              <div className="flex flex-col items-center sm:items-start text-center sm:text-right w-full sm:w-auto lg:translate-y-[35px] -mt-1 sm:mt-0">
                {/* Name */}
                <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground dark:text-white">
                  {data?.name || ""}
                </h3>

                {/* Experience */}
                <p className="text-xs sm:text-sm text-muted-foreground dark:text-gray-400 mt-1">
                  {data?.years_of_experience != null
                    ? `${locale === "ar" ? "سنوات خبرة" : "years exp"} :  ${
                        data.years_of_experience
                      }`
                    : ""}
                </p>

                {/* Rating */}
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-2">
                  <span className="text-xs sm:text-sm font-semibold text-amber-700">
                    {data?.average_rating ?? "0.0"}
                  </span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={`text-xs sm:text-sm ${
                          i < roundedRating
                            ? "text-amber-400"
                            : "text-gray-300 dark:text-gray-600"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Buttons - Stack on mobile, row on larger screens */}
                {!isOwnProfile ? (
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-4 w-full sm:w-auto">
                    <PrimaryButton
                      onClick={handleLike}
                      className="w-full flex items-center justify-center gap-2 text-sm px-4 py-2 h-auto"
                    >
                      <span>
                        {locale === "ar"
                          ? isLiked
                            ? "إلغاء الإعجاب"
                            : "اعجاب"
                          : isLiked
                          ? "Unlike"
                          : "Like"}
                      </span>
                      <ThumbsUp className="w-4 h-4" />
                    </PrimaryButton>
                    <PrimaryButton
                      onClick={() => setIsBookingModalOpen(true)}
                      className="bg-black hover:bg-black/90 dark:bg-[#1C1C1D] dark:hover:bg-[#2f2f30] text-white text-sm px-4 py-2 h-auto w-full"
                    >
                      {locale === "ar" ? "حجز" : "Book"}
                    </PrimaryButton>
                  </div>
                ) : (
                  !isOnboardingComplete && (
                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2 mt-4 w-full sm:w-auto">
                      <PrimaryButton
                        onClick={() =>
                          (window.location.href = "/artist/complete")
                        }
                        className="px-4 py-2 h-auto w-full"
                      >
                        {locale === "ar"
                          ? "إكمال الملف الشخصي"
                          : "Complete Profile"}
                      </PrimaryButton>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Stats and Chat Section - Full width on mobile, auto on desktop */}
            <div className="flex items-center justify-center sm:justify-end gap-8 sm:gap-6 lg:gap-8 w-full lg:w-auto">
              {/* Stats Container */}
              <div className="flex items-center gap-4 sm:gap-6 md:gap-8">
                {/* Likes Stat */}
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">
                    {likes}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {locale === "ar" ? "الإعجابات" : "Likes"}
                  </p>
                </div>

                {/* Appointments Stat */}
                <div className="text-center">
                  <p className="text-xl sm:text-2xl font-bold text-foreground dark:text-white">
                    {data?.completed_bookings ?? 0}
                  </p>
                  <p className="text-xs text-muted-foreground dark:text-gray-400">
                    {locale === "ar" ? "الحجوزات" : "Bookings"}
                  </p>
                </div>
              </div>

              {/* Chat Icon Button */}
              {isOwnProfile ? (
                <div className="relative">
                  <button
                    className="p-4 sm:p-2.5"
                    aria-label="Open chats"
                    onClick={() => router.push("/artist-profile/chats")}
                  >
                    <Image
                      src="/user/chat.svg"
                      alt="chat"
                      width={48}
                      height={48}
                    />
                  </button>
                  {unreadCount > 0 && (
                    <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center border-2 border-white dark:border-[#1C1C1D]">
                      {unreadCount}
                    </span>
                  )}
                </div>
              ) : (
                <button
                  className="p-4 sm:p-2.5"
                  aria-label="Open chat"
                  onClick={handleChatClick}
                  disabled={isStartingChat}
                >
                  {isStartingChat ? (
                    <Loader2 className="w-8 h-8 sm:w-12 sm:h-12 animate-spin text-main" />
                  ) : (
                    <Image
                      src="/user/chat.svg"
                      alt="chat"
                      width={48}
                      height={48}
                    />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Section */}
      <div className="px-4 border-b border-border dark:border-gray-500 pt-6 sm:pt-8">
        <div className="mx-auto bg-white dark:bg-transparent">
          <Tabs
            dir={locale === "ar" ? "rtl" : "ltr"}
            defaultValue="gallery"
            className="w-full bg-white dark:bg-transparent"
          >
            {/* Tabs Navigation - Simple text tabs */}
            <div className="overflow-x-auto scrollbar-hide -mx-4 sm:mx-0 px-4 sm:px-0 border-b border-border dark:border-gray-500">
              <TabsList className="bg-white dark:bg-transparent flex gap-4 border-0 p-0 h-auto rounded-none shadow-none">
                <TabsTrigger
                  value="gallery"
                  className="bg-transparent data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent border-0 border-b border-border data-[state=active]:border-b-amber-400 border-t-0 border-l-0 border-r-0 p-0 h-auto rounded-none shadow-none data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-amber-400 text-md"
                >
                  {locale === "ar" ? "ملف الاعمال" : "Gallery"}
                </TabsTrigger>
                <TabsTrigger
                  value="about"
                  className="bg-transparent data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent border-0 border-b border-border data-[state=active]:border-b-amber-400 border-t-0 border-l-0 border-r-0 p-0 h-auto rounded-none shadow-none data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-amber-400 text-md"
                >
                  {locale === "ar" ? "معلومات عن العامل" : "About"}
                </TabsTrigger>
                <TabsTrigger
                  value="other"
                  className="bg-transparent data-[state=active]:bg-transparent dark:data-[state=active]:bg-transparent border-0 border-b border-border data-[state=active]:border-b-amber-400 border-t-0 border-l-0 border-r-0 p-0 h-auto rounded-none shadow-none data-[state=active]:shadow-none text-muted-foreground data-[state=active]:text-amber-400 text-md"
                >
                  {locale === "ar" ? "معلومات اخرى" : "Other Info"}
                </TabsTrigger>
              </TabsList>
            </div>

            {/* Tabs Content */}
            <div className="py-6 sm:py-8 md:py-10">
              <TabsContent value="gallery" className="mt-0">
                <Gallery
                  photos={data?.gallery_photos || []}
                  isOwnProfile={isOwnProfile}
                />
              </TabsContent>
              <TabsContent value="about" className="mt-0">
                <About
                  artistId={data?.id}
                  name={data?.name}
                  bio={data?.artist_info}
                  role={data?.role}
                  country={data?.country?.name}
                  city={data?.city?.name}
                  skills={data?.skills || []}
                  services={data?.services || []}
                  ratingsCount={data?.ratings_count}
                  avgRating={data?.average_rating}
                  ratings={data?.ratings || []}
                  isOwnProfile={isOwnProfile}
                  yearsOfExperience={data?.years_of_experience}
                />
              </TabsContent>
              <TabsContent value="other" className="mt-0">
                <OtherInfo
                  statistics={data?.statistics}
                  skills={data?.skills || []}
                  email={data?.email}
                  phone={data?.phone}
                />
              </TabsContent>
            </div>
          </Tabs>
        </div>
      </div>

      {/* Booking Modal */}
      <BookingModal
        open={isBookingModalOpen}
        onOpenChange={setIsBookingModalOpen}
        services={data?.services || []}
        provider={data}
        availableHours={availableHours}
      />

      {/* Profile Picture Modal */}
      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="max-w-xl w-full dark:bg-[#363636] dark:border-[#363636] p-0 overflow-hidden bg-transparent border-none shadow-none">
          <div className="relative w-full aspect-square">
            <Image
              src={previewUrl || "/user/profile.jpg"}
              alt="Profile picture preview"
              fill
              className="object-contain"
            />
          </div>
        </DialogContent>
      </Dialog>

      {/* Chat Modal */}
      <Dialog open={isChatModalOpen} onOpenChange={setIsChatModalOpen}>
        <DialogContent className="max-w-md w-full bg-white dark:bg-[#1C1C1D] border border-border dark:border-gray-700 p-6 rounded-2xl">
          <div className="flex flex-col gap-4">
            <h3 className="text-lg font-bold text-foreground dark:text-white">
              {locale === "ar" ? "بدء محادثة" : "Start Conversation"}
            </h3>
            <p className="text-sm text-muted-foreground dark:text-gray-400">
              {locale === "ar"
                ? "أرسل رسالة لبدء المحادثة مع هذا الفنان"
                : "Send a message to start a conversation with this artist"}
            </p>

            <div className="relative">
              <textarea
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder={
                  locale === "ar"
                    ? "اكتب رسالتك هنا..."
                    : "Type your message here..."
                }
                className="w-full min-h-[100px] p-3 rounded-lg bg-secondary dark:bg-[#2C2C2E] border-none focus:ring-2 focus:ring-main resize-none text-foreground dark:text-white"
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setIsChatModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                {locale === "ar" ? "إلغاء" : "Cancel"}
              </button>
              <button
                onClick={handleSendMessage}
                disabled={!messageInput.trim() || isSendingMessage}
                className="flex items-center gap-2 px-4 py-2 bg-main text-white rounded-lg hover:bg-main/90 transition-colors disabled:opacity-50"
              >
                {isSendingMessage ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                {locale === "ar" ? "إرسال" : "Send"}
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
