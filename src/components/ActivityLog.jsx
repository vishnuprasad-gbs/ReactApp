import React, { useState, useEffect } from "react";
import { useLog } from "../context/LogContext";
import InfiniteScroll from "react-infinite-scroll-component";

function ActivityLog() {
  const { log } = useLog();
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  // Load initial logs
  useEffect(() => {
    if (log && log.length > 0 && items.length === 0) {
      setItems(log.slice(0, 10));
    }
  }, [log, items.length]);

  const fetchMoreData = () => {
    if (items.length >= log.length) {
      setHasMore(false);
      return;
    }

    setItems((prev) => [
      ...prev,
      ...log.slice(prev.length, prev.length + 10),
    ]);
  };

  return (
    <div className="rounded-2xl shadow bg-white p-4 md:p-6">
      {/* ✅ Header OUTSIDE scrollable area */}
      <h2 className="text-xl font-semibold text-center mb-3">Activity Log</h2>

      {/* Scrollable table */}
      <div id="scrollableDiv" className="max-h-[340px] overflow-auto">
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4 className="text-center">Loading...</h4>}
          endMessage={
            <p style={{ textAlign: "center" }}>
              <b>Yay! You have seen it all!</b>
            </p>
          }
          scrollableTarget="scrollableDiv"
        >
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 border">Index</th>
                <th className="px-4 py-2 border">Log</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={2}
                    className="text-center text-gray-500 px-4 py-2 border"
                  >
                    No activity yet.
                  </td>
                </tr>
              ) : (
                items.map((line, i) => (
                  <tr key={line.id ?? i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-gray-600">
                      {i + 1}
                    </td>
                    <td className="px-4 py-2 border text-gray-800">
                      {typeof line === "string" ? line : line.log}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </InfiniteScroll>
      </div>
    </div>
  );
}

export default ActivityLog;
