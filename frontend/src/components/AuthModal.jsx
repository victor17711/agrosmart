import React, { useState } from 'react';
import { X, Mail, Lock, User, ArrowRight } from 'lucide-react';
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
        description:
          error.response?.data?.detail || t('auth.genericError'),
        variant: 'destructive'
      });
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const inputClass =
    'w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-[#a7cf26] focus:bg-white focus:ring-4 focus:ring-[#a7cf26]/20';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md overflow-hidden rounded-[32px] border border-white/10 bg-white shadow-[0_20px_80px_rgba(0,0,0,0.25)]">
        {/* TOP GRADIENT */}
        <div className="absolute inset-x-0 top-0 h-40 bg-[radial-gradient(circle_at_top,rgba(167,207,38,0.25),transparent_70%)] pointer-events-none" />

        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 z-10 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-black"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative p-8 sm:p-10">
          {/* LOGIN */}
          {mode === 'login' && (
            <>
              <div className="mb-8 text-center">
                {/* <div className="mb-4 inline-flex items-center rounded-full border border-[#a7cf26]/30 bg-[#a7cf26]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f8d13]">
                  Welcome Back
                </div> */}

                <h2 className="text-3xl font-black tracking-tight text-gray-950">
                  {t('auth.loginTitle')}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Conectează-te pentru a accesa contul tău și comenzile salvate.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.email')}
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.password')}
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMode('forgot')}
                  className="text-sm font-semibold text-[#7ca114] transition hover:text-[#6b8d0f]"
                >
                  {t('auth.forgotPassword')}
                </button>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a7cf26] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#a7cf26]/30 transition-all duration-200 hover:scale-[1.01] hover:bg-[#97bc1f]"
                >
                  {t('auth.loginButton')}

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                {t('auth.noAccount')}{' '}
                <button
                  onClick={() => setMode('register')}
                  className="font-bold text-[#7ca114] transition hover:text-[#5f7f0f]"
                >
                  {t('auth.createAccount')}
                </button>
              </p>
            </>
          )}

          {/* REGISTER */}
          {mode === 'register' && (
            <>
              <div className="mb-8 text-center">
                {/* <div className="mb-4 inline-flex items-center rounded-full border border-[#a7cf26]/30 bg-[#a7cf26]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f8d13]">
                  Create Account
                </div> */}

                <h2 className="text-3xl font-black tracking-tight text-gray-950">
                  {t('auth.registerTitle')}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Creează un cont nou și gestionează comenzile mai rapid.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      {t('auth.firstName')}
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        type="text"
                        name="firstName"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-bold text-gray-800">
                      {t('auth.lastName')}
                    </label>

                    <div className="relative">
                      <User className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                      <input
                        type="text"
                        name="lastName"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.email')}
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.password')}
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.confirmPassword')}
                  </label>

                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="password"
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a7cf26] py-3.5 text-sm font-extrabold text-white shadow-lg shadow-[#a7cf26]/30 transition-all duration-200 hover:scale-[1.01] hover:bg-[#97bc1f]"
                >
                  {t('auth.registerButton')}

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>

              <p className="mt-6 text-center text-sm text-gray-500">
                {t('auth.alreadyHaveAccount')}{' '}
                <button
                  onClick={() => setMode('login')}
                  className="font-bold text-[#7ca114] transition hover:text-[#5f7f0f]"
                >
                  {t('auth.loginButton')}
                </button>
              </p>
            </>
          )}

          {/* FORGOT */}
          {mode === 'forgot' && (
            <>
              <div className="mb-8 text-center">
                <div className="mb-4 inline-flex items-center rounded-full border border-[#a7cf26]/30 bg-[#a7cf26]/10 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-[#6f8d13]">
                  Reset Password
                </div>

                <h2 className="text-3xl font-black tracking-tight text-gray-950">
                  {t('auth.forgotTitle')}
                </h2>

                <p className="mt-2 text-sm leading-relaxed text-gray-500">
                  Introdu email-ul și îți vom trimite link-ul de resetare.
                </p>
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();

                  toast({
                    title: t('auth.success'),
                    description: t('auth.resetLinkSent')
                  });
                }}
                className="space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-bold text-gray-800">
                    {t('auth.email')}
                  </label>

                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                    <input
                      type="email"
                      name="email"
                      required
                      className={inputClass}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-[#a7cf26] py-3.5 text-sm font-extrabold text-black shadow-lg shadow-[#a7cf26]/30 transition-all duration-200 hover:scale-[1.01] hover:bg-[#97bc1f]"
                >
                  {t('auth.resetPasswordButton')}

                  <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" />
                </button>
              </form>

              <button
                onClick={() => setMode('login')}
                className="mt-6 text-sm font-semibold text-[#7ca114] transition hover:text-[#5f7f0f]"
              >
                ← {t('auth.backToLogin')}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AuthModal;