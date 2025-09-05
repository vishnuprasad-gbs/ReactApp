import React, { useMemo, useState, useEffect, Suspense } from "react";
import { TileLayer, Marker, Tooltip, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Marker fix
import iconRetinaUrl from "leaflet/dist/images/marker-icon-2x.png";
import iconUrl from "leaflet/dist/images/marker-icon.png";
import shadowUrl from "leaflet/dist/images/marker-shadow.png";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({ iconRetinaUrl, iconUrl, shadowUrl });

const MapContainer = React.lazy(() =>
  import("react-leaflet").then((mod) => ({ default: mod.MapContainer }))
);

// Helper: fit map bounds to polyline
function FitBounds({ coords }) {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      map.fitBounds(coords);
    }
  }, [coords, map]);
  return null;
}

export default function LocationMap({ lastLocation, savedLocations = [] }) {
  const [showMap, setShowMap] = useState(false);
  const [routeCoords, setRouteCoords] = useState([]);

  useEffect(() => {
    const timer = setTimeout(() => setShowMap(true), 500);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    const fetchRoute = async () => {
      if (savedLocations.length < 2) return;

      const coordsString = savedLocations
        .map((loc) => `${loc.lng},${loc.lat}`)
        .join(";");
        console.log(coordsString);
        

      const url = `https://router.project-osrm.org/route/v1/driving/${coordsString}?overview=full&geometries=geojson`;

      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes && data.routes.length > 0) {
          setRouteCoords(
            data.routes[0].geometry.coordinates.map(([lng, lat]) => [lat, lng])
          );
        }
      } catch (err) {
        console.error("Error fetching route:", err);
      }
    };

    fetchRoute();
  }, [savedLocations]);

  if (!lastLocation)
    return <p className="text-gray-500">No location data available</p>;

  const markers = useMemo(
    () =>
      savedLocations.map((loc, i) => (
        <Marker key={i} position={[loc.lat, loc.lng]}>
          <Tooltip direction="top" offset={[0, -10]} opacity={1}>
            <b>{loc.address || "Unknown Location"}</b> <br />
            <small>
              {loc.lat.toFixed(5)}, {loc.lng.toFixed(5)}
            </small>
          </Tooltip>
        </Marker>
      )),
    [savedLocations]
  );

  const lastMarker = useMemo(
    () => (
      <Marker position={[lastLocation.lat, lastLocation.lng]}>
        <Tooltip direction="top" offset={[0, -10]} opacity={1}>
          <b>{lastLocation.address}</b>
          <p>Last Location</p>
          <br />
          <small>
            {lastLocation.lat.toFixed(5)}, {lastLocation.lng.toFixed(5)}
          </small>
        </Tooltip>
      </Marker>
    ),
    [lastLocation]
  );

  return (
    <div className="w-full rounded-2xl overflow-hidden shadow-md step2">
      <h2 className="text-xl font-semibold text-center mb-3 mt-5">
        Saved Location Map
      </h2>
      <div className="w-full h-64">
        {!showMap ? (
          <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
            <span className="text-gray-500 text-sm">Loading map…</span>
          </div>
        ) : (
          <Suspense
            fallback={
              <div className="w-full h-full bg-gray-200 animate-pulse flex items-center justify-center">
                <span className="text-gray-500 text-sm">Loading map…</span>
              </div>
            }
          >
            <MapContainer
              center={[lastLocation.lat, lastLocation.lng]}
              zoom={13}
              scrollWheelZoom={true}
              style={{ height: "100%", width: "100%" }}
              preferCanvas={true}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="© OpenStreetMap contributors"
              />

              {routeCoords.length > 0 && (
                <>
                  <Polyline
                    positions={routeCoords}
                    pathOptions={{ color: "blue", weight: 4, opacity: 0.8 }}
                  />
                  <FitBounds coords={routeCoords} />
                </>
              )}

              {markers}
              {lastMarker}
            </MapContainer>
          </Suspense>
        )}
      </div>
    </div>
  );
}
