"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FaCheckCircle, FaHourglassHalf, FaTimesCircle, FaTruck, FaFileExport, FaEuroSign, FaCreditCard, FaEnvelope, FaPhone, FaCalendarAlt, FaDownload, FaEye } from "react-icons/fa";

// Dummy data for demonstration
const dummyOrders = [
  {
    id: "ORD-001",
    date: "2025-08-18",
    customer: "Γιάννης Παπαδόπουλος",
    status: "Ολοκληρώθηκε",
    payment: "Πληρωμένο",
    total: 120.5,
    items: [
      { name: "Προϊόν Α", qty: 2, price: 30 },
      { name: "Προϊόν Β", qty: 1, price: 60.5 },
    ],
    address: "Αθήνα, Ελλάδα",
    phone: "6901234567",
    email: "giannis@example.com",
    notes: "Παράδοση μετά τις 18:00",
    shipping: "Courier",
    timeline: [
      { label: "Τοποθετήθηκε", date: "2025-08-18 10:00" },
      { label: "Επιβεβαιώθηκε", date: "2025-08-18 10:10" },
      { label: "Απεστάλη", date: "2025-08-18 13:00" },
      { label: "Ολοκληρώθηκε", date: "2025-08-19 09:00" },
    ],
  },
  {
    id: "ORD-002",
    date: "2025-08-17",
    customer: "Μαρία Κωνσταντίνου",
    status: "Εκκρεμεί",
    payment: "Απλήρωτο",
    total: 75.0,
    items: [
      { name: "Προϊόν Γ", qty: 3, price: 25 },
    ],
    address: "Θεσσαλονίκη, Ελλάδα",
    phone: "6987654321",
    email: "maria@example.com",
    notes: "",
    shipping: "Pickup",
    timeline: [
      { label: "Τοποθετήθηκε", date: "2025-08-17 11:00" },
      { label: "Επιβεβαιώθηκε", date: "2025-08-17 11:10" },
    ],
  },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [dateRange, setDateRange] = useState("");
  const [sortBy, setSortBy] = useState("date");
  const [sortDir, setSortDir] = useState("desc");
  const [selectedIds, setSelectedIds] = useState([]);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [bulkStatus, setBulkStatus] = useState("");

  // Bulk actions handlers
  const handleBulkDelete = () => {
    if (!window.confirm("Διαγραφή επιλεγμένων παραγγελιών;")) return;
    setOrders(orders => orders.filter(o => !selectedIds.includes(o.id)));
    setSelectedIds([]);
  };
  const handleBulkExport = () => {
    // Simple CSV export for selected orders
    const selectedOrders = orders.filter(o => selectedIds.includes(o.id));
    if (selectedOrders.length === 0) return;
    const csv = [
      ["ID","Ημερομηνία","Πελάτης","Email","Τηλέφωνο","Κατάσταση","Πληρωμή","Σύνολο"],
      ...selectedOrders.map(o => [o.id, o.date, o.customer, o.email, o.phone, o.status, o.payment, o.total])
    ].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "orders.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };
  const handleBulkStatus = (status) => {
    setOrders(orders => orders.map(o => selectedIds.includes(o.id) ? { ...o, status } : o));
    setShowStatusDropdown(false);
    setSelectedIds([]);
  };

  useEffect(() => {
    // Replace with API call
    setOrders(dummyOrders);
  }, []);

  // Quick stats
  const totalOrders = orders.length;
  const totalRevenue = orders.reduce((sum, o) => sum + o.total, 0);
  const pendingOrders = orders.filter(o => o.status === "Εκκρεμεί").length;

  // Filtering
  let filtered = orders.filter(order => {
    const matchesSearch =
      order.customer.toLowerCase().includes(search.toLowerCase()) ||
      order.id.toLowerCase().includes(search.toLowerCase()) ||
      order.email.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter ? order.status === statusFilter : true;
    // Date range filter (simple demo: Today, This Week, All)
    let matchesDate = true;
    if (dateRange === "today") {
      const today = new Date().toISOString().slice(0, 10);
      matchesDate = order.date === today;
    } else if (dateRange === "week") {
      const now = new Date();
      const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
      matchesDate = new Date(order.date) >= weekAgo;
    }
    return matchesSearch && matchesStatus && matchesDate;
  });

  // Sorting
  filtered = filtered.sort((a, b) => {
    let vA = a[sortBy], vB = b[sortBy];
    if (sortBy === "total") {
      return sortDir === "asc" ? vA - vB : vB - vA;
    }
    if (sortBy === "date") {
      return sortDir === "asc"
        ? new Date(vA) - new Date(vB)
        : new Date(vB) - new Date(vA);
    }
    return sortDir === "asc"
      ? String(vA).localeCompare(String(vB))
      : String(vB).localeCompare(String(vA));
  });

  // Status badge helper
  const statusBadge = (status) => {
    const base = "flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full justify-center text-center";
    if (status === "Ολοκληρώθηκε")
      return <span className={`${base} text-green-700 bg-green-100 border border-green-300`}><FaCheckCircle className="inline" /> Ολοκληρώθηκε</span>;
    if (status === "Εκκρεμεί")
      return <span className={`${base} text-yellow-700 bg-yellow-100 border border-yellow-300`}><FaHourglassHalf className="inline" /> Εκκρεμεί</span>;
    if (status === "Ακυρώθηκε")
      return <span className={`${base} text-red-700 bg-red-100 border border-red-300`}><FaTimesCircle className="inline" /> Ακυρώθηκε</span>;
    if (status === "Απεστάλη")
      return <span className={`${base} text-blue-700 bg-blue-100 border border-blue-300`}><FaTruck className="inline" /> Απεστάλη</span>;
    return <span className={`${base} text-gray-700 bg-gray-100 border border-gray-300`}>{status}</span>;
  };

  // Payment badge helper
  const paymentBadge = (payment) => {
    const base = "flex items-center gap-1 px-3 py-1 text-xs font-semibold rounded-full justify-center text-center";
    if (payment === "Πληρωμένο")
      return <span className={`${base} text-green-700 border border-green-200 bg-green-50`}><FaCreditCard className="inline" /> Πληρωμένο</span>;
    if (payment === "Απλήρωτο")
      return <span className={`${base} text-yellow-700 border border-yellow-200 bg-yellow-50`}><FaCreditCard className="inline" /> Απλήρωτο</span>;
    if (payment === "Επιστροφή")
      return <span className={`${base} text-red-700 border border-red-200 bg-red-50`}><FaCreditCard className="inline" /> Επιστροφή</span>;
    return <span className={`${base} text-gray-700 border border-gray-200 bg-gray-50`}>{payment}</span>;
  };

  // Bulk select
  const toggleSelect = (id) => {
    setSelectedIds(ids => ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id]);
  };
  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) setSelectedIds([]);
    else setSelectedIds(filtered.map(o => o.id));
  };

  // Table header sort
  const thSort = (label, key) => (
    <th
      className="px-4 py-3 text-left text-xs font-medium text-[var(--silver)] uppercase tracking-wider cursor-pointer select-none"
      onClick={() => {
        if (sortBy === key) setSortDir(d => d === "asc" ? "desc" : "asc");
        else { setSortBy(key); setSortDir("asc"); }
      }}
    >
      {label} {sortBy === key ? (sortDir === "asc" ? "▲" : "▼") : ""}
    </th>
  );

  return (
    <div className="p-6">
      {/* Header like products page */}
      <div className="flex flex-col mb-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col mb-4 space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 lg:mb-0">
          <div className="flex items-center space-x-4">
            <Link
              href="/dashboard"
              className="p-2 hover:bg-[var(--background-secondary)] rounded-lg transition-colors text-[var(--foreground-muted)] hover:text-[var(--silver-light)]"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-[var(--silver-light)]">Παραγγελίες</h1>
          </div>
          <span className="bg-[var(--accent)] text-[var(--silver-light)] text-sm font-medium px-3 py-1 rounded-full self-start sm:self-auto">
            {orders.length} 
          </span>
        </div>
      </div>
      {/* Top Toolbar */}
      <div className="flex flex-col gap-4 mb-6 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <input
            type="text"
            placeholder="Αναζήτηση πελάτη, email ή ID..."
            className="border border-[var(--border)] rounded px-3 py-2 text-sm bg-[var(--background)] focus:outline-none text-white placeholder-white"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ minWidth: 220 }}
          />
          <select
            className="border border-[var(--border)] rounded px-3 py-2 text-sm bg-[var(--background)]"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
          >
            <option value="">Όλες οι καταστάσεις</option>
            <option value="Ολοκληρώθηκε">Ολοκληρώθηκε</option>
            <option value="Εκκρεμεί">Εκκρεμεί</option>
            <option value="Ακυρώθηκε">Ακυρώθηκε</option>
            <option value="Απεστάλη">Απεστάλη</option>
          </select>
          <select
            className="border border-[var(--border)] rounded px-3 py-2 text-sm bg-[var(--background)]"
            value={dateRange}
            onChange={e => setDateRange(e.target.value)}
          >
            <option value="">Όλες οι ημερομηνίες</option>
            <option value="today">Σήμερα</option>
            <option value="week">Αυτή την εβδομάδα</option>
          </select>
          <button className="flex items-center gap-1 px-3 py-2 rounded border border-[var(--accent)] text-white text-sm font-medium bg-[var(--accent)] hover:bg-[var(--accent-dark)] transition">
            <FaDownload /> Εξαγωγή CSV
          </button>
        </div>
        {/* Quick Stats */}
        <div className="flex gap-4 text-xs md:text-sm">
          <div className="bg-[var(--background-muted)] rounded px-3 py-2">Σύνολο: <b className="font-bold">{totalOrders}</b></div>
          <div className="bg-[var(--background-muted)] rounded px-3 py-2">Έσοδα: <b className="font-bold text-yellow-700">€{totalRevenue.toFixed(2)}</b></div>
          <div className="bg-[var(--background-muted)] rounded px-3 py-2">Εκκρεμείς: <b className="font-bold text-yellow-700">{pendingOrders}</b></div>
        </div>
      </div>

      {/* Bulk Actions Toolbar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center gap-2 mb-2 p-3 bg-[var(--background-muted)] rounded shadow animate-fade-in">
          <span className="font-medium text-white">Επιλεγμένα: {selectedIds.length}</span>
          <button onClick={handleBulkDelete} className="px-3 py-1 font-medium text-white transition bg-red-600 rounded hover:bg-red-700" aria-label="Διαγραφή επιλεγμένων"><FaTimesCircle className="inline mr-1" /> Διαγραφή</button>
          <button onClick={handleBulkExport} className="px-3 py-1 rounded bg-[var(--accent)] text-white font-medium hover:bg-[var(--accent-dark)] transition" aria-label="Εξαγωγή CSV"><FaFileExport className="inline mr-1" /> Εξαγωγή</button>
          <div className="relative">
            <button onClick={() => setShowStatusDropdown(s => !s)} className="px-3 py-1 font-medium text-white transition bg-yellow-600 rounded hover:bg-yellow-700" aria-label="Αλλαγή κατάστασης"><FaHourglassHalf className="inline mr-1" /> Αλλαγή Κατάστασης</button>
            {showStatusDropdown && (
              <div className="absolute left-0 mt-2 bg-white text-black rounded shadow z-10 min-w-[160px]">
                {["Ολοκληρώθηκε","Εκκρεμεί","Ακυρώθηκε","Απεστάλη"].map(st => (
                  <button key={st} onClick={() => handleBulkStatus(st)} className="block w-full text-left px-4 py-2 hover:bg-[var(--background-muted)]">{st}</button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg shadow border border-[var(--border)] bg-[var(--background)]">
        <table className="min-w-full divide-y divide-[var(--border)]">
          <thead className="bg-[var(--background-muted)]">
            <tr>
              <th className="px-3 py-3 font-extrabold text-white">
                <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} />
              </th>
              {thSort(<span className="text-xs font-extrabold text-white">ID</span>, "id")}
              {thSort(<span className="text-xs font-extrabold text-white">Ημερομηνία</span>, "date")}
              {thSort(<span className="font-extrabold text-white">Πελάτης</span>, "customer")}
              <th className="px-4 py-3 text-xs font-extrabold tracking-wider text-left text-white uppercase">EMAIL</th>
              <th className="px-4 py-3 text-xs font-extrabold tracking-wider text-left text-white uppercase">ΤΗΛΕΦΩΝΟ</th>
              {thSort(<span className="font-extrabold text-white">ΚΑΤΑΣΤΑΣΗ</span>, "status")}
              <th className="px-4 py-3 text-xs font-extrabold tracking-wider text-left text-white uppercase">ΠΛΗΡΩΜΗ</th>
              {thSort(<span className="font-extrabold text-white">ΣΥΝΟΛΟ</span>, "total")}
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="bg-[var(--background)] divide-y divide-[var(--border)]">
            {filtered.map((order, idx) => (
              <tr key={order.id} className={idx % 2 === 1 ? "bg-[var(--background-muted)]" : ""}>
                <td className="px-3 py-4">
                  <input type="checkbox" checked={selectedIds.includes(order.id)} onChange={() => toggleSelect(order.id)} aria-label="Επιλογή παραγγελίας" />
                </td>
                <td className="px-4 py-4 font-mono text-xs text-white whitespace-nowrap">{order.id}</td>
                <td className="px-4 py-4 text-xs text-white whitespace-nowrap">{order.date}</td>
                <td className="px-4 py-4 whitespace-nowrap">
                  <span className="text-white" title={`Email: ${order.email}\nΤηλ: ${order.phone}`}>{order.customer}</span>
                </td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span className="flex items-center gap-1 transition cursor-pointer" title={order.email}><FaEnvelope className="inline text-gray-400" />{order.email}</span>
                </td>
                <td className="px-4 py-4 text-center whitespace-nowrap">
                  <span className="flex items-center gap-1 transition cursor-pointer" title={order.phone}><FaPhone className="inline text-gray-400" />{order.phone}</span>
                </td>
                <td className="px-4 py-4 whitespace-nowrap">{statusBadge(order.status)}</td>
                <td className="px-4 py-4 whitespace-nowrap">{paymentBadge(order.payment)}</td>
                <td className="px-4 py-4 pr-6 font-mono font-bold text-right whitespace-nowrap">€{order.total.toFixed(2)}</td>
                <td className="flex gap-2 px-4 py-4 text-right whitespace-nowrap">
                  <button
                    className="flex items-center gap-1 bg-[var(--accent)] text-white px-3 py-1 rounded shadow-sm font-medium transition outline-none focus:ring-2 focus:ring-[var(--accent)]"
                    onClick={() => setSelectedOrder(order)}
                    aria-label="Προβολή παραγγελίας"
                  >
                    <FaEye /> Προβολή
                  </button>
                  <button className="flex items-center gap-1 px-3 py-1 font-medium text-gray-700 transition bg-white border border-gray-400 rounded shadow-sm outline-none focus:ring-2 focus:ring-gray-400 hover:bg-gray-100" aria-label="Λήψη τιμολογίου">
                    <FaFileExport /> Τιμολόγιο
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-[var(--background)] rounded-lg shadow-lg p-8 w-full max-w-2xl relative">
            <button
              className="absolute top-4 right-4 text-[var(--accent)] hover:text-[var(--accent-dark)] text-2xl"
              onClick={() => setSelectedOrder(null)}
              aria-label="Κλείσιμο λεπτομερειών"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-[var(--silver-light)]">Λεπτομέρειες Παραγγελίας</h2>
            <div className="grid grid-cols-1 mb-4 md:grid-cols-2 gap-x-8 gap-y-2">
              <div><span className="font-semibold">ID:</span> {selectedOrder.id}</div>
              <div><span className="font-semibold">Ημερομηνία:</span> {selectedOrder.date}</div>
              <div><span className="font-semibold">Πελάτης:</span> {selectedOrder.customer}</div>
              <div><span className="font-semibold">Email:</span> {selectedOrder.email}</div>
              <div><span className="font-semibold">Τηλέφωνο:</span> {selectedOrder.phone}</div>
              <div><span className="font-semibold">Κατάσταση:</span> {statusBadge(selectedOrder.status)}</div>
              <div><span className="font-semibold">Πληρωμή:</span> {paymentBadge(selectedOrder.payment)}</div>
              <div><span className="font-semibold">Σύνολο:</span> €{selectedOrder.total.toFixed(2)}</div>
              <div><span className="font-semibold">Διεύθυνση:</span> {selectedOrder.address}</div>
              <div><span className="font-semibold">Τρόπος Αποστολής:</span> {selectedOrder.shipping}</div>
              <div className="md:col-span-2"><span className="font-semibold">Σημειώσεις:</span> {selectedOrder.notes || "-"}</div>
            </div>
            <div className="mb-4">
              <span className="font-semibold">Προϊόντα:</span>
              <ul className="mt-1 ml-6 list-disc">
                {selectedOrder.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} x{item.qty} &ndash; €{item.price.toFixed(2)}
                  </li>
                ))}
              </ul>
            </div>
            {/* Timeline as vertical stepper */}
            <div className="mb-2">
              <span className="font-semibold">Χρονολόγιο:</span>
              <div className="mt-2 ml-4 border-l-2 border-[var(--accent)] pl-4">
                {selectedOrder.timeline?.map((step, idx, arr) => (
                  <div key={idx} className="relative flex items-start mb-2">
                    <span className={`w-3 h-3 rounded-full ${idx === arr.length-1 ? 'bg-green-400' : 'bg-[var(--accent)]'} border-2 border-white absolute -left-5 top-1`}></span>
                    <div>
                      <span className="font-semibold">{step.label}</span> <span className="text-[var(--silver)] text-xs">{step.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
