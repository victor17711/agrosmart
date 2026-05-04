import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Package, Users, ShoppingCart, TrendingUp, AlertCircle, DollarSign, Calendar, CheckCircle, Clock } from 'lucide-react';
import { BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Dashboard = () => {
  const { getAuthHeaders } = useAdmin();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('week');
  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    fetchStats();
    fetchOrders();
  }, [dateRange]);

  const fetchStats = async () => {
    try {
      const response = await axios.get(`${API}/admin/dashboard/stats`, getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, getAuthHeaders());
      setOrdersData(response.data || []);
    } catch (error) {
      console.error('Error fetching orders:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-teal-600"></div>
      </div>
    );
  }

  // Calculate last 7 days orders
  const getLast7DaysData = () => {
    const days = ['Dum', 'Lun', 'Mar', 'Mie', 'Joi', 'Vin', 'Sâm'];
    const today = new Date();
    const last7Days = [];

    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dayName = days[date.getDay()];
      
      const ordersCount = ordersData.filter(order => {
        const orderDate = new Date(order.createdAt);
        return orderDate.toDateString() === date.toDateString();
      }).length;

      last7Days.push({
        name: dayName,
        comenzi: ordersCount
      });
    }

    return last7Days;
  };

  // Calculate orders by status for pie chart
  const getOrdersByStatus = () => {
    const statusMap = {
      pending: { name: 'În Așteptare', value: 0, color: '#F59E0B' },
      processing: { name: 'În Procesare', value: 0, color: '#3B82F6' },
      completed: { name: 'Finalizate', value: 0, color: '#10B981' },
      cancelled: { name: 'Anulate', value: 0, color: '#EF4444' }
    };

    ordersData.forEach(order => {
      if (statusMap[order.status]) {
        statusMap[order.status].value++;
      }
    });

    return Object.values(statusMap).filter(s => s.value > 0);
  };

  const last7DaysData = getLast7DaysData();
  const orderStatusData = getOrdersByStatus();

  const statCards = [
    { title: 'TOTAL UTILIZATORI', value: stats?.totalUsers || 0, icon: Users, color: '#F59E0B', bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { title: 'TOTAL PRODUSE', value: stats?.totalProducts || 0, icon: Package, color: '#EF4444', bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { title: 'COMENZI FINALIZATE', value: ordersData.filter(o => o.status === 'completed').length, icon: CheckCircle, color: '#10B981', bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900' },
    { title: 'TOTAL COMENZI', value: stats?.totalOrders || 0, icon: ShoppingCart, color: '#3B82F6', bgColor: 'bg-gradient-to-br from-gray-800 to-gray-900' }
  ];

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 shadow-xl">
          <p className="text-white font-semibold">{`${payload[0].value} comenzi`}</p>
        </div>
      );
    }
    return null;
  };

  const RADIAN = Math.PI / 180;
  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" className="font-bold text-sm">
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold mb-2">Dashboard</h2>
            <p className="text-teal-100">Prezentare generală a magazinului</p>
          </div>
          <div className="flex items-center gap-3 bg-white/20 rounded-xl px-4 py-2">
            <Calendar className="w-5 h-5" />
            <span className="font-semibold">{new Date().toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div 
              key={index} 
              className={`${stat.bgColor} rounded-2xl p-6 text-white relative overflow-hidden`}
            >
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: `${stat.color}20` }}>
                    <Icon className="w-8 h-8" style={{ color: stat.color }} />
                  </div>
                </div>
                <p className="text-gray-400 text-xs font-semibold uppercase tracking-wide mb-2">{stat.title}</p>
                <p className="text-4xl font-bold">{stat.value}</p>
              </div>
              <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl opacity-20" style={{ backgroundColor: stat.color }}></div>
            </div>
          );
        })}
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart - Last 7 Days Orders */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="w-6 h-6 text-yellow-400" />
            <h3 className="text-xl font-bold">Comenzi pe zile (ultimele 7 zile)</h3>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={last7DaysData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="name" stroke="#9CA3AF" />
              <YAxis stroke="#9CA3AF" />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#1F2937' }} />
              <Bar dataKey="comenzi" fill="#F59E0B" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Doughnut Chart - Order Status Distribution */}
        <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl p-6 text-white">
          <div className="flex items-center gap-3 mb-6">
            <ShoppingCart className="w-6 h-6 text-blue-400" />
            <h3 className="text-xl font-bold">Distribuție Comenzi</h3>
          </div>
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={100}
                  innerRadius={60}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#1F2937', border: '1px solid #374151', borderRadius: '8px' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-400">
              <p>Nicio comandă disponibilă</p>
            </div>
          )}
          {orderStatusData.length > 0 && (
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {orderStatusData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }}></div>
                  <span className="text-sm text-gray-300">{entry.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
