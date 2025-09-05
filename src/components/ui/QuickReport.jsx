import React, { useEffect, useState } from "react";
import { useLog } from "@/context/LogContext";

export default function QuickReport({ user }) {
  const [logs, setLogs] = useState([]);
  const { addLog } = useLog();

  useEffect(() => {
    // Get logs from localStorage and take the latest 10
    const logsKey = `activityLogs_${user.username}`;
    const storedLogs = JSON.parse(localStorage.getItem(logsKey) || "[]");
    setLogs(storedLogs.slice(-10).reverse()); // latest 10, most recent first
  }, [user]);

  const generatePDF = async () => {
    const { default: jsPDF } = await import("jspdf");
    const autoTableModule = await import("jspdf-autotable");
    const autoTable = autoTableModule.default || autoTableModule;

    const doc = new jsPDF();
    doc.setFontSize(16);
    doc.text("Activity Logs Report", 14, 20);

    if (logs.length > 0) {
      doc.setFontSize(14);
      const logTable = logs.map((log, i) => [
        i + 1,
        typeof log === "string" ? log : log.message || "-",
       
      ]);

      autoTable(doc, {
        head: [["index", "Log"]],
        body: logTable,
        startY: 30,
      });
    }

    addLog(`generated a PDF report for latest 10 activity logs`);
    doc.save("activity_logs.pdf");
  };

  const generateExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();

    if (logs.length > 0) {
      const logData = logs.map((log, i) => ({
        "index": i + 1,
        Log: typeof log === "string" ? log : log.message || "-",
        
      }));

      const ws = XLSX.utils.json_to_sheet(logData);
      XLSX.utils.book_append_sheet(wb, ws, "Activity Logs");
    }

    addLog(`generated an Excel report for latest 10 activity logs`);
    XLSX.writeFile(wb, "activity_logs.xlsx");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center gap-4">
      <h3 className="text-lg font-semibold">Quick Activity Logs Report</h3>
      <p className="text-sm text-gray-500 text-center">
        Generate PDF or Excel reports of your latest 10 activity logs.
      </p>
      <div className="flex gap-4">
        <button
          onClick={generatePDF}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          Download PDF
        </button>
        <button
          onClick={generateExcel}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition"
        >
          Download Excel
        </button>
      </div>
    </div>
  );
}
