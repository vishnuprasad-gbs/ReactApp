import React, { useState, useEffect, useMemo, useRef, useContext, createContext } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Polyline,
  useMapEvents,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import { useForm } from "react-hook-form";

// --- Leaflet marker fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Context ---
const LogContext = createContext();
export function useLog() {
  return useContext(LogContext);
}

function nowISO() {
  return new Date().toISOString();
}

function buildGrid(center, size = 0.03, segments = 6) {
  const { lat, lng } = center;
  const half = size / 2;
  const lines = [];
  for (let i = 0; i <= segments; i++) {
    const x = lng - half + (size * i) / segments;
    lines.push([
      [center.lat - half, x],
      [center.lat + half, x],
    ]);
  }
  for (let j = 0; j <= segments; j++) {
    const y = lat - half + (size * j) / segments;
    lines.push([
      [y, center.lng - half],
      [y, center.lng + half],
    ]);
  }
  return lines;
}

function ClickCapture({ onChoose }) {
  useMapEvents({
    click(e) {
      onChoose(e.latlng);
    },
  });
  return null;
}

export default function Location({ user }) {
  const [form, setForm] = useState({ name: "", address: "", type: "Home" });
  const [position, setPosition] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locations, setLocations] = useState([]);
  const [log, setLog] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
    const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm();
  const mapRef = useRef(null);

  const grid = useMemo(() => buildGrid(position, 0.06, 8), [position]);

  // --- PDF Export ---
  function handleDownloadPDF() {
    if (!locations || locations.length === 0) {
      alert("No locations to export!");
      return;
    }

    const doc = new jsPDF();
    doc.text("Saved Locations Report", 14, 15);

    const tableColumn = ["Name", "Address", "Type", "Coordinates", "Created At"];
    const tableRows = locations.map((loc) => [
      loc.name,
      loc.address,
      loc.type,
      `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`,
      new Date(loc.createdAt).toLocaleString(),
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 25,
      theme: "grid",
      styles: { halign: "center", fontSize: 8 },
      headStyles: { fillColor: [66, 135, 245], halign: "center" },
    });

    doc.save("locations_report.pdf");
  }

  // --- Excel Export ---
  function handleDownloadExcel() {
    if (!locations || locations.length === 0) {
      alert("No locations to export!");
      return;
    }
    const worksheetData = locations.map((loc) => ({
      Name: loc.name,
      Address: loc.address,
      Type: loc.type,
      Coordinates: `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`,
      "Created At": new Date(loc.createdAt).toLocaleString(),
    }));
    const worksheet = XLSX.utils.json_to_sheet(worksheetData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Locations");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    saveAs(blob, "locations_report.xlsx");
  }

  // --- Lifecycle ---
  useEffect(() => {
    const raw = localStorage.getItem("locations");
    if (raw) setLocations(JSON.parse(raw));
  }, []);
  useEffect(() => {
    localStorage.setItem("locations", JSON.stringify(locations));
  }, [locations]);

  // --- Log handling (simplified) ---
  function addLog(msg) {
    const stamped = `${new Date().toLocaleString()} — ${msg}`;
    setLog((l) => [stamped, ...l].slice(0, 100));
    axios.post("http://localhost:5000/activity", { log: stamped }).catch(() => {});
  }

  // --- Handlers ---
  function handleChoose(latlng) {
    setPosition(latlng);
    addLog(`${user.username} picked coordinates: ${latlng.lat}, ${latlng.lng}`);
  }

  async function handleSave(e) {
    e.preventDefault();
    const item = {
      id: crypto.randomUUID(),
      name: form.name.trim(),
      address: form.address.trim(),
      type: form.type,
      lat: position.lat,
      lng: position.lng,
      createdAt: nowISO(),
    };
    if (!item.name) {
      alert("Please enter a name");
      return;
    }
    setLocations((prev) => [item, ...prev]);
    addLog(`${user.username} Saved location: ${item.name}`);
    setForm({ name: "", address: "", type: "Home" });
    setIsOpen(false); // close modal after save
  }

  return (
    <LogContext.Provider value={{ log, addLog }}>
      <div className="min-h-screen w-full bg-gray-50 text-gray-800 p-4 md:p-8 relative">
       
        <div className="absolute top-4 right-6">
          <button
            onClick={() => setIsOpen(true)}
            className="rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700`"
          >
            ➕ Add Location
          </button>
        </div>

        {/* Saved Locations Table */}
        <div className="max-w-6xl mx-auto mt-12 rounded-2xl shadow bg-white p-4">
          <h2 className="text-lg font-semibold mb-3">📌 Saved Locations</h2>
          {locations.length === 0 ? (
            <p className="text-gray-500">No locations saved yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm border border-gray-200 rounded-lg">
                <thead className="bg-gray-100 text-gray-700">
                  <tr>
                    <th className="px-3 py-2 text-center">Name</th>
                    <th className="px-3 py-2 text-center">Address</th>
                    <th className="px-3 py-2 text-center">Type</th>
                    <th className="px-3 py-2 text-center">Coordinates</th>
                    <th className="px-3 py-2 text-center">Created At</th>
                    <th className="px-3 py-2 text-center">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {locations.map((loc) => (
                    <tr key={loc.id} className="border-t hover:bg-gray-50 transition">
                      <td className="px-3 py-2 text-center">{loc.name}</td>
                      <td className="px-3 py-2 text-center">{loc.address}</td>
                      <td className="px-3 py-2 text-center">{loc.type}</td>
                      <td className="px-3 py-2 text-center">
                        {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
                      </td>
                      <td className="px-3 py-2 text-center text-gray-500">
                        {new Date(loc.createdAt).toLocaleString()}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <button
                          className="text-xs rounded-lg px-2 py-1 bg-gray-100 hover:bg-gray-200"
                          onClick={() =>
                            setLocations((prev) => prev.filter((x) => x.id !== loc.id))
                          }
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="flex justify-center gap-3 mt-4">
            <button
              onClick={handleDownloadPDF}
              className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow"
            >
              📄 PDF Report
            </button>
            <button
              onClick={handleDownloadExcel}
              className="rounded-xl px-4 py-2 bg-green-600 text-white hover:bg-green-700 shadow"
            >
              📊 Excel Report
            </button>
          </div>
        </div>

        {/* 🔹 Modal for Add Location */}
        {isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative">
             
              <button
                onClick={() => setIsOpen(false)}
                className="absolute top-3 right-3 text-gray-600 hover:text-black"
              >
                ✖
              </button>

              <h1 className="text-2xl font-bold mb-2">📍 Add Location</h1>
              <p className="text-sm text-gray-500 mb-4">
                Enter details, pick coordinates on the map, and save locally.
              </p>

             
              <form onSubmit={handleSave} className="space-y-3">
                <div>
                       <label className="block text-sm font-medium">Name *</label>
                <input
                  {...register("name", {
                    required: "Name is required",
                    minLength: { value: 3, message: "At least 3 characters" },
                  })}
                  className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Home, Office"
                />
                {errors.name && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium">Address *</label>
                <input
                  {...register("address", {
                    maxLength: {
                      value: 200,
                      message: "Max 200 characters allowed",
                    },required: "Address is required",
                  })}
                  className={`mt-1 w-full rounded-xl border p-2 outline-none ${
                    errors.address ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="address"
                />
                {errors.address && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.address.message}
                  </p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium">Type *</label>
                <select
                  {...register("type", { required: "Type is required" })}
                  className={`mt-1 w-full rounded-xl border p-2 ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="">-- Select Type --</option>
                  <option>Home</option>
                  <option>Office</option>
                  <option>Shop</option>
                  <option>Other</option>
                </select>
                {errors.type && (
                  <p className="text-red-500 text-xs mt-1">
                    {errors.type.message}
                  </p>
                )}
              </div>

                {/* Map */}
                <MapContainer
                  ref={mapRef}
                  center={[position.lat, position.lng]}
                  zoom={15}
                  scrollWheelZoom
                  style={{ height: 300, width: "100%" }}
                  className="rounded-xl"
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  {grid.map((seg, i) => (
                    <Polyline
                      key={i}
                      positions={seg}
                      pathOptions={{ weight: 1, opacity: 0.5 }}
                    />
                  ))}
                  <Marker
                    draggable
                    position={[position.lat, position.lng]}
                    eventHandlers={{
                      dragend: (e) => {
                        const ll = e.target.getLatLng();
                        setPosition({ lat: ll.lat, lng: ll.lng });
                      },
                    }}
                  />
                  <ClickCapture onChoose={handleChoose} />
                </MapContainer>

                <button
                  type="submit"
                  className="mt-4 rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow"
                >
                  Save Location
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </LogContext.Provider>
  );
}
