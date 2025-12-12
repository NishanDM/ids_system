import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import companyLogo from "/IDSLogo.png";

export default function BillsModal({ onClose }) {
  const [bills, setBills] = useState([]);
  const [filteredBills, setFilteredBills] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [selectedBill, setSelectedBill] = useState(null);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [showPinPopup, setShowPinPopup] = useState(false);
  const [pinInput, setPinInput] = useState("");
  const [paymentEditorBill, setPaymentEditorBill] = useState(null);
  const [payments, setPayments] = useState([]);

  const printRef = useRef(null);

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

//================== EDIT PAYMENT METHODS =================
useEffect(() => {
  if (paymentEditorBill) {
    setPayments([...paymentEditorBill.payments]); // load existing payments
  }
}, [paymentEditorBill]);

  const handleCheck = (method) => {
  const exists = payments.some(p => p.method === method);

  if (exists) {
    setPayments(payments.filter(p => p.method !== method));
  } else {
    setPayments([...payments, { method, amount: "" }]);
  }
};

const handleAmountChangeForPaymentMethod = (method, value) => {
  setPayments(payments.map((p) =>
    p.method === method ? { ...p, amount: Number(value) } : p
  ));
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
//================== DOWNLOAD THE SELECTED BILL AS A PDF SECTION ===================
const fetchBillByNumber = async (billNumber) => {
  try {
    const res = await axios.get(
      `${import.meta.env.VITE_API_URL}/api/bills/number/${billNumber}`
    );
    return res.data;
  } catch (err) {
    console.error("Failed to fetch full bill:", err);
    alert("Failed to fetch full bill details!");
    return null;
  }
};

const downloadBillPDF = async () => {
  if (!selectedBill) return;

  // Fetch full bill details from backend
  const fullBill = await fetchBillByNumber(selectedBill.billNumber);
  if (!fullBill) return;

  const element = document.createElement("div");
  element.style.width = "210mm";
  element.style.height = "148mm";
  element.style.padding = "16px";
  element.style.boxSizing = "border-box";
  element.style.background = "#fff";
  element.style.fontFamily = "Arial, sans-serif";
  element.style.fontSize = "12px";
  element.style.color = "#000";

  // Build bill content
  element.innerHTML = `
    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
      <div>
        <img src="${companyLogo}" style="width:120px;height:60px;object-fit:contain;" />
        <div style="font-size:11px;">Bill Maker: ${fullBill.billMaker}</div>
        <div style="font-size:11px;">Date: ${new Date(fullBill.date).toISOString().slice(0,10)}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;">Invoice</div>
        <div style="font-family:monospace;">${fullBill.billNumber}</div>
        <div style="font-size:11px;">No.363, Galle Rd, Colombo 06</div>
        <div style="font-size:11px;">Hotline - 0777 142 402 / 0777 142 502 / 0112 500 990</div>
      </div>
    </div>

    <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
      <div>
        <div style="font-weight:700;">Bill To:</div>
        <div>${fullBill.customer?.name} | ${fullBill.customer?.contact} | ${fullBill.customer?.email} </div>
        <div>${fullBill.customer?.company} | ${fullBill.customer?.address}</div>
      </div>
      <div style="text-align:right;">
        <div style="font-weight:700;">Payments</div>
        ${fullBill.payments && fullBill.payments.length > 0 ? `
          <table style="margin-left:auto; font-size:11px;">
            <tbody>
              ${fullBill.payments.map(p => `
                <tr>
                  <td style="padding:2px 6px; text-align:left;">${p.method}</td>
                  <td style="padding:2px 6px; text-align:right;">${Number(p.amount).toLocaleString()}</td>
                </tr>
              `).join("")}
            </tbody>
          </table>
        ` : `<div style="font-size:11px;color:#374151;">No payments selected</div>`}
      </div>
    </div>

    <table style="width:100%; border-collapse:collapse; line-height:1.2; margin-bottom:10px;">
      <thead>
        <tr style="border-bottom:1px solid #e5e7eb;">
          <th style="padding:4px 6px; text-align:left;">Description</th>
          <th style="padding:4px 6px; text-align:right;">Qty</th>
          
          <th style="padding:4px 6px; text-align:right;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${fullBill.items.map(it => `
          <tr>
            <td style="padding:3px 6px;">${it.finalLabel}</td>
            <td style="padding:3px 6px; text-align:right;">${it.qty}</td>
            
            <td style="padding:3px 6px; text-align:right;">${Number(it.amount).toLocaleString()}</td>
          </tr>
        `).join("")}
      </tbody>
    </table>

    <div style="text-align:right; font-weight:700; margin-bottom:10px;">
      Total: Rs.${Number(fullBill.subTotal).toLocaleString()}<br/>
    </div>

    <div style="font-size:10px; margin-top:10px;">
      <div style="font-weight:700;">Terms & Conditions</div>
      <p>1. No Cash Refund.</p>
      <p>2. For any clarification, please be present with the bill within 5 days.</p>
      <p>3. Once a repaired part, accessory, or product is issued, it will be considered used and purchased.</p>
    </div>
  `;

  document.body.appendChild(element);
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  document.body.removeChild(element);

  const imgData = canvas.toDataURL("image/png");

  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [148, 210] });
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(12);
  pdf.addImage(imgData, "PNG", 0, 0, 210, 148);
  pdf.save(`${fullBill.billNumber}.pdf`);
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
                  onClick={downloadBillPDF}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-green-600 cursor-pointer hover:text-white"
                >
                  Print
                </button>
              <button
                  onClick={() => {
                    setPinInput("");
                    setShowPinPopup(true);
                  }}
                  className="px-3 py-1 border-none font-bold rounded-md hover:bg-blue-800 cursor-pointer hover:text-white"
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

{showPinPopup && (
  <div className="fixed inset-0 flex items-center justify-center z-50">
    
    {/* Background overlay */}
    <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>

    {/* Popup */}
    <div className="relative bg-white p-5 rounded-xl shadow-xl w-72 text-center z-50">
      <p className="font-semibold mb-3">Enter PIN to Edit</p>

      <input
        type="password"
        maxLength={6}
        value={pinInput}
        onChange={(e) => setPinInput(e.target.value)}
        className="border rounded w-full px-3 py-2 text-center"
        placeholder="******"
      />

      <div className="flex justify-between mt-4">
        <button
          onClick={() => setShowPinPopup(false)}
          className="bg-gray-300 px-4 py-1 rounded"
        >
          Cancel
        </button>

        <button
          onClick={() => {
            if (pinInput === "200356") {
              setShowPinPopup(false);
              setPaymentEditorBill(selectedBill);
            } else {
              alert("Incorrect PIN!");
            }
          }}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded"
        >
          Confirm
        </button>
      </div>
    </div>
  </div>
)}


{paymentEditorBill && (
  <div className="fixed inset-0 flex items-center justify-center z-50">

    {/* Background Overlay */}
    <div className="absolute inset-0 bg-black opacity-40 pointer-events-none"></div>

    {/* Modal */}
    <div className="relative bg-white p-6 rounded-xl shadow-xl w-96 text-xs z-50">
      <h3 className="text-base font-bold mb-3">
        Edit Payments - {paymentEditorBill.billNumber}
      </h3>

      <div className="space-y-2 max-h-72 overflow-y-auto">
        {paymentMethods.map((method, index) => {
          const selected = payments.some(p => p.method === method);
          return (
            <div key={index} className="flex justify-between items-center">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={selected}
                  onChange={() => handleCheck(method)}
                />
                {method}
              </label>

              {selected && (
                <input
                  type="number"
                  value={payments.find(p => p.method === method)?.amount || ""}
                  onChange={(e) =>
                    handleAmountChangeForPaymentMethod(method, e.target.value)
                  }
                  className="border rounded px-2 py-1 w-24"
                  placeholder="Amount"
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={() => setPaymentEditorBill(null)}
          className="bg-gray-300 px-3 py-1 rounded"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              const res = await axios.patch(
                `${import.meta.env.VITE_API_URL}/api/bills/${paymentEditorBill._id}/payments`,
                { payments }
              );

              alert("Payments updated successfully!");
              fetchBills();
              setPaymentEditorBill(null);
            } catch (err) {
              console.error(err);
              alert("Failed to update payments!");
            }
          }}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1 rounded"
        >
          Save
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
