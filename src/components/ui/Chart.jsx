// src/components/ui/Chart.jsx
import * as React from "react";
import { useMemo } from "react";
import { LineChart, lineElementClasses } from "@mui/x-charts/LineChart";

import dayjs from "dayjs";

// Haversine formula to calculate distance (km) between two lat/lngs
function haversine(lat1, lon1, lat2, lon2) {
  const R = 6371; // km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function Chart({ locations = [] }) {
  const { distances, times } = useMemo(() => {
    if (!locations || locations.length === 0) return { distances: [], times: [] };

    const sorted = [...locations].sort(
      (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
    );

    const distances = [];
    const times = [];
    let cumulative = 0;

    for (let i = 0; i < sorted.length; i++) {
      if (i === 0) distances.push(0);
      else {
        const prev = sorted[i - 1];
        const curr = sorted[i];
        cumulative += haversine(prev.lat, prev.lng, curr.lat, curr.lng);
        distances.push(parseFloat(cumulative.toFixed(2)));
      }
      times.push(dayjs(sorted[i].createdAt).format("HH:mm:ss"));
    }

    return { distances, times };
  }, [locations]);

  if (!locations || locations.length === 0) {
    return (
      <p className="text-center text-gray-500 mt-4">
        No location data yet
      </p>
    );
  }

  return (
    <div className="w-full p-4">
      <h2 className="text-xl font-semibold text-center mb-3 mt-5">
        Total Distance Over Time (km)
      </h2>
      <div className="w-full h-72 md:h-96">
        <LineChart
          height={300}
          series={[{ data: distances, label: "Distance (km)", area: true, showMark: true }]}
          xAxis={[{ scaleType: "point", data: times }]}
          sx={{
            [`& .${lineElementClasses.root}`]: {
              display: "none",
            },
          }}
          margin={{ right: 24 }}
        />
      </div>
    </div>
  );
}
