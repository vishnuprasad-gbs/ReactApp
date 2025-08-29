import React, { useState } from "react";
import ActivityLog from "./ActivityLog";
import * as XLSX from "xlsx";

function Notification() {
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/activity");
      if (!res.ok) throw new Error("Failed to fetch activity data");
      const data = await res.json();

      // Convert data to Excel
      const worksheet = XLSX.utils.json_to_sheet(data);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "ActivityLogs");

      XLSX.writeFile(workbook, "activity_logs.xlsx");
    } catch (err) {
      console.error(err);
      alert("Failed to export activity logs.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="m-2 flex flex-col items-center gap-4">
      <ActivityLog />

      <button
        onClick={handleExport}
        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        disabled={loading}
      >
        {loading ? "Exporting..." : "Export All Activity Logs"}
      </button>
    </div>
  );
}

export default Notification;
