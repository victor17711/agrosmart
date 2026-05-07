import React, { useState, useEffect, useMemo } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Search, Eye, ChevronLeft, ChevronRight } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ORDERS_PER_PAGE = 10;

const OrdersManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    fetchOrders();
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  const fetchOrders = async () => {
    try {
      const response = await axios.get(`${API}/admin/orders`, getAuthHeaders());

      const sortedOrders = [...response.data].sort((a, b) => {
        return new Date(b.createdAt) - new Date(a.createdAt);
      });

      setOrders(sortedOrders);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/orders/${orderId}/status?status=${newStatus}`,
        {},
        getAuthHeaders()
      );
      toast({ title: 'Success', description: 'Order status updated!' });
      fetchOrders();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update order status', variant: 'destructive' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-50 text-amber-700 ring-1 ring-amber-100';
      case 'processing':
        return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
      case 'shipped':
        return 'bg-violet-50 text-violet-700 ring-1 ring-violet-100';
      case 'delivered':
        return 'bg-brand-50 text-brand-700 ring-1 ring-brand-100';
      case 'cancelled':
        return 'bg-rose-50 text-rose-700 ring-1 ring-rose-100';
      default:
        return 'bg-gray-50 text-gray-700 ring-1 ring-gray-100';
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((order) =>
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (order.customerEmail && order.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }, [orders, searchTerm]);

  const totalPages = Math.ceil(filteredOrders.length / ORDERS_PER_PAGE);

  const paginatedOrders = useMemo(() => {
    const startIndex = (currentPage - 1) * ORDERS_PER_PAGE;
    const endIndex = startIndex + ORDERS_PER_PAGE;
    return filteredOrders.slice(startIndex, endIndex);
  }, [filteredOrders, currentPage]);

  const startItem = filteredOrders.length === 0 ? 0 : (currentPage - 1) * ORDERS_PER_PAGE + 1;
  const endItem = Math.min(currentPage * ORDERS_PER_PAGE, filteredOrders.length);

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Gestionare comenzi</h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: <span className="font-semibold text-gray-800">{orders.length}</span> comenzi
            </p>
          </div>
          <div className="relative w-full md:w-[360px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută comenzi după client, email, ID…"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              data-testid="orders-search-input"
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Table card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60">
              <tr className="text-left text-[11px] uppercase tracking-wider text-gray-500">
                <th className="px-5 py-4 font-semibold">Comandă</th>
                <th className="px-5 py-4 font-semibold">Client</th>
                <th className="px-5 py-4 font-semibold">Produse</th>
                <th className="px-5 py-4 font-semibold">Status</th>
                <th className="px-5 py-4 font-semibold">Data</th>
                <th className="px-5 py-4 font-semibold text-right pr-6">Total</th>
                <th className="px-5 py-4 font-semibold text-right pr-6">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginatedOrders.length > 0 ? (
                paginatedOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-brand-50/40 transition">
                    <td className="px-5 py-4">
                      <div className="font-mono text-sm font-semibold text-gray-900">#{order.id.slice(0, 8).toUpperCase()}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="font-semibold text-gray-800 truncate max-w-[200px]">{order.customerName || '—'}</div>
                      <div className="text-xs text-gray-500 truncate max-w-[200px]">{order.customerEmail}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-gray-700">
                      {order.items.length} produs{order.items.length !== 1 ? 'e' : ''}
                    </td>
                    <td className="px-5 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateOrderStatus(order.id, e.target.value)}
                        data-testid={`order-status-${order.id}`}
                        className={`text-xs font-semibold rounded-full px-3 py-1.5 cursor-pointer border-0 focus:outline-none focus:ring-2 focus:ring-brand-200 ${getStatusColor(order.status)}`}
                      >
                        <option value="pending">În așteptare</option>
                        <option value="processing">În procesare</option>
                        <option value="shipped">Expediat</option>
                        <option value="delivered">Livrat</option>
                        <option value="cancelled">Anulat</option>
                      </select>
                    </td>
                    <td className="px-5 py-4 text-gray-600 text-sm">
                      {new Date(order.createdAt).toLocaleDateString('ro-RO', { day: '2-digit', month: 'short', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-4 text-right font-bold text-gray-900 pr-6">{Number(order.totalAmount).toLocaleString('ro-RO')} MDL</td>
                    <td className="px-5 py-4 text-right pr-6">
                      <button
                        onClick={() => setSelectedOrder(order)}
                        data-testid={`view-order-${order.id}`}
                        title="Vezi detalii"
                        className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition inline-flex"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="7" className="px-4 py-14 text-center text-gray-400">
                    Nu există comenzi care să se potrivească.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="bg-gray-50/60 border-t border-gray-100 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="text-sm text-gray-600">
            Afișare <span className="font-semibold text-gray-800">{startItem}–{endItem}</span> din <span className="font-semibold text-gray-800">{filteredOrders.length}</span>
          </div>

          {totalPages > 1 && (
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, index) => index + 1).map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold ${
                      currentPage === page
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                        : 'border border-gray-200 text-gray-700 hover:bg-white'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 py-2 rounded-full border border-gray-200 text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white"
              >
                Următor
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 px-6 py-5 flex justify-between items-center">
              <div>
                <h3 className="text-xl font-extrabold text-gray-900 tracking-tight">
                  Detalii comandă <span className="font-mono text-brand-700">#{selectedOrder.id.slice(0, 8).toUpperCase()}</span>
                </h3>
                <p className="text-sm text-gray-500">{new Date(selectedOrder.createdAt).toLocaleString('ro-RO')}</p>
              </div>
              <button
                onClick={() => setSelectedOrder(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Informații Comandă</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">ID Comandă:</span>
                    <p className="font-mono">{selectedOrder.id}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <p className={`px-2 py-1 rounded inline-block mt-1 ${getStatusColor(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Client:</span>
                    <p className="font-semibold">{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p>{selectedOrder.customerEmail}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Telefon:</span>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Total:</span>
                    <p className="font-semibold text-lg text-brand-600">{selectedOrder.totalAmount} MDL</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Data:</span>
                    <p>{new Date(selectedOrder.createdAt).toLocaleString('ro-RO')}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Metodă Plată:</span>
                    <p>
                      {selectedOrder.paymentMethod === 'cash_on_delivery'
                        ? 'Cash la curier'
                        : selectedOrder.paymentMethod}
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Adresă Livrare</h4>
                <div className="bg-gray-50 p-4 rounded-lg text-sm">
                  <p className="font-medium">{selectedOrder.shippingAddress.fullName}</p>
                  <p className="text-gray-600">{selectedOrder.shippingAddress.address}</p>
                  <p className="text-gray-600">
                    {selectedOrder.shippingAddress.city}
                    {selectedOrder.shippingAddress.postalCode &&
                      `, ${selectedOrder.shippingAddress.postalCode}`}
                  </p>
                  <p className="text-gray-600">Telefon: {selectedOrder.shippingAddress.phone}</p>
                  <p className="text-gray-600">Email: {selectedOrder.shippingAddress.email}</p>
                  {selectedOrder.shippingAddress.notes && (
                    <p className="text-gray-600 mt-2 italic">
                      Notă: {selectedOrder.shippingAddress.notes}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h4 className="font-semibold text-gray-900 mb-2">Produse Comandate</h4>
                <div className="space-y-3">
                  {selectedOrder.items.map((item, index) => (
                    <div key={index} className="flex gap-4 p-3 bg-gray-50 rounded-lg">
                      {item.image && (
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-16 h-16 object-cover rounded"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium">{item.name}</p>
                        <p className="text-sm text-gray-600">
                          Cantitate: {item.quantity}
                          {item.selectedSize && ` | Mărime: ${item.selectedSize}`}
                          {item.selectedColor && ` | Culoare: ${item.selectedColor}`}
                        </p>
                        <p className="text-sm font-semibold text-brand-600 mt-1">
                          {item.price} MDL × {item.quantity} = {item.price * item.quantity} MDL
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 pt-4 border-t">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total Comandă:</span>
                    <span className="text-brand-600">{selectedOrder.totalAmount} MDL</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="w-full bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold"
              >
                Închide
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrdersManagement;