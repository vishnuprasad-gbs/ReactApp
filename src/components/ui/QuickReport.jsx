
import React, { useEffect, useState } from "react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import * as XLSX from "xlsx";
import { useLog } from "@/context/LogContext";
export default function QuickReport({ logs = [],user }) {
  const [locations, setLocations] = useState([]);
const { addLog } = useLog();
  
  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const res = await fetch("http://localhost:5000/savedLoc");
        const data = await res.json();
        
        const latest5 = data.slice(-5).reverse(); 
        setLocations(latest5);
      } catch (err) {
        console.error("Failed to fetch locations:", err);
      }
    };

    fetchLocations();
  }, []);

  
const generatePDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(16);
  doc.text("Quick Report", 14, 20);

  
  if (locations.length > 0) {
    const locTable = locations.map((loc, i) => [
      i + 1,
      loc.name,
      loc.type,
      loc.lat.toFixed(5),
      loc.lng.toFixed(5),
      new Date(loc.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [["#", "Name", "Type", "Lat", "Lng", "Saved At"]],
      body: locTable,
      startY: 30,
    });
  }

 
  if (logs.length > 0) {
    doc.text(
      "Activity Logs",
      14,
      doc.previousAutoTable ? doc.previousAutoTable.finalY + 10 : 30
    );
    const logTable = logs.map((log, i) => [i + 1, log]);
    autoTable(doc, {
      head: [["#", "Log"]],
      body: logTable,
      startY: doc.previousAutoTable ? doc.previousAutoTable.finalY + 15 : 40,
    });
  }
addLog(`${user.username} generated pdf quick reports`);
  doc.save("quick_report.pdf");
};


  
  const generateExcel = () => {
    const wb = XLSX.utils.book_new();

   
    if (locations.length > 0) {
      const locData = locations.map((loc, i) => ({
        "#": i + 1,
        Name: loc.name,
        Type: loc.type,
        Lat: loc.lat,
        Lng: loc.lng,
        "Saved At": new Date(loc.createdAt).toLocaleString(),
      }));
      const ws = XLSX.utils.json_to_sheet(locData);
      XLSX.utils.book_append_sheet(wb, ws, "Locations");
    }

    
    if (logs.length > 0) {
      const logData = logs.map((log, i) => ({ "#": i + 1, Log: log }));
      const ws = XLSX.utils.json_to_sheet(logData);
      XLSX.utils.book_append_sheet(wb, ws, "Activity Logs");
    }
    addLog(`${user.username} generated excel quick reports`);
    XLSX.writeFile(wb, "quick_report.xlsx");
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center gap-4">
      <h3 className="text-lg font-semibold">Quick Reports</h3>
      <p className="text-sm text-gray-500 text-center">
        Generate PDF or Excel reports of your latest 5 locations and activity
        logs.
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
