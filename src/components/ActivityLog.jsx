import React, { useState, useEffect } from "react";
import { useLog } from "../context/LogContext";
import InfiniteScroll from "react-infinite-scroll-component";

function ActivityLog() {
  const { log, setLog } = useLog();
  const [items, setItems] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (log && log.length > 0) {
      const reversed = [...log];
      setItems(reversed.slice(0, 10));
      setHasMore(reversed.length > 10);
    } else {
      setItems([]);
      setHasMore(false);
    }
  }, [log]);

  const fetchMoreData = () => {
    if (items.length >= log.length) {
      setHasMore(false);
      return;
    }
    const nextItems = log.slice(items.length, items.length + 10);
    setItems((prev) => [...prev, ...nextItems]);
  };

  const deleteLog = (index) => {
    const updated = [...log];
    updated.splice(index, 1);
    setLog(updated);
    setItems(updated.slice(0, items.length));
    localStorage.setItem(
      `activityLogs_${localStorage.getItem("username")}`,
      JSON.stringify(updated)
    );
  };

  return (
    <div className="rounded-2xl shadow bg-white p-4 md:p-6">
      <h2 className="text-xl font-semibold text-center mb-3 mt-2">
        Activity Log
      </h2>
      <div id="scrollableDiv" className="max-h-[340px] overflow-auto">
        <InfiniteScroll
          dataLength={items.length}
          next={fetchMoreData}
          hasMore={hasMore}
          loader={<h4 className="text-center"></h4>}
          scrollableTarget="scrollableDiv"
        >
          <table className="min-w-full text-sm text-left border-collapse">
            <thead className="bg-gray-100 sticky top-0">
              <tr>
                <th className="px-4 py-2 border">Index</th>
                <th className="px-4 py-2 border">Log</th>
                <th className="px-4 py-2 border">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="text-center text-gray-500 px-4 py-2 border"
                  >
                    No activity yet.
                  </td>
                </tr>
              ) : (
                items.map((line, i) => (
                  <tr key={i} className="hover:bg-gray-50">
                    <td className="px-4 py-2 border text-gray-600">{i + 1}</td>
                    <td className="px-4 py-2 border text-gray-800">{line}</td>
                    <td className="px-4 py-2 border text-center">
                      <button
                        onClick={() => deleteLog(i)}
                        className="text-red-600 hover:underline"
                      >
                        Delete
                      </button>
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
