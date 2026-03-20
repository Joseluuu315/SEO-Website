import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Settings = () => {
  const { user, token, logout } = useAuth();
  const [preferences, setPreferences] = useState({
    theme: 'dark',
    defaultAiModel: 'gpt-4o-mini',
    exportFormat: 'pdf',
    notifications: true,
    autoSave: true,
    language: 'es',
  });
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('seoAnalyzerPreferences');
    if (saved) {
      try {
        setPreferences(JSON.parse(saved));
      } catch {}
    }
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    localStorage.setItem('seoAnalyzerPreferences', JSON.stringify(preferences));
    // TODO: sync with backend
    setTimeout(() => {
      setSaving(false);
      setMessage('Preferencias guardadas');
      setTimeout(() => setMessage(''), 3000);
    }, 800);
  };

  const handleReset = () => {
    if (!window.confirm('¿Restablecer todas las preferencias?')) return;
    const defaults = {
      theme: 'dark',
      defaultAiModel: 'gpt-4o-mini',
      exportFormat: 'pdf',
      notifications: true,
      autoSave: true,
      language: 'es',
    };
    setPreferences(defaults);
    localStorage.setItem('seoAnalyzerPreferences', JSON.stringify(defaults));
    setMessage('Preferencias restablecidas');
    setTimeout(() => setMessage(''), 3000);
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <div className="text-xs font-semibold tracking-[0.2em] text-white/60">AJUSTES</div>
          <div className="mt-1 text-2xl font-semibold">Preferencias de usuario</div>
          <p className="mt-2 text-sm text-white/70">Personaliza tu experiencia y ajusta el comportamiento de la herramienta.</p>
        </div>

        {message && (
          <div className="mt-4 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
            {message}
          </div>
        )}

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">General</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Idioma</label>
                <select
                  value={preferences.language}
                  onChange={e => setPreferences({ ...preferences, language: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="es">Español</option>
                  <option value="en">English</option>
                  <option value="pt">Português</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Tema visual</label>
                <select
                  value={preferences.theme}
                  onChange={e => setPreferences({ ...preferences, theme: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="dark">Oscuro</option>
                  <option value="light">Claro</option>
                  <option value="auto">Automático</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Formato de exportación por defecto</label>
                <select
                  value={preferences.exportFormat}
                  onChange={e => setPreferences({ ...preferences, exportFormat: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="pdf">PDF</option>
                  <option value="csv">CSV</option>
                  <option value="json">JSON</option>
                </select>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">Análisis e IA</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Modelo de IA por defecto</label>
                <select
                  value={preferences.defaultAiModel}
                  onChange={e => setPreferences({ ...preferences, defaultAiModel: e.target.value })}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                >
                  <option value="gpt-4o-mini">GPT-4o Mini (rápido)</option>
                  <option value="gpt-4o">GPT-4o (balanceado)</option>
                  <option value="gpt-4-turbo">GPT-4 Turbo (calidad)</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Notificaciones</div>
                  <div className="text-xs text-white/60">Recibir alertas de análisis completados</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, notifications: !preferences.notifications })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    preferences.notifications ? 'bg-cyan-400' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      preferences.notifications ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Guardado automático</div>
                  <div className="text-xs text-white/60">Guardar análisis automáticamente</div>
                </div>
                <button
                  type="button"
                  onClick={() => setPreferences({ ...preferences, autoSave: !preferences.autoSave })}
                  className={`relative h-7 w-12 rounded-full transition-colors ${
                    preferences.autoSave ? 'bg-cyan-400' : 'bg-white/10'
                  }`}
                >
                  <div
                    className={`absolute top-1 h-5 w-5 rounded-full bg-white transition-transform ${
                      preferences.autoSave ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">Cuenta</div>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/80">Usuario</div>
                <div className="mt-1 font-semibold">{user?.username || user?.email || 'Desconocido'}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="text-sm text-white/80">Email</div>
                <div className="mt-1 font-semibold">{user?.email || 'No disponible'}</div>
              </div>
              <button
                type="button"
                onClick={logout}
                className="w-full rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 font-semibold text-rose-100 hover:bg-rose-500/15 transition"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">Peligro</div>
            <div className="mt-4 space-y-3">
              <button
                type="button"
                onClick={handleReset}
                className="w-full rounded-2xl border border-amber-500/25 bg-amber-500/10 px-4 py-3 font-semibold text-amber-100 hover:bg-amber-500/15 transition"
              >
                Restablecer preferencias
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!window.confirm('¿Eliminar todos tus datos? Esta acción no se puede deshacer.')) {
                    // TODO: call backend to delete user data
                    alert('Función no implementada aún');
                  }
                }}
                className="w-full rounded-2xl border border-rose-500/25 bg-rose-500/10 px-4 py-3 font-semibold text-rose-100 hover:bg-rose-500/15 transition"
              >
                Eliminar cuenta y datos
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-6 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
          >
            {saving ? 'Guardando...' : 'Guardar cambios'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
