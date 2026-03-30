"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import api from "@/lib/api";
import Email from "./Email";
import { toast } from "sonner";

function EmailDetails({ bookingId, otherUser, onBack, onReply }) {
  const [replyText, setReplyText] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch conversation history from API
  useEffect(() => {
    const fetchConversation = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get(
          `/communication/chat/booking/${bookingId}`
        );

        if (response.data.success) {
          const chatHistory = response.data.data;

          // Map the messages to the format needed for display
          const formattedMessages = chatHistory.map((msg) => ({
            id: msg.message_id,
            senderName: msg.sender_name,
            initials: getInitials(msg.sender_name),
            message: msg.content,
            date: formatDate(msg.created_at),
            isFromCurrentUser: msg.is_from_current_user,
            profilePicture: msg.profile_picture,
          }));

          setMessages(formattedMessages);
        }
      } catch (err) {
        console.error("Error fetching conversation:", err);
        setError("Failed to load conversation");
      } finally {
        setLoading(false);
      }
    };

    if (bookingId) {
      fetchConversation();
    }
  }, [bookingId]);

  // Helper function to get initials from name
  const getInitials = (name) => {
    if (!name) return "??";
    const parts = name.trim().split(" ");
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)} ${parts[1].charAt(0)}`;
    }
    return parts[0].charAt(0);
  };

  // Helper function to format date
  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const handleSend = async () => {
    if (replyText.trim()) {
      try {
        // Send the reply to the API
        const response = await api.post(`/communication/${bookingId}/reply`, {
          booking_id: bookingId,
          content: replyText.trim(),
        });

        if (response.data.success) {
          // Clear the input
          setReplyText("");

          // Refresh the conversation to show the new message
          const conversationResponse = await api.get(
            `/communication/chat/booking/${bookingId}`
          );

          if (conversationResponse.data.success) {
            const chatHistory = conversationResponse.data.data;

            const formattedMessages = chatHistory.map((msg) => ({
              id: msg.message_id,
              senderName: msg.sender_name,
              initials: getInitials(msg.sender_name),
              message: msg.content,
              date: formatDate(msg.created_at),
              isFromCurrentUser: msg.is_from_current_user,
              profilePicture: msg.profile_picture,
            }));

            setMessages(formattedMessages);
          }

          // Call the onReply callback if provided
          if (onReply) {
            onReply(replyText);
          }
        }
      } catch (err) {
        console.error("Error sending reply:", err);
        // You could add a toast notification here
        alert("Failed to send message. Please try again.");
      }
    }
  };

  const handleDeleteMessage = async (messageId) => {
    if (!confirm("Are you sure you want to delete this message?")) {
      return;
    }

    try {
      // Call API to delete the message
      await api.delete(`/communication/message/${messageId}`);

      // Remove message from local state
      setMessages((prevMessages) =>
        prevMessages.filter((msg) => msg.id !== messageId)
      );

      // Show success toast
      toast.success("Message deleted successfully");
    } catch (err) {
      console.error("Error deleting message:", err);
      toast.error("Failed to delete message. Please try again.");
    }
  };

  return (
    <div className="w-full bg-white dark:bg-[#363636] rounded-xl border dark:border-[#363636] shadow-sm overflow-hidden flex flex-col h-[70vh] sm:h-auto max-h-[80vh]">
      {/* Header */}
      <div className="bg-[#E6A525] p-3 sm:p-4 flex items-center justify-between text-white flex-shrink-0">
        <div className="flex items-center gap-3 sm:gap-4">
          <button
            onClick={onBack}
            className="hover:bg-white/10 rounded-full p-1 transition transform rotate-180"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M19 12H5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M12 19L5 12L12 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white text-[#E6A525] flex items-center justify-center font-bold text-xs sm:text-sm">
              {otherUser.initials}
            </div>
            <span className="font-bold text-base sm:text-lg">
              {otherUser.name}
            </span>
          </div>
        </div>
      </div>

      {/* Messages List */}
      <div className="flex-1 p-3 sm:p-4 divide-y divide-gray-100 dark:divide-slate-600 overflow-y-auto">
        {loading ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            Loading messages...
          </div>
        ) : error ? (
          <div className="text-center py-8 text-red-500">{error}</div>
        ) : messages.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No messages yet
          </div>
        ) : (
          messages.map((msg) => (
            <Email
              key={msg.id}
              senderName={msg.senderName}
              initials={msg.initials}
              message={msg.message}
              date={msg.date}
              isFromCurrentUser={msg.isFromCurrentUser}
              messageId={msg.id}
              onDelete={handleDeleteMessage}
            />
          ))
        )}
      </div>

      {/* Reply Section */}
      <div className="p-3 sm:p-6 bg-gray-50 dark:bg-[#363636] border-t dark:border-[#363636] flex-shrink-0">
        <div className="mb-2 sm:mb-3 text-xs sm:text-sm text-gray-500 dark:text-gray-400 text-right dir-rtl">
          إلى: {otherUser.name}
        </div>
        <div className="relative">
          <textarea
            className="w-full p-3 pl-12 sm:p-4 sm:pl-14 rounded-xl border border-gray-200 dark:border-gray-500 dark:bg-[#363636] dark:text-white focus:ring-2 focus:ring-[#E6A525] focus:border-transparent resize-none text-right dark:placeholder:text-gray-400 text-sm sm:text-base"
            placeholder="اكتب الرسالة هنا...."
            rows={2}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            dir="rtl"
          />
          <button
            onClick={handleSend}
            className="absolute left-2 bottom-2 sm:left-4 sm:bottom-4 bg-[#E6A525] text-white w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center hover:bg-[#d4961f] transition transform -rotate-45"
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="sm:w-5 sm:h-5"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default EmailDetails;
