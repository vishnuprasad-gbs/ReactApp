import React, { useEffect, useRef, useState } from "react";
import Drawer from "@/components/ui/Drawer";
import { Link, Outlet, useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { useLog } from "@/context/LogContext";

import { FiBell } from "react-icons/fi";
import ProductTour from "@/components/ProductTour";
import NotificationBell from "@/components/ui/NotificationBell";
import { Bell } from "lucide-react";
const Home = ({ user }) => {
  
  const { addLog } = useLog(); 
  const [notifications, setNotifications] = useState([]);
  const [hasNew, setHasNew] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
   
    const dropdownRef = useRef(null);
  const toggleDropdown = () => {
      setIsOpen(!isOpen);
      setHasNew(false);
    };
  
    // Close dropdown when clicking outside
    useEffect(() => {
      const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
          setIsOpen(false);
        }
      };
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
  
    const lastFive = notifications.slice(-5).reverse();
  const handleLogout = () => {
    // Clear user session
    localStorage.removeItem("user");
    Cookies.remove("user");

    // Add logout to activity log
    addLog(`${user.username} logged out`);

    // Optional: show notification
    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Logout", { body: `${user.username} has logged out` });
    }

    // Redirect to login
   window.location.href = "/";
  };
   useEffect(() => {
    let lastCount = 0;

    const interval = setInterval(async () => {
      try {
        const res = await fetch("http://localhost:5000/activity");
        if (!res.ok) return;
        const data = await res.json();
        
        if (data.length > lastCount) {
          setHasNew(true); 
          const newLogs = data.slice(lastCount); 
          newLogs.forEach(log => {
            if ("Notification" in window && Notification.permission === "granted") {
              new Notification("New Activity", { body: typeof log === 'string' ? log : log.log });
            }
          });
        }

        setNotifications(data);
        lastCount = data.length;
      } catch (err) {
        console.error("Error fetching activity:", err);
      }
    }, 5000)
    return () => clearInterval(interval);
  }, []);
  // const handleBellClick = () => {
  //   setHasNew(false);
    
  //   alert(
  //     notifications.slice(-5).reverse().map(n => (typeof n === "string" ? n : n.log)).join("\n")
  //   );
  // };
  return (
    <div className="h-screen flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 bg-gray-100 shadow-md top-0 left-0 w-full z-30">
        
        <Drawer />
      
        <div className="flex flex-col items-center flex-1 text-center">
          <h1 className="text-lg font-bold">Welcome, {user.username} 🎉</h1>
          <p className="text-sm text-gray-600">Email - {user.email}</p>
        </div>
        
     <div className="flex items-center gap-4">
         
           <div className="relative inline-block" ref={dropdownRef}>
      
      <button
        onClick={toggleDropdown}
        className="relative p-2 rounded-full hover:bg-gray-100"
      >
        <Bell className="w-6 h-6 text-gray-700" />
        {hasNew && (
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-lg border border-gray-200 z-50">
          <div className="p-2 text-sm font-semibold text-gray-700 border-b">
            Notifications
          </div>
          <ul className="max-h-60 overflow-y-auto divide-y">
            {lastFive.length === 0 ? (
              <li className="p-3 text-sm text-gray-500 text-center">
                No notifications
              </li>
            ) : (
              lastFive.map((n, i) => (
                <li key={i} className="p-3 text-sm text-gray-700 hover:bg-gray-50">
                  {typeof n === "string" ? n : n.log}
                </li>
              ))
            )}
          </ul>
        </div>
      )}
    </div>
            
          <button
            onClick={handleLogout}
            className="px-3 py-1 bg-red-500 hover:bg-red-600 text-white rounded-md step5"
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
