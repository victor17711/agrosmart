import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Mail, Trash2, CheckCircle, Clock, User, MessageSquare } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const RequestsManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [contactRequests, setContactRequests] = useState([]);
  const [newsletterSubscriptions, setNewsletterSubscriptions] = useState([]);
  const [installmentRequests, setInstallmentRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('contact');

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const [contactRes, newsletterRes, installmentRes] = await Promise.all([
        axios.get(`${API}/admin/contact-requests`, getAuthHeaders()),
        axios.get(`${API}/admin/newsletter-subscriptions`, getAuthHeaders()),
        axios.get(`${API}/admin/installment-requests`, getAuthHeaders())
      ]);
      setContactRequests(contactRes.data);
      setNewsletterSubscriptions(newsletterRes.data);
      setInstallmentRequests(installmentRes.data);
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca solicitările', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteContactRequest = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această solicitare?')) return;

    try {
      await axios.delete(`${API}/admin/contact-requests/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Solicitare ștearsă!' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge solicitarea', variant: 'destructive' });
    }
  };

  const handleDeleteNewsletter = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest abonament?')) return;

    try {
      await axios.delete(`${API}/admin/newsletter-subscriptions/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Abonament șters!' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge abonamentul', variant: 'destructive' });
    }
  };

  const handleDeleteInstallment = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această cerere?')) return;

    try {
      await axios.delete(`${API}/admin/installment-requests/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Cerere ștearsă!' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge cererea', variant: 'destructive' });
    }
  };

  const handleMarkInstallmentAsContacted = async (id) => {
    try {
      await axios.put(`${API}/admin/installment-requests/${id}/status?status=contacted`, {}, getAuthHeaders());
      toast({ title: 'Succes', description: 'Marcat ca contactat!' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut actualiza statusul', variant: 'destructive' });
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await axios.put(`${API}/admin/contact-requests/${id}/status?status=read`, {}, getAuthHeaders());
      toast({ title: 'Succes', description: 'Marcat ca citit!' });
      fetchRequests();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut actualiza statusul', variant: 'destructive' });
    }
  };

  const handleUpdateInstallmentStatus = async (id, newStatus) => {
  try {
    await axios.put(
      `${API}/admin/installment-requests/${id}/status?status=${newStatus}`,
      {},
      getAuthHeaders()
    );
    toast({ title: 'Succes', description: 'Status actualizat!' });
    fetchRequests();
  } catch (error) {
    toast({ title: 'Eroare', description: 'Nu s-a putut actualiza statusul', variant: 'destructive' });
  }
};

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
        <h2 className="text-2xl font-extrabold tracking-tight">Solicitări</h2>
        <p className="text-gray-500 text-sm mt-1">Gestionează solicitările de contact și abonările la newsletter</p>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-2xl p-2 flex gap-2">
        <button
          onClick={() => setActiveTab('contact')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
            activeTab === 'contact'
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>Contact ({contactRequests.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('newsletter')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
            activeTab === 'newsletter'
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <Mail className="w-5 h-5" />
            <span>Newsletter ({newsletterSubscriptions.length})</span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('installment')}
          className={`flex-1 px-6 py-3 rounded-xl font-semibold transition ${
            activeTab === 'installment'
              ? 'bg-brand-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            <span>Plată în Rate ({installmentRequests.length})</span>
          </div>
        </button>
      </div>

      {/* Contact Requests */}
      {activeTab === 'contact' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {contactRequests.length === 0 ? (
            <div className="text-center py-20">
              <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Nicio solicitare de contact</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-100">
              {contactRequests.map((request) => (
                <div key={request.id} className="p-6 hover:bg-gray-50 transition">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                          request.status === 'new' 
                            ? 'bg-orange-100 text-orange-700' 
                            : request.status === 'read'
                            ? 'bg-blue-100 text-blue-700'
                            : 'bg-green-100 text-green-700'
                        }`}>
                          {request.status === 'new' ? 'NOU' : request.status === 'read' ? 'CITIT' : 'RĂSPUNS'}
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(request.createdAt).toLocaleDateString('ro-RO', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </span>
                      </div>

                      <h3 className="text-lg font-bold text-gray-900 mb-2">{request.subject}</h3>
                      
                      <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                        <div>
                          <span className="text-gray-600">Nume:</span>{' '}
                          <span className="font-semibold text-gray-900">{request.name}</span>
                        </div>
                        <div>
                          <span className="text-gray-600">Email:</span>{' '}
                          <span className="font-semibold text-gray-900">{request.email}</span>
                        </div>
                        {request.phone && (
                          <div>
                            <span className="text-gray-600">Telefon:</span>{' '}
                            <span className="font-semibold text-gray-900">{request.phone}</span>
                          </div>
                        )}
                      </div>

                      <div className="bg-gray-100 rounded-xl p-4">
                        <p className="text-gray-700">{request.message}</p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-2">
                      {request.status === 'new' && (
                        <button
                          onClick={() => handleMarkAsRead(request.id)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          title="Marchează ca citit"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteContactRequest(request.id)}
                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        title="Șterge"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Newsletter Subscriptions */}
      {activeTab === 'newsletter' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {newsletterSubscriptions.length === 0 ? (
            <div className="text-center py-20">
              <Mail className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 font-semibold">Nicio abonare la newsletter</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60 text-gray-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-6 py-4 text-left font-semibold">Email</th>
                    <th className="px-6 py-4 text-left font-semibold">Data Abonării</th>
                    <th className="px-6 py-4 text-left font-semibold">Status</th>
                    <th className="px-6 py-4 text-left font-semibold">Acțiuni</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {newsletterSubscriptions.map((sub, index) => (
                    <tr key={sub.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-brand-50 transition`}>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="font-medium text-gray-900">{sub.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {new Date(sub.createdAt).toLocaleDateString('ro-RO', { 
                          day: 'numeric', 
                          month: 'long', 
                          year: 'numeric' 
                        })}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          sub.status === 'active' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-gray-100 text-gray-700'
                        }`}>
                          {sub.status === 'active' ? 'ACTIV' : 'DEZABONAT'}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <button
                          onClick={() => handleDeleteNewsletter(sub.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          title="Șterge"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

            {/* Installment Requests */}
      {activeTab === 'installment' && (
        <div className="bg-white rounded-2xl overflow-hidden">
          {installmentRequests.length === 0 ? (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
              <p className="text-gray-600 font-semibold">Nicio cerere de plată în rate</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60 text-gray-500 text-[11px] uppercase tracking-wider">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Produs</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Telefon</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Preț</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Rată lunară</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Data</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Status</th>
                    <th className="px-4 py-3 text-left text-sm font-semibold">Acțiuni</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {[...installmentRequests]
                    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
                    .map((request, index) => (
                      <tr
                        key={request.id}
                        className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-brand-50 transition`}
                      >
                        <td className="px-4 py-4">
                          <div className="max-w-[220px]">
                            <p className="font-semibold text-gray-900 text-sm leading-5">
                              {request.productName}
                            </p>
                          </div>
                        </td>

                        <td className="px-4 py-4">
                          <p className="font-medium text-gray-900 text-sm">{request.name}</p>
                        </td>

                        <td className="px-4 py-4">
                          <a
                            href={`tel:${request.phone}`}
                            className="text-sm font-medium text-brand-600 hover:text-brand-700"
                          >
                            {request.phone}
                          </a>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-gray-900 text-sm">
                            {request.productPrice} MDL
                          </span>
                        </td>

                        <td className="px-4 py-4">
                          <span className="font-semibold text-orange-600 text-sm">
                            {(Number(request.productPrice || 0) / 3).toFixed(2)} MDL
                          </span>
                        </td>

                        <td className="px-4 py-4 text-sm text-gray-600 whitespace-nowrap">
                          {new Date(request.createdAt).toLocaleDateString('ro-RO', {
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric'
                          })}
                        </td>

                        <td className="px-4 py-4">
                          <select
                            value={request.status === 'contacted' ? 'contacted' : 'new'}
                            onChange={(e) => handleUpdateInstallmentStatus(request.id, e.target.value)}
                            className={`px-3 py-2 rounded-lg text-sm font-medium border outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 ${
                              request.status === 'contacted'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                            }`}
                          >
                            <option value="new">În așteptare</option>
                            <option value="contacted">Contactat</option>
                          </select>
                        </td>

                        <td className="px-4 py-4">
                          <div className="flex items-center gap-2">
                            <a
                              href={`tel:${request.phone}`}
                              className="px-3 py-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition text-sm font-medium whitespace-nowrap"
                            >
                              Sună
                            </a>

                            <button
                              onClick={() => handleDeleteInstallment(request.id)}
                              className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                              title="Șterge"
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
    </div>
  );
};

export default RequestsManagement;
