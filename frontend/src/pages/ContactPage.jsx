import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { MapPin, Phone, Mail, Clock, Send, Share2 } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import { FaFacebookF, FaInstagram, FaTiktok } from 'react-icons/fa';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const { language, t } = useLanguage();
  const [pageData, setPageData] = useState(null);
  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: '',
    facebook: '',
    instagram: '',
    tiktok: ''
  });
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactPage();
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API}/settings`);
      if (response.data.contactInfo) {
        setContactInfo(response.data.contactInfo);
      }
    } catch (error) {
      console.error('Error fetching contact info from settings:', error);
    }
  };

  const fetchContactPage = async () => {
    try {
      const response = await axios.get(`${API}/pages/slug/contact`);
      setPageData(response.data);
    } catch (error) {
      console.error('Error fetching contact page:', error);
      // Use default data if page doesn't exist
      setPageData({
        content: JSON.stringify({
          address: 'or. Durleşti, str. Tudor Vladimirescu 70B',
          phone: '+373 69 711 967',
          email: 'support@agrosmart.md',
          hours: 'Luni - Vineri: 08:00 - 20:00',
          mapUrl: 'https://www.google.com/maps?q=47.02988894044589,28.768576182349097&hl=ro&z=17&output=embed'
        })
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await axios.post(`${API}/contact/submit`, formData);

      toast({
        title: 'Succes!',
        description: 'Mesajul tău a fost trimis. Îți vom răspunde în curând!'
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: ''
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul. Te rog încearcă din nou.',
        variant: 'destructive'
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // Use contactInfo from state (fetched from settings), with fallbacks
  const finalContactInfo = {
    address: contactInfo.address || 'or. Durleşti, str. Tudor Vladimirescu 70B',
    phone: contactInfo.phone || '+373 69 711 967',
    email: contactInfo.email || 'comenzi@agrosmart.md',
    hours: contactInfo.hours || 'Luni - Vineri: 08:00 - 20:00',
    facebook: contactInfo.facebook || '',
    instagram: contactInfo.instagram || '',
    tiktok: contactInfo.tiktok || '',
    mapUrl: 'https://www.google.com/maps?q=47.02988894044589,28.768576182349097&hl=ro&z=17&output=embed'
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* HERO */}
<div className="bg-gradient-to-r from-teal-600 to-teal-700 text-white py-10 md:py-14">
  <div className="w-full px-6">
    <div className="flex items-center gap-3 mb-3">
      <Mail className="w-10 h-10" />
      <h1 className="text-3xl md:text-4xl font-bold">
        {pageData?.title || t('contact.title')}
      </h1>
    </div>

    <p className="text-teal-100">
      {pageData?.desc || t('contact.desc')}
    </p>
  </div>
</div>

      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-teal-600">{t('contact.breadcrumb.home')}</Link>
            <ChevronRight className="w-4 h-4" />
            <span className="text-gray-900 font-semibold">{t('contact.breadcrumb.page')}</span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Contact Info Cards */}
          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <MapPin className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.cards.address')}</h3>
            <p className="text-gray-600">{finalContactInfo.address}</p>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Phone className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.cards.phone')}</h3>
            <a href={`tel:${finalContactInfo.phone}`} className="text-teal-600 hover:text-teal-700 font-semibold">
              {finalContactInfo.phone}
            </a>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition">
            <div className="w-14 h-14 bg-teal-100 rounded-full flex items-center justify-center mb-4">
              <Mail className="w-7 h-7 text-teal-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{t('contact.cards.email')}</h3>
            <a href={`mailto:${finalContactInfo.email}`} className="text-teal-600 hover:text-teal-700 font-semibold">
              {finalContactInfo.email}
            </a>
          </div>
        </div>



        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Contact Form */}
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('contact.form.title')}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      {t('contact.form.name')}
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                      placeholder={t('contact.form.placeholderName')}
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    {t('contact.form.email')}
                  </label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                    placeholder={t('contact.form.placeholderEmail')}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.form.phone')}
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={t('contact.form.placeholderPhone')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.form.subject')}
                </label>
                <input
                  type="text"
                  required
                  value={formData.subject}
                  onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={t('contact.form.placeholderSubject')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.form.message')}
                </label>
                <textarea
                  required
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="5"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder={t('contact.form.placeholderMessage')}
                />
              </div>

              <button
  type="submit"
  disabled={submitting}
  className="w-full bg-teal-600 text-white py-4 rounded-xl hover:bg-teal-700 transition font-bold text-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
>
  <Send className="w-5 h-5" />
  {submitting ? t('contact.form.sending') : t('contact.form.send')}
</button>
            </form>
          </div>

          {/* Map & Hours */}
          <div className="space-y-6">
            {/* Google Map */}
            <div className="bg-white rounded-2xl overflow-hidden shadow-lg">
              <iframe
                src={finalContactInfo.mapUrl}
                width="100%"
                height="400"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Locație Google Maps"
              />
            </div>

            {/* Business Hours */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('contact.schedule')}</h3>
              </div>
              <p className="text-gray-600 text-lg">{contactInfo.hours}</p>
            </div>
            {/* Social Media */}
            <div className="bg-white rounded-2xl p-6 shadow-lg">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-teal-100 rounded-full flex items-center justify-center">
                  <Share2 className="w-6 h-6 text-teal-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">{t('contact.social')}</h3>
              </div>

              <div className="flex items-center gap-4">

                <a
                  href="https://www.facebook.com/profile.php?id=61574327334921"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-[#1877F2] hover:text-white transition"
                >
                  <FaFacebookF className="text-lg" />
                </a>

                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gradient-to-tr hover:from-pink-500 hover:to-yellow-500 hover:text-white transition"
                >
                  <FaInstagram className="text-lg" />
                </a>

                <a
                  href="https://tiktok.com/@agrosmart.md"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center hover:bg-black hover:text-white transition"
                >
                  <FaTiktok className="text-lg" />
                </a>

              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
