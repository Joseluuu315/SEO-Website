import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, token } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    username: '',
    email: '',
    currentPassword: '',
    newPassword: ''
  });
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultAiModel: 'gpt-4o-mini',
    exportFormat: 'pdf',
    notifications: true,
    autoSave: true,
    language: 'es'
  });

  useEffect(() => {
    if (user) {
      setForm({
        username: user.username || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: ''
      });
    }
  }, [user]);

  useEffect(() => {
    // Load preferences from backend
    const loadPreferences = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/preferences', {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          const loadedPrefs = data.preferences || preferences;
          setPreferences(loadedPrefs);
          
          // Apply theme to document
          if (loadedPrefs.theme === 'light') {
            document.documentElement.classList.add('light');
            document.documentElement.classList.remove('dark');
          } else {
            document.documentElement.classList.add('dark');
            document.documentElement.classList.remove('light');
          }
        }
      } catch (err) {
        console.log('Using default preferences');
        // Apply default theme
        document.documentElement.classList.add('dark');
        document.documentElement.classList.remove('light');
      }
    };
    loadPreferences();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const showMsg = (text, type = 'success') => {
    setMessage(text);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.currentPassword && (form.newPassword || form.username !== user?.username || form.email !== user?.email)) {
      showMsg('Debes introducir tu contraseña actual para guardar cambios', 'error');
      return;
    }
    setLoading(true);
    setMessage('');
    try {
      const payload = {};
      if (form.username !== user?.username) payload.username = form.username;
      if (form.email !== user?.email) payload.email = form.email;
      if (form.newPassword) payload.password = form.newPassword;
      if (Object.keys(payload).length === 0) {
        showMsg('No hay cambios que guardar', 'info');
        setLoading(false);
        return;
      }
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...payload, currentPassword: form.currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      showMsg('Perfil actualizado correctamente');
      setForm({ ...form, currentPassword: '', newPassword: '' });
    } catch (e) {
      showMsg(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin': return preferences.theme === 'dark' ? 'bg-rose-500' : 'bg-rose-600';
      case 'paid': return preferences.theme === 'dark' ? 'bg-amber-500' : 'bg-amber-600';
      case 'trial': return preferences.theme === 'dark' ? 'bg-emerald-500' : 'bg-emerald-600';
      default: return preferences.theme === 'dark' ? 'bg-gray-500' : 'bg-gray-600';
    }
  };

  const getRoleLabel = (role) => {
    switch (role) {
      case 'admin': return 'Super Admin';
      case 'paid': return 'Usuario Pagado';
      case 'trial': return 'Trial (Gratis)';
      default: return 'Desconocido';
    }
  };

  const getTimeRemaining = () => {
    if (!user?.temporaryUntil) return null;
    
    const now = new Date();
    const expiry = new Date(user.temporaryUntil);
    const diff = expiry - now;
    
    if (diff <= 0) return 'Expirado';
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days}d ${hours}h ${minutes}m`;
  };

  useEffect(() => {
    const interval = setInterval(() => {
      // Force re-render to update countdown
      if (user?.temporaryUntil) {
        const now = new Date();
        const expiry = new Date(user.temporaryUntil);
        if (now >= expiry) {
          // Role expired, refresh user data
          window.location.reload();
        }
      }
    }, 60000); // Check every minute

    return () => clearInterval(interval);
  }, [user?.temporaryUntil]);

  return (
    <div className={`min-h-screen relative overflow-hidden ${
      preferences.theme === 'dark' 
        ? 'bg-[#070711] text-white' 
        : 'bg-[#f8fafc] text-gray-900'
    }`}>
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-cyan-500/14' : 'bg-cyan-400/20'
        }`} />
        <div className={`absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-fuchsia-500/12' : 'bg-fuchsia-400/15'
        }`} style={{ animationDelay: '1.4s' }} />
        <div className={`absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-400/12'
        }`} style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12">
        <div className={`rounded-3xl border p-8 backdrop-blur-xl ${
          preferences.theme === 'dark'
            ? 'border-white/10 bg-white/5'
            : 'border-gray-200 bg-white shadow-lg'
        }`}>
          <div className="mb-8">
            <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${
              preferences.theme === 'dark' ? 'text-violet-400/70' : 'text-violet-600'
            }`}>Mi Perfil</p>
            <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${
              preferences.theme === 'dark' ? 'text-white' : 'text-gray-900'
            }`}>Información Personal</h1>
            <p className={`text-sm ${
              preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
            }`}>Gestiona tu perfil y preferencias de usuario.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
              message.includes('correctamente')
                ? preferences.theme === 'dark' 
                  ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
                  : 'border-emerald-500/30 bg-emerald-50 text-emerald-700'
                : preferences.theme === 'dark'
                  ? 'border-rose-500/20 bg-rose-500/8 text-rose-300'
                  : 'border-rose-500/30 bg-rose-50 text-rose-700'
            }`}>
              {message}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {/* Profile Information */}
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${
                  preferences.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Datos del Perfil</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className={`text-xs font-semibold tracking-widest block mb-2 ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Nombre de usuario
                    </label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                        preferences.theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-violet-400/50 focus:ring-violet-400/20'
                          : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold tracking-widest block mb-2 ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Email
                    </label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                        preferences.theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-violet-400/50 focus:ring-violet-400/20'
                          : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold tracking-widest block mb-2 ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Contraseña actual
                    </label>
                    <input
                      type="password"
                      value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                        preferences.theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-violet-400/50 focus:ring-violet-400/20'
                          : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500'
                      }`}
                    />
                  </div>
                  <div>
                    <label className={`text-xs font-semibold tracking-widest block mb-2 ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      Nueva contraseña (opcional)
                    </label>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${
                        preferences.theme === 'dark'
                          ? 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-violet-400/50 focus:ring-violet-400/20'
                          : 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500'
                      }`}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full rounded-xl px-6 py-3 font-semibold shadow-lg transition hover:opacity-95 disabled:opacity-50 ${
                      preferences.theme === 'dark'
                        ? 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-violet-500/20'
                        : 'bg-gradient-to-r from-violet-600 to-fuchsia-600 text-white shadow-violet-600/25'
                    }`}
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-semibold mb-4 ${
                  preferences.theme === 'dark' ? 'text-white' : 'text-gray-900'
                }`}>Estado de la Cuenta</h2>
                <div className="space-y-4">
                  <div className={`rounded-xl border p-4 ${
                    preferences.theme === 'dark'
                      ? 'border-white/10 bg-white/5'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        preferences.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Rol Actual</span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${getRoleColor(user?.role)} text-white`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      {user?.role === 'admin' ? 'Acceso total a la plataforma y gestión de usuarios.' :
                       user?.role === 'paid' ? 'Acceso completo a todas las herramientas.' :
                       'Acceso limitado. Mejora a Paid para desbloquear todo.'}
                    </p>
                  </div>

                  {user?.temporaryUntil && (
                    <div className={`rounded-xl border p-4 ${
                      preferences.theme === 'dark'
                        ? 'border-amber-500/20 bg-amber-500/10'
                        : 'border-amber-500/30 bg-amber-50'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className={`text-sm font-medium ${
                          preferences.theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                        }`}>Rol Temporal</span>
                        <span className={`text-xs font-bold ${
                          preferences.theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        }`}>
                          Tiempo restante:
                        </span>
                      </div>
                      <div className={`text-lg font-bold mb-1 ${
                        preferences.theme === 'dark' ? 'text-amber-200' : 'text-amber-800'
                      }`}>
                        {getTimeRemaining()}
                      </div>
                      <p className={`text-xs ${
                        preferences.theme === 'dark' ? 'text-amber-400/70' : 'text-amber-600'
                      }`}>
                        Expira: {new Date(user.temporaryUntil).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className={`rounded-xl border p-4 ${
                    preferences.theme === 'dark'
                      ? 'border-white/10 bg-white/5'
                      : 'border-gray-200 bg-white'
                  }`}>
                    <div className="flex items-center justify-between mb-2">
                      <span className={`text-sm font-medium ${
                        preferences.theme === 'dark' ? 'text-white' : 'text-gray-900'
                      }`}>Estado</span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                        user?.temporaryUntil 
                          ? preferences.theme === 'dark' ? 'text-amber-300' : 'text-amber-700'
                          : preferences.theme === 'dark' ? 'text-emerald-300' : 'text-emerald-700'
                      }`}>
                        {user?.temporaryUntil ? '⏰ Temporal' : '✅ Activo'}
                      </span>
                    </div>
                    <p className={`text-xs ${
                      preferences.theme === 'dark' ? 'text-white/60' : 'text-gray-600'
                    }`}>
                      {user?.temporaryUntil 
                        ? 'Tu rol actual es temporal y expirará en la fecha indicada.' 
                        : 'Tu cuenta está activa y sin restricciones temporales.'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
