// GRN.jsx
import React, { useMemo, useState, useEffect } from "react";
import axios from "axios";
import devicesList from "./devices.json";
/**
 * GRN.jsx
 *
 * Props:
 *  - open (bool) : whether modal is visible
 *  - onClose (fn) : called when modal closed
 *  - onSave (fn)  : called with GRN payload when Save GRN is clicked
 *
 * This component uses Tailwind CSS classes only. All text uses `text-xs`.
 *
 * Customize `itemOptions` and `attributeConfigs` to reflect your real catalog.
 */

export default function MacGRN({ open = true, onClose = () => {}, onSave = (payload) => {} }) {

//===================FETCHING SUPPLIERS====================
  // Suppliers dropdown
  const [suppliers, setSuppliers] = useState([]);
  const [addSupplierOpen, setAddSupplierOpen] = useState(false);
//===============ADD A NEW SUPPLIER===========
// Add at the top with other useState hooks
const [newSupplierName, setNewSupplierName] = useState("");
const [newSupplierPhone, setNewSupplierPhone] = useState("");
const [newSupplierEmail, setNewSupplierEmail] = useState("");
const [newSupplierLocation, setNewSupplierLocation] = useState("");
const [paymentMethodOfGRN, setPaymentMethodOfGRN] = useState("");
const [confirmCloseOpen, setConfirmCloseOpen] = useState(false);

// const valuesForAccessories = require("./devices.json");
function handleAttemptClose() {
  if (items.length > 0) {
    // There are items in table, show confirmation modal
    setConfirmCloseOpen(true);
  } else {
    // Safe to close
    onClose();
  }
}
const handleAddSupplier = async () => {
  if (!newSupplierName.trim()) {
    alert("Supplier name is required.");
    return;
  }

  const newSupplier = {
    supplierName: newSupplierName,
    contactPhone: newSupplierPhone,
    contactEmail: newSupplierEmail || "N/A",
    location: newSupplierLocation,
  };

  try {
    const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/suppliers`, newSupplier);
    if (!response.data) throw new Error("Failed to add supplier");

    // Close modal
    setAddSupplierOpen(false);
    // Reset form
    setNewSupplierName("");
    setNewSupplierPhone("");
    setNewSupplierEmail("");
    setNewSupplierLocation("");

    // Update suppliers list with new supplier
    setSuppliers(prev => [...prev, response.data]);
    setSupplier(response.data.supplierName); // optionally auto-select new supplier

    alert("Supplier added successfully!");
  } catch (error) {
    console.error(error);
    alert("Error adding supplier");
  }
};

  // Fetch suppliers from backend
  useEffect(() => {
    async function fetchSuppliers() {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/suppliers`);
        setSuppliers(res.data); // assuming res.data is array of suppliers
      } catch (err) {
        console.error("Failed to fetch suppliers:", err);
      }
    }
    fetchSuppliers();
  }, []);

  useEffect(() => {
  if (addSupplierOpen) {
    document.getElementById("newSupplierName")?.focus();
  }
}, [addSupplierOpen]);


  // Header fields
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoice, setInvoice] = useState("");
  const [supplier, setSupplier] = useState("");

  // Item entry state
  const [category, setCategory] = useState(""); // "spare", "accessory", "product"
  const [selectedItemKey, setSelectedItemKey] = useState(""); // key from itemOptions
  const [qty, setQty] = useState(1);
  const [unitPrice, setUnitPrice] = useState("");
  const [attributes, setAttributes] = useState({});

  // GRN table
  const [items, setItems] = useState([]);
  const [stockUpdated, setStockUpdated] = useState(false);
  const [saveAttempted, setSaveAttempted] = useState(false);

  // Sample catalog - replace with real data / fetch from backend if needed
  const itemOptions = useMemo(() => ({
    spare: [
  { key: "charging_flex", label: "Charging Flex" },
  { key: "back_glass", label: "Back Glass" },
  { key: "battery", label: "Battery" },
  { key: "camera_module", label: "Camera Module" },
  { key: "display_screen", label: "Display" },
  { key: "front_camera", label: "Front Camera" },
  { key: "ear_speaker", label: "Ear Speaker" },
  { key: "volume_buttons", label: "Volume Buttons" },
  { key: "power_button", label: "Power Button" },
  { key: "wifi_antena", label: "Wi-Fi Antena" },
  { key: "vibrator_motor", label: "Vibrator Motor" },
  { key: "home_button", label: "Home Button" },
  { key: "ic", label: "IC" },
  { key: "proximity", label: "Proximity Sensor" },
  { key: "motherboard", label: "Mother Board" },
  { key: "face_id_module", label: "Face ID Module" },
  { key: "touch_id", label: "Touch ID Sensor" },
  { key: "charging_port", label: "Charging Port" },
  { key: "power_button", label: "Power Button" },
  { key: "volume_button", label: "Volume Button" },
  { key: "speaker", label: "Speaker" },
  { key: "microphone", label: "Microphone" },   
  { key: "ipad_digitizer", label: "iPad Digitizer" },
  { key: "macbook_touch_bar", label: "MacBook Touch Bar" },
  { key: "macbook_keyboard", label: "MacBook Keyboard" }, 
  { key: "macbook_trackpad", label: "MacBook Trackpad" },   
  { key: "on_off_ribbon", label: "On-Off Ribbon" },
  { key: "volumn_ribbon", label: "Volume Ribbon" },
  { key: "power_supplier", label: "Power Supplier" },
  { key: "hard_disk", label: "Hard Disk" },
  { key: "imac_fan", label: "iMac Fan" },
  { key: "imac_powersupply", label: "iMac Power Supply" },
],

    accessory: [
  // Common iPhone / iPad accessories
  { key: "back_cover", label: "Back Cover" },
  { key: "tempered_glass", label: "Tempered Glass" },
],

    product: [
   // MacBooks 
  { key: "macbook_air_2012_11", label: "MacBook Air 11\" - Intel - A1465 - 2012" },
  { key: "macbook_air_2012_13", label: "MacBook Air 13\" - Intel - A1466 - 2012" },
  { key: "macbook_air_2013_11", label: "MacBook Air 11\" - Intel - A1465 - 2013" },
  { key: "macbook_air_2013_13", label: "MacBook Air 13\" - Intel - A1466 - 2013" },
  { key: "macbook_air_2014_11", label: "MacBook Air 11\" - Intel - A1465 - 2014" },
  { key: "macbook_air_2014_13", label: "MacBook Air 13\" - Intel - A1466 - 2014" },

  { key: "macbook_pro_13_2012", label: "MacBook Pro 13\" - Intel - A1278 - 2012" },
  { key: "macbook_pro_15_2012", label: "MacBook Pro 15\" - Intel - A1286 - 2012" },

  { key: "macbook_pro_13_retina_2012", label: "MacBook Pro 13\" Retina - Intel - A1425 - 2012" },
  { key: "macbook_pro_13_retina_2013", label: "MacBook Pro 13\" Retina - Intel - A1502 - 2013" },
  { key: "macbook_pro_13_retina_2014", label: "MacBook Pro 13\" Retina - Intel - A1502 - 2014" },
  { key: "macbook_pro_15_retina_2012", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2012" },
  { key: "macbook_pro_15_retina_2013", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2013" },
  { key: "macbook_pro_15_retina_2014", label: "MacBook Pro 15\" Retina - Intel - A1398 - 2014" },

  { key: "macbook_12_2015", label: "MacBook 12\" - Intel - A1534 - 2015" },
  { key: "macbook_12_2016", label: "MacBook 12\" - Intel - A1534 - 2016" },
  { key: "macbook_12_2017", label: "MacBook 12\" - Intel - A1534 - 2017" },

  { key: "macbook_air_2015", label: "MacBook Air 13\" - Intel - A1466 - 2015" },
  { key: "macbook_air_2017", label: "MacBook Air 13\" - Intel - A1466 - 2017" },
  { key: "macbook_air_retina_2018", label: "MacBook Air 13\" Retina - Intel - A1932 - 2018" },
  { key: "macbook_air_2020_intel", label: "MacBook Air 13\" - Intel - A2179 - 2020" },

  { key: "macbook_air_m1", label: "MacBook Air 13\" - M1 - A2337 - 2020" },
  { key: "macbook_air_m2_13", label: "MacBook Air 13\" - M2 - A2681 - 2022" },
  { key: "macbook_air_m2_15", label: "MacBook Air 15\" - M2 - A2941 - 2023" },
  { key: "macbook_air_m3_13", label: "MacBook Air 13\" - M3 - A3113 - 2024" },
  { key: "macbook_air_m3_15", label: "MacBook Air 15\" - M3 - A3114 - 2024" },

  { key: "macbook_pro_13_2015", label: "MacBook Pro 13\" - Intel - A1502 - 2015" },
  { key: "macbook_pro_13_2016", label: "MacBook Pro 13\" Touch Bar - Intel - A1706/A1708 - 2016" },
  { key: "macbook_pro_13_2018", label: "MacBook Pro 13\" - Intel - A1989 - 2018" },
  { key: "macbook_pro_13_2020_intel", label: "MacBook Pro 13\" - Intel - A2289 - 2020" },
  { key: "macbook_pro_13_m1", label: "MacBook Pro 13\" - M1 - A2338 - 2020" },
  { key: "macbook_pro_13_m2", label: "MacBook Pro 13\" - M2 - A2338 - 2022" },

  { key: "macbook_pro_14_m1_pro", label: "MacBook Pro 14\" - M1 Pro - A2442 - 2021" },
  { key: "macbook_pro_14_m1_max", label: "MacBook Pro 14\" - M1 Max - A2442 - 2021" },
  { key: "macbook_pro_14_m2_pro", label: "MacBook Pro 14\" - M2 Pro - A2779 - 2023" },
  { key: "macbook_pro_14_m2_max", label: "MacBook Pro 14\" - M2 Max - A2779 - 2023" },

  { key: "macbook_pro_16_m1_pro", label: "MacBook Pro 16\" - M1 Pro - A2485 - 2021" },
  { key: "macbook_pro_16_m1_max", label: "MacBook Pro 16\" - M1 Max - A2485 - 2021" },
  { key: "macbook_pro_16_m2_pro", label: "MacBook Pro 16\" - M2 Pro - A2780 - 2023" },
  { key: "macbook_pro_16_m2_max", label: "MacBook Pro 16\" - M2 Max - A2780 - 2023" },

  { key: "macbook_pro", label: "MacBook Pro" },
  { key: "macbook_air", label: "MacBook Air" },
  { key: "macbook", label: "MacBook" },

]

  }), []);

  /**
   * attributeConfigs defines which extra fields to collect per catalog item.
   * Each config is an array of objects: { name: "fieldKey", label: "Label", placeholder, type }
   * Modify to suit your real attributes.
   */
  const attributeConfigs = useMemo(() => ({
    // common fields for spare parts
    spare: [
      { name: "description", label: "Description", placeholder: "color-any special remark", type: "text" },
      { name: "compatibility", label: "Compatibility Model", placeholder: "e.g. iPhone 14 / 14 Pro", type: "text" },
      { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },
    ],

    accessory: [
      { name: "description", label: "Description", placeholder: "Color-any special remark", type: "text" },
      { name: "brand", label: "Brand", placeholder: "Brand", type: "text" },
      { name: "color", label: "Color", placeholder: "Color / Finish", type: "text" },
    ],
    product: [
  {name: "model", label: "Capacity", placeholder: "e.g. 128GB, 256GB", type: "select", options: ["64","128", "256", "512","1TB","2TB","NULL",], },
  { name: "color", label: "Color", placeholder: "Color", type: "text" },
  {name: "region", label: "Region / Country", placeholder: "Select region", type: "select", options: ["ZPA", "XA", "HNA","AEA","QNA","LLA","JA","VIETNAM","NULL",], },
  { name: "serialNumber", label: "Serial Number", placeholder: "Device serial number", type: "text" },
  { name: "imeiNumber", label: "IMEI Number", placeholder: "Device IMEI number", type: "text" },
  { name: "condition",    label: "Condition",   placeholder: "Select condition",   type: "select",   options: ["New", "Refurb", "Used"]   },

    ],
  }), []);

  // Derived: options for current category
  const currentOptions = useMemo(() => {
    if (!category) return [];
    return itemOptions[category] || [];
  }, [category, itemOptions]);

  // When category changes, reset selected item and attributes
  React.useEffect(() => {
    setSelectedItemKey("");
    setAttributes({});
  }, [category]);

  // Helper to update an attribute field
  function setAttribute(name, value) {
    setAttributes(prev => ({ ...prev, [name]: value }));
  }

  function resetItemForm() {
    setCategory("");
    setSelectedItemKey("");
    setQty(1);
    setUnitPrice("");
    setAttributes({});
  }

  function validateItemEntry() {
    if (!category) return { ok: false, msg: "Select category" };
    if (!selectedItemKey) return { ok: false, msg: "Select item" };
    if (!qty || isNaN(qty) || Number(qty) <= 0) return { ok: false, msg: "Enter quantity > 0" };
    if (unitPrice === "" || isNaN(unitPrice) || Number(unitPrice) < 0) return { ok: false, msg: "Enter valid unit price" };
    // require required attributes (all attribute fields must have some value except serialOrIMEI which is optional)
    const required = (attributeConfigs[category] || []).filter(a => a.name !== "serialOrIMEI");
    for (const a of required) {
      if (!attributes[a.name] || String(attributes[a.name]).trim() === "") {
        return { ok: false, msg: `Enter ${a.label}` };
      }
    }
    return { ok: true };
  }

  function handleAddItem() {
    const v = validateItemEntry();
    if (!v.ok) {
      alert(v.msg);
      return;
    }
    const option = (currentOptions.find(o => o.key === selectedItemKey) || { label: selectedItemKey });
    const newItem = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      category,
      key: selectedItemKey,
      label: option.label,
      qty: Number(qty),
      unitPrice: Number(unitPrice),
      attributes: { ...attributes },
      lineTotal: Number(qty) * Number(unitPrice),
    };
    setItems(prev => [...prev, newItem]);
    resetItemForm();
    // If you want updating stock to auto-toggle, keep it manual as per your request
    setStockUpdated(false);
  }

  function handleDeleteItem(id) {
    setItems(prev => prev.filter(i => i.id !== id));
    setStockUpdated(false);
  }

  const grandTotal = items.reduce((s, it) => s + Number(it.lineTotal || 0), 0);
  const [loading, setLoading] = useState(false); // loading state

  
  const handleUpdateStock = async () => {
    if (items.length === 0) {
      alert("Add at least one item before updating stock.");
      return;
    }

    try {
      setLoading(true); // start loading
      // Fetch current stock from backend
      const stockRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/stock`);
      const currentStock = stockRes.data; // assume array of stock items

      for (const grnItem of items) {
        const existing = currentStock.find(
          s =>
            s.category === grnItem.category &&
            s.key === grnItem.key &&
            JSON.stringify(s.attributes) === JSON.stringify(grnItem.attributes)
        );

        if (existing) {
          // Update quantity
          await axios.patch(`${import.meta.env.VITE_API_URL}/api/stock/${existing._id}`, {
            qty: existing.qty + grnItem.qty,
            lastUpdated: new Date().toISOString(),
          });
        } else {
          // Add new stock item
          await axios.post(`${import.meta.env.VITE_API_URL}/api/stock`, {
            category: grnItem.category,
            key: grnItem.key,
            label: grnItem.label,
            qty: grnItem.qty,
            unitPrice: grnItem.unitPrice,
            attributes: grnItem.attributes,
            createdAt: new Date().toISOString(),
          });
        }
      }

      setStockUpdated(true);
      alert("Stock updated successfully!");
    } catch (err) {
      console.error(err);
      alert("Error updating stock. See console.");
    } finally {
      setLoading(false); // stop loading
    }
  };

async function handleSaveGRN() {
  if (!supplier) {
    alert("Please select a supplier before saving.");
    return;
  }
  if (items.length === 0) {
    alert("Add at least one item before saving.");
    return;
  }
  if (paymentMethodOfGRN === "") {
    alert("Please select payment method of GRN");
    return;
  }

  const payload = {
    date,
    invoice,
    supplier,
    items,
    grandTotal,
    paymentMethodOfGRN,
    createdAt: new Date().toISOString(),
  };

  try {
    const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/grn`, payload);
    if (!res.data) throw new Error("Failed to save GRN");

    alert("GRN saved successfully!");
    // Optionally, reset form
    setDate(new Date().toISOString().slice(0, 10));
    setInvoice("");
    setSupplier("");
    setItems([]);
    setStockUpdated(false);
  } catch (err) {
    console.error(err);
    alert("Error saving GRN. See console for details.");
  }
finally {
    // Always reset form and close modal
    setItems([]);
    setStockUpdated(false);
    setSaveAttempted(false);
    onClose();}
}

  if (!open) return null;

  // small icon components
  const CloseIcon = () => (
    <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
      <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );

  return (
    // overlay
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-6 text-sm min-h-[600px]">
        {/* header */}
        <div className="flex items-start justify-between space-x-4">
          <div>
            <h2 className="font-semibold text-xs">Create GRN (MacBook Spare Parts)</h2>
            <p className="text-gray-600 text-[11px]">Only For Tharindu Sandaruwan</p>
          </div>
          <button
            onClick={() => handleAttemptClose()}
            className="p-1 rounded hover:bg-gray-100 text-gray-700 cursor-pointer"
            aria-label="Close"
            title="Close"
          >
            <CloseIcon />
          </button>
        </div>

        <hr className="my-3" />

        {/* header inputs */}
        <div className="grid grid-cols-4 gap-3 mb-3">
          <div>
            <label className="block text-gray-700 text-xs mb-1">Date</label>
            <input
              type="date"
              className="w-full border rounded px-2 py-1 text-xs"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Invoice Number</label>
            <input
              type="text"
              className="w-full border rounded px-2 py-1 text-xs"
              value={invoice}
              onChange={(e) => setInvoice(e.target.value)}
              placeholder="Invoice #"
            />
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Supplier</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
            >
              <option value="">-- Select Supplier --</option>
              {suppliers.map((sup) => (
                <option key={sup._id} value={sup.supplierName}>
                  {sup.supplierName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-gray-700 text-xs mb-1">Payment Method</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={paymentMethodOfGRN}
              onChange={(e) => setPaymentMethodOfGRN(e.target.value)}
            >
              <option>-- Select Payment Method --</option>
              <option value="cash">CASH</option>
              <option value="credit">CREDIT</option>
              <option value="cheque">CHEQUE</option>
              <option value="banktransfer">BANK-TRANSFER</option>
              <option value="card">CARD</option>
              <option value="halfpayment">HALF-PAYMENT</option>
              <option value="other">OTHER</option>
            </select>
          </div>
          <button
  onClick={() => setAddSupplierOpen(true)}
  className="px-2 py-1 bg-green-400 text-white rounded text-xs font-bold hover:bg-green-600 w-fit"
>
  Add Supplier
</button>

        </div>

        <hr className="my-2" />

        {/* item entry area */}
        <div className="grid grid-cols-3 gap-3 items-end">
          {/* category */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Category</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
            >
              <option value="">-- Select --</option>
              <option value="spare">Spare Part</option>
              {/* <option value="accessory">Accessory</option>
              <option value="product">Product</option> */}
            </select>
          </div>

          {/* item select */}
          <div>
            <label className="block text-gray-700 text-xs mb-1">Item</label>
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={selectedItemKey}
              onChange={(e) => setSelectedItemKey(e.target.value)}
              disabled={!category}
            >
              <option value="">-- Select item --</option>
              {currentOptions.map(opt => (
                <option key={opt.key} value={opt.key}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* qty & price compact */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-gray-700 text-xs mb-1">Qty</label>
              <input
                type="number"
                min="1"
                className="w-full border rounded px-2 py-1 text-xs"
                value={qty}
                onChange={(e) => setQty(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-gray-700 text-xs mb-1">Cost Price</label>
              <input
                type="number"
                min="0"
                step="0.01"
                className="w-full border rounded px-2 py-1 text-xs"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>
          </div>
        </div>

        {/* dynamic attributes */}
{category && (
  <div className="mt-3 grid grid-cols-3 gap-3">
    {(attributeConfigs[category] || []).map(attr => {
      const isAccessoryDescDropdown =
        category === "accessory" &&
        attr.name === "description" &&
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

      // ✅ new condition: when category = accessory & item is back_cover / tempered_glass / camera_lens
      const isAccessoryBrandDropdown =
        category === "accessory" && attr.name === "brand" && 
        ["back_cover", "tempered_glass", "camera_lens"].includes(selectedItemKey);

// ✅ new condition: when category = product & attr.name = color
      const isProductColorDropdown =
        category === "product" && attr.name === "color";

      const productColorOptions = ["NULL","MDN", "STARLIGHT", "BLUE", "BLK", "PINK","GOLD", "GREEN", "ULTRAMINE","TEAL","WHITE","DESERT BLACK","DESERT-TITANIUM","LAVENDRA","WHITE","SAGE","MIST BLUE","ORANGE","SILVER", "BLUE","AURA PURPLE"];

      // ✅ define available brand options
      const brandOptions = (() => {
        if (selectedItemKey === "back_cover") {
          return ["SILICON", "SILICON-MAGSAFE", "ANTI-BURST", "FULL-CLEAR-CASE","FULL-CLEAR-MAGESAFE","COLORED-CLEAR-MAGESAFE","KEEPHONE","UAG","XXUNDO","COBLUE","ROCK",];
        } else if (selectedItemKey === "tempered_glass") {
          return ["SUPERD", "KEEPHONE","WIWU", "LITO", "9H","JC-COMM","BLUEO","JOYROOM","NORMAL","PRIVACY","REROS","ROCK","ROCKYMILE","MIETUBL",];
        } else if (selectedItemKey === "camera_lens") {
          return ["LITO", "KEEPHONE","ROCKYMILE","CAMERA-FILM","LENS-FILM","RCSTAL",];
        }
        return [];
      })();

      const valuesForAccessories = devicesList;

      return (
        <div key={attr.name}>
          <label className="block text-gray-700 text-xs mb-1">{attr.label}</label>

          {/* ✅ special case 1: accessory description dropdown */}
          {isAccessoryDescDropdown ? (
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Model --</option>
              {valuesForAccessories.map((val) => (
                <option key={val} value={val}>
                  {val}
                </option>
              ))}
            </select>

          ) : isAccessoryBrandDropdown ? (
            // ✅ special case 2: accessory brand dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Brand --</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </select>

          ) : isProductColorDropdown ? (
            // ✅ new dropdown for product colors
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select Color --</option>
              {productColorOptions.map(color => (
                <option key={color} value={color}>{color}</option>
              ))}
            </select>

          ): category === "spare" && attr.name === "compatibility" ? (
            // spare compatibility dropdown
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {itemOptions.product.map((opt) => (
                <option key={opt.key} value={opt.label}>
                  {opt.label}
                </option>
              ))}
            </select>

          ) : attr.type === "select" ? (
            // default select type
            <select
              className="w-full border rounded px-2 py-1 text-xs"
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            >
              <option value="">-- Select --</option>
              {attr.options.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>

          ) : (
            // default input type
            <input
              type={attr.type}
              className="w-full border rounded px-2 py-1 text-xs"
              placeholder={attr.placeholder}
              value={attributes[attr.name] || ""}
              onChange={(e) => setAttribute(attr.name, e.target.value)}
            />
          )}
        </div>
      );
    })}
  </div>
)}



        {/* Add item button */}
        <div className="mt-3 flex items-center justify-between">
          <div className="text-gray-500 text-xs">Tip: fill attributes relevant to the item before adding.</div>
          <div className="flex items-center space-x-2">
            <button
              onClick={resetItemForm}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
              title="Reset item entry"
            >
              Reset
            </button>
            <button
              onClick={handleAddItem}
              className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700"
              title="Add item to GRN table"
            >
              Add Item
            </button>
          </div>
        </div>

        <hr className="my-3" />

        {/* GRN table */}
        <div className="overflow-auto max-h-56 mb-3 text-xs">
          <table className="w-full table-auto text-left text-xs">
            <thead>
              <tr className="border-b">
                <th className="px-2 py-2">#</th>
                <th className="px-2 py-2">Category</th>
                <th className="px-2 py-2">Item</th>
                <th className="px-2 py-2">Attributes</th>
                <th className="px-2 py-2">Qty</th>
                <th className="px-2 py-2">Unit</th>
                <th className="px-2 py-2">Line Total</th>
                <th className="px-2 py-2">Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-2 py-4 text-center text-gray-500">No items added</td>
                </tr>
              ) : items.map((it, idx) => (
                <tr key={it.id} className="border-b">
                  <td className="px-2 py-2 align-top">{idx + 1}</td>
                  <td className="px-2 py-2 align-top">{it.category}</td>
                  <td className="px-2 py-2 align-top">{it.label}</td>
                  <td className="px-2 py-2 align-top">
                    <div className="text-[11px]">
                      {Object.entries(it.attributes).map(([k, v]) => (
                        <div key={k}><span className="font-medium">{k}:</span> {String(v)}</div>
                      ))}
                    </div>
                  </td>
                  <td className="px-2 py-2 align-top">{it.qty}</td>
                  <td className="px-2 py-2 align-top">{it.unitPrice.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">{it.lineTotal.toFixed(2)}</td>
                  <td className="px-2 py-2 align-top">
                    <button
                      onClick={() => handleDeleteItem(it.id)}
                      className="p-1 rounded hover:bg-red-400 text-xs font-bold hover:text-white"
                      title="Delete item"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* totals and actions */}
        <div className="flex items-center justify-between">
          <div className="text-xs">
            <div className="mb-1"><span className="font-medium">Grand Total:</span> {grandTotal.toFixed(2)}</div>
            <div className="text-gray-600 text-[11px]">Stock updated: <span className={stockUpdated ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>{stockUpdated ? "Yes" : "No"}</span></div>
          </div>

          <div className="flex items-center space-x-2">
            <button
                onClick={handleUpdateStock}
                disabled={loading || stockUpdated} // disable while loading OR permanently after update
                className={`px-3 py-1 border rounded text-xs hover:bg-gray-50 ${
                  loading || stockUpdated ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {stockUpdated ? "Stock Updated" : loading ? "Please wait..." : "Update Stock"}
              </button>

            <button
              onClick={handleSaveGRN}
              disabled={!stockUpdated}
              className={`px-3 py-1 rounded text-xs ${stockUpdated ? "bg-green-600 text-white hover:bg-green-700" : "bg-gray-200 text-gray-500 cursor-not-allowed"}`}
              title={stockUpdated ? "Save GRN" : "Save GRN (enable after Update Stock)"}
            >
              Save GRN
            </button>

            <button
              onClick={() => { handleAttemptClose(); }}
              className="px-3 py-1 border rounded text-xs hover:bg-gray-50 cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>

        {/* small footnote */}
        <p className="text-gray-500 text-[11px] mt-3">
          Note: This component simulates stock update. Replace the alert/console actions with real API calls to update stock and save GRN in backend.
        </p>
      </div>

        {/* ========================  ADD A NEW SUPPLIER POPUP MODAL  =================================== */}
        {/* Add Supplier Modal */}
        {addSupplierOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay */}
            <div
              className="absolute inset-0 bg-black opacity-40"
              onClick={() => setAddSupplierOpen(false)}
            ></div>

            {/* Modal */}
            <div className="relative bg-white rounded-xl shadow-2xl w-96 mx-4 p-4 text-xs">
              <h3 className="font-semibold text-sm mb-3">Add New Supplier</h3>

              {/* Supplier Name */}
              <input
                type="text"
                placeholder="Supplier Name *"
                value={newSupplierName}
                onChange={(e) => setNewSupplierName(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Phone */}
              <input
                type="text"
                placeholder="Contact Phone"
                value={newSupplierPhone}
                onChange={(e) => setNewSupplierPhone(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Contact Email */}
              <input
                type="email"
                placeholder="Contact Email"
                value={newSupplierEmail}
                onChange={(e) => setNewSupplierEmail(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-2 text-xs"
              />

              {/* Location */}
              <input
                type="text"
                placeholder="Location"
                value={newSupplierLocation}
                onChange={(e) => setNewSupplierLocation(e.target.value)}
                className="w-full border rounded px-2 py-1 mb-3 text-xs"
              />

              {/* Buttons */}
              <div className="flex justify-end space-x-2">
                <button
                  onClick={() => setAddSupplierOpen(false)}
                  className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddSupplier}
                  className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        )}
{/* Confirm Close Modal */}
{confirmCloseOpen && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div
      className="absolute inset-0 bg-black opacity-40"
      onClick={() => setConfirmCloseOpen(false)}
    ></div>

    <div className="relative bg-white rounded-xl shadow-2xl w-80 mx-4 p-4 text-xs">
      <h3 className="font-semibold text-sm mb-2">Cannot Close GRN</h3>
      <p className="mb-4 text-gray-700 text-[11px]">
        There are items in the GRN table. Please clear the table before closing.
      </p>
      <div className="flex justify-end space-x-2">
        <button
          onClick={() => setConfirmCloseOpen(false)}
          className="px-3 py-1 border rounded text-xs hover:bg-gray-50"
        >
          OK
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
