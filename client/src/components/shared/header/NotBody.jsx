"use client";

import { useState, useEffect, useRef } from "react";
import { useLocale } from "next-intl";
import { Bell, X, Check, CheckCheck, Trash2, Clock } from "lucide-react";
import {
  getAllNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "@/lib/notifications";
import { formatDistanceToNow } from "date-fns";
import { ar, enUS } from "date-fns/locale";

export default function NotBody({ isOpen, onClose, onUnreadCountChange }) {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const locale = useLocale();
  const isRtl = locale === "ar";
  const notBodyRef = useRef(null);

  // Fetch notifications on mount
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  // Fetch unread count on component mount
  useEffect(() => {
    fetchUnreadCount();
  }, []);

  // Update parent component with unread count
  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event) => {
      // Ignore if the target is no longer in the document (e.g. was deleted)
      if (!event.target.isConnected) return;

      // Only close if clicking outside the notBodyRef
      if (notBodyRef.current && !notBodyRef.current.contains(event.target)) {
        onClose();
      }
    };

    // Add event listener after a small delay to prevent immediate closure
    const timeoutId = setTimeout(() => {
      document.addEventListener("click", handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("click", handleClickOutside);
    };
  }, [isOpen, onClose]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const [notificationsData, unreadData] = await Promise.all([
        getAllNotifications(),
        getUnreadNotificationCount(),
      ]);
      setNotifications(notificationsData.notifications || []);
      setUnreadCount(unreadData.countNotifications || 0);
    } catch (error) {
      console.error("Failed to fetch notifications:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUnreadCount = async () => {
    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(data.countNotifications || 0);
    } catch (error) {
      console.error("Failed to fetch unread count:", error);
    }
  };

  const handleMarkAsRead = async (notificationId, event) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }
    try {
      await markNotificationAsRead(notificationId);
      setNotifications((prev) =>
        prev.map((notif) =>
          notif.id === notificationId
            ? { ...notif, read_at: new Date().toISOString() }
            : notif
        )
      );
      // Refetch unread count from server
      await fetchUnreadCount();
    } catch (error) {
      console.error("Failed to mark notification as read:", error);
    }
  };

  const handleMarkAllAsRead = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read_at: new Date().toISOString() }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to mark all notifications as read:", error);
    }
  };

  const handleDelete = async (notificationId, event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await deleteNotification(notificationId);
      setNotifications((prev) =>
        prev.filter((notif) => notif.id !== notificationId)
      );
      // Refetch unread count from server
      await fetchUnreadCount();
    } catch (error) {
      console.error("Failed to delete notification:", error);
    }
  };

  const handleDeleteAll = async (event) => {
    event.preventDefault();
    event.stopPropagation();
    try {
      await deleteAllNotifications();
      setNotifications([]);
      setUnreadCount(0);
    } catch (error) {
      console.error("Failed to delete all notifications:", error);
    }
  };

  const getTimeAgo = (date) => {
    return formatDistanceToNow(new Date(date), {
      addSuffix: true,
      locale: isRtl ? ar : enUS,
    });
  };

  const getNotificationIcon = (key) => {
    const iconClass = "w-5 h-5";
    switch (key) {
      case "new_booking_request":
        return <Bell className={iconClass} />;
      case "booking_inquiry":
        return <Clock className={iconClass} />;
      case "welcome_message":
        return <Check className={iconClass} />;
      default:
        return <Bell className={iconClass} />;
    }
  };

  const getNotificationColor = (key) => {
    switch (key) {
      case "new_booking_request":
        return "bg-blue-500/10 text-blue-500";
      case "booking_inquiry":
        return "bg-amber-500/10 text-amber-500";
      case "welcome_message":
        return "bg-green-500/10 text-green-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  if (!isOpen) return null;

  return (
    <div
      ref={notBodyRef}
      className={`absolute top-full ${
        isRtl ? "left-0" : "right-0"
      } mt-2 w-[420px] max-w-[95vw] bg-white dark:bg-[#363636] rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-600 overflow-hidden z-[100] animate-in fade-in slide-in-from-top-5 duration-200`}
    >
      {/* Header */}
      <div className="bg-gradient-to-r from-main/10 to-amber-500/5 dark:from-main/20 dark:to-amber-500/10 px-5 py-4 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-main/20 dark:bg-main/30 flex items-center justify-center">
              <Bell className="w-5 h-5 text-main" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {isRtl ? "الإشعارات" : "Notifications"}
              </h3>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {isRtl
                    ? `${unreadCount} إشعارات غير مقروءة`
                    : `${unreadCount} unread notifications`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 flex items-center justify-center transition-colors"
            aria-label="Close"
          >
            <X className="w-4 h-4 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        {/* Action Buttons */}
        {notifications.length > 0 && (
          <div className="mt-3 flex gap-2">
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                onMouseDown={(e) => e.stopPropagation()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 text-sm font-medium text-gray-700 dark:text-gray-200 rounded-lg transition-colors"
              >
                <CheckCheck className="w-4 h-4" />
                {isRtl ? "تعليم الكل كمقروء" : "Mark all as read"}
              </button>
            )}
            <button
              onClick={handleDeleteAll}
              onMouseDown={(e) => e.stopPropagation()}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/30 text-sm font-medium text-red-600 dark:text-red-400 rounded-lg transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              {isRtl ? "حذف الكل" : "Delete all"}
            </button>
          </div>
        )}
      </div>

      {/* Notification List */}
      <div className="max-h-[500px] overflow-y-auto scrollbar-hide">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-main"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mb-4">
              <Bell className="w-8 h-8 text-gray-400 dark:text-gray-500" />
            </div>
            <p className="text-gray-600 dark:text-gray-400 text-center">
              {isRtl ? "لا توجد إشعارات" : "No notifications"}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700">
            {notifications.map((notification) => {
              const isUnread = !notification.read_at;
              const title = isRtl
                ? notification.data.title_ar
                : notification.data.title_en;
              const message = isRtl
                ? notification.data.message_ar
                : notification.data.message_en;

              return (
                <div
                  key={notification.id}
                  className={`relative px-5 py-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors group ${
                    isUnread ? "bg-main/5 dark:bg-main/10" : ""
                  }`}
                >
                  {/* Unread Indicator */}
                  {isUnread && (
                    <div
                      className={`absolute top-5 ${
                        isRtl ? "right-2" : "left-2"
                      } w-2 h-2 rounded-full bg-main`}
                    ></div>
                  )}

                  <div
                    className={`flex gap-3 ${
                      isUnread ? (isRtl ? "mr-3" : "ml-3") : ""
                    }`}
                  >
                    {/* Icon */}
                    <div
                      className={`flex-shrink-0 w-10 h-10 rounded-full ${getNotificationColor(
                        notification.data.key
                      )} flex items-center justify-center`}
                    >
                      {getNotificationIcon(notification.data.key)}
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2 mb-1">
                        <h4 className="text-sm font-semibold text-gray-900 dark:text-white">
                          {title}
                        </h4>
                        {/* Actions */}
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          {isUnread && (
                            <button
                              onClick={(e) =>
                                handleMarkAsRead(notification.id, e)
                              }
                              onMouseDown={(e) => e.stopPropagation()}
                              className="p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                              title={isRtl ? "تعليم كمقروء" : "Mark as read"}
                            >
                              <Check className="w-3.5 h-3.5 text-gray-600 dark:text-gray-400" />
                            </button>
                          )}
                          <button
                            onClick={(e) => handleDelete(notification.id, e)}
                            onMouseDown={(e) => e.stopPropagation()}
                            className="p-1.5 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                            title={isRtl ? "حذف" : "Delete"}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />
                          </button>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed mb-2">
                        {message}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{getTimeAgo(notification.created_at)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer */}
      {/* {notifications.length > 0 && (
        <div className="bg-gray-50 dark:bg-gray-800 px-5 py-3 border-t border-gray-200 dark:border-gray-600">
          <button className="w-full text-center text-sm font-medium text-main hover:text-darker dark:hover:text-main/80 transition-colors">
            {isRtl ? "عرض جميع الإشعارات" : "View all notifications"}
          </button>
        </div>
      )} */}
    </div>
  );
}
