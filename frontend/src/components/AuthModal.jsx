import React, { useState } from 'react';
import { X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { toast } from '../hooks/use-toast';

const AuthModal = ({ isOpen, onClose, mode, setMode }) => {
  const { login, register } = useAuth();
  const { t } = useLanguage();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password);
        toast({
          title: t('auth.success'),
          description: t('auth.loginSuccess')
        });
        onClose();
      } else if (mode === 'register') {
        if (formData.password !== formData.confirmPassword) {
          toast({
            title: t('auth.error'),
            description: t('auth.passwordsDoNotMatch'),
            variant: 'destructive'
          });
          return;
        }

        await register(
          formData.firstName,
          formData.lastName,
          formData.email,
          formData.password
        );

        toast({
          title: t('auth.success'),
          description: t('auth.registerSuccess')
        });
        onClose();
      }
    } catch (error) {
      toast({
        title: t('auth.error'),
        description: error.response?.data?.detail || t('auth.genericError'),
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {mode === 'login' && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t('auth.loginTitle')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="button"
                onClick={() => setMode('forgot')}
                className="text-sm text-teal-600 hover:underline"
              >
                {t('auth.forgotPassword')}
              </button>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
              >
                {t('auth.loginButton')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm">
              {t('auth.noAccount')}{' '}
              <button
                onClick={() => setMode('register')}
                className="text-teal-600 hover:underline font-semibold"
              >
                {t('auth.createAccount')}
              </button>
            </p>
          </>
        )}

        {mode === 'register' && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t('auth.registerTitle')}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.firstName')} *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-1">
                    {t('auth.lastName')} *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.password')} *
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.confirmPassword')} *
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
              >
                {t('auth.registerButton')}
              </button>
            </form>

            <p className="mt-4 text-center text-sm">
              {t('auth.alreadyHaveAccount')}{' '}
              <button
                onClick={() => setMode('login')}
                className="text-teal-600 hover:underline font-semibold"
              >
                {t('auth.loginButton')}
              </button>
            </p>
          </>
        )}

        {mode === 'forgot' && (
          <>
            <h2 className="text-2xl font-bold mb-6">{t('auth.forgotTitle')}</h2>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                toast({
                  title: t('auth.success'),
                  description: t('auth.resetLinkSent')
                });
              }}
              className="space-y-4"
            >
              <div>
                <label className="block text-sm font-medium mb-1">
                  {t('auth.email')} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-teal-600 text-white py-2 rounded-md hover:bg-teal-700 transition"
              >
                {t('auth.resetPasswordButton')}
              </button>
            </form>

            <button
              onClick={() => setMode('login')}
              className="mt-4 text-sm text-teal-600 hover:underline"
            >
              {t('auth.backToLogin')}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default AuthModal;