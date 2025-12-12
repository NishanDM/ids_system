import React, { useEffect, useState } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

export default function BillEdit({ onClose }) {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editBill, setEditBill] = useState(null);


  const paymentMethods = [
    "Card - Visa",
    "Card - MasterCard",
    "Bank Transfer",
    "KOKO",
    "Cash",
    "Cheque",
    "Credit",
    "Half-Payment",
  ];

  // Fetch bills
  const fetchBills = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/bills`);
      setBills(res.data);
      setFilteredBills(res.data);
    } catch (err) {
      console.error("Error fetching bills:", err);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  // Apply filters
// Apply filters
useEffect(() => {
  let filtered = [...bills];

  if (searchTerm) {
    const term = searchTerm.toLowerCase();

    filtered = filtered.filter((b) => {
      const matchesBasicFields =
        b.billNumber.toLowerCase().includes(term) ||
        b.jobRef.toLowerCase().includes(term) ||
        b.customer?.name.toLowerCase().includes(term);

      // NEW — Search in item SN, IMEI, or entire finalLabel
      const matchesItems = b.items?.some((item) =>
        item.finalLabel?.toLowerCase().includes(term)
      );

      return matchesBasicFields || matchesItems;
    });
  }

  if (dateFrom || dateTo) {
    filtered = filtered.filter((b) => {
      const billDate = new Date(b.date);
      const from = dateFrom ? new Date(dateFrom) : null;
      const to = dateTo ? new Date(dateTo) : null;

      if (from && billDate < from) return false;
      if (to && billDate > to) return false;
      return true;
    });
  }

  setFilteredBills(filtered);
}, [searchTerm, dateFrom, dateTo, bills]);


  // Payment totals
  const getPaymentTotals = () => {
    const totals = {};
    paymentMethods.forEach((m) => (totals[m] = 0));

    const today = new Date();
    const start = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const end = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

    filteredBills.forEach((bill) => {
      const billDate = new Date(bill.date);

      if (!dateFrom && !dateTo) {
        if (billDate < start || billDate >= end) return;
      }

      bill.payments?.forEach((p) => {
        if (totals[p.method] !== undefined) {
          totals[p.method] += p.amount || 0;
        }
      });
    });

    return totals;
  };

  const paymentTotals = getPaymentTotals();

  // NEW — Advanced Excel export with blank row separation
  const downloadExcel = () => {
    const rows = [];

    filteredBills.forEach((bill, index) => {
      // Add each item row
      bill.items.forEach((item) => {
        rows.push({
          Bill_Number: bill.billNumber,
          Bill_Date: new Date(bill.date).toLocaleDateString(),
          Job_Ref: bill.jobRef,
          Customer_Name: bill.customer?.name,
          Customer_Contact: bill.customer?.contact,
          Bill_Maker: bill.billMaker,
          Technician: bill.technician,
          Subtotal: bill.subTotal,
          Profit: bill.billProfit,
          Payment_Details: bill.payments
            ?.map((p) => `${p.method}: Rs.${p.amount}`)
            .join(" | "),
          Item_Label: item.finalLabel,
          Qty: item.qty,
          Unit_Price: item.unitPrice,
          Amount: item.amount,
        });
      });

      // Insert an empty row to separate bills
      rows.push({});
    });

    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bills Report");

    const excelBuffer = XLSX.write(workbook, {
      bookType: "xlsx",
      type: "array",
    });

    // New filename: YYYY.MM.DD.xlsx
    const today = new Date();
    const formattedDate = today
      .toISOString()
      .slice(0, 10)
      .replace(/-/g, "."); // convert 2025-11-14 -> 2025.11.14

    const fileName = `${formattedDate}.xlsx`;

    saveAs(
      new Blob([excelBuffer], { type: "application/octet-stream" }),
      fileName
    );
  };

  // ============   DOWNLOAD THE QUICK EXCEL   ====================================
  const downloadQuickExcel = () => {
  if (!dateFrom || !dateTo) {
    alert("Please select a date range for Quick Excel!");
    return;
  }

  // Filter bills by selected date range
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);
  toDate.setHours(23, 59, 59, 999); // include the full end date

  const filtered = bills.filter((b) => {
    const billDate = new Date(b.date);
    return billDate >= fromDate && billDate <= toDate;
  });

  const rows = filtered.map((bill) => {
    const paymentTotals = {};
    paymentMethods.forEach((m) => (paymentTotals[m] = 0));

    bill.payments?.forEach((p) => {
      if (paymentTotals[p.method] !== undefined) {
        paymentTotals[p.method] += p.amount || 0;
      }
    });

    return {
      "Bill No": bill.billNumber,
      Date: new Date(bill.date).toLocaleDateString(),
      "Customer Name": bill.customer?.name || "",
      Total: bill.subTotal || 0,
      "Card - Visa": paymentTotals["Card - Visa"],
      "Card - MasterCard": paymentTotals["Card - MasterCard"],
      "Bank Transfer": paymentTotals["Bank Transfer"],
      KOKO: paymentTotals["KOKO"],
      Cash: paymentTotals["Cash"],
      Cheque: paymentTotals["Cheque"],
      Credit: paymentTotals["Credit"],
      "Half-Payment": paymentTotals["Half-Payment"],
    };
  });

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Quick Bills");

  const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  const today = new Date();
  const formattedDate = today.toISOString().slice(0, 10).replace(/-/g, ".");
  saveAs(new Blob([excelBuffer], { type: "application/octet-stream" }), `QuickBills-${formattedDate}.xlsx`);
};


  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center text-xs">
      <div className="absolute inset-0 bg-black opacity-40"></div>

      <div className="relative bg-white rounded-xl shadow-2xl max-w-7xl w-full mx-4 p-6 min-h-[600px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-base font-semibold">Bills Overview</h2>
          <button onClick={() => setShowCloseConfirm(true)} className="absolute top-3 right-3 text-gray-600 hover:text-white hover:font-bold hover:bg-red-400 bg-gray-100 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer">
            ✕
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <div className="flex items-center gap-1">
            <label>From:</label>
            <input
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="border rounded-md px-2 py-1"
            />
          </div>

          <div className="flex items-center gap-1">
            <label>To:</label>
            <input
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              className="border rounded-md px-2 py-1"
            />
          </div>

          <input
            type="text"
            placeholder="Search by bill no, job ref, S/N, EMEI or customer..."
            className="flex-1 border rounded-md px-3 py-1"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          <button
            onClick={downloadExcel}
            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-md"
          >
            Download Excel
          </button>
          <button
            onClick={downloadQuickExcel}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-md"
          >
            Quick Excel
          </button>

        </div>

        {/* Payment totals */}
        <div className="flex flex-wrap gap-2 mb-6 mt-4">
          {Object.entries(paymentTotals).map(([method, total], idx) => {
            const colors = [
              "bg-red-500 hover:bg-red-600",
              "bg-green-500 hover:bg-green-600",
              "bg-blue-500 hover:bg-blue-600",
              "bg-yellow-500 hover:bg-yellow-600",
              "bg-purple-500 hover:bg-purple-600",
              "bg-pink-500 hover:bg-pink-600",
              "bg-indigo-500 hover:bg-indigo-600",
              "bg-teal-500 hover:bg-teal-600",
            ];
            const colorClass = colors[idx % colors.length];
            return (
              <button key={method} className={`${colorClass} text-white px-4 py-3 rounded font-bold`}>
                {method}: Rs.{total.toLocaleString()}
              </button>
            );
          })}
        </div>

        {/* Bills Table */}
        <div className="border rounded-lg overflow-hidden h-full flex-1">
          <div className="overflow-y-auto max-h-[450px]">
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-100 text-gray-700 sticky top-0 z-10">
                <tr>
                  <th className="p-2 border w-[80px]">Bill No</th>
                  <th className="p-2 border w-[120px]">Date</th>
                  <th className="p-2 border w-[120px]">Job Ref</th>
                  <th className="p-2 border w-[160px]">Customer</th>
                  <th className="p-2 border w-[120px]">Payment</th>
                  <th className="p-2 border text-right w-[140px]">Subtotal (LKR)</th>
                  <th className="p-2 border text-right w-[140px]">Profit (LKR)</th>
                </tr>
              </thead>

              <tbody>
                {filteredBills.length > 0 ? (
                  filteredBills.map((bill) => (
                    <tr
                      key={bill._id}
                      className="hover:bg-blue-50 cursor-pointer"
                      onClick={() => setSelectedBill(bill)}
                    >
                      <td className="p-1 border truncate">{bill.billNumber}</td>
                      <td className="p-1 border truncate">
                        {new Date(bill.date).toLocaleDateString()}
                      </td>
                      <td className="p-1 border truncate">{bill.jobRef}</td>
                      <td className="p-1 border truncate">{bill.customer?.name}</td>
                      <td className="p-1 border truncate">  {bill.payments?.map((p) => p.method).join(" | ")}  </td>
                      <td className="p-1 border text-right truncate">
                        {bill.subTotal?.toLocaleString()}
                      </td>
                      <td className="p-1 border text-right text-green-600 font-medium truncate">
                        {bill.billProfit?.toLocaleString() || 0}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="text-center text-gray-500 p-4 italic">
                      No bills found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bill Details Modal */}
        {selectedBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div
              className="absolute inset-0 bg-black opacity-40"
            ></div>

            <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full mx-4 p-6 text-xs">
              <h3 className="text-base font-semibold mb-2">
                Bill Details - {selectedBill.billNumber}
              </h3>

              <div className="space-y-1 mb-3 text-gray-700">
                <p>
                  <strong>Job Ref:</strong> {selectedBill.jobRef}
                </p>
                <p>
                  <strong>Date:</strong>{" "}
                  {new Date(selectedBill.date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Customer:</strong> {selectedBill.customer?.name} (
                  {selectedBill.customer?.contact})
                </p>

                <p className="font-semibold mt-2">Payment Details:</p>
                <div className="ml-2 space-y-1">
                  {selectedBill.payments?.length > 0 ? (
                    selectedBill.payments.map((pm, idx) => (
                      <p key={idx}>
                        • {pm.method}: <strong>Rs.{pm.amount.toLocaleString()}</strong>
                      </p>
                    ))
                  ) : (
                    <p className="text-gray-500 italic">No payment information</p>
                  )}
                </div>

                <p>
                  <strong>Bill Maker:</strong> {selectedBill.billMaker}
                </p>
                <p>
                  <strong>Technician:</strong> {selectedBill.technician}
                </p>
              </div>

              <div className="border-t pt-2">
                <h4 className="font-semibold mb-1">Items:</h4>

                <table className="w-full border-collapse">
                  <thead className="bg-gray-100">
                    <tr>
                      <th className="p-1 border">Item</th>
                      <th className="p-1 border text-right">Qty</th>
                      <th className="p-1 border text-right">Unit</th>
                      <th className="p-1 border text-right">Amount</th>
                    </tr>
                  </thead>

                  <tbody>
                    {selectedBill.items.map((it, i) => (
                      <tr key={i}>
                        <td className="p-1 border">{it.finalLabel}</td>
                        <td className="p-1 border text-right">{it.qty}</td>
                        <td className="p-1 border text-right">
                          {it.unitPrice.toLocaleString()}
                        </td>
                        <td className="p-1 border text-right">
                          {it.amount.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="text-right mt-2 space-y-1">
                  <p>
                    <strong>Subtotal:</strong>{" "}
                    {selectedBill.subTotal.toLocaleString()} LKR
                  </p>
                  <p className="text-green-600 font-semibold">
                    <strong>Profit:</strong>{" "}
                    {selectedBill.billProfit?.toLocaleString() || 0} LKR
                  </p>
                </div>
              </div>

              <div className="text-right mt-4">

                <button
                    onClick={async () => {
                      const res = await axios.get(
                        `${import.meta.env.VITE_API_URL}/api/bills/number/${selectedBill.billNumber}`
                      );
                      setEditBill(res.data);
                      setEditModalOpen(true);
                    }}
                    className="px-3 py-1 border-none font-bold rounded-md hover:bg-green-500 cursor-pointer hover:text-white"
                  >
                    Edit
                  </button>

                <button
                  onClick={() => setSelectedBill(null)}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-red-400 cursor-pointer hover:text-white"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
{showCloseConfirm && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    <div className="absolute inset-0 bg-black opacity-40"></div>

    <div className="relative bg-white rounded-xl shadow-xl w-80 p-4 text-center">
      <p className="mb-4 font-semibold">Are you sure you want to close ?</p>
      <div className="flex justify-center gap-4">
        <button
          onClick={() => {
            setShowCloseConfirm(false);
            onClose(); // actually close modal
          }}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded-md cursor-pointer"
        >
          Yes
        </button>
        <button
          onClick={() => setShowCloseConfirm(false)}
          className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1 rounded-md cursor-pointer"
        >
          No
        </button>
      </div>
    </div>
  </div>
)}

{editModalOpen && editBill && (
  <div className="fixed inset-0 z-50 flex items-center justify-center">
    {/* BACKDROP */}
    <div
      className="absolute inset-0 bg-transparent"
      onClick={() => setEditModalOpen(false)}
    ></div>

    {/* MODAL */}
    <div className="relative bg-white w-full max-w-3xl rounded-2xl shadow-2xl p-6 mx-4 max-h-[90vh] overflow-y-auto animate-fadeIn">
      
      {/* TOP BAR */}
      <div className="flex justify-between items-center border-b pb-3 mb-4">
        <h2 className="text-lg font-semibold">
          Edit Bill – {editBill.billNumber}
        </h2>

        {/* CLOSE BUTTON */}
        <button
          className="text-gray-600 hover:text-red-500 transition text-xl font-bold cursor-pointer"
          onClick={() => setEditModalOpen(false)}
        >
          ✕
        </button>
      </div>

      {/* BILL INFO */}
      <h3 className="font-semibold mb-2 text-sm text-gray-700">Bill Information</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {/* Bill Date */}
        <div>
          <label className="font-semibold text-xs">Bill Date</label>
          <input
            type="date"
            value={editBill.date?.slice(0, 10)}
            onChange={(e) => setEditBill({ ...editBill, date: e.target.value })}
            className="border rounded-md px-2 py-1 w-full"
          />
        </div>

        {/* Job Ref */}
        <div>
          <label className="font-semibold text-xs">Job Ref</label>
          <input
            type="text"
            value={editBill.jobRef}
            onChange={(e) =>
              setEditBill({ ...editBill, jobRef: e.target.value })
            }
            className="border rounded-md px-2 py-1 w-full"
          />
        </div>

        {/* Bill Maker */}
        <div>
          <label className="font-semibold text-xs">Bill Maker</label>
          <input
            type="text"
            value={editBill.billMaker}
            onChange={(e) =>
              setEditBill({ ...editBill, billMaker: e.target.value })
            }
            className="border rounded-md px-2 py-1 w-full"
          />
        </div>

        {/* Technician */}
        <div>
          <label className="font-semibold text-xs">Technician</label>
          <input
            type="text"
            value={editBill.technician}
            onChange={(e) =>
              setEditBill({ ...editBill, technician: e.target.value })
            }
            className="border rounded-md px-2 py-1 w-full"
          />
        </div>
      </div>

      {/* CUSTOMER */}
      <h3 className="font-semibold mb-2 text-sm text-gray-700">Customer Information</h3>
      <div className="grid grid-cols-2 gap-4 mb-6">
        {["name", "contact", "email", "address", "company"].map((field) => (
          <div key={field}>
            <label className="font-semibold text-xs capitalize">{field}</label>
            <input
              type="text"
              value={editBill.customer[field]}
              onChange={(e) =>
                setEditBill({
                  ...editBill,
                  customer: { ...editBill.customer, [field]: e.target.value },
                })
              }
              className="border rounded-md px-2 py-1 w-full"
            />
          </div>
        ))}
      </div>

      {/* PAYMENTS */}
      <h3 className="font-semibold mb-2 text-sm text-gray-700">Payments</h3>
      {editBill.payments.map((p, index) => (
        <div key={index} className="flex gap-2 mb-2 items-center">
          <select
            value={p.method}
            onChange={(e) => {
              const updated = [...editBill.payments];
              updated[index].method = e.target.value;
              setEditBill({ ...editBill, payments: updated });
            }}
            className="border rounded-md px-2 py-1 w-40"
          >
            {paymentMethods.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <input
            type="number"
            value={p.amount}
            onChange={(e) => {
              const updated = [...editBill.payments];
              updated[index].amount = Number(e.target.value);
              setEditBill({ ...editBill, payments: updated });
            }}
            className="border rounded-md px-2 py-1 w-32"
          />

          <button
            onClick={() => {
              const updated = editBill.payments.filter((_, i) => i !== index);
              setEditBill({ ...editBill, payments: updated });
            }}
            className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full hover:bg-red-600 cursor-pointer"
          >
            ✕
          </button>
        </div>
      ))}

      <button
        onClick={() =>
          setEditBill({
            ...editBill,
            payments: [...editBill.payments, { method: "Cash", amount: 0 }],
          })
        }
        className="bg-blue-500 text-white px-3 py-1 rounded-md mb-6 cursor-pointer "
      >
        + Add Payment
      </button>

      {/* ITEMS */}
      <h3 className="font-semibold mb-2 text-sm text-gray-700">Items</h3>
      {editBill.items.map((item, index) => (
        <div
          key={index}
          className="grid grid-cols-5 gap-2 mb-2 items-center"
        >
          <input
            type="text"
            value={item.finalLabel}
            onChange={(e) => {
              const updated = [...editBill.items];
              updated[index].finalLabel = e.target.value;
              setEditBill({ ...editBill, items: updated });
            }}
            className="border rounded-md px-2 py-1 col-span-2"
          />

          <input
            type="number"
            value={item.qty}
            onChange={(e) => {
              const updated = [...editBill.items];
              updated[index].qty = Number(e.target.value);
              updated[index].amount = updated[index].qty * updated[index].unitPrice;
              setEditBill({ ...editBill, items: updated });
            }}
            className="border rounded-md px-2 py-1"
          />

          <input
            type="number"
            value={item.unitPrice}
            onChange={(e) => {
              const updated = [...editBill.items];
              updated[index].unitPrice = Number(e.target.value);
              updated[index].amount = updated[index].qty * updated[index].unitPrice;
              setEditBill({ ...editBill, items: updated });
            }}
            className="border rounded-md px-2 py-1"
          />

          <button
            onClick={() => {
              const updated = editBill.items.filter((_, i) => i !== index);
              setEditBill({ ...editBill, items: updated });
            }}
            className="w-5 h-5 flex items-center justify-center bg-red-500 text-white text-xs rounded-full hover:bg-red-600 cursor-pointer"
          >
            ✕
          </button>

        </div>
      ))}

      <button
        onClick={() =>
          setEditBill({
            ...editBill,
            items: [
              ...editBill.items,
              { finalLabel: "", qty: 1, unitPrice: 0, amount: 0 },
            ],
          })
        }
        className="bg-blue-500 text-white px-3 py-1 rounded-md mb-6 cursor-pointer"
      >
        + Add Item
      </button>

      {/* TOTALS */}
      {/* <div className="text-right mt-4 border-t pt-3">
        <p>
          <strong>Subtotal:</strong>{" "}
          {editBill.items.reduce((t, i) => t + i.amount, 0)}
        </p>
        <p className="text-green-600 font-bold">
          <strong>Profit:</strong> {editBill.billProfit}
        </p>
      </div> */}


      {/* TOTALS */}
<div className="mt-6 border-t pt-4 grid grid-cols-2 gap-4">

  {/* Subtotal (editable) */}
  <div>
    <label className="font-semibold text-xs">Subtotal</label>
    <input
      type="number"
      value={editBill.subTotal ?? editBill.items.reduce((t, i) => t + i.amount, 0)}
      onChange={(e) =>
        setEditBill({ ...editBill, subTotal: Number(e.target.value) })
      }
      className="border rounded-md px-2 py-1 w-full"
    />
  </div>

  {/* Profit (editable) */}
  <div>
    <label className="font-semibold text-xs">Profit</label>
    <input
      type="number"
      value={editBill.billProfit}
      onChange={(e) =>
        setEditBill({ ...editBill, billProfit: Number(e.target.value) })
      }
      className="border rounded-md px-2 py-1 w-full text-green-600 font-bold"
    />
  </div>

</div>


      {/* ACTION BUTTONS */}
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={() => setEditModalOpen(false)}
          className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md cursor-pointer"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              await axios.put(
                `${import.meta.env.VITE_API_URL}/api/bills/${editBill._id}`,
                editBill
              );
              alert("Bill updated successfully!");
              fetchBills();
              setEditModalOpen(false);
            } catch (err) {
              console.error(err);
              alert("Update failed.");
            }
          }}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
