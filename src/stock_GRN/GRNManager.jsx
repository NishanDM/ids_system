import React, { useEffect, useState, useMemo } from "react";
import {  BarChart,  Bar,  XAxis,  YAxis,  Tooltip,  ResponsiveContainer,  Legend,  Cell} from "recharts";

// GRNManager
// - Shows a scrollable searchable list of GRN invoices
// - Click a row to open a detail side-panel (modal) with full GRN fields
// - Editable fields: paymentMethodOfGRN, paidAmount, remarks
// - Supports PATCH (partial) and PUT (replace) update calls
// - Uses Tailwind CSS for styling

export default function GRNManager() {
  const [grns, setGrns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [query, setQuery] = useState("");
  const [filterBy, setFilterBy] = useState("all"); // invoice | supplier | date | all

  const [selectedGrn, setSelectedGrn] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  // local copy for edits
  const [local, setLocal] = useState({});

  useEffect(() => {
    fetchList();
  }, []);

  const fetchList = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grn/`);
      if (!res.ok) throw new Error("Failed to fetch GRNs");
      const data = await res.json();
      setGrns(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openDetail = (grn) => {
    setSelectedGrn(grn);
    setLocal({
      paymentMethodOfGRN: grn.paymentMethodOfGRN || "",
      paidAmount: grn.paidAmount ?? 0,
      remarks: grn.remarks || "",
    });
    setEditing(false);
    setDetailOpen(true);
  };

  const closeDetail = () => {
    setDetailOpen(false);
    setSelectedGrn(null);
    setLocal({});
  };

  // search logic (simple deep search on invoice, supplier, date)
  const filtered = useMemo(() => {
    if (!query) return grns;
    const q = query.trim().toLowerCase();
    return grns.filter((g) => {
      if (filterBy === "invoice") return (g.invoice || "").toLowerCase().includes(q);
      if (filterBy === "supplier") return (g.supplier || "").toLowerCase().includes(q);
      if (filterBy === "date") return (g.date || "").toLowerCase().includes(q);
      // default deep search
      const hay = [g.invoice, g.supplier, g.date, (g.remarks || "")].filter(Boolean).join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [grns, query, filterBy]);

  // handle field change in panel
  const handleLocalChange = (key, value) => {
    setLocal((p) => ({ ...p, [key]: value }));
  };

  // PATCH partial update (recommended for changing only the three fields)
  const handlePatch = async () => {
    if (!selectedGrn) return;
    setSaving(true);
    setError(null);
    try {
      const body = {
        paymentMethodOfGRN: local.paymentMethodOfGRN,
        paidAmount: Number(local.paidAmount) || 0,
        remarks: local.remarks,
      };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grn/${selectedGrn._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to PATCH GRN");
      }
      const updated = await res.json();
      // update local list
      setGrns((prev) => prev.map((g) => (g._id === selectedGrn._id ? { ...g, ...updated } : g)));
      // reflect updated
      setSelectedGrn((s) => ({ ...s, ...updated }));
      setEditing(false);
      alert("✅ GRN updated (PATCH)");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update");
      alert("⚠️ " + (err.message || "Failed to update"));
    } finally {
      setSaving(false);
    }
  };

  // PUT full replace - careful: will replace whole document on server
  const handlePut = async () => {
    if (!selectedGrn) return;
    setSaving(true);
    setError(null);
    try {
      // build full object by merging selectedGrn with local edits
      const full = { ...selectedGrn, ...local };
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/grn/${selectedGrn._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(full),
      });
      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || "Failed to PUT GRN");
      }
      const updated = await res.json();
      setGrns((prev) => prev.map((g) => (g._id === selectedGrn._id ? updated : g)));
      setSelectedGrn(updated);
      setEditing(false);
      alert("✅ GRN replaced (PUT)");
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to replace");
      alert("⚠️ " + (err.message || "Failed to replace"));
    } finally {
      setSaving(false);
    }
  };

///===============CHART SECTION==============
const chartColors = [
  "#1E88E5", "#D81B60", "#43A047", "#FB8C00", "#8E24AA",
  "#00ACC1", "#F4511E", "#3949AB", "#7CB342", "#5E35B1"
];

const colorBySupplier = (supplierIndex) => chartColors[supplierIndex % chartColors.length];



const supplierTotals = useMemo(() => {
  const map = {};

  grns.forEach((g) => {
    const supplier = g.supplier || "Unknown";
    const total = Number(g.grandTotal) || 0;
    const paid = Number(g.paidAmount) || 0;
    const unpaid = total - paid;

    if (!map[supplier]) {
      map[supplier] = { supplier, total: 0, paid: 0, unpaid: 0 };
    }

    map[supplier].total += total;
    map[supplier].paid += paid;
    map[supplier].unpaid += unpaid;
  });

  // Convert to array + sort by largest total
  return Object.values(map).sort((a, b) => b.total - a.total);
}, [grns]);



  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-lg font-semibold">GRN Invoices</h3>
        <div className="flex items-center gap-2">
          <select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            className="border rounded p-1 text-sm"
          >
            <option value="all">All (deep search)</option>
            <option value="invoice">Invoice</option>
            <option value="supplier">Supplier</option>
            <option value="date">Date</option>
          </select>

          <input
            placeholder={`Search ${filterBy === 'all' ? 'invoice/supplier/date/remarks' : filterBy}`}
            className="border rounded p-1 text-sm w-64"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <button
            onClick={fetchList}
            className="px-3 py-1 bg-gray-800 text-white rounded text-sm"
          >
            Refresh
          </button>
        </div>
      </div>

      <div className="border rounded h-96 overflow-auto">
        {loading ? (
          <div className="p-6 text-center">Loading...</div>
        ) : error ? (
          <div className="p-6 text-center text-red-600">{error}</div>
        ) : (
          <table className="min-w-full text-sm">
            <thead className="sticky top-0 bg-gray-100">
              <tr>
                <th className="px-3 py-2 text-left">Invoice</th>
                <th className="px-3 py-2 text-left">Date</th>
                <th className="px-3 py-2 text-left">Supplier</th>
                <th className="px-3 py-2 text-right">Grand Total</th>
                <th className="px-3 py-2 text-left">Paid</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((g) => (
                <tr
                  key={g._id}
                  className="border-b hover:bg-gray-50 cursor-pointer"
                  onClick={() => openDetail(g)}
                >
                  <td className="px-3 py-2">{g.invoice || "—"}</td>
                  <td className="px-3 py-2">{g.date || "—"}</td>
                  <td className="px-3 py-2">{g.supplier || "—"}</td>
                  <td className="px-3 py-2 text-right">{Number(g.grandTotal || 0).toLocaleString()}</td>
                  <td className="px-3 py-2">{g.paidAmount ? Number(g.paidAmount).toLocaleString() : "0"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Detail panel modal */}
      {detailOpen && selectedGrn && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-6">
          <div className="absolute inset-0 bg-black opacity-40" onClick={closeDetail}></div>

          <div className="relative bg-white rounded-xl shadow-lg max-w-4xl w-full overflow-auto max-h-[85vh] p-4">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold">GRN Detail — {selectedGrn.invoice || selectedGrn._id}</h4>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setEditing((p) => !p)}
                  className="px-3 py-1 rounded border text-sm"
                >
                  {editing ? "Cancel Edit" : "Edit"}
                </button>
                <button onClick={closeDetail} className="px-3 py-1 rounded border text-sm">Close</button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-1">
                <div className="text-xs text-gray-500">Invoice</div>
                <div className="font-medium">{selectedGrn.invoice || "—"}</div>

                <div className="text-xs text-gray-500 mt-2">Date</div>
                <div className="font-medium">{selectedGrn.date || "—"}</div>

                <div className="text-xs text-gray-500 mt-2">Supplier</div>
                <div className="font-medium">{selectedGrn.supplier || "—"}</div>

                <div className="text-xs text-gray-500 mt-2">Grand Total</div>
                <div className="font-medium">Rs. {Number(selectedGrn.grandTotal || 0).toLocaleString()}</div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs text-gray-500">Payment Method</label>
                {editing ? (
                  <select
                        className="border rounded p-2 text-sm w-full"
                        value={local.paymentMethodOfGRN}
                        onChange={(e) => handleLocalChange("paymentMethodOfGRN", e.target.value)}
                        >
                        <option value="">Select Payment Method</option>
                        <option value="CASH">CASH</option>
                        <option value="BANKTRANSFER">BANK TRANSFER</option>
                        <option value="CHEQUE">CHEQUE</option>
                        <option value="OTHER">OTHER</option>
                        </select>
                ) : (
                  <div className="font-medium">{selectedGrn.paymentMethodOfGRN || "—"}</div>
                )}

                <label className="block text-xs text-gray-500">Paid Amount</label>
                {editing ? (
                  <input
                    type="number"
                    className="border rounded p-2 text-sm w-full"
                    value={local.paidAmount}
                    onChange={(e) => handleLocalChange("paidAmount", e.target.value)}
                    min={0}
                  />
                ) : (
                  <div className="font-medium">Rs. {Number(selectedGrn.paidAmount || 0).toLocaleString()}</div>
                )}

                <label className="block text-xs text-gray-500">Remarks</label>
                {editing ? (
                  <textarea
                    className="border rounded p-2 text-sm w-full"
                    rows={3}
                    value={local.remarks}
                    onChange={(e) => handleLocalChange("remarks", e.target.value)}
                  />
                ) : (
                  <div className="font-medium text-xs whitespace-pre-wrap">{selectedGrn.remarks || "—"}</div>
                )}

                <div className="flex gap-2 mt-2">
                  {editing && (
                    <>
                      <button
                        onClick={handlePatch}
                        disabled={saving}
                        className="px-3 py-1 bg-green-600 text-white rounded text-sm disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save"}
                      </button>

                      {/* <button
                        onClick={handlePut}
                        disabled={saving}
                        className="px-3 py-1 bg-blue-600 text-white rounded text-sm disabled:opacity-60"
                      >
                        {saving ? "Saving..." : "Save (PUT)"}
                      </button> */}
                    </>
                  )}

                  {/* <button className="px-3 py-1 border rounded text-sm" onClick={() => { navigator.clipboard?.writeText(JSON.stringify(selectedGrn, null, 2)); alert('Copied to clipboard') }}>
                    Copy JSON
                  </button> */}
                </div>
              </div>
            </div>

            {/* Items table */}
            <div>
              <div className="text-sm font-semibold mb-2">Items</div>
              <div className="overflow-auto max-h-56 border rounded">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-2 py-1 text-left">Label</th>
                      <th className="px-2 py-1 text-left">Category</th>
                      <th className="px-2 py-1 text-right">Qty</th>
                      <th className="px-2 py-1 text-right">Unit</th>
                      <th className="px-2 py-1 text-right">Line Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(selectedGrn.items || []).map((it) => (
                      <tr key={it._id || it.key} className="border-t">
                        <td className="px-2 py-1">{it.label || it.key}</td>
                        <td className="px-2 py-1">{it.category}</td>
                        <td className="px-2 py-1 text-right">{it.qty}</td>
                        <td className="px-2 py-1 text-right">{Number(it.unitPrice || 0).toLocaleString()}</td>
                        <td className="px-2 py-1 text-right">{Number(it.lineTotal || 0).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {error && <div className="text-sm text-red-600 mt-3">{error}</div>}
          </div>
        </div>
      )}
{/* Supplier Payment Overview Chart */}
<div className="mt-8 p-4 border rounded bg-white shadow">
  <h4 className="font-semibold mb-3">Supplier Payment Overview (Paid vs Unpaid)</h4>

  {supplierTotals.length === 0 ? (
    <div className="text-sm text-gray-500">No data to display</div>
  ) : (
    <ResponsiveContainer width="100%" height={350}>
      <BarChart data={supplierTotals}>
        <XAxis dataKey="supplier" />
        <YAxis />
        <Tooltip formatter={(v) => `Rs. ${Number(v).toLocaleString()}`} />
        <Legend />

        {/* PAID amount */}
        <Bar dataKey="paid" stackId="total" name="Paid Amount">
          {supplierTotals.map((_, i) => (
            <Cell key={i} fill={colorBySupplier(i)} />
          ))}
        </Bar>

        {/* UNPAID amount */}
        <Bar dataKey="unpaid" stackId="total" name="Unpaid Amount" fill="#ef4444" />

      </BarChart>
    </ResponsiveContainer>
  )}
</div>

    </div>
  );
}
