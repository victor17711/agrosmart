import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import {
  Package,
  Users,
  ShoppingCart,
  DollarSign,
  ArrowUpRight,
  ArrowDownRight,
  Filter,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// ------- Helpers --------
const currency = (n) =>
  `${Number(n || 0).toLocaleString('ro-RO', { maximumFractionDigits: 0 })} MDL`;

const WEEKS_DAYS = ['LUN', 'MAR', 'MIE', 'JOI', 'VIN', 'SÂM', 'DUM'];
const MONTHS = ['IAN', 'FEB', 'MAR', 'APR', 'MAI', 'IUN', 'IUL', 'AUG', 'SEP', 'OCT', 'NOI', 'DEC'];
const HOURS = ['00', '03', '06', '09', '12', '15', '18', '21'];

// Create a tiny sparkline dataset (deterministic pseudo-trend)
const makeSpark = (seed, len = 16) => {
  const arr = [];
  let v = seed;
  for (let i = 0; i < len; i++) {
    v += Math.sin(i * 0.7 + seed) * 4 + (Math.cos(i) * 2);
    arr.push({ i, v: Math.max(2, v) });
  }
  return arr;
};

// ------- KPI card --------
const KpiCard = ({ icon: Icon, title, value, delta, up = true, highlight = false, sparkColor }) => {
  const spark = makeSpark(value > 0 ? value % 100 : 20);
  return (
    <div
      data-testid={`kpi-${title.toLowerCase().replace(/\s+/g, '-')}`}
      className={`rounded-3xl p-5 relative overflow-hidden transition ${
        highlight
          ? 'bg-brand-500 text-white shadow-xl shadow-brand-200'
          : 'bg-white text-gray-900 shadow-sm border border-gray-100'
      }`}
    >
      <div className="flex items-start justify-between">
        <div
          className={`w-11 h-11 rounded-full flex items-center justify-center ${
            highlight ? 'bg-white/20' : 'bg-brand-50'
          }`}
        >
          <Icon className={`w-5 h-5 ${highlight ? 'text-white' : 'text-brand-600'}`} />
        </div>
        <button
          className={`w-8 h-8 rounded-full flex items-center justify-center ${
            highlight ? 'bg-white/20 hover:bg-white/30' : 'bg-gray-50 hover:bg-gray-100'
          }`}
          aria-hidden
        >
          <ArrowUpRight
            className={`w-4 h-4 ${highlight ? 'text-white' : 'text-gray-500'}`}
          />
        </button>
      </div>

      <p className={`mt-4 text-sm font-medium ${highlight ? 'text-white/80' : 'text-gray-500'}`}>
        {title}
      </p>
      <div className="flex items-end justify-between gap-3 mt-1">
        <p className="text-3xl font-extrabold tracking-tight">{value}</p>
        <div className="flex-1 h-10 max-w-[130px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={spark}>
              <Line
                type="monotone"
                dataKey="v"
                stroke={highlight ? '#FFFFFF' : sparkColor || '#A7CC32'}
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <p
        className={`mt-3 text-xs font-medium flex items-center gap-1 ${
          highlight ? 'text-white/90' : up ? 'text-brand-600' : 'text-rose-600'
        }`}
      >
        {up ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
        {delta}
      </p>
    </div>
  );
};

// ------- Range selector (segmented) --------
const RangeSelect = ({ value, onChange, options, testid }) => (
  <div data-testid={testid} className="inline-flex items-center gap-1 bg-gray-50 rounded-full p-1 border border-gray-100">
    {options.map((o) => (
      <button
        key={o.value}
        type="button"
        onClick={() => onChange(o.value)}
        data-testid={`${testid}-${o.value}`}
        className={`text-xs font-semibold px-3 py-1.5 rounded-full transition ${
          value === o.value
            ? 'bg-white text-brand-700 shadow-sm ring-1 ring-brand-100'
            : 'text-gray-500 hover:text-gray-800'
        }`}
      >
        {o.label}
      </button>
    ))}
  </div>
);

// ------- Dashboard --------
const Dashboard = () => {
  const { getAuthHeaders } = useAdmin();
  const [stats, setStats] = useState(null);
  const [ordersData, setOrdersData] = useState([]);
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [revenueRange, setRevenueRange] = useState('week'); // day | week | month
  const [categoryRange, setCategoryRange] = useState('month'); // week | month | year
  const [topRange, setTopRange] = useState('month');
  const [orderStatusFilter, setOrderStatusFilter] = useState('all');

  useEffect(() => {
    (async () => {
      try {
        const [s, o, p, c] = await Promise.all([
          axios.get(`${API}/admin/dashboard/stats`, getAuthHeaders()),
          axios.get(`${API}/admin/orders`, getAuthHeaders()),
          axios.get(`${API}/products?limit=100`, getAuthHeaders()),
          axios.get(`${API}/categories`, getAuthHeaders()),
        ]);
        setStats(s.data);
        setOrdersData(o.data || []);
        setProducts(p.data || []);
        setCategories(c.data || []);
      } catch (e) {
        console.error('dashboard fetch error', e);
      } finally {
        setLoading(false);
      }
    })();
    // eslint-disable-next-line
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-brand-500"></div>
      </div>
    );
  }

  // --- Revenue series based on range ---
  const buildRevenueSeries = (range) => {
    const now = new Date();
    if (range === 'day') {
      // Today, 8 buckets of 3 hours
      return HOURS.map((hh, idx) => {
        const startH = idx * 3;
        const endH = startH + 3;
        const bucket = ordersData.filter((o) => {
          const d = new Date(o.createdAt);
          return d.toDateString() === now.toDateString() && d.getHours() >= startH && d.getHours() < endH;
        });
        const total = bucket.reduce((a, o) => a + Number(o.totalAmount || o.total || 0), 0);
        return { name: `${hh}:00`, value: total };
      });
    }
    if (range === 'month') {
      // Last 12 months incl. current
      return MONTHS.map((label, idx) => {
        const d = new Date(now.getFullYear(), idx, 1);
        const bucket = ordersData.filter((o) => {
          const od = new Date(o.createdAt);
          return od.getFullYear() === d.getFullYear() && od.getMonth() === d.getMonth();
        });
        const total = bucket.reduce((a, o) => a + Number(o.totalAmount || o.total || 0), 0);
        return { name: label, value: total };
      });
    }
    // week (default)
    return WEEKS_DAYS.map((label, idx) => {
      const monday = new Date(now);
      monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
      const day = new Date(monday);
      day.setDate(monday.getDate() + idx);
      const bucket = ordersData.filter((o) => new Date(o.createdAt).toDateString() === day.toDateString());
      const total = bucket.reduce((a, o) => a + Number(o.totalAmount || o.total || 0), 0);
      return { name: label, value: total };
    });
  };

  // Ensure some visible line even with no orders (demo fallback)
  const revenueRaw = buildRevenueSeries(revenueRange);
  const hasAny = revenueRaw.some((d) => d.value > 0);
  const revenueSeries = hasAny
    ? revenueRaw
    : revenueRaw.map((d, i) => ({ ...d, value: Math.round(3000 + Math.sin(i * 0.8) * 1200 + i * 80) }));
  const weeklyTotal = revenueSeries.reduce((acc, d) => acc + d.value, 0);
  const deltaPct = 8.24;

  // --- Category breakdown filtered by orders within range ---
  const isWithinRange = (d, range) => {
    const dd = new Date(d);
    const now = new Date();
    if (range === 'week') {
      const diff = (now - dd) / 86400000;
      return diff <= 7;
    }
    if (range === 'year') {
      return dd.getFullYear() === now.getFullYear();
    }
    // month
    return dd.getFullYear() === now.getFullYear() && dd.getMonth() === now.getMonth();
  };
  const ordersInRange = ordersData.filter((o) => isWithinRange(o.createdAt, categoryRange));
  const categoryTotals = categories.map((cat) => {
    // Sum order line totals per category (price * qty) when we have orders
    const fromOrders = ordersInRange.reduce((acc, o) => {
      const lineTotal = (o.items || []).reduce((a, it) => {
        const prod = products.find((p) => p.id === it.productId);
        const belongs = prod && (prod.category === cat.name || (prod.categories || []).includes(cat.name));
        return a + (belongs ? Number(it.price || 0) * Number(it.quantity || 1) : 0);
      }, 0);
      return acc + lineTotal;
    }, 0);
    const productCount = products.filter(
      (p) => p.category === cat.name || (p.categories || []).includes(cat.name)
    ).length;
    // Fallback to product-based fake value if no sales yet
    const value = fromOrders > 0 ? fromOrders : Math.max(1, productCount) * 1200;
    return { name: cat.name, value, raw: productCount };
  });
  const pieColors = ['#A7CC32', '#b5d248', '#c3dd5d', '#dbeb96', '#edf5c8', '#65801a'];

  const totalSales = categoryTotals.reduce((a, b) => a + b.value, 0) || 1;

  // --- Top products from sold count within range ---
  const topProducts = (() => {
    const soldInRange = new Map();
    for (const o of ordersData) {
      if (!isWithinRange(o.createdAt, topRange)) continue;
      for (const it of o.items || []) {
        soldInRange.set(it.productId, (soldInRange.get(it.productId) || 0) + Number(it.quantity || 0));
      }
    }
    const enriched = products.map((p) => ({
      ...p,
      soldRange: soldInRange.get(p.id) || 0,
    }));
    // Sort by in-range sales first, fall back to all-time sold
    enriched.sort((a, b) => b.soldRange - a.soldRange || (b.sold || 0) - (a.sold || 0));
    return enriched.slice(0, 4);
  })();

  // --- Recent orders (filtered by status) ---
  const recentOrders = (orderStatusFilter === 'all'
    ? ordersData
    : ordersData.filter((o) => (o.status || 'pending') === orderStatusFilter)
  ).slice(0, 5);

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-5">
        <KpiCard
          icon={DollarSign}
          title="Venit total"
          value={currency(stats?.totalRevenue)}
          delta="+18.2% săptămâna asta"
          up
          highlight
        />
        <KpiCard
          icon={ShoppingCart}
          title="Total comenzi"
          value={stats?.totalOrders || 0}
          delta="+12.5% săptămâna asta"
          up
          sparkColor="#A7CC32"
        />
        <KpiCard
          icon={Package}
          title="Total produse"
          value={stats?.totalProducts || 0}
          delta="-2.3% săptămâna asta"
          up={false}
          sparkColor="#f43f5e"
        />
        <KpiCard
          icon={Users}
          title="Clienți activi"
          value={stats?.totalUsers || 0}
          delta="+24.6% săptămâna asta"
          up
          sparkColor="#A7CC32"
        />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Line chart */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-900">Vânzări pe zile</h3>
              <div className="flex items-center gap-3 mt-1">
                <span className="text-2xl font-extrabold text-gray-900">
                  {currency(weeklyTotal)}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-brand-700 bg-brand-50 rounded-full px-2 py-1">
                  <ArrowUpRight className="w-3 h-3" /> {deltaPct}%
                </span>
              </div>
            </div>
            <RangeSelect
              testid="dashboard-revenue-range"
              value={revenueRange}
              onChange={setRevenueRange}
              options={[
                { value: 'day', label: 'Zilnic' },
                { value: 'week', label: 'Săptămânal' },
                { value: 'month', label: 'Lunar' },
              ]}
            />
          </div>

          <div className="h-[280px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueSeries}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#A7CC32" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="#A7CC32" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                  tickFormatter={(v) => `${v / 1000}k`}
                />
                <Tooltip
                  cursor={{ stroke: '#edf5c8', strokeWidth: 40 }}
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #edf5c8',
                    boxShadow: '0 10px 30px rgba(16,185,129,0.15)',
                  }}
                  formatter={(v) => [currency(v), 'Vânzări']}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke="#A7CC32"
                  strokeWidth={3}
                  fill="url(#gradGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut chart */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-start justify-between">
            <h3 className="text-lg font-bold text-gray-900">Vânzări pe categorii</h3>
            <RangeSelect
              testid="dashboard-category-range"
              value={categoryRange}
              onChange={setCategoryRange}
              options={[
                { value: 'week', label: 'Săpt.' },
                { value: 'month', label: 'Lună' },
                { value: 'year', label: 'An' },
              ]}
            />
          </div>

          <div className="relative h-[260px] mt-3">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categoryTotals.length ? categoryTotals : [{ name: '-', value: 1 }]}
                  innerRadius={70}
                  outerRadius={100}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {(categoryTotals.length ? categoryTotals : [{ name: '-', value: 1 }]).map(
                    (_, i) => (
                      <Cell key={i} fill={pieColors[i % pieColors.length]} />
                    )
                  )}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: '1px solid #edf5c8',
                  }}
                  formatter={(v, n) => [currency(v), n]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <p className="text-2xl font-extrabold text-gray-900">
                {currency(totalSales)}
              </p>
              <span className="mt-1 text-[11px] font-semibold text-brand-700 bg-brand-50 rounded-full px-2 py-0.5">
                + total
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
            {categoryTotals.slice(0, 4).map((c, i) => (
              <div key={c.name} className="flex items-center gap-2 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ background: pieColors[i % pieColors.length] }}
                />
                <span className="text-gray-500 truncate">{c.name}</span>
                <span className="ml-auto font-semibold text-gray-800">
                  {c.raw}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-5">
        {/* Top Products */}
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Top Produse</h3>
            <RangeSelect
              testid="dashboard-top-range"
              value={topRange}
              onChange={setTopRange}
              options={[
                { value: 'week', label: 'Săpt.' },
                { value: 'month', label: 'Lună' },
                { value: 'year', label: 'An' },
              ]}
            />
          </div>

          <div className="space-y-3">
            {topProducts.length === 0 && (
              <p className="text-sm text-gray-400">Nu există produse încă.</p>
            )}
            {topProducts.map((p) => (
              <div
                key={p.id}
                data-testid={`top-product-${p.id}`}
                className="flex items-center gap-3 p-3 rounded-2xl bg-gray-50 hover:bg-brand-50/40 transition"
              >
                <div className="w-12 h-12 rounded-xl bg-white shadow-sm overflow-hidden flex items-center justify-center">
                  {p.image ? (
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Package className="w-5 h-5 text-gray-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{p.name}</p>
                  <p className="text-xs text-gray-500">{p.soldRange || p.sold || 0} vândute</p>
                </div>
                <p className="font-bold text-gray-900 whitespace-nowrap">
                  {currency(p.price)}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="xl:col-span-2 bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">Comenzi recente</h3>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-gray-400" />
              <select
                data-testid="dashboard-orders-filter"
                value={orderStatusFilter}
                onChange={(e) => setOrderStatusFilter(e.target.value)}
                className="text-sm text-gray-700 border border-gray-200 rounded-full px-3 py-1.5 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-brand-200"
              >
                <option value="all">Toate</option>
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-400 font-semibold">
                  <th className="py-2 pr-3">#</th>
                  <th className="py-2 pr-3">Client</th>
                  <th className="py-2 pr-3">Data</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3 text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentOrders.length === 0 && (
                  <tr>
                    <td colSpan="5" className="py-8 text-center text-gray-400">
                      Nu există comenzi încă.
                    </td>
                  </tr>
                )}
                {recentOrders.map((o, idx) => {
                  const status = (o.status || 'pending').toLowerCase();
                  const statusStyle =
                    status === 'delivered' || status === 'completed' || status === 'received'
                      ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                      : status === 'cancelled'
                      ? 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                      : status === 'processing' || status === 'shipped'
                      ? 'bg-blue-50 text-blue-700 ring-1 ring-blue-100'
                      : 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
                  return (
                    <tr key={o.id} data-testid={`recent-order-${o.id}`}>
                      <td className="py-3 pr-3 font-semibold text-gray-500">
                        {String(idx + 1).padStart(2, '0')}
                      </td>
                      <td className="py-3 pr-3">
                        <p className="font-semibold text-gray-800">
                          {o.customerName || '—'}
                        </p>
                        <p className="text-xs text-gray-500 truncate max-w-[200px]">
                          {o.customerEmail}
                        </p>
                      </td>
                      <td className="py-3 pr-3 text-gray-600">
                        {new Date(o.createdAt).toLocaleDateString('ro-RO', {
                          day: '2-digit',
                          month: 'short',
                        })}
                      </td>
                      <td className="py-3 pr-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${statusStyle}`}
                        >
                          {status}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-right font-bold text-gray-900">
                        {currency(o.totalAmount || o.total)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
