// src/context/LogContext.js
import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

const LogContext = createContext();

export function LogProvider({ children }) {
  const [log, setLog] = useState([]);

  // Fetch logs from backend on mount
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await axios.get("http://localhost:5000/activity");
        setLog(res.data || []);
      } catch (err) {
        console.error("Error fetching logs:", err);
      }
    }
    fetchLogs();
  }, []);

  function addLog(msg) {
    const stamped = `${new Date().toLocaleString()} — ${msg}`;
    setLog((l) => [stamped, ...l].slice(0, 100));

    
    axios
      .post("http://localhost:5000/activity", { log: stamped })
      .then((res) => console.log("log saved", res.data))
      .catch((err) => console.error("error saving log", err));
  }

  return (
    <LogContext.Provider value={{ log, addLog }}>
      {children}
    </LogContext.Provider>
  );
}

export function useLog() {
  return useContext(LogContext);
}
