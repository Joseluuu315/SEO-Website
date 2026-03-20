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
      case 'admin': return 'bg-rose-500';
      case 'paid': return 'bg-amber-500';
      case 'trial': return 'bg-emerald-500';
      default: return 'bg-gray-500';
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
    <div className="min-h-screen relative overflow-hidden bg-[#070711] text-white">
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <div className="mb-8">
            <p className="text-[10px] font-bold tracking-[0.35em] text-violet-400/70 uppercase mb-2">Mi Perfil</p>
            <h1 className="text-4xl font-extrabold tracking-tight text-white mb-2">Información Personal</h1>
            <p className="text-sm text-white/60">Gestiona tu perfil y preferencias de usuario.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
              message.includes('correctamente')
                ? 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
                : 'border-rose-500/20 bg-rose-500/8 text-rose-300'
            }`}>
              {message}
            </div>
          )}

          <div className="grid gap-8 md:grid-cols-2">
            {/* Profile Information */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Datos del Perfil</h2>
                <form onSubmit={handleSave} className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Nombre de usuario</label>
                    <input
                      type="text"
                      value={form.username}
                      onChange={e => setForm({ ...form, username: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Email</label>
                    <input
                      type="email"
                      value={form.email}
                      onChange={e => setForm({ ...form, email: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Contraseña actual</label>
                    <input
                      type="password"
                      value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold tracking-widest text-white/60">Nueva contraseña (opcional)</label>
                    <input
                      type="password"
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/20"
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-gradient-to-r from-violet-500 to-fuchsia-500 bg-[length:200%_200%] px-6 py-3 font-semibold text-white shadow-lg shadow-violet-500/20 transition hover:opacity-95 disabled:opacity-50"
                  >
                    {loading ? 'Guardando...' : 'Guardar Cambios'}
                  </button>
                </form>
              </div>
            </div>

            {/* Account Status */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4">Estado de la Cuenta</h2>
                <div className="space-y-4">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Rol Actual</span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${getRoleColor(user?.role)} text-white`}>
                        {getRoleLabel(user?.role)}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
                      {user?.role === 'admin' ? 'Acceso total a la plataforma y gestión de usuarios.' :
                       user?.role === 'paid' ? 'Acceso completo a todas las herramientas.' :
                       'Acceso limitado. Mejora a Paid para desbloquear todo.'}
                    </p>
                  </div>

                  {user?.temporaryUntil && (
                    <div className="rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-amber-300">Rol Temporal</span>
                        <span className="text-xs font-bold text-amber-400">
                          Tiempo restante:
                        </span>
                      </div>
                      <div className="text-lg font-bold text-amber-200 mb-1">
                        {getTimeRemaining()}
                      </div>
                      <p className="text-xs text-amber-400/70">
                        Expira: {new Date(user.temporaryUntil).toLocaleDateString()}
                      </p>
                    </div>
                  )}

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Estado</span>
                      <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                        user?.temporaryUntil ? 'text-amber-300' : 'text-emerald-300'
                      }`}>
                        {user?.temporaryUntil ? '⏰ Temporal' : '✅ Activo'}
                      </span>
                    </div>
                    <p className="text-xs text-white/60">
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
