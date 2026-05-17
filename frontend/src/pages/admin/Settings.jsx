import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import {
  Save,
  Plus,
  X,
  Menu as MenuIcon,
  ArrowUp,
  ArrowDown,
  Folder,
  Image as ImageIcon,
  Download,
  Upload
} from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const Settings = () => {
  const { getAuthHeaders } = useAdmin();
  const [loading, setLoading] = useState(true);

  const [menuItems, setMenuItems] = useState([]);
  const [categoryItems, setCategoryItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pages, setPages] = useState([]);

  const [featuredCategoryId, setFeaturedCategoryId] = useState('');
  const [secondaryFeaturedCategoryId, setSecondaryFeaturedCategoryId] = useState('');

  const [websiteName, setWebsiteName] = useState('AgroSmart');
  const [favicon, setFavicon] = useState('');

  const [importFile, setImportFile] = useState(null);
  const [importing, setImporting] = useState(false);
  const [exporting, setExporting] = useState(false);

  const [newMainItem, setNewMainItem] = useState({
    name: '',
    nameRu: '',
    url: '',
    type: 'link',
    categoryId: '',
    pageId: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, categoriesRes, pagesRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/categories`),
        axios.get(`${API}/pages`)
      ]);

      setMenuItems(settingsRes.data.menuItems || []);
      setCategoryItems(settingsRes.data.categoryMenuItems || []);
      setFeaturedCategoryId(settingsRes.data.featuredCategoryId || '');
      setSecondaryFeaturedCategoryId(settingsRes.data.secondaryFeaturedCategoryId || '');
      setWebsiteName(settingsRes.data.websiteName || 'AgroSmart');
      setFavicon(settingsRes.data.favicon || '');
      setCategories(categoriesRes.data || []);
      setPages(pagesRes.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca datele',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const getParentCategories = () => {
    return categories.filter((cat) => !cat.parentId);
  };

  const getChildCategories = (parentId) => {
    return categories.filter((cat) => cat.parentId === parentId);
  };

  const addCategoryToMenu = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);

    if (!category) return;

    if (categoryItems.find((item) => item.categoryId === categoryId)) {
      toast({
        title: 'Info',
        description: 'Categoria este deja în meniu',
        variant: 'destructive'
      });
      return;
    }

    const children = getChildCategories(categoryId);

    const parentItem = {
      id: `cat_${Date.now()}`,
      name: category.name,
      nameRu: category.nameRu || '',
      url: `/category/${category.slug}`,
      type: 'category',
      icon: category.icon || category.image,
      categoryId: category.id,
      hasChildren: children.length > 0,
      children: children.map((child, index) => ({
        id: `cat_${Date.now()}_child_${index}`,
        name: child.name,
        nameRu: child.nameRu || '',
        url: `/category/${child.slug}`,
        type: 'category',
        icon: child.icon || child.image,
        categoryId: child.id,
        parentId: category.id
      }))
    };

    setCategoryItems([...categoryItems, parentItem]);

    toast({
      title: 'Succes',
      description:
        children.length > 0
          ? `Categorie adăugată cu ${children.length} subcategorii`
          : 'Categorie adăugată'
    });
  };

  const moveCategoryItem = (index, direction) => {
    const newItems = [...categoryItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    if (targetIndex < 0 || targetIndex >= newItems.length) return;

    [newItems[index], newItems[targetIndex]] = [
      newItems[targetIndex],
      newItems[index]
    ];

    setCategoryItems(newItems);
  };

  const removeCategoryItem = (id) => {
    setCategoryItems(categoryItems.filter((item) => item.id !== id));

    toast({
      title: 'Succes',
      description: 'Categoria a fost scoasă din meniu'
    });
  };

  const handleSave = async () => {
    try {
      await axios.post(
        `${API}/settings`,
        {
          menuItems,
          categoryMenuItems: categoryItems,
          featuredCategoryId,
          secondaryFeaturedCategoryId,
          websiteName,
          favicon
        },
        getAuthHeaders()
      );

      toast({
        title: 'Succes',
        description: 'Setările au fost salvate!'
      });
    } catch (error) {
      console.error('Error saving settings:', error);

      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva setările',
        variant: 'destructive'
      });
    }
  };

  const handleExportProducts = async () => {
    try {
      setExporting(true);

      const response = await axios.get(`${API}/admin/products/export`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');

      link.href = url;
      link.setAttribute(
        'download',
        `products_${new Date().toISOString().split('T')[0]}.xlsx`
      );

      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast({
        title: 'Succes',
        description: 'Produsele au fost exportate!'
      });
    } catch (error) {
      console.error('Error exporting products:', error);

      toast({
        title: 'Eroare',
        description: 'Nu s-au putut exporta produsele',
        variant: 'destructive'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleImportProducts = async () => {
    if (!importFile) {
      toast({
        title: 'Eroare',
        description: 'Selectează un fișier Excel',
        variant: 'destructive'
      });
      return;
    }

    try {
      setImporting(true);

      const formData = new FormData();
      formData.append('file', importFile);

      const response = await axios.post(`${API}/admin/products/import`, formData, {
        ...getAuthHeaders(),
        headers: {
          ...getAuthHeaders().headers,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: 'Succes',
        description: response.data.message || 'Produsele au fost importate!'
      });

      setImportFile(null);

      const input = document.getElementById('import-file-input');
      if (input) input.value = '';
    } catch (error) {
      console.error('Error importing products:', error);

      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Nu s-au putut importa produsele',
        variant: 'destructive'
      });
    } finally {
      setImporting(false);
    }
  };

  const getCategoryIcon = (item) => {
    if (!item.icon) {
      return (
        <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
          <Folder className="w-5 h-5 text-gray-400" />
        </div>
      );
    }

    if (item.icon.startsWith('data:image')) {
      return (
        <img
          src={item.icon}
          alt=""
          className="w-11 h-11 rounded-2xl object-cover border border-gray-100 bg-gray-50"
        />
      );
    }

    return (
      <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center text-xl">
        {item.icon}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  const availableParentCategories = getParentCategories();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
              Setări
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Gestionează meniul de categorii, carousel-urile homepage și import/export produse.
            </p>
          </div>

          <button
            onClick={handleSave}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Save className="w-5 h-5" />
            Salvează Setările
          </button>
        </div>
      </div>

      {/* Configurare Website - comentat temporar */}
      {/*
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        Configurare Website
      </div>
      */}

      {/* Meniu Principal - comentat temporar */}
      {/*
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
        Meniu Principal
      </div>
      */}

      {/* Layout principal */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.4fr_0.8fr] gap-6">
        {/* Meniu Toate Categoriile */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
                <MenuIcon className="w-5 h-5" />
              </div>

              <div>
                <h3 className="text-lg font-extrabold text-gray-900">
                  Meniu Toate Categoriile
                </h3>
                <p className="text-sm text-gray-500">
                  Categoriile afișate în dropdown-ul „Toate categoriile”
                </p>
              </div>
            </div>

            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-brand-50 text-brand-700 ring-1 ring-brand-100">
              {categoryItems.length} categorii active
            </span>
          </div>

          {categoryItems.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <div className="mx-auto w-16 h-16 rounded-2xl bg-gray-50 flex items-center justify-center mb-4">
                <Folder className="w-8 h-8 text-gray-300" />
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Nu ai categorii în meniu
              </h3>

              <p className="text-gray-500">
                Adaugă categorii din lista din dreapta.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60">
                  <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Categorie</th>
                    <th className="px-6 py-4 font-semibold">URL</th>
                    <th className="px-6 py-4 font-semibold">Subcategorii</th>
                    <th className="px-6 py-4 font-semibold">Ordine</th>
                    <th className="px-6 py-4 font-semibold text-right pr-8">
                      Acțiuni
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  {categoryItems.map((item, index) => (
                    <tr
                      key={item.id}
                      className="bg-white hover:bg-brand-50/40 transition"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {getCategoryIcon(item)}

                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900 truncate max-w-[240px]">
                              {item.name}
                            </div>

                            <div className="text-xs text-gray-500 truncate max-w-[240px]">
                              {item.nameRu ? `🇷🇺 ${item.nameRu}` : 'Fără nume RU'}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-full bg-gray-50 text-gray-700 ring-1 ring-gray-100 px-3 py-1 text-xs font-semibold">
                          {item.url}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {item.children && item.children.length > 0 ? (
                          <div className="space-y-1">
                            <span className="inline-flex rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 px-3 py-1 text-xs font-bold">
                              {item.children.length} subcategorii
                            </span>

                            <div className="text-xs text-gray-500 max-w-[260px] truncate">
                              {item.children.map((child) => child.name).join(', ')}
                            </div>
                          </div>
                        ) : (
                          <span className="text-sm text-gray-400">—</span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => moveCategoryItem(index, 'up')}
                            disabled={index === 0}
                            title="Mută sus"
                            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowUp className="w-4 h-4" />
                          </button>

                          <button
                            onClick={() => moveCategoryItem(index, 'down')}
                            disabled={index === categoryItems.length - 1}
                            title="Mută jos"
                            className="p-2 rounded-full bg-gray-50 text-gray-600 hover:bg-brand-50 hover:text-brand-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                          >
                            <ArrowDown className="w-4 h-4" />
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex justify-end pr-2">
                          <button
                            onClick={() => removeCategoryItem(item.id)}
                            title="Șterge"
                            className="p-2.5 rounded-full bg-rose-50 text-rose-600 hover:bg-rose-100 transition"
                          >
                            <X className="w-4 h-4" />
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

        {/* Add Categories Panel */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-gray-100">
            <h3 className="text-lg font-extrabold text-gray-900">
              Adaugă categorii
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              Click pe categorie pentru a o adăuga în meniul „Toate categoriile”.
            </p>
          </div>

          <div className="p-4 max-h-[620px] overflow-y-auto space-y-3">
            {availableParentCategories.map((cat) => {
              const children = getChildCategories(cat.id);
              const isAlreadyAdded = categoryItems.find(
                (item) => item.categoryId === cat.id
              );

              return (
                <button
                  key={cat.id}
                  type="button"
                  disabled={!!isAlreadyAdded}
                  onClick={() => addCategoryToMenu(cat.id)}
                  className={`w-full text-left rounded-2xl border p-4 transition ${
                    isAlreadyAdded
                      ? 'bg-gray-50 border-gray-100 opacity-60 cursor-not-allowed'
                      : 'bg-white border-gray-100 hover:border-brand-200 hover:bg-brand-50/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {(cat.image || cat.icon) &&
                      (cat.image?.startsWith('data:image') ||
                        cat.icon?.startsWith('data:image')) ? (
                        <img
                          src={cat.image || cat.icon}
                          alt=""
                          className="w-11 h-11 rounded-2xl object-cover bg-gray-50 border border-gray-100"
                        />
                      ) : (
                        <div className="w-11 h-11 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center">
                          <Folder className="w-5 h-5 text-gray-400" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="font-semibold text-gray-900 truncate">
                          {cat.name}
                        </div>

                        <div className="text-xs text-gray-500">
                          {children.length > 0
                            ? `${children.length} subcategorii incluse automat`
                            : 'Fără subcategorii'}
                        </div>
                      </div>
                    </div>

                    {isAlreadyAdded ? (
                      <span className="shrink-0 rounded-full bg-green-50 text-green-700 ring-1 ring-green-100 px-3 py-1 text-xs font-bold">
                        Adăugat
                      </span>
                    ) : (
                      <span className="shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white flex items-center justify-center shadow-md shadow-brand-200">
                        <Plus className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  {children.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {children.slice(0, 4).map((child) => (
                        <span
                          key={child.id}
                          className="rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-100 px-2.5 py-1 text-[11px] font-semibold"
                        >
                          {child.name}
                        </span>
                      ))}

                      {children.length > 4 && (
                        <span className="rounded-full bg-gray-50 text-gray-600 ring-1 ring-gray-100 px-2.5 py-1 text-[11px] font-semibold">
                          +{children.length - 4}
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Homepage Carousels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <Folder className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Carousel produse cu reducere
              </h3>
              <p className="text-sm text-gray-500">
                Categoria afișată în primul carousel de pe homepage.
              </p>
            </div>
          </div>

          <select
            value={featuredCategoryId}
            onChange={(e) => setFeaturedCategoryId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          >
            <option value="">Fără categorie / produse aleatorii</option>
            {getParentCategories().map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <Folder className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Al doilea carousel produse
              </h3>
              <p className="text-sm text-gray-500">
                Categoria pentru carousel-ul afișat deasupra footerului.
              </p>
            </div>
          </div>

          <select
            data-testid="secondary-featured-category-select"
            value={secondaryFeaturedCategoryId}
            onChange={(e) => setSecondaryFeaturedCategoryId(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
          >
            <option value="">Ascunde / produse aleatorii</option>
            {getParentCategories().map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Import / Export */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <ImageIcon className="w-5 h-5" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-gray-900">
                Import / Export Produse
              </h3>
              <p className="text-sm text-gray-500">
                Exportă sau importă produse prin fișier Excel.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-gray-100">
          <div className="p-6">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-gray-400" />
              Exportă produse
            </h4>

            <p className="text-sm text-gray-500 mb-11">
              Descarcă rapid toate produsele salvate în baza de date într-un fișier Excel complet și ușor de gestionat.
            </p>

            <button
              onClick={handleExportProducts}
              disabled={exporting}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {exporting ? 'Se exportă...' : 'Exportă în Excel'}
            </button>
          </div>

          <div className="p-6">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-gray-400" />
              Importă produse
            </h4>

            <p className="text-sm text-gray-500 mb-4">
              Încarcă un fișier Excel. Produsele existente vor fi actualizate.
            </p>

            <div className="space-y-3">
              <input
                id="import-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
              />

              <button
                onClick={handleImportProducts}
                disabled={importing || !importFile}
                className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 text-white py-3 rounded-xl hover:bg-black transition font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {importing ? 'Se importă...' : 'Importă din Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="px-6 py-4 bg-gray-50/60 border-t border-gray-100">
          <p className="text-xs text-gray-600">
            Format recomandat: ID, Name, Description, Price, Stock, Category ID, Brand ID, SKU,
            Is Active, Images, Specifications.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Settings;