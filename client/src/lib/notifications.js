import api from "./api";

/**
 * Fetch all notifications
 * @returns {Promise} - Returns a promise that resolves to the notifications data
 */
export const getAllNotifications = async () => {
  try {
    const response = await api.get("/notifications");
    return response.data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
    throw error;
  }
};

/**
 * Get unread notification count
 * @returns {Promise} - Returns a promise that resolves to the unread count
 */
export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get("/notifications/unread");
    return response.data;
  } catch (error) {
    console.error("Error fetching unread notification count:", error);
    throw error;
  }
};

/**
 * Mark a notification as read
 * @param {string} notificationId - The ID of the notification to mark as read
 * @returns {Promise} - Returns a promise that resolves to the updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    console.error("Error marking notification as read:", error);
    throw error;
  }
};

/**
 * Mark all notifications as read
 * @returns {Promise} - Returns a promise that resolves to the result
 */
export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.post("/notifications/mark-all-read");
    return response.data;
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    throw error;
  }
};

/**
 * Delete a notification
 * @param {string} notificationId - The ID of the notification to delete
 * @returns {Promise} - Returns a promise that resolves to the result
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await api.delete(
      `/notifications/${notificationId}/delete`
    );
    return response.data;
  } catch (error) {
    console.error("Error deleting notification:", error);
    throw error;
  }
};

/**
 * Delete all notifications
 * @returns {Promise} - Returns a promise that resolves to the result
 */
export const deleteAllNotifications = async () => {
  try {
    const response = await api.delete("/notifications/delete-all");
    return response.data;
  } catch (error) {
    console.error("Error deleting all notifications:", error);
    throw error;
  }
};
