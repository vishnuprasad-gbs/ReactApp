import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu } from 'lucide-react';
import { Button } from "./button";


export default function Drawer() {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

 
  const handleLinkClick = () => setIsOpen(false);

  return (
    <div className="relative">
      {/* Drawer button */}
      <button
        onClick={() => setIsOpen(true)}
        className="m-4 px-4 py-2 bg-blue-600 text-white rounded-lg h-10 shadow "
      >
      
        <Menu/>
      </button>

      {/* Overlay */}
      {isOpen && (
        <div
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/50 z-40"
        ></div>
      )}

      {/* Sidebar Drawer */}
      <div
        className={`fixed top-0 left-0 h-full w-80 bg-gray-100 shadow-lg transform transition-transform duration-300 z-50 
        ${isOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Menu</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-600 hover:text-gray-900"
          >
            ✕
          </button>
        </div>

        <ul className="p-4 space-y-3">
          <li>
            <Link
              to="/home/dashboard"
              className={`block p-2 rounded hover:bg-gray-200 ${
                location.pathname === "/home/dashboard" ? "bg-gray-300" : ""
              }`}
              onClick={handleLinkClick}
            >
              Dashboard
            </Link>
          </li>
          <li>
            <Link
              to="/home/location"
              className={`block p-2 rounded hover:bg-gray-200 ${
                location.pathname === "/home/location" ? "bg-gray-300" : ""
              }`}
              onClick={handleLinkClick}
            >
              Location
            </Link>
          </li>
          <li>
            <Link
              to="/home/activity"
              className={`block p-2 rounded hover:bg-gray-200 ${
                location.pathname === "/home/activity" ? "bg-gray-300" : ""
              }`}
              onClick={handleLinkClick}
            >
              Activity Log
            </Link>
            
          
          </li>
        </ul>
      </div>
    </div>
  );
}
