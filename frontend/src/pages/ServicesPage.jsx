import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  ChevronRight,
  Images,
  ArrowLeft,
  Search,
  X,
  ChevronLeft,
  ChevronRight as ChevronRightIcon
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ServicesPage = () => {
  const { language, changeLanguage, t } = useLanguage();
  const [selectedAlbum, setSelectedAlbum] = useState(null);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [albums, setAlbums] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      const fetchedAlbums = response.data.albums || [];

      // Transform backend data to match frontend structure
      const transformedAlbums = fetchedAlbums.map((album, index) => ({
        id: index + 1,
        title: album.title,
        cover: album.coverImage,
        images: album.galleryImages
      }));

      setAlbums(transformedAlbums);
    } catch (error) {
      console.error('Error fetching albums:', error);
      setAlbums([]);
    } finally {
      setLoading(false);
    }
  };

  const openLightbox = (index) => {
    setLightboxIndex(index);
  };

  const closeLightbox = () => {
    setLightboxIndex(null);
  };

  const showPrevImage = () => {
    if (!selectedAlbum) return;
    setLightboxIndex((prev) =>
      prev === 0 ? selectedAlbum.images.length - 1 : prev - 1
    );
  };

  const showNextImage = () => {
    if (!selectedAlbum) return;
    setLightboxIndex((prev) =>
      prev === selectedAlbum.images.length - 1 ? 0 : prev + 1
    );
  };

  return (
    <div className="bg-gray-50">
      {/* HERO */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-10 md:py-14">
        <div className="w-full px-6">
          <div className="flex items-center gap-3 mb-3">
            <Images className="w-10 h-10" />
            <h1 className="text-3xl md:text-4xl font-bold">{t('services.title')}</h1>
          </div>
          <p className="text-teal-100">
            {t('services.desc')}
          </p>
        </div>
      </div>

      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">
              {t('services.breadcrumb.home')}
            </Link>

            <ChevronRight className="w-4 h-4" />

            {!selectedAlbum ? (
              <span className="text-gray-900 font-semibold">{t('services.breadcrumb.page')}</span>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedAlbum(null);
                    setLightboxIndex(null);
                  }}
                  className="hover:text-teal-600 font-semibold transition"
                >
                  {t('services.breadcrumb.page')}
                </button>
                <ChevronRight className="w-4 h-4" />
                <span className="text-gray-900 font-semibold">
                  {selectedAlbum.title}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
          </div>
        ) : albums.length === 0 ? (
          <div className="text-center py-20">
            <Images className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 font-semibold">{t('services.empty')}</p>
          </div>
        ) : !selectedAlbum ? (
          <>
            <div className="mb-10">
              <h2 className="text-2xl font-bold text-gray-900">
                {t('services.albumsTitle')}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {t('services.albumsDesc')}
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
              {albums.map((album) => (
                <button
                  key={album.id}
                  onClick={() => {
                    setSelectedAlbum(album);
                    setLightboxIndex(null);
                  }}
                  className="group bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 text-left border border-gray-200 hover:border-teal-500"
                >
                  <div className="relative overflow-hidden">
                    <img
                      src={album.cover}
                      alt={album.title}
                      className="w-full h-[260px] object-cover group-hover:scale-105 transition duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 right-4">
                      <div className="inline-flex items-center justify-center px-3 py-1 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-semibold mb-2">
                        {album.images.length} {t('services.imagesCount')}
                      </div>
                      <h3 className="text-white text-xl font-bold leading-tight">
                        {album.title}
                      </h3>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-10">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedAlbum.title}
                </h2>
                <p className="text-gray-500 text-sm mt-1">
                  {selectedAlbum.images.length} {t('services.albumImages')}
                </p>
              </div>

              <button
                onClick={() => {
                  setSelectedAlbum(null);
                  setLightboxIndex(null);
                }}
                className="inline-flex items-center gap-2 bg-teal-600 text-white px-5 py-3 rounded-xl hover:bg-teal-700 transition font-semibold w-fit"
              >
                <ArrowLeft className="w-4 h-4" />
                {t('services.back')}
              </button>
            </div>

            <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-6 [column-fill:_balance]">
              {selectedAlbum.images.map((image, index) => (
                <div key={index} className="mb-6 break-inside-avoid">
                  <button
                    type="button"
                    onClick={() => openLightbox(index)}
                    className="group relative block w-full overflow-hidden rounded-[15px]"
                  >
                    <img
                      src={image}
                      alt={`${selectedAlbum.title} ${index + 1}`}
                      className="w-full h-auto rounded-[15px] shadow-lg hover:shadow-xl transition"
                    />

                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition duration-300 rounded-[15px] flex items-center justify-center">
                      <div className="w-14 h-14 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 scale-90 group-hover:scale-100 transition duration-300 shadow-lg">
                        <Search className="w-6 h-6 text-gray-900" />
                      </div>
                    </div>
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* LIGHTBOX */}
      {selectedAlbum && lightboxIndex !== null && (
        <div className="fixed inset-0 z-[999] bg-black/90 flex items-center justify-center p-4">
          <button
            type="button"
            onClick={closeLightbox}
            className="absolute top-5 right-5 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-6 h-6" />
          </button>

          <button
            type="button"
            onClick={showPrevImage}
            className="absolute left-4 md:left-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <ChevronLeft className="w-7 h-7" />
          </button>

          <div className="max-w-6xl w-full flex flex-col items-center">
            <img
              src={selectedAlbum.images[lightboxIndex]}
              alt={`${selectedAlbum.title} ${lightboxIndex + 1}`}
              className="max-h-[82vh] w-auto max-w-full object-contain rounded-[18px] shadow-2xl"
            />

            <div className="mt-4 text-center text-white">
              <div className="font-semibold text-lg">{selectedAlbum.title}</div>
              <div className="text-sm text-white/75">
                {t('services.lightboxImage')} {lightboxIndex + 1} {t('services.lightboxFrom')} {selectedAlbum.images.length}
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={showNextImage}
            className="absolute right-4 md:right-6 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <ChevronRightIcon className="w-7 h-7" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;