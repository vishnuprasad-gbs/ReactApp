
import React, {
  useEffect,
  useMemo,
  useRef,
  useState,
  useContext,
  createContext,
} from "react";
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


delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});


const LogContext = createContext();
export function useLog() {
  return useContext(LogContext);
}

// --- Helpers ---
const storageKey = "locations";
function handleDownloadPDF() {
  const doc = new jsPDF();

  doc.text("📌 Saved Locations Report", 14, 15);

  const tableColumn = ["Name", "Address", "Type", "Coordinates", "Created At"];
  const tableRows = [];

  locations.forEach((loc) => {
    const row = [
      loc.name,
      loc.address,
      loc.type,
      `${loc.lat.toFixed(5)}, ${loc.lng.toFixed(5)}`,
      new Date(loc.createdAt).toLocaleString(),
    ];
    tableRows.push(row);
  });

  doc.autoTable({
    head: [tableColumn],
    body: tableRows,
    startY: 25,
    theme: "grid",
    styles: { halign: "center" }, // center align everything
    headStyles: { fillColor: [66, 135, 245] }, // blue header
  });

  doc.save("locations_report.pdf");
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
      [lat - half, x],
      [lat + half, x],
    ]);
  }
  for (let j = 0; j <= segments; j++) {
    const y = lat - half + (size * j) / segments;
    lines.push([
      [y, lng - half],
      [y, lng + half],
    ]);
  }
  return lines;
}

function downloadJSON(filename, data) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

// --- Map Click Handler ---
function ClickCapture({ onChoose }) {
  useMapEvents({
    click(e) {
      onChoose(e.latlng);
    },
  });
  return null;
}

