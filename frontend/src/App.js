import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function App() {
  const [url, setUrl] = useState('');
  const [seoData, setSeoData] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const res = await fetch('/api/scrape', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    setSeoData(data);
  };

  return (
    <div className="container py-5">
      <div className="text-center mb-4">
        <h1 className="text-primary mb-3">🔍 Analizador SEO</h1>
        <p className="text-muted">Introduce una URL para analizar métricas SEO básicas</p>
      </div>

      <div className="row justify-content-center">
        <div className="col-md-8">
          <form onSubmit={handleSubmit} className="card shadow p-4 mb-4">
            <div className="mb-3">
              <label className="form-label fw-bold">URL del sitio web</label>
              <input
                type="url"
                className="form-control"
                placeholder="https://ejemplo.com"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">
              Analizar
            </button>
          </form>
        </div>
      </div>

      {seoData && (
        <div className="row justify-content-center">
          <div className="col-md-8">
            <div className="card shadow p-4">
              <h3 className="text-success mb-3">Resultados para: <span className="text-decoration-underline">{seoData.url}</span></h3>
              <p><strong>📌 Título:</strong> {seoData.title}</p>
              <p><strong>🏷️ Palabras clave:</strong> {seoData.keywords.join(', ')}</p>
              <p><strong>🔗 Backlinks:</strong> {seoData.backlinks}</p>

              <h5 className="mt-4">📈 Tráfico estimado:</h5>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={seoData.traffic.map((t, i) => ({ mes: `M${i + 1}`, visitas: t }))}>
                  <Line type="monotone" dataKey="visitas" stroke="#0d6efd" strokeWidth={3} />
                  <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
