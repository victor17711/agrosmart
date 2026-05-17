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
import OtherProductsCarousel from '../components/OtherProductsCarousel';
import BestSellersSection from '../components/BestSellersSection';
import FreshFindsSection from '../components/FreshFindsSection';
import InfoBar from '../components/InfoBar';
import FeaturesSection from '../components/FeaturesSection';
import BrandsSection from '../components/BrandsSection';
import CountdownTimer from '../components/CountdownTimer';
import Preloader from '../components/Preloader';
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
    loadHomeData();
  }, []);

  useEffect(() => {
    if (settings?.featuredCategoryId) {
      fetchFeaturedProducts(settings.featuredCategoryId);
    }
  }, [settings]);

  const loadHomeData = async () => {
    const startTime = Date.now();

    try {
      setLoading(true);

      const [settingsRes, productsRes] = await Promise.all([
        axios.get(`${API}/settings`).catch((error) => {
          console.error('Error fetching settings:', error);
          return { data: null };
        }),

        axios.get(`${API}/products?limit=100`).catch((error) => {
          console.error('Error fetching products:', error);
          return { data: [] };
        }),
      ]);

      setSettings(settingsRes.data);
      setProducts(productsRes.data || []);
    } catch (error) {
      console.error('Error loading homepage data:', error);
    } finally {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(1500 - elapsed, 0);

      setTimeout(() => {
        setLoading(false);
      }, remaining);
    }
  };

  const fetchFeaturedProducts = async (featuredCategoryId) => {
    try {
      const categoryRes = await axios.get(`${API}/categories`);
      const category = categoryRes.data.find(
        (cat) => cat.id === featuredCategoryId
      );

      if (category) {
        const response = await axios.get(
          `${API}/products?category=${encodeURIComponent(category.name)}&limit=20`
        );

        setFeaturedProducts(response.data || []);
      }
    } catch (error) {
      console.error('Error fetching featured products:', error);
    }
  };

  // Product sections
  const hotPicksProducts = products.slice(0, 6);
  const flashDealProducts = products.slice(6, 11);
  const freshFindsProducts = products.slice(11, 19);

  return (
    <div className="relative min-h-screen">
      {/* Preloader overlay */}
      {loading && <Preloader />}

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

      {/* Carousel cu produse */}
      <DiscountProductsCarousel />

      {/* Timer */}
      <CountdownTimer targetDate="2026-06-15T23:59:59+03:00" />

      {/* Bannere */}
      <BannerSection />

      {/* Bara informativa */}
      {/* <InfoBar /> */}

      {/* Taburi cu produse */}
      {/* <FreshFindsSection /> */}

      {/* Al doilea carousel cu produse — deasupra footerului */}
      <OtherProductsCarousel />

      {/* Features Section */}
      {/* <FeaturesSection /> */}
    </div>
  );
};

export default HomePage;