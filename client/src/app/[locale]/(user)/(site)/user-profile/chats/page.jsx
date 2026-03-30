"use client";

import { useEffect, useMemo } from "react";
import Link from "next/link";
import { Trash2, Loader2 } from "lucide-react";
import { useChat } from "@/contexts/ChatContext";
import Image from "next/image";

const getInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + "." + words[1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || "U";
};

const formatDate = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return dateString;
  }
};

const getMessagePreview = (lastMessage) => {
  if (!lastMessage?.message) return "No messages yet";

  const message = lastMessage.message;
  const messageType = lastMessage.type;

  // Check by message type if available
  if (messageType === "image") return "📷 Photo";
  if (messageType === "voice") return "🎤 Voice message";
  if (messageType === "file") return "📎 Attachment";
  if (messageType === "location") return "📍 Location";

  // Fallback: Check by URL patterns if type is not set
  if (typeof message === "string") {
    // Check for image paths
    if (
      message.includes("/storage/images/") ||
      /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(message)
    ) {
      return "📷 Photo";
    }

    // Check for voice/audio paths
    if (
      message.includes("/storage/voices/") ||
      /\.(mp3|wav|ogg|webm|m4a)$/i.test(message)
    ) {
      return "🎤 Voice message";
    }

    // Check for location (coordinates pattern)
    if (/^-?\d+\.?\d*,-?\d+\.?\d*$/.test(message.trim())) {
      return "📍 Location";
    }

    // Check for other file paths
    if (message.includes("/storage/") || message.startsWith("http")) {
      return "📎 Attachment";
    }
  }

  // Return text message as-is
  return message;
};

export default function ChatsPage() {
  const { allChats, loading, getAllChats, deleteChat } = useChat();

  useEffect(() => {
    getAllChats();
  }, []);

  // Sort chats by most recent activity (updated_at descending)
  const sortedChats = useMemo(() => {
    return [...allChats].sort((a, b) => {
      const dateA = new Date(a.updated_at || 0);
      const dateB = new Date(b.updated_at || 0);
      return dateB - dateA; // Most recent first
    });
  }, [allChats]);

  return (
    <div className="p-6">
      {/* Header */}
      <div className="">
        <div className="flex items-center justify-between">
          <h1 className="text-lg font-bold text-main">المحادثات</h1>
        </div>
      </div>

      {/* Loading State */}
      {loading && allChats.length === 0 && (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-main" />
        </div>
      )}

      {/* Chat List */}
      <div className="divide-y divide-border dark:!divide-gray-500">
        {!loading && sortedChats.length === 0 ? (
          <div className="flex items-center justify-center py-20 px-1">
            <p className="text-main text-lg">لا توجد محادثات</p>
          </div>
        ) : (
          sortedChats.map((chat) => (
            <div
              key={chat.id}
              className="flex items-center justify-between gap-4 border-r-4 border-transparent bg-white dark:!bg-transparent py-6 hover:bg-secondary dark:hover:!bg-[#1C1C1D] hover:border-r-main transition-all group"
            >
              <Link
                href={`/user-profile/chats/${chat.id}`}
                className="flex-1 flex items-center gap-3 cursor-pointer"
              >
                {/* Name and Avatar */}
                <div className="flex items-center gap-3 flex-1">
                  {chat.peer_user?.profile_picture ? (
                    <div className="h-12 w-12 rounded-full overflow-hidden shadow-md flex-shrink-0">
                      <Image
                        src={chat.peer_user.profile_picture}
                        alt={chat.peer_user.name || chat.name || "User"}
                        width={48}
                        height={48}
                        className="object-cover w-full h-full"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-12 rounded-full bg-main flex items-center justify-center text-white text-xs shadow-md flex-shrink-0">
                      {getInitials(chat.peer_user?.name || chat.name)}
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-black dark:!text-white">
                        {chat.peer_user?.name || chat.name || "Unknown User"}
                      </span>
                      {chat.unread_count > 0 && (
                        <span className="bg-main text-white text-xs rounded-full px-2 py-0.5">
                          {chat.unread_count}
                        </span>
                      )}
                    </div>
                    {/* Message Content */}
                    <div className="flex-1">
                      <p className="line-clamp-1 text-xs text-descriptive dark:!text-gray-400">
                        {getMessagePreview(chat.last_message)}
                      </p>
                    </div>
                  </div>
                </div>
              </Link>

              {/* Date and Delete */}
              <div className="flex flex-col items-end gap-2 min-w-fit ps-4">
                <div className="text-sm text-descriptive dark:!text-gray-400">
                  {formatDate(chat.updated_at)}
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (window.confirm("هل تريد حذف هذه المحادثة؟")) {
                      deleteChat(chat.id);
                    }
                  }}
                  className="text-destructive hover:bg-destructive/10 p-2 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  title="Delete chat"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
