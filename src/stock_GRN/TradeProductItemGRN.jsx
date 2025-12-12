// TradeProductItemGRN.jsx
import React, { useState } from "react";
import axios from "axios";

const TradeProductItemGRN = ({ open, onClose, onAddToBill }) => {
  if (!open) return null;

  // Local state for form
  const [formData, setFormData] = useState({
    item: "",
    qty: 1,
    costPrice: "",
    capacity: "",
    color: "",
    region: "",
    serial: "",
    imei: "",
    condition: "Used",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const [successMessage, setSuccessMessage] = useState("");
//===================   ADD THE PARTICULAR PRODUCT ITEM INTO THE STOCK ==============================
const handleAddToStock = async () => {
  try {
    const payload = {
      category: "product",                       // constant
      key: formData.item,                        // item key
      label: formData.item.replace(/_/g, " "),   // readable label
      qty: Number(formData.qty),
      unitPrice: Number(formData.costPrice),
      attributes: {
        model: formData.capacity || null,
        color: formData.color || null,
        region: formData.region || null,
        serialNumber: formData.serial || null,
        imeiNumber: formData.imei || null,
        condition: formData.condition || null,
      },
    };

    const res = await axios.post(
      `${import.meta.env.VITE_API_URL}/api/stock`,
      payload
    );
setSuccessMessage("Item successfully added to stock!"); 
setTimeout(() => setSuccessMessage(""), 3000);
    console.log("Stock Added Successfully:", res.data);
    
    // alert("Item successfully added to stock!");

  } catch (err) {
    console.error("Error adding stock:", err);
    alert("Failed to add stock. Check console for details.");
  }
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="relative bg-white rounded-xl shadow-2xl max-w-6xl w-full mx-4 p-6 text-sm min-h-[300px]">
        <h2 className="text-lg font-bold mb-4">Trade Product Item</h2>

        {/* 🔥 3x3 GRID LAYOUT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          {/* Item */}
          <div>
            <label className="text-xs font-semibold">Item</label>
            <select
              name="item"
              value={formData.item}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">Select Item</option>
              <option value="iphone_11">iPhone 11</option>
                <option value="iphone_11_pro">iPhone 11 Pro</option>
                <option value="iphone_11_pro_max">iPhone 11 Pro Max</option>

                <option value="iphone_12">iPhone 12</option>
                <option value="iphone_12_mini">iPhone 12 Mini</option>
                <option value="iphone_12_pro">iPhone 12 Pro</option>
                <option value="iphone_12_pro_max">iPhone 12 Pro Max</option>

                <option value="iphone_13">iPhone 13</option>
                <option value="iphone_13_mini">iPhone 13 Mini</option>
                <option value="iphone_13_pro">iPhone 13 Pro</option>
                <option value="iphone_13_pro_max">iPhone 13 Pro Max</option>

                <option value="iphone_14">iPhone 14</option>
                <option value="iphone_14_plus">iPhone 14 Plus</option>
                <option value="iphone_14_pro">iPhone 14 Pro</option>
                <option value="iphone_14_pro_max">iPhone 14 Pro Max</option>

                <option value="iphone_15">iPhone 15</option>
                <option value="iphone_15_plus">iPhone 15 Plus</option>
                <option value="iphone_15_pro">iPhone 15 Pro</option>
                <option value="iphone_15_pro_max">iPhone 15 Pro Max</option>

                <option value="iphone_16">iPhone 16</option>
                <option value="iphone_16_plus">iPhone 16 Plus</option>
                <option value="iphone_16e">iPhone 16e</option>
                <option value="iphone_16_pro">iPhone 16 Pro</option>
                <option value="iphone_16_pro_max">iPhone 16 Pro Max</option>

                <option value="iphone_17">iPhone 17</option>
                <option value="iphone_air">iPhone Air</option>
                <option value="iphone_17_pro">iPhone 17 Pro</option>
                <option value="iphone_17_pro_max">iPhone 17 Pro Max</option>

                <option value="samsung_s23">Samsung S23</option>
                <option value="samsung_s23_ultra">Samsung S23 Ultra</option>

                <option value="samsung_s24">Samsung S24</option>
                <option value="samsung_s24_ultra">Samsung S24 Ultra</option>

                <option value="samsung_s25">Samsung S25</option>
                <option value="samsung_s25_ultra">Samsung S25 Ultra</option>

            </select>
          </div>

          {/* Qty */}
          <div>
            <label className="text-xs font-semibold">Qty</label>
            <input
              type="number"
              name="qty"
              min="1"
              value={formData.qty}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Cost Price */}
          <div>
            <label className="text-xs font-semibold">Cost Price</label>
            <input
              type="number"
              name="costPrice"
              value={formData.costPrice}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Capacity */}
          <div>
            <label className="text-xs font-semibold">Capacity</label>
            <select
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">NULL</option>
              <option>64</option>
              <option>128</option>
              <option>256</option>
              <option>512</option>
              <option>1TB</option>
              <option>2TB</option>
            </select>
          </div>

          {/* Color */}
          <div>
            <label className="text-xs font-semibold">Color</label>
            <select
              name="color"
              value={formData.color}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">NULL</option>
                <option>MDN</option>
                <option>STARLIGHT</option>
                <option>BLUE</option>
                <option>BLK</option>
                <option>PINK</option>
                <option>GREEN</option>
                <option>ULTRAMINE</option>
                <option>TEAL</option>
                <option>WHITE</option>
                <option>DESERT BLACK</option>
                <option>DESERT-TITANIUM</option>
                <option>LAVENDRA</option>
                <option>SAGE</option>
                <option>MIST BLUE</option>
                <option>ORANGE</option>
                <option>SILVER</option>
                <option>AURA PURPLE</option>
            </select>
          </div>

          {/* Region */}
          <div>
            <label className="text-xs font-semibold">Region / Country</label>
            <select
              name="region"
              value={formData.region}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option value="">Select Region</option>
              <option>ZPA</option>
                <option>XA</option>
                <option>HNA</option>
                <option>AEA</option>
                <option>QNA</option>
                <option>LLA</option>
                <option>JA</option>
                <option>VIETNAM</option>
                <option>NULL</option>
            </select>
          </div>

          {/* Serial Number */}
          <div>
            <label className="text-xs font-semibold">Serial Number</label>
            <input
              type="text"
              name="serial"
              value={formData.serial}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* IMEI */}
          <div>
            <label className="text-xs font-semibold">IMEI Number</label>
            <input
              type="text"
              name="imei"
              value={formData.imei}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            />
          </div>

          {/* Condition */}
          <div>
            <label className="text-xs font-semibold">Condition</label>
            <select
              name="condition"
              value={formData.condition}
              onChange={handleChange}
              className="w-full border rounded px-2 py-1 text-xs"
            >
              <option>Used</option>
              <option>New</option>
            </select>
          </div>

        </div>
{/* Success Message */}
{successMessage && (
  <div className="w-full text-center text-green-600 font-semibold mt-4">
    {successMessage}
  </div>
)}
        {/* Buttons */}
        <div className="flex justify-end mt-6">
            <button
              onClick={() => {
                onAddToBill(formData); }}
            className="px-3 py-1 bg-cyan-700 text-white rounded text-xs mr-2 cursor-pointer hover:bg-cyan-900 font-bold"
          >
            Add to Bill
          </button>
          <button
            onClick={handleAddToStock}
            className="px-3 py-1 bg-green-600 text-white rounded text-xs mr-2 cursor-pointer hover:bg-green-800 font-bold"
          >
            Add to Stock
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 bg-red-500 text-white rounded text-xs cursor-pointer hover:bg-red-700 font-bold"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TradeProductItemGRN;
