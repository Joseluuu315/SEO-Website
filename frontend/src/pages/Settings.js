import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

/* ─────────────────────────────────────────────
   Tiny helper: animated noise grain overlay
───────────────────────────────────────────── */
const GRAIN = `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`;

/* ─────────────────────────────────────────────
   Sub-components
───────────────────────────────────────────── */
const SectionLabel = ({ children }) => (
  <p className="mb-5 text-[10px] font-bold tracking-[0.3em] text-white/30 uppercase">{children}</p>
);

const Field = ({ label, children }) => (
  <div className="flex flex-col gap-1.5">
    <label className="text-[11px] font-semibold tracking-widest text-white/40 uppercase">{label}</label>
    {children}
  </div>
);

const Input = (props) => (
  <input
    {...props}
    className={`w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white
      placeholder:text-white/20 outline-none ring-0
      transition-all duration-200
      focus:border-violet-400/50 focus:bg-white/6 focus:ring-2 focus:ring-violet-400/15
      disabled:cursor-not-allowed disabled:opacity-35
      ${props.className ?? ''}`}
  />
);

const Toggle = ({ checked, onChange, label }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className="group flex w-full items-center justify-between rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white/80 transition hover:bg-white/6"
  >
    <span>{label}</span>
    <span
      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-300 ${
        checked ? 'bg-violet-500' : 'bg-white/15'
      }`}
    >
      <span
        className={`absolute h-3.5 w-3.5 rounded-full bg-white shadow transition-all duration-300 ${
          checked ? 'left-[18px]' : 'left-[3px]'
        }`}
      />
    </span>
  </button>
);

const Select = ({ value, onChange, options, disabled }) => (
  <select
    value={value}
    onChange={e => onChange(e.target.value)}
    disabled={disabled}
    className="w-full rounded-xl border border-white/8 bg-white/4 px-4 py-3 text-sm text-white outline-none
      focus:border-violet-400/50 focus:ring-2 focus:ring-violet-400/15
      disabled:opacity-35 disabled:cursor-not-allowed
      appearance-none cursor-pointer"
  >
    {options.map(o => (
      <option key={o.value} value={o.value} className="bg-[#0d0d1a] text-white">
        {o.label}
      </option>
    ))}
  </select>
);

/* ─────────────────────────────────────────────
   Main Settings component
───────────────────────────────────────────── */
const Settings = () => {
  const { user, token, logout } = useAuth();

  /* ── Profile ── */
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setForm(f => ({ ...f, username: user.username ?? '', email: user.email ?? '' }));
    }
  }, [user]);

  const showMsg = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3500);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    const changed =
      form.username !== (user?.username ?? '') ||
      form.email !== (user?.email ?? '') ||
      form.newPassword;

    if (changed && !form.currentPassword) {
      showMsg('Debes introducir tu contraseña actual para guardar cambios', 'error');
      return;
    }

    const payload = {};
    if (form.username !== user?.username) payload.username = form.username;
    if (form.email !== user?.email) payload.email = form.email;
    if (form.newPassword) payload.password = form.newPassword;

    if (!Object.keys(payload).length) {
      showMsg('No hay cambios que guardar', 'info');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/auth/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...payload, currentPassword: form.currentPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error desconocido');
      showMsg('Perfil actualizado correctamente ✓');
      setEditing(false);
      setForm(f => ({ ...f, currentPassword: '', newPassword: '' }));
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  /* ── Preferences ── */
  const defaultPrefs = {
    theme: 'dark',
    defaultAiModel: 'gpt-4o-mini',
    exportFormat: 'pdf',
    notifications: true,
    autoSave: true,
    language: 'es',
  };
  const [preferences, setPreferences] = useState(defaultPrefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load preferences from backend
    const loadPreferences = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/preferences', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (res.ok && data.preferences) {
          setPreferences(data.preferences);
        }
      } catch (err) {
        // Fallback to localStorage if backend fails
        try {
          const saved = localStorage.getItem('seoAnalyzerPreferences');
          if (saved) setPreferences(JSON.parse(saved));
        } catch {}
      }
    };
    loadPreferences();
  }, [token]);

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage('');
    try {
      // Save to backend via API
      const res = await fetch('http://localhost:5000/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error guardando preferencias');
      showMsg('Preferencias guardadas ✓');
    } catch (err) {
      showMsg(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restablecer todas las preferencias?')) return;
    try {
      const res = await fetch('http://localhost:5000/api/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(defaultPrefs),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Error restableciendo preferencias');
      setPreferences(defaultPrefs);
      showMsg('Preferencias restablecidas');
    } catch (err) {
      showMsg(err.message, 'error');
    }
  };

  /* ── Role ── */
  const userRole = user?.role ?? 'trial';
  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';
  const isPaid = userRole === 'paid' || isSuperAdmin;

  const roleLabel = isSuperAdmin ? 'Super Admin' : isPaid ? 'Pro' : 'Trial';
  const roleColor = isSuperAdmin
    ? 'from-rose-400 to-orange-400'
    : isPaid
    ? 'from-amber-300 to-yellow-500'
    : 'from-emerald-400 to-teal-400';
  const roleDesc = isSuperAdmin
    ? 'Acceso total a la plataforma y gestión de usuarios.'
    : isPaid
    ? 'Acceso completo a todas las herramientas y exportaciones.'
    : 'Acceso limitado. Mejora a Pro para desbloquear todo.';

  /* ── Delete account ── */
  const handleDeleteAccount = () => {
    if (!window.confirm('¿Eliminar todos tus datos? Esta acción no se puede deshacer.')) return;
    // TODO: call backend to delete user data
    alert('Función no implementada aún');
  };

  /* ─────────── render ─────────── */
  return (
    <>
      {/* ── Google Fonts ── */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        .settings-root { font-family: 'DM Sans', sans-serif; }
        .settings-root h1, .settings-root .display { font-family: 'Syne', sans-serif; }

        @keyframes blob {
          0%,100% { transform: translate(0,0) scale(1); }
          33%      { transform: translate(30px,-20px) scale(1.07); }
          66%      { transform: translate(-20px,15px) scale(0.95); }
        }
        .blob { animation: blob 9s ease-in-out infinite; }
        .blob-2 { animation: blob 11s ease-in-out infinite reverse; animation-delay: 2s; }
        .blob-3 { animation: blob 13s ease-in-out infinite; animation-delay: 4.5s; }

        @keyframes slideIn {
          from { opacity:0; transform:translateY(12px); }
          to   { opacity:1; transform:translateY(0); }
        }
        .slide-in { animation: slideIn 0.35s ease forwards; }

        @keyframes shimmer {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }
        .btn-gradient {
          background: linear-gradient(135deg, #7c3aed, #a855f7, #6366f1, #8b5cf6);
          background-size: 300% 300%;
          animation: shimmer 4s ease infinite;
        }
        .btn-gradient:hover { filter: brightness(1.12); }

        .card {
          border: 1px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.03);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
        }
        .divider { border-color: rgba(255,255,255,0.06); }

        select option { background: #0d0d1a; }
      `}</style>

      <div className="settings-root min-h-screen relative overflow-x-hidden bg-[#070711] text-white">

        {/* ── Ambient blobs ── */}
        <div className="pointer-events-none fixed inset-0 overflow-hidden" aria-hidden>
          <div className="blob absolute -top-40 -left-40 h-[500px] w-[500px] rounded-full bg-violet-600/12 blur-[100px]" />
          <div className="blob-2 absolute top-1/3 -right-48 h-[420px] w-[420px] rounded-full bg-fuchsia-500/10 blur-[90px]" />
          <div className="blob-3 absolute -bottom-60 left-1/3 h-[480px] w-[480px] rounded-full bg-indigo-500/10 blur-[110px]" />
          <div
            className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: GRAIN, backgroundSize: '200px 200px' }}
          />
        </div>

        <div className="relative mx-auto w-full max-w-3xl px-4 py-12 pb-24">

          {/* ── Page header ── */}
          <div className="mb-10 slide-in">
            <p className="text-[10px] font-bold tracking-[0.35em] text-violet-400/70 uppercase mb-2">Cuenta</p>
            <h1 className="display text-4xl font-extrabold tracking-tight text-white">Configuración</h1>
            <p className="mt-2 text-sm text-white/40">Gestiona tu perfil, preferencias y seguridad.</p>
          </div>

          {/* ── Toast ── */}
          {message.text && (
            <div
              className={`slide-in mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
                message.type === 'error'
                  ? 'border-rose-500/20 bg-rose-500/8 text-rose-300'
                  : message.type === 'info'
                  ? 'border-white/10 bg-white/5 text-white/60'
                  : 'border-emerald-500/20 bg-emerald-500/8 text-emerald-300'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* ══════════════════════════════════
              CARD 1 · Perfil
          ══════════════════════════════════ */}
          <section className="card rounded-3xl p-7 mb-5 slide-in">
            <div className="flex items-center justify-between mb-6">
              <SectionLabel>Perfil</SectionLabel>
              <button
                type="button"
                onClick={() => setEditing(v => !v)}
                className="text-[11px] font-semibold tracking-widest text-violet-400 hover:text-violet-300 transition uppercase"
              >
                {editing ? 'Cancelar' : 'Editar'}
              </button>
            </div>

            {/* Avatar area */}
            <div className="flex items-center gap-4 mb-7">
              <div className="relative flex-shrink-0 h-16 w-16 rounded-2xl bg-gradient-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-xl font-bold shadow-lg shadow-violet-500/20">
                {(user?.username ?? user?.email ?? '?')[0].toUpperCase()}
              </div>
              <div>
                <p className="font-semibold text-white">{user?.username ?? 'Usuario'}</p>
                <p className="text-xs text-white/40 mt-0.5">{user?.email ?? ''}</p>
                <span className={`mt-1.5 inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-widest uppercase bg-gradient-to-r ${roleColor} bg-clip-text`}
                  style={{ WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  ● {roleLabel}
                </span>
              </div>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <Field label="Nombre de usuario">
                  <Input
                    type="text"
                    value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    disabled={!editing}
                    placeholder="tu_nombre"
                  />
                </Field>
                <Field label="Email">
                  <Input
                    type="email"
                    value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    disabled={!editing}
                    placeholder="correo@ejemplo.com"
                  />
                </Field>
              </div>

              {editing && (
                <div className="grid gap-4 sm:grid-cols-2 pt-1">
                  <Field label="Contraseña actual">
                    <Input
                      type="password"
                      value={form.currentPassword}
                      onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </Field>
                  <Field label="Nueva contraseña (opcional)">
                    <Input
                      type="password"
                      value={form.newPassword}
                      onChange={e => setForm({ ...form, newPassword: e.target.value })}
                      placeholder="••••••••"
                    />
                  </Field>
                </div>
              )}

              {editing && (
                <div className="flex justify-end pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-gradient rounded-xl px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
                  >
                    {loading ? 'Guardando…' : 'Guardar cambios'}
                  </button>
                </div>
              )}
            </form>
          </section>

          {/* ══════════════════════════════════
              CARD 2 · Preferencias
          ══════════════════════════════════ */}
          <section className="card rounded-3xl p-7 mb-5 slide-in" style={{ animationDelay: '0.05s' }}>
            <SectionLabel>Preferencias</SectionLabel>

            <div className="space-y-3">
              <Toggle
                checked={preferences.notifications}
                onChange={v => setPreferences(p => ({ ...p, notifications: v }))}
                label="Notificaciones"
              />
              <Toggle
                checked={preferences.autoSave}
                onChange={v => setPreferences(p => ({ ...p, autoSave: v }))}
                label="Guardar automáticamente"
              />
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <Field label="Tema">
                <Select
                  value={preferences.theme}
                  onChange={v => {
                    setPreferences(p => ({ ...p, theme: v }));
                    // Apply theme immediately
                    if (v === 'light') {
                      document.documentElement.classList.remove('dark');
                      document.body.style.backgroundColor = '#ffffff';
                      document.body.style.color = '#000000';
                    } else if (v === 'dark') {
                      document.documentElement.classList.add('dark');
                      document.body.style.backgroundColor = '#070711';
                      document.body.style.color = '#ffffff';
                    } else {
                      // System theme
                      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                      if (prefersDark) {
                        document.documentElement.classList.add('dark');
                        document.body.style.backgroundColor = '#070711';
                        document.body.style.color = '#ffffff';
                      } else {
                        document.documentElement.classList.remove('dark');
                        document.body.style.backgroundColor = '#ffffff';
                        document.body.style.color = '#000000';
                      }
                    }
                  }}
                  options={[
                    { value: 'dark', label: '🌑 Oscuro' },
                    { value: 'light', label: '☀️ Claro' },
                    { value: 'system', label: '⚙️ Sistema' },
                  ]}
                />
              </Field>
              <Field label="Modelo IA">
                <Select
                  value={preferences.defaultAiModel}
                  onChange={v => setPreferences(p => ({ ...p, defaultAiModel: v }))}
                  options={[
                    { value: 'gpt-4o-mini', label: 'GPT-4o Mini' },
                    { value: 'gpt-4o', label: 'GPT-4o' },
                    { value: 'claude-3-5-sonnet', label: 'Claude Sonnet' },
                  ]}
                />
              </Field>
              <Field label="Exportar como">
                <Select
                  value={preferences.exportFormat}
                  onChange={v => setPreferences(p => ({ ...p, exportFormat: v }))}
                  options={[
                    { value: 'pdf', label: 'PDF' },
                    { value: 'csv', label: 'CSV' },
                    { value: 'json', label: 'JSON' },
                  ]}
                />
              </Field>
            </div>

            <div className="mt-5 flex items-center justify-between">
              <button
                type="button"
                onClick={handleReset}
                className="text-[11px] font-semibold tracking-widest text-white/30 hover:text-white/60 uppercase transition"
              >
                Restablecer
              </button>
              <button
                type="button"
                onClick={handleSavePreferences}
                disabled={saving}
                className="btn-gradient rounded-xl px-7 py-2.5 text-sm font-semibold text-white shadow-lg shadow-violet-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition"
              >
                {saving ? 'Guardando…' : 'Guardar preferencias'}
              </button>
            </div>
          </section>

          {/* ══════════════════════════════════
              CARD 3 · Plan & Cuenta
          ══════════════════════════════════ */}
          <section className="card rounded-3xl p-7 slide-in" style={{ animationDelay: '0.1s' }}>
            <SectionLabel>Plan & Cuenta</SectionLabel>

            {/* Plan pill */}
            <div className="flex items-center justify-between rounded-2xl border border-white/6 bg-white/3 px-5 py-4 mb-5">
              <div className="flex items-center gap-3">
                <div className={`h-2.5 w-2.5 rounded-full bg-gradient-to-br ${roleColor}`} />
                <div>
                  <p className="text-sm font-semibold">{roleLabel}</p>
                  <p className="text-xs text-white/40 mt-0.5">{roleDesc}</p>
                </div>
              </div>
              {!isPaid && (
                <button
                  type="button"
                  className="btn-gradient rounded-xl px-5 py-2 text-xs font-bold text-white shadow shadow-violet-500/20 transition"
                >
                  Mejorar plan
                </button>
              )}
            </div>

            <hr className="divider mb-5" />

            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={logout}
                className="flex-1 rounded-2xl border border-white/8 bg-white/4 py-3 text-sm font-semibold text-white/70 hover:bg-white/7 hover:text-white transition"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                onClick={handleDeleteAccount}
                className="flex-1 rounded-2xl border border-rose-500/20 bg-rose-500/6 py-3 text-sm font-semibold text-rose-400 hover:bg-rose-500/12 transition"
              >
                Eliminar cuenta
              </button>
            </div>
          </section>

        </div>
      </div>
    </>
  );
};

export default Settings;