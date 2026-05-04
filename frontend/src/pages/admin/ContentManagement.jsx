import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import { Image, Plus, Edit, Trash2, Save, X, ChevronDown, ChevronUp, Images, HelpCircle, Phone, Layout, ArrowUp, ArrowDown } from 'lucide-react';
import HomeTabsEditor from './HomeTabsEditor';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContentManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [loading, setLoading] = useState(true);
  const [banners, setBanners] = useState([]);
  const [albums, setAlbums] = useState([]);
  const [faqs, setFaqs] = useState([]);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: '',
    facebook: '',
    instagram: '',
    tiktok: ''
  });
  const [showBannerModal, setShowBannerModal] = useState(false);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showFaqModal, setShowFaqModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState(null);
  const [editingAlbum, setEditingAlbum] = useState(null);
  const [editingFaq, setEditingFaq] = useState(null);
  const [expandedSections, setExpandedSections] = useState({
    heroBanners: true,
    serviceAlbums: true,
    homeTabs: true,
    faqs: true,
    contactInfo: true
  });
  const [bannerForm, setBannerForm] = useState({
    title: '',
    titleRu: '',
    subtitle: '',
    subtitleRu: '',
    description: '',
    descriptionRu: '',
    buttonText: '',
    buttonTextRu: '',
    buttonLink: '',
    image: '',
    badge: '',
    badgeRu: '',
    order: 0
  });
  const [albumForm, setAlbumForm] = useState({
    title: '',
    coverImage: '',
    galleryImages: []
  });
  const [uploadingCover, setUploadingCover] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);
  const [faqForm, setFaqForm] = useState({
    question: '',
    questionRu: '',
    answer: '',
    answerRu: ''
  });
  const [tempGalleryUrl, setTempGalleryUrl] = useState('');
  const [categories, setCategories] = useState([]);
  const [bestSellersTabs, setBestSellersTabs] = useState([]);
  const [freshFindsTabs, setFreshFindsTabs] = useState([]);

  useEffect(() => {
    fetchContent();
  }, []);

  const fetchContent = async () => {
    try {
      const [response, catRes] = await Promise.all([
        axios.get(`${API}/settings`),
        axios.get(`${API}/categories`)
      ]);
      setBanners(response.data.heroBanners || []);
      setAlbums(response.data.albums || []);
      setFaqs(response.data.faqs || []);
      setContactInfo(response.data.contactInfo || {
        phone: '',
        email: '',
        address: '',
        hours: '',
        facebook: '',
        instagram: '',
        tiktok: ''
      });
      setBestSellersTabs(response.data.bestSellersTabs || []);
      setFreshFindsTabs(response.data.freshFindsTabs || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setBanners([]);
      setAlbums([]);
      setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (updatedBanners, updatedAlbums = null, updatedFaqs = null, updatedContactInfo = null) => {
    try {
      // Fetch current settings first
      const currentSettings = await axios.get(`${API}/settings`);
      
      // Merge with existing settings
      const mergedSettings = {
        ...currentSettings.data,
        heroBanners: updatedBanners
      };

      // Update albums if provided
      if (updatedAlbums !== null) {
        mergedSettings.albums = updatedAlbums;
      }

      // Update FAQs if provided
      if (updatedFaqs !== null) {
        mergedSettings.faqs = updatedFaqs;
      }

      // Update Contact Info if provided
      if (updatedContactInfo !== null) {
        mergedSettings.contactInfo = updatedContactInfo;
      }

      await axios.post(`${API}/settings`, mergedSettings, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  // Save home section tabs (BestSellers / FreshFinds)
  const saveHomeTabs = async (updatedBestSellers, updatedFreshFinds) => {
    try {
      const currentSettings = await axios.get(`${API}/settings`);
      const merged = {
        ...currentSettings.data,
        bestSellersTabs: updatedBestSellers,
        freshFindsTabs: updatedFreshFinds
      };
      await axios.post(`${API}/settings`, merged, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error saving home tabs:', error);
      throw error;
    }
  };

  const handleAddTab = async (section, categoryId) => {
    if (!categoryId) return;
    const currentList = section === 'best' ? bestSellersTabs : freshFindsTabs;
    if (currentList.some((t) => t.categoryId === categoryId)) {
      toast({ title: 'Atenție', description: 'Această categorie e deja în listă', variant: 'destructive' });
      return;
    }
    const newList = [
      ...currentList,
      { categoryId, label: '', labelRu: '', order: currentList.length }
    ];
    try {
      if (section === 'best') {
        await saveHomeTabs(newList, freshFindsTabs);
        setBestSellersTabs(newList);
      } else {
        await saveHomeTabs(bestSellersTabs, newList);
        setFreshFindsTabs(newList);
      }
      toast({ title: 'Succes', description: 'Tab adăugat!' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut salva', variant: 'destructive' });
    }
  };

  const handleRemoveTab = async (section, categoryId) => {
    const currentList = section === 'best' ? bestSellersTabs : freshFindsTabs;
    const newList = currentList.filter((t) => t.categoryId !== categoryId);
    try {
      if (section === 'best') {
        await saveHomeTabs(newList, freshFindsTabs);
        setBestSellersTabs(newList);
      } else {
        await saveHomeTabs(bestSellersTabs, newList);
        setFreshFindsTabs(newList);
      }
      toast({ title: 'Succes', description: 'Tab eliminat!' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut salva', variant: 'destructive' });
    }
  };

  const handleMoveTab = async (section, categoryId, direction) => {
    const currentList = section === 'best' ? bestSellersTabs : freshFindsTabs;
    const idx = currentList.findIndex((t) => t.categoryId === categoryId);
    if (idx < 0) return;
    const newIdx = direction === 'up' ? idx - 1 : idx + 1;
    if (newIdx < 0 || newIdx >= currentList.length) return;
    const reordered = [...currentList];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];
    const withOrder = reordered.map((t, i) => ({ ...t, order: i }));
    try {
      if (section === 'best') {
        await saveHomeTabs(withOrder, freshFindsTabs);
        setBestSellersTabs(withOrder);
      } else {
        await saveHomeTabs(bestSellersTabs, withOrder);
        setFreshFindsTabs(withOrder);
      }
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut reordona', variant: 'destructive' });
    }
  };

  const handleUpdateTabLabel = (section, categoryId, field, value) => {
    const setter = section === 'best' ? setBestSellersTabs : setFreshFindsTabs;
    const list = section === 'best' ? bestSellersTabs : freshFindsTabs;
    setter(list.map((t) => (t.categoryId === categoryId ? { ...t, [field]: value } : t)));
  };

  const handleSaveTabLabels = async (section) => {
    try {
      await saveHomeTabs(bestSellersTabs, freshFindsTabs);
      toast({ title: 'Succes', description: 'Etichetele au fost salvate!' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut salva etichetele', variant: 'destructive' });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setBannerForm({ ...bannerForm, image: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();

    try {
      let updatedBanners;
      
      if (editingBanner !== null) {
        // Edit existing banner
        updatedBanners = banners.map((b, idx) => 
          idx === editingBanner ? bannerForm : b
        );
      } else {
        // Add new banner
        updatedBanners = [...banners, bannerForm];
      }

      await saveSettings(updatedBanners);

      toast({ 
        title: 'Succes', 
        description: editingBanner !== null ? 'Banner actualizat!' : 'Banner adăugat!' 
      });

      setBanners(updatedBanners);
      setShowBannerModal(false);
      setEditingBanner(null);
      setBannerForm({
        title: '',
        titleRu: '',
        subtitle: '',
        subtitleRu: '',
        description: '',
        descriptionRu: '',
        buttonText: '',
        buttonTextRu: '',
        buttonLink: '',
        image: '',
        badge: '',
        badgeRu: '',
        order: 0
      });
    } catch (error) {
      console.error('Banner save error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut salva banner-ul',
        variant: 'destructive' 
      });
    }
  };

  const handleEditBanner = (index) => {
    setEditingBanner(index);
    setBannerForm(banners[index]);
    setShowBannerModal(true);
  };

  const handleDeleteBanner = async (index) => {
    if (!window.confirm('Sigur doriți să ștergeți acest banner?')) return;

    try {
      const updatedBanners = banners.filter((_, idx) => idx !== index);
      await saveSettings(updatedBanners, null);

      toast({ title: 'Succes', description: 'Banner șters!' });
      setBanners(updatedBanners);
    } catch (error) {
      console.error('Banner delete error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut șterge banner-ul',
        variant: 'destructive' 
      });
    }
  };

  // ==================== ALBUM UPLOAD HANDLERS ====================
  
  const handleUploadCoverImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Eroare', description: 'Fișierul trebuie să fie o imagine', variant: 'destructive' });
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      toast({ title: 'Eroare', description: 'Imaginea este prea mare. Max: 5MB', variant: 'destructive' });
      return;
    }
    
    try {
      setUploadingCover(true);
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API}/upload`, formData, {
        ...getAuthHeaders(),
        headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
      });
      
      setAlbumForm({ ...albumForm, coverImage: response.data.url });
      toast({ title: 'Succes', description: 'Imagine încărcată!' });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-a putut încărca imaginea', variant: 'destructive' });
    } finally {
      setUploadingCover(false);
    }
  };
  
  const handleUploadGalleryImages = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    if (albumForm.galleryImages.length + files.length > 10) {
      toast({ title: 'Eroare', description: 'Maxim 10 imagini în galerie', variant: 'destructive' });
      return;
    }
    
    try {
      setUploadingGallery(true);
      const uploadedUrls = [];
      
      for (const file of files) {
        if (!file.type.startsWith('image/')) continue;
        if (file.size > 5 * 1024 * 1024) continue;
        
        const formData = new FormData();
        formData.append('file', file);
        
        const response = await axios.post(`${API}/upload`, formData, {
          ...getAuthHeaders(),
          headers: { ...getAuthHeaders().headers, 'Content-Type': 'multipart/form-data' }
        });
        
        uploadedUrls.push(response.data.url);
      }
      
      setAlbumForm({ ...albumForm, galleryImages: [...albumForm.galleryImages, ...uploadedUrls] });
      toast({ title: 'Succes', description: `${uploadedUrls.length} imagini încărcate!` });
    } catch (error) {
      toast({ title: 'Eroare', description: 'Nu s-au putut încărca imaginile', variant: 'destructive' });
    } finally {
      setUploadingGallery(false);
    }
  };

  // Album Handlers
  const handleAlbumSubmit = async (e) => {
    e.preventDefault();

    if (!albumForm.title || !albumForm.coverImage) {
      toast({
        title: 'Eroare',
        description: 'Titlu și imagine copertă sunt obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      let updatedAlbums;
      
      if (editingAlbum !== null) {
        updatedAlbums = albums.map((a, idx) => 
          idx === editingAlbum ? albumForm : a
        );
      } else {
        updatedAlbums = [...albums, albumForm];
      }

      await saveSettings(banners, updatedAlbums);

      toast({ 
        title: 'Succes', 
        description: editingAlbum !== null ? 'Album actualizat!' : 'Album adăugat!' 
      });

      setAlbums(updatedAlbums);
      setShowAlbumModal(false);
      setEditingAlbum(null);
      setAlbumForm({
        title: '',
        coverImage: '',
        galleryImages: []
      });
      setTempGalleryUrl('');
    } catch (error) {
      console.error('Album save error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut salva albumul',
        variant: 'destructive' 
      });
    }
  };

  const handleEditAlbum = (index) => {
    setEditingAlbum(index);
    setAlbumForm(albums[index]);
    setShowAlbumModal(true);
  };

  const handleDeleteAlbum = async (index) => {
    if (!window.confirm('Sigur doriți să ștergeți acest album?')) return;

    try {
      const updatedAlbums = albums.filter((_, idx) => idx !== index);
      await saveSettings(banners, updatedAlbums);

      toast({ title: 'Succes', description: 'Album șters!' });
      setAlbums(updatedAlbums);
    } catch (error) {
      console.error('Album delete error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut șterge albumul',
        variant: 'destructive' 
      });
    }
  };

  const addGalleryImage = () => {
    if (tempGalleryUrl && tempGalleryUrl.trim()) {
      setAlbumForm({
        ...albumForm,
        galleryImages: [...albumForm.galleryImages, tempGalleryUrl.trim()]
      });
      setTempGalleryUrl('');
    }
  };

  const removeGalleryImage = (index) => {
    setAlbumForm({
      ...albumForm,
      galleryImages: albumForm.galleryImages.filter((_, i) => i !== index)
    });
  };

  // FAQ Handlers
  const handleFaqSubmit = async (e) => {
    e.preventDefault();

    if (!faqForm.question || !faqForm.answer) {
      toast({
        title: 'Eroare',
        description: 'Întrebarea și răspunsul sunt obligatorii',
        variant: 'destructive'
      });
      return;
    }

    try {
      let updatedFaqs;
      
      if (editingFaq !== null) {
        updatedFaqs = faqs.map((f, idx) => 
          idx === editingFaq ? faqForm : f
        );
      } else {
        updatedFaqs = [...faqs, faqForm];
      }

      await saveSettings(banners, null, updatedFaqs);

      toast({ 
        title: 'Succes', 
        description: editingFaq !== null ? 'FAQ actualizat!' : 'FAQ adăugat!' 
      });

      setFaqs(updatedFaqs);
      setShowFaqModal(false);
      setEditingFaq(null);
      setFaqForm({ question: '', answer: '' });
    } catch (error) {
      console.error('FAQ save error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut salva FAQ-ul',
        variant: 'destructive' 
      });
    }
  };

  const handleEditFaq = (index) => {
    setEditingFaq(index);
    setFaqForm(faqs[index]);
    setShowFaqModal(true);
  };

  const handleDeleteFaq = async (index) => {
    if (!window.confirm('Sigur doriți să ștergeți această întrebare?')) return;

    try {
      const updatedFaqs = faqs.filter((_, idx) => idx !== index);
      await saveSettings(banners, null, updatedFaqs);

      toast({ title: 'Succes', description: 'FAQ șters!' });
      setFaqs(updatedFaqs);
    } catch (error) {
      console.error('FAQ delete error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-a putut șterge FAQ-ul',
        variant: 'destructive' 
      });
    }
  };

  // Contact Info Handler
  const handleContactInfoSave = async () => {
    try {
      await saveSettings(banners, null, null, contactInfo);

      toast({ 
        title: 'Succes', 
        description: 'Date contact salvate!' 
      });
    } catch (error) {
      console.error('Contact info save error:', error);
      toast({ 
        title: 'Eroare', 
        description: error.response?.data?.detail || 'Nu s-au putut salva datele',
        variant: 'destructive' 
      });
    }
  };



  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestionare Conținut</h1>
        <p className="text-gray-600">Editează conținutul website-ului: bannere, promoții, footer, etc.</p>
      </div>

      <div className="space-y-6">
        {/* Hero Banners Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('heroBanners')}
            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition"
          >
            <div className="flex items-center gap-3">
              <Image className="w-6 h-6" />
              <div className="text-left">
                <h2 className="text-xl font-bold">Hero Banners (Slider Principal)</h2>
                <p className="text-sm text-teal-100">
                  {banners.length} {banners.length === 1 ? 'banner' : 'bannere'}
                </p>
              </div>
            </div>
            {expandedSections.heroBanners ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {expandedSections.heroBanners && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Gestionează bannere pentru slider-ul principal de pe homepage
                </p>
                <button
                  onClick={() => {
                    setEditingBanner(null);
                    setBannerForm({
                      title: '',
                      titleRu: '',
                      subtitle: '',
                      subtitleRu: '',
                      description: '',
                      descriptionRu: '',
                      buttonText: '',
                      buttonTextRu: '',
                      buttonLink: '',
                      image: '',
                      badge: '',
                      badgeRu: '',
                      order: banners.length
                    });
                    setShowBannerModal(true);
                  }}
                  className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Adaugă Banner
                </button>
              </div>

              {banners.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Image className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">Niciun banner adăugat</p>
                  <p className="text-gray-500 text-sm">Click pe "Adaugă Banner" pentru a crea primul banner</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {banners.map((banner, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-teal-500 transition">
                      {banner.image && (
                        <div className="h-48 overflow-hidden bg-gray-200">
                          <img 
                            src={banner.image} 
                            alt={banner.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        {banner.badge && (
                          <span className="inline-block bg-teal-100 text-teal-700 px-3 py-1 rounded-full text-xs font-bold mb-2">
                            {banner.badge}
                          </span>
                        )}
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{banner.title || 'Fără titlu'}</h3>
                        {banner.subtitle && (
                          <p className="text-sm text-gray-600 mb-2">{banner.subtitle}</p>
                        )}
                        {banner.description && (
                          <p className="text-sm text-gray-500 mb-3 line-clamp-2">{banner.description}</p>
                        )}
                        {banner.buttonText && (
                          <div className="flex items-center gap-2 text-teal-600 text-sm font-semibold mb-3">
                            <span>Buton: {banner.buttonText}</span>
                          </div>
                        )}
                        <div className="flex gap-2 pt-3 border-t">
                          <button
                            onClick={() => handleEditBanner(index)}
                            className="flex-1 flex items-center justify-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                          >
                            <Edit className="w-4 h-4" />
                            Editează
                          </button>
                          <button
                            onClick={() => handleDeleteBanner(index)}
                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Service Albums Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('serviceAlbums')}
            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition"
          >
            <div className="flex items-center gap-3">
              <Images className="w-6 h-6" />
              <div className="text-left">
                <h2 className="text-xl font-bold">Albume Servicii</h2>
                <p className="text-sm text-teal-100">
                  {albums.length} {albums.length === 1 ? 'album' : 'albume'}
                </p>
              </div>
            </div>
            {expandedSections.serviceAlbums ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {expandedSections.serviceAlbums && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Gestionează albumele cu poze pentru pagina Servicii
                </p>
                <button
                  onClick={() => {
                    setEditingAlbum(null);
                    setAlbumForm({
                      title: '',
                      coverImage: '',
                      galleryImages: []
                    });
                    setTempGalleryUrl('');
                    setShowAlbumModal(true);
                  }}
                  className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Adaugă Album
                </button>
              </div>

              {albums.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">Niciun album adăugat</p>
                  <p className="text-gray-500 text-sm">Click pe "Adaugă Album" pentru a crea primul album</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {albums.map((album, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl overflow-hidden border-2 border-gray-200 hover:border-teal-500 transition">
                      {album.coverImage && (
                        <div className="h-48 overflow-hidden bg-gray-200">
                          <img 
                            src={album.coverImage} 
                            alt={album.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-bold text-gray-900 mb-1">{album.title || 'Fără titlu'}</h3>
                        <p className="text-sm text-gray-500 mb-3">
                          {album.galleryImages.length} {album.galleryImages.length === 1 ? 'imagine' : 'imagini'} în galerie
                        </p>
                        <div className="flex gap-2 pt-3 border-t">
                          <button
                            onClick={() => handleEditAlbum(index)}
                            className="flex-1 flex items-center justify-center gap-2 bg-teal-500 text-white px-4 py-2 rounded-lg hover:bg-teal-600 transition"
                          >
                            <Edit className="w-4 h-4" />
                            Editează
                          </button>
                          <button
                            onClick={() => handleDeleteAlbum(index)}
                            className="flex items-center justify-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>


        {/* Home Sections Tabs (BestSellers + FreshFinds) */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('homeTabs')}
            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition"
          >
            <div className="flex items-center gap-3">
              <Layout className="w-6 h-6" />
              <div className="text-left">
                <h2 className="text-xl font-bold">Taburi Home: Bestsellers & Produse Noi</h2>
                <p className="text-sm text-teal-100">
                  Alege categoriile care apar ca tab-uri pe homepage
                </p>
              </div>
            </div>
            {expandedSections.homeTabs ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {expandedSections.homeTabs && (
            <div className="p-6 space-y-8">
              {/* BestSellers Tabs */}
              <HomeTabsEditor
                title="Secțiunea Bestsellers (Cele mai vândute)"
                subtitle='Tab-urile din componenta "Cele mai vândute" pe home page'
                tabs={bestSellersTabs}
                categories={categories}
                onAdd={(catId) => handleAddTab('best', catId)}
                onRemove={(catId) => handleRemoveTab('best', catId)}
                onMove={(catId, dir) => handleMoveTab('best', catId, dir)}
                onLabelChange={(catId, field, val) => handleUpdateTabLabel('best', catId, field, val)}
                onSaveLabels={() => handleSaveTabLabels('best')}
                testIdPrefix="bestsellers"
              />

              {/* FreshFinds Tabs */}
              <HomeTabsEditor
                title="Secțiunea Produse Noi (Fresh Finds)"
                subtitle='Tab-urile din componenta "Produse noi" pe home page'
                tabs={freshFindsTabs}
                categories={categories}
                onAdd={(catId) => handleAddTab('fresh', catId)}
                onRemove={(catId) => handleRemoveTab('fresh', catId)}
                onMove={(catId, dir) => handleMoveTab('fresh', catId, dir)}
                onLabelChange={(catId, field, val) => handleUpdateTabLabel('fresh', catId, field, val)}
                onSaveLabels={() => handleSaveTabLabels('fresh')}
                testIdPrefix="freshfinds"
              />
            </div>
          )}
        </div>


        {/* FAQs Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('faqs')}
            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition"
          >
            <div className="flex items-center gap-3">
              <HelpCircle className="w-6 h-6" />
              <div className="text-left">
                <h2 className="text-xl font-bold">Întrebări Frecvente (FAQs)</h2>
                <p className="text-sm text-teal-100">
                  {faqs.length} {faqs.length === 1 ? 'întrebare' : 'întrebări'}
                </p>
              </div>
            </div>
            {expandedSections.faqs ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {expandedSections.faqs && (
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <p className="text-gray-600">
                  Gestionează întrebările frecvente pentru pagina FAQ
                </p>
                <button
                  onClick={() => {
                    setEditingFaq(null);
                    setFaqForm({ question: '', questionRu: '', answer: '', answerRu: '' });
                    setShowFaqModal(true);
                  }}
                  className="flex items-center gap-2 bg-teal-600 text-white px-6 py-3 rounded-xl hover:bg-teal-700 transition font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Adaugă FAQ
                </button>
              </div>

              {faqs.length === 0 ? (
                <div className="text-center py-12 bg-gray-50 rounded-xl">
                  <HelpCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-600 font-semibold mb-2">Nicio întrebare adăugată</p>
                  <p className="text-gray-500 text-sm">Click pe "Adaugă FAQ" pentru a crea prima întrebare</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {faqs.map((faq, index) => (
                    <div key={index} className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200 hover:border-teal-500 transition">
                      <div className="flex justify-between items-start gap-4">
                        <div className="flex-1">
                          <h4 className="font-bold text-gray-900 mb-2">{faq.question}</h4>
                          <p className="text-gray-600 text-sm line-clamp-2">{faq.answer}</p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleEditFaq(index)}
                            className="p-2 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteFaq(index)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Contact Info Section */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <button
            onClick={() => toggleSection('contactInfo')}
            className="w-full px-6 py-5 flex items-center justify-between bg-gradient-to-r from-teal-600 to-teal-700 text-white hover:from-teal-700 hover:to-teal-800 transition"
          >
            <div className="flex items-center gap-3">
              <Phone className="w-6 h-6" />
              <div className="text-left">
                <h2 className="text-xl font-bold">Date de Contact</h2>
                <p className="text-sm text-teal-100">Telefon, email, adresă, social media</p>
              </div>
            </div>
            {expandedSections.contactInfo ? (
              <ChevronUp className="w-6 h-6" />
            ) : (
              <ChevronDown className="w-6 h-6" />
            )}
          </button>

          {expandedSections.contactInfo && (
            <div className="p-6">
              <p className="text-gray-600 mb-6">
                Actualizează datele de contact care apar pe pagina Contact
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Telefon</label>
                  <input
                    type="text"
                    value={contactInfo.phone}
                    onChange={(e) => setContactInfo({...contactInfo, phone: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="+373 69 123 456"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Email</label>
                  <input
                    type="email"
                    value={contactInfo.email}
                    onChange={(e) => setContactInfo({...contactInfo, email: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="contact@agrosmart.md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Adresă</label>
                  <input
                    type="text"
                    value={contactInfo.address}
                    onChange={(e) => setContactInfo({...contactInfo, address: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Str. Principală nr. 123, Chișinău"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Program</label>
                  <input
                    type="text"
                    value={contactInfo.hours}
                    onChange={(e) => setContactInfo({...contactInfo, hours: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="Luni - Vineri: 08:00 - 20:00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Facebook URL</label>
                  <input
                    type="url"
                    value={contactInfo.facebook}
                    onChange={(e) => setContactInfo({...contactInfo, facebook: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://facebook.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">Instagram URL</label>
                  <input
                    type="url"
                    value={contactInfo.instagram}
                    onChange={(e) => setContactInfo({...contactInfo, instagram: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://instagram.com/..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">TikTok URL</label>
                  <input
                    type="url"
                    value={contactInfo.tiktok}
                    onChange={(e) => setContactInfo({...contactInfo, tiktok: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="https://tiktok.com/@..."
                  />
                </div>
              </div>

              <button
                onClick={handleContactInfoSave}
                className="w-full bg-teal-600 text-white py-3 rounded-xl hover:bg-teal-700 transition font-semibold flex items-center justify-center gap-2"
              >
                <Save className="w-5 h-5" />
                Salvează Date Contact
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingBanner !== null ? 'Editează Banner' : 'Banner Nou'}
              </h3>
              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setEditingBanner(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
              {/* Image Upload */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Imagine Banner
                </label>
                {bannerForm.image && (
                  <div className="mb-3 rounded-xl overflow-hidden">
                    <img src={bannerForm.image} alt="Preview" className="w-full h-48 object-cover" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
                <p className="text-xs text-gray-500 mt-1">Rezoluție recomandată: 1920x600px</p>
              </div>

              {/* Badge */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Badge (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.badge}
                  onChange={(e) => setBannerForm({...bannerForm, badge: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Nou!, Reducere 50%"
                />
              </div>

              {/* Badge RU */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Badge — Rusă 🇷🇺 (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.badgeRu || ''}
                  onChange={(e) => setBannerForm({...bannerForm, badgeRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Новинка!, Скидка 50%"
                />
              </div>

              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Titlu
                </label>
                <input
                  type="text"
                  value={bannerForm.title}
                  onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Colecția de Vară 2024"
                />
              </div>

              {/* Title RU */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Titlu — Rusă 🇷🇺 (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.titleRu || ''}
                  onChange={(e) => setBannerForm({...bannerForm, titleRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Летняя коллекция 2024"
                />
              </div>

              {/* Subtitle */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Subtitlu (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  onChange={(e) => setBannerForm({...bannerForm, subtitle: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Tendințe de sezon"
                />
              </div>

              {/* Subtitle RU */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Subtitlu — Rusă 🇷🇺 (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.subtitleRu || ''}
                  onChange={(e) => setBannerForm({...bannerForm, subtitleRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Сезонные тренды"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descriere (opțional)
                </label>
                <textarea
                  value={bannerForm.description}
                  onChange={(e) => setBannerForm({...bannerForm, description: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Descriere scurtă pentru banner..."
                />
              </div>

              {/* Description RU */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Descriere — Rusă 🇷🇺 (opțional)
                </label>
                <textarea
                  value={bannerForm.descriptionRu || ''}
                  onChange={(e) => setBannerForm({...bannerForm, descriptionRu: e.target.value})}
                  rows="3"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="Краткое описание баннера..."
                />
              </div>

              {/* Button Text RU */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Text Buton — Rusă 🇷🇺 (opțional)
                </label>
                <input
                  type="text"
                  value={bannerForm.buttonTextRu || ''}
                  onChange={(e) => setBannerForm({...bannerForm, buttonTextRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="ex: Смотреть товары"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Button Text */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Text Buton (opțional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) => setBannerForm({...bannerForm, buttonText: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="ex: Vezi Produse"
                  />
                </div>

                {/* Button Link */}
                <div>
                  <label className="block text-sm font-bold text-gray-900 mb-2">
                    Link Buton (opțional)
                  </label>
                  <input
                    type="text"
                    value={bannerForm.buttonLink}
                    onChange={(e) => setBannerForm({...bannerForm, buttonLink: e.target.value})}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder="ex: /category/vara-2024"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowBannerModal(false);
                    setEditingBanner(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingBanner !== null ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingAlbum !== null ? 'Editează Album' : 'Album Nou'}
              </h3>
              <button
                onClick={() => {
                  setShowAlbumModal(false);
                  setEditingAlbum(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleAlbumSubmit} className="p-6 space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Titlu Album *
                </label>
                <input
                  type="text"
                  value={albumForm.title}
                  onChange={(e) => setAlbumForm({...albumForm, title: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="ex: Montaj produse"
                  required
                />
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Imagine Copertă *
                </label>
                
                {albumForm.coverImage ? (
                  <div className="relative mb-3">
                    <img 
                      src={albumForm.coverImage} 
                      alt="Cover preview" 
                      className="w-full h-48 object-cover rounded-xl"
                    />
                    <button
                      type="button"
                      onClick={() => setAlbumForm({ ...albumForm, coverImage: '' })}
                      className="absolute top-2 right-2 bg-red-500 text-white px-3 py-1 rounded-full hover:bg-red-600"
                    >
                      Șterge
                    </button>
                  </div>
                ) : (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleUploadCoverImage}
                      disabled={uploadingCover}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                    />
                    {uploadingCover && <p className="text-sm text-teal-600 mt-2">⏳ Se încarcă...</p>}
                  </div>
                )}
              </div>

              {/* Gallery Images */}
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Poze Galerie
                </label>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleUploadGalleryImages}
                  disabled={uploadingGallery || albumForm.galleryImages.length >= 10}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:opacity-50"
                  data-testid="album-gallery-upload"
                />
                {uploadingGallery && <p className="text-sm text-teal-600 mt-2">⏳ Se încarcă...</p>}

                {albumForm.galleryImages.length > 0 && (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-3">
                    {albumForm.galleryImages.map((imgUrl, idx) => (
                      <div key={idx} className="relative group">
                        <img 
                          src={imgUrl} 
                          alt={`Galerie ${idx + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={() => removeGalleryImage(idx)}
                          className="absolute top-2 right-2 bg-red-500 text-white p-1.5 rounded-lg hover:bg-red-600 transition opacity-0 group-hover:opacity-100"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <p className="text-xs text-gray-500 mt-2">
                  Încarcă imagini de pe calculator (max 10, fiecare max 5MB). {albumForm.galleryImages.length}/10 adăugate.
                </p>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAlbumModal(false);
                    setEditingAlbum(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingAlbum !== null ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FAQ Modal */}
      {showFaqModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex items-center justify-between sticky top-0 bg-white">
              <h3 className="text-2xl font-bold text-gray-900">
                {editingFaq !== null ? 'Editează FAQ' : 'FAQ Nou'}
              </h3>
              <button
                onClick={() => {
                  setShowFaqModal(false);
                  setEditingFaq(null);
                }}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleFaqSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Întrebare (RO) *
                </label>
                <input
                  type="text"
                  value={faqForm.question}
                  onChange={(e) => setFaqForm({...faqForm, question: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="ex: Cum pot plasa o comandă?"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Întrebare (RU) 🇷🇺
                </label>
                <input
                  type="text"
                  value={faqForm.questionRu}
                  onChange={(e) => setFaqForm({...faqForm, questionRu: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="напр: Как я могу разместить заказ?"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Răspuns (RO) *
                </label>
                <textarea
                  value={faqForm.answer}
                  onChange={(e) => setFaqForm({...faqForm, answer: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Răspunsul complet la întrebare..."
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-900 mb-2">
                  Răspuns (RU) 🇷🇺
                </label>
                <textarea
                  value={faqForm.answerRu}
                  onChange={(e) => setFaqForm({...faqForm, answerRu: e.target.value})}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  placeholder="Полный ответ на вопрос..."
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowFaqModal(false);
                    setEditingFaq(null);
                  }}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl hover:bg-gray-300 transition font-semibold"
                >
                  Anulează
                </button>
                <button
                  type="submit"
                  className="px-6 py-3 bg-teal-600 text-white rounded-xl hover:bg-teal-700 transition font-semibold flex items-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingFaq !== null ? 'Actualizează' : 'Salvează'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ContentManagement;
