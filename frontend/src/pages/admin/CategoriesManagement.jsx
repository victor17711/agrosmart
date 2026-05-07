import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Plus, Edit, Trash2, Upload, X, Image as ImageIcon } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const CategoriesManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [formData, setFormData] = useState({ 
    name: '', 
    nameRu: '',
    slug: '', 
    icon: '',
    image: '',
    parentId: null
  });

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca categoriile', variant: 'destructive' });
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
        setFormData({ ...formData, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.image) {
      toast({ title: 'Eroare', description: 'Te rog încarcă o imagine pentru categorie', variant: 'destructive' });
      return;
    }
    
    try {
      const categoryData = { 
        ...formData,
        icon: formData.image,
        itemCount: 0,
        parentId: formData.parentId || null
      };

      if (editingCategory) {
        await axios.put(`${API}/categories/${editingCategory.id}`, categoryData, getAuthHeaders());
        toast({ title: 'Succes', description: 'Categoria a fost actualizată!' });
      } else {
        await axios.post(`${API}/categories`, categoryData, getAuthHeaders());
        toast({ title: 'Succes', description: 'Categoria a fost creată!' });
      }
      
      setShowModal(false);
      setEditingCategory(null);
      setImagePreview(null);
      setFormData({ name: '', slug: '', icon: '', image: '', parentId: null });
      fetchCategories();
    } catch (error) {
      toast({ title: 'Eroare', description: error.response?.data?.detail || 'Nu s-a putut salva categoria', variant: 'destructive' });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți această categorie?')) return;
    
    try {
      await axios.delete(`${API}/categories/${id}`, getAuthHeaders());
      toast({ title: 'Succes', description: 'Categoria a fost ștearsă!' });
      fetchCategories();
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut șterge categoria', variant: 'destructive' });
    }
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormData({
      name: category.name,
      nameRu: category.nameRu || '',
      slug: category.slug,
      icon: category.icon || '',
      image: category.image || category.icon || '',
      parentId: category.parentId || null
    });
    if (category.image || (category.icon && category.icon.startsWith('data:image'))) {
      setImagePreview(category.image || category.icon);
    }
    setShowModal(true);
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getSubCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
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
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">Gestionare Categorii</h2>
            <p className="text-gray-500 text-sm mt-1">Total: {categories.length} categorii</p>
          </div>
          <button
            onClick={() => { setShowModal(true); setEditingCategory(null); setFormData({ name: '', nameRu: '', slug: '', icon: '', parentId: null, image: '' }); }}
            className="bg-white text-brand-700 px-6 py-3 rounded-xl flex items-center gap-2 hover:bg-brand-50 transition font-semibold"
          >
            <Plus className="w-5 h-5" />
            Adaugă Categorie
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60 text-gray-500 text-[11px] uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 text-left font-semibold">Icon/Imagine</th>
                <th className="px-6 py-4 text-left font-semibold">Nume Categorie</th>
                <th className="px-6 py-4 text-left font-semibold">Slug</th>
                <th className="px-6 py-4 text-left font-semibold">Categorie Părinte</th>
                <th className="px-6 py-4 text-left font-semibold">Produse</th>
                <th className="px-6 py-4 text-left font-semibold">Acțiuni</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {getParentCategories().map((category, index) => (
                <React.Fragment key={category.id}>
                  <tr className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-brand-50 transition`}>
                    <td className="px-6 py-4">
                      {(category.image || category.icon) && (category.image?.startsWith('data:image') || category.icon?.startsWith('data:image')) ? (
                        <img src={category.image || category.icon} alt={category.name} className="w-12 h-12 object-cover rounded-lg shadow-md" />
                      ) : (
                        <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-900">{category.name}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{category.slug}</td>
                    <td className="px-6 py-4 text-gray-500">-</td>
                    <td className="px-6 py-4">
                      <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-semibold">
                        {category.itemCount || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEdit(category)}
                          className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(category.id)}
                          className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {/* Sub-categories */}
                  {getSubCategories(category.id).map((subCat) => (
                    <tr key={subCat.id} className="bg-brand-50 hover:bg-brand-100 transition">
                      <td className="px-6 py-3 pl-16">
                        {(subCat.image || subCat.icon) && (subCat.image?.startsWith('data:image') || subCat.icon?.startsWith('data:image')) ? (
                          <img src={subCat.image || subCat.icon} alt={subCat.name} className="w-10 h-10 object-cover rounded-lg shadow-md" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-3">
                        <div className="font-semibold text-gray-800">↳ {subCat.name}</div>
                      </td>
                      <td className="px-6 py-3 text-gray-600">{subCat.slug}</td>
                      <td className="px-6 py-3 text-gray-500">{category.name}</td>
                      <td className="px-6 py-3">
                        <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-semibold">
                          {subCat.itemCount || 0}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEdit(subCat)}
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(subCat.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full">
            <div className="bg-gray-50/60 text-gray-500 text-[11px] uppercase tracking-wider px-6 py-4 flex justify-between items-center rounded-t-2xl">
              <h3 className="text-2xl font-bold">{editingCategory ? 'Editează Categorie' : 'Adaugă Categorie Nouă'}</h3>
              <button onClick={() => { setShowModal(false); setEditingCategory(null); }} className="text-white hover:text-gray-200">
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagine Categorie * (recomandabil 200x200px)</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-brand-500 transition">
                  {imagePreview ? (
                    <div className="relative inline-block">
                      <img src={imagePreview} alt="Preview" className="max-h-40 rounded-lg shadow-lg" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setFormData({...formData, image: ''}); }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 transition shadow-lg"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-3" />
                      <label className="cursor-pointer">
                        <span className="bg-brand-500 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-brand-600 transition font-semibold">
                          <Upload className="w-5 h-5" />
                          Încarcă Imagine
                        </span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleImageUpload}
                          className="hidden"
                        />
                      </label>
                      <p className="text-xs text-gray-500 mt-3">PNG, JPG, WebP până la 2MB</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nume Categorie *</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  placeholder="ex: Haine Femei"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Nume Categorie RU 🇷🇺</label>
                <input
                  type="text"
                  value={formData.nameRu}
                  onChange={(e) => setFormData({...formData, nameRu: e.target.value})}
                  placeholder="напр: Женская одежда"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Slug *</label>
                <input
                  type="text"
                  required
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  placeholder="ex: haine-femei"
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
                <p className="text-xs text-gray-500 mt-1">URL-ul categoriei: /category/{formData.slug || 'slug-aici'}</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Categorie Părinte (opțional - pentru subcategorii)</label>
                <select
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                >
                  <option value="">Nicio (Categorie principală)</option>
                  {getParentCategories().filter(cat => !editingCategory || cat.id !== editingCategory.id).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-gray-50/60 text-gray-500 text-[11px] uppercase tracking-wider py-3 rounded-xl hover:bg-brand-600 transition font-semibold"
                >
                  {editingCategory ? 'Actualizează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCategory(null); }}
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

export default CategoriesManagement;
