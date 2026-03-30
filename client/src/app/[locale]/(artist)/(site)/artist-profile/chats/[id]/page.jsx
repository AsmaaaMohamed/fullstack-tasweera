"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import {
  CornerUpLeft,
  Send,
  Loader2,
  Image as ImageIcon,
  X,
  MapPin,
  Mic,
  Paperclip,
  StopCircle,
} from "lucide-react";
import { useParams } from "next/navigation";
import Image from "next/image";
import { useChat } from "@/contexts/ChatContext";
import { toast } from "sonner";

const getInitials = (name) => {
  if (!name) return "U";
  const words = name.trim().split(" ");
  if (words.length >= 2) {
    return (words[0][0] + "." + words[1][0]).toUpperCase();
  }
  return name[0]?.toUpperCase() || "U";
};

const formatTime = (dateString) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return "";
  }
};

export default function ChatPage() {
  const params = useParams();
  const chatId = parseInt(params.id);

  const {
    currentChatMessages,
    loading,
    getChatDetails,
    sendMessage,
    subscribeToChat,
    unsubscribeFromChat,
    markChatAsRead,
    resetPagination,
    allChats,
    getAllChats,
  } = useChat();

  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [isSendingFile, setIsSendingFile] = useState(false);
  const messagesEndRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const fileInputRef = useRef(null);
  const genericFileInputRef = useRef(null);
  const previousMessageCountRef = useRef(0);
  const isNearBottomRef = useRef(true);
  const recordingIntervalRef = useRef(null);

  // Get current chat info
  const currentChat = allChats.find((chat) => chat.id === chatId);
  const chatName = currentChat?.peer_user?.name || currentChat?.name || "User";
  const chatAvatar = currentChat?.peer_user?.profile_picture;

  // Check if user is near bottom of messages
  const checkIfNearBottom = useCallback(() => {
    if (messagesContainerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } =
        messagesContainerRef.current;
      const distanceFromBottom = scrollHeight - scrollTop - clientHeight;
      isNearBottomRef.current = distanceFromBottom < 100; // Within 100px of bottom
    }
  }, []);

  // Scroll to bottom function
  const scrollToBottom = useCallback(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  // Fetch chats if not available (e.g. on refresh)
  useEffect(() => {
    if (allChats.length === 0) {
      getAllChats();
    }
  }, [allChats.length, getAllChats]);

  // Initialize chat
  useEffect(() => {
    if (chatId) {
      resetPagination();
      getChatDetails(chatId);
      subscribeToChat(chatId);
      markChatAsRead(chatId);
    }

    return () => {
      unsubscribeFromChat();
    };
  }, [chatId]);

  // Smart scroll: only scroll to bottom for new messages if user was already at bottom
  useEffect(() => {
    if (!loading && currentChatMessages.length > 0) {
      const isInitialLoad = previousMessageCountRef.current === 0;
      const hasNewMessages =
        currentChatMessages.length > previousMessageCountRef.current;

      // Always scroll on initial load
      if (isInitialLoad) {
        setTimeout(scrollToBottom, 100);
      }
      // Only scroll for new messages if user was already near bottom
      else if (hasNewMessages && isNearBottomRef.current) {
        setTimeout(scrollToBottom, 100);
      }

      previousMessageCountRef.current = currentChatMessages.length;
    }
  }, [currentChatMessages, loading, scrollToBottom]);

  // Add scroll event listener to track user position
  useEffect(() => {
    const container = messagesContainerRef.current;
    if (container) {
      container.addEventListener("scroll", checkIfNearBottom);
      return () => container.removeEventListener("scroll", checkIfNearBottom);
    }
  }, [checkIfNearBottom]);

  const handleSend = async () => {
    if ((!input.trim() && !selectedImage) || sending) return;

    setSending(true);
    // Mark that we're at bottom before sending (so new message auto-scrolls)
    isNearBottomRef.current = true;

    try {
      if (selectedImage) {
        // Send image message
        await sendMessage({
          chatId,
          type: "image",
          file: selectedImage,
        });
        setSelectedImage(null);
        setImagePreview(null);
      } else {
        // Send text message
        await sendMessage({
          chatId,
          message: input,
          type: "text",
        });
      }
      setInput("");
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Voice recording functions
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const audioChunks = [];

      recorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: "audio/webm" });
        const duration = recordingDuration;

        // Send voice message
        setSending(true);
        isNearBottomRef.current = true;
        try {
          await sendMessage({
            chatId,
            type: "voice",
            file: audioBlob,
            duration,
          });
        } catch (error) {
          console.error("Error sending voice message:", error);
          toast.error("Failed to send voice message");
        } finally {
          setSending(false);
        }

        // Cleanup
        stream.getTracks().forEach((track) => track.stop());
        setRecordingDuration(0);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setIsRecording(true);

      // Start duration counter
      recordingIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error("Error accessing microphone:", error);
      toast.error("Could not access microphone");
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      mediaRecorder.stop();
      setIsRecording(false);
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") {
      // Get the stream and stop all tracks
      if (mediaRecorder.stream) {
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
      }

      // Stop the recorder without triggering onstop (which sends the message)
      mediaRecorder.ondataavailable = null;
      mediaRecorder.onstop = null;

      if (mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }

      setIsRecording(false);
      setRecordingDuration(0);

      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }

      toast.info("Recording cancelled");
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  };

  // File upload function
  const handleFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setIsSendingFile(true);
      isNearBottomRef.current = true;
      try {
        await sendMessage({
          chatId,
          type: "file",
          file,
        });
        toast.success("File sent successfully");
      } catch (error) {
        console.error("Error sending file:", error);
        toast.error("Failed to send file");
      } finally {
        setIsSendingFile(false);
        if (genericFileInputRef.current) {
          genericFileInputRef.current.value = "";
        }
      }
    }
  };

  // Location sharing function
  const handleShareLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Geolocation is not supported by your browser");
      return;
    }

    setSending(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        const coordinates = `${latitude},${longitude}`;

        try {
          await sendMessage({
            chatId,
            type: "location",
            message: coordinates,
          });
        } catch (error) {
          console.error("Error sending location:", error);
        } finally {
          setSending(false);
        }
      },
      (error) => {
        console.error("Error getting location:", error);
        toast.error("Could not get your location");
        setSending(false);
      }
    );
  };

  // Cleanup recording on unmount
  useEffect(() => {
    return () => {
      if (recordingIntervalRef.current) {
        clearInterval(recordingIntervalRef.current);
      }
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
      }
    };
  }, [mediaRecorder]);

  const renderMessage = (message) => {
    switch (message.type) {
      case "image":
        return (
          <div className="max-w-xs">
            <Image
              src={message.message}
              alt="Sent image"
              width={300}
              height={200}
              className="rounded-lg object-cover"
            />
          </div>
        );
      case "voice":
        return (
          <div className="flex items-center gap-2 min-w-[200px]">
            <audio controls className="w-full h-10">
              <source src={message.message} type="audio/webm" />
              <source src={message.message} type="audio/mpeg" />
              <source src={message.message} type="audio/ogg" />
              Your browser does not support audio.
            </audio>
          </div>
        );
      case "file":
        return (
          <a
            href={message.message}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm underline"
          >
            <Paperclip size={16} />
            Download File
          </a>
        );
      case "location":
        return (
          <a
            href={`https://www.google.com/maps/search/?api=1&query=${message.message}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 underline text-sm"
          >
            <MapPin size={16} />
            View Location
          </a>
        );
      default:
        return (
          <p className="text-sm whitespace-pre-wrap break-words">
            {message.message}
          </p>
        );
    }
  };

  return (
    <div className="lg:px-20 py-10 bg-background dark:!bg-transparent h-screen flex flex-col">
      <div className="shadow-[0_0_4px_0_#C5C5C5] dark:!shadow-gray-500 rounded-[24px] flex flex-col h-full overflow-hidden">
        {/* Header */}
        <div className="bg-main text-white p-4 flex items-center justify-between rounded-t-[24px] shadow-lg flex-shrink-0">
          <div className="flex items-center gap-3">
            <Link href="/artist-profile/chats" className="p-1">
              <CornerUpLeft size={24} />
            </Link>
            {chatAvatar ? (
              <div className="h-10 w-10 rounded-full overflow-hidden shadow-md">
                <Image
                  src={chatAvatar}
                  alt={chatName}
                  width={40}
                  height={40}
                  className="object-cover w-full h-full"
                />
              </div>
            ) : (
              <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center text-xs text-black shadow-md">
                {getInitials(chatName)}
              </div>
            )}
            <span className="font-semibold">{chatName}</span>
          </div>
        </div>

        {/* Messages Container - Scrollable */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto p-6 ps-0"
        >
          <div className="flex flex-col gap-4">
            {loading && currentChatMessages.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 className="h-8 w-8 animate-spin text-main" />
              </div>
            ) : currentChatMessages.length === 0 ? (
              <div className="flex items-center justify-center py-10">
                <p className="text-descriptive dark:!text-gray-400">
                  No messages yet
                </p>
              </div>
            ) : (
              currentChatMessages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.is_me ? "flex-row" : "flex-row-reverse"
                    } gap-3 items-end`}
                >
                  <div
                    className={`flex flex-col ${message.is_me ? "items-start" : "items-end"
                      } gap-1`}
                  >
                    <div
                      className={`rounded-[12px] rounded-ss-none px-4 py-2 ${message.is_me
                          ? message.type === "voice"
                            ? "bg-main text-white"
                            : "bg-main text-white"
                          : "bg-white dark:!bg-[#1C1C1D] text-foreground dark:!text-white"
                        }`}
                    >
                      {renderMessage(message)}
                    </div>
                    <div className="flex gap-1 px-4 items-center">
                      {!message.is_me && message.sender?.profile_picture && (
                        <div className="h-[13px] w-[13px] rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">
                          <Image
                            src={message.sender.profile_picture}
                            alt="avatar"
                            width={13}
                            height={13}
                            className="object-cover h-[13px] w-[13px] rounded-full"
                          />
                        </div>
                      )}
                      <span className="text-xs text-muted-foreground">
                        {formatTime(message.created_at)}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area Container - Fixed at bottom */}
        <div className="flex-shrink-0 p-4 bg-background dark:!bg-transparent border-t border-border/50">
          {/* Image Preview */}
          {imagePreview && (
            <div className="mb-2">
              <div className="relative inline-block">
                <Image
                  src={imagePreview}
                  alt="Preview"
                  width={150}
                  height={150}
                  className="rounded-lg object-cover"
                />
                <button
                  onClick={clearImage}
                  className="absolute -top-2 -right-2 bg-destructive text-white rounded-full p-1 hover:bg-destructive/90"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          )}

          {/* Recording Indicator */}
          {isRecording && (
            <div className="mb-2 flex items-center gap-2 text-red-500 animate-pulse">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span className="text-sm font-medium">
                Recording... {recordingDuration}s
              </span>
              <button
                onClick={cancelRecording}
                className="ml-auto text-xs bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
              >
                Cancel
              </button>
            </div>
          )}

          {/* Input Area */}
          <div className="bg-white dark:!bg-[#363636] px-2 py-2 flex items-center gap-2 rounded-[12px] shadow-[0_0_4px_0_#C5C5C5]">
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              className="hidden"
              onChange={handleImageSelect}
            />
            <input
              type="file"
              ref={genericFileInputRef}
              className="hidden"
              onChange={handleFileSelect}
            />

            {/* Voice Recording Button */}
            <button
              onClick={toggleRecording}
              className={`p-2 sm:p-3 rounded-full transition-colors flex items-center justify-center flex-shrink-0 ${isRecording
                  ? "bg-red-500 text-white hover:bg-red-600"
                  : "text-main hover:bg-secondary"
                }`}
              disabled={sending || isSendingFile}
              title={isRecording ? "Stop recording" : "Record voice message"}
            >
              {isRecording ? (
                <StopCircle size={18} className="sm:w-5 sm:h-5" />
              ) : (
                <Mic size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>

            {/* File Upload Button */}
            <button
              onClick={() => genericFileInputRef.current?.click()}
              className="p-2 sm:p-3 text-main hover:bg-secondary rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              disabled={sending || isRecording || isSendingFile}
              title="Send file"
            >
              {isSendingFile ? (
                <Loader2 size={18} className="animate-spin sm:w-5 sm:h-5" />
              ) : (
                <Paperclip size={18} className="sm:w-5 sm:h-5" />
              )}
            </button>

            {/* Location Button */}
            <button
              onClick={handleShareLocation}
              className="p-2 sm:p-3 text-main hover:bg-secondary rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              disabled={sending || isRecording || isSendingFile}
              title="Share location"
            >
              <MapPin size={18} className="sm:w-5 sm:h-5" />
            </button>

            {/* Image Button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 sm:p-3 text-main hover:bg-secondary rounded-full transition-colors flex items-center justify-center flex-shrink-0"
              disabled={sending || isRecording || isSendingFile}
              title="Send image"
            >
              <ImageIcon size={18} className="sm:w-5 sm:h-5" />
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="اكتب الرسالة هنا..."
              disabled={sending || selectedImage !== null || isRecording}
              className="bg-[#F5F5F5] dark:!bg-[#1C1C1D] border border-border dark:!border-gray-500 rounded-lg px-3 py-2 sm:px-4 sm:py-3 flex-1 text-sm text-descriptive dark:!text-white placeholder-descriptive dark:!placeholder-gray-200 placeholder:text-xs focus:outline-none focus:ring-2 focus:ring-primary min-w-0"
            />

            <button
              className="p-2 sm:p-3 text-white bg-main hover:bg-main/90 rounded-full transition-colors flex items-center justify-center disabled:opacity-50 flex-shrink-0"
              onClick={handleSend}
              disabled={
                sending || (!input.trim() && !selectedImage) || isRecording
              }
            >
              {sending ? (
                <Loader2 size={17} className="animate-spin sm:w-5 sm:h-5" />
              ) : (
                <Send size={17} strokeWidth={1.5} className="sm:w-5 sm:h-5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
