import React, { useEffect, useState } from "react";

const ManualStock = ({ onClose }) => {
  const [stockItems, setStockItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeCategory, setActiveCategory] = useState("spare");

  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const [selectedFilter, setSelectedFilter] = useState("");

  const [editMode, setEditMode] = useState(false);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    const fetchStockData = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/api/stock/`);
        if (!response.ok) throw new Error("Failed to fetch stock data");
        const data = await response.json();
        setStockItems(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchStockData();
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => setSearchQuery(searchInput), 350);
    return () => clearTimeout(timeout);
  }, [searchInput]);

  const categories = {
    spare: stockItems.filter((i) => i.category === "spare"),
    accessory: stockItems.filter((i) => i.category === "accessory"),
    product: stockItems.filter((i) => i.category === "product"),
  };

  const highlightText = (text, query) => {
    if (!query || !text) return text;
    const regex = new RegExp(`(${query})`, "gi");
    return text.toString().replace(regex, `<mark class="bg-yellow-300">$1</mark>`);
  };

  const filteredItems = categories[activeCategory].filter((item) => {
    const q = searchQuery.toLowerCase();

    const searchable = [
      item.label,
      item.attributes?.description,
      item.attributes?.brand,
      item.attributes?.model,
      item.attributes?.color,
      item.attributes?.compatibility,
      item.attributes?.condition,
      item.attributes?.capacity,
      item.attributes?.region,
      item.attributes?.serialNumber,
      item.attributes?.imeiNumber,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch = q.split(" ").every((word) => searchable.includes(word));
    const matchesFilter = selectedFilter
      ? searchable.includes(selectedFilter.toLowerCase())
      : true;

    return matchesSearch && matchesFilter;
  });

  const getFilterOptions = () => {
    switch (activeCategory) {
      case "accessory":
        return [...new Set(categories.accessory.map(i => i.attributes?.brand).filter(Boolean))];
      case "product":
        return [...new Set(categories.product.map(i => i.attributes?.model).filter(Boolean))];
      case "spare":
        return [...new Set(categories.spare.map(i => i.attributes?.compatibility).filter(Boolean))];
      default:
        return [];
    }
  };

  const handleFieldChange = (id, field, value, nested = false) => {
    setStockItems((prev) =>
      prev.map((item) =>
        item._id === id
          ? nested
            ? { ...item, attributes: { ...item.attributes, [field]: value } }
            : { ...item, [field]: value }
          : item
      )
    );
  };

  const saveChanges = async () => {
    setUpdating(true);
    try {
      const updateRequests = stockItems.map((item) =>
        fetch(`${import.meta.env.VITE_API_URL}/api/stock/${item._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(item),
        })
      );
      await Promise.all(updateRequests);
      alert("✅ Stock updated successfully");
      setEditMode(false);
    } catch {
      alert("⚠️ Failed to update stock");
    }
    setUpdating(false);
  };

  const renderTable = (category, items) => (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="min-w-full text-xs">
        <thead className="bg-gray-100 text-gray-600 uppercase text-left">
          {category === "spare" && (
            <tr>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-left">Quantity</th>
              <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Compatibility</th>
              <th className="px-3 py-2 text-left">Condition</th>
            </tr>
          )}

          {category === "accessory" && (
            <tr>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-left">Quantity</th>
              <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Brand</th>
              <th className="px-3 py-2 text-left">Color</th>
            </tr>
          )}

          {category === "product" && (
            <tr>
              <th className="px-3 py-2 text-left">Label</th>
              <th className="px-3 py-2 text-left">Quantity</th>
              <th className="px-3 py-2 text-left">Unit Price (LKR)</th>
              <th className="px-3 py-2 text-left">Model/Capacity</th>
              <th className="px-3 py-2 text-left">Color</th>
              <th className="px-3 py-2 text-left">Region</th>
              <th className="px-3 py-2 text-left">Serial Number</th>
              <th className="px-3 py-2 text-left">IMEI Number</th>
              <th className="px-3 py-2 text-left">Condition</th>
            </tr>
          )}
        </thead>

        <tbody className="divide-y divide-gray-100">
          {items.map((item) => (
            <tr key={item._id}>
              {/* Label */}
              <td
                className="px-3 py-2 font-medium"
                dangerouslySetInnerHTML={{
                  __html: editMode ? item.label : highlightText(item.label, searchQuery),
                }}
              />

              {/* Quantity */}
              <td className="px-3 py-2">
                {editMode ? (
                  <input
                    type="number"
                    value={item.qty}
                    onChange={(e) => handleFieldChange(item._id, "qty", Number(e.target.value))}
                    className="border px-1 w-16 rounded"
                  />
                ) : (
                  item.qty
                )}
              </td>

              {/* Unit Price */}
              <td className="px-3 py-2">
                {editMode ? (
                  <input
                    type="number"
                    value={item.unitPrice}
                    onChange={(e) => handleFieldChange(item._id, "unitPrice", Number(e.target.value))}
                    className="border px-1 w-20 rounded"
                  />
                ) : (
                  `Rs. ${item.unitPrice?.toLocaleString()}`
                )}
              </td>

              {/* Category-specific fields */}
              {category === "spare" && (
                <>
                  <td className="px-3 py-2">
                    {item.attributes?.description || "--"}
                  </td>
                  <td className="px-3 py-2">
                    {editMode ? (
                      <input
                        value={item.attributes?.compatibility || ""}
                        onChange={(e) => handleFieldChange(item._id, "compatibility", e.target.value, true)}
                        className="border px-1 rounded"
                      />
                    ) : (
                      item.attributes?.compatibility || "--"
                    )}
                  </td>
                  <td className="px-3 py-2">{item.attributes?.condition || "--"}</td>
                </>
              )}

              {category === "accessory" && (
                <>
                  <td className="px-3 py-2">{item.attributes?.description || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.brand || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.color || "--"}</td>
                </>
              )}

              {category === "product" && (
                <>
                  <td className="px-3 py-2">{item.attributes?.model || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.color || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.region || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.serialNumber || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.imeiNumber || "--"}</td>
                  <td className="px-3 py-2">{item.attributes?.condition || "--"}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-5xl w-full mx-4 p-4 text-xs min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center border-b pb-3 mb-4 flex-shrink-0">
          <button
            onClick={() => setEditMode((prev) => !prev)}
            className="px-3 py-1 text-xs rounded-md border bg-blue-600 text-white hover:bg-blue-800"
          >
            {editMode ? "View Mode" : "Edit Mode"}
          </button>

          <h2 className="text-base font-semibold text-gray-800">Stock Manual Manager</h2>

          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 text-lg font-bold">✕</button>
        </div>

        <div className="flex space-x-2 mb-3 flex-shrink-0">
          {["spare", "accessory", "product"].map((cat) => (
            <button
              key={cat}
              onClick={() => { setActiveCategory(cat); setSelectedFilter(""); }}
              className={`px-3 py-1 rounded-md border ${
                activeCategory === cat
                  ? "bg-gray-800 text-white border-gray-800"
                  : "bg-white text-gray-700 border-gray-300 hover:bg-gray-100"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {getFilterOptions().length > 0 && (
          <select
            className="border px-3 py-2 rounded-md text-xs mb-3"
            value={selectedFilter}
            onChange={(e) => setSelectedFilter(e.target.value)}
          >
            <option value="">
              All {activeCategory === "spare" ? "Compatibility" : activeCategory === "accessory" ? "Brands" : "Models"}
            </option>
            {getFilterOptions().map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        )}

        <input
          type="text"
          placeholder={`Search ${activeCategory}...`}
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="w-full px-3 py-2 border rounded-md text-xs mb-4"
        />

        <div className="flex-1 overflow-y-auto max-h-[400px]">
          {loading ? (
            <p className="text-center text-gray-600">Loading...</p>
          ) : error ? (
            <div className="text-center text-red-600 font-medium">⚠️ {error}</div>
          ) : (
            renderTable(activeCategory, filteredItems)
          )}
        </div>

        {editMode && (
          <button
            onClick={saveChanges}
            disabled={updating}
            className="mt-3 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50"
          >
            {updating ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
};

export default ManualStock;
