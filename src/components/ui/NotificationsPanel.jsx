
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Bell } from "lucide-react";

export default function NotificationsPanel() {
  const [notifications, setNotifications] = useState([]);

 
  useEffect(() => {
    async function fetchNotifications() {
      try {
        const res = await axios.get("http://localhost:5000/activity");
        setNotifications(res.data);
      } catch (err) {
        console.error("Failed to fetch notifications, using dummy data", err);
       
        setNotifications([
          { id: 1, message: "New location saved by user", time: "5 min ago" },
          { id: 2, message: "System backup completed", time: "1 hr ago" },
          { id: 3, message: "New report generated", time: "2 hrs ago" },
        ]);
      }
    }
    fetchNotifications();
  }, []);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex items-center mb-2">
        <Bell className="text-yellow-600 mr-2" />
        <h3 className="text-lg font-semibold">Notifications</h3>
      </div>
      <div className="flex-1 overflow-auto">
        {notifications.length === 0 ? (
          <p className="text-sm text-gray-500">No notifications</p>
        ) : (
          <ul className="space-y-2">
            {notifications.map((note) => (
              <li
                key={note.id}
                className="p-2 rounded-lg bg-yellow-50 border border-yellow-200 text-sm hover:bg-yellow-100 transition"
              >
                <p>{note.message}</p>
                <p className="text-xs text-gray-400">{note.time}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
