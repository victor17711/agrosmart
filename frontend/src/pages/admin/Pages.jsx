import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  X,
  Save,
  Link as LinkIcon,
  CalendarDays,
  MapPin,
  Phone,
  Mail,
  Clock
} from 'lucide-react';
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
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca paginile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingPage(null);
    setIsContactPage(false);
    setFormData({
      title: '',
      titleRu: '',
      slug: '',
      content: '',
      contentRu: '',
      isPublished: true
    });
    setContactData({
      address: '',
      phone: '',
      email: '',
      hours: '',
      mapUrl: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.slug) {
      toast({
        title: 'Eroare',
        description: 'Completează toate câmpurile obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      let dataToSend = { ...formData };

      if (isContactPage) {
        dataToSend.content = JSON.stringify(contactData);
      }

      if (editingPage) {
        await axios.put(
          `${API}/pages/${editingPage.id}`,
          dataToSend,
          getAuthHeaders()
        );

        toast({
          title: 'Succes',
          description: 'Pagina a fost actualizată!'
        });
      } else {
        await axios.post(`${API}/pages`, dataToSend, getAuthHeaders());

        toast({
          title: 'Succes',
          description: 'Pagina a fost creată!'
        });
      }

      setShowModal(false);
      resetForm();
      fetchPages();
    } catch (error) {
      toast({
        title: 'Eroare',
        description:
          error.response?.data?.detail || 'Nu s-a putut salva pagina',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această pagină?')) return;

    try {
      await axios.delete(`${API}/pages/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Pagina a fost ștearsă!'
      });

      fetchPages();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge pagina',
        variant: 'destructive'
      });
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
        setContactData({
          address: '',
          phone: '',
          email: '',
          hours: '',
          mapUrl: ''
        });
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
      title,
      slug: generateSlug(title)
    });
  };

  const formatDate = (date) => {
    if (!date) return '—';

    return new Date(date).toLocaleDateString('ro-RO', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Gestionare Pagini
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Total:{' '}
              <span className="font-semibold text-gray-800">
                {pages.length}
              </span>{' '}
              pagini create în site
            </p>
          </div>

          <button
            onClick={() => {
              resetForm();
              setShowModal(true);
            }}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-5 h-5" />
            Pagină Nouă
          </button>
        </div>
      </div>

      {/* Pages Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {pages.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <FileText className="w-8 h-8 text-gray-300" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Nicio pagină încă
            </h3>

            <p className="text-gray-500 mb-6">
              Creează prima pagină pentru site.
            </p>

            <button
              onClick={() => {
                resetForm();
                setShowModal(true);
              }}
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
            >
              <Plus className="w-5 h-5" />
              Creează Pagină
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Pagină</th>
                  <th className="px-6 py-4 font-semibold">URL</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold">Creată</th>
                  <th className="px-6 py-4 font-semibold text-right pr-8">
                    Acțiuni
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {pages.map((page) => (
                  <tr
                    key={page.id}
                    className="bg-white hover:bg-brand-50/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100 flex-shrink-0">
                          <FileText className="w-5 h-5" />
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[280px]">
                            {page.title || 'Fără titlu'}
                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-[280px]">
                            {page.titleRu || 'Fără titlu RU'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-2 rounded-full bg-gray-50 ring-1 ring-gray-100 px-3 py-1.5 text-xs font-semibold text-gray-700">
                        <LinkIcon className="w-3.5 h-3.5 text-gray-400" />
                        /page/{page.slug}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      {page.isPublished ? (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-green-50 text-green-700 ring-1 ring-green-100 px-3 py-1 text-xs font-bold">
                          <Eye className="w-3.5 h-3.5" />
                          Publicată
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-50 text-gray-700 ring-1 ring-gray-100 px-3 py-1 text-xs font-bold">
                          <EyeOff className="w-3.5 h-3.5" />
                          Draft
                        </span>
                      )}
                    </td>

                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="inline-flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays className="w-4 h-4 text-gray-400" />
                        {formatDate(page.createdAt)}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end pr-2">
                        <button
                          onClick={() => handleEdit(page)}
                          title="Editează"
                          className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(page.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingPage ? 'Editează Pagina' : 'Pagină Nouă'}
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Completează titlul, URL-ul și conținutul paginii
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titlu RO *
                  </label>

                  <input
                    type="text"
                    value={formData.title}
                    onChange={handleTitleChange}
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Despre Noi"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titlu RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={formData.titleRu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        titleRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="напр: О нас"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Slug URL *
                </label>

                <div className="flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center px-4 py-3 rounded-xl bg-gray-50 border border-gray-100 text-gray-500 text-sm font-semibold">
                    /page/
                  </span>

                  <input
                    type="text"
                    value={formData.slug}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        slug: e.target.value
                      })
                    }
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 font-mono text-sm"
                    placeholder="despre-noi"
                    required
                  />
                </div>

                <p className="text-xs text-gray-500 mt-1">
                  Se generează automat din titlu, dar îl poți edita manual.
                </p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Conținut RO
                </label>

                {isContactPage ? (
                  <div className="rounded-2xl border border-gray-100 bg-gray-50/60 p-5 space-y-4">
                    <p className="text-sm text-gray-600 font-medium">
                      Editează datele de contact pentru pagina de contact.
                    </p>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Adresă
                      </label>

                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                          type="text"
                          value={contactData.address}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              address: e.target.value
                            })
                          }
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                          placeholder="Str. Principală nr. 123, Chișinău"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Telefon
                        </label>

                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                          <input
                            type="text"
                            value={contactData.phone}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                phone: e.target.value
                              })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                            placeholder="+373 69 123 456"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">
                          Email
                        </label>

                        <div className="relative">
                          <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                          <input
                            type="email"
                            value={contactData.email}
                            onChange={(e) =>
                              setContactData({
                                ...contactData,
                                email: e.target.value
                              })
                            }
                            className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                            placeholder="contact@agrosmart.md"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Program
                      </label>

                      <div className="relative">
                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

                        <input
                          type="text"
                          value={contactData.hours}
                          onChange={(e) =>
                            setContactData({
                              ...contactData,
                              hours: e.target.value
                            })
                          }
                          className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                          placeholder="Luni - Vineri: 08:00 - 20:00"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Google Maps Embed URL
                      </label>

                      <textarea
                        value={contactData.mapUrl}
                        onChange={(e) =>
                          setContactData({
                            ...contactData,
                            mapUrl: e.target.value
                          })
                        }
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                        rows="3"
                        placeholder="https://www.google.com/maps/embed?pb=..."
                      />

                      <p className="text-xs text-gray-500 mt-1">
                        Google Maps → Share → Embed a map → Copy HTML.
                      </p>
                    </div>
                  </div>
                ) : (
                  <textarea
                    value={formData.content}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        content: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 min-h-[260px]"
                    placeholder="Scrie conținutul paginii aici..."
                  />
                )}
              </div>

              {!isContactPage && (
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Conținut RU 🇷🇺
                  </label>

                  <textarea
                    value={formData.contentRu}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        contentRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 min-h-[260px]"
                    placeholder="Напишите содержание страницы здесь..."
                  />
                </div>
              )}

              <label className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  id="isPublished"
                  checked={formData.isPublished}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      isPublished: e.target.checked
                    })
                  }
                  className="w-5 h-5 accent-brand-500 cursor-pointer"
                />

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Publică pagina
                  </p>

                  <p className="text-xs text-gray-500">
                    Dacă este bifat, pagina va fi vizibilă pe site.
                  </p>
                </div>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingPage ? 'Actualizează Pagina' : 'Creează Pagina'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowModal(false);
                    resetForm();
                  }}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  Anulează
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