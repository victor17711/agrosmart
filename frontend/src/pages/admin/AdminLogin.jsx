import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdmin } from '../../context/AdminContext';
import { toast } from '../../hooks/use-toast';

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
      toast({ title: 'Succes', description: 'Logat ca administrator!' });
      navigate('/admin/dashboard');
    } catch (error) {
      toast({
        title: 'Eroare',
        description: error.response?.data?.detail || 'Email sau parolă greșită',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-brand-500 via-brand-500 to-brand-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-4">
            <span className="text-4xl font-extrabold tracking-tight text-brand-700">
              Agro<span className="text-brand-500">Smart</span>
            </span>
          </div>
          <p className="text-gray-600 text-lg">Loghează-te în panoul de administrare</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="admin@agrosmart.md"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Parolă</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Parola"
              className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-brand-500 to-brand-600 text-white py-3 rounded-xl hover:from-brand-500 hover:to-brand-600 transition font-bold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Se încarcă...' : 'Loghează-te'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-500">
          <p>© 2026 Domix. Toate drepturile rezervate.</p>
          <p className="mt-1">
            Powered by{" "}
            <a
              href="https://nextify.md"
              target="_blank"
              rel="noopener noreferrer"
              className="text-brand-600 font-semibold hover:underline transition"
            >
              Nextify
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
