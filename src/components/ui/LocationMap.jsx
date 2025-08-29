import React from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Import marker images explicitly (Vite-compatible)
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

// Fix Leaflet default marker issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl,
  iconUrl,
  shadowUrl,
});

export default function LocationMap({ lastLocation }) {
  if (!lastLocation) {
    return <p className="text-gray-500">No location data available</p>;
  }

  return (
    <div className="w-full h-64 rounded-2xl overflow-hidden shadow-md">
      <MapContainer
        center={[lastLocation.lat, lastLocation.lng]}
        zoom={13}
        scrollWheelZoom={false}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />
        <Marker position={[lastLocation.lat, lastLocation.lng]}>
          <Popup>
            <b>{lastLocation.name}</b> <br />
            Type: {lastLocation.type} <br />
            {lastLocation.lat}, {lastLocation.lng}
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}
