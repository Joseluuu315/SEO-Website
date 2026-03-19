import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

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
  const [historyQuery, setHistoryQuery] = React.useState('');
  const [activeTab, setActiveTab] = React.useState('resumen');

  const exampleUrls = React.useMemo(
    () => ['https://example.com', 'https://wikipedia.org', 'https://developer.mozilla.org'],
    []
  );

  const avatarText = React.useMemo(() => {
    const base = user?.username || user?.email || 'U';
    return String(base).slice(0, 2).toUpperCase();
  }, [user]);

  const historyFiltered = React.useMemo(() => {
    const q = historyQuery.trim().toLowerCase();
    if (!q) return history;
    return history.filter((h) => {
      const t = `${h.title || ''} ${h.url || ''}`.toLowerCase();
      return t.includes(q);
    });
  }, [history, historyQuery]);

  const historyChartData = React.useMemo(() => {
    return (history || [])
      .slice()
      .reverse()
      .map((h) => ({
        name: new Date(h.createdAt).toLocaleDateString(),
        score: typeof h.seoScore === 'number' ? h.seoScore : null,
      }))
      .filter((d) => typeof d.score === 'number');
  }, [history]);

  const issuesSeverityData = React.useMemo(() => {
    const issues = Array.isArray(result?.issues) ? result.issues : [];
    const counts = { high: 0, medium: 0, low: 0, info: 0 };
    for (const i of issues) {
      const s = i?.severity;
      if (s === 'high') counts.high += 1;
      else if (s === 'medium') counts.medium += 1;
      else if (s === 'low') counts.low += 1;
      else counts.info += 1;
    }
    return [
      { name: 'Alta', value: counts.high, key: 'high' },
      { name: 'Media', value: counts.medium, key: 'medium' },
      { name: 'Baja', value: counts.low, key: 'low' },
      { name: 'Info', value: counts.info, key: 'info' },
    ].filter((x) => x.value > 0);
  }, [result]);

  const downloadBlob = (blob, filename) => {
    const a = document.createElement('a');
    const urlObj = URL.createObjectURL(blob);
    a.href = urlObj;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(urlObj);
  };

  const exportCsv = () => {
    if (!result) return;
    const safe = (v) => {
      if (v === null || v === undefined) return '';
      const s = String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };

    const issues = Array.isArray(result.issues) ? result.issues : [];
    const rows = [
      ['url', result.url],
      ['title', result.title],
      ['description', result.description],
      ['seoScore', result.seoScore],
      ['wordCount', result.wordCount],
      ['imageCount', result.imageCount],
      ['imagesWithAlt', result.imagesWithAlt],
      ['h1Count', result.h1Count],
      ['h2Count', result.h2Count],
      ['h3Count', result.h3Count],
      ['internalLinks', result.internalLinks],
      ['externalLinks', result.externalLinks],
      ['hasHttps', result.hasHttps ? 'yes' : 'no'],
      ['hasSchema', result.hasSchema ? 'yes' : 'no'],
      ['issuesCount', issues.length],
    ];

    const issuesHeader = ['issue_severity', 'issue_type', 'issue_message'];
    const issuesRows = issues.map((i) => [i?.severity || '', i?.type || '', i?.message || '']);

    const csv = [
      'metric,value',
      ...rows.map(([k, v]) => `${safe(k)},${safe(v)}`),
      '',
      issuesHeader.map(safe).join(','),
      ...issuesRows.map((r) => r.map(safe).join(',')),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const filename = `seo-report-${(result.url || 'site').replace(/https?:\/\//, '').replace(/[^a-z0-9\-_.]/gi, '-')}.csv`;
    downloadBlob(blob, filename);
  };

  const exportPdf = () => {
    if (!result) return;
    const issues = Array.isArray(result.issues) ? result.issues : [];
    const bySeverity = {
      high: issues.filter((i) => i?.severity === 'high'),
      medium: issues.filter((i) => i?.severity === 'medium'),
      low: issues.filter((i) => i?.severity === 'low'),
      info: issues.filter((i) => i?.severity !== 'high' && i?.severity !== 'medium' && i?.severity !== 'low'),
    };

    const esc = (s) => String(s ?? '').replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[c]));
    const title = `SEO Report - ${result.url || ''}`;
    const now = new Date().toLocaleString();

    const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8" />
  <title>${esc(title)}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <style>
    :root{--ink:#0b1220;--muted:#4b5563;--line:#e5e7eb;--hi:#ef4444;--md:#f59e0b;--lo:#10b981;--brand:#0ea5e9;}
    body{font-family:ui-sans-serif,system-ui,-apple-system,Segoe UI,Roboto,Arial; color:var(--ink); margin:0; background:#fff;}
    .page{padding:36px 44px;}
    .head{display:flex; align-items:flex-start; justify-content:space-between; gap:20px; border-bottom:1px solid var(--line); padding-bottom:18px;}
    .brand{font-weight:800; letter-spacing:0.08em; font-size:11px; color:var(--muted)}
    h1{margin:6px 0 0; font-size:22px;}
    .meta{margin-top:6px; color:var(--muted); font-size:12px;}
    .score{min-width:160px; border:1px solid var(--line); border-radius:16px; padding:14px 16px; text-align:center;}
    .score .n{font-size:34px; font-weight:800; color:var(--brand);}
    .grid{display:grid; grid-template-columns: repeat(3, 1fr); gap:12px; margin-top:18px;}
    .card{border:1px solid var(--line); border-radius:16px; padding:14px 14px;}
    .k{font-size:11px; color:var(--muted); text-transform:uppercase; letter-spacing:.08em}
    .v{margin-top:6px; font-size:14px;}
    .section{margin-top:22px;}
    .section h2{font-size:14px; text-transform:uppercase; letter-spacing:.12em; color:#111827; margin:0 0 10px;}
    .pill{display:inline-block; font-size:11px; padding:3px 10px; border-radius:999px; border:1px solid var(--line); margin-right:6px;}
    .p-hi{border-color:rgba(239,68,68,.25); background:rgba(239,68,68,.08); color:var(--hi)}
    .p-md{border-color:rgba(245,158,11,.25); background:rgba(245,158,11,.08); color:var(--md)}
    .p-lo{border-color:rgba(16,185,129,.25); background:rgba(16,185,129,.08); color:var(--lo)}
    ul{margin:10px 0 0; padding-left:18px;}
    li{margin:6px 0; font-size:13px; color:#111827;}
    pre{white-space:pre-wrap; border:1px solid var(--line); border-radius:16px; padding:14px; font-size:12px; color:#111827; background:#fafafa;}
    .muted{color:var(--muted)}
    @media print{ .page{padding:18mm;} }
  </style>
</head>
<body>
  <div class="page">
    <div class="head">
      <div>
        <div class="brand">SEO ANALYZER · AGENCY REPORT</div>
        <h1>${esc(result.title || 'Informe SEO')}</h1>
        <div class="meta"><strong>URL</strong>: ${esc(result.url || '')}<br/><strong>Fecha</strong>: ${esc(now)}</div>
      </div>
      <div class="score">
        <div class="k">SEO Score</div>
        <div class="n">${esc(typeof result.seoScore === 'number' ? result.seoScore : '-')}</div>
        <div class="meta muted">Auditoría técnica y contenido</div>
      </div>
    </div>

    <div class="grid">
      <div class="card"><div class="k">Palabras</div><div class="v">${esc(result.wordCount)}</div></div>
      <div class="card"><div class="k">Imágenes / Alt</div><div class="v">${esc(result.imageCount)} / ${esc(result.imagesWithAlt)}</div></div>
      <div class="card"><div class="k">Links int/ext</div><div class="v">${esc(result.internalLinks)} / ${esc(result.externalLinks)}</div></div>
    </div>

    <div class="section">
      <h2>Prioridades</h2>
      <div>
        <span class="pill p-hi">P0 · Alta (${esc(bySeverity.high.length)})</span>
        <span class="pill p-md">P1 · Media (${esc(bySeverity.medium.length)})</span>
        <span class="pill p-lo">P2 · Baja (${esc(bySeverity.low.length)})</span>
      </div>
      <ul>
        ${(bySeverity.high.concat(bySeverity.medium).slice(0, 10)).map((i) => `<li>${esc(i?.message || '')}</li>`).join('')}
      </ul>
      ${issues.length === 0 ? `<div class="muted" style="margin-top:10px;">Sin issues detectados por el scanner.</div>` : ''}
    </div>

    <div class="section">
      <h2>Informe experto</h2>
      <pre>${esc(result.aiReport || 'No hay informe IA en esta sesión.')}</pre>
    </div>
  </div>
  <script>window.onload = () => { window.focus(); window.print(); };</script>
</body>
</html>`;

    const w = window.open('', '_blank');
    if (!w) {
      setError('Bloqueador de popups: permite popups para exportar PDF');
      return;
    }
    w.document.open();
    w.document.write(html);
    w.document.close();
  };

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
      setActiveTab('resumen');
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
      setActiveTab('resumen');
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

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[280px_1fr]">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="flex items-center gap-3">
              <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-cyan-400 via-fuchsia-500 to-emerald-400 shadow-glow" />
              <div>
                <div className="text-xs font-semibold tracking-[0.2em] text-white/60">SEO ANALYZER</div>
                <div className="text-lg font-semibold">Agency Suite</div>
              </div>
            </div>

            <div className="mt-6 grid gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('resumen')}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'resumen' ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100' : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5'}`}
              >
                Panel
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('issues')}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'issues' ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100' : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5'}`}
              >
                Issues
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('informe')}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'informe' ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100' : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5'}`}
              >
                Informe
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('tendencia')}
                className={`w-full rounded-2xl border px-4 py-3 text-left text-sm font-semibold transition ${activeTab === 'tendencia' ? 'border-cyan-400/30 bg-cyan-500/10 text-cyan-100' : 'border-white/10 bg-black/20 text-white/70 hover:bg-white/5'}`}
              >
                Tendencia
              </button>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-white/10 text-white/80 grid place-items-center font-semibold">{avatarText}</div>
                <div className="min-w-0">
                  <div className="truncate text-sm font-semibold text-white">{user?.username || user?.email || 'Usuario'}</div>
                  <div className="truncate text-xs text-white/60">Sesiones: {history.length}</div>
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAiMode(v => !v)}
                  className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-xs font-semibold text-white/80 hover:bg-white/10 transition"
                >
                  IA: {aiMode ? 'ON' : 'OFF'}
                </button>
                <button
                  type="button"
                  onClick={logout}
                  className="rounded-2xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-500/15 transition"
                >
                  Salir
                </button>
              </div>
            </div>
          </aside>

          <main className="flex flex-col gap-6">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                <div>
                  <div className="text-xs font-semibold tracking-[0.2em] text-white/60">PANEL</div>
                  <div className="mt-1 text-2xl font-semibold">Auditoría SEO</div>
                  <p className="mt-2 text-sm text-white/70">Analiza URLs, revisa el historial y exporta informes listos para cliente.</p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={fetchHistory}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white/80 shadow-glow backdrop-blur hover:bg-white/10 transition active:scale-[0.99]"
                  >
                    Actualizar
                  </button>
                  <button
                    type="button"
                    onClick={exportCsv}
                    disabled={!result}
                    className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    Export CSV
                  </button>
                  <button
                    type="button"
                    onClick={exportPdf}
                    disabled={!result}
                    className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-4 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    Export PDF
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
              <div className="xl:col-span-2 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
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

                    <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-5">
                      <div className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold tracking-[0.18em] text-white/60">SEVERIDAD</div>
                          <div className="text-xs text-white/50">{Array.isArray(result.issues) ? result.issues.length : 0} issues</div>
                        </div>
                        {issuesSeverityData.length === 0 ? (
                          <div className="mt-3 text-sm text-white/70">Sin issues para graficar.</div>
                        ) : (
                          <div className="mt-3 h-40">
                            <ResponsiveContainer width="100%" height="100%">
                              <PieChart>
                                <Pie data={issuesSeverityData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={4}>
                                  {issuesSeverityData.map((entry) => {
                                    const color =
                                      entry.key === 'high'
                                        ? '#fb7185'
                                        : entry.key === 'medium'
                                          ? '#fbbf24'
                                          : entry.key === 'low'
                                            ? '#34d399'
                                            : '#93c5fd';
                                    return <Cell key={entry.key} fill={color} />;
                                  })}
                                </Pie>
                                <Tooltip contentStyle={{ background: 'rgba(10,12,20,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: 'rgba(255,255,255,0.92)' }} />
                              </PieChart>
                            </ResponsiveContainer>
                          </div>
                        )}
                      </div>

                      <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-4">
                        <div className="text-xs font-semibold tracking-[0.18em] text-white/60">EXPORT</div>
                        <div className="mt-2 text-sm text-white/70">Genera un informe listo para cliente en 1 click.</div>
                        <div className="mt-4 grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={exportCsv}
                            className="rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition"
                          >
                            CSV
                          </button>
                          <button
                            type="button"
                            onClick={exportPdf}
                            className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-3 py-2 text-sm font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer"
                          >
                            PDF
                          </button>
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

              <div className="mt-4">
                <input
                  value={historyQuery}
                  onChange={(e) => setHistoryQuery(e.target.value)}
                  placeholder="Buscar por título o URL..."
                  className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                />
              </div>

              <div className="mt-4 grid gap-3">
                {historyFiltered.length === 0 ? (
                  <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                    No hay coincidencias en tu historial.
                  </div>
                ) : (
                  historyFiltered.map((h) => (
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

            <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div>
                  <h2 className="text-lg font-semibold">Tendencia</h2>
                  <p className="mt-1 text-sm text-white/70">Evolución del SEO Score por sesión.</p>
                </div>
                <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/70">
                  {historyChartData.length} puntos
                </div>
              </div>

              {historyChartData.length < 2 ? (
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                  Necesitas al menos 2 sesiones guardadas para ver la gráfica.
                </div>
              ) : (
                <div className="mt-4 h-56">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={historyChartData} margin={{ top: 10, right: 10, bottom: 0, left: -8 }}>
                      <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                      <XAxis dataKey="name" stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} />
                      <YAxis stroke="rgba(255,255,255,0.45)" tick={{ fontSize: 12 }} domain={[0, 100]} />
                      <Tooltip contentStyle={{ background: 'rgba(10,12,20,0.9)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, color: 'rgba(255,255,255,0.92)' }} />
                      <Line type="monotone" dataKey="score" stroke="#22d3ee" strokeWidth={2.5} dot={{ r: 3, fill: '#22d3ee' }} activeDot={{ r: 6 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              )}
            </div>
          </main>
        </div>
        </div>
      </div>
  );
};

export default Dashboard;
