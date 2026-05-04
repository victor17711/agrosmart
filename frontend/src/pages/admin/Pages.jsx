import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Pages = () => {
  const { getAuthHeaders } = useAdmin();
  const [pages, setPages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPage, setEditingPage] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    titleRu: '',
    slug: '',
    content: '',
    contentRu: '',
    isPublished: true
  });
  const [isContactPage, setIsContactPage] = useState(false);
  const [contactData, setContactData] = useState({
    address: '',
    phone: '',
    email: '',
    hours: '',
    mapUrl: ''
  });

  useEffect(() => {
    fetchPages();
  }, []);

  const fetchPages = async () => {
    try {
      const response = await axios.get(`${API}/pages`);
      setPages(response.data);
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca paginile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.slug) {
      toast({ title: 'Eroare', description: 'Completează toate câmpurile obligatorii', variant: 'destructive' });
      return;
    }

    try {
      let dataToSend = { ...formData };
      
      // If editing contact page, convert contactData to JSON string
      if (isContactPage) {
        dataToSend.content = JSON.stringify(contactData);
      }

      if (editingPage) {
        await axios.put(`${API}/pages/${editingPage.id}`, dataToSend, getAuthHeaders());
        toast({ title: 'Succes', description: 'Pagina a fost actualizată!' });
      } else {
        await axios.post(`${API}/pages`, dataToSend, getAuthHeaders());
        toast({ title: 'Succes', description: 'Pagina a fost creată!' });
      }
      
      setShowModal(false);
      setEditingPage(null);
      setIsContactPage(false);
      setFormData({ title: '', titleRu: '', slug: '', content: '', contentRu: '', isPublished: true });
      setContactData({ address: '', phone: '', email: '', hours: '', mapUrl: '' });
      fetchPages();
    } catch (error) {
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut salva pagina', 
        variant: 'destructive' 
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această pagină?')) return;
    
    try {
      await axios.delete(`${API}/pages/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Pagina a fost ștearsă!' });
      fetchPages();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge pagina', variant: 'destructive' });
    }
  };

  const handleEdit = (page) => {
    setEditingPage(page);
    setFormData({
      title: page.title,
      titleRu: page.titleRu || '',
      slug: page.slug,
      content: page.content,
      contentRu: page.contentRu || '',
      isPublished: page.isPublished
    });
    
    // Check if this is the contact page
    if (page.slug === 'contact') {
      setIsContactPage(true);
      try {
        const parsed = JSON.parse(page.content);
        setContactData({
          address: parsed.address || '',
          phone: parsed.phone || '',
          email: parsed.email || '',
          hours: parsed.hours || '',
          mapUrl: parsed.mapUrl || ''
        });
      } catch {
        setContactData({ address: '', phone: '', email: '', hours: '', mapUrl: '' });
      }
    } else {
      setIsContactPage(false);
    }
    
    setShowModal(true);
  };

  const generateSlug = (title) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleTitleChange = (e) => {
    const title = e.target.value;
    setFormData({
      ...formData,
      title: title,
      slug: generateSlug(title)
    });
  };

  if (loading) {
    return <div className="text-center py-12">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2">Gestionare Pagini</h2>
            <p className="text-teal-100">Creează și editează paginile site-ului</p>
          </div>
          <button
            onClick={() => {
              setEditingPage(null);
              setFormData({ title: '', titleRu: '', slug: '', content: '', contentRu: '', isPublished: true });
              setShowModal(true);
            }}
            className="bg-white text-teal-600 px-6 py-3 rounded-xl hover:bg-teal-50 transition font-semibold flex items-center gap-2 shadow-lg"
          >
            <Plus className="w-5 h-5" />
            Pagină Nouă
          </button>
        </div>
      </div>

      {/* Pages List */}
      {pages.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-100">
          <FileText className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-gray-900 mb-3">Nicio pagină încă</h3>
          <p className="text-gray-600 mb-6">Creează prima ta pagină pentru site.</p>
          <button
            onClick={() => setShowModal(true)}
            className="bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold inline-flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Creează Pagină
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pages.map((page) => (
            <div
              key={page.id}
              className="bg-white rounded-2xl p-6 border-2 border-gray-100 hover:border-teal-200 transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900">{page.title}</h3>
                    {page.isPublished ? (
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <Eye className="w-3 h-3" />
                        Publicată
                      </span>
                    ) : (
                      <span className="bg-gray-100 text-gray-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1">
                        <EyeOff className="w-3 h-3" />
                        Draft
                      </span>
                    )}
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-mono bg-gray-100 px-2 py-1 rounded">/page/{page.slug}</span>
                  </div>
                  <p className="text-gray-700 line-clamp-2">{page.content}</p>
                  <div className="text-xs text-gray-500 mt-3">
                    Creat: {new Date(page.createdAt).toLocaleDateString('ro-RO')}
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() => handleEdit(page)}
                    className="p-3 bg-teal-500 text-white rounded-xl hover:bg-teal-600 transition"
                  >
                    <Edit className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDelete(page.id)}
                    className="p-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingPage ? 'Editează Pagina' : 'Pagină Nouă'}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Titlu (RO) *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={handleTitleChange}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Despre Noi"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Titlu RU 🇷🇺
                </label>
                <input
                  type="text"
                  value={formData.titleRu}
                  onChange={(e) => setFormData({...formData, titleRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="напр: О нас"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Slug (URL) *
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-gray-500">/page/</span>
                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) => setFormData({...formData, slug: e.target.value})}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 font-mono text-sm"
                    placeholder="despre-noi"
                    required
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">Se generează automat din titlu</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Conținut (RO)
                </label>
                {isContactPage ? (
                  <div className="space-y-4 border-2 border-gray-200 rounded-xl p-6 bg-gray-50">
                    <p className="text-sm text-gray-600 mb-4">📝 Editează datele de contact pentru pagina de contact:</p>
                    
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Adresă</label>
                      <input
                        type="text"
                        value={contactData.address}
                        onChange={(e) => setContactData({...contactData, address: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Str. Principală nr. 123, Chișinău, Moldova"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Telefon</label>
                        <input
                          type="text"
                          value={contactData.phone}
                          onChange={(e) => setContactData({...contactData, phone: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="+373 69 123 456"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                        <input
                          type="email"
                          value={contactData.email}
                          onChange={(e) => setContactData({...contactData, email: e.target.value})}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                          placeholder="contact@agrosmart.md"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Program</label>
                      <input
                        type="text"
                        value={contactData.hours}
                        onChange={(e) => setContactData({...contactData, hours: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        placeholder="Luni - Vineri: 08:00 - 20:00"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">Google Maps Embed URL</label>
                      <textarea
                        value={contactData.mapUrl}
                        onChange={(e) => setContactData({...contactData, mapUrl: e.target.value})}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500"
                        rows="3"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Obține URL-ul de la Google Maps → Share → Embed a map → Copy HTML
                      </p>
                    </div>
                  </div>
                ) : (
                  <>
                    <textarea
                      value={formData.content}
                      onChange={(e) => setFormData({...formData, content: e.target.value})}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[300px]"
                      placeholder="Scrie conținutul paginii aici (RO)..."
                    />
                  </>
                )}
              </div>

              {!isContactPage && (
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Conținut RU 🇷🇺
                  </label>
                  <textarea
                    value={formData.contentRu}
                    onChange={(e) => setFormData({...formData, contentRu: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 min-h-[300px]"
                    placeholder="Напишите содержание страницы здесь..."
                  />
                </div>
              )}

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) => setFormData({...formData, isPublished: e.target.checked})}
                  className="w-5 h-5 text-teal-600 rounded focus:ring-2 focus:ring-teal-500"
                />
                <label htmlFor="isPublished" className="text-sm font-semibold text-gray-900 cursor-pointer">
                  Publică pagina (vizibilă pe site)
                </label>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold"
                >
                  {editingPage ? 'Actualizează' : 'Creează'} Pagina
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pages;
