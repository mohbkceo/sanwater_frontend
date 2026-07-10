import React, { useEffect, useMemo, useState } from "react";
import {
  Search,
  Filter,
  Trash2,
  RefreshCw,
  ChevronDown,
  Package,
  MapPin,
  Phone,
  User,
  CalendarDays,
  CircleDollarSign,
  ClipboardList,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Truck,
  XCircle,
} from "lucide-react";

const STATUS_OPTIONS = [
  "pending",
  "confirmed",
  "processing",
  "shipped",
  "delivered",
  "cancelled",
];

const STATUS_META = {
  pending: { label: "Pending", icon: Clock3, pill: "bg-amber-50 text-amber-700 border-amber-200" },
  confirmed: { label: "Confirmed", icon: CheckCircle2, pill: "bg-blue-50 text-blue-700 border-blue-200" },
  processing: { label: "Processing", icon: ClipboardList, pill: "bg-violet-50 text-violet-700 border-violet-200" },
  shipped: { label: "Shipped", icon: Truck, pill: "bg-cyan-50 text-cyan-700 border-cyan-200" },
  delivered: { label: "Delivered", icon: CheckCircle2, pill: "bg-emerald-50 text-emerald-700 border-emerald-200" },
  cancelled: { label: "Cancelled", icon: XCircle, pill: "bg-rose-50 text-rose-700 border-rose-200" },
};

const apiBaseUrl =  import.meta.env.VITE_BACK_END_BASE_URL+ "/content"

const initialFilters = {
  search: "",
  status: "all",
  sort: "newest",
};

