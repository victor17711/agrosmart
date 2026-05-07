import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, ChevronRight } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ContactPage = () => {
  const { t } = useLanguage();

  const [contactInfo, setContactInfo] = useState({
    phone: '',
    email: '',
    address: '',
    hours: '',
  });

  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: '',
  });

  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchContactInfo();
  }, []);

  const fetchContactInfo = async () => {
    try {
      const response = await axios.get(`${API}/settings`);

      if (response.data.contactInfo) {
        setContactInfo(response.data.contactInfo);
      }
    } catch (error) {
      console.error('Error fetching contact info:', error);
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
        description: 'Mesajul tău a fost trimis. Îți vom răspunde în curând!',
      });

      setFormData({
        name: '',
        email: '',
        phone: '',
        subject: '',
        message: '',
      });
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut trimite mesajul. Te rog încearcă din nou.',
        variant: 'destructive',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#a7cf26]"></div>
      </div>
    );
  }

  const finalContactInfo = {
    address:
      contactInfo.address ||
      'Moldova, Durlești, str. Tudor Vladimirescu 67c',
    phone: contactInfo.phone || '+373 67 818 180',
    email: contactInfo.email || 'agrosmart.moldova@gmail.com',
    hours: contactInfo.hours || 'Mon - Fri 9:00am - 6:00pm',
    mapUrl:
      'https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2740.1273412102632!2d28.768576182349097!3d47.02988894044589!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x40c97dfeda950e17%3A0x6dbe344fc67d277f!2sStrada%20Tudor%20Vladimirescu%2070b%2C%20Durle%C5%9Fti%2C%20Moldova!5e0!3m2!1sro!2s!4v1777620468929!5m2!1sro!2s',
  };

  return (
    <div className="min-h-screen bg-white">
      {/* BREADCRUMB */}
      <div className="bg-white border-b">
        <div className="w-full px-6 py-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Link to="/" className="hover:text-[#a7cf26] transition">
              {t('contact.breadcrumb.home')}
            </Link>

            <ChevronRight className="w-4 h-4" />

            <span className="text-gray-900 font-semibold">
              {t('contact.breadcrumb.page')}
            </span>
          </div>
        </div>
      </div>

      <div className="w-full px-6 py-8">
        {/* MAP */}
        <div className="w-full h-[220px] md:h-[340px] rounded-[24px] overflow-hidden mb-10">
          <iframe
            src={finalContactInfo.mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title="Locație Google Maps"
            className="w-full h-full"
          />
        </div>

        {/* STORE CARD */}
        <div className="bg-[#f3f3f3] rounded-[28px] p-5 md:p-8 mb-10">
          {/* TOP */}
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
            <h1 className="text-[24px] md:text-[30px] font-extrabold text-[#252525]">
              Magazinul nostru Fizic
            </h1>

            <div className="text-[16px] md:text-[18px] text-[#7b7b7b] font-medium">
              {finalContactInfo.hours}
            </div>
          </div>

          {/* INNER CARD */}
          <div className="bg-white rounded-[24px] p-5 md:p-7">
            <div className="flex flex-col md:flex-row gap-5 md:gap-7">
              {/* IMAGE */}
              <div className="w-[95px] h-[95px] md:w-[120px] md:h-[120px] rounded-full overflow-hidden shrink-0 bg-gray-100">
                <img
                  src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=600&auto=format&fit=crop"
                  alt="Oficiu"
                  className="w-full h-full object-cover"
                />
              </div>

              {/* CONTENT */}
              <div className="flex-1">
                <h2 className="text-[20px] md:text-[22px] font-extrabold text-[#252525] mb-4">
                  Oficiu
                </h2>

                <div className="space-y-2 text-[15px] md:text-[18px] leading-[1.45]">
                  <p className="text-[#7a7a7a]">
                    Email:{' '}
                    <a
                      href={`mailto:${finalContactInfo.email}`}
                      className="font-bold text-[#303030]"
                    >
                      {finalContactInfo.email}
                    </a>
                  </p>

                  <p className="text-[#7a7a7a]">
                    Sună-ne:{' '}
                    <a
                      href={`tel:${finalContactInfo.phone}`}
                      className="font-bold text-[#303030]"
                    >
                      {finalContactInfo.phone}
                    </a>
                  </p>

                  <p className="text-[#7a7a7a]">
                    Addresa:{' '}
                    <span className="font-bold text-[#303030]">
                      {finalContactInfo.address}
                    </span>
                  </p>
                </div>

                <a
                  href="https://maps.google.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-5 text-[14px] font-bold text-[#303030] border-b-2 border-[#a7cf26] hover:text-[#a7cf26] transition"
                >
                  Vezi Pe Hartă
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* CONTACT FORM */}
        <div className="bg-[#f3f3f3] rounded-[28px] p-5 md:p-8">
          <h2 className="text-[24px] md:text-[30px] font-extrabold text-[#252525] mb-6">
            {t('contact.form.title')}
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.form.name')}
                </label>

                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#a7cf26]"
                  placeholder={t('contact.form.placeholderName')}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {t('contact.form.email')}
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#a7cf26]"
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
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#a7cf26]"
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
                onChange={(e) =>
                  setFormData({ ...formData, subject: e.target.value })
                }
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#a7cf26]"
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
                onChange={(e) =>
                  setFormData({ ...formData, message: e.target.value })
                }
                rows="5"
                className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#a7cf26]"
                placeholder={t('contact.form.placeholderMessage')}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="bg-[#a7cf26] text-white py-3 px-7 rounded-xl hover:bg-[#96bc21] transition font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
              {submitting
                ? t('contact.form.sending')
                : t('contact.form.send')}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
