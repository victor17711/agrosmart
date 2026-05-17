import React, { useState, useEffect } from 'react';
import { useAdmin } from '../../context/AdminContext';
import axios from 'axios';
import { Trash2, Search, Mail, Plus, X } from 'lucide-react';
import { toast } from '../../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const UsersManagement = () => {
  const { getAuthHeaders } = useAdmin();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    role: 'user'
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`, getAuthHeaders());
      setUsers(response.data);
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-au putut încărca utilizatorii',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`${API}/auth/register`, formData);

      toast({
        title: 'Succes',
        description: 'Utilizatorul a fost creat!'
      });

      setShowModal(false);

      setFormData({
        email: '',
        password: '',
        firstName: '',
        lastName: '',
        role: 'user'
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Eroare',
        description:
          error.response?.data?.detail ||
          'Nu s-a putut crea utilizatorul',
        variant: 'destructive'
      });
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Sigur doriți să ștergeți acest utilizator?')) return;

    try {
      await axios.delete(
        `${API}/admin/users/${id}`,
        getAuthHeaders()
      );

      toast({
        title: 'Succes',
        description: 'Utilizatorul a fost șters!'
      });

      fetchUsers();
    } catch (error) {
      toast({
        title: 'Eroare',
        description: 'Nu s-a putut șterge utilizatorul',
        variant: 'destructive'
      });
    }
  };

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm text-gray-900">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight">
              Gestionare Utilizatori
            </h2>

            <p className="text-gray-500 text-sm mt-1">
              Total:{' '}
              <span className="font-semibold text-gray-800">
                {filteredUsers.length}
              </span>{' '}
              utilizatori
            </p>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white px-5 py-2.5 rounded-full font-semibold shadow-md shadow-brand-200 transition"
          >
            <Plus className="w-5 h-5" />
            Adaugă Utilizator
          </button>
        </div>

        {/* Search */}
        <div className="mt-5 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[240px]">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />

            <input
              type="text"
              placeholder="Caută utilizatori..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-100 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-brand-200 focus:bg-white transition"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50/60">
              <tr className="text-left text-gray-500 text-[11px] uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Utilizator</th>
                <th className="px-6 py-4 font-semibold">Email</th>
                <th className="px-6 py-4 font-semibold">Rol</th>
                <th className="px-6 py-4 font-semibold text-right pr-8">
                  Acțiuni
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {filteredUsers.map((user) => (
                <tr
                  key={user.id}
                  className="bg-white hover:bg-brand-50/40 transition"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="bg-gradient-to-br from-brand-500 to-brand-600 text-white w-12 h-12 rounded-2xl flex items-center justify-center font-bold text-sm shadow-md shadow-brand-200">
                        {user.firstName?.[0]}
                        {user.lastName?.[0]}
                      </div>

                      <div>
                        <div className="font-semibold text-gray-900">
                          {user.firstName} {user.lastName}
                        </div>
                      </div>
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2 text-gray-700">
                      <Mail className="w-4 h-4 text-gray-400" />
                      {user.email}
                    </div>
                  </td>

                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                        user.role === 'admin'
                          ? 'bg-purple-50 text-purple-700 ring-1 ring-purple-100'
                          : user.role === 'manager'
                          ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-100'
                          : 'bg-brand-50 text-brand-700 ring-1 ring-brand-100'
                      }`}
                    >
                      {user.role === 'admin'
                        ? 'Administrator'
                        : user.role === 'manager'
                        ? 'Manager'
                        : 'Utilizator'}
                    </span>
                  </td>

                  <td className="px-6 py-4">
                    <div className="flex justify-end pr-2">
                      <button
                        onClick={() => handleDelete(user.id)}
                        title="Șterge utilizator"
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

        {filteredUsers.length === 0 && (
          <div className="px-6 py-14 text-center border-t border-gray-100">
            <p className="text-lg font-semibold text-gray-800">
              Nu există utilizatori
            </p>

            <p className="text-sm text-gray-500 mt-1">
              Încearcă alt termen de căutare sau adaugă un utilizator nou.
            </p>
          </div>
        )}
      </div>

      {/* Modal Add User */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-gray-100">
            <div className="sticky top-0 z-10 bg-white/95 backdrop-blur px-6 py-5 flex justify-between items-center border-b border-gray-100 rounded-t-3xl">
              <div>
                <h3 className="text-2xl font-extrabold tracking-tight text-gray-900">
                  Adaugă Utilizator
                </h3>

                <p className="text-sm text-gray-500 mt-0.5">
                  Creează rapid un cont nou în platformă
                </p>
              </div>

              <button
                onClick={() => setShowModal(false)}
                className="w-10 h-10 rounded-full bg-gray-50 hover:bg-gray-100 text-gray-600 flex items-center justify-center transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Prenume *
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        firstName: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-700 mb-2">
                    Nume *
                  </label>

                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        lastName: e.target.value
                      })
                    }
                    className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Email *
                </label>

                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      email: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Parolă *
                </label>

                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      password: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">
                  Rol *
                </label>

                <select
                  value={formData.role}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      role: e.target.value
                    })
                  }
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-brand-200 focus:border-brand-400"
                >
                  <option value="user">Utilizator (Client)</option>
                  <option value="manager">
                    Manager (Produse & Comenzi)
                  </option>
                  <option value="admin">
                    Administrator (Acces Total)
                  </option>
                </select>

                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  • Utilizator: Client normal fără acces admin
                  <br />
                  • Manager: Acces doar la Produse și Comenzi
                  <br />• Administrator: Acces complet la toate secțiunile
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 bg-brand-500 text-white py-3 rounded-xl hover:bg-brand-600 transition font-semibold shadow-md shadow-brand-200"
                >
                  Creează Utilizator
                </button>

                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200 transition font-semibold"
                >
                  Anulează
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;