export default function OrderManagementPage() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filters, setFilters] = useState(initialFilters);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadOrders(silent = false) {
    try {
      if (silent) setRefreshing(true);
      else setLoading(true);
      setError("");
      const res = await fetch(apiBaseUrl + "/orders");
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Failed to load orders.");
      }

      setOrders(Array.isArray(data?.data) ? data.data : []);
    } catch (err) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  const filteredOrders = useMemo(() => {
    const search = filters.search.trim().toLowerCase();

    const list = orders.filter((order) => {
      const matchesStatus = filters.status === "all" ? true : order.status === filters.status;
      const matchesSearch = !search
        ? true
        : [
            order.fullName,
            order.phoneNumber,
            order.address,
            order.productName,
            order.serialNumber,
            order.productId,
          ]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(search));

      return matchesStatus && matchesSearch;
    });

    list.sort((a, b) => {
      const aTime = new Date(a.createdAt || 0).getTime();
      const bTime = new Date(b.createdAt || 0).getTime();
      if (filters.sort === "oldest") return aTime - bTime;
      if (filters.sort === "total-high") return Number(b.total || 0) - Number(a.total || 0);
      if (filters.sort === "total-low") return Number(a.total || 0) - Number(b.total || 0);
      return bTime - aTime;
    });

    return list;
  }, [orders, filters]);

  const stats = useMemo(() => {
    const total = orders.length;
    const pending = orders.filter((o) => o.status === "pending").length;
    const shipped = orders.filter((o) => o.status === "shipped").length;
    const delivered = orders.filter((o) => o.status === "delivered").length;
    const revenue = orders.reduce((sum, o) => sum + Number(o.total || 0), 0);

    return { total, pending, shipped, delivered, revenue };
  }, [orders]);

  async function updateOrderStatus(orderId, status) {
    try {
      setActionLoadingId(orderId);
      setError("");
      setSuccess("");

      const res = await fetch(apiBaseUrl + `/order/${orderId}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data?.message || "Could not update order status.");

      const updated = data?.data;
      setOrders((prev) => prev.map((order) => (order._id === updated._id ? updated : order)));
      setSelectedOrder((prev) => (prev?._id === updated._id ? updated : prev));
      setSuccess("Order status updated successfully.");
    } catch (err) {
      setError(err.message || "Could not update order status.");
    } finally {
      setActionLoadingId(null);
    }
  }

  async function deleteOrder(orderId) {
    const confirmed = window.confirm("Delete this order permanently?");
    if (!confirmed) return;

    try {
      setActionLoadingId(orderId);
      setError("");
      setSuccess("");

      const res = await fetch(apiBaseUrl + `/order/${orderId}`, { method: "DELETE" });
      const data = await res.json();

      if (!res.ok) throw new Error(data?.message || "Could not delete order.");

      setOrders((prev) => prev.filter((order) => order._id !== orderId));
      setSelectedOrder((prev) => (prev?._id === orderId ? null : prev));
      setSuccess("Order deleted successfully.");
    } catch (err) {
      setError(err.message || "Could not delete order.");
    } finally {
      setActionLoadingId(null);
    }
  }

  const emptyState = !loading && filteredOrders.length === 0;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur sticky top-0 z-30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-5 flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-emerald-600">Admin dashboard</p>
            <h1 className="mt-1 text-2xl sm:text-3xl font-extrabold tracking-tight">Order Management</h1>
            <p className="mt-2 text-sm text-slate-500">Track, filter, update, and delete orders from one place.</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => loadOrders(true)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <div className="rounded-xl bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white shadow-sm">
              {stats.total} total orders
            </div>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-6 lg:py-8">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
          <StatCard title="Total orders" value={stats.total} icon={Package} />
          <StatCard title="Pending" value={stats.pending} icon={Clock3} />
          <StatCard title="Shipped" value={stats.shipped} icon={Truck} />
          <StatCard title="Delivered" value={stats.delivered} icon={CheckCircle2} />
          <StatCard title="Revenue" value={`${formatMoney(stats.revenue)} DA`} icon={CircleDollarSign} />
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-200 p-4 sm:p-5">
            <div className="grid gap-3 lg:grid-cols-12 lg:items-center">
              <div className="lg:col-span-5 relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={filters.search}
                  onChange={(e) => setFilters((prev) => ({ ...prev, search: e.target.value }))}
                  placeholder="Search by name, phone, address, product, serial..."
                  className="w-full rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                />
              </div>

              <div className="lg:col-span-3 relative">
                <Filter className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <select
                  value={filters.status}
                  onChange={(e) => setFilters((prev) => ({ ...prev, status: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 pl-11 pr-10 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="all">All statuses</option>
                  {STATUS_OPTIONS.map((status) => (
                    <option key={status} value={status}>
                      {capitalize(status)}
                    </option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="lg:col-span-3 relative">
                <select
                  value={filters.sort}
                  onChange={(e) => setFilters((prev) => ({ ...prev, sort: e.target.value }))}
                  className="w-full appearance-none rounded-2xl border border-slate-200 bg-slate-50 py-3 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/10"
                >
                  <option value="newest">Sort: newest</option>
                  <option value="oldest">Sort: oldest</option>
                  <option value="total-high">Sort: total high to low</option>
                  <option value="total-low">Sort: total low to high</option>
                </select>
                <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="lg:col-span-1 flex justify-end text-sm text-slate-500 font-medium">
                {filteredOrders.length} shown
              </div>
            </div>
          </div>

          {error && (
            <div className="mx-4 mt-4 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {success && (
            <div className="mx-4 mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{success}</span>
            </div>
          )}

          <div className="grid lg:grid-cols-[1.6fr_1fr]">
            <div className="overflow-x-auto border-b lg:border-b-0 lg:border-r border-slate-200">
              <div className="min-w-[980px]">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <div className="col-span-3">Customer</div>
                  <div className="col-span-2">Product</div>
                  <div className="col-span-2">Order info</div>
                  <div className="col-span-2">Amount</div>
                  <div className="col-span-2">Status</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>

                {loading ? (
                  <div className="space-y-2 p-4">
                    {Array.from({ length: 7 }).map((_, i) => (
                      <div key={i} className="h-20 animate-pulse rounded-2xl bg-slate-100" />
                    ))}
                  </div>
                ) : emptyState ? (
                  <div className="p-10 text-center">
                    <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
                      <Package className="h-6 w-6" />
                    </div>
                    <h3 className="mt-4 text-lg font-bold">No orders found</h3>
                    <p className="mt-2 text-sm text-slate-500">Try another search term or clear the filters.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {filteredOrders.map((order) => (
                      <OrderRow
                        key={order._id}
                        order={order}
                        onSelect={() => setSelectedOrder(order)}
                        onDelete={() => deleteOrder(order._id)}
                        onStatusChange={(status) => updateOrderStatus(order._id, status)}
                        actionLoading={actionLoadingId === order._id}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <aside className="bg-slate-50/70 p-4 sm:p-5">
              {selectedOrder ? (
                <OrderDetailsCard
                  order={selectedOrder}
                  onClose={() => setSelectedOrder(null)}
                  onStatusChange={(status) => updateOrderStatus(selectedOrder._id, status)}
                  onDelete={() => deleteOrder(selectedOrder._id)}
                  actionLoading={actionLoadingId === selectedOrder._id}
                />
              ) : (
                <div className="rounded-3xl border border-dashed border-slate-300 bg-white p-6 text-center shadow-sm">
                  <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                    <ClipboardList className="h-6 w-6" />
                  </div>
                  <h3 className="mt-4 text-lg font-bold">Order details</h3>
                  <p className="mt-2 text-sm text-slate-500">
                    Select an order to inspect customer data, product details, and update status.
                  </p>
                </div>
              )}
            </aside>
          </div>
        </div>
      </main>
    </div>
  );
}

function OrderRow({ order, onSelect, onDelete, onStatusChange, actionLoading }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="grid grid-cols-12 gap-3 px-5 py-4 hover:bg-slate-50 transition">
      <div className="col-span-3">
        <button onClick={onSelect} className="text-left group">
          <div className="flex items-start gap-3">
            <div className="mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
              <User className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-slate-900 group-hover:text-emerald-700 transition truncate">
                {order.fullName || "Unknown customer"}
              </div>
              <div className="mt-1 text-xs text-slate-500 truncate flex items-center gap-1">
                <Phone className="h-3.5 w-3.5" />
                {order.phoneNumber || "—"}
              </div>
              <div className="mt-1 text-xs text-slate-500 truncate flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {order.address || "—"}
              </div>
            </div>
          </div>
        </button>
      </div>

      <div className="col-span-2">
        <button onClick={onSelect} className="text-left w-full">
          <div className="font-semibold text-slate-900 truncate">{order.productName || "—"}</div>
          <div className="mt-1 text-xs text-slate-500 truncate">{order.serialNumber || "—"}</div>
          <div className="mt-1 text-xs text-slate-400 truncate">{order.productId || "—"}</div>
        </button>
      </div>

      <div className="col-span-2 text-sm text-slate-600">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-slate-400" />
          {formatDate(order.createdAt)}
        </div>
        <div className="mt-2 text-xs text-slate-500">Qty: {order.quantity || 1}</div>
      </div>

      <div className="col-span-2">
        <div className="font-bold text-slate-900">{formatMoney(order.total)} DA</div>
        <div className="mt-1 text-xs text-slate-500">Subtotal: {formatMoney(order.subtotal)} DA</div>
        <div className="text-xs text-slate-500">Shipping: {formatMoney(order.shippingPrice)} DA</div>
      </div>

      <div className="col-span-2">
        <select
          value={order.status}
          onChange={(e) => onStatusChange(e.target.value)}
          disabled={actionLoading}
          className={`w-full appearance-none rounded-2xl border px-3 py-2.5 text-sm font-semibold outline-none ${meta.pill} disabled:opacity-60`}
        >
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status} className="text-slate-900 bg-white">
              {capitalize(status)}
            </option>
          ))}
        </select>
        <div className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${meta.pill}`}>
          <StatusIcon className="h-3.5 w-3.5" />
          {meta.label}
        </div>
      </div>

      <div className="col-span-1 flex justify-end">
        <button
          onClick={onDelete}
          disabled={actionLoading}
          className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-60"
          title="Delete order"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function OrderDetailsCard({ order, onClose, onStatusChange, onDelete, actionLoading }) {
  const meta = STATUS_META[order.status] || STATUS_META.pending;
  const StatusIcon = meta.icon;

  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-emerald-600">Order details</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight">{order.fullName}</h2>
        </div>
        <button onClick={onClose} className="rounded-xl border border-slate-200 px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50">
          Close
        </button>
      </div>

      <div className={`mt-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-sm font-semibold ${meta.pill}`}>
        <StatusIcon className="h-4 w-4" />
        {meta.label}
      </div>

      <div className="mt-5 space-y-4">
        <InfoBlock label="Product" value={order.productName} />
        <InfoBlock label="Serial number" value={order.serialNumber} />
        <InfoBlock label="Product ID" value={order.productId} />
        <InfoBlock label="Phone number" value={order.phoneNumber} />
        <InfoBlock label="Address" value={order.address} />
        <InfoBlock label="Quantity" value={String(order.quantity || 1)} />
        <InfoBlock label="Subtotal" value={`${formatMoney(order.subtotal)} DA`} />
        <InfoBlock label="Shipping" value={`${formatMoney(order.shippingPrice)} DA`} />
        <InfoBlock label="Total" value={`${formatMoney(order.total)} DA`} strong />
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <button
          onClick={() => onStatusChange("confirmed")}
          disabled={actionLoading}
          className="rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
        >
          Confirm
        </button>
        <button
          onClick={() => onStatusChange("shipped")}
          disabled={actionLoading}
          className="rounded-2xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Mark shipped
        </button>
        <button
          onClick={() => onStatusChange("delivered")}
          disabled={actionLoading}
          className="rounded-2xl border border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-60"
        >
          Mark delivered
        </button>
        <button
          onClick={() => onStatusChange("cancelled")}
          disabled={actionLoading}
          className="rounded-2xl border border-rose-200 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-50 disabled:opacity-60"
        >
          Cancel
        </button>
      </div>

      <button
        onClick={onDelete}
        disabled={actionLoading}
        className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
      >
        <Trash2 className="h-4 w-4" />
        Delete order
      </button>
    </div>
  );
}

function InfoBlock({ label, value, strong = false }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">{label}</div>
      <div className={`mt-1 text-sm ${strong ? "font-extrabold text-slate-900" : "font-semibold text-slate-800"}`}>
        {value || "—"}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon }) {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">{title}</p>
          <div className="mt-2 text-2xl font-extrabold tracking-tight">{value}</div>
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-900 text-white">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function formatMoney(value) {
  const num = Number(value || 0);
  return new Intl.NumberFormat("en-US").format(num);
}

function formatDate(dateString) {
  if (!dateString) return "—";
  try {
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(new Date(dateString));
  } catch {
    return "—";
  }
}

function capitalize(text) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}
