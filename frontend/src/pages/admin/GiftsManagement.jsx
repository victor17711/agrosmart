import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Gift, Plus, Edit, Trash2, Save, X, Image as ImageIcon } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const emptyForm = {
  image: '',
  name: '',
  nameRu: '',
  description: '',
  descriptionRu: '',
  isActive: true
};

const GiftsManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [gifts, setGifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    fetchGifts();
  }, []);

  const fetchGifts = async () => {
    try {
      const res = await axios.get(`${API}/gifts`);
      setGifts(res.data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (g) => {
    setEditingId(g.id);
    setForm({
      image: g.image || '',
      name: g.name || '',
      nameRu: g.nameRu || '',
      description: g.description || '',
      descriptionRu: g.descriptionRu || '',
      isActive: g.isActive !== false
    });
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'Eroare',
        description: 'Imagine prea mare (max 5MB)',
        variant: 'destructive'
      });
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () =>
      setForm({
        ...form,
        image: reader.result
      });

    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name) {
      toast({
        title: 'Eroare',
        description: 'Numele este obligatoriu',
        variant: 'destructive'
      });
      return;
    }

    try {
      if (editingId) {
        await axios.put(`${API}/gifts/${editingId}`, form, getAuthHeaders());
      } else {
        await axios.post(`${API}/gifts`, form, getAuthHeaders());
      }

      toast({
        title: 'Succes',
        description: editingId ? 'Cadou actualizat!' : 'Cadou adăugat!'
      });

      closeModal();
      fetchGifts();
    } catch (err) {
      toast({
        title: 'Eroare',
        description: err.response?.data?.detail || 'Nu s-a putut salva',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest cadou?')) return;

    try {
      await axios.delete(`${API}/gifts/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Cadou șters!'
      });

      fetchGifts();
    } catch (err) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge',
        variant: 'destructive'
      });
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
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Gestionare Cadouri
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Total:{' '}
              <span className="font-semibold text-gray-800">
                {gifts.length}
              </span>{' '}
              cadouri promoționale
            </p>
          </div>

          <button
            onClick={openCreate}
            data-testid="add-gift-btn"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-5 h-5" />
            Adaugă cadou
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {gifts.length === 0 ? (
          <div className="px-6 py-16 text-center">
            <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <Gift className="w-8 h-8 text-gray-300" />
            </div>

            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Niciun cadou adăugat
            </h3>

            <p className="text-gray-500 mb-6">
              Click pe „Adaugă cadou” pentru a crea primul cadou promoțional.
            </p>

            <button
              onClick={openCreate}
              className="inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
            >
              <Plus className="w-5 h-5" />
              Adaugă cadou
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50/60">
                <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                  <th className="px-6 py-4 font-semibold">Cadou</th>
                  <th className="px-6 py-4 font-semibold">Descriere</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right pr-8">
                    Acțiuni
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-gray-100">
                {gifts.map((g) => (
                  <tr
                    key={g.id}
                    className="bg-white hover:bg-brand-50/40 transition"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-14 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                          {g.image ? (
                            <img
                              src={g.image}
                              alt={g.name}
                              className="w-full h-full object-contain p-1"
                            />
                          ) : (
                            <ImageIcon className="w-5 h-5 text-gray-400" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <div className="font-semibold text-gray-900 truncate max-w-[280px]">
                            {g.name || 'Fără nume'}
                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-[280px]">
                            {g.nameRu ? `🇷🇺 ${g.nameRu}` : 'Fără nume RU'}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-700 truncate max-w-[360px]">
                        {g.description || '—'}
                      </div>

                      <div className="text-xs text-gray-500 truncate max-w-[360px] mt-1">
                        {g.descriptionRu ? `🇷🇺 ${g.descriptionRu}` : '—'}
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ${
                          g.isActive
                            ? 'bg-green-50 text-green-700 ring-1 ring-green-100'
                            : 'bg-gray-50 text-gray-600 ring-1 ring-gray-100'
                        }`}
                      >
                        {g.isActive ? 'Activ' : 'Inactiv'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex gap-2 justify-end pr-2">
                        <button
                          onClick={() => openEdit(g)}
                          title="Editează"
                          className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => handleDelete(g.id)}
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
                  {editingId ? 'Editează cadou' : 'Adaugă cadou'}
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Completează informațiile pentru cadoul promoțional.
                </p>
              </div>

              <button
                onClick={closeModal}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Poza principală
                </label>

                {form.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 h-44 flex items-center justify-center bg-gray-50">
                    <img
                      src={form.image}
                      alt="preview"
                      className="max-h-full object-contain"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  data-testid="gift-image-input"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Imagine recomandată PNG/JPG/WEBP, maxim 5MB.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nume RO *
                  </label>

                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        name: e.target.value
                      })
                    }
                    required
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    data-testid="gift-name-input"
                    placeholder="ex: Set cadou"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nume RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={form.nameRu}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        nameRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Подарочный набор"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descriere RO
                  </label>

                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        description: e.target.value
                      })
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="Descriere scurtă..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descriere RU 🇷🇺
                  </label>

                  <textarea
                    value={form.descriptionRu}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        descriptionRu: e.target.value
                      })
                    }
                    rows="4"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="Описание..."
                  />
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-2xl bg-gray-50 border border-gray-100 p-4 cursor-pointer">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      isActive: e.target.checked
                    })
                  }
                  className="w-5 h-5 accent-brand-500 cursor-pointer"
                />

                <div>
                  <p className="text-sm font-bold text-gray-900">
                    Cadou activ
                  </p>

                  <p className="text-xs text-gray-500">
                    Dacă este bifat, cadoul va fi vizibil în popup-ul de produs.
                  </p>
                </div>
              </label>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  data-testid="save-gift-btn"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 inline-flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  Salvează
                </button>

                <button
                  type="button"
                  onClick={closeModal}
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

export default GiftsManagement;