"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import Cookies from "js-cookie";
import Pusher from "pusher-js";

const ChatContext = createContext(undefined);

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error("useChat must be used within a ChatProvider");
  }
  return context;
};

export const ChatProvider = ({ children }) => {
  // State management
  const [allChats, setAllChats] = useState([]);
  const [currentChatMessages, setCurrentChatMessages] = useState([]);
  const [currentChatId, setCurrentChatId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [chatPageNumber, setChatPageNumber] = useState(1);
  const [isFetching, setIsFetching] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Pusher instance and channel refs
  const pusherRef = useRef(null);
  const currentChannelRef = useRef(null);

  // Initialize Pusher
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Initialize Pusher instance
      pusherRef.current = new Pusher("404bce2023768d543d44", {
        cluster: "mt1",
        encrypted: true,
      });

      // Log connection state changes
      pusherRef.current.connection.bind("state_change", (states) => {
        console.log("Pusher connection state:", states.current);
      });

      pusherRef.current.connection.bind("connected", () => {
        console.log("Pusher connected successfully");
      });

      pusherRef.current.connection.bind("error", (err) => {
        console.error("Pusher connection error:", err);
      });
    }

    // Cleanup on unmount
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
      }
    };
  }, []);

  // Subscribe to a chat channel
  const subscribeToChat = useCallback((chatId) => {
    if (!pusherRef.current || !chatId) return;

    // Unsubscribe from previous channel
    if (currentChannelRef.current) {
      pusherRef.current.unsubscribe(currentChannelRef.current.name);
    }

    const channelName = `chat.${chatId}`;
    console.log("Subscribing to channel:", channelName);

    const channel = pusherRef.current.subscribe(channelName);

    channel.bind("pusher:subscription_succeeded", () => {
      console.log("Successfully subscribed to", channelName);
    });

    channel.bind("pusher:subscription_error", (error) => {
      console.error("Subscription error:", error);
    });

    // Listen for new messages
    channel.bind("ChatMessageEvent", (data) => {

      handleNewMessage(data);
    });

    currentChannelRef.current = channel;
    setCurrentChatId(chatId);
  }, []);

  // Unsubscribe from current chat channel
  const unsubscribeFromChat = useCallback(() => {
    if (pusherRef.current && currentChannelRef.current) {
      pusherRef.current.unsubscribe(currentChannelRef.current.name);
      currentChannelRef.current = null;
      setCurrentChatId(null);
    }
  }, []);

  // Handle incoming message from Pusher
  const handleNewMessage = useCallback((data) => {
    try {
      const userType = Cookies.get("user_type");
      const senderType =
        data.sender?.type === "customer" ? "Customer" : "Artist";

      const newMessage = {
        id: data.id,
        chatId: data.chat_id,
        userId: data.user_id,
        message: data.message,
        duration: data.duration,
        type: data.type,
        created_at: data.created_at,
        is_me: userType === senderType,
        sender: data.sender,
      };

      // Check if message already exists to prevent duplicates
      setCurrentChatMessages((prev) => {
        const messageExists = prev.some((msg) => msg.id === newMessage.id);
        if (messageExists) {
          
          return prev;
        }
        return [...prev, newMessage];
      });

      // Update the last message in the chats list
      setAllChats((prev) =>
        prev.map((chat) =>
          chat.id === data.chat_id
            ? {
              ...chat,
              last_message: {
                ...chat.last_message,
                message: data.message,
              },
              updated_at: data.created_at,
            }
            : chat
        )
      );
    } catch (error) {
      console.error("Error processing new message:", error);
    }
  }, []);

  // Fetch all chats
  const getAllChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get("/chats");

      // Check for success - API uses "messages: 'success'" instead of "success: true"
      if (
        response.data.messages === "success" ||
        response.data.status_code === 200
      ) {
        const chats = response.data.chats || [];
        const reversedChats = chats.reverse();
        setAllChats(reversedChats);
        return { success: true, data: chats };
      } else {
        throw new Error(response.data.message || "Failed to fetch chats");
      }
    } catch (error) {
      console.error("Failed to fetch chats - Full error:", error);
      console.error("Error response:", error.response);
      console.error("Error status:", error.response?.status);
      console.error("Error data:", error.response?.data);

      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch chats";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Fetch messages for a specific chat
  const getChatDetails = useCallback(
    async (chatId = null, userId = null, pagination = false) => {
      if (isFetching) return;

      setIsFetching(true);
      if (!pagination) {
        setLoading(true);
      }
      setError(null);

      try {
        const params = {
          page: pagination ? chatPageNumber : 1,
        };

        if (chatId) {
          params.chat_id = chatId;
        } else if (userId) {
          params.peer_id = userId;
        }

        const response = await api.get("/chats/show", { params });

        // Response structure: { chat_id, messages: { data: [...], pagination info } }
        const messagesData = response.data.messages?.data || [];
        const chatIdFromResponse = response.data.chat_id;
        const peerUser = response.data.peer_user;

        // API usually returns Newest -> Oldest. We want Oldest -> Newest for display.
        // So we reverse the array.
        const sortedMessages = [...messagesData].reverse();

        if (!pagination) {
          setCurrentChatMessages(sortedMessages);
          setChatPageNumber(2);
        } else {
          if (sortedMessages.length > 0) {
            // For pagination (older messages), we prepend them to the start
            setCurrentChatMessages((prev) => [...sortedMessages, ...prev]);
            setChatPageNumber((prev) => prev + 1);
          }
        }

        return {
          success: true,
          data: sortedMessages,
          chatId: chatIdFromResponse,
          peerUser: peerUser,
        };
      } catch (error) {
        console.error("Failed to fetch messages - Full error:", error);
        console.error("Error response:", error.response);
        console.error("Error status:", error.response?.status);
        console.error("Error data:", error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to fetch messages";
        setError(errorMessage);
        if (!pagination) {
          toast.error(errorMessage);
        }
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
        setIsFetching(false);
      }
    },
    [chatPageNumber, isFetching]
  );

  // Send a message
  const sendMessage = useCallback(
    async ({
      chatId = null,
      userId = null,
      message = "",
      type = "text",
      file = null,
      duration = null,
    }) => {
      setLoading(true);
      setError(null);

      try {
        const formData = new FormData();

        if (chatId) {
          formData.append("chat_id", chatId);
        } else if (userId) {
          formData.append("peer_id", userId);
        }

        if (type === "text") {
          formData.append("message", message);
          formData.append("type", "text");
        } else if (type === "image" && file) {
          formData.append("file", file);
          formData.append("type", "image");
        } else if (type === "voice" && file) {
          formData.append("file", file);
          formData.append("type", "voice");
          if (duration) {
            formData.append("duration", duration);
          }
        } else if (type === "file" && file) {
          formData.append("file", file);
          formData.append("type", "file");
        } else if (type === "location") {
          formData.append("message", message);
          formData.append("type", "location");
        }

        const response = await api.post("/chats/send", formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });

        if (response.data.status_code === 200 || response.data.status_code === 201) {
          return { success: true, data: response.data.data };
        } else {
          throw new Error(response.data.message || "Failed to send message");
        }
      } catch (error) {
        console.error("SendMessage Error:", error);
        console.error("SendMessage Response:", error.response?.data);

        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to send message";
        setError(errorMessage);
        toast.error(errorMessage);
        return { success: false, message: errorMessage };
      } finally {
        setLoading(false);
      }
    },
    []
  );

  // Mark chat as read
  const markChatAsRead = useCallback(async (chatId) => {
    try {
      const response = await api.post(`/chats/mark-as-read?chat_id=${chatId}`);

      if (response.data.success || response.data.status_code === 200) {
        // Update the chat in the list to mark it as read
        setAllChats((prev) =>
          prev.map((chat) =>
            chat.id === chatId ? { ...chat, unread_count: 0 } : chat
          )
        );
        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to mark as read");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to mark as read";
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Delete a chat
  const deleteChat = useCallback(async (chatId) => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.post(`/chat/delete?chat_id=${chatId}`);

      if (response.data.success || response.data.status_code === 200) {
        toast.success("Chat deleted successfully");
        setAllChats((prev) => prev.filter((chat) => chat.id !== chatId));
        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to delete chat");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete chat";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Delete all chats
  const deleteAllChats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.delete("/chats/all");

      if (response.data.success) {
        toast.success("All chats deleted successfully");
        setAllChats([]);
        return { success: true };
      } else {
        throw new Error(response.data.message || "Failed to delete all chats");
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete all chats";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    } finally {
      setLoading(false);
    }
  }, []);

  // Get unread count
  const getUnreadCount = useCallback(async () => {
    try {
      const response = await api.get("/chats/unread-count");

      if (response.data.status_code === 200) {
        const count = response.data.data?.unread_chats_count || 0;
        setUnreadCount(count);
        return { success: true, count };
      } else {
        throw new Error(
          response.data.message || "Failed to fetch unread count"
        );
      }
    } catch (error) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to fetch unread count";
      console.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  }, []);

  // Reset chat page number (for new chat)
  const resetPagination = useCallback(() => {
    setChatPageNumber(1);
    setCurrentChatMessages([]);
  }, []);

  const value = {
    // State
    allChats,
    currentChatMessages,
    currentChatId,
    loading,
    error,
    chatPageNumber,
    unreadCount,

    // Methods
    getAllChats,
    getChatDetails,
    sendMessage,
    markChatAsRead,
    deleteChat,
    deleteAllChats,
    subscribeToChat,
    unsubscribeFromChat,
    resetPagination,
    getUnreadCount,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export default ChatContext;
