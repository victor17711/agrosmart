import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Autoplay } from 'swiper/modules';
import HeroSlider from '../components/HeroSlider';
import CategoryMenuCarousel from '../components/CategoryMenuCarousel';
import CategoryGrid from '../components/CategoryGrid';
import ProductCard from '../components/ProductCard';
import BannerSection from '../components/BannerSection';
import DiscountProductsCarousel from '../components/DiscountProductsCarousel';
import BestSellersSection from '../components/BestSellersSection';
import FreshFindsSection from '../components/FreshFindsSection';
import InfoBar from '../components/InfoBar';
import FeaturesSection from '../components/FeaturesSection';
import BrandsSection from '../components/BrandsSection';
import CountdownTimer from '../components/CountdownTimer';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import 'swiper/css';
import 'swiper/css/navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const HomePage = () => {
  const [products, setProducts] = useState([]);
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState(null);
  const prevRef = useRef(null);
  const nextRef = useRef(null);

  useEffect(() => {
    fetchSettings();
    fetchProducts();
  }, []);

  useEffect(() => {
    if (settings?.featuredCategoryId) {
      fetchFeaturedProducts();
    }
  }, [settings]);

  const fetchSettings = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      setSettings(response.data);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const fetchProducts = async () => {
    try {
      // Fetch only the latest 100 products for homepage display.
      // Section components (BestSellers, FreshFinds, etc.) only need a subset.
      const response = await axios.get(`${API}/products?limit=100`);
      setProducts(response.data);
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchFeaturedProducts = async () => {
    try {
      // Fetch category details
      const categoryRes = await axios.get(`${API}/categories`);
      const category = categoryRes.data.find(cat => cat.id === settings.featuredCategoryId);

      if (category) {
        const response = await axios.get(`${API}/products?category=${encodeURIComponent(category.name)}&limit=20`);
        setFeaturedProducts(response.data);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading products...</p>
      </div>
    </div>;
  }

  // Product sections
  const hotPicksProducts = products.slice(0, 6);
  const flashDealProducts = products.slice(6, 11);
  const freshFindsProducts = products.slice(11, 19);

  return (
    <div className="min-h-screen">
      {/* Bara cu categorii din meniu */}
      <CategoryMenuCarousel />

      {/* Hero Slider */}
      <HeroSlider />

      {/* Branduri carousel */}
      <BrandsSection />

      {/* Lista categorii */}
      {/* <CategoryGrid /> */}

      {/* Taburi cu produse */}
      <BestSellersSection />

      {/* Bannere */}
      <BannerSection />

      {/* Carousel cu produse */}
      <DiscountProductsCarousel />

      {/* Bara informativa */}
      {/* <InfoBar /> */}

      {/* Taburi cu produse */}
      <FreshFindsSection />

      {/* Features Section */}
      {/* <FeaturesSection /> */}

    </div>
  );
};

export default HomePage;

