import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import {
  Image,
  Plus,
  Edit,
  Trash2,
  Save,
  X,
  ChevronDown,
  ChevronUp,
  Phone,
  Layout,
  ArrowUp,
  ArrowDown,
  Mail,
  MapPin,
  Clock
} from 'lucide-react';
import HomeTabsEditor from './HomeTabsEditor';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContentManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [loading, setLoading] = useState(true);

  const [banners, setBanners] = useState([]);
  // const [albums, setAlbums] = useState([]);
  // const [faqs, setFaqs] = useState([]);

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
  // const [showAlbumModal, setShowAlbumModal] = useState(false);
  // const [showFaqModal, setShowFaqModal] = useState(false);

  const [editingBanner, setEditingBanner] = useState(null);
  // const [editingAlbum, setEditingAlbum] = useState(null);
  // const [editingFaq, setEditingFaq] = useState(null);

  const [expandedSections, setExpandedSections] = useState({
    heroBanners: true,
    // serviceAlbums: false,
    homeTabs: true,
    // faqs: false,
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

  /*
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
  */

  const [categories, setCategories] = useState([]);
  const [bestSellersTabs, setBestSellersTabs] = useState([]);
  // const [freshFindsTabs, setFreshFindsTabs] = useState([]);

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
      // setAlbums(response.data.albums || []);
      // setFaqs(response.data.faqs || []);

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
      // setFreshFindsTabs(response.data.freshFindsTabs || []);
      setCategories(catRes.data || []);
    } catch (error) {
      console.error('Error fetching content:', error);
      setBanners([]);
      // setAlbums([]);
      // setFaqs([]);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (
    updatedBanners,
    updatedAlbums = null,
    updatedFaqs = null,
    updatedContactInfo = null
  ) => {
    try {
      const currentSettings = await axios.get(`${API}/settings`);

      const mergedSettings = {
        ...currentSettings.data,
        heroBanners: updatedBanners
      };

      if (updatedAlbums !== null) {
        mergedSettings.albums = updatedAlbums;
      }

      if (updatedFaqs !== null) {
        mergedSettings.faqs = updatedFaqs;
      }

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

  const saveHomeTabs = async (updatedBestSellers, updatedFreshFinds = null) => {
    try {
      const currentSettings = await axios.get(`${API}/settings`);

      const merged = {
        ...currentSettings.data,
        bestSellersTabs: updatedBestSellers
      };

      // Fresh Finds momentan este comentat/dezactivat din UI
      if (updatedFreshFinds !== null) {
        merged.freshFindsTabs = updatedFreshFinds;
      }

      await axios.post(`${API}/settings`, merged, getAuthHeaders());
      return true;
    } catch (error) {
      console.error('Error saving home tabs:', error);
      throw error;
    }
  };

  const handleAddTab = async (section, categoryId) => {
    if (!categoryId) return;

    const currentList = bestSellersTabs;

    if (currentList.some((t) => t.categoryId === categoryId)) {
      toast({
        title: 'Atenție',
        description: 'Această categorie e deja în listă',
        variant: 'destructive'
      });
      return;
    }

    const newList = [
      ...currentList,
      {
        categoryId,
        label: '',
        labelRu: '',
        order: currentList.length
      }
    ];

    try {
      await saveHomeTabs(newList);
      setBestSellersTabs(newList);

      toast({
        title: 'Succes',
        description: 'Tab adăugat!'
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva',
        variant: 'destructive'
      });
    }
  };

  const handleRemoveTab = async (section, categoryId) => {
    const newList = bestSellersTabs.filter((t) => t.categoryId !== categoryId);

    try {
      await saveHomeTabs(newList);
      setBestSellersTabs(newList);

      toast({
        title: 'Succes',
        description: 'Tab eliminat!'
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut salva',
        variant: 'destructive'
      });
    }
  };

  const handleMoveTab = async (section, categoryId, direction) => {
    const currentList = bestSellersTabs;
    const idx = currentList.findIndex((t) => t.categoryId === categoryId);

    if (idx < 0) return;

    const newIdx = direction === 'up' ? idx - 1 : idx + 1;

    if (newIdx < 0 || newIdx >= currentList.length) return;

    const reordered = [...currentList];
    [reordered[idx], reordered[newIdx]] = [reordered[newIdx], reordered[idx]];

    const withOrder = reordered.map((t, i) => ({
      ...t,
      order: i
    }));

    try {
      await saveHomeTabs(withOrder);
      setBestSellersTabs(withOrder);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut reordona',
        variant: 'destructive'
      });
    }
  };

  const handleUpdateTabLabel = (section, categoryId, field, value) => {
    setBestSellersTabs(
      bestSellersTabs.map((t) =>
        t.categoryId === categoryId ? { ...t, [field]: value } : t
      )
    );
  };

  const handleSaveTabLabels = async () => {
    try {
      await saveHomeTabs(bestSellersTabs);

      toast({
        title: 'Succes',
        description: 'Etichetele au fost salvate!'
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut salva etichetele',
        variant: 'destructive'
      });
    }
  };

  const toggleSection = (section) => {
    setExpandedSections((prev) => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];

    if (file) {
      const reader = new FileReader();

      reader.onloadend = () => {
        setBannerForm({
          ...bannerForm,
          image: reader.result
        });
      };

      reader.readAsDataURL(file);
    }
  };

  const handleBannerSubmit = async (e) => {
    e.preventDefault();

    try {
      let updatedBanners;

      if (editingBanner !== null) {
        updatedBanners = banners.map((b, idx) =>
          idx === editingBanner ? bannerForm : b
        );
      } else {
        updatedBanners = [...banners, bannerForm];
      }

      await saveSettings(updatedBanners);

      toast({
        title: 'Succes',
        description:
          editingBanner !== null ? 'Banner actualizat!' : 'Banner adăugat!'
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
        description:
          error.response?.data?.detail || 'Nu s-a putut salva banner-ul',
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

      toast({
        title: 'Succes',
        description: 'Banner șters!'
      });

      setBanners(updatedBanners);
    } catch (error) {
      console.error('Banner delete error:', error);

      toast({
        title: 'Eroare',
        description:
          error.response?.data?.detail || 'Nu s-a putut șterge banner-ul',
        variant: 'destructive'
      });
    }
  };

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
        description:
          error.response?.data?.detail || 'Nu s-au putut salva datele',
        variant: 'destructive'
      });
    }
  };

  const getCategoryName = (categoryId) => {
    return categories.find((cat) => cat.id === categoryId)?.name || 'Categorie necunoscută';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-gray-900">
        <h1 className="text-2xl font-extrabold tracking-tight">
          Gestionare Conținut
        </h1>

        <p className="text-gray-500 text-sm mt-1">
          Editează conținutul website-ului: bannere, taburi homepage și date de contact.
        </p>
      </div>

      {/* Hero Banners Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('heroBanners')}
          className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <Image className="w-5 h-5" />
            </div>

            <div className="text-left">
              <h2 className="text-lg font-extrabold text-gray-900">
                Hero Banners
              </h2>

              <p className="text-sm text-gray-500">
                {banners.length} {banners.length === 1 ? 'banner' : 'bannere'} în slider
              </p>
            </div>
          </div>

          {expandedSections.heroBanners ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.heroBanners && (
          <div>
            <div className="px-6 py-4 flex flex-wrap items-center justify-between gap-3 bg-gray-50/60 border-b border-gray-100">
              <p className="text-sm text-gray-600">
                Gestionează bannerele afișate în slider-ul principal.
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
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
              >
                <Plus className="w-4 h-4" />
                Adaugă Banner
              </button>
            </div>

            {banners.length === 0 ? (
              <div className="text-center py-14">
                <Image className="w-14 h-14 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-700 font-semibold">
                  Niciun banner adăugat
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Click pe „Adaugă Banner” pentru a crea primul banner.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50/60">
                    <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                      <th className="px-6 py-4 font-semibold">Banner</th>
                      <th className="px-6 py-4 font-semibold">Texte</th>
                      <th className="px-6 py-4 font-semibold">Buton</th>
                      <th className="px-6 py-4 font-semibold">Ordine</th>
                      <th className="px-6 py-4 font-semibold text-right pr-8">
                        Acțiuni
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-gray-100">
                    {banners.map((banner, index) => (
                      <tr
                        key={index}
                        className="bg-white hover:bg-brand-50/40 transition"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-20 h-14 rounded-2xl bg-gray-50 border border-gray-100 overflow-hidden flex items-center justify-center flex-shrink-0">
                              {banner.image ? (
                                <img
                                  src={banner.image}
                                  alt={banner.title}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Image className="w-5 h-5 text-gray-400" />
                              )}
                            </div>

                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 truncate max-w-[240px]">
                                {banner.title || 'Fără titlu'}
                              </div>

                              {banner.badge && (
                                <div className="mt-1 inline-flex rounded-full bg-brand-50 text-brand-700 ring-1 ring-brand-100 px-2.5 py-0.5 text-xs font-bold">
                                  {banner.badge}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-700 truncate max-w-[300px]">
                            {banner.subtitle || '—'}
                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-[300px] mt-1">
                            {banner.description || '—'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="text-sm font-semibold text-gray-900">
                            {banner.buttonText || '—'}
                          </div>

                          <div className="text-xs text-gray-500 truncate max-w-[220px]">
                            {banner.buttonLink || '—'}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-gray-50 text-gray-700 ring-1 ring-gray-100">
                            #{banner.order ?? index}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex gap-2 justify-end pr-2">
                            <button
                              onClick={() => handleEditBanner(index)}
                              title="Editează"
                              className="p-2.5 rounded-full bg-brand-50 text-brand-700 hover:bg-brand-100 transition"
                            >
                              <Edit className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => handleDeleteBanner(index)}
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
        )}
      </div>

      {/* Albume Servicii - momentan comentat */}
      {/*
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        ...
      </div>
      */}

      {/* Home Sections Tabs */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('homeTabs')}
          className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <Layout className="w-5 h-5" />
            </div>

            <div className="text-left">
              <h2 className="text-lg font-extrabold text-gray-900">
                Secțiunea Bestsellers
              </h2>

              <p className="text-sm text-gray-500">
                Alege categoriile care apar ca tab-uri pe homepage
              </p>
            </div>
          </div>

          {expandedSections.homeTabs ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.homeTabs && (
          <div className="p-6 space-y-6">
            <HomeTabsEditor
              title="Secțiunea Bestsellers (Cele mai vândute)"
              subtitle='Tab-urile din componenta "Cele mai vândute" pe home page'
              tabs={bestSellersTabs}
              categories={categories}
              onAdd={(catId) => handleAddTab('best', catId)}
              onRemove={(catId) => handleRemoveTab('best', catId)}
              onMove={(catId, dir) => handleMoveTab('best', catId, dir)}
              onLabelChange={(catId, field, val) =>
                handleUpdateTabLabel('best', catId, field, val)
              }
              onSaveLabels={() => handleSaveTabLabels('best')}
              testIdPrefix="bestsellers"
            />

            {/* Fresh Finds momentan comentat */}
            {/*
            <HomeTabsEditor
              title="Secțiunea Produse Noi (Fresh Finds)"
              subtitle='Tab-urile din componenta "Produse noi" pe home page'
              tabs={freshFindsTabs}
              categories={categories}
              onAdd={(catId) => handleAddTab('fresh', catId)}
              onRemove={(catId) => handleRemoveTab('fresh', catId)}
              onMove={(catId, dir) => handleMoveTab('fresh', catId, dir)}
              onLabelChange={(catId, field, val) =>
                handleUpdateTabLabel('fresh', catId, field, val)
              }
              onSaveLabels={() => handleSaveTabLabels('fresh')}
              testIdPrefix="freshfinds"
            />
            */}
          </div>
        )}
      </div>

      {/* FAQ - momentan comentat */}
      {/*
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        ...
      </div>
      */}

      {/* Contact Info Section */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <button
          onClick={() => toggleSection('contactInfo')}
          className="w-full px-6 py-5 flex items-center justify-between bg-white hover:bg-gray-50 transition border-b border-gray-100"
        >
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-brand-50 text-brand-700 flex items-center justify-center ring-1 ring-brand-100">
              <Phone className="w-5 h-5" />
            </div>

            <div className="text-left">
              <h2 className="text-lg font-extrabold text-gray-900">
                Date de Contact
              </h2>

              <p className="text-sm text-gray-500">
                Telefon, email, adresă și program
              </p>
            </div>
          </div>

          {expandedSections.contactInfo ? (
            <ChevronUp className="w-5 h-5 text-gray-500" />
          ) : (
            <ChevronDown className="w-5 h-5 text-gray-500" />
          )}
        </button>

        {expandedSections.contactInfo && (
          <div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50/60">
                  <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                    <th className="px-6 py-4 font-semibold">Câmp</th>
                    <th className="px-6 py-4 font-semibold">Valoare</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-gray-100">
                  <tr className="bg-white hover:bg-brand-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-semibold text-gray-900">
                        <Phone className="w-4 h-4 text-gray-400" />
                        Telefon
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={contactInfo.phone}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            phone: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                        placeholder="+373 69 123 456"
                      />
                    </td>
                  </tr>

                  <tr className="bg-white hover:bg-brand-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-semibold text-gray-900">
                        <Mail className="w-4 h-4 text-gray-400" />
                        Email
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="email"
                        value={contactInfo.email}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            email: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                        placeholder="contact@agrosmart.md"
                      />
                    </td>
                  </tr>

                  <tr className="bg-white hover:bg-brand-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-semibold text-gray-900">
                        <MapPin className="w-4 h-4 text-gray-400" />
                        Adresă
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={contactInfo.address}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            address: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                        placeholder="Str. Principală nr. 123, Chișinău"
                      />
                    </td>
                  </tr>

                  <tr className="bg-white hover:bg-brand-50/40 transition">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3 font-semibold text-gray-900">
                        <Clock className="w-4 h-4 text-gray-400" />
                        Program
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <input
                        type="text"
                        value={contactInfo.hours}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            hours: e.target.value
                          })
                        }
                        className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                        placeholder="Luni - Vineri: 08:00 - 20:00"
                      />
                    </td>
                  </tr>

                  {/* Social media momentan comentat */}
                  {/*
                  <tr>
                    <td>Facebook</td>
                    <td>
                      <input
                        type="url"
                        value={contactInfo.facebook}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            facebook: e.target.value
                          })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>Instagram</td>
                    <td>
                      <input
                        type="url"
                        value={contactInfo.instagram}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            instagram: e.target.value
                          })
                        }
                      />
                    </td>
                  </tr>

                  <tr>
                    <td>TikTok</td>
                    <td>
                      <input
                        type="url"
                        value={contactInfo.tiktok}
                        onChange={(e) =>
                          setContactInfo({
                            ...contactInfo,
                            tiktok: e.target.value
                          })
                        }
                      />
                    </td>
                  </tr>
                  */}
                </tbody>
              </table>
            </div>

            <div className="bg-gray-50/60 border-t border-gray-100 px-6 py-4 flex justify-end">
              <button
                onClick={handleContactInfoSave}
                className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-full font-semibold shadow-md shadow-brand-200 transition"
              >
                <Save className="w-5 h-5" />
                Salvează Date Contact
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Banner Modal */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingBanner !== null ? 'Editează Banner' : 'Banner Nou'}
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Configurează imaginea, textele și link-ul bannerului
                </p>
              </div>

              <button
                onClick={() => {
                  setShowBannerModal(false);
                  setEditingBanner(null);
                }}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleBannerSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Imagine Banner
                </label>

                {bannerForm.image && (
                  <div className="mb-3 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50">
                    <img
                      src={bannerForm.image}
                      alt="Preview"
                      className="w-full h-48 object-cover"
                    />
                  </div>
                )}

                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />

                <p className="text-xs text-gray-500 mt-1">
                  Rezoluție recomandată: 1920x600px
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Badge RO
                  </label>

                  <input
                    type="text"
                    value={bannerForm.badge}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        badge: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Nou!, Reducere 50%"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Badge RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={bannerForm.badgeRu || ''}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        badgeRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Новинка!"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titlu RO
                  </label>

                  <input
                    type="text"
                    value={bannerForm.title}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        title: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Colecția de Vară"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Titlu RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={bannerForm.titleRu || ''}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        titleRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Летняя коллекция"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subtitlu RO
                  </label>

                  <input
                    type="text"
                    value={bannerForm.subtitle}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        subtitle: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Tendințe de sezon"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Subtitlu RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={bannerForm.subtitleRu || ''}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        subtitleRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Сезонные тренды"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descriere RO
                  </label>

                  <textarea
                    value={bannerForm.description}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        description: e.target.value
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="Descriere scurtă..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Descriere RU 🇷🇺
                  </label>

                  <textarea
                    value={bannerForm.descriptionRu || ''}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        descriptionRu: e.target.value
                      })
                    }
                    rows="3"
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="Краткое описание..."
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Text Buton RO
                  </label>

                  <input
                    type="text"
                    value={bannerForm.buttonText}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        buttonText: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Vezi Produse"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Text Buton RU 🇷🇺
                  </label>

                  <input
                    type="text"
                    value={bannerForm.buttonTextRu || ''}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        buttonTextRu: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: Смотреть"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Link Buton
                  </label>

                  <input
                    type="text"
                    value={bannerForm.buttonLink}
                    onChange={(e) =>
                      setBannerForm({
                        ...bannerForm,
                        buttonLink: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                    placeholder="ex: /catalog"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-100">
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200 flex items-center justify-center gap-2"
                >
                  <Save className="w-5 h-5" />
                  {editingBanner !== null ? 'Actualizează' : 'Salvează'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowBannerModal(false);
                    setEditingBanner(null);
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

      {/* Album Modal - comentat */}
      {/*
      {showAlbumModal && (...)}
      */}

      {/* FAQ Modal - comentat */}
      {/*
      {showFaqModal && (...)}
      */}
    </div>
  );
};

export default ContentManagement;