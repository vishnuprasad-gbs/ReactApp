import { create } from "zustand";

export const useNotifications = create((set) => ({
  notifications: [],       // list of notifications
  unreadCount: 0,          // unread counter

  // Add a new notification
  addNotification: (message) =>
    set((state) => ({
      notifications: [
        ...state.notifications,
        {
          id: Date.now(),
          message,
          time: new Date().toLocaleTimeString(),
          read: false, // default unread
        },
      ],
      unreadCount: state.unreadCount + 1,
    })),

  // Mark one notification as read
  markAsRead: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  // Mark one notification as unread
  markAsUnread: (id) =>
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, read: false } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.read).length,
      };
    }),

  // Mark all as read
  markAllAsRead: () =>
    set((state) => {
      const updated = state.notifications.map((n) => ({ ...n, read: true }));
      return { notifications: updated, unreadCount: 0 };
    }),

  // Clear unread counter manually
  clearUnread: () =>
    set((state) => ({
      notifications: state.notifications,
      unreadCount: 0,
    })),

  // Remove a notification by ID
  removeNotification: (id) =>
    set((state) => ({
      notifications: state.notifications.filter((n) => n.id !== id),
      unreadCount: state.notifications.filter((n) => !n.read && n.id !== id).length,
    })),

  // Clear all notifications
  clearAll: () => set({ notifications: [], unreadCount: 0 }),
}));
