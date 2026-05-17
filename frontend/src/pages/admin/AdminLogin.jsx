import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, ShieldCheck, Loader2 } from 'lucide-react';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';
import logo from '../../assets/images/logo.png';

const AdminLogin = () => {
  const navigate = useNavigate();
  const { adminLogin } = useAdmin();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await adminLogin(email, password);

      toast({
        title: 'Succes',
        description: 'Logat ca administrator!'
      });

      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Eroare',
        description:
          error.response?.data?.detail || 'Email sau parolă greșită',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#07130b] flex items-center justify-center p-4">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(132,204,22,0.28),transparent_34%),radial-gradient(circle_at_85%_15%,rgba(34,197,94,0.18),transparent_30%),radial-gradient(circle_at_50%_95%,rgba(132,204,22,0.20),transparent_36%)]" />

      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.06)_0%,transparent_35%,rgba(132,204,22,0.08)_100%)]" />

      <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-brand-500/20 blur-3xl" />

      <div className="absolute -right-24 bottom-20 h-80 w-80 rounded-full bg-lime-400/20 blur-3xl" />

      {/* Login Card */}
      <div className="relative z-10 w-full max-w-md">
        <div className="rounded-[32px] border border-white/10 bg-white/95 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          {/* Logo */}
          <div className="mb-8 text-center">
            <img
              src={logo}
              alt="Logo"
              className="mx-auto mb-6 h-auto w-auto max-h-[50px] object-contain"
            />

            {/* <div className="mx-auto mb-4 inline-flex items-center gap-2 rounded-full bg-brand-50 px-4 py-2 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 ring-1 ring-brand-100">
              <ShieldCheck className="h-4 w-4" />
              Admin Panel
            </div> */}

            <p className="text-sm leading-relaxed text-gray-500">
              Loghează-te pentru a gestiona produsele, comenzile și setările
              platformei.
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Email
              </label>

              <div className="relative">
                <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@agrosmart.md"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-gray-800">
                Parolă
              </label>

              <div className="relative">
                <Lock className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />

                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="Introduce parola"
                  className="w-full rounded-2xl border border-gray-200 bg-gray-50 py-3.5 pl-12 pr-4 text-sm font-medium text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-brand-400 focus:bg-white focus:ring-4 focus:ring-brand-100"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 flex w-full items-center justify-center gap-2 rounded-2xl bg-brand-500 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-brand-200 transition hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading && <Loader2 className="h-5 w-5 animate-spin" />}

              {loading ? 'Se verifică...' : 'Loghează-te'}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-8 border-t border-gray-100 pt-5 text-center text-xs text-gray-500">
            <p>© 2026 AgroSmart. Toate drepturile rezervate.</p>

            <p className="mt-1">
              Powered by{' '}
              <a
                href="https://nextify.md"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold text-brand-600 transition hover:text-brand-700 hover:underline"
              >
                Nextify
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;