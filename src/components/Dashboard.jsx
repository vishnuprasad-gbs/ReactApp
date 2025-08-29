// src/components/Dashboard.jsx
import { useEffect, useRef, useState } from "react";
import { createSwapy } from "swapy";
import LocationMap from "./ui/LocationMap";
import Chart from "./ui/Chart";
import ActivityLog from "./ActivityLog";
import NotificationsPanel from "./ui/NotificationsPanel";
import QuickReport from "./ui/QuickReport";
import "./style.css";
import ProductTour from "./ProductTour";

export default function Dashboard({user}) {
  const containerRef = useRef(null);
  const swapyRef = useRef(null);
  const [lastLocation, setLastLocation] = useState(null);
  const [loading, setLoading] = useState(true);
    const [activityLogs, setActivityLogs] = useState([]);

useEffect(() => {
  async function fetchLogs() {
    try {
      const res = await fetch("http://localhost:5000/activity");
      const data = await res.json();
      // Keep only the latest 10 logs
      setActivityLogs(data.slice(-10).reverse()); 
    } catch (err) {
      console.error(err);
    }
  }
  fetchLogs();
}, []);
  // Fetch last location
  useEffect(() => {
    async function fetchLocation() {
      try {
        const res = await fetch("http://localhost:5000/savedLoc");
        const data = await res.json();
        const locations = Array.isArray(data) ? data : data.savedLoc || [];
        if (locations.length > 0) {
          const latest = [...locations].sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )[0];
          setLastLocation({
            lat: latest.lat,
            lng: latest.lng,
            name: latest.name,
            type: latest.type,
          });
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchLocation();
  }, []);

  // Initialize Swapy **after loading = false**
  useEffect(() => {
    if (!loading && containerRef.current) {
      // destroy previous instance if exists
      swapyRef.current?.destroy?.();

      swapyRef.current = createSwapy(containerRef.current, {
        animation: "dynamic",
        swapMode: "drop",
        autoScrollOnDrag: true,
      });

      swapyRef.current.onBeforeSwap(() => true);
      swapyRef.current.onSwapStart((e) => console.log("Swap start:", e));
      swapyRef.current.onSwap((e) => console.log("Swapping:", e));
      swapyRef.current.onSwapEnd((e) => console.log("Swap end:", e));
    }
  }, [loading]);

  if (loading)
    return <p className="text-center mt-6 text-gray-500">Loading dashboard...</p>;

  return (
    <div ref={containerRef} className="dashboard-grid" data-swapy-container>
       
      <div data-swapy-slot="notifications1">
        
        <div data-swapy-item="notifications1" className="widget step1 ">
              <h2 className="text-xl font-semibold text-center mb-3 pt-5">Activity Log</h2>

         <ActivityLog logs={activityLogs}/>
        </div>
      </div>

      <div data-swapy-slot="map">
        <div data-swapy-item="map" className="widget step2">
            <ProductTour/>
          {lastLocation && <LocationMap lastLocation={lastLocation} />}
        </div>
      </div>

      {/* Row 2 */}
      <div data-swapy-slot="chart">
        <div data-swapy-item="chart" className="widget step3 flex items-center">
            <ProductTour/>
          <Chart />
        </div>
      </div>

      <div data-swapy-slot="quick-report" className="step4">
        <div data-swapy-item="quick-report" className="widget">
          <ProductTour/>
          <QuickReport user={user}/>
        </div>
      </div>

      {/* Row 3 */}
      

      
    </div>
  );
}
