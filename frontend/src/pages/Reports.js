import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const Reports = () => {
  const { token } = useAuth();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedTemplate, setSelectedTemplate] = useState('executive');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState('');

  const templates = [
    {
      id: 'executive',
      name: 'Ejecutivo',
      description: 'Resumen para directivos (1 página)',
      sections: ['resumen', 'kpi', 'recomendaciones'],
    },
    {
      id: 'technical',
      name: 'Técnico',
      description: 'Informe detallado para desarrolladores SEO',
      sections: ['resumen', 'auditoria', 'issues', 'recomendaciones'],
    },
    {
      id: 'content',
      name: 'Contenido',
      description: 'Análisis de contenido y palabras clave',
      sections: ['resumen', 'contenido', 'oportunidades'],
    },
    {
      id: 'competitive',
      name: 'Competitivo',
      description: 'Comparativa con competidores clave',
      sections: ['resumen', 'comparativa', 'oportunidades'],
    },
  ];

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch('http://localhost:5000/api/history', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Error');
        setHistory(Array.isArray(data) ? data : []);
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  const generateReport = async () => {
    setGenerating(true);
    setError('');
    try {
      const res = await fetch('http://localhost:5000/api/reports/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ template: selectedTemplate, dateRange }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Error');
      // Abrir PDF en nueva pestaña
      window.open(data.url, '_blank');
    } catch (e) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const exportData = (format) => {
    if (history.length === 0) return;
    const csv = [
      ['Fecha', 'URL', 'Título', 'Score SEO', 'Palabras', 'Imágenes', 'Links internos', 'Links externos'],
      ...history.map(h => [
        new Date(h.createdAt).toLocaleString(),
        h.url,
        h.title || '',
        h.seoScore || '',
        h.wordCount || '',
        h.imageCount || '',
        h.internalLinks || '',
        h.externalLinks || '',
      ]),
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `seo-analisis-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
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
              <div className="text-xs font-semibold tracking-[0.2em] text-white/60">REPORTES</div>
              <div className="mt-1 text-2xl font-semibold">Biblioteca de informes</div>
              <p className="mt-2 text-sm text-white/70">Genera informes profesionales con plantillas y exporta tus datos.</p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => exportData('csv')}
                disabled={history.length === 0}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Exportar CSV
              </button>
              <button
                type="button"
                onClick={() => exportData('json')}
                disabled={history.length === 0}
                className="rounded-2xl border border-white/10 bg-black/20 px-4 py-2 text-sm font-semibold text-white/80 hover:bg-white/5 transition disabled:cursor-not-allowed disabled:opacity-50"
              >
                Exportar JSON
              </button>
            </div>
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

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">Generar informe</div>
            <div className="mt-4 space-y-4">
              <div>
                <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Plantilla</label>
                <div className="mt-2 grid gap-2">
                  {templates.map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setSelectedTemplate(t.id)}
                      className={`rounded-2xl border p-3 text-left transition ${
                        selectedTemplate === t.id
                          ? 'border-cyan-400/30 bg-cyan-500/10'
                          : 'border-white/10 bg-black/20 hover:bg-white/5'
                      }`}
                    >
                      <div className="font-semibold text-sm">{t.name}</div>
                      <div className="mt-1 text-xs text-white/60">{t.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Desde</label>
                  <input
                    type="date"
                    value={dateRange.start}
                    onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold tracking-[0.18em] text-white/60">Hasta</label>
                  <input
                    type="date"
                    value={dateRange.end}
                    onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={generateReport}
                disabled={generating || history.length === 0}
                className="rounded-2xl bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-emerald-400 bg-[length:200%_200%] px-5 py-3 font-semibold text-ink-950 shadow-glow transition hover:opacity-95 hover:animate-shimmer disabled:cursor-not-allowed disabled:opacity-60"
              >
                {generating ? (
                  <span className="inline-flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-ink-950/30 border-t-ink-950" />
                    Generando...
                  </span>
                ) : (
                  'Generar informe PDF'
                )}
              </button>
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <div className="text-lg font-semibold">Historial de análisis</div>
            {loading ? (
              <div className="mt-4 flex justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/30 border-t-cyan-400" />
              </div>
            ) : history.length === 0 ? (
              <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm text-white/70">
                No hay análisis guardados. Realiza algunas auditorías para ver datos aquí.
              </div>
            ) : (
              <div className="mt-4 space-y-2 max-h-96 overflow-y-auto">
                {history.map(h => (
                  <div key={h._id} className="rounded-2xl border border-white/10 bg-black/20 p-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold">{h.title}</div>
                        <div className="mt-1 truncate text-xs text-white/60">{h.url}</div>
                      </div>
                      <div className="shrink-0 rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-center">
                        <div className="text-[10px] text-white/60">SCORE</div>
                        <div className="text-lg font-semibold">{h.seoScore}</div>
                      </div>
                    </div>
                    <div className="mt-2 text-xs text-white/50">{new Date(h.createdAt).toLocaleString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
