import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Sites = () => {
  const { token, user } = useAuth();
  const [sites, setSites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ name: '', url: '', notes: '' });
  const [error, setError] = useState('');

  const fetchSites = async () => {
    setLoading(true);
    try {
      const res = await fetch('http://localhost:5000/api/sites', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSites(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSites();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.url.trim()) {
      setError('Nombre y URL son obligatorios');
      return;
    }
    try {
      const method = editing ? 'PUT' : 'POST';
      const endpoint = editing ? `/api/sites/${editing._id}` : '/api/sites';
      const res = await fetch('http://localhost:5000' + endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      if (editing) {
        setSites(sites.map(s => (s._id === editing._id ? { ...s, ...form } : s)));
        setEditing(null);
      } else {
        setSites([...sites, { ...data, history: [] }]);
      }
      setForm({ name: '', url: '', notes: '' });
      setShowAdd(false);
      setError('');
    } catch (e) {
      setError(e.message);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar este sitio? Se borrará todo su historial.')) return;
    try {
      const res = await fetch(`http://localhost:5000/api/sites/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSites(sites.filter(s => s._id !== id));
    } catch (e) {
      setError(e.message);
    }
  };

  const fetchHistory = async (siteId) => {
    try {
      const res = await fetch(`http://localhost:5000/api/history?siteId=${siteId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      setSites(sites.map(s => (s._id === siteId ? { ...s, history: data } : s)));
    } catch (e) {
      setError(e.message);
    }
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
          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <div className="text-xs font-semibold tracking-[0.2em] text-white/60">SITIOS</div>
              <div className="mt-1 text-2xl font-semibold">Gestor de proyectos</div>
              <p className="mt-2 text-sm text-white/70">Añade sitios, organiza tus análisis y revisa el historial por proyecto.</p>
            </div>
            <button
              type="button"
              onClick={() => setShowAdd(true)}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-4 py-2 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer"
            >
              + Nuevo sitio
            </button>
          </div>
        </div>

        {error && (
          <div className="mt-4 rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
            <div className="flex items-start gap-2">
              <span className="mt-0.5">⚠</span>
              <div>{error}</div>
            </div>
          </div>
        )}

        {showAdd && (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="text-lg font-semibold">{editing ? 'Editar sitio' : 'Añadir nuevo sitio'}</div>
              <button
                type="button"
                onClick={() => {
                  setShowAdd(false);
                  setEditing(null);
                  setForm({ name: '', url: '', notes: '' });
                  setError('');
                }}
                className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/15 transition"
              >
                Cancelar
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Nombre del proyecto</label>
                <input
                  value={form.name}
                  onChange={e => setForm({ ...form, name: e.target.value })}
                  placeholder="Mi Blog Personal"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">URL principal</label>
                <input
                  value={form.url}
                  onChange={e => setForm({ ...form, url: e.target.value })}
                  placeholder="https://miweb.com"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Notas (opcional)</label>
                <textarea
                  value={form.notes}
                  onChange={e => setForm({ ...form, notes: e.target.value })}
                  placeholder="Objetivos SEO, público objetivo, etc."
                  rows={3}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 resize-none"
                />
              </div>
              <button
                type="submit"
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer"
              >
                {editing ? 'Guardar cambios' : 'Añadir sitio'}
              </button>
            </form>
          </div>
        )}

        {loading ? (
          <div className="mt-6 flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-cyan-400" />
          </div>
        ) : (
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {sites.length === 0 ? (
              <div className="col-span-full rounded-2xl border border-white/10 bg-black/20 px-4 py-8 text-center text-white/70">
                No tienes sitios guardados. Añade tu primer proyecto para empezar.
              </div>
            ) : (
              sites.map(site => (
                <div key={site._id} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-lg font-semibold">{site.name}</div>
                      <div className="mt-1 truncate text-xs text-white/60">{site.url}</div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          setEditing(site);
                          setForm({ name: site.name, url: site.url, notes: site.notes || '' });
                          setShowAdd(true);
                          setError('');
                        }}
                        className="rounded-xl border border-white/10 bg-white/5 p-2 text-xs text-white/80 hover:bg-white/10 transition"
                      >
                        Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(site._id)}
                        className="rounded-xl border border-rose-500/25 bg-rose-500/10 p-2 text-xs text-rose-100 hover:bg-rose-500/15 transition"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  {site.notes && (
                    <div className="mt-3 text-xs text-white/70">{site.notes}</div>
                  )}
                  <div className="mt-4">
                    <div className="flex items-center justify-between">
                      <div className="text-xs font-semibold tracking-[0.18em] text-white/60">HISTORIAL</div>
                      <button
                        type="button"
                        onClick={() => fetchHistory(site._id)}
                        className="rounded-xl border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80 hover:bg-white/10 transition"
                      >
                        Actualizar
                      </button>
                    </div>
                    {site.history && site.history.length > 0 ? (
                      <div className="mt-3 space-y-2">
                        {site.history.slice(0, 3).map(h => (
                          <div key={h._id} className="rounded-xl border border-white/10 bg-black/20 p-3">
                            <div className="flex items-center justify-between">
                              <div className="truncate text-xs font-semibold">{h.title}</div>
                              <div className="text-xs text-white/60">{h.seoScore}</div>
                            </div>
                            <div className="mt-1 text-xs text-white/50">{new Date(h.createdAt).toLocaleString()}</div>
                          </div>
                        ))}
                        {site.history.length > 3 && (
                          <div className="text-xs text-white/50">+{site.history.length - 3} análisis más</div>
                        )}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50">
                        Sin análisis guardados
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Sites;
