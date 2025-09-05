import { useNotifications } from "@/components/Store/notifications";
import React, { createContext, useContext, useState, useEffect } from "react";

const LogContext = createContext();

export function LogProvider({ children, user }) {
  const [log, setLog] = useState([]);
  const { addNotification } = useNotifications()
  // Load user's logs from localStorage when user changes
  useEffect(() => {
    if (user?.username) {
      const key = `activityLogs_${user.username}`;
      const storedLogs = JSON.parse(localStorage.getItem(key) || "[]");
      setLog(storedLogs);
    } else {
      setLog([]);
    }
  }, [user]);

  // Add a new log entry
  function addLog(msg) {
    if (!user?.username) return;
    const stamped = `${new Date().toLocaleString()} — ${msg}`;
    const key = `activityLogs_${user.username}`;
    const existing = JSON.parse(localStorage.getItem(key) || "[]");
    const updated = [stamped, ...existing].slice(0, 100);
    localStorage.setItem(key, JSON.stringify(updated));
    setLog(updated);
     addNotification(msg); 
  }

  // Clear logs (on logout)
  function clearLog() {
    if (!user?.username) return;
    const key = `activityLogs_${user.username}`;
    localStorage.removeItem(key);
    setLog([]);
  }

  return (
    <LogContext.Provider value={{ log, addLog, clearLog, setLog }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  return useContext(LogContext);
}
