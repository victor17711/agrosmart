import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import {
  Trash2,
  CheckCircle,
  MessageSquare,
  Eye,
  Phone,
  CreditCard,
  X,
  User,
  Mail,
  Clock
} from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RequestsManagement = () => {
  const { getAuthHeaders } = useAdmin();

  const [contactRequests, setContactRequests] = useState([]);
  // const [newsletterSubscriptions, setNewsletterSubscriptions] = useState([]);
  const [installmentRequests, setInstallmentRequests] = useState([]);

  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contact');
  const [selectedContact, setSelectedContact] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [contactRes, installmentRes] = await Promise.all([
        axios.get(`${API}/admin/contact-requests`, getAuthHeaders()),
        axios.get(`${API}/admin/installment-requests`, getAuthHeaders())

        // Newsletter momentan este dezactivat/comentat
        // axios.get(`${API}/admin/newsletter-subscriptions`, getAuthHeaders()),
      ]);

      setContactRequests(contactRes.data);
      setInstallmentRequests(installmentRes.data);

      // setNewsletterSubscriptions(newsletterRes.data);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca solicitările',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContactRequest = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această solicitare?')) return;

    try {
      await axios.delete(`${API}/admin/contact-requests/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Solicitare ștearsă!'
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge solicitarea',
        variant: 'destructive'
      });
    }
  };

  /*
  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest abonament?')) return;

    try {
      await axios.delete(`${API}/admin/newsletter-subscriptions/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Abonament șters!' });
      fetchRequests();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge abonamentul',
        variant: 'destructive'
      });
    }
  };
  */

  const handleDeleteInstallment = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această cerere?')) return;

    try {
      await axios.delete(`${API}/admin/installment-requests/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Cerere ștearsă!'
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge cererea',
        variant: 'destructive'
      });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(
        `${API}/admin/contact-requests/${id}/status?status=read`,
        {},
        getAuthHeaders()
      );

      toast({
        title: 'Succes',
        description: 'Marcat ca citit!'
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateInstallmentStatus = async (id, newStatus) => {
    try {
      await axios.put(
        `${API}/admin/installment-requests/${id}/status?status=${newStatus}`,
        {},
        getAuthHeaders()
      );

      toast({
        title: 'Succes',
        description: 'Status actualizat!'
      });

      fetchRequests();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut actualiza statusul',
        variant: 'destructive'
      });
    }
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  const formatDateTime = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getContactStatusBadge = (status) => {
    if (status === 'new') {
      return 'bg-orange-50 text-orange-700 ring-1 ring-orange-100';
    }

    if (status === 'read') {
      return 'bg-blue-50 text-blue-700 ring-1 ring-blue-100';
    }

    return 'bg-green-50 text-green-700 ring-1 ring-green-100';
  };

  const getContactStatusLabel = (status) => {
    if (status === 'new') return 'NOU';
    if (status === 'read') return 'CITIT';
    return 'RĂSPUNS';
  };

  const sortedContactRequests = [...contactRequests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  const sortedInstallmentRequests = [...installmentRequests].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-gray-900">
        <h2 className="text-2xl font-extrabold tracking-tight">
          Gestionare Solicitări
        </h2>

        <p className="text-gray-500 text-sm mt-1">
          Gestionează solicitările de contact și cererile pentru achitare în rate
        </p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-2 flex flex-col sm:flex-row gap-2">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition ${
            activeTab === 'contact'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>Contacte ({contactRequests.length})</span>
          </div>
        </button>

        {/* Newsletter momentan comentat */}
        {/*
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition ${
            activeTab === 'newsletter'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            <span>Newsletter ({newsletterSubscriptions.length})</span>
          </div>
        </button>
        */}

        <button
          onClick={() => setActiveTab('installment')}
          className={`flex-1 px-6 py-3 rounded-2xl font-semibold transition ${
            activeTab === 'installment'
              ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
              : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <CreditCard className="w-5 h-5" />
            <span>Achitare în rate ({installmentRequests.length})</span>
          </div>
        </button>
      </div>

      {/* Contact Requests */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {contactRequests.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">
                Nicio solicitare de contact
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60">
                  <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-6 py-4 font-semibold">Subiect</th>
                    <th className="px-6 py-4 font-semibold">Contact</th>
                    <th className="px-6 py-4 font-semibold">Data</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right pr-8">
                      Acțiuni
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sortedContactRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="bg-white hover:bg-brand-50/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
                            <User className="w-5 h-5" />
                          </div>

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate max-w-[220px]">
                              {request.name || '—'}
                            </div>

                            <div className="text-xs text-gray-500 truncate max-w-[220px]">
                              {request.email || '—'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-semibold text-gray-900 truncate max-w-[260px]">
                          {request.subject || 'Fără subiect'}
                        </div>

                        <div className="text-xs text-gray-500 truncate max-w-[260px]">
                          {request.message || '—'}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1 text-sm">
                          <div className="flex items-center gap-2 text-gray-700">
                            <Mail className="w-4 h-4 text-gray-400" />
                            <span className="truncate max-w-[210px]">
                              {request.email || '—'}
                            </span>
                          </div>

                          {request.phone && (
                            <div className="flex items-center gap-2 text-gray-700">
                              <Phone className="w-4 h-4 text-gray-400" />
                              <a
                                href={`tel:${request.phone}`}
                                className="font-medium text-brand-600 hover:text-brand-700"
                              >
                                {request.phone}
                              </a>
                            </div>
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-gray-400" />
                          {formatDate(request.createdAt)}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getContactStatusBadge(
                            request.status
                          )}`}
                        >
                          {getContactStatusLabel(request.status)}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end pr-2">
                          <button
                            onClick={() => setSelectedContact(request)}
                            title="Vezi detalii"
                            className="p-2.5 rounded-full bg-gray-50 text-gray-700 hover:bg-gray-100 transition"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {request.status === 'new' && (
                            <button
                              onClick={() => handleMarkAsRead(request.id)}
                              title="Marchează ca citit"
                              className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteContactRequest(request.id)}
                            title="Șterge"
                            className="p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Newsletter Subscriptions - momentan comentat */}
      {/*
      {activeTab === 'newsletter' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          ...
        </div>
      )}
      */}

      {/* Installment Requests */}
      {activeTab === 'installment' && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          {installmentRequests.length === 0 ? (
            <div className="text-center py-20">
              <CreditCard className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">
                Nicio cerere de achitare în rate
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60">
                  <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Produs</th>
                    <th className="px-6 py-4 font-semibold">Client</th>
                    <th className="px-6 py-4 font-semibold">Telefon</th>
                    <th className="px-6 py-4 font-semibold">Preț</th>
                    <th className="px-6 py-4 font-semibold">Rată lunară</th>
                    <th className="px-6 py-4 font-semibold">Data</th>
                    <th className="px-6 py-4 font-semibold">Status</th>
                    <th className="px-6 py-4 font-semibold text-right pr-8">
                      Acțiuni
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {sortedInstallmentRequests.map((request) => (
                    <tr
                      key={request.id}
                      className="bg-white hover:bg-brand-50/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[280px]">
                            {request.productName || '—'}
                          </div>

                          <div className="text-xs text-gray-500">
                            Cerere rate
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
                            <User className="w-4 h-4" />
                          </div>

                          <div className="font-semibold text-gray-900">
                            {request.name || '—'}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        {request.phone ? (
                          <a
                            href={`tel:${request.phone}`}
                            className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700"
                          >
                            <Phone className="w-4 h-4" />
                            {request.phone}
                          </a>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="font-bold text-gray-900">
                          {Number(request.productPrice || 0).toLocaleString('ro-RO')}{' '}
                          MDL
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-orange-50 text-orange-700 ring-1 ring-orange-100">
                          {(Number(request.productPrice || 0) / 3).toFixed(2)} MDL
                        </span>
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(request.createdAt)}
                      </td>

                      <td className="px-6 py-4">
                        <select
                          value={request.status === 'contacted' ? 'contacted' : 'new'}
                          onChange={(e) =>
                            handleUpdateInstallmentStatus(request.id, e.target.value)
                          }
                          className={`px-3 py-2 rounded-full text-xs font-bold border outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 ${
                            request.status === 'contacted'
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-orange-50 text-orange-700 border-orange-100'
                          }`}
                        >
                          <option value="new">În așteptare</option>
                          <option value="contacted">Contactat</option>
                        </select>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex gap-2 justify-end pr-2">
                          {request.phone && (
                            <a
                              href={`tel:${request.phone}`}
                              title="Sună"
                              className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                            >
                              <Phone className="w-4 h-4" />
                            </a>
                          )}

                          <button
                            onClick={() => handleDeleteInstallment(request.id)}
                            title="Șterge"
                            className="p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Contact Details Popup */}
      {selectedContact && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  Detalii solicitare
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Informații complete despre mesajul primit
                </p>
              </div>

              <button
                onClick={() => setSelectedContact(null)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="flex items-center justify-between gap-3">
                <span
                  className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${getContactStatusBadge(
                    selectedContact.status
                  )}`}
                >
                  {getContactStatusLabel(selectedContact.status)}
                </span>

                <span className="text-sm text-gray-500">
                  {formatDateTime(selectedContact.createdAt)}
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Nume
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedContact.name || '—'}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Email
                  </p>
                  <p className="mt-1 font-semibold text-gray-900 break-all">
                    {selectedContact.email || '—'}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Telefon
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedContact.phone ? (
                      <a
                        href={`tel:${selectedContact.phone}`}
                        className="text-brand-600 hover:text-brand-700"
                      >
                        {selectedContact.phone}
                      </a>
                    ) : (
                      '—'
                    )}
                  </p>
                </div>

                <div className="rounded-2xl bg-gray-50 p-4 border border-gray-100">
                  <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">
                    Subiect
                  </p>
                  <p className="mt-1 font-semibold text-gray-900">
                    {selectedContact.subject || 'Fără subiect'}
                  </p>
                </div>
              </div>

              <div className="rounded-2xl bg-gray-50 p-5 border border-gray-100">
                <p className="text-xs uppercase tracking-wider text-gray-400 font-bold mb-3">
                  Mesaj
                </p>

                <p className="text-gray-700 leading-relaxed whitespace-pre-line">
                  {selectedContact.message || '—'}
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                {selectedContact.status === 'new' && (
                  <button
                    onClick={() => {
                      handleMarkAsRead(selectedContact.id);
                      setSelectedContact({
                        ...selectedContact,
                        status: 'read'
                      });
                    }}
                    className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 inline-flex items-center justify-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Marchează ca citit
                  </button>
                )}

                <button
                  onClick={() => {
                    handleDeleteContactRequest(selectedContact.id);
                    setSelectedContact(null);
                  }}
                  className="flex-1 bg-rose-50 text-rose-600 py-3 rounded-xl hover:bg-rose-100 transition font-semibold inline-flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Șterge solicitarea
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RequestsManagement;