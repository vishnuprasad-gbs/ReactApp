import * as React from "react";
import { useEffect, useState } from "react";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";
import dayjs from "dayjs"; // for formatting time

const margin = { right: 24 };

// haversine formula to calculate distance (km) between two lat/lngs
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) *
      Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Chart() {
  const [data, setData] = useState([]);
  const [labels, setLabels] = useState([]);

  useEffect(() => {
    fetch("http://localhost:5000/savedLoc")
      .then((res) => res.json())
      .then((locations) => {
        if (locations.length === 0) return;

        let distances = [];
        let times = [];

        
        const ref = locations[0];
        locations.forEach((loc) => {
          const d = haversine(ref.lat, ref.lng, loc.lat, loc.lng);
          distances.push(d.toFixed(2)); 
          times.push(dayjs(loc.createdAt).format("HH:mm")); 
        });

        setData(distances);
        setLabels(times);
      })
      .catch((err) => console.error("Error fetching savedLoc:", err));
  }, []);

  return (
    <LineChart 
      height={300}
      series={[{ data, label: "Distance (km)", area: true, showMark: true }]}
      xAxis={[{ scaleType: "point", data: labels }]}
      sx={{
        [`& .${lineElementClasses.root}`]: {
          display: "none",
        },
      }}
      margin={margin}
    />
  );
}
