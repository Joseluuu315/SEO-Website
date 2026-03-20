import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const Compare = () => {
  const { token } = useAuth();
  const [urls, setUrls] = useState(['', '', '']);
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [aiMode, setAiMode] = useState(false);
  const [error, setError] = useState('');

  const exampleUrls = [
    'https://blog.cloudflare.com/',
    'https://www.shopify.com/blog',
    'https://stripe.com/blog',
    'https://www.notion.so/blog',
    'https://www.producthunt.com/',
    'https://www.airstory.io/blog',
    'https://www.semrush.com/blog',
    'https://ahrefs.com/blog',
    'https://moz.com/blog',
    'https://backlinko.com/',
  ];

  const runCompare = async (e) => {
    e.preventDefault();
    const validUrls = urls.filter(u => u.trim());
    if (validUrls.length < 2) {
      setError('Añade al menos 2 URLs para comparar');
      return;
    }
    setLoading(true);
    setError('');
    setResults([]);

    try {
      const endpoint = aiMode ? '/api/ai-analyze' : '/api/scrape';
      const promises = validUrls.map(url =>
        fetch('http://localhost:5000' + endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ url }),
        }).then(r => r.json())
      );

      const data = await Promise.all(promises);
      setResults(data);
    } catch {
      setError('Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 85) return 'text-emerald-400';
    if (score >= 70) return 'text-yellow-400';
    return 'text-rose-400';
  };

  const getScoreBg = (score) => {
    if (score >= 85) return 'bg-emerald-500/10 border-emerald-500/30';
    if (score >= 70) return 'bg-yellow-500/10 border-yellow-500/30';
    return 'bg-rose-500/10 border-rose-500/30';
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
              <div className="text-xs font-semibold tracking-[0.2em] text-white/60">COMPARAR</div>
              <div className="mt-1 text-2xl font-semibold">Análisis comparativo</div>
              <p className="mt-2 text-sm text-white/70">Compara hasta 3 URLs lado a lado. Ideal para análisis competitivo.</p>
            </div>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setAiMode(v => !v)}
                className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/10 transition"
              >
                IA: {aiMode ? 'ON' : 'OFF'}
              </button>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <form onSubmit={runCompare} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              {urls.map((url, idx) => (
                <div key={idx}>
                  <label className="text-xs font-semibold tracking-[0.18em] text-white/60">URL {idx + 1}</label>
                  <input
                    value={url}
                    onChange={e => {
                      const newUrls = [...urls];
                      newUrls[idx] = e.target.value;
                      setUrls(newUrls);
                    }}
                    placeholder="https://ejemplo.com"
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {exampleUrls.slice(0, 6).map((u) => (
                <button
                  key={u}
                  type="button"
                  onClick={() => {
                    const firstEmpty = urls.findIndex(v => !v.trim());
                    if (firstEmpty !== -1) {
                      const newUrls = [...urls];
                      newUrls[firstEmpty] = u;
                      setUrls(newUrls);
                    }
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/70 hover:bg-white/10 transition"
                >
                  {u.replace('https://', '').replace('/', '')}
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

            <button
              type="submit"
              disabled={loading}
              className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-6 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="inline-flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                  Comparando...
                </span>
              ) : (
                'Comparar'
              )}
            </button>
          </form>
        </div>

        {results.length > 0 && (
          <div className="mt-6 grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
            {results.map((r, idx) => (
              <div key={idx} className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="truncate text-lg font-semibold">{r.title}</div>
                    <div className="mt-1 truncate text-xs text-white/60">{r.url}</div>
                  </div>
                  <div className={`rounded-2xl border px-3 py-2 text-center ${getScoreBg(r.seoScore)}`}>
                    <div className="text-xs text-white/60">SCORE</div>
                    <div className={`text-lg font-semibold ${getScoreColor(r.seoScore)}`}>{r.seoScore}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-xs text-white/60">Palabras</div>
                    <div className="font-semibold">{r.wordCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Imágenes</div>
                    <div className="font-semibold">{r.imageCount}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Links internos</div>
                    <div className="font-semibold">{r.internalLinks}</div>
                  </div>
                  <div>
                    <div className="text-xs text-white/60">Links externos</div>
                    <div className="font-semibold">{r.externalLinks}</div>
                  </div>
                </div>

                <div className="mt-4">
                  <div className="text-xs text-white/60">Issues</div>
                  {Array.isArray(r.issues) && r.issues.length > 0 ? (
                    <div className="mt-2 space-y-1">
                      {r.issues.slice(0, 3).map((i, iidx) => (
                        <div key={iidx} className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs">
                          <div className="font-semibold uppercase text-xs opacity-80">{i.severity}</div>
                          <div className="mt-1">{i.message}</div>
                        </div>
                      ))}
                      {r.issues.length > 3 && (
                        <div className="text-xs text-white/50">+{r.issues.length - 3} más</div>
                      )}
                    </div>
                  ) : (
                    <div className="mt-2 rounded-xl border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                      Sin problemas críticos
                    </div>
                  )}
                </div>

                {r.aiReport && (
                  <div className="mt-4">
                    <div className="text-xs text-white/60">Informe IA</div>
                    <pre className="mt-2 max-h-32 overflow-auto rounded-xl border border-white/10 bg-black/20 p-3 text-xs text-white/80 whitespace-pre-wrap">
                      {r.aiReport.slice(0, 300)}...
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Compare;
