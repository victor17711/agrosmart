import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Plus, Edit, Trash2, Search, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const BrandsManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBrand, setEditingBrand] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    description: ''
  });

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca brandurile', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData({ ...formData, logo: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (editingBrand) {
        await axios.put(`${API}/brands/${editingBrand.id}`, formData, getAuthHeaders());
        toast({ title: 'Succes', description: 'Brand actualizat cu succes!' });
      } else {
        await axios.post(`${API}/brands`, formData, getAuthHeaders());
        toast({ title: 'Succes', description: 'Brand creat cu succes!' });
      }

      fetchBrands();
      handleCloseModal();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Eroare la salvarea brandului',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (brand) => {
    setEditingBrand(brand);
    setFormData({
      name: brand.name,
      logo: brand.logo,
      description: brand.description || ''
    });
    setImagePreview(brand.logo);
    setShowModal(true);
  };

  const handleDelete = async (brandId) => {
    if (window.confirm('Ești sigur că vrei să ștergi acest brand?')) {
      try {
        await axios.delete(`${API}/brands/${brandId}`, getAuthHeaders());
        toast({ title: 'Succes', description: 'Brand șters cu succes!' });
        fetchBrands();
      } catch (error) {
        toast({ title: 'Eroare', description: 'Nu s-a putut șterge brandul', variant: 'destructive' });
      }
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingBrand(null);
    setFormData({ name: '', logo: '', description: '' });
    setImagePreview(null);
  };

  const filteredBrands = brands.filter((brand) =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
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
      {/* Header card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Gestionare Branduri
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Total: <span className="font-semibold text-gray-800">{brands.length}</span> branduri în catalog
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-4 h-4" />
            Adaugă Brand
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Caută brand după nume..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60">
              <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-4 py-4 font-semibold">Brand</th>
                <th className="px-4 py-4 font-semibold">Descriere</th>
                <th className="px-4 py-4 font-semibold text-right pr-6">Acțiuni</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredBrands.map((brand) => (
                <tr key={brand.id} className="bg-white hover:bg-brand-50/40 transition">
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {brand.logo ? (
                          <img
                            src={brand.logo}
                            alt={brand.name}
                            className="w-full h-full object-contain p-1"
                          />
                        ) : (
                          <ImageIcon className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate max-w-[280px]">
                          {brand.name}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[280px]">
                          ID: {brand.id}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-600">
                    <div className="max-w-[420px] truncate">
                      {brand.description || '—'}
                    </div>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2 justify-end pr-2">
                      <button
                        onClick={() => handleEdit(brand)}
                        title="Editează"
                        className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(brand.id)}
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

        {filteredBrands.length === 0 && (
          <div className="px-6 py-14 text-center border-t border-gray-100">
            <div className="mx-auto w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
              <ImageIcon className="w-7 h-7 text-gray-400" />
            </div>
            <p className="text-lg font-semibold text-gray-800">Nu există branduri</p>
            <p className="text-sm text-gray-500 mt-1">
              Adaugă primul brand sau schimbă termenul de căutare.
            </p>

            <button
              onClick={() => setShowModal(true)}
              className="mt-5 inline-flex items-center gap-2 bg-brand-500 text-white px-5 py-2.5 rounded-full hover:bg-brand-600 transition font-semibold"
            >
              <Plus className="w-4 h-4" />
              Adaugă primul brand
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingBrand ? 'Editează brand' : 'Adaugă brand nou'}
                </h3>
                <p className="text-sm text-gray-500 mt-0.5">
                  {editingBrand ? 'Actualizează detaliile brandului' : 'Completează câmpurile pentru a adăuga un brand'}
                </p>
              </div>

              <button
                onClick={handleCloseModal}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Nume Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  placeholder="Ex: Nike, Adidas, Zara..."
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Logo Brand
                </label>

                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 hover:border-brand-500 transition">
                  <div className="flex flex-col sm:flex-row items-center gap-5">
                    {imagePreview ? (
                      <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    ) : (
                      <div className="w-32 h-32 rounded-xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                        <ImageIcon className="w-12 h-12 text-gray-400" />
                      </div>
                    )}

                    <div className="flex-1 text-center sm:text-left">
                      <label className="cursor-pointer bg-brand-500 text-white px-5 py-2.5 rounded-xl hover:bg-brand-600 transition inline-flex items-center gap-2 font-semibold">
                        <Upload className="w-4 h-4" />
                        Încarcă Logo
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>

                      <p className="text-xs text-gray-500 mt-2">
                        PNG, JPG, WEBP. Recomandat: 500x500px
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Descriere opțională
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 min-h-[110px]"
                  placeholder="Descriere scurtă despre brand..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold"
                >
                  {editingBrand ? 'Actualizează' : 'Creează'}
                </button>

                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 rounded-xl hover:bg-gray-400 transition font-semibold"
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

export default BrandsManagement;