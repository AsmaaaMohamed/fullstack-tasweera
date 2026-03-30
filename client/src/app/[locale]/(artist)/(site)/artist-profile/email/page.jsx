"use client";

import React, { useState, useEffect } from "react";
import Email from "@/components/user/profile/email/Email";
import EmailTab from "@/components/user/profile/email/EmailTab";
import EmailDetails from "@/components/user/profile/email/EmailDetails";
import api from "@/lib/api";

function EmailPage() {
  const [activeTab, setActiveTab] = useState("inbox");
  const [conversations, setConversations] = useState({ inbox: [], outbox: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);

  // Fetch conversations from API
  useEffect(() => {
    const fetchConversations = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.get("/communication");

        if (response.data.success) {
          const { inbox, outbox } = response.data.data;

          // Map inbox data to component format
          const mappedInbox = inbox.map((item) => ({
            id: item.message_id,
            senderName: item.sender_name,
            initials: getInitials(item.sender_name),
            message: item.content,
            date: formatDate(item.created_at),
            rawDate: item.created_at,
            profilePicture: item.profile_picture,
            bookingId: item.booking_id,
            senderId: item.sender_id,
            receiverId: item.receiver_id,
            senderRole: item.sender_role,
            receiverRole: item.receiver_role,
          }));

          // Map outbox data to component format
          const mappedOutbox = outbox.map((item) => ({
            id: item.message_id,
            senderName: item.receiver_name, // For sent messages, show receiver name
            initials: getInitials(item.receiver_name),
            message: item.content,
            date: formatDate(item.created_at),
            rawDate: item.created_at,
            profilePicture: item.profile_picture,
            bookingId: item.booking_id,
            senderId: item.sender_id,
            receiverId: item.receiver_id,
            senderRole: item.sender_role,
            receiverRole: item.receiver_role,
          }));

          setConversations({ inbox: mappedInbox, outbox: mappedOutbox });
        }
      } catch (err) {
        console.error("Error fetching conversations:", err);
        setError("Failed to load conversations");
      } finally {
        setLoading(false);
      }
    };

    fetchConversations();
  }, []);

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

  const handleDeleteAll = () => {
    // Implement delete all functionality
    console.log("Delete all emails");
  };

  const handleEmailClick = (email) => {
    setSelectedConversation({
      bookingId: email.bookingId,
      otherUser: {
        name: email.senderName,
        initials: email.initials,
        id: activeTab === "inbox" ? email.senderId : email.receiverId,
      },
    });
  };

  const handleBack = () => {
    setSelectedConversation(null);
  };

  const handleReply = (text) => {
    console.log("Reply sent:", text);
    // Here you would call the API to send the message
    // After success, you would refresh the conversation
  };

  const currentEmails =
    activeTab === "inbox" ? conversations.inbox : conversations.outbox;

  if (selectedConversation) {
    return (
      <EmailDetails
        bookingId={selectedConversation.bookingId}
        otherUser={selectedConversation.otherUser}
        onBack={handleBack}
        onReply={handleReply}
      />
    );
  }

  return (
    <div className="w-full bg-white dark:bg-transparent rounded-xl border dark:border-slate-600 shadow-sm">
      <div className="p-3 sm:p-4 md:p-6">
        <EmailTab
          activeTab={activeTab}
          onTabChange={setActiveTab}
          inboxCount={conversations.inbox.length}
          sentCount={conversations.outbox.length}
          onDeleteAll={handleDeleteAll}
        />

        <div className="divide-y divide-gray-200 dark:divide-slate-600">
          {loading ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              Loading conversations...
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : currentEmails.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No messages found
            </div>
          ) : (
            currentEmails.map((email) => (
              <div
                key={email.id}
                onClick={() => handleEmailClick(email)}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-[#1C1C1D] transition-colors"
              >
                <Email
                  senderName={email.senderName}
                  initials={email.initials}
                  message={email.message}
                  date={email.date}
                  profilePicture={email.profilePicture}
                />
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

export default EmailPage;
