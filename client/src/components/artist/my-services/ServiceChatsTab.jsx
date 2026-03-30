"use client";

import { useState, useEffect } from "react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import { X } from "lucide-react";
import api from "@/lib/api";
import EmailDetails from "@/components/user/profile/email/EmailDetails";

export default function ServiceChatsTab({ serviceId }) {
  const t = useTranslations("MyServices");
  const locale = useLocale();
  const isRTL = locale === "ar";
  const [chats, setChats] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedChat, setSelectedChat] = useState(null);

  useEffect(() => {
    if (serviceId) {
      fetchChats();
    }
  }, [serviceId]);

  const fetchChats = async () => {
    if (!serviceId) return;

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get(`/communication/service/${serviceId}`, {
        headers: {
          "Accept-Language": locale,
        },
      });

      if (response.data?.success && response.data?.data) {
        setChats(response.data.data);
      } else {
        setChats([]);
      }
    } catch (err) {
      console.error("Error fetching service chats:", err);
      setError(
        err?.response?.data?.message ||
          (locale === "en" ? "Failed to load chats" : "فشل في تحميل المحادثات")
      );
      setChats([]);
    } finally {
      setIsLoading(false);
    }
  };

  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)} ${parts[1].charAt(0)}`;
    }
    return parts[0].charAt(0).toUpperCase();
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleChatClick = (chat) => {
    setSelectedChat({
      bookingId: chat.booking_id,
      otherUser: {
        name: chat.name,
        initials: getInitials(chat.name),
        id: chat.customer_id,
      },
    });
  };

  const handleCloseChat = () => {
    setSelectedChat(null);
  };

  const handleReply = (text) => {
    console.log("Reply sent:", text);
    // Here you would call the API to send the message
  };

  // If a chat is selected, show EmailDetails with close button
  if (selectedChat) {
    return (
      <div className="relative">
        {/* Close Button */}
        <button
          onClick={handleCloseChat}
          className={`absolute top-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-slate-700 dark:hover:bg-slate-600 transition-colors ${
            isRTL ? "right-4" : "left-4"
          }`}
          aria-label={locale === "en" ? "Close" : "إغلاق"}
        >
          <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
        </button>

        {/* Email Details Component */}
        <EmailDetails
          bookingId={selectedChat.bookingId}
          otherUser={selectedChat.otherUser}
          onBack={handleCloseChat}
          onReply={handleReply}
        />
      </div>
    );
  }

  // Show chat list
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">
          {locale === "en" ? "Loading chats..." : "جاري تحميل المحادثات..."}
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (chats.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-gray-500 dark:text-gray-400">{t("no-chats")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-0 divide-y divide-gray-100 dark:divide-slate-600">
      {chats.map((chat) => (
        <div
          key={chat.message_id}
          onClick={() => handleChatClick(chat)}
          className="flex flex-col sm:flex-row items-start gap-3 sm:gap-4 py-3 sm:py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors rounded-lg px-2"
        >
          {/* Container for Avatar and Content */}
          <div
            className={`flex flex-1 items-start gap-3 min-w-0 ${
              isRTL ? "flex-row-reverse" : "flex-row"
            }`}
          >
            {/* Avatar */}
            <div className="flex-shrink-0">
              {chat.profile_picture ? (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border border-gray-100 dark:border-gray-700">
                  <Image
                    src={chat.profile_picture}
                    alt={chat.name}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-main flex items-center justify-center text-white font-semibold text-xs sm:text-sm shadow-sm">
                  {getInitials(chat.name)}
                </div>
              )}
            </div>

            {/* Content */}
            <div
              className={`flex-1 min-w-0 ${isRTL ? "text-right" : "text-left"}`}
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {chat.name}
                </h3>
                {/* Date - moved here for better mobile layout */}
                <span className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400 whitespace-nowrap flex-shrink-0">
                  {formatDate(chat.created_at)}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-300 leading-relaxed line-clamp-2">
                {chat.content}
              </p>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
