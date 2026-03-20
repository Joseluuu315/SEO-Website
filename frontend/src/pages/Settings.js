import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, token, logout } = useAuth();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ username: '', email: '', currentPassword: '', newPassword: '' });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultAiModel: 'gpt-4o-mini',
    exportFormat: 'pdf',
    notifications: true,
    autoSave: true,
    language: 'es'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({ username: user.username || '', email: user.email || '', currentPassword: '', newPassword: '' });
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
          
          // Apply theme immediately
          if (loadedPrefs.theme === 'light') {
            document.documentElement.classList.remove('dark');
            document.documentElement.classList.add('light');
            document.body.classList.remove('dark');
            document.body.classList.add('light');
          } else if (loadedPrefs.theme === 'dark') {
            document.documentElement.classList.remove('light');
            document.documentElement.classList.add('dark');
            document.body.classList.remove('light');
            document.body.classList.add('dark');
          } else {
            // System theme
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            if (prefersDark) {
              document.documentElement.classList.remove('light');
              document.documentElement.classList.add('dark');
              document.body.classList.remove('light');
              document.body.classList.add('dark');
            } else {
              document.documentElement.classList.remove('dark');
              document.documentElement.classList.add('light');
              document.body.classList.remove('dark');
              document.body.classList.add('light');
            }
          }
        }
      } catch (err) {
        console.log('Using default preferences');
        // Apply default theme
        document.documentElement.classList.add('dark');
        document.body.classList.add('dark');
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
      setEditing(false);
      setForm({ ...form, currentPassword: '', newPassword: '' });
    } catch (e) {
      showMsg(e.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSavePreferences = async () => {
    setSaving(true);
    setMessage('');
    try {
      const res = await fetch('http://localhost:5000/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(preferences),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      showMsg('Preferencias guardadas');
      
      // Apply theme globally
      if (preferences.theme === 'light') {
        document.documentElement.classList.remove('dark');
        document.documentElement.classList.add('light');
        document.body.classList.remove('dark');
        document.body.classList.add('light');
      } else if (preferences.theme === 'dark') {
        document.documentElement.classList.remove('light');
        document.documentElement.classList.add('dark');
        document.body.classList.remove('light');
        document.body.classList.add('dark');
      } else {
        // System theme
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        if (prefersDark) {
          document.documentElement.classList.remove('light');
          document.documentElement.classList.add('dark');
          document.body.classList.remove('light');
          document.body.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
          document.documentElement.classList.add('light');
          document.body.classList.remove('dark');
          document.body.classList.add('light');
        }
      }
    } catch (e) {
      showMsg(e.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (!window.confirm('¿Restablecer todas las preferencias?')) return;
    const defaults = {
      theme: 'dark',
      defaultAiModel: 'gpt-4o-mini',
      exportFormat: 'pdf',
      notifications: true,
      autoSave: true,
      language: 'es'
    };
    setPreferences(defaults);
    try {
      const res = await fetch('http://localhost:5000/api/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(defaults),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      showMsg('Preferencias restablecidas');
      
      // Apply theme globally
      document.documentElement.classList.remove('light');
      document.documentElement.classList.add('dark');
      document.body.classList.remove('light');
      document.body.classList.add('dark');
    } catch (e) {
      showMsg(e.message, 'error');
    }
  };

  const userRole = user?.role || 'trial';
  const isSuperAdmin = user?.email === 'joselufupa2016@gmail.com';
  const isPaid = userRole === 'paid' || isSuperAdmin;

  const getThemeClasses = () => {
    if (preferences.theme === 'light') {
      return {
        bg: 'bg-[#f8fafc]',
        card: 'bg-white border-gray-200 shadow-lg',
        text: 'text-gray-900',
        subtext: 'text-gray-600',
        label: 'text-gray-700',
        input: 'border-gray-300 bg-gray-50 text-gray-900 placeholder:text-gray-500 focus:border-violet-500 focus:ring-violet-500',
        toggle: 'border-gray-300 bg-gray-50 hover:bg-gray-100',
        button: 'bg-violet-600 hover:bg-violet-700 text-white shadow-violet-600/25'
      };
    }
    return {
      bg: 'bg-[#070711]',
      card: 'bg-white/5 border-white/10 backdrop-blur-xl',
      text: 'text-white',
      subtext: 'text-white/60',
      label: 'text-white/60',
      input: 'border-white/10 bg-white/5 text-white placeholder:text-white/30 focus:border-violet-400/50 focus:ring-violet-400/20',
      toggle: 'border-white/10 bg-white/5 hover:bg-white/10',
      button: 'bg-gradient-to-r from-violet-500 to-fuchsia-500 text-white shadow-violet-500/20'
    };
  };

  const theme = getThemeClasses();

  return (
    <div className={`min-h-screen relative overflow-hidden ${theme.bg} ${theme.text}`}>
      {/* Animated background */}
      <div className="pointer-events-none absolute inset-0">
        <div className={`absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-cyan-500/14' : 'bg-cyan-400/8'
        }`} />
        <div className={`absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-fuchsia-500/12' : 'bg-fuchsia-400/6'
        }`} style={{ animationDelay: '1.4s' }} />
        <div className={`absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full blur-3xl animate-floaty ${
          preferences.theme === 'dark' ? 'bg-emerald-500/10' : 'bg-emerald-400/5'
        }`} style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-4xl px-4 py-12">
        <div className={`rounded-3xl border p-8 ${theme.card}`}>
          <div className="mb-8">
            <p className={`text-[10px] font-bold tracking-[0.35em] uppercase mb-2 ${
              preferences.theme === 'dark' ? 'text-violet-400/70' : 'text-violet-600'
            }`}>Ajustes</p>
            <h1 className={`text-4xl font-extrabold tracking-tight mb-2 ${theme.text}`}>Configuración</h1>
            <p className={`text-sm ${theme.subtext}`}>Personaliza tu experiencia y ajusta el comportamiento de la herramienta.</p>
          </div>

          {message && (
            <div className={`mb-6 rounded-2xl border px-5 py-4 text-sm font-medium ${
              message.includes('correctamente') || message.includes('guardadas')
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

          <div className="grid gap-8 lg:grid-cols-2">
            {/* Profile Settings */}
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${theme.text}`}>Datos del Perfil</h2>
                {!editing ? (
                  <div className={`rounded-xl border p-4 ${theme.card}`}>
                    <div className="space-y-3">
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.label}`}>Nombre</span>
                        <p className={`mt-1 ${theme.text}`}>{user?.username}</p>
                      </div>
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.label}`}>Email</span>
                        <p className={`mt-1 ${theme.text}`}>{user?.email}</p>
                      </div>
                      <div>
                        <span className={`text-xs font-semibold uppercase tracking-wider ${theme.label}`}>Rol</span>
                        <div className="mt-1">
                          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-bold tracking-widest uppercase ${
                            isSuperAdmin ? 'bg-rose-500' : isPaid ? 'bg-amber-500' : 'bg-emerald-500'
                          } text-white`}>
                            {isSuperAdmin ? 'Super Admin' : isPaid ? 'Premium' : 'Trial'}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setEditing(true)}
                      className={`mt-4 w-full rounded-xl px-4 py-2 text-sm font-semibold transition ${theme.button}`}
                    >
                      Editar Perfil
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSave} className="space-y-4">
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                        Nombre de usuario
                      </label>
                      <input
                        type="text"
                        value={form.username}
                        onChange={e => setForm({ ...form, username: e.target.value })}
                        className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                      />
                    </div>
                    <div>
                      <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                        Email
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={e => setForm({ ...form, email: e.target.value })}
                        className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                      />
                    </div>
                    {(form.newPassword || form.username !== user?.username || form.email !== user?.email) && (
                      <>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                            Contraseña actual
                          </label>
                          <input
                            type="password"
                            value={form.currentPassword}
                            onChange={e => setForm({ ...form, currentPassword: e.target.value })}
                            className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                          />
                        </div>
                        <div>
                          <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                            Nueva contraseña (opcional)
                          </label>
                          <input
                            type="password"
                            value={form.newPassword}
                            onChange={e => setForm({ ...form, newPassword: e.target.value })}
                            className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                          />
                        </div>
                      </>
                    )}
                    <div className="flex gap-3">
                      <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${theme.button}`}
                      >
                        {loading ? 'Guardando...' : 'Guardar'}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(false);
                          setForm({ username: user?.username || '', email: user?.email || '', currentPassword: '', newPassword: '' });
                        }}
                        className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                          preferences.theme === 'dark'
                            ? 'border-white/10 bg-white/5 text-white/80 hover:bg-white/10'
                            : 'border-gray-300 bg-gray-50 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>

            {/* App Preferences */}
            <div className="space-y-6">
              <div>
                <h2 className={`text-xl font-semibold mb-6 ${theme.text}`}>Preferencias de la App</h2>
                <div className="space-y-4">
                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                      Tema
                    </label>
                    <select
                      value={preferences.theme}
                      onChange={e => {
                        const newTheme = e.target.value;
                        setPreferences(p => ({ ...p, theme: newTheme }));
                        // Apply theme immediately
                        if (newTheme === 'light') {
                          document.documentElement.classList.remove('dark');
                          document.documentElement.classList.add('light');
                          document.body.classList.remove('dark');
                          document.body.classList.add('light');
                        } else if (newTheme === 'dark') {
                          document.documentElement.classList.remove('light');
                          document.documentElement.classList.add('dark');
                          document.body.classList.remove('light');
                          document.body.classList.add('dark');
                        } else {
                          // System theme
                          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                          if (prefersDark) {
                            document.documentElement.classList.remove('light');
                            document.documentElement.classList.add('dark');
                            document.body.classList.remove('light');
                            document.body.classList.add('dark');
                          } else {
                            document.documentElement.classList.remove('dark');
                            document.documentElement.classList.add('light');
                            document.body.classList.remove('dark');
                            document.body.classList.add('light');
                          }
                        }
                      }}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                    >
                      <option value="dark">🌙 Oscuro</option>
                      <option value="light">☀️ Claro</option>
                      <option value="system">💻 Sistema</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                      Modelo IA por defecto
                    </label>
                    <select
                      value={preferences.defaultAiModel}
                      onChange={e => setPreferences(p => ({ ...p, defaultAiModel: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                    >
                      <option value="gpt-4o-mini">GPT-4o Mini</option>
                      <option value="gpt-4o">GPT-4o</option>
                      <option value="claude-3-5-sonnet">Claude Sonnet</option>
                    </select>
                  </div>

                  <div>
                    <label className={`block text-xs font-semibold uppercase tracking-wider mb-2 ${theme.label}`}>
                      Formato de exportación
                    </label>
                    <select
                      value={preferences.exportFormat}
                      onChange={e => setPreferences(p => ({ ...p, exportFormat: e.target.value }))}
                      className={`w-full rounded-xl border px-4 py-3 outline-none transition ${theme.input}`}
                    >
                      <option value="pdf">PDF</option>
                      <option value="json">JSON</option>
                      <option value="csv">CSV</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${theme.toggle}`}>
                      <span className={`text-sm ${theme.text}`}>Notificaciones</span>
                      <input
                        type="checkbox"
                        checked={preferences.notifications}
                        onChange={e => setPreferences(p => ({ ...p, notifications: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        preferences.notifications ? 'bg-violet-500' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          preferences.notifications ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>

                    <label className={`flex items-center justify-between p-3 rounded-xl border cursor-pointer transition ${theme.toggle}`}>
                      <span className={`text-sm ${theme.text}`}>Guardado automático</span>
                      <input
                        type="checkbox"
                        checked={preferences.autoSave}
                        onChange={e => setPreferences(p => ({ ...p, autoSave: e.target.checked }))}
                        className="sr-only"
                      />
                      <div className={`relative w-11 h-6 rounded-full transition-colors ${
                        preferences.autoSave ? 'bg-violet-500' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                          preferences.autoSave ? 'translate-x-5' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      onClick={handleSavePreferences}
                      disabled={saving}
                      className={`flex-1 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:opacity-50 ${theme.button}`}
                    >
                      {saving ? 'Guardando...' : 'Guardar Preferencias'}
                    </button>
                    <button
                      onClick={handleReset}
                      className={`rounded-xl border px-4 py-2 text-sm font-semibold transition ${
                        preferences.theme === 'dark'
                          ? 'border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15'
                          : 'border-rose-500/30 bg-rose-50 text-rose-600 hover:bg-rose-100'
                      }`}
                    >
                      Restablecer
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 flex justify-end">
            <button
              onClick={logout}
              className={`rounded-xl border px-6 py-3 font-semibold transition ${
                preferences.theme === 'dark'
                  ? 'border-rose-500/20 bg-rose-500/10 text-rose-300 hover:bg-rose-500/15'
                  : 'border-rose-500/30 bg-rose-50 text-rose-600 hover:bg-rose-100'
              }`}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
