import React, { useEffect, useState, useRef } from "react";
import axios from "axios";

const LowItemNotifications = () => {
  const [allItems, setAllItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [searchInput, setSearchInput] = useState("");
  const containerRef = useRef(null);

  // Fetch low stock items
  useEffect(() => {
    const fetchLowStockItems = async () => {
      try {
        const response = await axios.get(
          `${import.meta.env.VITE_API_URL}/api/stock`
        );
        const data = response.data || [];
        const allowedLabels = ["Back Glass", "Tempered Glass", "Battery", "Back Cover"];

        const lowItems = data
          .filter((item) => item.qty <= 5 && allowedLabels.includes(item.label))
          .map((item) => {
            const { description = "", compatibility = "", brand = "" } = item.attributes || {};
            const nameParts = [item.label, description || compatibility].filter(Boolean);
            return {
              id: item._id,
              label: item.label,
              description,
              compatibility,
              brand,
              qty: item.qty,
              name: nameParts.join(" - "),
            };
          });

        setAllItems(lowItems);
        setFilteredItems(lowItems);
      } catch (error) {
        console.error("Error fetching low stock items:", error);
      }
    };

    fetchLowStockItems();
  }, []);

  // Smart search
  useEffect(() => {
    const query = searchInput.trim().toLowerCase();

    if (!query) {
      setFilteredItems(allItems);
    } else {
      const filtered = allItems.filter((item) => {
        const combined = `${item.label} ${item.description} ${item.compatibility} ${item.brand}`.toLowerCase();
        return combined.includes(query);
      });
      setFilteredItems(filtered);
    }
  }, [searchInput, allItems]);

  return (
    <div className="mt-10">
      <h2 className="text-xl font-semibold text-gray-900 text-center mb-4">
        Low Stock Alerts
      </h2>

      {/* Search Bar */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search Low Qty Item..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-gray-300"
        />
      </div>

      {filteredItems.length === 0 ? (
        <p className="text-center text-gray-500">No items match your search.</p>
      ) : (
        <div className="overflow-hidden relative w-full">
          <div
            ref={containerRef}
            className="flex gap-6 animate-slideX"
            style={{ width: `${filteredItems.length * 460}px` }}
          >
            {/* Duplicate array for smooth infinite scroll */}
            {[...filteredItems, ...filteredItems].map((item, idx) => (
              <div
                key={idx}
                className="min-w-[230px] bg-red-100 border border-red-300 text-red-800 px-4 py-3 rounded-xl shadow-md"
              >
                <h3 className="font-bold text-lg">{item.name}</h3>
                {item.brand && <p className="text-sm font-medium">Brand: {item.brand}</p>}
                {item.description && <p className="text-sm font-medium">Description: {item.description}</p>}
                {item.compatibility && <p className="text-sm font-medium">Compatibility: {item.compatibility}</p>}
                <p className="text-sm mt-1 font-medium">
                  Quantity Left: <span className="font-bold">{item.qty}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      <style>{`
        @keyframes slideX {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-slideX {
          display: flex;
          animation: slideX ${Math.max(filteredItems.length * 4, 10)}s linear infinite;
        }
      `}</style>
    </div>
  );
};

export default LowItemNotifications;
