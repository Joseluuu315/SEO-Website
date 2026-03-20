import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user, token, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', email: user.email || '', currentPassword: '', newPassword: '' });
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.currentPassword && (form.newPassword || form.username !== user?.username || form.email !== user?.email)) {
      setMessage('Debes introducir tu contraseña actual para guardar cambios');
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
        setMessage('No hay cambios que guardar');
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
      setMessage('Perfil actualizado correctamente');
      setEditing(false);
      setForm({ ...form, currentPassword: '', newPassword: '' });
      setTimeout(() => setMessage(''), 3000);
    } catch (e) {
      setMessage(e.message);
    } finally {
      setLoading(false);
    }
  };

  const userRole = user?.role || 'trial';
  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';
  const isPaid = userRole === 'paid' || isSuperAdmin;

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-xs font-semibold tracking-[0.2em] text-white/60">PERFIL</div>
              <div className="mt-1 text-2xl font-semibold">Mi cuenta</div>
              <p className="mt-2 text-sm text-white/70">Gestiona tu perfil y rol en la plataforma.</p>
            </div>
            <button
              type="button"
              onClick={() => setEditing(!editing)}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
            >
              {editing ? 'Cancelar' : 'Editar'}
            </button>
          </div>

          {message && (
            <div className={`mt-4 rounded-2xl border px-4 py-3 text-sm ${
              message.includes('correctamente')
                ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                : 'border-rose-500/30 bg-rose-500/10 text-rose-100'
            }`}>
              {message}
            </div>
          )}

          <form onSubmit={handleSave} className="mt-6 space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Nombre de usuario</label>
                <input
                  type="text"
                  value={form.username}
                  onChange={e => setForm({ ...form, username: e.target.value })}
                  disabled={!editing}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  disabled={!editing}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 disabled:opacity-50"
                />
              </div>
            </div>

            {(editing || form.newPassword) && (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Contraseña actual</label>
                  <input
                    type="password"
                    value={form.currentPassword}
                    onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Nueva contraseña (opcional)</label>
                  <input
                    type="password"
                    value={form.newPassword}
                    onChange={e => setForm({ ...form, newPassword: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>
            )}

            {editing && (
              <button
                type="submit"
                disabled={loading}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-6 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading ? 'Guardando...' : 'Guardar cambios'}
              </button>
            )}
          </form>

          <div className="mt-8 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold tracking-[0.18em] text-white/60">ROL ACTUAL</div>
              <div className="mt-2">
                <div className="flex items-center gap-2">
                  <div className={`h-3 w-3 rounded-full ${
                    isSuperAdmin ? 'bg-rose-500' : isPaid ? 'bg-amber-500' : 'bg-emerald-500'
                  }`} />
                  <div className="text-sm font-semibold">
                    {isSuperAdmin ? 'Super Admin' : isPaid ? 'Usuario Pagado' : 'Trial (Gratis)'}
                  </div>
                </div>
                <div className="mt-2 text-xs text-white/60">
                  {isSuperAdmin
                    ? 'Acceso total a la plataforma y gestión de usuarios.'
                    : isPaid
                    ? 'Acceso completo a todas las herramientas.'
                    : 'Acceso limitado. Mejora a Paid para desbloquear todo.'}
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold tracking-[0.18em] text-white/60">ESTADO DE LA CUENTA</div>
              <div className="mt-2 text-sm">
                {isPaid ? (
                  <div className="text-emerald-400">
                    ✅ Tu cuenta está activa. Disfruta de todas las funciones.
                  </div>
                ) : (
                  <div className="text-amber-400">
                    ⚠️ Estás en período de prueba. Algunas funciones están limitadas.
                    <button
                      type="button"
                      onClick={() => alert('Redirigir a página de pago...')}
                      className="ml-2 underline hover:text-amber-300 transition"
                    >
                      Mejorar plan
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              type="button"
              onClick={logout}
              className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-6 py-3 font-semibold text-rose-100 hover:bg-rose-500/15 transition"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