// --- Component ---
export default function Location({ user }) {
  const [form, setForm] = useState({ name: "", address: "", type: "Home" });
  const [position, setPosition] = useState({
    lat: 12.9716,
    lng: 77.5946, // Bengaluru
  });
  const [locations, setLocations] = useState([]);
  const [log, setLog] = useState([]);
  const [isOpen,setIsOpen]=useState(false)

  const mapRef = useRef(null);

  // Grid
  const grid = useMemo(
    () => buildGrid(position, 0.06, 8),
    [position.lat, position.lng]
  );
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

  // call autoTable
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
  // Load saved locations
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) setLocations(JSON.parse(raw));
    } catch (e) {
      console.error("Failed to read localStorage", e);
    }
  }, []);


  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(locations));
    } catch {}
  }, [locations]);

  
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  
  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch("http://localhost:5000/activity");
        const data = await res.json();
        setLog(data);
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
      .then((res) => {
        console.log("log saved", res.data);
      })
      .catch((err) => {
        console.log("error saving log", err);
      });
  }

 
  function handleChoose(latlng) {
    setPosition(latlng);
    addLog(
      `${user.username} Picked coordinates: ${latlng.lat.toFixed(
        5
      )}, ${latlng.lng.toFixed(5)}`
    );
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

    try {
      await axios.post("http://localhost:5000/savedLoc", item);
      console.log("Saved location sent to API");
    } catch (error) {
      console.error("Error saving location:", error);
      alert("Failed to save location on server!");
    }

    const evt = new CustomEvent("location:saved", { detail: item });
    window.dispatchEvent(evt);

    if ("Notification" in window && Notification.permission === "granted") {
      new Notification("Location saved", {
        body: `${item.name} — ${item.lat.toFixed(5)}, ${item.lng.toFixed(5)}`,
      });
    }

    setForm((f) => ({ ...f, name: "", address: "" }));
  }



  function handleClearAll() {
    if (!confirm("Clear all saved locations?")) return;
    setLocations([]);
    addLog(`${user.username} Cleared all saved locations`);
  }

  // Listen to external events
  useEffect(() => {
    function onExtSave(e) {
      const d = e.detail;
      addLog(
        `${user.username} (Event) location:saved → ${d?.name ?? "<no-name>"}`
      );
    }
    window.addEventListener("location:saved", onExtSave);
    return () => window.removeEventListener("location:saved", onExtSave);
  }, []);

  return (
  <LogContext.Provider value={{ log, addLog }}>
      <div className="min-h-screen w-full bg-gray-50 text-gray-800 p-4 md:p-8">
        <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* 1. Form (col 1) */}
          <div className="rounded-2xl shadow bg-white p-4 md:p-6">
            <h1 className="text-2xl font-bold">📍 Add Location</h1>
            <p className="text-sm text-gray-500">
              Enter details, pick coordinates on the map, and save locally.
            </p>
            <form onSubmit={handleSave} className="mt-4 space-y-3">
              {/* name */}
              <div>
                <label className="block text-sm font-medium">Name</label>
                <input
                  className="mt-1 w-full rounded-xl border p-2 outline-none focus:ring"
                  placeholder="e.g., Home, Office, Cafe"
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                />
              </div>
              {/* address */}
              <div >
               
                <label className="block text-sm font-medium">Address</label>
                <input
                  className="mt-1 w-full rounded-xl border p-2 outline-none focus:ring"
                  placeholder="Optional address"
                  value={form.address}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, address: e.target.value }))
                  }
                />
              </div>
              {/* type + coords */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium">Type</label>
                  <select
                    className="mt-1 w-full rounded-xl border p-2"
                    value={form.type}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, type: e.target.value }))
                    }
                  >
                    <option>Home</option>
                    <option>Office</option>
                    <option>Shop</option>
                    <option>Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium">Coordinates</label>
                  <div className="mt-1 text-sm bg-gray-100 rounded-xl p-2">
                    {position.lat.toFixed(5)}, {position.lng.toFixed(5)}
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="rounded-xl px-4 py-2 bg-emerald-600 text-white hover:bg-emerald-700 shadow"
              >
                Save Location
              </button>
            </form>
          </div>

          {/* 2. Map (col 2) */}
          <div className="rounded-2xl overflow-hidden shadow bg-white">
            <MapContainer
              ref={mapRef}
              center={[position.lat, position.lng]}
              zoom={15}
              scrollWheelZoom
              style={{ height: 420, width: "100%" }}
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
                    const m = e.target;
                    const ll = m.getLatLng();
                    setPosition({ lat: ll.lat, lng: ll.lng });
                    addLog(
                      `${user.username} Moved marker: ${ll.lat.toFixed(
                        5
                      )}, ${ll.lng.toFixed(5)}`
                    );
                  },
                }}
              />
              <ClickCapture onChoose={handleChoose} />
            </MapContainer>
          </div>

     {/* 3. Table (full width row) */}
<div className="lg:col-span-2 rounded-2xl shadow bg-white p-4">
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
            <tr
              key={loc.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-3 py-2 text-center">{loc.name}</td>
              <td className="px-3 py-2 text-center">{loc.address}</td>
              <td className="px-3 py-2 text-center">{loc.type}</td>
              <td className="px-3 py-2 text-center">
                {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
              </td>
              <td className="px-3 py-2 text-center text-gray-500">
                {new Date(loc.createdAt).toLocaleString()}
              </td>
               <button
                  className="text-xs rounded-lg px-2 py-1 bg-gray-100 hover:bg-gray-200"
                  onClick={() => {
                    setLocations((prev) => prev.filter((x) => x.id !== loc.id));
                    addLog(`Deleted: ${loc.name}`);
                  }}
                >
                  Delete
                </button>
            </tr>
            
          ))}
        </tbody>
      </table>
    </div>
  )}

  
  <div className="flex justify-center gap-3 mt-4 ">
    
    <button
      onClick={handleDownloadPDF}
      className="rounded-xl px-4 py-2 bg-red-600 text-white hover:bg-red-700 shadow"
    >
      📄 PDF Report
    </button>
  </div>
</div>

        </div>
      </div>
    </LogContext.Provider>
  );
}
