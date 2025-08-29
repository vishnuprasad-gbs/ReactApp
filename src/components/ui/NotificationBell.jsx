import React, { useState, useRef, useEffect } from "react";
import { Bell } from "lucide-react"; 

function NotificationBell({ notifications = [] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [hasNew, setHasNew] = useState(true);
  const dropdownRef = useRef(null);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
    setHasNew(false);
  };

  
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

  return (
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
  );
}

export default NotificationBell;
