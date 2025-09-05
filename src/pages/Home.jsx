import React, {
  useEffect,
  useRef,
  useState,
  useMemo,
  useCallback,
  Suspense,
} from "react";
import { Outlet } from "react-router-dom";
import Cookies from "js-cookie";
import { useLog } from "@/context/LogContext";
import { Bell, Eye, EyeOff } from "lucide-react";
import { useNotifications } from "@/components/Store/notifications";

const Drawer = React.lazy(() => import("@/components/ui/Drawer"));
const InfiniteScroll = React.lazy(() =>
  import("react-infinite-scroll-component")
);

const Home = ({ user }) => {
  const { clearLog } = useLog();
  const {
    notifications,
    unreadCount,
    clearUnread,
    markAsRead,
    markAsUnread,
    markAllAsRead,
  } = useNotifications();
  const [runTour, setRunTour] = useState(() => {
    return localStorage.getItem("tourComplete") !== "true";
  });
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const [visible, setVisible] = useState(10);

 
  // ✅ stable toggle
  const toggleDropdown = useCallback(() => {
    setIsOpen((prev) => !prev);
  }, []);

  // ✅ stable fetchMore
  const fetchMore = useCallback(() => {
    setVisible((prev) => prev + 10);
  }, []);

  // ✅ memoized notifications list (avoid reverse each render)
  // const visibleNotifications = useMemo(() => {
  //   return [...notifications].slice(0, visible).reverse();
  // }, [notifications, visible]);

  
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Ask permission only once when needed (not on every mount)
  useEffect(() => {
    if (
      "Notification" in window &&
      Notification.permission === "default" // request only if not asked yet
    ) {
      Notification.requestPermission();
    }
  }, []);

  // ✅ optimized logout (clear UI immediately, then network call)
  const handleLogout = useCallback(async () => {
    try {
      // Clear local data first (faster UX)
      localStorage.removeItem("user");
      Cookies.remove("user");
      Cookies.remove("sessionId");
      clearLog();
      clearUnread();

      // log history
      if (user?.username) {
        const stamped = `${new Date().toLocaleString()} — ${user.username} logged out`;
        const key = `activityLogs_${user.username}`;
        const existing = JSON.parse(localStorage.getItem(key) || "[]");
        const updated = [stamped, ...existing].slice(0, 100);
        localStorage.setItem(key, JSON.stringify(updated));
      }

      // fire & forget logout API
      const sessionId = Cookies.get("sessionId");
      if (sessionId) {
        fetch(`http://localhost:5000/session/${sessionId}`, {
          method: "DELETE",
        }).catch(() => {});
      }

      if ("Notification" in window && Notification.permission === "granted") {
        new Notification("Logout", {
          body: `${user?.username || "User"} has logged out`,
        });
      }

      window.location.href = "/";
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [user, clearLog, clearUnread]);

  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 shadow-md top-0 left-0 w-full z-30">
        
        <Suspense fallback={<div>Loading menu...</div>}>
          <Drawer />
        </Suspense>
       
        <div className="flex items-center gap-4">
          {/* Notification Bell */}
          <div className="relative inline-block step5" ref={dropdownRef}>
            <button
              onClick={toggleDropdown}
              className="relative p-2 rounded-full hover:bg-gray-100"
            >
              <Bell className="w-6 h-6 text-gray-700" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
              )}
            </button>

            {isOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white shadow-lg rounded-lg border border-gray-200 z-50 max-h-[400px] overflow-hidden flex flex-col">
                <span className="flex items-center justify-center gap-2">
                  Notifications
                  {unreadCount > 0 && (
                    <span className="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium text-white bg-yellow-500 rounded-full">
                      {unreadCount}
                    </span>
                  )}
                </span>

                {notifications.length === 0 ? (
                  <div className="p-3 text-sm text-gray-500 text-center">
                    No notifications
                  </div>
                ) : (
                 <Suspense fallback={<p className="text-xs text-gray-400 text-center py-2">Loading...</p>}>
                  <InfiniteScroll
                    dataLength={Math.min(visible, notifications.length)}
                    next={fetchMore}
                    hasMore={visible < notifications.length}
                    loader={<p className="text-xs text-gray-400 text-center py-2">Loading...</p>}
                    height={340}
                  >
                    <ul className="divide-y">
                      {/* Slice the notifications array once, render in reverse */}
                      {notifications.slice(0, visible).map((n) => (
                        <li
                          key={n.id}
                          className={`p-3 text-sm flex items-start justify-between ${
                            n.read ? "bg-white" : "bg-gray-50"
                          } hover:bg-gray-100`}
                        >
                          <div>
                            <p className="text-gray-700">{n.message}</p>
                            <p className="text-xs text-gray-400">{n.time}</p>
                          </div>
                          <div className="flex gap-2">
                            {n.read ? (
                              <button
                                onClick={() => markAsUnread(n.id)}
                                className="text-gray-500 hover:text-blue-600"
                              >
                                
                              </button>
                            ) : (
                              <button
                                onClick={() => markAsRead(n.id)}
                                className="text-gray-500 hover:text-green-600"
                              >
                                Mark as read
                              </button>
                            )}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </InfiniteScroll>
                </Suspense>

                )}
              </div>
            )}
          </div>

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md step6"
          >
            Logout
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-50">
        <Outlet context={{ user }} />
      </div>
    </div>
  );
};

export default Home;
