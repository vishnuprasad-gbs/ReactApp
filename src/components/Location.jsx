import React, { useState, useEffect, useMemo, useRef } from "react";
import { MapContainer, TileLayer, Marker, Polyline, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { Pen, Trash } from "lucide-react";
import { useLog } from "../context/LogContext"; // Use the centralized log context
import axios from "axios";

// --- Leaflet marker fix ---
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// --- Helper functions ---
function nowISO() {
  return new Date().toISOString();
}

function buildGrid(center, size = 0.03, segments = 6) {
  const { lat, lng } = center;
  const half = size / 2;
  const lines = [];
  for (let i = 0; i <= segments; i++) {
    const x = lng - half + (size * i) / segments;
    lines.push([[lat - half, x], [lat + half, x]]);
  }
  for (let j = 0; j <= segments; j++) {
    const y = lat - half + (size * j) / segments;
    lines.push([[y, lng - half], [y, lng + half]]);
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
// Simple Euclidean distance
function distance(lat1, lng1, lat2, lng2) {
  return Math.sqrt((lat1 - lat2) ** 2 + (lng1 - lng2) ** 2);
}


function snapToSavedRoad(lat, lng, savedLocations) {
  if (!savedLocations.length) return { lat, lng };

  let nearest = savedLocations[0];
  let minDist = distance(lat, lng, nearest.lat, nearest.lng);

  savedLocations.forEach((loc) => {
    const dist = distance(lat, lng, loc.lat, loc.lng);
    if (dist < minDist) {
      minDist = dist;
      nearest = loc;
    }
  });

  
  const snappedLat = (lat + nearest.lat) / 2;
  const snappedLng = (lng + nearest.lng) / 2;

  return { lat: snappedLat, lng: snappedLng };
}


export default function Location({ user }) {
  const [position, setPosition] = useState({ lat: 12.9716, lng: 77.5946 });
  const [locations, setLocations] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState(null);

  const { log, addLog } = useLog(); // Use centralized context

  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const mapRef = useRef(null);
  const grid = useMemo(() => buildGrid(position, 0.06, 8), [position]);
  const [showMap, setShowMap] = useState(false);
  useEffect(() => {
  const timer = setTimeout(() => setShowMap(true), 200); // delay 200ms
  return () => clearTimeout(timer);
}, []);
  // --- Save / Update Location ---
  const saveLocation = (data) => {
    if (!user?.username) return;

    if (editingLocation) {
      const updated = { ...editingLocation, ...data, lat: position.lat, lng: position.lng };
      const updatedList = locations.map((loc) => (loc.id === editingLocation.id ? updated : loc));
      setLocations(updatedList);
      localStorage.setItem(`locations_${user.username}`, JSON.stringify(updatedList));

      addLog(` edited location: ${updated.name}`);
      toast.success("Location edited successfully!");
      setEditingLocation(null);
    } else {
      const newLoc = { id: Date.now(), ...data, lat: position.lat, lng: position.lng, createdAt: nowISO() };
      const updatedList = [newLoc, ...locations];
      setLocations(updatedList);
      localStorage.setItem(`locations_${user.username}`, JSON.stringify(updatedList));

      addLog(`added location: ${newLoc.name}`);
      toast.success("Location added successfully!");
    }

    reset();
    setIsOpen(false);
  };

  // --- Edit / Delete ---
  const handleEdit = (loc) => {
    setEditingLocation(loc);
    setPosition({ lat: loc.lat, lng: loc.lng });
    reset(loc);
    setIsOpen(true);
  };

  const handleDelete = (id, name) => {
    const updated = locations.filter((loc) => loc.id !== id);
    setLocations(updated);
    localStorage.setItem(`locations_${user.username}`, JSON.stringify(updated));

    addLog(` Deleted location: ${name}`);
    toast.error(`Location "${name}" deleted`);
  };

// --- PDF Export (lazy-loaded) ---
const handleDownloadPDF = async () => {
  if (!locations.length) return toast.info("No locations to export!");

  
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

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
};

// --- Excel Export (lazy-loaded) ---
const handleDownloadExcel = async () => {
  if (!locations.length) return toast.info("No locations to export!");

  // ⏳ Load libraries only when needed
  const XLSX = await import("xlsx");
  const { saveAs } = await import("file-saver");

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
  saveAs(
    new Blob([excelBuffer], {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    }),
    "locations_report.xlsx"
  );
};

  // --- Load user-specific locations ---
  useEffect(() => {
    if (!user?.username) return;
    const raw = localStorage.getItem(`locations_${user.username}`);
    if (raw) setLocations(JSON.parse(raw));
  }, [user]);

const handleChoose = async (latlng) => {
   const snapped = snapToSavedRoad(latlng.lat, latlng.lng, locations);
   setPosition(snapped);

   const lat = snapped.lat;
   const lng = snapped.lng;

  try {
    const url = `https://us1.locationiq.com/v1/reverse.php?key=pk.a367b1d592688dc96e2f0e153225d583&lat=${lat}&lon=${lng}&format=json`;
    const response = await axios.get(url);

    const address = response.data.display_name || "Address not found";
    const structured = response.data.address || {};

    reset({
      ...editingLocation,
      address,
      road: structured.road || "",
      city: structured.city || structured.town || structured.village || "",
      state: structured.state || "",
      postcode: structured.postcode || "",
      country: structured.country || "",
    });

    addLog(` Picked location (snapped to saved road): ${address}`);
    toast.success(`Address fetched: ${address}`);
  } catch (error) {
    console.error("Error fetching address:", error);
    toast.error("Failed to fetch address");
  }
};


  return (
    <div className="min-h-screen w-full bg-gray-50 text-gray-800 p-4 md:p-8 relative">
      {/* Top Buttons */}
      <div className="absolute top-4 right-6 flex items-center gap-3">
        <button onClick={handleDownloadPDF} className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow">📄 PDF Report</button>
        <button onClick={handleDownloadExcel} className="rounded-xl px-4 py-2 bg-green-600 text-white hover:bg-green-700 shadow">📊 Excel Report</button>
        <button onClick={() => { reset(); setEditingLocation(null); setIsOpen(true); }} className="rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700">➕ Add Location</button>
      </div>

      {/* Locations Table */}
      <div className="max-w-6xl mx-auto mt-12 rounded-2xl shadow bg-white p-4">
        <h2 className="text-lg font-semibold mb-3">📌 Saved Locations</h2>
        {!locations.length ? (
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
                    <td className="px-3 py-2 text-center">{loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}</td>
                    <td className="px-3 py-2 text-center text-gray-500">{new Date(loc.createdAt).toLocaleString()}</td>
                    <td className="px-3 py-2 text-center space-x-2">
                      <button onClick={() => handleEdit(loc)} className="text-blue-600 hover:underline"><Pen /></button>
                      <button onClick={() => handleDelete(loc.id, loc.name)} className="text-red-600 hover:underline"><Trash /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl shadow-lg w-full max-w-3xl p-6 relative">
            <button onClick={() => setIsOpen(false)} className="absolute top-3 right-3 text-gray-600 hover:text-black">✖</button>
            <h1 className="text-2xl font-bold mb-2">{editingLocation ? "✏️ Edit Location" : "📍 Add Location"}</h1>
            <form onSubmit={handleSubmit(saveLocation)} className="space-y-3">
              <div>
                <label className="block text-sm font-medium">Name *</label>
                <input type="text" placeholder="Enter name" {...register("name", { required: "Name required", minLength: { value: 3, message: "At least 3 chars" }})} className={`mt-1 w-full rounded-xl border p-2 outline-none ${errors.name ? "border-red-500" : "border-gray-300"}`} />
                {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Address *</label>
                <input type="text" placeholder="Enter address" {...register("address", { required: "Address required", maxLength: { value: 200, message: "Max 200 chars" }})} className={`mt-1 w-full rounded-xl border p-2 outline-none ${errors.address ? "border-red-500" : "border-gray-300"}`} />
                {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
              </div>
              <div>
                <label className="block text-sm font-medium">Type *</label>
                <select {...register("type", { required: "Type required" })} className={`mt-1 w-full rounded-xl border p-2 ${errors.type ? "border-red-500" : "border-gray-300"}`}>
                  <option value="">-- Select Type --</option>
                  <option>Home</option>
                  <option>Office</option>
                  <option>Shop</option>
                  <option>Other</option>
                </select>
                {errors.type && <p className="text-red-500 text-xs mt-1">{errors.type.message}</p>}
              </div>
    <div className="w-full h-72 rounded-xl overflow-hidden shadow-md">
      {!showMap ? (
        // Static image placeholder for fast LCP
        <img
          src={staticMapUrl}
          alt="Map placeholder"
          className="w-full h-full object-cover"
        />
      ) : (
        // Interactive Leaflet map
        <MapContainer
          ref={mapRef}
          center={[position.lat, position.lng]}
          zoom={15}
          scrollWheelZoom
          style={{ height: "100%", width: "100%" }}
          className="rounded-xl"
          preferCanvas={true}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {grid.map((seg, i) => (
            <Polyline key={i} positions={seg} pathOptions={{ weight: 1, opacity: 0.5 }} />
          ))}
          <Marker
            draggable
            position={[position.lat, position.lng]}
            eventHandlers={{
              dragend: (e) => {
                const ll = e.target.getLatLng();
                handleChoose({ lat: ll.lat, lng: ll.lng });
              },
            }}
          />
          <ClickCapture onChoose={handleChoose} />
        </MapContainer>
      )}
    </div>
              <button type="submit" className="mt-4 rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow">{editingLocation ? "Update Location" : "Save Location"}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
