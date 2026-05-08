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

  // Get the IDs of the editing category and all its descendants — used to prevent cycles in parent selector
  const getDescendantIds = (parentId) => {
    const ids = new Set([parentId]);
    let added = true;
    while (added) {
      added = false;
      for (const c of categories) {
        if (c.parentId && ids.has(c.parentId) && !ids.has(c.id)) {
          ids.add(c.id);
          added = true;
        }
      }
    }
    return ids;
  };

  // For the parent selector — any category EXCEPT the editing one and its descendants
  const getEligibleParents = () => {
    if (!editingCategory) return categories;
    const blocked = getDescendantIds(editingCategory.id);
    return categories.filter((c) => !blocked.has(c.id));
  };

  // Indentation helper (depth)
  const getDepth = (catId) => {
    let depth = 0;
    let current = categories.find((c) => c.id === catId);
    while (current && current.parentId) {
      depth += 1;
      current = categories.find((c) => c.id === current.parentId);
    }
    return depth;
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getSubCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  // Recursive row renderer for the table
  const renderCategoryRow = (cat, depth = 0) => {
    const subs = getSubCategories(cat.id);
    const indentPx = 16 + depth * 28;
    const parentName = cat.parentId
      ? categories.find((c) => c.id === cat.parentId)?.name || '-'
      : '-';
    const rowBg =
      depth === 0 ? 'bg-white' : depth === 1 ? 'bg-brand-50/60' : 'bg-brand-100/40';
    return (
      <React.Fragment key={cat.id}>
        <tr className={`${rowBg} hover:bg-brand-50 transition`}>
          <td className="px-6 py-3" style={{ paddingLeft: `${indentPx}px` }}>
            {(cat.image || cat.icon) && (cat.image?.startsWith('data:image') || cat.icon?.startsWith('data:image')) ? (
              <img
                src={cat.image || cat.icon}
                alt={cat.name}
                className="w-10 h-10 object-cover rounded-lg shadow-md"
              />
            ) : (
              <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400">
                <ImageIcon className="w-4 h-4" />
              </div>
            )}
          </td>
          <td className="px-6 py-3">
            <div className={`${depth === 0 ? 'font-bold text-gray-900' : 'font-semibold text-gray-800'}`}>
              {depth > 0 && <span className="text-gray-400 mr-1">{'↳ '.repeat(depth)}</span>}
              {cat.name}
            </div>
          </td>
          <td className="px-6 py-3 text-gray-600">{cat.slug}</td>
          <td className="px-6 py-3 text-gray-500">{parentName}</td>
          <td className="px-6 py-3">
            <span className="bg-brand-100 text-brand-800 px-3 py-1 rounded-full text-sm font-semibold">
              {cat.itemCount || 0}
            </span>
          </td>
          <td className="px-6 py-3">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setShowModal(true);
                  setEditingCategory(null);
                  setImagePreview(null);
                  setFormData({ name: '', nameRu: '', slug: '', icon: '', image: '', parentId: cat.id });
                }}
                title="Adaugă subcategorie"
                data-testid={`add-sub-${cat.id}`}
                className="p-2 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition"
              >
                <Plus className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleEdit(cat)}
                data-testid={`edit-cat-${cat.id}`}
                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
              >
                <Edit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(cat.id)}
                data-testid={`delete-cat-${cat.id}`}
                className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </td>
        </tr>
        {subs.map((s) => renderCategoryRow(s, depth + 1))}
      </React.Fragment>
    );
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
              {getParentCategories().map((category) => renderCategoryRow(category, 0))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="bg-white border-b border-gray-100 px-6 py-5 flex justify-between items-center rounded-t-3xl sticky top-0 z-10">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">{editingCategory ? 'Editează categorie' : 'Adaugă categorie nouă'}</h3>
                <p className="text-sm text-gray-500 mt-0.5">Configurează nume, slug, imagine și ierarhia (opțional)</p>
              </div>
              <button onClick={() => { setShowModal(false); setEditingCategory(null); setImagePreview(null); }} className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition">
                <X className="w-5 h-5" />
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
                <label className="block text-sm font-bold text-gray-700 mb-2">Categorie Părinte (opțional - pentru subcategorii la orice nivel)</label>
                <select
                  data-testid="parent-category-select"
                  value={formData.parentId || ''}
                  onChange={(e) => setFormData({...formData, parentId: e.target.value || null})}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                >
                  <option value="">Nicio (Categorie principală)</option>
                  {getEligibleParents().map((cat) => {
                    const depth = getDepth(cat.id);
                    const indent = '— '.repeat(depth);
                    return (
                      <option key={cat.id} value={cat.id}>
                        {indent}{cat.name}
                      </option>
                    );
                  })}
                </select>
                <p className="text-xs text-gray-500 mt-1">Poți alege o subcategorie ca părinte — sistemul suportă oricâte niveluri de imbricare.</p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  data-testid="save-category-btn"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
                >
                  {editingCategory ? 'Actualizează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingCategory(null); }}
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

export default CategoriesManagement;
