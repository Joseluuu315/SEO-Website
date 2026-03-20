import React from 'react';

const Help = () => {
  const faqs = [
    {
      q: '¿Cómo funciona el análisis SEO?',
      a: 'Introduce una URL y nuestra herramienta analizará más de 30 factores SEO: títulos, metas, estructura, contenido, imágenes, enlaces y más. Recibirás un score del 0-100 y un informe detallado con issues y recomendaciones.',
    },
    {
      q: '¿Qué es el modo IA?',
      a: 'El modo IA utiliza OpenAI para generar un informe experto y personalizado basado en los datos del análisis. Si tienes una API key configurada, obtendrás recomendaciones avanzadas y planes de acción.',
    },
    {
      q: '¿Se guardan mis análisis?',
      a: 'Sí. Todos los análisis se guardan en tu historial personal. Puedes volver a consultarlos, compararlos o exportarlos en PDF/CSV.',
    },
    {
      q: '¿Cuál es la diferencia entre Trial y Paid?',
      a: 'Trial: análisis limitados, historial básico. Paid: análisis ilimitados, todos los informes, comparación avanzada, gestión de sitios y soporte prioritario.',
    },
    {
      q: '¿Puedo analizar varias URLs a la vez?',
      a: 'Sí. En la página Comparar puedes analizar hasta 3 URLs simultáneamente y ver una tabla comparativa de scores y métricas clave.',
    },
  ];

  const guides = [
    {
      title: 'Guía rápida: SEO On-Page',
      steps: [
        'Usa un único H1 por página',
        'Optimiza el title (50-60 caracteres)',
        'Escribe una meta description (150-160 caracteres)',
        'Usa H2/H3 para estructurar el contenido',
        'Añade alt a todas las imágenes',
        'Crea enlaces internos relevantes',
        'Asegura HTTPS y velocidad de carga',
      ],
    },
    {
      title: 'Cómo usar el Comparador',
      steps: [
        'Ve a Comparar y añade hasta 3 URLs',
        'Activa el modo IA para informes más ricos',
        'Revisa la tabla comparativa de scores',
        'Exporta los resultados en PDF',
        'Usa los insights para priorizar mejoras',
      ],
    },
    {
      title: 'Gestiona tus Sitios',
      steps: [
        'Crea proyectos por cliente/web',
        'Añade notas y objetivos',
        'Consulta el historial por sitio',
        'Edita o elimina sitios fácilmente',
        'Genera informes por proyecto',
      ],
    },
  ];

  return (
    <div className="min-h-screen relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -left-24 h-[28rem] w-[28rem] rounded-full bg-cyan-500/14 blur-3xl animate-floaty" />
        <div className="absolute top-20 -right-32 h-[32rem] w-[32rem] rounded-full bg-fuchsia-500/12 blur-3xl animate-floaty" style={{ animationDelay: '1.4s' }} />
        <div className="absolute -bottom-48 left-1/2 -translate-x-1/2 h-[38rem] w-[38rem] rounded-full bg-emerald-500/10 blur-3xl animate-floaty" style={{ animationDelay: '2.6s' }} />
      </div>

      <div className="relative mx-auto w-full max-w-7xl px-4 py-8">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <div className="text-xs font-semibold tracking-[0.2em] text-white/60">AYUDA</div>
          <div className="mt-1 text-2xl font-semibold">Centro de ayuda</div>
          <p className="mt-2 text-sm text-white/70">Guías rápidas, preguntas frecuentes y consejos para sacarle el máximo a SEO Analyzer.</p>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4">Guías rápidas</h2>
            <div className="space-y-4">
              {guides.map((guide, idx) => (
                <details key={idx} className="group">
                  <summary className="cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-semibold text-white/80 hover:bg-white/5 transition list-none">
                    {guide.title}
                  </summary>
                  <div className="mt-2 pl-4 text-sm text-white/70">
                    <ol className="list-decimal space-y-1">
                      {guide.steps.map((step, iidx) => (
                        <li key={iidx} className="flex items-start gap-2">
                          <span className="text-cyan-400">{iidx + 1}.</span>
                          <span>{step}</span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </details>
              ))}
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
            <h2 className="text-lg font-semibold mb-4">Preguntas frecuentes</h2>
            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <details key={idx} className="group">
                  <summary className="cursor-pointer rounded-2xl border border-white/10 bg-black/20 p-3 text-sm font-semibold text-white/80 hover:bg-white/5 transition list-none">
                    {faq.q}
                  </summary>
                  <div className="mt-2 p-3 rounded-2xl border border-white/10 bg-black/20 text-sm text-white/70">
                    {faq.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-5 shadow-glow backdrop-blur-xl">
          <h2 className="text-lg font-semibold mb-4">¿Necesitas más ayuda?</h2>
          <div className="grid gap-3 text-sm text-white/70">
            <div>
              <strong>Soporte prioritario (usuarios Paid):</strong> envía un email a{' '}
              <a href="mailto:soporte@seoanalyzer.com" className="text-cyan-400 underline hover:text-cyan-300 transition">
                soporte@seoanalyzer.com
              </a>
            </div>
            <div>
              <strong>Comunidad y recursos:</strong> visita nuestro{' '}
              <a href="https://github.com/joseluuu315/SEO-Website/discussions" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300 transition">
                foro de GitHub
              </a>{' '}
              para dudas y sugerencias.
            </div>
            <div>
              <strong>Reportar un error:</strong> usa el botón de feedback en la app o abre un issue en{' '}
              <a href="https://github.com/joseluuu315/SEO-Website/issues" target="_blank" rel="noopener noreferrer" className="text-cyan-400 underline hover:text-cyan-300 transition">
                GitHub Issues
              </a>
            </div>
          </div>
        </div>

        <div className="mt-6 text-center text-xs text-white/50">
          <p>Última actualización: Marzo 2026. Versión 2.0 – Agency Suite</p>
        </div>
      </div>
    </div>
  );
};

export default Help;
