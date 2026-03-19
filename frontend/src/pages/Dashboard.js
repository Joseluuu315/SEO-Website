import React from 'react';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [url, setUrl] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [loadingSession, setLoadingSession] = React.useState(false);
  const [aiMode, setAiMode] = React.useState(true);
  const [aiLoading, setAiLoading] = React.useState(false);
  const [error, setError] = React.useState('');
  const [result, setResult] = React.useState(null);
  const [history, setHistory] = React.useState([]);
  const [activeSessionId, setActiveSessionId] = React.useState(null);

  const exampleUrls = React.useMemo(
    () => ['https://example.com', 'https://wikipedia.org', 'https://developer.mozilla.org'],
    []
  );

  const fetchHistory = React.useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch('/api/history', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) return;
      setHistory(Array.isArray(data) ? data : []);
    } catch {
      // ignore
    }
  }, [token]);

  React.useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const openSession = async (id) => {
    if (!token) return;
    setError('');
    setLoadingSession(true);
    try {
      const res = await fetch(`/api/history/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'No se pudo abrir la sesión');
        setLoadingSession(false);
        return;
      }
      setActiveSessionId(id);
      setResult(data);
      setUrl(data.url || '');
      setLoadingSession(false);
    } catch {
      setError('Error al abrir la sesión');
      setLoadingSession(false);
    }
  };

  const generateAiForSession = async () => {
    if (!token || !activeSessionId) return;
    setAiLoading(true);
    setError('');
    try {
      const res = await fetch('/api/ai-report', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ id: activeSessionId }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'No se pudo generar el informe IA');
        setAiLoading(false);
        return;
      }

      setResult((prev) => prev ? ({ ...prev, aiReport: data.report, aiModel: data.model }) : prev);
      await fetchHistory();
      setAiLoading(false);
    } catch {
      setError('Error al generar el informe IA');
      setAiLoading(false);
    }
  };

  const runAnalysis = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setActiveSessionId(null);

    const nextUrl = url.trim();
    if (!nextUrl) {
      setError('Introduce una URL');
      return;
    }

    setLoading(true);
    try {
      const endpoint = aiMode ? '/api/ai-analyze' : '/api/scrape';
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ url: nextUrl }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data?.error || 'Error al analizar la URL');
        setLoading(false);
        return;
      }

      setResult(data);
      if (data?._id) setActiveSessionId(data._id);
      await fetchHistory();
      setLoading(false);
    } catch {
      setError('Error de conexión con el servidor');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-6xl px-4 py-10">
        <div className="flex flex-col gap-6">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
            <div>
              <div className="inline-flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-glow" />
                <div>
                  <div className="text-xs font-semibold tracking-[0.2em] text-white/60">SEO ANALYZER</div>
                  <div className="text-2xl font-semibold">Panel</div>
                </div>
              </div>
              <p className="mt-3 text-white/70">
                Bienvenido{user?.username ? `, ${user.username}` : ''}. Analiza URLs y guarda tu historial por usuario.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAiMode(v => !v)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 shadow-glow backdrop-blur hover:bg-white/10 transition active:scale-[0.99]"
              >
                IA: <span className="text-white">{aiMode ? 'ON' : 'OFF'}</span>
              </button>
              <button
                type="button"
                onClick={fetchHistory}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 shadow-glow backdrop-blur hover:bg-white/10 transition active:scale-[0.99]"
              >
                Actualizar
              </button>
              <button
                type="button"
                onClick={logout}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer active:scale-[0.99]"
              >
                Cerrar sesión
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Analizar una URL</h2>
                  <p className="mt-1 text-sm text-white/70">
                    Añade una URL válida. Guardaremos el resultado en Mongo para tu usuario.
                  </p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/70">
                  Token: <span className="text-white/90">{token ? 'OK' : 'NO'}</span>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  Modo: <span className="text-white/90">{aiMode ? 'Experto IA' : 'Rápido'}</span>
                </div>
                {loadingSession && (
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                    Abriendo sesión...
                  </div>
                )}
                {activeSessionId && (
                  <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                    Sesión: <span className="text-white/90">{String(activeSessionId).slice(-6)}</span>
                  </div>
                )}
              </div>

              <form onSubmit={runAnalysis} className="mt-5 grid gap-3">
                <div className="flex flex-col gap-3 md:flex-row">
                  <input
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://ejemplo.com"
                    className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="shrink-0 rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {loading ? (
                      <span className="inline-flex items-center gap-2">
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                        Analizando...
                      </span>
                    ) : (
                      'Analizar'
                    )}
                  </button>
                </div>

                <div className="flex flex-wrap gap-2">
                  {exampleUrls.map((u) => (
                    <button
                      key={u}
                      type="button"
                      onClick={() => setUrl(u)}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition"
                    >
                      {u.replace('https://', '')}
                    </button>
                  ))}
                </div>

                {error && (
                  <div className="rounded-2xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-sm text-rose-100">
                    <div className="flex items-start gap-2">
                      <span className="mt-0.5">⚠</span>
                      <div>{error}</div>
                    </div>
                  </div>
                )}
              </form>

              {result && (
                <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5">
                  <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                      <div className="text-xs font-semibold tracking-[0.18em] text-white/60">RESULTADO</div>
                      <div className="mt-1 text-xl font-semibold">{result.title}</div>
                      <div className="mt-2 text-sm text-white/70 break-words">{result.url}</div>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 px-5 py-4 text-center shadow-glow">
                      <div className="text-xs text-white/60">SEO SCORE</div>
                      <div className="mt-1 text-3xl font-semibold">
                        {typeof result.seoScore === 'number' ? result.seoScore : '-'}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 grid grid-cols-1 gap-3 md:grid-cols-3">
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/60">Meta</div>
                      <div className="mt-1 text-sm text-white/80 max-h-16 overflow-hidden">{result.description}</div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/60">Estructura</div>
                      <div className="mt-2 text-sm text-white/80">H1: <span className="font-semibold">{result.h1Count}</span></div>
                      <div className="mt-1 text-sm text-white/80">H2: <span className="font-semibold">{result.h2Count}</span></div>
                      <div className="mt-1 text-sm text-white/80">H3: <span className="font-semibold">{result.h3Count}</span></div>
                    </div>
                    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                      <div className="text-xs text-white/60">Contenido</div>
                      <div className="mt-2 text-sm text-white/80">Palabras: <span className="font-semibold">{result.wordCount}</span></div>
                      <div className="mt-1 text-sm text-white/80">Imágenes: <span className="font-semibold">{result.imageCount}</span></div>
                      <div className="mt-1 text-sm text-white/80">Alt: <span className="font-semibold">{result.imagesWithAlt}</span></div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4">
                    <div className="text-xs text-white/60">Links</div>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">Internos: <span className="font-semibold">{result.internalLinks}</span></span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">Externos: <span className="font-semibold">{result.externalLinks}</span></span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">HTTPS: <span className="font-semibold">{result.hasHttps ? 'Sí' : 'No'}</span></span>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">Schema: <span className="font-semibold">{result.hasSchema ? 'Sí' : 'No'}</span></span>
                    </div>
                  </div>

                  <div className="mt-4">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm font-semibold">Issues</div>
                      <div className="text-xs text-white/60">{Array.isArray(result.issues) ? result.issues.length : 0} detectados</div>
                    </div>

                    {Array.isArray(result.issues) && result.issues.length > 0 ? (
                      <div className="mt-3 grid gap-2">
                        {result.issues.map((i, idx) => {
                          const badge =
                            i.severity === 'high'
                              ? 'border-rose-500/30 bg-rose-500/10 text-rose-100'
                              : i.severity === 'medium'
                                ? 'border-amber-500/30 bg-amber-500/10 text-amber-100'
                                : i.severity === 'low'
                                  ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-100'
                                  : 'border-white/10 bg-white/5 text-white/80';

                          return (
                            <div key={idx} className={`rounded-2xl border px-4 py-3 text-sm ${badge}`}>
                              <div className="flex items-start justify-between gap-3">
                                <div className="font-semibold uppercase text-xs tracking-[0.14em] opacity-90">{i.severity}</div>
                                <div className="text-xs opacity-80">{i.type}</div>
                              </div>
                              <div className="mt-1">{i.message}</div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="mt-3 rounded-2xl border border-emerald-500/25 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                        Sin problemas críticos detectados.
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <div className="flex items-center justify-between gap-3 flex-wrap">
                      <div className="text-sm font-semibold">Informe experto</div>
                      {activeSessionId && !result.aiReport && (
                        <button
                          type="button"
                          onClick={generateAiForSession}
                          disabled={aiLoading}
                          className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {aiLoading ? 'Generando IA...' : 'Generar informe IA'}
                        </button>
                      )}
                    </div>

                    {result.aiReport ? (
                      <pre className="mt-3 whitespace-pre-wrap rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-white/80 leading-relaxed">
                        {result.aiReport}
                      </pre>
                    ) : (
                      <div className="mt-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/70">
                        {aiMode ? 'Si no hay clave de IA configurada en el backend, verás un informe fallback.' : 'Activa el modo IA para generar un informe experto.'}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Historial</h2>
                  <p className="mt-1 text-sm text-white/70">Guardado en Mongo por usuario (últimos 20).</p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  {history.length} items
                </div>
              </div>

              <div className="mt-4 grid gap-3">
                {history.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                    Aún no hay análisis guardados para este usuario.
                  </div>
                ) : (
                  history.map((h) => (
                    <button
                      type="button"
                      key={h._id}
                      onClick={() => openSession(h._id)}
                      className="text-left rounded-2xl border border-white/10 bg-black/20 p-4 hover:bg-white/5 transition"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="truncate font-semibold">{h.title || '(sin título)'}</div>
                          <div className="mt-1 truncate text-xs text-white/60">{h.url}</div>
                        </div>
                        <div className="shrink-0 rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                          <div className="text-[10px] text-white/60">SCORE</div>
                          <div className="text-lg font-semibold">{h.seoScore}</div>
                        </div>
                      </div>
                      <div className="mt-3 text-xs text-white/60">{new Date(h.createdAt).toLocaleString()}</div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
