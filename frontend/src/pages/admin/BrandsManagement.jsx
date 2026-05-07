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

  const filteredBrands = brands.filter(brand =>
    brand.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return <div className="text-center py-12">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-gray-900">
        <h2 className="text-2xl font-extrabold tracking-tight">Gestionare Branduri</h2>
        <p className="text-gray-500 text-sm mt-1">Administrează brandurile produselor tale</p>
      </div>

      {/* Actions Bar */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center">
          <div className="relative flex-1 w-full md:max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Caută brand..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
            />
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="w-full md:w-auto bg-brand-500 text-white px-6 py-2 rounded-xl hover:bg-brand-600 transition font-semibold flex items-center justify-center gap-2"
          >
            <Plus className="w-5 h-5" />
            Adaugă Brand Nou
          </button>
        </div>
      </div>

      {/* Brands Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredBrands.map((brand) => (
          <div
            key={brand.id}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm hover:border-brand-500 transition group"
          >
            <div className="flex flex-col items-center text-center">
              {brand.logo ? (
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 mb-4 flex items-center justify-center">
                  <img src={brand.logo} alt={brand.name} className="w-full h-full object-contain" />
                </div>
              ) : (
                <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 mb-4 flex items-center justify-center">
                  <ImageIcon className="w-12 h-12 text-brand-600" />
                </div>
              )}
              
              <h3 className="font-bold text-lg text-gray-900 mb-2">{brand.name}</h3>
              {brand.description && (
                <p className="text-sm text-gray-600 mb-4 line-clamp-2">{brand.description}</p>
              )}
              
              <div className="flex gap-2 mt-auto pt-4 w-full">
                <button
                  onClick={() => handleEdit(brand)}
                  className="flex-1 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition flex items-center justify-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Editează
                </button>
                <button
                  onClick={() => handleDelete(brand.id)}
                  className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition flex items-center justify-center gap-2"
                >
                  <Trash2 className="w-4 h-4" />
                  Șterge
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredBrands.length === 0 && (
        <div className="bg-white rounded-2xl p-12 text-center border-2 border-gray-100">
          <p className="text-xl text-gray-600">Nu există branduri</p>
          <button
            onClick={() => setShowModal(true)}
            className="mt-4 bg-brand-500 text-white px-6 py-2 rounded-xl hover:bg-brand-600 transition"
          >
            Adaugă primul brand
          </button>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b p-6 flex justify-between items-center">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBrand ? 'Editează Brand' : 'Adaugă Brand Nou'}
              </h3>
              <button
                onClick={handleCloseModal}
                className="text-gray-500 hover:text-gray-700 transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Brand Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Nume Brand *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  placeholder="Ex: Nike, Adidas, Zara..."
                />
              </div>

              {/* Logo Upload */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Logo Brand
                </label>
                <div className="flex items-center gap-4">
                  {imagePreview ? (
                    <div className="w-32 h-32 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center">
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-contain" />
                    </div>
                  ) : (
                    <div className="w-32 h-32 rounded-xl bg-gray-100 flex items-center justify-center">
                      <ImageIcon className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="flex-1">
                    <label className="cursor-pointer bg-gray-100 text-gray-700 px-4 py-2 rounded-xl hover:bg-gray-200 transition inline-flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Încarcă Logo
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    <p className="text-xs text-gray-500 mt-2">PNG, JPG, WEBP (Recomandat: 500x500px)</p>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Descriere (Opțional)
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400 min-h-[100px]"
                  placeholder="Descriere scurtă despre brand..."
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold"
                >
                  {editingBrand ? 'Actualizează' : 'Creează'} Brand
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
