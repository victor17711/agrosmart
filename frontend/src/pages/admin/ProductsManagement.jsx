import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import {
  Plus,
  Edit,
  Trash2,
  Search,
  Upload,
  X,
  Image as ImageIcon,
  ChevronLeft,
  ChevronRight,
  Package
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;
const ITEMS_PER_PAGE = 20;

const ProductsManagement = () => {
  const { getAuthHeaders } = useAdmin();

  const [products, setProducts] = useState([]);
  const [totalProducts, setTotalProducts] = useState(0);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [bulkDeleting, setBulkDeleting] = useState(false);

  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);

  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [currentPage, setCurrentPage] = useState(1);

  const [imagePreview, setImagePreview] = useState(null);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [specifications, setSpecifications] = useState([]);

  const [formData, setFormData] = useState({
    name: '',
    nameRu: '',
    description: '',
    descriptionRu: '',
    price: '',
    originalPrice: '',
    category: '',
    categories: [],
    brandId: '',
    storeName: '',
    storeNameRu: '',
    image: '',
    images: [],
    available: 100,
    sku: '',
    badge: '',
    badgeRu: ''
  });

  useEffect(() => {
    fetchCategories();
    fetchBrands();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  useEffect(() => {
    fetchProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, debouncedSearch]);

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const fetchProducts = async () => {
    try {
      setLoading(true);

      const params = new URLSearchParams({
        page: currentPage,
        pageSize: ITEMS_PER_PAGE
      });

      if (debouncedSearch) {
        params.append('search', debouncedSearch);
      }

      const response = await axios.get(
        `${API}/admin/products?${params.toString()}`,
        getAuthHeaders()
      );

      setProducts(response.data.items || []);
      setTotalProducts(response.data.total || 0);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca produsele',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${API}/categories`);
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const fetchBrands = async () => {
    try {
      const response = await axios.get(`${API}/brands`);
      setBrands(response.data);
    } catch (error) {
      console.error('Error fetching brands:', error);
    }
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (next.has(id)) next.delete(id);
      else next.add(id);

      return next;
    });
  };

  const allOnPageSelected =
    products.length > 0 && products.every((p) => selectedIds.has(p.id));

  const toggleSelectAllOnPage = () => {
    setSelectedIds((prev) => {
      const next = new Set(prev);

      if (allOnPageSelected) {
        products.forEach((p) => next.delete(p.id));
      } else {
        products.forEach((p) => next.add(p.id));
      }

      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  const handleBulkDelete = async () => {
    const ids = Array.from(selectedIds);

    if (ids.length === 0) return;

    if (!window.confirm(`Sigur doriți să ștergeți ${ids.length} produse selectate?`)) return;

    try {
      setBulkDeleting(true);

      const res = await axios.post(
        `${API}/admin/products/bulk-delete`,
        { ids },
        getAuthHeaders()
      );

      toast({
        title: 'Succes',
        description: res.data.message || `${ids.length} produse șterse`
      });

      clearSelection();

      const newTotal = Math.max(totalProducts - ids.length, 0);
      const newLastPage = Math.max(1, Math.ceil(newTotal / ITEMS_PER_PAGE));

      if (currentPage > newLastPage) {
        setCurrentPage(newLastPage);
      } else {
        fetchProducts();
      }
    } catch (err) {
      toast({
        title: 'Eroare',
        description: err.response?.data?.detail || 'Nu s-au putut șterge produsele',
        variant: 'destructive'
      });
    } finally {
      setBulkDeleting(false);
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

  const handleMultipleImagesUpload = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + imagePreviews.length > 5) {
      toast({
        title: 'Limită atinsă',
        description: 'Maximum 5 imagini per produs',
        variant: 'destructive'
      });
      return;
    }

    files.forEach((file) => {
      const reader = new FileReader();

      reader.onloadend = () => {
        setImagePreviews((prev) => [...prev, reader.result]);
        setFormData((prev) => ({
          ...prev,
          images: [...prev.images, reader.result]
        }));
      };

      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index) => {
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));

    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const hasOriginalPrice =
        formData.originalPrice !== '' &&
        formData.originalPrice !== null &&
        formData.originalPrice !== undefined;

      const originalPriceNum = hasOriginalPrice
        ? parseFloat(formData.originalPrice)
        : null;

      const priceNum = parseFloat(formData.price);

      const productData = {
        ...formData,
        price: priceNum,
        originalPrice: originalPriceNum,
        discount:
          originalPriceNum && originalPriceNum > priceNum
            ? Math.round(((originalPriceNum - priceNum) / originalPriceNum) * 100)
            : 0,
        colors: ['#9b59b6', '#3498db', '#e74c3c', '#f1c40f'],
        sizes: ['S', 'M', 'L', 'XL', 'XXL'],
        specifications: specifications.filter((spec) => spec.title && spec.value),
        rating: 4.5,
        reviews: 100,
        sold: 0,
        inStock: true
      };

      if (editingProduct) {
        await axios.put(
          `${API}/products/${editingProduct.id}`,
          productData,
          getAuthHeaders()
        );

        toast({
          title: 'Succes',
          description: 'Produsul a fost actualizat!'
        });
      } else {
        await axios.post(`${API}/products`, productData, getAuthHeaders());

        toast({
          title: 'Succes',
          description: 'Produsul a fost creat!'
        });
      }

      setShowModal(false);
      setEditingProduct(null);
      setImagePreview(null);
      setImagePreviews([]);
      setSpecifications([]);
      resetForm();
      fetchProducts();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Nu s-a putut salva produsul',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest produs?')) return;

    try {
      await axios.delete(`${API}/products/${id}`, getAuthHeaders());

      toast({
        title: 'Succes',
        description: 'Produsul a fost șters!'
      });

      fetchProducts();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge produsul',
        variant: 'destructive'
      });
    }
  };

  const handleEdit = (product) => {
    setEditingProduct(product);

    setFormData({
      name: product.name,
      nameRu: product.nameRu || '',
      description: product.description || '',
      descriptionRu: product.descriptionRu || '',
      price: product.price,
      originalPrice: product.originalPrice ?? '',
      category: product.category,
      categories: product.categories || [],
      brandId: product.brandId || '',
      storeName: product.storeName || '',
      storeNameRu: product.storeNameRu || '',
      image: product.image,
      images: product.images || [],
      available: product.available,
      sku: product.sku || '',
      badge: product.badge || '',
      badgeRu: product.badgeRu || ''
    });

    setSpecifications(product.specifications || []);
    setImagePreview(product.image);
    setImagePreviews(product.images || []);
    setShowModal(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      nameRu: '',
      description: '',
      descriptionRu: '',
      price: '',
      originalPrice: '',
      category: '',
      categories: [],
      brandId: '',
      storeName: '',
      storeNameRu: '',
      image: '',
      images: [],
      available: 100,
      sku: '',
      badge: '',
      badgeRu: ''
    });

    setImagePreview(null);
    setImagePreviews([]);
    setSpecifications([]);
  };

  const addSpecification = () => {
    if (specifications.length < 10) {
      setSpecifications([...specifications, { title: '', value: '' }]);
    } else {
      toast({
        title: 'Limită atinsă',
        description: 'Maximum 10 specificații per produs',
        variant: 'destructive'
      });
    }
  };

  const updateSpecification = (index, field, value) => {
    const newSpecs = [...specifications];
    newSpecs[index][field] = value;
    setSpecifications(newSpecs);
  };

  const removeSpecification = (index) => {
    setSpecifications(specifications.filter((_, i) => i !== index));
  };

  const totalPages = Math.max(1, Math.ceil(totalProducts / ITEMS_PER_PAGE));
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + products.length;
  const currentProducts = products;

  const PAGE_GROUP_SIZE = 5;
  const currentGroup = Math.floor((currentPage - 1) / PAGE_GROUP_SIZE);
  const groupStart = currentGroup * PAGE_GROUP_SIZE + 1;
  const groupEnd = Math.min(groupStart + PAGE_GROUP_SIZE - 1, totalPages);

  const visiblePages = [];

  for (let page = groupStart; page <= groupEnd; page++) {
    visiblePages.push(page);
  }

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
              Gestionare Produse
            </h2>

            <p className="text-sm text-gray-500 mt-1">
              Total:{' '}
              <span className="font-semibold text-gray-800">
                {totalProducts}
              </span>{' '}
              produse în catalog
            </p>
          </div>

          <button
            onClick={() => {
              setShowModal(true);
              setEditingProduct(null);
              resetForm();
            }}
            data-testid="add-product-btn"
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-4 h-4" />
            Adaugă Produs
          </button>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Caută produse după nume…"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
              data-testid="products-search-input"
            />
          </div>
        </div>

        {selectedIds.size > 0 && (
          <div className="mt-4 flex items-center justify-between gap-3 bg-brand-50 border border-brand-100 rounded-2xl px-4 py-3">
            <span className="text-sm font-semibold text-brand-800">
              {selectedIds.size} produs{selectedIds.size === 1 ? '' : 'e'} selectat
              {selectedIds.size === 1 ? '' : 'e'}
            </span>

            <div className="flex gap-2">
              <button
                onClick={clearSelection}
                className="px-4 py-2 text-sm bg-white border border-gray-200 rounded-full hover:bg-gray-50 transition font-semibold"
                data-testid="bulk-clear-selection-btn"
              >
                Anulează selecție
              </button>

              <button
                onClick={handleBulkDelete}
                disabled={bulkDeleting}
                className="px-4 py-2 text-sm bg-rose-500 text-white rounded-full hover:bg-rose-600 transition font-semibold flex items-center gap-2 disabled:opacity-50"
                data-testid="bulk-delete-btn"
              >
                <Trash2 className="w-4 h-4" />
                {bulkDeleting ? 'Se șterge…' : `Șterge ${selectedIds.size}`}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60">
              <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-4 py-4 w-10">
                  <input
                    type="checkbox"
                    checked={allOnPageSelected}
                    onChange={toggleSelectAllOnPage}
                    className="w-4 h-4 accent-brand-500 cursor-pointer"
                    data-testid="select-all-page-checkbox"
                    title={
                      allOnPageSelected
                        ? 'Deselectează pagina'
                        : 'Selectează toată pagina'
                    }
                  />
                </th>

                <th className="px-4 py-4 font-semibold">Produs</th>
                <th className="px-4 py-4 font-semibold">Categorie</th>
                <th className="px-4 py-4 font-semibold">Preț</th>
                <th className="px-4 py-4 font-semibold">Stoc</th>
                <th className="px-4 py-4 font-semibold text-right pr-6">
                  Acțiuni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {currentProducts.map((product) => (
                <tr
                  key={product.id}
                  className={`hover:bg-brand-50/40 transition ${
                    selectedIds.has(product.id) ? 'bg-brand-50/60' : 'bg-white'
                  }`}
                >
                  <td className="px-4 py-4">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(product.id)}
                      onChange={() => toggleSelect(product.id)}
                      className="w-4 h-4 accent-brand-500 cursor-pointer"
                      data-testid={`select-product-${product.id}`}
                    />
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-gray-50 overflow-hidden flex items-center justify-center flex-shrink-0">
                        {product.image ? (
                          <img
                            src={product.image}
                            alt={product.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="w-5 h-5 text-gray-400" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate max-w-[280px]">
                          {product.name}
                        </div>

                        <div className="text-xs text-gray-500 truncate max-w-[280px]">
                          {product.storeName || product.sku || '—'}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-4 py-4 text-sm text-gray-700">
                    {product.category || '—'}
                  </td>

                  <td className="px-4 py-4">
                    <div className="font-bold text-gray-900">
                      {Number(product.price).toLocaleString('ro-RO')} MDL
                    </div>

                    {product.originalPrice &&
                      Number(product.originalPrice) > Number(product.price) && (
                        <div className="text-xs text-gray-400 line-through">
                          {Number(product.originalPrice).toLocaleString('ro-RO')} MDL
                        </div>
                      )}
                  </td>

                  <td className="px-4 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${
                        product.available > 50
                          ? 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                          : product.available > 10
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                          : 'bg-rose-50 text-rose-700 ring-1 ring-rose-100'
                      }`}
                    >
                      {product.available ?? 0}
                    </span>
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex gap-2 justify-end pr-2">
                      <button
                        onClick={() => handleEdit(product)}
                        data-testid={`edit-product-${product.id}`}
                        title="Editează"
                        className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleDelete(product.id)}
                        data-testid={`delete-product-${product.id}`}
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

        {/* Pagination */}
        <div className="bg-gray-50/60 border-t border-gray-100 px-6 py-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Afișare{' '}
            <span className="font-semibold text-gray-800">
              {totalProducts === 0 ? 0 : startIndex + 1}
            </span>{' '}
            –{' '}
            <span className="font-semibold text-gray-800">
              {Math.min(endIndex, totalProducts)}
            </span>{' '}
            din{' '}
            <span className="font-semibold text-gray-800">
              {totalProducts}
            </span>
          </div>

          {totalPages > 1 && (
            <div className="flex gap-2">
              <button
                onClick={() =>
                  setCurrentPage(Math.max(1, groupStart - PAGE_GROUP_SIZE))
                }
                disabled={groupStart === 1}
                className="px-3 py-2 border border-gray-200 rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                <ChevronLeft className="w-4 h-4" />
                Anterior
              </button>

              <div className="flex gap-1">
                {visiblePages.map((page) => (
                  <button
                    key={page}
                    onClick={() => setCurrentPage(page)}
                    className={`w-9 h-9 rounded-full text-sm font-semibold transition ${
                      currentPage === page
                        ? 'bg-brand-500 text-white shadow-md shadow-brand-200'
                        : 'border border-gray-200 hover:bg-white text-gray-700'
                    }`}
                  >
                    {page}
                  </button>
                ))}
              </div>

              <button
                onClick={() => setCurrentPage(Math.min(totalPages, groupEnd + 1))}
                disabled={groupEnd >= totalPages}
                className="px-3 py-2 border border-gray-200 rounded-full hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1 text-sm"
              >
                Următor
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div
            data-testid="product-modal"
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100"
          >
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingProduct ? 'Editează produs' : 'Adaugă produs nou'}
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  {editingProduct
                    ? 'Actualizează detaliile produsului'
                    : 'Completează câmpurile pentru a adăuga un produs'}
                </p>
              </div>

              <button
                onClick={() => {
                  setShowModal(false);
                  setEditingProduct(null);
                  resetForm();
                }}
                data-testid="close-product-modal-btn"
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

                        <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagine Produs *</label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#a7cf26] transition">
                  {imagePreview ? (
                    <div className="relative">
                      <img src={imagePreview} alt="Preview" className="max-h-48 mx-auto rounded-lg" />
                      <button
                        type="button"
                        onClick={() => { setImagePreview(null); setFormData({...formData, image: ''}); }}
                        className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <div>
                      <ImageIcon className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <label className="cursor-pointer">
                        <span className="bg-[#a7cf26] text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 hover:bg-[#96bc21] transition font-semibold">
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
                      <p className="text-sm text-gray-500 mt-2">PNG, JPG până la 10MB</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Additional Images (up to 5) */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Imagini Suplimentare (Max 5 total)</label>
                <div className="space-y-3">
                  {imagePreviews.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {imagePreviews.map((img, index) => (
                        <div key={index} className="relative">
                          <img src={img} alt={`Preview ${index + 1}`} className="w-full h-24 object-cover rounded-lg" />
                          <button
                            type="button"
                            onClick={() => removeImage(index)}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full hover:bg-red-600"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  {imagePreviews.length < 5 && (
                    <label className="cursor-pointer block">
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-[#a7cf26] transition">
                        <Plus className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                        <span className="text-sm text-gray-600">Adaugă imagini ({imagePreviews.length}/5)</span>
                      </div>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={handleMultipleImagesUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Nume Produs (RO) *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                    placeholder="Nume în română"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nume Produs (RU) 🇷🇺
                  </label>
                  <input
                    type="text"
                    value={formData.nameRu}
                    onChange={(e) => setFormData({...formData, nameRu: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                    placeholder="Название на русском"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Categorie Principală *</label>
                  <select
                    required
                    value={formData.category}
                    onChange={(e) => setFormData({
                      ...formData,
                      category: e.target.value,
                      // Reset additional categories when parent changes
                      categories: []
                    })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  >
                    <option value="">Selectează</option>
                    {categories
                      .filter((cat) => !cat.parentId)
                      .map((cat) => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                  </select>
                </div>

                {(() => {
                  // Find selected parent (a top-level category by name)
                  const parent = categories.find((c) => c.name === formData.category && !c.parentId);

                  // Collect ALL descendants (level 2 + level 3 + …) recursively
                  const collectDescendants = (parentId, depth = 1) => {
                    const directChildren = categories.filter((c) => c.parentId === parentId);
                    let result = [];
                    for (const child of directChildren) {
                      result.push({ ...child, depth });
                      result = result.concat(collectDescendants(child.id, depth + 1));
                    }
                    return result;
                  };

                  const descendants = parent ? collectDescendants(parent.id) : [];

                  if (!formData.category) {
                    return (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categorii Adiționale (Sub-categorii)</label>
                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-500 italic">
                          Selectează mai întâi o Categorie Principală pentru a vedea sub-categoriile disponibile.
                        </div>
                      </div>
                    );
                  }

                  if (descendants.length === 0) {
                    return (
                      <div>
                        <label className="block text-sm font-bold text-gray-700 mb-2">Categorii Adiționale (Sub-categorii)</label>
                        <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 text-sm text-gray-500 italic">
                          Categoria „{formData.category}" nu are sub-categorii definite.
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">
                        Categorii Adiționale — sub-categorii (toate nivelurile) din „{formData.category}"
                      </label>
                      <div className="border-2 border-gray-200 rounded-xl p-3 max-h-60 overflow-y-auto bg-gray-50">
                        {descendants.map((cat) => {
                          const isChecked = formData.categories?.includes(cat.name) || false;
                          return (
                            <label
                              key={cat.id}
                              className={`flex items-center gap-2 py-1.5 cursor-pointer hover:bg-white px-2 rounded ${
                                cat.depth === 1 ? 'font-semibold text-gray-800' :
                                cat.depth === 2 ? 'text-gray-700' : 'text-gray-600'
                              }`}
                              style={{ paddingLeft: `${8 + (cat.depth - 1) * 22}px` }}
                            >
                              <input
                                type="checkbox"
                                data-testid={`prod-subcategory-${cat.id}`}
                                checked={isChecked}
                                onChange={(e) => {
                                  const currentCategories = formData.categories || [];
                                  if (e.target.checked) {
                                    setFormData({
                                      ...formData,
                                      categories: [...currentCategories, cat.name],
                                    });
                                  } else {
                                    setFormData({
                                      ...formData,
                                      categories: currentCategories.filter((c) => c !== cat.name),
                                    });
                                  }
                                }}
                                className="w-4 h-4 text-[#a7cf26] rounded focus:ring-[#a7cf26]"
                              />
                              <span className="text-sm">
                                {cat.depth > 1 && (
                                  <span className="text-gray-400 mr-1">{'↳ '.repeat(cat.depth - 1)}</span>
                                )}
                                {cat.name}
                              </span>
                            </label>
                          );
                        })}
                      </div>
                      <p className="text-xs text-gray-500 mt-1">
                        Produsul va apărea în categoria principală + toate sub-categoriile bifate (orice nivel).
                      </p>
                    </div>
                  );
                })()}

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Brand</label>
                  <select
                    value={formData.brandId}
                    onChange={(e) => setFormData({...formData, brandId: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  >
                    <option value="">Fără brand</option>
                    {brands.map(brand => (
                      <option key={brand.id} value={brand.id}>{brand.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Descriere (RO)</label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                    placeholder="Descriere în română"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descriere (RU) 🇷🇺
                  </label>
                  <textarea
                    value={formData.descriptionRu}
                    onChange={(e) => setFormData({...formData, descriptionRu: e.target.value})}
                    rows="3"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                    placeholder="Описание на русском"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preț (MDL) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Preț Original (MDL)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.originalPrice}
                    onChange={(e) => setFormData({...formData, originalPrice: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Stoc *</label>
                  <input
                    type="number"
                    required
                    value={formData.available}
                    onChange={(e) => setFormData({...formData, available: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Magazin</label>
                  <input
                    type="text"
                    value={formData.storeName}
                    onChange={(e) => setFormData({...formData, storeName: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Magazin (RU) 🇷🇺</label>
                  <input
                    type="text"
                    value={formData.storeNameRu}
                    onChange={(e) => setFormData({...formData, storeNameRu: e.target.value})}
                    placeholder="ex: Магазин"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
              </div>

              {/* SKU Field */}
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">SKU (Cod Produs)</label>
                <input
                  type="text"
                  value={formData.sku}
                  onChange={(e) => setFormData({...formData, sku: e.target.value})}
                  placeholder="ex: PROD-12345"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                />
                <p className="text-xs text-gray-500 mt-1">Opțional - Codul unic al produsului</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Badge (RO)</label>
                  <input
                    type="text"
                    value={formData.badge}
                    onChange={(e) => setFormData({...formData, badge: e.target.value})}
                    placeholder="ex: REDUCERE, 15% OFF"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">Badge (RU) 🇷🇺</label>
                  <input
                    type="text"
                    value={formData.badgeRu}
                    onChange={(e) => setFormData({...formData, badgeRu: e.target.value})}
                    placeholder="напр: СКИДКА, 15% OFF"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                  />
                </div>
              </div>

              {/* Specifications Section */}
              <div className="border-t pt-6">
                <div className="flex justify-between items-center mb-4">
                  <label className="block text-sm font-bold text-gray-700">Specificații Custom (Max 10)</label>
                  <button
                    type="button"
                    onClick={addSpecification}
                    disabled={specifications.length >= 10}
                    className="text-[#a7cf26] hover:text-[#96bc21] font-semibold text-sm flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Plus className="w-4 h-4" />
                    Adaugă Specificație
                  </button>
                </div>
                
                {specifications.length > 0 && (
                  <div className="space-y-3">
                    {specifications.map((spec, index) => (
                      <div key={index} className="flex gap-2">
                        <input
                          type="text"
                          placeholder="Titlu (ex: Material)"
                          value={spec.title}
                          onChange={(e) => updateSpecification(index, 'title', e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                        />
                        <input
                          type="text"
                          placeholder="Valoare (ex: Bumbac 100%)"
                          value={spec.value}
                          onChange={(e) => updateSpecification(index, 'value', e.target.value)}
                          className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#a7cf26]"
                        />
                        <button
                          type="button"
                          onClick={() => removeSpecification(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {specifications.length === 0 && (
                  <p className="text-sm text-gray-500 text-center py-4">Nicio specificație adăugată</p>
                )}
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
                >
                  {editingProduct ? 'Actualizează' : 'Creează'}
                </button>
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingProduct(null); resetForm(); }}
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

export default ProductsManagement;