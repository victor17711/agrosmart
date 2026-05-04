import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Save, Plus, X, Menu as MenuIcon, ArrowUp, ArrowDown, Folder, Globe, Image as ImageIcon, Download, Upload } from 'lucide-react';
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
      setWebsiteName(settingsRes.data.websiteName || 'AgroSmart');
      setFavicon(settingsRes.data.favicon || '');
      setCategories(categoriesRes.data);
      setPages(pagesRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca datele', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const getParentCategories = () => {
    return categories.filter(cat => !cat.parentId);
  };

  const getChildCategories = (parentId) => {
    return categories.filter(cat => cat.parentId === parentId);
  };

  const addCategoryToMenu = (categoryId) => {
    const category = categories.find(c => c.id === categoryId);
    if (!category) return;

    // Check if already added
    if (categoryItems.find(item => item.categoryId === categoryId)) {
      toast({ title: 'Info', description: 'Categoria este deja în meniu', variant: 'destructive' });
      return;
    }

    const children = getChildCategories(categoryId);
    
    // Create parent item with children info
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
    
    const message = children.length > 0 
      ? `Categorie adăugată cu ${children.length} subcategorii`
      : 'Categorie adăugată';
    toast({ title: 'Succes', description: message });
  };

  const addMainMenuItem = () => {
    if (!newMainItem.name) {
      toast({ title: 'Eroare', description: 'Completează numele', variant: 'destructive' });
      return;
    }

    let url = newMainItem.url;
    let icon = null;
    
    if (newMainItem.type === 'category' && newMainItem.categoryId) {
      const category = categories.find(c => c.id === newMainItem.categoryId);
      if (category) {
        url = `/category/${category.slug}`;
        icon = category.icon || category.image;
      }
    }
    
    if (newMainItem.type === 'page' && newMainItem.pageId) {
      const page = pages.find(p => p.id === newMainItem.pageId);
      if (page) {
        url = `/page/${page.slug}`;
      }
    }

    if (!url) {
      toast({ title: 'Eroare', description: 'Completează URL sau selectează o categorie/pagină', variant: 'destructive' });
      return;
    }

    const newItem = {
      id: `main_${Date.now()}`,
      name: newMainItem.name,
      nameRu: newMainItem.nameRu || '',
      url: url,
      type: newMainItem.type,
      icon: icon,
      categoryId: newMainItem.categoryId || null,
      pageId: newMainItem.pageId || null
    };

    setMenuItems([...menuItems, newItem]);
    setNewMainItem({ name: '', nameRu: '', url: '', type: 'link', categoryId: '', pageId: '' });
    toast({ title: 'Succes', description: 'Item adăugat în meniul principal' });
  };

  const moveMainItem = (index, direction) => {
    const newItems = [...menuItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setMenuItems(newItems);
  };

  const moveCategoryItem = (index, direction) => {
    const newItems = [...categoryItems];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setCategoryItems(newItems);
  };

  const removeMainItem = (id) => {
    setMenuItems(menuItems.filter(item => item.id !== id));
    toast({ title: 'Succes', description: 'Item șters din meniul principal' });
  };

  const removeCategoryItem = (id) => {
    setCategoryItems(categoryItems.filter(item => item.id !== id));
    toast({ title: 'Succes', description: 'Item șters din meniul categorii' });
  };

  const handleSave = async () => {
    try {
      await axios.post(`${API}/settings`, {
        menuItems,
        categoryMenuItems: categoryItems,
        featuredCategoryId,
        websiteName,
        favicon
      }, getAuthHeaders());
      
      toast({ title: 'Succes', description: 'Setările au fost salvate!' });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({ title: 'Eroare', description: 'Nu s-au putut salva setările', variant: 'destructive' });
    }
  };

  const handleExportProducts = async () => {
    try {
      setExporting(true);
      const response = await axios.get(`${API}/admin/products/export`, {
        ...getAuthHeaders(),
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `products_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      toast({ title: 'Succes', description: 'Produsele au fost exportate!' });
    } catch (error) {
      console.error('Error exporting products:', error);
      toast({ title: 'Eroare', description: 'Nu s-au putut exporta produsele', variant: 'destructive' });
    } finally {
      setExporting(false);
    }
  };

  const handleImportProducts = async () => {
    if (!importFile) {
      toast({ title: 'Eroare', description: 'Selectează un fișier Excel', variant: 'destructive' });
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
      
      // Reset file input
      setImportFile(null);
      document.getElementById('import-file-input').value = '';
      
    } catch (error) {
      console.error('Error importing products:', error);
      const errorMsg = error.response?.data?.detail || 'Nu s-au putut importa produsele';
      toast({ title: 'Eroare', description: errorMsg, variant: 'destructive' });
    } finally {
      setImporting(false);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Se încarcă...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 text-white">
        <h2 className="text-3xl font-bold mb-2">Setări</h2>
        <p className="text-teal-100">Gestionează meniurile, numele website-ului și favicon-ul</p>
      </div>

      {/* Website Name & Favicon */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Globe className="w-6 h-6 text-teal-600" />
          Configurare Website
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Website Name */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Nume Website
            </label>
            <input
              type="text"
              value={websiteName}
              onChange={(e) => setWebsiteName(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="ex: AgroSmart Shop"
            />
            <p className="text-xs text-gray-500 mt-1">
              Acest nume va apărea în titlul paginii
            </p>
          </div>

          {/* Favicon */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-2">
              Favicon (URL)
            </label>
            {favicon && (
              <div className="mb-2 flex items-center gap-3 p-2 bg-gray-50 rounded-lg">
                <img 
                  src={favicon} 
                  alt="Favicon preview" 
                  className="w-6 h-6 object-contain"
                  onError={(e) => {
                    e.target.style.display = 'none';
                  }}
                />
                <span className="text-xs text-gray-600">Preview favicon</span>
              </div>
            )}
            <input
              type="url"
              value={favicon}
              onChange={(e) => setFavicon(e.target.value)}
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              placeholder="https://example.com/favicon.ico"
            />
            <p className="text-xs text-gray-500 mt-1">
              Link către imaginea favicon (32x32px sau 64x64px)
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Main Menu */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-teal-600" />
            Meniu Principal
          </h3>
          
          <div className="space-y-2 mb-4">
            {menuItems.map((item, index) => (
              <div key={item.id} className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                {/* Reorder buttons */}
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveMainItem(index, 'up')}
                    disabled={index === 0}
                    className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'}`}
                    title="Mută sus"
                  >
                    <ArrowUp className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => moveMainItem(index, 'down')}
                    disabled={index === menuItems.length - 1}
                    className={`p-1 rounded ${index === menuItems.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'}`}
                    title="Mută jos"
                  >
                    <ArrowDown className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2 flex-1">
                  {item.icon && (
                    item.icon.startsWith('data:image') ? (
                      <img src={item.icon} alt="" className="w-8 h-8 rounded object-cover" />
                    ) : (
                      <span className="text-xl">{item.icon}</span>
                    )
                  )}
                  <div>
                    <div className="font-semibold text-gray-900">{item.name}</div>
                    <div className="text-xs text-gray-500">{item.url}</div>
                  </div>
                </div>

                <button
                  onClick={() => removeMainItem(item.id)}
                  className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                  title="Șterge"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>

          <div className="space-y-3 p-4 bg-teal-50 rounded-xl">
            <h4 className="font-bold text-gray-900">Adaugă Item Nou</h4>
            
            <select
              value={newMainItem.type}
              onChange={(e) => setNewMainItem({...newMainItem, type: e.target.value, url: '', categoryId: '', pageId: ''})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            >
              <option value="link">Link Custom</option>
              <option value="category">Categorie</option>
              <option value="page">Pagină</option>
            </select>

            <input
              type="text"
              placeholder="Nume (ex: Acasă, Contact)"
              value={newMainItem.name}
              onChange={(e) => setNewMainItem({...newMainItem, name: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            <input
              type="text"
              placeholder="Nume RU 🇷🇺 (ex: Главная, Контакты)"
              value={newMainItem.nameRu}
              onChange={(e) => setNewMainItem({...newMainItem, nameRu: e.target.value})}
              className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
            />

            {newMainItem.type === 'link' && (
              <input
                type="text"
                placeholder="URL (ex: /contact, /about)"
                value={newMainItem.url}
                onChange={(e) => setNewMainItem({...newMainItem, url: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              />
            )}

            {newMainItem.type === 'category' && (
              <select
                value={newMainItem.categoryId}
                onChange={(e) => setNewMainItem({...newMainItem, categoryId: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selectează o categorie</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.parentId ? '  ↳ ' : ''}{cat.name}
                  </option>
                ))}
              </select>
            )}

            {newMainItem.type === 'page' && (
              <select
                value={newMainItem.pageId}
                onChange={(e) => setNewMainItem({...newMainItem, pageId: e.target.value})}
                className="w-full px-4 py-2 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
              >
                <option value="">Selectează o pagină</option>
                {pages.map((page) => (
                  <option key={page.id} value={page.id}>
                    {page.title}
                  </option>
                ))}
              </select>
            )}

            <button
              onClick={addMainMenuItem}
              className="w-full bg-teal-600 text-white py-2 rounded-xl hover:bg-teal-700 transition font-semibold flex items-center justify-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Adaugă
            </button>
          </div>
        </div>

        {/* Categories Menu */}
        <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
          <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <MenuIcon className="w-6 h-6 text-teal-600" />
            Meniu Toate Categoriile
          </h3>
          
          <p className="text-sm text-gray-600 mb-4">
            Acestea vor apărea în dropdown-ul "Toate categoriile" din navbar
          </p>

          <div className="space-y-2 mb-4 max-h-96 overflow-y-auto">
            {categoryItems.map((item, index) => (
              <div key={item.id} className="border-b last:border-b-0 pb-2">
                <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-xl hover:bg-gray-100 transition">
                  {/* Reorder buttons */}
                  <div className="flex flex-col gap-1">
                    <button
                      onClick={() => moveCategoryItem(index, 'up')}
                      disabled={index === 0}
                      className={`p-1 rounded ${index === 0 ? 'text-gray-300' : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'}`}
                      title="Mută sus"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => moveCategoryItem(index, 'down')}
                      disabled={index === categoryItems.length - 1}
                      className={`p-1 rounded ${index === categoryItems.length - 1 ? 'text-gray-300' : 'text-gray-600 hover:bg-teal-100 hover:text-teal-700'}`}
                      title="Mută jos"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2 flex-1">
                    {item.icon && (
                      item.icon.startsWith('data:image') ? (
                        <img src={item.icon} alt="" className="w-8 h-8 rounded object-cover" />
                      ) : (
                        <span className="text-xl">{item.icon}</span>
                      )
                    )}
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">
                        {item.name}
                        {item.hasChildren && item.children && (
                          <span className="ml-2 text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                            {item.children.length} subcategorii
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-gray-500">{item.url}</div>
                      
                      {/* Show children */}
                      {item.children && item.children.length > 0 && (
                        <div className="mt-2 ml-4 space-y-1">
                          {item.children.map((child) => (
                            <div key={child.id} className="flex items-center gap-2 text-sm text-gray-600">
                              <span className="text-gray-400">↳</span>
                              {child.icon && (
                                child.icon.startsWith('data:image') ? (
                                  <img src={child.icon} alt="" className="w-5 h-5 rounded object-cover" />
                                ) : (
                                  <span className="text-sm">{child.icon}</span>
                                )
                              )}
                              <span>{child.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => removeCategoryItem(item.id)}
                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    title="Șterge"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-3 p-4 bg-teal-50 rounded-xl">
            <h4 className="font-bold text-gray-900">Adaugă Categorie</h4>
            
            <div className="space-y-2 max-h-48 overflow-y-auto border-2 border-gray-200 rounded-xl bg-white">
              {getParentCategories().map((cat) => {
                const children = getChildCategories(cat.id);
                const hasChildren = children.length > 0;
                const isAlreadyAdded = categoryItems.find(item => item.categoryId === cat.id);
                
                return (
                  <div key={cat.id} className="border-b last:border-b-0">
                    <div 
                      className={`flex items-center justify-between p-3 transition ${
                        isAlreadyAdded 
                          ? 'bg-gray-100 cursor-not-allowed opacity-50' 
                          : 'hover:bg-teal-50 cursor-pointer'
                      }`}
                      onClick={() => !isAlreadyAdded && addCategoryToMenu(cat.id)}
                    >
                      <div className="flex items-center gap-2">
                        {(cat.image || cat.icon) && (
                          (cat.image?.startsWith('data:image') || cat.icon?.startsWith('data:image')) ? (
                            <img src={cat.image || cat.icon} alt="" className="w-8 h-8 rounded object-cover" />
                          ) : (
                            <span className="text-lg">{cat.icon}</span>
                          )
                        )}
                        <span className="font-medium text-gray-900">{cat.name}</span>
                        {hasChildren && (
                          <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded-full">
                            +{children.length}
                          </span>
                        )}
                        {isAlreadyAdded && (
                          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">
                            ✓ Adăugat
                          </span>
                        )}
                      </div>
                      {!isAlreadyAdded && <Plus className="w-5 h-5 text-teal-600" />}
                    </div>
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-600">
              Click pe o categorie pentru a o adăuga. Categoriile cu subcategorii (+N) le vor include automat pentru hover menu.
            </p>
          </div>
        </div>
      </div>

      {/* Featured Category for Homepage */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Folder className="w-6 h-6 text-teal-600" />
          Categorie carousel pagina principala
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Selectează categoria de produse care va apărea în carousel-ul "Produse cu reducere" pe pagina principală
        </p>
        
        <div className="max-w-md">
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Categorie
          </label>
          <select
            value={featuredCategoryId}
            onChange={(e) => setFeaturedCategoryId(e.target.value)}
            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
          >
            <option value="">Fără categorie (produse aleatorii)</option>
            {getParentCategories().map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          <p className="text-xs text-gray-500 mt-2">
            Produsele din această categorie vor apărea în carousel pe homepage
          </p>
        </div>
      </div>

      {/* Import/Export Products */}
      <div className="bg-white rounded-2xl p-6 border-2 border-gray-100">
        <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
          <ImageIcon className="w-6 h-6 text-teal-600" />
          Import / Export Produse
        </h3>
        <p className="text-sm text-gray-600 mb-6">
          Exportă toate produsele într-un fișier Excel sau importă produse dintr-un fișier Excel
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Export Products */}
          <div className="p-4 bg-blue-50 rounded-xl border-2 border-blue-100">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Download className="w-5 h-5 text-blue-600" />
              Exportă Produse
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Descarcă toate produsele din baza de date în format Excel (.xlsx)
            </p>
            <button
              onClick={handleExportProducts}
              disabled={exporting}
              className="w-full bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="w-5 h-5" />
              {exporting ? 'Se exportă...' : 'Exportă în Excel'}
            </button>
          </div>

          {/* Import Products */}
          <div className="p-4 bg-green-50 rounded-xl border-2 border-green-100">
            <h4 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Upload className="w-5 h-5 text-green-600" />
              Importă Produse
            </h4>
            <p className="text-sm text-gray-600 mb-4">
              Încarcă un fișier Excel cu produse. Produsele existente vor fi actualizate, cele noi vor fi adăugate.
            </p>
            <div className="space-y-3">
              <input
                id="import-file-input"
                type="file"
                accept=".xlsx,.xls"
                onChange={(e) => setImportFile(e.target.files[0])}
                className="w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-100 file:text-green-700 hover:file:bg-green-200"
              />
              <button
                onClick={handleImportProducts}
                disabled={importing || !importFile}
                className="w-full bg-green-600 text-white py-3 rounded-xl hover:bg-green-700 transition font-semibold flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Upload className="w-5 h-5" />
                {importing ? 'Se importă...' : 'Importă din Excel'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-100 rounded-xl">
          <p className="text-sm text-gray-700">
            <strong>ℹ️ Format Excel:</strong> Fișierul trebuie să conțină coloanele: ID, Name, Description, Price, Stock, Category ID, Brand ID, SKU, Is Active, Images (comma-separated), Specifications (JSON)
          </p>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          className="bg-gradient-to-r from-teal-600 to-teal-700 text-white px-8 py-3 rounded-xl hover:from-teal-700 hover:to-teal-800 transition font-semibold flex items-center gap-2"
        >
          <Save className="w-5 h-5" />
          Salvează Setările
        </button>
      </div>
    </div>
  );
};

export default Settings;
