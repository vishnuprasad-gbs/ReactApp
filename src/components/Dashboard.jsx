import { useEffect, useMemo, useRef, useState } from "react";
import { Rnd } from "react-rnd";
import "./style.css";
import { LockKeyhole, LockKeyholeOpen } from "lucide-react";
import { lazy, Suspense } from "react";
import { useLog } from "../context/LogContext";

export default function Dashboard({ user }) {
  const [locked, setLocked] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastLocation, setLastLocation] = useState(null);
  const [locations, setLocations] = useState([]);
  const [activityLogs, setActivityLogs] = useState([]);
  const [layout, setLayout] = useState({});
  const { log, addLog } = useLog();

  const layoutKey = `dashboardLayout_${user.username}`;

  const memoizedLocations = useMemo(() => locations, [locations]);
  const memoizedLogs = useMemo(() => activityLogs, [activityLogs]);

  const Chart = lazy(() => import("./ui/Chart"));
  const QuickReport = lazy(() => import("./ui/QuickReport"));
  const ActivityLog = lazy(() => import("./ActivityLog"));
  const LocationMap = lazy(() => import("./ui/LocationMap"));
  const ProductTour = lazy(() => import("./ProductTour"));

  // Load locations
  useEffect(() => {
    const raw = localStorage.getItem(`locations_${user.username}`);
    const locs = raw ? JSON.parse(raw) : [];
    setLocations(locs);

    if (locs.length > 0) {
      const latest = [...locs].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )[0];
      setLastLocation({
        lat: latest.lat,
        lng: latest.lng,
        name: latest.name,
        type: latest.type,
      });
    }
    setLoading(false);
  }, [user]);

  // Load activity logs
  useEffect(() => {
    try {
      const rawLogs = localStorage.getItem(`activityLogs_${user.username}`);
      if (rawLogs) {
        const logs = JSON.parse(rawLogs);
        setActivityLogs(logs.slice(-10).reverse());
      }
    } catch (e) {
      console.error("Failed to load logs", e);
    }
  }, [user]);

  // Load saved layout
  useEffect(() => {
    const saved = localStorage.getItem(layoutKey);
    if (saved) setLayout(JSON.parse(saved));
  }, [user]);

  const toggleLock = () => {
    setLocked((prev) => !prev);
  };

  const saveLayout = (slot, data) => {
    const updatedLayout = { ...layout, [slot]: data };
    setLayout(updatedLayout);
    localStorage.setItem(layoutKey, JSON.stringify(updatedLayout));
    addLog('user changed layout')
  };

  const captureScreenshot = async () => {
    if (!document.getElementById("dashboard-container")) return;
    try {
      const domtoimage = await import("dom-to-image-more");
      const dataUrl = await domtoimage.toPng(
        document.getElementById("dashboard-container"),
        { bgcolor: "#ffffff" }
      );
      const link = document.createElement("a");
      link.download = `dashboard_${new Date().toISOString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error("Screenshot failed:", err);
    }
  };

  if (loading)
    return (
      <p className="text-center mt-6 text-gray-500">Loading dashboard...</p>
    );

  // Default positions and sizes
  const defaultSizes = {
    "notifications1": { x: 0, y: 0, width: 400, height: 300 },
    "map": { x: 410, y: 0, width: 600, height: 400 },
    "chart": { x: 0, y: 310, width: 500, height: 300 },
    "quick-report": { x: 510, y: 410, width: 400, height: 300 },
  };

  return (
  <div>
  
  <Suspense fallback={null}>
    <ProductTour />
  </Suspense>

  <div className="flex justify-end mb-4 gap-2">
  <button
      onClick={toggleLock}
      className={`px-4 py-2 rounded-xl text-white step7 ${
        locked ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"
      }`}
    >
      {locked ? "Unlock Layout" : "Lock Layout"}{" "}
      {locked ? <LockKeyholeOpen /> : <LockKeyhole />}
    </button>
    <button
      onClick={captureScreenshot}
      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white step8"
    >
      📸 Capture Screenshot
    </button>
    
      <button
      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white step9"
      onClick={() => {
        localStorage.removeItem("tourComplete");
        window.location.reload();
        addLog("restarted the product tour");
      }}
    >
       🔁 Restart Tour
    </button>
  </div>

  <div
    id="dashboard-container"
    className="dashboard-grid"
    style={{ backgroundColor: "#ffffff", position: "relative", minHeight: "800px" }}
  >
    {["notifications1", "map", "chart", "quick-report"].map((slot) => {
      const saved = layout[slot] || defaultSizes[slot];
      return (
        <Rnd
          key={slot}
          size={{ width: saved.width, height: saved.height }}
          position={{ x: saved.x, y: saved.y }}
          onDragStop={(e, d) => saveLayout(slot, { ...saved, x: d.x, y: d.y })}
          onResizeStop={(e, direction, ref, delta, position) => {
            saveLayout(slot, {
              ...saved,
              width: ref.offsetWidth,
              height: ref.offsetHeight,
              x: position.x,
              y: position.y,
            });
          }}
          disableDragging={locked}
          enableResizing={!locked}
          bounds="parent"
          className="widget-wrapper"
        >
          <div className="widget">
            {slot === "notifications1" && (
              <div className="step1">
              <Suspense fallback={<p>Loading activity logs...</p>}>
                <ActivityLog logs={memoizedLogs} />
              </Suspense>
              </div>
            )}
            {slot === "map" && (
             
              
              <Suspense fallback={<p>Loading map...</p>}>
                <LocationMap 
                  lastLocation={lastLocation}
                  savedLocations={locations}
                />
              </Suspense>
             
            )}
            {slot === "chart" && (
              <div className="step3">
              <Suspense fallback={<p>Loading chart...</p>}>
                <Chart locations={memoizedLocations} />
              </Suspense>
              </div>
            )}
            {slot === "quick-report" && (
              <div className="step4">
              <Suspense fallback={<p>Loading report...</p>}>
                <QuickReport user={user} locations={memoizedLocations} />
              </Suspense>
              </div>
            )}
          </div>
        </Rnd>
      );
    })}
  </div>
</div>

  );
}
